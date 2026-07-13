# Godot Porting Notes — v0.9.29

ระบบใหม่ใน v0.9.29 ถูกออกแบบให้ย้ายไป Godot ได้ง่ายขึ้น โดยแยกแนวคิดออกเป็น state ต่อไปนี้:

- `WeatherState`: ใช้ควบคุมฤดูกาลผันผวนและผลกระทบต่อ production/risk
- `CampPolicies`: ใช้ทำ automation เมื่อประชากรเยอะ
- `BuildingCondition`: ใช้แสดง HP/Integrity ของอาคารบนแผนที่ Godot
- `SkillXP`: ใช้เชื่อมงานรายคนกับ passive/trait แบบเติบโตได้
- `EndgameCrisis`: ใช้ทำ questline/long-warning crisis ใน Godot

โฟลเดอร์ `types/` และ `logic/` เป็น blueprint สำหรับแยก logic ออกจาก `page.tsx` ในรอบ refactor ถัดไป โดยยังไม่บังคับ import เพื่อไม่ให้ web alpha เสี่ยงพัง.


## v0.9.29 — Era Progression & Exploration Economy
- เพิ่ม Stage หลังเมืองเล็ก: เมืองการค้า, นครรัฐ, อาณาจักร
- เพิ่มทรัพยากรขั้นสูง: ironOre, coal, timber, bricks, textiles, salt, spices, influence, steel, luxuries, warhorses, manpower, siegeMaterials
- ซ่อนแท็บนโยบายจนกว่าจะมี research.campPolicies / projectPlanning หรือ meetingHall เพื่อลดความรกช่วงต้นเกม
- เพิ่ม GameState สำหรับ guilds, outposts, factions, leaderAge, heir เพื่อเตรียมไป Godot
- เพิ่มระบบ Outpost จากพื้นที่สำรวจครบ 100% และผลผลิตรายเดือนแบบ supply line
- เชื่อมระบบสมาคม/คาราวาน/โรงเลื่อย/เตาเผา/โรงถลุงกับทรัพยากรและยุคเมือง
