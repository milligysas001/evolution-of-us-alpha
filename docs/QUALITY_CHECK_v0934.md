# Quality Check v0.9.34

## Automated build checks

- `npm run typecheck`: PASS
- `npm run check:data`: PASS
- `npm run build`: PASS
- `npm audit --audit-level=moderate`: 0 vulnerabilities
- production `/game`: HTTP 200

## Runtime/event checks

| Check | Result |
|---|---:|
| Event definitions | 336 |
| Unique event IDs | 336 |
| Event choices | 1,011 |
| Unique choice IDs | 1,011 |
| Delayed/chain references checked | 127 |
| Condition/weight evaluations | 1,008 |
| Choice runtime executions | 1,011 |
| New game population | 15 |
| Birth population delta | +1 |
| Outdoor rest recovery | 3 |
| Campfire rest recovery | 8 minimum |

No exception, `NaN`, illegal negative resource, duplicate person ID, missing event reference, or duplicate event/choice ID was found in the audited paths.

## Balance/runtime simulation

- 100 simulated games
- 4,743 total simulated months
- 47.43 average months
- 55 reached five years
- 45 ended within five years
- End causes: prolonged starvation 44, no labor/no escape route 1

This simulation intentionally does not reproduce a competent player's construction and research planning. It is a runtime integrity test, not a final difficulty benchmark.

## Thai wording scan

Deprecated mixed-language UI terms were removed from Thai strings. Only `JSON` remains in import/export wording because it is the required file format name.

## Visual test limitation

Automated Chromium navigation was blocked by the environment administrator policy. Responsive CSS and source layout were inspected, and production build/HTTP response passed, but automated screenshot comparison is not claimed.
