#!/usr/bin/env python3
"""Merge verified official slot metadata/artwork into only the Pragmatic provider."""
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import hashlib
import json
import re
import subprocess
import unicodedata


def name_key(value):
    value = ''.join(c for c in value if c not in '™®©')
    return ''.join(c for c in unicodedata.normalize('NFKC', value).casefold() if c.isalnum())


def game_code(game):
    if game.get('gameCode'):
        return game['gameCode']
    match = re.search(r'/([^/]+)_1x1_w240\.[a-z]+(?:\?|$)', game.get('img', ''), re.I)
    return match.group(1) if match else None


def assignment(text, variable):
    start = text.index('=', text.index(variable)) + 1
    while text[start].isspace():
        start += 1
    value, end = json.JSONDecoder().raw_decode(text, start)
    return value, start, end


def replace_provider(text, variable, payload, pretty=False):
    original, start, _ = assignment(text, variable)
    decoder = json.JSONDecoder()
    pos = start + 1
    while True:
        while text[pos].isspace() or text[pos] == ',':
            pos += 1
        if text[pos] == '}':
            raise ValueError('Pragmatic provider not found')
        key, pos = decoder.raw_decode(text, pos)
        while text[pos].isspace():
            pos += 1
        assert text[pos] == ':'
        pos += 1
        while text[pos].isspace():
            pos += 1
        _, end = decoder.raw_decode(text, pos)
        if key == 'pp':
            replacement = json.dumps(payload, ensure_ascii=False, indent=2) if pretty else json.dumps(payload, ensure_ascii=False, separators=(',', ':'))
            if pretty:
                replacement = replacement.replace('\n', '\n  ')
            changed = text[:pos] + replacement + text[end:]
            updated, _, _ = assignment(changed, variable)
            assert {k: v for k, v in original.items() if k != 'pp'} == {k: v for k, v in updated.items() if k != 'pp'}
            return changed
        pos = end


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--catalogue', type=Path, required=True)
    parser.add_argument('--artwork', type=Path, required=True)
    parser.add_argument('--identity', type=Path, required=True)
    parser.add_argument('--aliases', type=Path, required=True)
    parser.add_argument('--version', required=True)
    parser.add_argument('--baseline-commit', help='Rebuild from a verified pre-import PP catalogue when correcting an import')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    source = json.loads(args.catalogue.read_text())
    artwork = json.loads(args.artwork.read_text())
    aliases = json.loads(args.aliases.read_text())
    assert source['pagination_complete'] and not artwork['errors'] and not aliases['errors']
    assert source['source_url'] == 'https://www.pragmaticplay.com/en/games/'
    assert source['released_count'] == len(source['games']) == artwork['count']
    excluded = source.get('excluded_non_slots', [])
    excluded_ids = {game['source_id'] for game in excluded}
    assert all(game['type'] == 'scratchcard' and game['official_description_confirmed'] for game in excluded)
    assert not excluded_ids.intersection(game['source_id'] for game in source['games']), 'Verified non-slots must be removed before import'
    assert all(game.get('type') == 'slots' for game in source['games'])
    symbols = {}
    for line in args.identity.read_text().splitlines():
        item = json.loads(line)
        if not item.get('error'):
            symbols[item['source_id']] = item['game_code']
    images = {g['source_id']: g for g in artwork['artwork']}
    if args.baseline_commit:
        assert re.fullmatch(r'[0-9a-f]{40}', args.baseline_commit), 'Baseline must be an exact verified commit SHA'
        old_payload = json.loads(subprocess.check_output(['git', 'show', args.baseline_commit + ':provider-data/pp.json'], cwd=root, text=True))
    else:
        old_payload = json.loads((root / 'provider-data/pp.json').read_text())
    existing = old_payload['games']
    names = {name_key(g['name']): i for i, g in enumerate(existing)}
    codes = {game_code(g): i for i, g in enumerate(existing) if game_code(g)}
    assert len(names) == len(existing), 'Existing normalized title collision'
    assert len(codes) == len(existing), 'Existing game identities must be unique and known'
    merged, official, used, source_codes = [], [], set(), set()
    added = 0
    for game in source['games']:
        canonical_hit = names.get(name_key(game['name']))
        verified_code = symbols.get(game['source_id'])
        identity_hit = codes.get(verified_code) if verified_code else None
        assert canonical_hit is None or identity_hit is None or canonical_hit == identity_hit, 'Conflicting source identity'
        hit = identity_hit if identity_hit is not None else canonical_hit
        code = verified_code or (game_code(existing[hit]) if hit is not None else None)
        assert code and code not in source_codes, 'Missing or duplicate official game identity'
        source_codes.add(code)
        if hit is None:
            added += 1
        else:
            assert hit not in used, 'Two official cards map to one existing game'
            used.add(hit)
        image = images[game['source_id']]
        assert image['source_image'] == game['img']
        assert urlsplit(game['img']).hostname == 'www.pragmaticplay.com'
        assert hashlib.sha256((root / image['path']).read_bytes()).hexdigest() == image['sha256']
        merged.append({'name': game['name'], 'img': image['path'], 'type': 'slots', 'gameCode': code})
        official.append({'name': game['name'], 'source_id': game['source_id'], 'source_url': game['source_url'],
                         'source_image': game['img'], 'local_image': image['path'], 'game_code': code,
                         'identity_basis': 'official_game_symbol' if verified_code else 'canonical_title',
                         'sha256': image['sha256'], 'width': image['width'], 'height': image['height']})
    legacy = []
    for index, game in enumerate(existing):
        if index not in used:
            item = {**game, 'type': 'slots', 'gameCode': game_code(game)}
            assert item['gameCode'] not in source_codes, 'Unresolved legacy alias would duplicate an official game'
            merged.append(item)
            legacy.append(item)
    assert len({name_key(g['name']) for g in merged}) == len(merged)
    assert len({g['gameCode'] for g in merged}) == len(merged)
    assert len(merged) == len(existing) + added
    payload = {**old_payload, 'games': merged}
    full_path = root / 'game-data.js'
    full = replace_provider(full_path.read_text(), 'window.SQUEEN668_GAME_DATABASE', payload, pretty=True)
    manifest_path = root / 'provider-manifest.js'
    manifest, _, _ = assignment(manifest_path.read_text(), 'window.SQUEEN668_PROVIDER_MANIFEST')
    meta = {**manifest['pp'], 'gameCount': len(merged), 'dataPath': f'provider-data/pp.json?v={args.version}'}
    manifest_text = replace_provider(manifest_path.read_text(), 'window.SQUEEN668_PROVIDER_MANIFEST', meta)
    counts = {'existing_total': len(existing), 'official_released': len(official), 'matched_existing': len(used),
              'verified_name_aliases': len(aliases['verified_aliases']), 'new_games': added,
              'preserved_legacy': len(legacy), 'merged_total': len(merged), 'excluded_upcoming': len(source['upcoming']),
              'excluded_non_slots': len(excluded)}
    provenance = {'source_url': source['source_url'], 'observed_at_utc': source['observed_at_utc'],
                  'pagination_complete': True, 'terminal_page': source['terminal_page'], 'version': args.version,
                  'baseline_commit': args.baseline_commit or subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
                  'counts': counts, 'games': official, 'preserved_legacy': legacy,
                  'upcoming': source['upcoming'], 'aliases': aliases['verified_aliases'], 'excluded_non_slots': excluded}
    (root / 'data-sources').mkdir(exist_ok=True)
    (root / 'data-sources/pragmaticplay-official.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + '\n')
    (root / 'provider-data/pp.json').write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n')
    full_path.write_text(full)
    manifest_path.write_text(manifest_text)
    print(json.dumps(counts, indent=2))

if __name__ == '__main__':
    main()
