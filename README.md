# Hookbook

A static dashboard for Uniswap v4’s **explicit routing allowlist**, built with React, TypeScript, and Vite. The four directory columns are **Name, Chain, Description, and Verified source**.

The included snapshot contains **117 unique deployments across 12 networks**, retrieved October 9, 2026. All entries are searchable and reachable through pagination. Search, chain/source filters, alphabetical sorting, bookmarks, contract details, address copying, and CSV export work in the browser. The desktop table becomes labeled cards on smaller screens.

## Install and run

Use Node.js 22.12+ (Node 24 was used for validation) and npm.

```sh
npm ci
npm run dev
```

For the finished production site:

```sh
npm run build
npm run preview
```

Open the URL printed by Vite. `dist/` is already included; it does not need a build to publish. Serve it over HTTP(S), rather than opening `index.html` as a local file. Clipboard access requires HTTPS or localhost; otherwise the full address remains selectable and a fallback message explains what to do.

## Publish

Upload **the entire contents of `dist/`**, including `assets/`, `licenses/`, and `favicon.svg`, to your static host. Set the publishing directory to `dist`. The publisher can serve the included export directly without installing dependencies or rebuilding.

Vite uses `base: './'`; scripts, styles, fonts, and favicon use relative URLs. The export was checked under `/preview/` and works at a gateway subpath. Filters use the URL fragment, so no server-side routing or rewrite rule is required. A host should serve `.js` as JavaScript, `.css` as CSS, and `.woff2` as fonts. Publish a complete build together so the hashed assets match `index.html`.

No API service, wallet, private credential, external font request, or RPC endpoint is needed. External evidence and documentation links require a connection. The directory works from its bundled data after the static assets load. Bookmarks stay in this browser’s local storage and are scoped to the hosting origin; changing domains does not migrate them.

## What the data means

- **Allowlist membership:** every unique, non-zero chain/address pair referenced by `HOOKS_ADDRESSES_ALLOWLIST` in [Uniswap/routing-api](https://github.com/Uniswap/routing-api/blob/f5a81893b812b6745b1f8b7fa3a55a714cb9d89b/lib/util/hooksAddressesAllowlist.ts). The zero address represents a pool without a hook and is excluded. One duplicate BVCC/Base reference is deduplicated. Exported constants not referenced by the allowlist are excluded. Two Sepolia testnet entries are retained and labeled.
- **Names, descriptions, and source status:** exact chain/address matches in [Uniswap/hooklist](https://github.com/Uniswap/hooklist/tree/a15ee379aebc9c4f580a3ac0eb795f8fc9388500). There are 106 matches reporting verified source; 11 entries have no matching record. These 11 display **Not recorded**, retain an explorer link, and explicitly explain missing descriptions. Their display names are derived from upstream constant names. They are not represented as unverified contracts.
- **Scope:** Uniswap also automatically allows some hooks based on their properties. This site enumerates the explicit list, not every automatically eligible hook. Hooklist is a registry, not proof of allowlisting. See [Uniswap’s routing criteria](https://developers.uniswap.org/hook-allowlist).
- **Verification:** the badge reports upstream `verifiedSource` metadata. Contract bytecode and security were not independently audited. Hooklist descriptions may be generated automatically. Allowlisting is routing compatibility, not an endorsement or security guarantee.

Every detail dialog links to the exact pinned allowlist constant and, where present, the matching Hooklist metadata. The source badge opens the chain’s contract explorer. CSV includes full descriptions, addresses, both evidence URLs, source status, chain ID, and snapshot date for **all filtered rows**, including those on other pages.

### Reproduce or refresh the snapshot

`data/provenance.json` pins both commits and the retrieval date. `data/upstream/` preserves the small allowlist file and only the matched metadata, not the multi-megabyte registry. The application imports `src/data/hooks.json` locally.

```sh
python3 scripts/update-data.py
npm run typecheck
npm test
npm run build
```

The script fetches the pinned data, parses address references, and never executes upstream TypeScript. To refresh, first set reviewed commit hashes and the retrieval date in `data/provenance.json`, then regenerate and inspect changes. New networks or upstream syntax fail explicitly for review. Review source-status semantics and update snapshot-count assertions if the dataset changes. Rebuild and republish the full `dist/` afterward. Runtime data does not refresh automatically.

## Validation

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The Playwright runner owns a temporary static server at `http://127.0.0.1:4173/preview/`, serves only the production export, and stops it when tests finish. Port 4173 must be available. `PREVIEW_URL` can point the tests at an existing preview. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` optionally selects an already installed Chromium; omit it for Playwright’s normal installation.

Actual worker results on October 9, 2026:

| Check | Result |
| --- | --- |
| Production build | Passed, Vite 8.3.4; complete static export with relative URLs |
| TypeScript typecheck | Passed, no diagnostics |
| Data and interaction logic | 7 tests passed |
| Production browser interactions | 14 tests passed in Chromium |
| Responsive layouts | Checked at 1440, 1024, 768, 390, and 320 CSS pixels; no horizontal overflow in tested states |
| Automated accessibility | No axe WCAG A/AA violations in tested filtered, dialog, and empty states |
| Resources | Local fonts loaded; no page errors, console errors, or failed local resources in the production load check |
| Better Interface review | All six domains reviewed; findings corrected and rechecked |

During this assignment, dependencies were installed in `/tmp/hookbook-build` and the same source/configuration was copied there to run these commands, preserving the restriction against creating repository `node_modules/`. The generated lockfile and final `dist/` were copied back. The browser used the machine’s Chromium executable. Logs, screenshots, exact findings, contrast measurements, and limitations are in [artifacts/validation.md](artifacts/validation.md).

Limitations: no physical-device or screen-reader session, native browser 200% zoom, or Safari/Firefox validation was performed. Reflow testing is not native zoom testing. The source badges reflect a dated upstream record, and every external explorer’s availability was not independently checked. Automated accessibility results are not a claim of full accessibility compliance. These are worker-run results, not independent certification.

## Project map

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Directory, filters, bookmarks, CSV, details, methodology |
| `src/components.tsx` | Accessible modal, links, chain/source badges, local SVG marks |
| `src/directory.ts` | Pure filtering, URL parsing, storage validation, CSV encoding |
| `src/styles.css` | Design tokens, components, responsive rules |
| `src/data/hooks.json` | Complete normalized snapshot |
| `data/`, `scripts/update-data.py` | Pinned evidence and reproducible ingestion |
| `tests/` | Integrity tests and production browser validation |
| `dist/` | Ready-to-publish static export |
| `DESIGN.md` | Implemented design system |
| `artifacts/` | Worker validation, screenshots, logs, and path budget |

The submission path budget is in [artifacts/PATH_BUDGET.md](artifacts/PATH_BUDGET.md). Dependency/cache directories are excluded at every nesting level. Keep `dist/` included. Attribution and licenses are described in [NOTICE.md](NOTICE.md).
