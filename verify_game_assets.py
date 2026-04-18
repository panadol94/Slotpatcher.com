#!/usr/bin/env python3
import concurrent.futures
import json
import re
import sys
from pathlib import Path

import requests

REPO = Path(__file__).resolve().parent
DATA_PATH = REPO / 'game-data.js'
PATTERN = re.compile(r'window\.SQUEEN668_GAME_DATABASE = (.*?);\nwindow\.SQUEEN668_PROVIDER_ORDER =', re.S)


def load_items():
    text = DATA_PATH.read_text(encoding='utf-8')
    match = PATTERN.search(text)
    if not match:
        raise RuntimeError('Tak jumpa SQUEEN668_GAME_DATABASE dalam game-data.js')
    data = json.loads(match.group(1))
    items = []
    for provider_key, provider in data.items():
        items.append({
            'kind': 'provider',
            'provider_key': provider_key,
            'name': provider['name'],
            'url': provider['logo'],
        })
        for game in provider['games']:
            items.append({
                'kind': 'game',
                'provider_key': provider_key,
                'name': game['name'],
                'url': game['img'],
            })
    return items


def check_url(item, session):
    try:
        response = session.head(item['url'], timeout=15, allow_redirects=True)
        if response.status_code >= 400:
            response = session.get(item['url'], timeout=15, allow_redirects=True, stream=True)
        if response.status_code >= 400:
            return {**item, 'status': response.status_code}
        return None
    except Exception as exc:
        return {**item, 'status': str(exc)}


def main():
    items = load_items()
    bad = []
    session = requests.Session()
    session.headers.update({'User-Agent': 'Mozilla/5.0'})

    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        futures = [executor.submit(check_url, item, session) for item in items]
        for idx, future in enumerate(concurrent.futures.as_completed(futures), 1):
            result = future.result()
            if result:
                bad.append(result)
            if idx % 200 == 0 or idx == len(items):
                print(f'checked {idx}/{len(items)} bad={len(bad)}', flush=True)

    if bad:
        print('\nBroken assets detected:\n')
        for row in bad:
            print(json.dumps(row, ensure_ascii=False))
        sys.exit(1)

    print(f'\nSemua asset ok, total checked: {len(items)}')


if __name__ == '__main__':
    main()
