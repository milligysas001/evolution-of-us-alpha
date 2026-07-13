# Evolution of Us v0.9.14 — Stability Refactor Foundation

อัปเดตนี้เน้นทำให้ฐานเกมเสถียรขึ้นก่อนเพิ่มระบบใหญ่ต่อไป โดยแก้ปัญหา build/deploy/save ที่เจอซ้ำในช่วง Alpha Test

## ติดตั้ง

```powershell
cd "C:\Users\phass\Desktop\game\New folder (2)"
powershell -ExecutionPolicy Bypass -File .\apply-v0914-stability-refactor.ps1
```

## ตรวจ build

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run build
```

## อัปขึ้น Vercel ผ่าน GitHub

```powershell
git add -A
git commit -m "update v0.9.14 stability refactor"
git push
```
