# QUALITY CHECK — v0.9.24

- [x] เพิ่ม annual settlers แยกจาก migration event
- [x] คนประจำปีมีข้อมูลรายบุคคลจริง ไม่ใช่ตัวเลขประชากรลอย ๆ
- [x] ระบบมีผลต่ออาหาร น้ำ ที่พัก และความสัมพันธ์
- [x] Dark mode อยู่ใน Settings และไม่กระทบ save game
- [x] เพิ่ม data JSON สำหรับ Godot porting
- [x] ตรวจ JSON ใน data/game ผ่านด้วย npm run check:data
- [x] ตรวจ syntax TSX เบื้องต้นผ่าน TypeScript transpile diagnostics

หมายเหตุ: ในเครื่องผู้ใช้ต้องรัน `npm run check` หลังติดตั้งเพื่อให้ Next.js ตรวจ build เต็มระบบอีกครั้ง
