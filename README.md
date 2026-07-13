# Evolution of Us v0.9.18 — Resource Flow, Justice Events & Migration Selection

เวอร์ชันนี้เน้นปรับ flow ให้ผู้เล่นอ่านภาพรวมง่ายขึ้น และเพิ่มระบบสมจริงด้านการตัดสินใจในค่าย

## เพิ่ม/แก้หลัก
- บัญชีทรัพยากรแบบย่อในแถบด้านข้าง: แสดง `คงเหลือ +/− สุทธิเดือนนี้`
- หน้าเมืองเปลี่ยนบัญชีทรัพยากรจากตารางยาวเป็นการ์ดอ่านเร็ว
- ซ่อนเครื่องมือ Debug/Test หลังรหัสผู้พัฒนา `248655`
- พื้นหลังเริ่มต้นแสดงเป็นบัฟที่ส่งผลจริงในระบบ เช่น ช่าง/พราน/ผู้รักษา/ผู้จดจำ/ผู้ไกล่เกลี่ย
- เพิ่ม event ขโมยเสบียง พร้อมบทลงโทษ: สอบสวน, ขัง/ทำงานชดใช้, เนรเทศ, ให้อภัยพร้อมแก้กฎ
- เพิ่ม event กลุ่มผู้ลี้ภัย 1–10 คน พร้อม preview รายคน และตัวเลือกนโยบายรับคน
- event สำคัญ เช่น พ่อค้า อพยพ โจร ขโมยเสบียง จะเด้ง modal กลางจออัตโนมัติ
- หน้าเริ่มเกมปรับเป็น story/prologue มากขึ้น ลดคำอธิบายเชิงระบบ
- เพิ่ม data portable สำหรับ Godot: `justice.json`, `migration.json`

## ติดตั้ง
```powershell
cd "C:\Users\phass\Desktop\game\New folder (2)"
powershell -ExecutionPolicy Bypass -File .\apply-v0918-resource-justice-migration.ps1
```

## ตรวจสอบ
```powershell
cd "C:\Users\phass\evolution-of-us"
npm run check
```

## Deploy ผ่าน GitHub/Vercel
```powershell
git add -A
git commit -m "update v0.9.18 resource justice migration"
git push
```
