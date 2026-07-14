# Evolution of Us v0.9.34

**Detailed Bug, Event & Thai Wording Audit**

เวอร์ชันนี้ตรวจระบบตั้งแต่การจัดแรงงาน การพักฟื้น เหตุการณ์ การรักษา การเกิด ประชากรย้ายเข้า รายงานจบเดือน และการบันทึกอัตโนมัติ พร้อมปรับข้อความภาษาไทยให้ชัดเจนและสอดคล้องกันทั้งเกม

## ติดตั้ง/อัปเดต

แตกไฟล์ ZIP แล้วเปิด PowerShell ในโฟลเดอร์ที่แตกไฟล์ จากนั้นรัน:

```powershell
powershell -ExecutionPolicy Bypass -File .\apply-v0934-detailed-audit.ps1
```

ค่าเริ่มต้นจะอัปเดตโครงการที่:

```text
C:\Users\phass\evolution-of-us
```

กำหนดโฟลเดอร์อื่นได้ด้วย:

```powershell
powershell -ExecutionPolicy Bypass -File .\apply-v0934-detailed-audit.ps1 -ProjectPath "D:\Projects\evolution-of-us"
```

สคริปต์จะสำรองไฟล์โครงการเดิมก่อนคัดลอกเวอร์ชันใหม่

## ตรวจระบบหลังติดตั้ง

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run typecheck
npm run check:data
npm run build
npm audit --audit-level=moderate
```

## ทดลองเล่นในเครื่อง

```powershell
npm run dev
```

จากนั้นเปิด `http://localhost:3000/game`

## อัปขึ้น Vercel

```powershell
git add -A
git commit -m "update v0.9.34 detailed audit"
git push
```

## เอกสารตรวจสอบ

- `AUDIT_REPORT_v0934.md` — รายงานตรวจระบบฉบับละเอียด
- `docs/CHANGELOG_v0934.md` — รายการแก้ไขตามหมวด
- `docs/QUALITY_CHECK_v0934.md` — ผลทดสอบและขอบเขตที่ตรวจ
- `data/game/v0934_detailed_audit.json` — สรุปข้อมูลเวอร์ชันสำหรับอ้างอิง/พอร์ตระบบ

> หมายเหตุ: ไฟล์ใน `data/game` เป็นข้อมูลอ้างอิงและเตรียมพอร์ตในอนาคต ส่วนกลไกเกมเว็บปัจจุบันยังทำงานจาก `app/game/page.tsx`
