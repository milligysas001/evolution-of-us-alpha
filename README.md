# Evolution of Us — Alpha v0.9.37 Stabilization

เวอร์ชันนี้เน้นทำให้ระบบเดิมมั่นคงก่อนเพิ่ม Content ใหม่ โดยแยก Game Engine ส่วนสำคัญ เพิ่มระบบสุ่มแบบ Seed, Save Migration, Schema Validation, Checksum และชุดทดสอบ Regression ครบทั้งระบบเดิม

## ติดตั้งลงโครงการเดิม

แตก ZIP ไว้ที่:

```text
C:\Users\phass\Desktop\game\New folder (2)
```

หยุด `npm run dev` ด้วย `Ctrl + C` แล้วเปิด PowerShell:

```powershell
cd "C:\Users\phass\Desktop\game\New folder (2)"
powershell -ExecutionPolicy Bypass -File .\apply-v0937-stabilization.ps1 -ProjectPath "C:\Users\phass\evolution-of-us"
```

ตัวติดตั้งจะสำรองโครงการเดิมเป็น:

```text
C:\Users\phass\evolution-of-us_backup_before_v0937_YYYYMMDD_HHMMSS
```

## ตรวจระบบ

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run check
```

คำสั่งเดียวจะตรวจ:

- TypeScript
- JSON และ Data Schema
- Unit Tests
- Regression Audit ของระบบเดิม
- Seed / Save Migration / Checksum / Monthly Pipeline
- Production Build

เปิดเกม:

```powershell
npm run dev
```

```text
http://localhost:3000/game
```

## สิ่งที่เปลี่ยนใน v0.9.37

- แยก `engine/random.mjs`, `engine/transition.mjs`, `engine/monthly-pipeline.mjs`
- ลบ `Math.random()` จากหน้าเกมทั้งหมด
- เก็บ Seed และ RNG State ลงในไฟล์เซฟ
- Seed เดียวกันให้ลำดับผลสุ่มเหมือนกัน
- เพิ่ม Save Envelope และ `schemaVersion: 3`
- เพิ่ม Checksum ตรวจเซฟเสียหรือถูกแก้ไข
- รองรับ Migration เซฟเก่าแบบ Direct JSON
- Autosave ล่าสุดเสียจะลองกู้ Backup ก่อนหน้าอัตโนมัติ
- ตรวจ Schema ของเซฟก่อนโหลด
- ตรวจ JSON ต้นทุนสิ่งก่อสร้างและ Resource Reference
- เพิ่ม Unit Tests 10 รายการ
- คง Regression Audit เดิม: 250 เกมเริ่มต้น, 338 Events, 1,017 Choices
- ล็อกเวอร์ชัน Dependency ไม่ใช้ `latest`, `^` หรือ `~`

## GitHub / Vercel

หลังทดสอบแล้ว:

```powershell
git status
git add -A
git commit -m "update v0.9.37 stabilization"
git push
```

รายละเอียดอยู่ใน `AUDIT_REPORT_v0937.md`, `AUDIT_RESULT_v0937.txt`, `docs/CHANGELOG_v0937.md` และ `docs/QUALITY_CHECK_v0937.md`
