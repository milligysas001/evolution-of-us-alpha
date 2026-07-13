# Changelog v0.9.19

## Compact Labor & Quiet Event Flow
- ปรับ Event Flow: เหตุการณ์ปกติอยู่ใน panel เดิม ไม่เด้ง modal อัตโนมัติ
- Modal กลางจอใช้เฉพาะเหตุการณ์สำคัญจริง เช่น พ่อค้า, โจร, ขโมยเสบียง, ผู้อพยพ, เหตุการณ์หายาก
- Bell notification กรองเฉพาะแจ้งเตือนสำคัญ ลด noise
- หน้าแรงงานรายบุคคลเปลี่ยนจากการ์ดใหญ่เป็น compact rows พร้อม filter ตามความถนัด
- แก้ overwork logic: เช็คจาก assignment load ไม่ใช่ productive output หลัง skill/passive bonus
- เด็กช่วยงานและผู้สูงอายุมี base work factor ที่สมจริงขึ้น พร้อม boost จาก passive ที่เหมาะสม

## Godot Porting Note
ระบบแรงงานตอนนี้แยกแนวคิดเป็น `assignment load` และ `effective output` ชัดเจนขึ้น ซึ่งสำคัญต่อการพอร์ตไป Godot ในอนาคต
