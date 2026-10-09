# Attribution

## Design guidance

This implementation applied the assignment’s pinned **Better Interface** reference, adapted from Jakub Krehel’s Better Interface, MIT, commit `267330e1adfc66a718fb65fa6918c1f06d0a689e`: https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface.

The design-documentation method is adapted from Paul Bakaus’s **Impeccable**, Apache-2.0, commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`: https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md. Copyright 2025 Paul Bakaus. The documentation is specific to this implementation and does not reproduce the reference manual. Both supplied license texts are preserved in `artifacts/design-guidance-LICENSE.txt`.

## Data

The explicit allowlist snapshot comes from **Uniswap/routing-api**, with its GPL-3.0 license retained at `data/upstream/LICENSE.txt`. `data/upstream/hooksAddressesAllowlist.ts.txt` is an unchanged source snapshot used as data/evidence, not executable application code. Names, contract descriptions, chain IDs, and source status are factual metadata from **Uniswap/hooklist**. Both commits and normalization rules are recorded in `data/provenance.json`. Hookbook is an independent directory; no affiliation with Uniswap Labs is claimed.

## Runtime dependencies and assets

React and React DOM are MIT licensed. Lucide icons are ISC licensed, with applicable Lucide/Feather notices retained in their license. DM Sans is licensed under the SIL Open Font License. Their complete notices are in `public/licenses/` and are copied to `dist/licenses/` by the build. The custom Hookbook mark and initials are local SVG/CSS assets; no official hook project logos are represented by the initials. Chain symbols are simplified inline identifying graphics accompanied by text.
