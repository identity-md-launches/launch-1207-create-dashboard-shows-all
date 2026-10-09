# Submission path budget

The full submitted tree must remain below 8,388,608 bytes. Budgets below are upper bounds, not targets.

| Path | Explicit budget (bytes) | Purpose |
| --- | ---: | --- |
| `.gitignore` | 512 | Exclude dependency/cache/test-output directories at every nesting level; never exclude `dist/` |
| `dist/` | 1,500,000 | Complete static runtime export, including local fonts |
| `src/` | 600,000 | React, styles, and complete normalized snapshot |
| `data/` | 400,000 | Provenance and compact upstream evidence |
| `public/` | 100,000 | Favicon and runtime license notices |
| `tests/`, `scripts/` | 150,000 | Reproducible data, integrity, and interaction checks |
| `artifacts/` | 3,500,000 | Validation, screenshots, licenses, and this budget |
| Root manifests, lockfile, configuration, documentation | 500,000 | Reproducible build and publishing instructions |

Dependencies and package caches are installed in an external temporary build directory for this assignment. No repository `node_modules/` is created. `test/scratch/` is not a deliverable. No Git submodule is used. Final actual sizes are recorded in `artifacts/validation.md`.
