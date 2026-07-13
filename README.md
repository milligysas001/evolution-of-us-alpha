# Evolution of Us v0.9.22 — Long Run Balance & Personal Choice Patch

อัปเดตนี้เน้นแก้ flow ระยะยาวก่อนเพิ่มระบบใหญ่: แรงงานรายชื่อเป็นแหล่งข้อมูลหลัก, หน้าต่างคัดผู้มาใหม่เลือกทีละคนได้, สัตว์เลี้ยงสัมพันธ์กับคอก/อาหารหยาบ/วิจัยมากขึ้น และ notification ไม่รบกวน flow การเล่น

## ติดตั้ง

```powershell
cd "C:\Users\phass\Desktop\game\New folder (2)"
powershell -ExecutionPolicy Bypass -File .\apply-v0922-long-run-balance.ps1
```

## ตรวจสอบ

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run check
```

## Deploy

```powershell
git add -A
git commit -m "update v0.9.22 long run balance"
git push
```

## จุดเปลี่ยนสำคัญ

- แก้ helper `skillIcon` ถาวร
- ระบบแรงงานใช้การจัดคนรายชื่อเป็นแหล่งความจริงหลัก ไม่ fallback เป็นตัวเลขเก่า
- หน้าต่างผู้ลี้ภัย/ผู้อพยพเลือกทีละคนด้วย checkbox ได้
- ค่าอาหาร/น้ำ/ความเสี่ยงของผู้มาใหม่คำนวณตามคนที่รับจริง
- อาหารสัตว์สัมพันธ์กับคอกสัตว์และวิจัย: มีคอกแล้วผลิตอาหารหยาบได้ แต่วิจัยอาหารสัตว์ยังจำเป็นสำหรับระยะยาว
- หน้าก่อสร้าง/วิจัยมีปุ่มพาไปจัดทีมในแท็บคน
- เพิ่ม filter คนว่าง/มีงานแล้ว/ป่วย-เจ็บ ในหน้าแรงงาน
- Event สำคัญยังอยู่ในกระดิ่ง/แถบเตือน ไม่บังคับเด้งกลางจอยกเว้นผู้เล่นกดเปิดเอง
