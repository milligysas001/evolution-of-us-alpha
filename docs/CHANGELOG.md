# CHANGELOG

## v0.9.22 — Long Run Balance & Personal Choice Patch

- Added permanent `skillIcon()` helper.
- Converted labor calculation to named-person assignments as source of truth.
- Added custom migrant selection with checkboxes.
- Migrant costs now derive from selected people: food, water, sickness, children, elders, working-age members.
- Added explicit validation before ending month with custom migrant selection.
- Updated animal feeding: animal pen enables rough feed; fodder research improves long-term feed reliability.
- Added quick buttons from Construction/Research pages to People labor assignment.
- Added People filters: free workers, assigned workers, sick/injured.
- Quieted event flow: monthly/leader events stay in panel; important notices stay in bell.
- Updated Godot notes and quality check.


## v0.9.23 — Resource Ledger Tab & 10-Year History
- Added dedicated Resources tab.
- Moved detailed resource ledger out of Town view.
- Added annual resource history snapshots, capped to the latest 10 years.
- Added Godot-ready resource history behavior notes.

## v0.9.24 — Annual Settlers & Dark Mode
- เพิ่มระบบผู้มาตั้งถิ่นฐานประจำปี: ทุกสิ้นปีสุ่มคนเข้าร่วม 1–10 คน แยกจาก Event ผู้อพยพสุ่ม
- ผู้มาตั้งถิ่นฐานประจำปีมีชื่อ อายุ ทักษะ สุขภาพ และ trait ของตนเอง
- การรับคนประจำปีมีผลต่ออาหาร น้ำ ที่พัก ความไว้ใจ สุขภาพ และพงศาวดาร
- เพิ่ม Dark Mode ในหน้า Settings และบันทึกค่าด้วย `eou-ui-theme`
- เพิ่ม data/game/annual_settlers.json และ data/game/theme_settings.json เพื่อเตรียมพอร์ตไป Godot


## v0.9.26 — Comfort Dark, Deep Events & System Closure
- ปรับ Dark Mode ให้นุ่มและลดพื้นขาวที่หลงเหลือ
- เพิ่มสีสถานะสุขภาพ/กำลังใจ/ความล้าให้สื่อความหมายชัด
- บ้าน กองไฟ ช่องระบายควัน และสุขอนามัยช่วยฟื้นความล้า
- ความล้าสูงเพิ่มโอกาสป่วย/บาดเจ็บ
- เพิ่มเหตุการณ์สัตว์เลี้ยง/วิจัย/ก่อสร้าง/สำรวจหลายชุด
- เพิ่มวิจัยและสิ่งก่อสร้างใหม่ที่เชื่อมงาน คน สัตว์ และความเสี่ยง
