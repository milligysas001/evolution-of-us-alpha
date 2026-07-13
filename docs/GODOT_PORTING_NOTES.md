# Godot Porting Notes (v0.9.15)

## สิ่งที่ควรพกไป Godot
- data/game/*.json
- โครง save state
- สูตร resolveMonth / resources / threats / villagers
- event format

## แนวทางใน Godot
- โหลด JSON ด้วย `FileAccess.get_file_as_string()` และ `JSON.parse_string()`
- map `id` ของ resource/building/research/job ไปเป็น UI node หรือ Resource class
- ให้ Godot scene เป็น UI/visual layer ส่วนสูตรคำนวณควรรักษาโครงแบบ engine แยกจาก UI

## Visual State ที่ควรเพิ่มต่อไป
- stage
- housingLevel
- waterLevel
- farmLevel
- wallLevel
- marketLevel

## v0.9.16 Porting Notes
Livestock should be ported as a standalone simulation module:
- `AnimalState` contains animal counts, hunger, health, last action and log.
- `resolveAnimals(gameState)` consumes feed/food, applies breeding, theft, escape, starvation and animal products.
- Godot can map each animal type in `data/game/animals.json` to UI cards and future map objects.
- Construction/research projects now require paused project arrays so Godot UI should support active + paused queues.

## v0.9.17 Porting Notes
Godot should treat `data/game/terrain.json` and `data/game/people_passives.json` as portable source data. In Godot, villagers should be Resources or Dictionaries with age, skill, traits, health, fatigue, and assignedJob. Monthly resolution should compute labor power from assigned villagers instead of plain worker counts.

## v0.9.18 Porting Notes
- `data/game/justice.json` can become a Godot Resource for punishment policy and crime events.
- `data/game/migration.json` defines migration candidate types and policy options for future Godot selection UI.
- Resource flow display should map to a compact HUD: `stock + net` rather than a full accounting table.
- Important event categories should open modal/scene overlay automatically: trade, migration, crime, threat, rare.


## v0.9.20 Local Map & Migration Selection
- Added Godot-ready location data: locations, exploration jobs, location events, travel risks and outposts.
- Added exploration target state and location progress/status model for future node-map porting.
- Migrant event now generates a concrete candidate list and applies actual named migrants based on the chosen policy instead of adding anonymous population.
- Flow check: named labor -> explore target -> monthly event choice -> resolve production -> resolve exploration -> realism risks -> next event.

## v0.9.21 Porting Notes
- ProjectCrewStatus ควรถูกพอร์ตเป็น component กลางใน Godot ใช้กับ construction/research/crafting/animal care ได้
- Work output ต้องแยก `assigned people count` และ `effective labor` เพื่อรองรับอายุ สุขภาพ passive และ skill
- Herb gathering เป็น job เริ่มต้น แต่ herbal medicine เป็น unlock/efficiency layer
- Animal simulation ใช้ทั้ง feed/food และ water จึงควรอยู่ใน monthly resolution engine ไม่ใช่ UI

## v0.9.22 Porting Notes

- `laborAssignments` should become the only authoritative labor source in Godot. Do not port old numeric labor as gameplay input.
- Migrant selection should be a modal/list scene with selectable candidate IDs. Costs should be calculated from selected people, not from fixed event delta.
- Animal feed has two layers: rough feed from pen/outdoor husbandry and researched fodder preparation. Godot data should preserve both.
- Construction and research crews should display assigned people and effective output from the same labor calculation engine.

### v0.9.24 Annual Settlers & Display Theme
- `annual_settlers.json` ควรถูกพอร์ตเป็นระบบ `AnnualPopulationFlow` ใน Godot โดยเรียกเมื่อเปลี่ยนปี
- ระบบนี้ต้องแยกจาก event migration ปกติ เพื่อให้โลกดูมีการเคลื่อนของผู้คนตามชื่อเสียงถิ่นฐาน
- `theme_settings.json` เป็น user display config ไม่ควรรวมใน gameplay save state หลัก
