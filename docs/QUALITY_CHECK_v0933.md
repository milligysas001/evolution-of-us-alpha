# Quality Check v0.9.33

## Automated

- TypeScript: PASS (`tsc --noEmit`)
- JSON parsing: PASS
- Next.js production build: PASS
- Static page generation: PASS

## Flow audit

1. New game creates exactly 15 living people.
2. Person assignment remains the single source of labor truth.
3. Resting people use `restRecoveryRate`; campfire bonus is larger than outdoor rest.
4. Event choice applies first and its real state delta is inserted into the monthly report.
5. Production/project calculations use the selected leader status where applicable.
6. Leader direct effects apply once and their real delta is inserted into the monthly report.
7. Exploration and realism risks then use the same selected leader status.
8. Treatment capacity comes from care labor/healer support, and herbs are removed from inventory per treated patient.
9. Month summary receives all resulting change lines before state advances.

## Bugs corrected

- Removed duplicated recovery card grid in the rest panel.
- Corrected the four-child worker row wrapping by grouping status, note and select into the right-side control column.
- Removed herb-gathering labor from direct healing capacity; gathering produces herbs, while care labor consumes them for treatment.
- Added explicit cured sickness cause text so recovered people do not remain sick because of an old illness keyword.
- Pinned TypeScript 5.9.3 because TypeScript 7 was incompatible with the installed Next.js build worker.
