#!/usr/bin/env python3
import json
import re
from pathlib import Path
import requests

REPO = Path(__file__).resolve().parent
SCRIPT_PATH = REPO / 'script.js'
INDEX_PATH = REPO / 'index.html'
DATA_PATH = REPO / 'game-data.js'

API_URL = 'https://api.99laju.net/graphql'
SITE_URL = 'https://99laju.net'
GAME_IMAGE_BASE = 'https://storage.googleapis.com/images.imbaweb.com/game/{provider}/1x1/img_jpg/{code}_1x1_w240.jpg'
PROVIDER_LOGO_BASE = 'https://storage.googleapis.com/99laju-images.imbaweb.com/game-provider/2x1/SL/{code}.png'
INIT_MARKER = "// ==========================================\n// INIT\n// =========================================="

SESSION_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
}
GRAPHQL_HEADERS = {
    **SESSION_HEADERS,
    'Origin': SITE_URL,
    'Referer': SITE_URL + '/',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

GET_PROVIDERS_QUERY = '''query getGameProviders($filter: JSON!){
  getGameProviders(filter: $filter){
    code
    name
    live_link
    status
    is_maintenance
    hot
    new
    _game_provider_game_types { type }
  }
}'''

GET_GAMES_QUERY = '''query getGames($filter: JSON!){
  getGames(filter: $filter)
}'''

PROVIDERS_VARIABLES = {
    'filter': {
        'where': {
            '$_game_provider_game_types.status$': 'ACTIVE',
            'status': 'ACTIVE',
        },
        'order': [['index', 'ASC'], ['name', 'ASC']],
    }
}

GAMES_VARIABLES = {
    'filter': {
        'where': {
            'status': 'ACTIVE',
            '$_game_provider.status$': 'ACTIVE',
            'type': 'SL',
        },
        'order': [['game_provider', 'ASC'], ['name', 'ASC']],
    }
}

TOP_TEMPLATE = """/* ============================================
   SQUEEN668 RTP SCANNER — JavaScript
   Slot game data generated from 99laju.net
   Run: python3 generate_99laju_slot_data.py
   ============================================ */

// ==========================================
// DATA SOURCE
// ==========================================
const GAME_DATABASE = window.SQUEEN668_GAME_DATABASE || {};
const PROVIDER_ORDER = window.SQUEEN668_PROVIDER_ORDER || Object.keys(GAME_DATABASE);

// ==========================================
// TIME-SEEDED PRNG (deterministic RTP within time window)
// ==========================================
function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

function getTimeSeed(provider, intervalMinutes) {
    const slot = Math.floor(Date.now() / (intervalMinutes * 60 * 1000));
    let hash = 0;
    const str = provider + '-' + slot + '-30-97-85-65-10-30';
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return hash;
}

const SCANNER_CONFIG = {
    minRtp: 30, maxRtp: 97,
    hotThreshold: 85, warmThreshold: 65,
    hotPercent: 10, warmPercent: 30,
    seedInterval: 60
};

// ==========================================
// STATE
// ==========================================
let currentProvider = (window.SQUEEN668_DEFAULT_PROVIDER && GAME_DATABASE[window.SQUEEN668_DEFAULT_PROVIDER]
    ? window.SQUEEN668_DEFAULT_PROVIDER
    : PROVIDER_ORDER[0]) || '';
let currentFilter = 'all';
let currentGames = [];
let isScanning = false;

"""


def fetch_json(session, query, variables, operation_name):
    response = session.post(
        API_URL,
        json={'query': query, 'variables': variables, 'operationName': operation_name},
        headers=GRAPHQL_HEADERS,
        timeout=90,
    )
    response.raise_for_status()
    payload = response.json()
    if payload.get('errors'):
        raise RuntimeError(payload['errors'])
    return payload['data'][operation_name]


def slugify(value: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '_', value.lower()).strip('_')
    return slug or 'provider'


def build_database():
    session = requests.Session()
    session.get(SITE_URL, headers=SESSION_HEADERS, timeout=30)

    providers = fetch_json(session, GET_PROVIDERS_QUERY, PROVIDERS_VARIABLES, 'getGameProviders')
    games = fetch_json(session, GET_GAMES_QUERY, GAMES_VARIABLES, 'getGames')

    slot_providers = []
    for provider in providers:
        types = {item.get('type') for item in provider.get('_game_provider_game_types') or []}
        if 'SL' in types:
            slot_providers.append(provider)

    provider_lookup = {provider['code']: provider for provider in slot_providers}
    database = {}

    for provider in slot_providers:
        key = slugify(provider['code'])
        database[key] = {
            'name': provider['name'],
            'code': provider['code'],
            'logo': PROVIDER_LOGO_BASE.format(code=provider['code']),
            'games': [],
        }

    for game in games:
        provider_code = game.get('game_provider')
        if provider_code not in provider_lookup:
            continue
        key = slugify(provider_code)
        database[key]['games'].append({
            'name': game['name'],
            'img': GAME_IMAGE_BASE.format(provider=provider_code, code=game['code']),
        })

    order = [slugify(provider['code']) for provider in slot_providers if database[slugify(provider['code'])]['games']]
    database = {key: database[key] for key in order}

    return database, order


def write_data_file(database, order):
    lines = [
        '/* Auto-generated game database. Do not edit by hand. */',
        'window.SQUEEN668_GAME_DATABASE = ' + json.dumps(database, ensure_ascii=False, indent=2) + ';',
        'window.SQUEEN668_PROVIDER_ORDER = ' + json.dumps(order, ensure_ascii=False) + ';',
        'window.SQUEEN668_DEFAULT_PROVIDER = ' + json.dumps(order[0] if order else '') + ';',
        '',
    ]
    DATA_PATH.write_text('\n'.join(lines), encoding='utf-8')


def rewrite_script_js():
    original = SCRIPT_PATH.read_text(encoding='utf-8')
    if INIT_MARKER not in original:
        raise RuntimeError('INIT marker not found in script.js')
    suffix = INIT_MARKER + original.split(INIT_MARKER, 1)[1]
    suffix = suffix.replace(
        "onerror=\"this.style.display='none'\"",
        "onerror=\"this.onerror=null; this.src=window.getFallbackImage(\\'" + '" + p.name + "' + "\\')\"",
    )
    SCRIPT_PATH.write_text(TOP_TEMPLATE + suffix, encoding='utf-8')


def ensure_index_loads_data():
    html = INDEX_PATH.read_text(encoding='utf-8')
    pair = '    <script src="game-data.js"></script>\n    <script src="script.js"></script>'
    if pair not in html:
        html = html.replace('    <script src="script.js"></script>', pair)
    INDEX_PATH.write_text(html, encoding='utf-8')


def main():
    database, order = build_database()
    write_data_file(database, order)
    rewrite_script_js()
    ensure_index_loads_data()
    total_games = sum(len(item['games']) for item in database.values())
    print(f'Generated {len(order)} slot providers and {total_games} games from 99laju.net')


if __name__ == '__main__':
    main()
