# Evolution of Us — รุ่นทดสอบ v0.9.40

Narrative & Interface Polish

## สิ่งที่แก้

- รายงานจบเดือนไม่แสดงคำเตือนขั้นตอนการเลือกผู้นำ/เหตุการณ์
- นำข้อความ “คำนวณผลจริงตามความถนัด” ออกจากแถวคน
- ปรับแถบสถานะด้านบนเป็นสองระดับ
- แก้ช่องเลือกงานแบบกลุ่มที่ข้อความถูกตัด
- เพิ่มพงศาวดารฉบับเต็มในหน้าจบเกม
- ปรับ Event Generator ให้ทางเลือกสอดคล้องกับเหตุการณ์และแสดงผลจริง

## ติดตั้ง

แตก ZIP ไว้นอกโฟลเดอร์โครงการ แล้วรัน:

```powershell
powershell -ExecutionPolicy Bypass `
  -File ".\apply-v0940-narrative-interface-polish.ps1" `
  -ProjectPath "C:\Users\phass\evolution-of-us"
```

## เปิดเกม

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run dev
```

เปิด `http://localhost:3000/game`

## อัปขึ้น GitHub / Vercel

```powershell
git status
git add -A
git commit -m "update v0.9.40 narrative and interface polish"
git push
```

## ตรวจระบบด้วยตนเอง

```powershell
npm run check
```
