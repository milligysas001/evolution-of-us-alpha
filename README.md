# Evolution of Us — Alpha v0.9.36

เวอร์ชันนี้เพิ่มระบบบันทึก 3 ช่องและกู้ Autosave, Leader Board ตระกูล, การแยกข่าว/พ่อค้า/การค้า, เมืองข้างเคียงแบบ Interactive และระบบทหารที่เปิดตามยุค พร้อมตรวจ Flow และ Regression อัตโนมัติ

## ติดตั้งลงโครงการเดิม

ไฟล์ ZIP ต้องถูกแตกออกก่อน เช่นอยู่ที่:

```text
C:\Users\phass\Desktop\game\New folder (2)
```

หยุด `npm run dev` ด้วย `Ctrl + C` แล้วเปิด PowerShell:

```powershell
cd "C:\Users\phass\Desktop\game\New folder (2)"
powershell -ExecutionPolicy Bypass -File .\apply-v0936-save-leaderboard-neighbors-military.ps1 -ProjectPath "C:\Users\phass\evolution-of-us"
```

ตัวติดตั้งจะสำรองโครงการเดิมเป็นโฟลเดอร์ชื่อประมาณ:

```text
C:\Users\phass\evolution-of-us_backup_before_v0936_YYYYMMDD_HHMMSS
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
git commit -m "update v0.9.36 save leaderboard neighbors military"
git push
```

## จุดสำคัญของเวอร์ชันนี้

- Autosave พร้อมสำรองก่อนข้ามเดือน
- บันทึกด้วยตนเอง 3 ช่องและโหลดจากหน้าแรก
- ดาวน์โหลด/นำเข้าไฟล์เซฟ JSON
- Leader Board ตระกูลในหน้าตั้งค่า
- แยกข่าวสาร พ่อค้าเร่ และการค้าถาวร
- เมืองข้างเคียง ความสัมพันธ์ การค้า ชายแดน พันธมิตร และสงคราม
- ระบบทหารซ่อนในยุคแรก เปิดด้วยงานวิจัยและมีค่าเลี้ยงดูจริง
- แถวจัดแรงงานประหยัดพื้นที่มากขึ้น

รายละเอียดทั้งหมดอยู่ใน `AUDIT_REPORT_v0936.md` และ `QUALITY_CHECK.md`
