# CHANGELOG

## v0.9.28 — System Integration & Godot-Ready Foundations

- เพิ่ม Dynamic Weather: ฝนหลงฤดู แล้งจัด หนาวยาว พายุเข้าเร็ว หมอกชื้น
- เพิ่มระบบน้ำสำรองและอาคารถังเก็บน้ำฝน
- เพิ่มระบบนโยบายค่าย: โยกคนหาอาหารอัตโนมัติ คุ้มครองเด็ก ซ่อมบำรุง และเก็บน้ำสำรอง
- เพิ่ม building condition/maintenance สำหรับสิ่งปลูกสร้าง
- เพิ่ม skill mastery จากการทำงานรายคนต่อเนื่อง
- เพิ่ม grief/relationship morale เมื่อคนใน kin เดียวกันตาย
- เพิ่ม livestock plague และโรคสัตว์แพร่สู่คนเมื่อสุขอนามัยไม่ดี
- เพิ่ม endgame crisis ที่เตือนล่วงหน้าหลายปีเมื่อเข้าสู่เมืองเล็ก
- เพิ่มโฟลเดอร์ `types/` และ `logic/` สำหรับเตรียมแยก engine ไป Godot ในอนาคต



## v0.9.29 — Era Progression & Exploration Economy
- เพิ่ม Stage หลังเมืองเล็ก: เมืองการค้า, นครรัฐ, อาณาจักร
- เพิ่มทรัพยากรขั้นสูง: ironOre, coal, timber, bricks, textiles, salt, spices, influence, steel, luxuries, warhorses, manpower, siegeMaterials
- ซ่อนแท็บนโยบายจนกว่าจะมี research.campPolicies / projectPlanning หรือ meetingHall เพื่อลดความรกช่วงต้นเกม
- เพิ่ม GameState สำหรับ guilds, outposts, factions, leaderAge, heir เพื่อเตรียมไป Godot
- เพิ่มระบบ Outpost จากพื้นที่สำรวจครบ 100% และผลผลิตรายเดือนแบบ supply line
- เชื่อมระบบสมาคม/คาราวาน/โรงเลื่อย/เตาเผา/โรงถลุงกับทรัพยากรและยุคเมือง

## v0.9.33 — Recovery, Leader Effects & 15 Settlers
- ย้ายสถานะและช่องเลือกงานไปคอลัมน์ขวาของรายชื่อคน
- เพิ่มภาพรวมพักฟื้นและโบนัสกองไฟที่มากกว่าพักกลางแจ้ง
- เกมใหม่เริ่มประชากรสุ่ม 15 คน
- รายงานผลเหตุการณ์/ผู้นำเป็นค่าที่เปลี่ยนจริงเมื่อจบเดือน
- ปรับระยะเวลาก่อสร้างต้นเกม
- ใช้สมุนไพรตามจำนวนคนที่ได้รับการดูแลจริง
