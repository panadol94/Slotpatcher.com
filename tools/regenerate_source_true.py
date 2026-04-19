import io
import json
import os
import plistlib
import re
import shutil
import zipfile
from pathlib import Path
from urllib import request

import xxtea
from PIL import Image

ROOT = Path('/root/Slotpatcher.com')
TOOLS = ROOT / 'tools'
TOOLS.mkdir(parents=True, exist_ok=True)
CACHE = ROOT / '.source_cache'
CACHE.mkdir(parents=True, exist_ok=True)
GAME_DATA_PATH = ROOT / 'game-data.js'

MEGA_APK_URL = 'https://appsetup.yidaiyiluclub.com/apk/Mega888_V1.2.apk'
KISS_APK_URL = 'https://patch.j9dkiss.com/apk/918Ks.apk'
PUSSY_SETTINGS_URL = 'https://pussy888.mobi/Lobby/src/settings.6f59b.json'
PUSSY_BASE = 'https://pussy888.mobi/Lobby'
HEADERS = {'User-Agent': 'Mozilla/5.0'}

MEGA_KEY = b'f5y6gf2s'
KISS_KEY = b'sr4gf2'.ljust(16, b'\0')

MEGA_EXCLUDE = {
    'Download.png', 'JackpotBg.png',
    'LiveIcon0.png', 'LiveIcon1.png',
    'BGLiveIcon0.png', 'BGLiveIcon1.png',
    'EvolutionLive0.png', 'EvolutionLive1.png',
    'LiveNewIcon0.png', 'LiveNewIcon1.png',
}
MEGA_EXCLUDE_PREFIXES = ('Hot', 'New')
KISS_EXCLUDE = {'ComingSoon.png', 'ComingSoonIcon.png', 'IconNew.png'}


def http_get(url):
    req = request.Request(url, headers=HEADERS)
    with request.urlopen(req, timeout=60) as r:
        return r.read()


def ensure_download(url, path):
    if not path.exists():
        path.write_bytes(http_get(url))
    return path


def ensure_unzip(apk_path, extract_dir):
    if not extract_dir.exists():
        extract_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(apk_path, 'r') as zf:
            zf.extractall(extract_dir)
    return extract_dir


def trim_plist_bytes(data: bytes) -> bytes:
    end = data.rfind(b'</plist>')
    if end != -1:
        data = data[:end + len(b'</plist>')]
    return data


def parse_rect_string(s):
    nums = [int(x) for x in re.findall(r'-?\d+', str(s))]
    if len(nums) == 4:
        return nums[0], nums[1], nums[2], nums[3]
    if len(nums) == 2:
        return 0, 0, nums[0], nums[1]
    raise ValueError(f'Could not parse rect from {s!r}')


def decrypt_mega_bgplist(path):
    data = Path(path).read_bytes()
    if data.startswith(b'bgplist'):
        data = data[len(b'bgplist'):]
    dec = xxtea.decrypt(data, MEGA_KEY)
    return dec


def decrypt_kiss_resource(path):
    data = Path(path).read_bytes()
    if data.startswith(b'resource'):
        data = data[len(b'resource'):]
    dec = xxtea.decrypt(data, KISS_KEY)
    return dec


def rebuild_sprite(frame_meta, atlas_img):
    frame_x, frame_y, frame_w, frame_h = parse_rect_string(frame_meta.get('frame'))
    rotated = bool(frame_meta.get('rotated'))
    src_x, src_y, src_w, src_h = parse_rect_string(frame_meta.get('sourceColorRect'))
    out_w, out_h = parse_rect_string(frame_meta.get('sourceSize'))[2:4]

    cropped = atlas_img.crop((frame_x, frame_y, frame_x + frame_w, frame_y + frame_h))
    if rotated:
        cropped = cropped.transpose(Image.Transpose.ROTATE_90)
    canvas = Image.new('RGBA', (out_w, out_h), (0, 0, 0, 0))
    canvas.paste(cropped, (src_x, src_y))
    return canvas


def parse_game_data_js():
    text = GAME_DATA_PATH.read_text(encoding='utf-8')
    m = re.search(
        r'window\.SQUEEN668_GAME_DATABASE\s*=\s*(\{.*\})\s*;\s*\nwindow\.SQUEEN668_PROVIDER_ORDER\s*=\s*(\[.*?\])\s*;\s*\nwindow\.SQUEEN668_DEFAULT_PROVIDER\s*=\s*(".*?")\s*;',
        text,
        flags=re.S,
    )
    if not m:
        raise RuntimeError('Unable to parse game-data.js')
    prefix = text[:m.start()]
    db = json.loads(m.group(1))
    order = json.loads(m.group(2))
    default_provider = json.loads(m.group(3))
    return prefix, db, order, default_provider


def write_game_data_js(prefix, db, order, default_provider):
    text = (
        prefix
        + 'window.SQUEEN668_GAME_DATABASE = ' + json.dumps(db, indent=2, ensure_ascii=False) + ';\n'
        + 'window.SQUEEN668_PROVIDER_ORDER = ' + json.dumps(order, ensure_ascii=False) + ';\n'
        + 'window.SQUEEN668_DEFAULT_PROVIDER = ' + json.dumps(default_provider, ensure_ascii=False) + ';\n'
    )
    GAME_DATA_PATH.write_text(text, encoding='utf-8')


