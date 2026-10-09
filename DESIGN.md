# Hookbook design system

## Overview

Hookbook is a research directory for developers and people exploring Uniswap v4 hooks. The implemented direction is a quiet, light dashboard: a white navigation rail, a subtly tinted workspace, pink interaction cues, compact metrics, and a four-column directory. No visual direction was supplied; these are implementation choices.

The page prioritizes finding a hook, identifying its chain, reading its purpose, and following its evidence. The snapshot is explicit and dated. Status colors communicate source records, not safety. This is an English-language, light-only product.

Source of truth: `src/styles.css`, `src/components.tsx`, and `src/App.tsx`. All visual assets are local SVG/CSS or locally bundled WOFF2 fonts. The dashboard screenshots in `artifacts/` show the implemented export.

## Colors

The canonical system is a small sRGB hex palette in `src/styles.css:1`, with primitive values mapped to semantic role tokens. Components use semantic tokens for shared UI roles. Chain marks and decorative initials have distinct identifying colors; they never carry a status without text.

| Semantic token | Value | Role |
| --- | --- | --- |
| `--color-bg` | `#faf9fb` | Workspace and subdued table heading |
| `--color-surface` | `#ffffff` | Rail, cards, table, controls, dialogs |
| `--color-subtle` | `#f5f4f7` | Neutral badges, address blocks, hover surfaces |
| `--color-hover` | `#efedf2` | Neutral ramp hover role |
| `--color-border` | `#e6e3eb` | Structural dividers and card outlines |
| `--color-control-border` | `#827b8c` | Visible search/select boundaries |
| `--color-text` | `#25212d` | Headings and primary content |
| `--color-text-strong` | `#45404e` | Supporting content and chain labels |
| `--color-text-secondary` | `#6d6677` | Descriptions, labels, and metadata |
| `--color-accent` / `--color-focus` | `#c1246b` | Selected navigation, links, focus, primary buttons |
| `--color-accent-hover` | `#a61b5a` | Primary hover and selected count text |
| `--color-accent-soft` | `#fcebf3` | Selected navigation and pink icon tile |
| `--color-accent-border` | `#f8deec` | Selected count background and text selection |
| `--color-success` | `#26734d` | Verified source text/check |
| `--color-success-soft` | `#edf7f1` | Verified source badge surface |
| `--color-on-accent` | `#ffffff` | Primary action text |

Measured rendered pairs: primary heading/background 15.00:1; secondary description/background 5.24:1; selected navigation count 5.69:1; verified badge 5.27:1; selected tab/white 5.63:1; input text/white 15.74:1. See validation for measurement scope. Only opaque backgrounds were used for these measurements. Forced-colors mode retains a system `Highlight` focus outline. No dark theme is implemented.

## Typography

The interface uses **DM Sans Variable**, locally bundled through `@fontsource-variable/dm-sans`. The package supplies Latin and Latin Extended WOFF2 files with normal-style weights 100–1000; the interface requests weights 400–750. Fallbacks are `DM Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, and `sans-serif`. Monospace addresses use `ui-monospace`, `SFMono-Regular`, `Consolas`, and `monospace`.

| Role | Implemented size / weight |
| --- | --- |
| Page heading | `clamp(1.75rem, 2.5vw, 2.25rem)` / 650; 1.2 line-height; −0.045em tracking |
| Small-phone heading | 1.875rem; maximum 19ch |
| Metric values | 2rem / 600; 1.75rem below 49rem and 1.625rem below 35rem |
| Directory heading and hook names | 0.8125rem / 600; hook names become 0.875rem in cards |
| Body and explanatory text | 0.875–1rem; unitless 1.5–1.7 line-height |
| Descriptions / source labels | 0.75rem; mobile descriptions 0.8125rem |
| Captions and addresses | Usually 0.6875–0.75rem; smallest decorative counts 0.625rem |
| Inputs | 0.8125rem on desktop; 1rem below 49rem to avoid mobile input zoom |
| Dialog chrome heading | 1.125rem / 600 |
| Hook identity in dialog | 1.5rem / 600, 1.25rem on phones; intentional content identity emphasis above the generic dialog label |

The named sizes are `--text-xs`, `--text-sm`, `--text-ui`, `--text-body`, and `--text-heading`. The dense directory uses smaller text than long-form prose. Keep weight at 400 or above for UI text. No italic face is used. Numeric values use tabular figures. Heading wrapping is balanced; descriptions use pretty wrapping. Introductory copy is capped at 65ch, and empty-state copy at 45ch.

Long hook names wrap rather than truncate. Table descriptions clamp to two lines, card descriptions to three, with a visible **Read details** action exposing the full original text. Short addresses have their complete value in the detail view and are selectable there. The full address explicitly uses left-to-right direction.

## Layout

Spacing tokens are 4, 8, 12, 16, 20, 24, 32, and 40 CSS pixels at the default root size. Component declarations also use 10/14/18/22px where the dense directory needs intermediate spacing.

The desktop `.app-shell` uses a 14rem rail and a flexible workspace. `.sidebar` is sticky with a viewport-height layout. `.topbar` is in normal flow. `main` has a 93rem maximum width and 2.5rem inline padding. Three equal metric cards sit above the directory panel. The table columns are 31% name, 16% chain, 35% description, and 18% source, with slightly adjusted ratios at narrower desktop sizes. Ten deployments are shown per page.

| Breakpoint | Implemented adaptation |
| --- | --- |
| At least 100rem | 15rem rail; main padding 3.5rem; roomier table rows |
| At most 77rem | 12.5rem rail, 1.75rem main padding, tighter metrics/table |
| At most 66rem | Rail becomes a top brand/navigation row; secondary resource links and builder card disappear; methodology remains available in content/footer |
| At most 49rem | Heading/export stack; search spans the two-column filter grid; native table rows become labeled cards; mobile sort control appears; 16px form text |
| At most 35rem | Brand and navigation stack; duplicate navigation counts hide; compact metrics remain in three columns; filters and pagination stack; 1rem main gutters |

Responsive changes preserve all primary actions. The mobile cards still expose all four requested fields. The table keeps native semantics and explicit row/cell roles; column labels are visually hidden on mobile, with visible per-card labels. Search and filters are visibly labeled at every width.

Most directional padding/margins use logical properties. At 768px, a temporary RTL mirror was inspected without overflow; translations are not implemented. Browser reflow was tested at 320, 390, 768, 1024, and 1440px. This does not establish native zoom or physical-device behavior.

## Elevation & Depth

Cards and the table use 1px structural outlines, without prominent shadows. The export button has a minimal `0 1px 2px #25212d05` shadow. The dialog uses `--shadow-dialog: 0 20px 80px #25212d26, 0 3px 12px #25212d0d`, a `#25212d66` backdrop, and 3px backdrop blur. Notifications have a small `0 4px 24px #25212d12` shadow.

