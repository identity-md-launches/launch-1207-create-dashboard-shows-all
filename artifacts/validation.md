# Worker validation — Hookbook

**Complete for the stated scope.** Checks below were performed by the worker on October 9, 2026; they are not independent network certification.

## Scope and assumptions

A new React/TypeScript/Vite static directory. Reviewed the production export at `/preview/`, including all/saved views, search, chain/source filters, sorting, pagination, exports, details, copy, methodology, and empty/failure states. The interface is English and light-only. No account, wallet, transaction, or live API was added.

“All hooks allowlisted” is implemented as all 117 unique non-zero deployments in the pinned public **explicit routing allowlist**, including two Sepolia entries. Automatic eligibility outside the explicit list is disclosed, not presented as an enumerated inventory. There are 106 exact Hooklist metadata matches and 11 missing records. Missing metadata stays visible with truthful **Not recorded** status and explanatory copy. Source verification is reported from upstream, not independently certified. See `data/provenance.json` and the README.

Dependencies were installed outside the repository in `/tmp/hookbook-build`. All source/configuration and the lockfile are delivered in the repository; `dist/` was copied from the successful final build. No repository dependency directory, vendored registry, submodule, or cache is needed.

## Actual execution

| Command / check | Actual outcome | Evidence |
| --- | --- | --- |
| `npm install --prefix /tmp/hookbook-build --cache /tmp/hookbook-npm-cache --no-audit --no-fund` | Exit 0; 53 packages installed; lockfile returned to repository | `package-lock.json` |
| `python3 scripts/update-data.py` | Exit 0; 117 unique deployments, 106 matches, 12 networks | `data/upstream/`, `src/data/hooks.json` |
| `npm run typecheck` | Exit 0; no diagnostics | `artifacts/typecheck.log` |
| `npm run build` | Exit 0; Vite 8.3.4; local JS, CSS, WOFF2, favicon, and licenses | `artifacts/build.log`, `dist/` |
| `npm test` | Exit 0; 7 tests passed | `artifacts/unit-tests.log` |
| `npm run test:browser` | Exit 0; 14 production-export tests passed, 27.0 seconds | `artifacts/browser-tests.log` |

The browser command used `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/home/imd/.cache/ms-playwright/chromium-1247/chrome-linux64/chrome`. The server was owned and stopped by the Playwright test process. The pinned guide’s optional `test/scratch/browser/preview.json` was not supplied; the production static test server provided the same `/preview/` subpath, and the supplied browser tool successfully reached it. Tool-driven visual inspection used that production export, not Vite’s development server.

The initial typecheck was started before dependency installation finished and reported `tsc: not found`; it was rerun successfully after installation. The first production build found an unsupported font CSS subpath; that was repaired before the final build. The first browser run also exposed one assertion that counted hidden mobile label text and one test that pressed Tab before React rendered. The harness was corrected to target the visible chain badge and await the heading. These harness errors are distinct from the product findings below.

## Interaction coverage

- Production load at a subpath, local font load, no page errors/console errors/HTTP resource errors.
- Search by name, description, chain ID, full address, case normalization, whitespace, and no-match input.
- Combined search + chain + verified-source filters; changing filters from later pages; clearing and focus restoration; fragment persistence on reload.
- Alphabetical ascending/descending sorting; all twelve pages traversed, with 117 distinct explorer destinations, no duplicate/omitted deployment, and the final page/disabled next button checked.
- Sepolia filter returns both labeled testnet entries. Missing source records remain filterable (11 total).
- Save, unsave, saved collection, reload persistence, and empty saved collection recovery.
- Simulated local-storage failure keeps in-memory bookmarks and displays the recovery explanation.
- Full descriptions/addresses in dialogs, clipboard copy and actual clipboard contents, pinned evidence URLs, Escape, trigger focus return, and repeated Tab containment.
- CSV download contains all 57 Base rows while only 10 are displayed, plus provenance. Unit tests cover CSV escaping and formula-prefix protection.
- Axe checks against WCAG A/AA tags in filtered directory states at five widths, plus dialog and empty states. No violations in the final run. Reduced-motion controls report zero transition duration.

## Better Interface consolidated review

Read the pinned workflow, all six domain core-principle sections, and the design-documentation method before completing this review. Supporting native dialog, focus, target sizing, reflow, truncation, token, and motion rules informed the implementation. Attribution/licenses are retained in `NOTICE.md` and `artifacts/design-guidance-LICENSE.txt`.

