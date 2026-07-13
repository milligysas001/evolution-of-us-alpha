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