The dialog uses the browser’s top layer. The notification is fixed at z-index 20 and the keyboard skip link at 100. Notifications persist until dismissed, instead of disappearing while someone is reading them. No staged entrance, looping motion, or loading animation is used.

## Shapes

`--radius-control` is 0.5rem; `--radius-card` is 0.875rem; `--radius-panel` is 1rem. Brand marks use a rounded square. Hook initials use 0.75rem rounded squares, with muted identifying fills. Source badges use 0.375rem corners. Dialogs use 1.25rem corners on desktop and 1rem on phones. Circular check marks and round network indicators are decorative companions to text.

## Components

- **`BrandMark`** (`src/components.tsx`): custom inline SVG hook symbol, using `currentColor`. Decorative wherever visible brand text supplies its name.
- **`ExternalLink`**: normal anchor semantics, external-arrow cue, new-tab announcement, `noopener noreferrer`. Use it for evidence and documentation destinations.
- **`ChainIcon` / `ChainBadge`**: local SVG network identifiers, readable chain name, and a testnet label when needed. Color is supplementary.
- **`HookAvatar`**: deterministic decorative initials for a hook name. These are directory-generated identifiers, not official project logos.
- **`SourceBadge`**: green check plus **Verified**, or a neutral question mark plus **Not recorded**. Both link to the correct chain/address explorer. The accessible name includes hook and chain.
- **`Modal`**: native `dialog.showModal()`, labeled title, modal semantics, initial close-button focus, Tab/Shift+Tab wrapping, Escape/backdrop dismissal, and trigger focus restoration. Content scrolls within the viewport; full addresses wrap.
- **Directory fields and view buttons** (`src/App.tsx`): native search/select controls, selected view with `aria-pressed`, persistent URL-fragment filters, name sorting and clamped pagination. Filter changes reset the page. Result counts use a polite status region.
- **Save controls**: bookmark icon, `aria-pressed`, explicit save/unsave name, local storage persistence and cross-tab updates. Storage failure preserves this visit’s state and shows an explanatory message.
- **Buttons**: neutral `.button`, filled `.primary-button` for the contextual recovery/save action, `.icon-button`, `.text-button`, and `.save-button`. Export is disabled only for zero rows. Controls have visible focus and hover/pressed states where applicable.
- **Empty state**: no-match text includes the query and offers **Clear filters**; an empty saved collection offers **Explore hooks**. Loading/network-error states are not applicable to the synchronous bundled dataset.

Focus uses a 2px accent outline with 3px offset. Phone bookmark and pagination targets are 44px; the dense desktop table uses targets of at least 24px for inline controls. Hover is gated by pointer capability. Only 120ms color/background transitions are enabled, and only under `prefers-reduced-motion: no-preference`.

## Do’s and Don’ts

- Start new directory content within the existing workspace and panel structure. Reuse semantic tokens and the named type scale.
- Keep deployment identity as **chain + address**. Similar names and shared addresses across networks are expected.
- Keep verified-source status separate from allowlist membership and security claims.
- Use the detail dialog whenever shortening a description or address; preserve selectable full values.
- Keep filled pink buttons reserved for the current contextual action. Keep success green reserved for the source record.
- Do not introduce remote runtime assets, wallets, new themes, or new status colors without a product need.
- To add a related page, reuse the shell, heading, panel, native fields, and `ExternalLink`, then verify reflow, focus, and source attribution before documenting its new patterns.