| Domain | Coverage | Evidence and limits |
| --- | --- | --- |
| Accessibility | **Checked** | Native controls/table/dialog, visible labels, descriptive link/button names, skip link, keyboard flow, Tab wrapping, Escape/focus return, status regions, 24px minimum inline targets, 44px mobile save/page targets, reduced motion, axe scans. A visible copy-button focus ring was inspected in the mobile dialog screenshot. Screen-reader and physical-device sessions **Not verified**; every possible focused control/background combination was not screenshot-reviewed. |
| Layout | **Checked** | Shared edges, control grouping, logical properties, table-to-card reflow, narrow navigation, full-address wrapping. Automated no-overflow checks at 1440, 1024, 768, 390, 320px. Screenshots viewed at 1440×1000, 768×1000, 390×844, 320×900. Temporary RTL mirror at 768px showed no horizontal overflow. Native 200% zoom and translated/pseudo-localized text **Not verified**. |
| Writing | **Checked** | Explicit snapshot/allowlist scope; no safety claims; truthful unknown source status; clear CSV/save/copy/clear labels; full descriptions available; testnet and independent-directory notices; no-match and storage-failure recovery. Upstream descriptions remain upstream data, not independently reviewed contract analysis. |
| Typography | **Checked** | Locally loaded DM Sans confirmed with `document.fonts.check`; weights, unitless leading, numeric alignment, wrapping, two/three-line truncation with full detail view, 16px phone inputs. Dialog hook identity deliberately receives stronger visual emphasis than its generic chrome heading. OS font-rendering differences and user font overrides **Not verified**. |
| Colors | **Checked** | Semantic token review, rendered opaque foreground/background measurements below, axe contrast scans. Count badge defect corrected and remeasured. Only light theme exists; dark-theme testing **Not applicable**. Physical-device gamut and forced-colors rendering **Not verified** (source fallback is present). |
| UI details | **Checked** | Native dialog, bordered controls/panels, consistent Lucide icons, local marks, selected/saved/disabled/hover/focus/empty states; persistent dismissible notifications; no loading state for bundled synchronous data. Color transitions are limited to 120ms and disabled under reduced motion. Animation-panel replay at 10% speed **Not verified**; there are no spatial/staged animations. |

### Findings, fixes, and rechecks

| Severity / domain | Final source location | Observed issue and fix | Recheck |
| --- | --- | --- | --- |
| High / colors | `src/styles.css:256` | Selected navigation count used `#c1246b` on `#f8deec`, measured by axe at **4.46:1**, below the 4.5:1 requirement. Switched the count text to the existing darker accent-hover token. | Rendered measurement **5.69:1**; all final axe states pass. |
| Medium / layout | `src/styles.css:235` | “Hook directory” wrapped onto two lines in the 1440px desktop sidebar. Prevented label wrapping to preserve the intended single-row navigation. | Final desktop screenshot shows one-line label. |
| High / layout | `src/styles.css:1402`, `src/styles.css:1651` | The nowrap correction exposed a minimum-content width of **357px at a 320px viewport**. Used a zero-minimum grid track and hid redundant navigation counts below 35rem; the counts remain in the directory tabs. | 320px rendered scroll width is **320px**; final responsive test passes. |
| Medium / layout | `src/styles.css:1685` | Three stacked mobile metric cards pushed the primary search far below the initial view. Changed the phone metric group to a compact three-column layout with secondary captions omitted. | Viewed phone layout and scrolled directory; all metrics and primary interactions retained. |
| High / accessibility | `src/components.tsx:240` | Tab traversal could leave the dialog controls for browser chrome. Added explicit modal semantics and boundary wrapping while retaining native `showModal()` and focus restoration. | Keyboard test traverses 12 Tab stops inside the dialog; Escape and trigger return pass. |
| Medium / typography | `src/styles.css:646`, `src/styles.css:948` | Early labels/statuses were overly small in the dense view. Raised form labels, source badges, table headings, and pagination to 12px and several captions to 11px. | Rendered desktop/mobile review and final axe scans pass. |
| High / build | `src/main.tsx:3` | The font package does not export `latin.css`; the first build reported an unresolved import. Changed to its supported package entry, bundling both available WOFF2 subsets. | Final build succeeds; local DM Sans load confirmed; no remote font requests. |

### Rendered contrast measurements

Measured in Chromium from computed foreground styles and the nearest actual opaque ancestor background, then calculated using WCAG relative luminance. These values are not estimates or claims about unmeasured pairs.

| Rendered element | Foreground | Background | Ratio |
| --- | --- | --- | ---: |
| Page heading | `#25212d` | `#faf9fb` | 15.00:1 |
| Introductory secondary text | `#6d6677` | `#faf9fb` | 5.24:1 |
| Selected navigation count | `#a61b5a` | `#f8deec` | 5.69:1 |
| Verified-source text | `#26734d` | `#edf7f1` | 5.27:1 |
| Selected directory tab | `#c1246b` | `#ffffff` | 5.63:1 |
| Search input text | `#25212d` | `#ffffff` | 15.74:1 |

### Screenshot evidence

- [Desktop directory](dashboard-desktop.png): 1440×1856 full-page capture, viewed and then saved from a 1440×1000 viewport.
- [Mobile directory](dashboard-mobile.png): 390×844 viewport, scrolled to search and the first card.
- [Mobile details and visible keyboard focus](hook-details-mobile.png): 390×844 viewport, full contract address and focus on Copy address.

These were captured from the final production build and inspected through the supplied browser tool. Intermediate desktop, 768px, 320px, and RTL screenshots were also viewed; redundant intermediate images are not part of the submission.

## Remaining limitations

The site is a dated static snapshot. Automatically eligible hooks outside the explicit list are not enumerated. Contract source verification, audits, deployed bytecode, and routing availability were not independently certified. Third-party explorer availability may change; local tests validate link identities/destinations but do not guarantee every external site’s response. Native zoom, screen readers, physical touch devices, Safari/Firefox, translated text, and forced-colors rendering remain unperformed checks as noted above. No claim of complete WCAG conformance is made.

Source, package/lockfile, required runtime assets, `dist/index.html`, documentation, compact upstream evidence, and screenshots are retained. The runtime export is **460,891 bytes**, including licenses, at the final build. A final source/export/path audit is recorded in `artifacts/submission-audit.json`; the raw submission tree is well below the 8,388,608-byte limit, leaving substantial bundle overhead. `.gitignore` is 306 bytes within its explicit 512-byte path budget. No protected repository paths were modified.
