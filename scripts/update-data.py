"""Reproduce the pinned allowlist snapshot without executing upstream source.

Run from the repository root with Python 3. To update, change data/provenance.json
to reviewed commit hashes and the retrieval date, then run and inspect the diff.
"""
import json
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'data/provenance.json').read_text())

def fetch(url):
    with urllib.request.urlopen(url, timeout=45) as response:
        return response.read().decode()

allowlist = fetch(f"https://raw.githubusercontent.com/Uniswap/routing-api/{manifest['allowlistCommit']}/{manifest['allowlistPath']}")
registry = json.loads(fetch(f"https://raw.githubusercontent.com/Uniswap/hooklist/{manifest['hooklistCommit']}/hooklist.json"))
index = {(item['hook']['chain'], item['hook']['address'].lower()): item['hook'] for item in registry}
# Slugs and IDs follow Uniswap/hooklist chains.json; Sepolia is an upstream testnet entry.
chains = {
    'MAINNET': ('ethereum', 'Ethereum', 1, 'https://etherscan.io/address/'),
    'SEPOLIA': ('sepolia', 'Sepolia', 11155111, 'https://sepolia.etherscan.io/address/'),
    'OPTIMISM': ('optimism', 'Optimism', 10, 'https://optimistic.etherscan.io/address/'),
    'ARBITRUM_ONE': ('arbitrum', 'Arbitrum', 42161, 'https://arbiscan.io/address/'),
    'POLYGON': ('polygon', 'Polygon', 137, 'https://polygonscan.com/address/'),
    'BNB': ('bnb', 'BNB Chain', 56, 'https://bscscan.com/address/'),
    'AVALANCHE': ('avalanche', 'Avalanche', 43114, 'https://snowtrace.io/address/'),
    'BASE': ('base', 'Base', 8453, 'https://basescan.org/address/'),
    'UNICHAIN': ('unichain', 'Unichain', 130, 'https://uniscan.xyz/address/'),
    'MONAD': ('monad', 'Monad', 143, 'https://monadscan.com/address/'),
    'XLAYER': ('xlayer', 'X Layer', 196, 'https://www.oklink.com/xlayer/address/'),
    'TEMPO': ('tempo', 'Tempo', 4217, 'https://explore.tempo.xyz/address/'),
}
constants = dict(re.findall(r"export const (\w+) = '(0x[0-9a-fA-F]{40})'", allowlist))
rows, matched, seen = [], [], set()
line_numbers = {m.group(1): allowlist[:m.start()].count('\n') + 1 for m in re.finditer(r'export const (\w+) = ', allowlist)}
body = allowlist.split('export const HOOKS_ADDRESSES_ALLOWLIST:', 1)[1]
for key, values in re.findall(r'\[ChainId\.(\w+)\]:\s*\[([^\]]*)\]', body):
    for constant in values.split(','):
        constant = constant.strip()
        if not constant or constant == 'ADDRESS_ZERO':
            continue
        if constant not in constants or key not in chains:
            raise ValueError(f'Unrecognized upstream entry: {key}/{constant}; review parser and chain mapping.')
        slug, label, chain_id, explorer = chains[key]
        address = constants[constant].lower()
        if (slug, address) in seen:
            continue
        seen.add((slug, address))
        metadata = index.get((slug, address))
        if metadata:
            matched.append(metadata)
        fallback_name = re.sub(r'_ON_.*$', '', constant)
        fallback_name = fallback_name.replace('_HOOKS_ADDRESS', '').replace('_HOOK_ADDRESS', '').replace('_HOOKS', ' Hook').replace('_', ' ').title()
        if constant == 'extraHooksAddressesOnSepolia':
            fallback_name = 'Extra Sepolia hook'
        name = metadata['name'] if metadata else fallback_name
        name = re.sub(r' \((Ethereum|Base|Arbitrum|Unichain|Optimism|BNB)\)$', '', name)
        description = metadata['description'] if metadata and metadata.get('description') else 'Listed in Uniswap’s routing allowlist. A description is not available in the Hooklist snapshot.'
        rows.append({
            'id': f'{slug}:{address}', 'name': name, 'chain': slug, 'chainName': label,
            'chainId': chain_id, 'testnet': slug == 'sepolia', 'address': address,
            'description': description, 'verifiedSource': metadata.get('verifiedSource') if metadata else None,
            'explorerUrl': explorer + address + '#code',
            'metadataUrl': f"https://github.com/Uniswap/hooklist/blob/{manifest['hooklistCommit']}/hooks/{slug}/{address}.json" if metadata else None,
            'allowlistUrl': f"https://github.com/Uniswap/routing-api/blob/{manifest['allowlistCommit']}/{manifest['allowlistPath']}#L{line_numbers[constant]}",
            'upstreamName': constant,
        })
if not rows:
    raise ValueError('No entries parsed. Upstream format may have changed.')
rows.sort(key=lambda row: (row['name'].lower(), row['chainName'], row['address']))
(ROOT / 'data/upstream/hooksAddressesAllowlist.ts.txt').write_text(allowlist)
(ROOT / 'data/upstream/matched-hooklist.json').write_text(json.dumps(matched, indent=2) + '\n')
(ROOT / 'src/data/hooks.json').write_text(json.dumps(rows, indent=2, ensure_ascii=False) + '\n')
print(f"Wrote {len(rows)} unique deployments; {len(matched)} metadata matches; {len({row['chain'] for row in rows})} chains.")
