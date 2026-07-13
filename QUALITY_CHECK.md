# QUALITY CHECK — v0.9.30

Checked in packaging environment:

- `data/game/*.json` parse OK
- `app/game/page.tsx` transpile diagnostics OK
- `app/page.tsx` transpile diagnostics OK
- Semantic TypeScript check OK after excluding missing local React/Next modules in the packaging container
- Stage progression no longer uses generic fallback for all late stages
- Policy automation is gated by unlock conditions
- New era systems have linked event consequences

Final local verification:

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run check
```
