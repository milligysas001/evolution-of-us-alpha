# Evolution of Us v0.9.15 — Portable Data Foundation

เวอร์ชันนี้วางฐานข้อมูลเกมให้พร้อมขยายสเกลและเตรียมย้ายไป Godot ในอนาคต

## จุดสำคัญ
- เพิ่ม `data/game/*.json` สำหรับ resources, jobs, buildings, research, events, milestones, threats, merchant, water
- เพิ่ม `docs/*` สำหรับ Game Design, Data Schema, Godot Porting Notes, Balance Notes
- ปรับระบบน้ำ: งาน “ตักน้ำ / ดูแลน้ำสะอาด” ใช้ได้ตั้งแต่เริ่มเกม ไม่ต้องรอวิจัยหรือบ่อน้ำ
- เพิ่มคำเตือนเมื่อจบเดือนแล้วน้ำไม่พอ
- Settings มีปุ่มคัดลอก Godot Data Pack

## ติดตั้ง
```powershell
powershell -ExecutionPolicy Bypass -File .\apply-v0915-portable-data.ps1
```

## ตรวจ build
```powershell
npm run build
```
