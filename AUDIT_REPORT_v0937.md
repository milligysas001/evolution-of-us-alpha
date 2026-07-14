# Evolution of Us v0.9.37 — Stabilization Audit Report

## สรุป

v0.9.37 เปลี่ยนแกนระบบจากการสุ่มและบันทึกที่ผูกอยู่ในหน้า UI ไปเป็นโมดูลที่ตรวจสอบได้ โดยยังรักษาระบบเดิมของ v0.9.36 ครบถ้วน

## โครงสร้างที่แยกออก

```text
engine/
├─ random.mjs            ระบบสุ่มแบบ Seed และสถานะ RNG
├─ transition.mjs        ครอบทุกการเปลี่ยน Game State ด้วย RNG เดิม
└─ monthly-pipeline.mjs  ลำดับ Phase จบเดือนและ Engine Trace

save/
├─ migrations.mjs        Save Envelope, Checksum, Migration
└─ schema.mjs            Runtime Schema Validation

tests/
├─ random.test.mjs
├─ save-migration.test.mjs
├─ schema.test.mjs
└─ pipeline.test.mjs
```

## Monthly Pipeline

ลำดับที่ตรวจและใช้งานจริง:

1. Event Choice
2. Camp Policies
3. Weather
4. Production and Consumption
5. Exploration
6. Military
7. Neighbor Cities
8. Risks and Health
9. Skills
10. Grief Recovery
11. Delayed Events
12. Stage Progression

ทุก Phase สร้าง Trace ของปี เดือน ประชากร และการเปลี่ยนทรัพยากร เพื่อช่วยค้นหาว่าค่าผิดปกติเกิดในระบบใด

## Seeded Random

- ไม่พบ `Math.random()` ใน `app/game/page.tsx`
- เปรียบเทียบผลสุ่ม 500 ค่า จาก Seed เดียวกัน: ตรงกันทั้งหมด
- บันทึกสถานะ RNG แล้วกลับมาสุ่มต่อ: ได้ผลเหมือนเดิม
- ID, รายชื่อเริ่มต้น, Event, Weather, Birth, Animal, Migration, Risk และ Battle ใช้ RNG กลาง

## Save and Migration

- Save Format: `evolution-of-us-save`
- Current Schema: 3
- Current Game Version: 0.9.37
- รองรับ Direct Save รุ่นเก่า
- ตรวจ Checksum ก่อนโหลด
- ตรวจ Schema หลัง Migration
- ถ้า Autosave ล่าสุดเสีย จะทดลองโหลด Backup ก่อนเริ่มเกมใหม่

## ผล Regression

- เริ่มเกม 250 รอบ: ประชากร 15 คนทุกครั้ง
- อาหารเริ่มต้นต่ำสุด: ประมาณ 8.7 เดือนก่อนการผลิตเพิ่ม
- สร้างที่พัก 3 หลัง + กองไฟ + คลังอาหารได้
- สิ่งก่อสร้าง: 31 รายการ
- งานวิจัย: 41 รายการ
- Events: 338 รายการ
- Event Choices ที่ประมวลผล: 1,017 ตัวเลือก
- สัตว์ไม่มีคู่แต่ขยายพันธุ์: ไม่พบใน 120 รอบ

## ผล Test Suite

- Unit Tests: 10 ผ่านทั้งหมด
- Data Validation: 38 JSON ผ่าน
- TypeScript: ผ่าน
- Stabilization Audit: ผ่าน
- Legacy Audit: ผ่าน
- Next.js Production Build: ผ่าน
- HTTP Smoke Test: `/` และ `/game` ตอบกลับ 200
- Dependency Vulnerability: 0

## ข้อจำกัดที่ยังเหลือ

ไฟล์ UI หลักยังมีขนาดใหญ่ แม้ Engine ที่มีความเสี่ยงสูงถูกแยกแล้ว รอบถัดไปควรแยก Components และ Domain Logic เพิ่มทีละระบบ โดยใช้ Test Suite ชุดนี้ป้องกัน Regression
