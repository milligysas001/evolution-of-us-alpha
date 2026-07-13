# Quality Check v0.9.15

- ใช้ save key กลางจาก v0.9.14 ต่อเนื่อง
- ไม่สร้าง backup ใน project
- เพิ่ม data JSON ที่ Godot อ่านได้
- ระบบน้ำเริ่มต้นไม่ soft-lock: ผู้เล่นสามารถตักน้ำได้ตั้งแต่เดือนแรก
- คำเตือนก่อนจบเดือนแจ้งเมื่อ water stock ไม่พอ


## v0.9.20 Local Map & Migration Selection
- Added Godot-ready location data: locations, exploration jobs, location events, travel risks and outposts.
- Added exploration target state and location progress/status model for future node-map porting.
- Migrant event now generates a concrete candidate list and applies actual named migrants based on the chosen policy instead of adding anonymous population.
- Flow check: named labor -> explore target -> monthly event choice -> resolve production -> resolve exploration -> realism risks -> next event.
