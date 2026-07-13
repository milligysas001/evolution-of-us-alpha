# Godot Porting Notes — v0.9.28

ระบบใหม่ใน v0.9.28 ถูกออกแบบให้ย้ายไป Godot ได้ง่ายขึ้น โดยแยกแนวคิดออกเป็น state ต่อไปนี้:

- `WeatherState`: ใช้ควบคุมฤดูกาลผันผวนและผลกระทบต่อ production/risk
- `CampPolicies`: ใช้ทำ automation เมื่อประชากรเยอะ
- `BuildingCondition`: ใช้แสดง HP/Integrity ของอาคารบนแผนที่ Godot
- `SkillXP`: ใช้เชื่อมงานรายคนกับ passive/trait แบบเติบโตได้
- `EndgameCrisis`: ใช้ทำ questline/long-warning crisis ใน Godot

โฟลเดอร์ `types/` และ `logic/` เป็น blueprint สำหรับแยก logic ออกจาก `page.tsx` ในรอบ refactor ถัดไป โดยยังไม่บังคับ import เพื่อไม่ให้ web alpha เสี่ยงพัง.
