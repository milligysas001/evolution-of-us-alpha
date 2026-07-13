# Evolution of Us v0.9.17 — Named Labor, Age Realism & Terrain Start

เวอร์ชันนี้เพิ่มระบบที่ทำให้คนในค่ายมีความหมายขึ้นจริง และเตรียมข้อมูลต่อยอดไป Godot ต่อไป

## สิ่งที่เพิ่ม

- จัดแรงงานรายบุคคลในแท็บ **คน**
- คนแต่ละคนมีผลจาก skill/passive ต่อผลงาน เช่น ช่างไม้ตัดไม้/ก่อสร้างดีกว่า คนช่างสังเกตเหมาะกับสายข่าว/ลาดตระเวน
- ระบบอายุทำงานใหม่:
  - ต่ำกว่า 12 ปี ทำงานไม่ได้
  - อายุ 12–14 ปี ช่วยงานได้ครึ่งเดียว และต้องมีผู้ใหญ่ทำงานเดียวกัน
  - อายุ 15–59 ปี ทำงานเต็มกำลัง
  - อายุ 60+ ทำงานได้ครึ่งหนึ่ง
- ระบบกินอาหารตามวัยและ passive:
  - เด็กกินน้อยกว่า
  - วัยรุ่น/ผู้ใหญ่กินกลาง
  - ผู้สูงอายุกินน้อยลง
  - passive `กินจุ` เพิ่มการบริโภค
- ระบบสุ่มพื้นที่เริ่มต้น เช่น ริมลำธาร ชายป่า แอ่งหิน ทุ่งโล่ง หนองน้ำ เนินสูง
- พื้นที่เริ่มต้นมีผลต่ออาหาร ไม้ หิน น้ำ โรค สัตว์ป่า และอากาศ
- Event สำคัญเด้งเป็น modal กลางจอ และมีปุ่มกระดิ่งแจ้งเตือนขวาบน
- ย้าย **จัดแรงงานรายเดือน** ไปอยู่แท็บ **คน**
- เพิ่ม portable data สำหรับ Godot:
  - `data/game/terrain.json`
  - `data/game/people_passives.json`

## วิธีติดตั้ง

```powershell
cd "C:\Users\phass\Desktop\game\New folder (2)"
powershell -ExecutionPolicy Bypass -File .\apply-v0917-named-labor-terrain.ps1
```

## ตรวจ build

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run check
```

## Deploy

```powershell
git add -A
git commit -m "update v0.9.17 named labor terrain"
git push
```
