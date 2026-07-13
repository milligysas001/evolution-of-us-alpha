# QUALITY CHECK — v0.9.22

- [x] JSON data ยัง parse ได้
- [x] `app/game/page.tsx` ผ่าน TypeScript transpile syntax diagnostics
- [x] แก้ `skillIcon` missing helper
- [x] ไม่มี backup folder ใน package
- [x] Save key หลักยังเป็น `eou-current-save`
- [x] ระบบแรงงานคำนวณจาก `laborAssignments` เป็นหลัก
- [x] ผู้อพยพเลือกทีละคนและมี dynamic cost ตามคนที่รับ
- [x] Flow อาหารสัตว์สัมพันธ์กับคอก / อาหารหยาบ / วิจัย
- [x] เพิ่ม note เตรียมพอร์ต Godot ใน docs

ควรทดสอบในเว็บ:

1. เริ่มเกมใหม่ → ไปแท็บคน → จัดแรงงานเอง → จบเดือนได้
2. Event ผู้ลี้ภัย → ติ๊กเลือกคน → เลือก “รับเฉพาะรายชื่อที่เลือก” → คนเข้าค่ายจริง
3. สร้างคอกสัตว์ → งานตัดหญ้า/อาหารหยาบสัมพันธ์กับสัตว์
4. หน้าก่อสร้าง/วิจัย → ปุ่มไปจัดทีมในแท็บคนทำงาน
5. กระดิ่งไม่รกด้วย event ปกติ
