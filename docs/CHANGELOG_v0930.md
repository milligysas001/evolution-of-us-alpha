# v0.9.30 — System Coherence Audit & Era Event Mesh

## Fixed
- Stage progression after เมืองเล็ก no longer auto-advances using generic log count.
- `signalNetwork` and advanced research gates now use stage rank instead of exact stage comparison.
- Camp policies are inactive until unlocked by research/building, not only hidden in the UI.
- Outpost low-security reports can now create actual event pressure.
- City-State faction approval now changes over time and can trigger rebellion warning events.

## Added
- Event mesh for Trade Hub, Outpost logistics, resource tier expansion, guilds, factions, industry hazards, water reserve disputes, major disease, diplomacy, and siege preparation.
- Explicit long-scale goals for Trade Hub, City-State, Kingdom.
- Coherence data note for future Godot porting.

## Design Direction
- Early game remains micro-management and personal survival.
- Trade Hub begins macro economy through market, caravan, guild, and outpost loops.
- City-State adds faction pressure and political consequences.
- Kingdom connects influence, steel, manpower, luxuries, siege defense, and diplomacy.
