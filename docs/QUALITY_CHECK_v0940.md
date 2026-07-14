# รายงานคุณภาพ v0.9.40 — Narrative & Interface Polish

## ตรวจเฉพาะรายการผู้ใช้ร้องขอ

- PASS รายงานจบเดือนไม่มีคำเตือนการเลือกผู้นำและเหตุการณ์
- PASS หน้าตัดสินใจยังบังคับเลือกครบก่อนจบเดือน
- PASS ไม่พบข้อความ “คำนวณผลจริงตามความถนัด” ในหน้าผู้เล่น
- PASS แถบสถานะด้านบนแบ่งสถานะหลักและข้อมูลประกอบ
- PASS ช่องเลือกงานแบบกลุ่มมีความสูงอย่างน้อย 42 px และไม่ตัดข้อความ
- PASS หน้าจบเกมมีพงศาวดารฉบับเต็ม
- PASS Event Generator ไม่มีชื่อทางเลือกกลางเดิม
- PASS คำอธิบายทางเลือกสร้างจากผลจริงของแต่ละตัวเลือก

## Regression

- TypeScript ผ่าน
- Unit Test 21/21 ผ่าน
- Data Schema 41 ไฟล์ผ่าน
- Legacy Audit ผ่าน
- Stabilization Audit ผ่าน
- Balance & UX Audit ผ่าน
- Dynasty & Endgame Audit ผ่าน
- Narrative & Interface Audit ผ่าน
- Production Build ผ่าน
- HTTP `/` และ `/game` ตอบกลับ 200
- Dependency Audit 0 ช่องโหว่
