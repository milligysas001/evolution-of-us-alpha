# Data Schema (v0.9.15)

ข้อมูลหลักเริ่มแยกไว้ที่ `data/game/*.json` เพื่อให้เพิ่มคอนเทนต์จำนวนมากและเตรียมย้าย Godot ได้ง่าย

## Core Files
- resources.json — รายการทรัพยากรและความหมาย
- jobs.json — งานแรงงานและเงื่อนไขปลดล็อก
- buildings.json — อาคาร ต้นทุน งานที่ต้องใช้ และผลลัพธ์
- research.json — วิจัย ค่าใช้จ่าย เงื่อนไข และสิ่งที่ปลดล็อก
- events.sample.json — ตัวอย่างรูปแบบ event แบบ data-driven
- water.json — กฎระบบน้ำเริ่มต้น


## v0.9.20 Local Map & Migration Selection
- Added Godot-ready location data: locations, exploration jobs, location events, travel risks and outposts.
- Added exploration target state and location progress/status model for future node-map porting.
- Migrant event now generates a concrete candidate list and applies actual named migrants based on the chosen policy instead of adding anonymous population.
- Flow check: named labor -> explore target -> monthly event choice -> resolve production -> resolve exploration -> realism risks -> next event.
