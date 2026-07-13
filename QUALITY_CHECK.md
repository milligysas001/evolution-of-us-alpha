# Evolution of Us v0.9.14 — Stability Refactor Foundation

สิ่งที่แก้ในแพ็กนี้

- ใช้ save key กลาง `eou-current-save` และ setup key กลาง `eou-current-setup`
- migrate save/setup เก่าจาก v0.9.7–v0.9.13 อัตโนมัติ
- หน้า `/game` ไม่เด้งกลับหน้าแรกทันทีเมื่อ setup หาย แต่สร้างค่าเริ่มต้นให้เข้าเกมได้
- หน้าแรกเขียน setup ให้ทั้ง key ใหม่และ legacy key เพื่อกันระบบเก่าค้าง
- `tsconfig.json` ถูกเขียนเป็น JSON สะอาด ไม่มี BOM และ exclude backup
- `.gitignore` กัน backup/zip/build folders ไม่ให้ติด Git
- apply script สำรองไฟล์ไว้นอกโปรเจกต์ที่ `%USERPROFILE%\eou_project_backups` ไม่สร้าง backup ในโปรเจกต์อีก
- แก้ type ของ `Rumor.danger` ให้ไม่ fail จาก string literal
- เพิ่ม npm scripts สำหรับตรวจ build และ deploy แบบสั้น

คำสั่งตรวจหลัง apply:

```powershell
npm run build
```

ถ้าผ่านแล้ว push:

```powershell
git add -A
git commit -m "update v0.9.14 stability refactor"
git push
```
