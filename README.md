# Evolution of Us v0.9.25 — Dark Mode, Map Consequences & Livestock Expansion

อัปเดตนี้แก้บัค Dark Mode, ปรับกราฟทรัพยากรให้เป็นกราฟเส้นรวม, ลบข้อความแนวผู้พัฒนาออกจากหน้าผู้เล่น, ทำให้การสำรวจแผนที่ส่งผลกับระบบเกมมากขึ้น, ปรับสีความเสี่ยง และขยายระบบสัตว์เลี้ยงให้มีวัว/หมูพร้อมผลต่ออาหาร น้ำ ความปลอดภัย และเหตุการณ์ในค่าย

## ติดตั้ง
```powershell
cd "C:\Users\phass\Desktop\game\New folder (2)"
powershell -ExecutionPolicy Bypass -File .\apply-v0925-darkmode-map-animals.ps1
```

## ตรวจ build
```powershell
cd "C:\Users\phass\evolution-of-us"
npm run check
```

## Deploy
```powershell
git add -A
git commit -m "update v0.9.25 darkmode map animals"
git push
```
