# Evolution of Us — Alpha v0.9.35

เวอร์ชันนี้แก้ระบบประชากรเริ่มต้น วัตถุดิบก่อสร้าง การซ่อนเนื้อหาตามยุค คู่มือหาทรัพยากร ตัวกรองคน และระบบสัตว์เลี้ยง พร้อมชุดตรวจถดถอยอัตโนมัติ

## ติดตั้งลงโครงการเดิม

ไฟล์ ZIP ต้องถูกแตกออกก่อน เช่นอยู่ที่:

```text
C:\Users\phass\Desktop\game\New folder (2)
```

หยุด `npm run dev` ด้วย `Ctrl + C` แล้วเปิด PowerShell:

```powershell
cd "C:\Users\phass\Desktop\game\New folder (2)"
powershell -ExecutionPolicy Bypass -File .\apply-v0935-resource-era-animal-audit.ps1 -ProjectPath "C:\Users\phass\evolution-of-us"
```

ตัวติดตั้งจะสำรองโครงการเดิมเป็นโฟลเดอร์ชื่อประมาณ:

```text
C:\Users\phass\evolution-of-us_backup_before_v0935_YYYYMMDD_HHMMSS
```

## ตรวจระบบด้วยตนเอง

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run typecheck
npm run check:data
npm run audit:systems
npm run build
npm run dev
```

เปิดเกมที่:

```text
http://localhost:3000/game
```

## อัปขึ้น GitHub และ Vercel

```powershell
cd "C:\Users\phass\evolution-of-us"
git status
git add -A
git commit -m "update v0.9.35 resource era animal audit"
git push
```

## จุดสำคัญของเวอร์ชันนี้

- หน้าเริ่มเกมและเกมใหม่ใช้ประชากร 15 คนตรงกัน
- อาหารเริ่มต้นคำนวณจากคนที่สุ่มจริง พร้อมเผื่ออาหารเสียให้ผ่านอย่างน้อย 6 เดือนโดยไม่หาอาหารเพิ่ม
- วัตถุดิบเริ่มต้นสร้างที่พัก 3 หลัง กองไฟ 1 และคลังอาหาร 1 ได้จริง
- เริ่มก่อสร้างแล้วหักวัตถุดิบทันที พักโครงการแล้วกลับมาทำต่อไม่หักซ้ำ
- วัตถุดิบก่อสร้างและของที่ขาดแสดงชื่อภาษาไทย พร้อมวิธีหา
- สิ่งก่อสร้างและงานวิจัยของยุคอนาคตถูกซ่อนจนกว่าจะถึงยุค
- หน้าทรัพยากรมีคู่มือแบบเปลี่ยนตามเซฟปัจจุบัน
- ตัวกรองคนซ่อนหมวดที่มีจำนวน 0 และแยกป่วย บาดเจ็บ และเป็นทั้งสองสถานะ
- แถวรายบุคคลถูกย่อในแนวตั้ง แต่ยังคงชื่อ สถานะ คุณลักษณะ งาน และช่องเลือกงาน
- ระบบสัตว์ตรวจงานวิจัย คู่พันธุ์ อาหาร น้ำ สุขภาพ คอก และเส้นทางการได้สัตว์จริง

รายละเอียดทั้งหมดอยู่ใน `AUDIT_REPORT_v0935.md` และ `QUALITY_CHECK.md`