def regenerate_mega888():
    out_dir = ROOT / 'assets' / 'mega888'
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    apk = ensure_download(MEGA_APK_URL, CACHE / 'Mega888_V1.2.apk')
    extract_dir = ensure_unzip(apk, CACHE / 'mega888_extract')

    games = []
    for idx in range(8):
        plist_path = extract_dir / f'assets/res/Data/LobbyBigGaming/En/GameIcon{idx}.plist'
        png_path = extract_dir / f'assets/res/Data/LobbyBigGaming/En/GameIcon{idx}.png'
        plist_data = trim_plist_bytes(decrypt_mega_bgplist(plist_path))
        atlas_data = decrypt_mega_bgplist(png_path)
        plist_obj = plistlib.loads(plist_data)
        atlas_img = Image.open(io.BytesIO(atlas_data)).convert('RGBA')
        frames = plist_obj.get('frames', {})
        for raw_name in sorted(frames.keys()):
            if raw_name in MEGA_EXCLUDE:
                continue
            if raw_name.startswith(MEGA_EXCLUDE_PREFIXES):
                continue
            img = rebuild_sprite(frames[raw_name], atlas_img)
            img.save(out_dir / raw_name)
            games.append({'name': raw_name, 'img': f'assets/mega888/{raw_name}'})
    return games


def regenerate_918kiss():
    out_dir = ROOT / 'assets' / 'kiss918'
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    apk = ensure_download(KISS_APK_URL, CACHE / '918Ks.apk')
    extract_dir = ensure_unzip(apk, CACHE / '918kiss_extract')

    games = []
    for idx in range(4):
        plist_path = extract_dir / f'assets/res/Data/Lobby/GameIcon{idx}.plist'
        png_path = extract_dir / f'assets/res/Data/Lobby/GameIcon{idx}.png'
        plist_data = trim_plist_bytes(decrypt_kiss_resource(plist_path))
        atlas_data = decrypt_kiss_resource(png_path)
        plist_obj = plistlib.loads(plist_data)
        atlas_img = Image.open(io.BytesIO(atlas_data)).convert('RGBA')
        frames = plist_obj.get('frames', {})
        for raw_name in sorted(frames.keys()):
            if raw_name in KISS_EXCLUDE:
                continue
            img = rebuild_sprite(frames[raw_name], atlas_img)
            img.save(out_dir / raw_name)
            games.append({'name': raw_name, 'img': f'assets/kiss918/{raw_name}'})
    return games


BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
HEX = '0123456789abcdef'
VALS = {c: i for i, c in enumerate(BASE64)}


def decode_cocos_uuid(s):
    if len(s) != 22:
        return s
    u = s[0] + s[1]
    for i in range(2, 22, 2):
        lhs = VALS[s[i]]
        rhs = VALS[s[i + 1]]
        u += HEX[lhs >> 2] + HEX[((lhs & 3) << 2) | (rhs >> 4)] + HEX[rhs & 0xF]
    return f'{u[:8]}-{u[8:12]}-{u[12:16]}-{u[16:20]}-{u[20:]}'


def regenerate_pussy888():
    out_dir = ROOT / 'assets' / 'pussy888'
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    settings = json.loads(http_get(PUSSY_SETTINGS_URL).decode('utf-8', errors='replace'))
    resources_ver = settings['bundleVers']['resources']
    cfg = json.loads(http_get(f'{PUSSY_BASE}/assets/resources/config.{resources_ver}.json').decode('utf-8', errors='replace'))

    types = cfg['types']
    native_versions = cfg['versions']['native']
    ver_map = {str(native_versions[i]): native_versions[i + 1] for i in range(0, len(native_versions), 2)}
    uuids = cfg['uuids']
    games = []

    for key, meta in sorted(cfg['paths'].items(), key=lambda kv: int(kv[0])):
        if not isinstance(meta, list) or len(meta) < 2:
            continue
        path_name = meta[0]
        type_index = meta[1]
        if '/' not in path_name or not path_name.startswith('icon/'):
            continue
        remainder = path_name[len('icon/'):]
        if '/' in remainder:
            continue
        if remainder == 'Thumbs':
            continue
        if type_index >= len(types) or types[type_index] != 'cc.ImageAsset':
            continue
        if key not in ver_map:
            continue
        idx = int(key)
        raw_name = remainder
        uuid_full = decode_cocos_uuid(uuids[idx])
        native_ver = ver_map[key]
        url = f'{PUSSY_BASE}/assets/resources/native/{uuid_full[:2]}/{uuid_full}.{native_ver}.png'
        img_bytes = http_get(url)
        out_path = out_dir / f'{raw_name}.png'
        out_path.write_bytes(img_bytes)
        games.append({'name': raw_name, 'img': f'assets/pussy888/{raw_name}.png'})
    return games


def main():
    prefix, db, order, default_provider = parse_game_data_js()
    mega_games = regenerate_mega888()
    kiss_games = regenerate_918kiss()
    pussy_games = regenerate_pussy888()

    db['m8'] = {
        'name': db['m8']['name'],
        'code': db['m8']['code'],
        'logo': db['m8']['logo'],
        'games': mega_games,
    }
    db['k918'] = {
        'name': db['k918']['name'],
        'code': db['k918']['code'],
        'logo': 'assets/kissh5.png',
        'games': kiss_games,
    }
    db['pussy888'] = {
        'name': 'Pussy888',
        'code': 'PUSSY888',
        'logo': 'assets/pussy888-logo.png',
        'games': pussy_games,
    }

    if 'pussy888' not in order:
        if 'k918' in order:
            order.insert(order.index('k918') + 1, 'pussy888')
        else:
            order.insert(0, 'pussy888')

    write_game_data_js(prefix, db, order, default_provider)

    summary = {
        'mega888_games': len(mega_games),
        '918kiss_games': len(kiss_games),
        'pussy888_games': len(pussy_games),
        'provider_order_first5': order[:5],
        'mega888_sample': mega_games[:5],
        '918kiss_sample': kiss_games[:5],
        'pussy888_sample': pussy_games[:5],
    }
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
