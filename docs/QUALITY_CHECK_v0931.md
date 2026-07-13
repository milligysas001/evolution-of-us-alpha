# Quality Check v0.9.31

Checked before packaging:

- data/game JSON parses successfully.
- app/game/page.tsx parse diagnostics: OK.
- app/page.tsx parse diagnostics: OK.
- TypeScript transpile diagnostics: OK for TSX files.
- No backup folders are included in the release zip.

Recommended after install:

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run check
```
