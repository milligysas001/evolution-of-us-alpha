# Evolution of Us v0.9.33

Recovery · Leader Effects · 15 Settlers

## ติดตั้ง

```powershell
cd "C:\Users\phass\Desktop\game\New folder (2)"
powershell -ExecutionPolicy Bypass -File .\apply-v0933-recovery-leader-population.ps1
```

สคริปต์จะสำรองโฟลเดอร์ `app` เดิม คัดลอกไฟล์เวอร์ชันใหม่ และติดตั้ง dependency ที่ล็อก TypeScript ให้เข้ากับ Next.js

## ตรวจระบบ

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run typecheck
npm run check
```

## อัปขึ้น Vercel

```powershell
git add -A
git commit -m "update v0.9.33 recovery leader effects population"
git push
```

## สิ่งที่เปลี่ยนใน v0.9.33

- ย้ายสถานะงาน/ตัวเลือกงานไปคอลัมน์ขวาของรายชื่อคน
- แสดงภาพรวมการพักของหมู่บ้านและแยกผลพักกลางแจ้ง/กองไฟ/ที่พัก
- เกมใหม่เริ่มด้วยคนสุ่ม 15 คน
- ผลการเลือกเหตุการณ์และการกระทำผู้นำแสดงเป็นค่าที่เปลี่ยนจริงในรายงานจบเดือน
- ปรับเวลาก่อสร้างช่วงต้นเกม โดยกองไฟและที่พักชั่วคราวสร้างเร็วขึ้น
- การรักษาใช้สมุนไพรตามจำนวนผู้ป่วยที่ได้รับการดูแลจริง
