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
