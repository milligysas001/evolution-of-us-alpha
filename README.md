# Evolution of Us — รุ่นทดสอบ v0.9.38 Balance & UX

เวอร์ชันนี้ต่อยอดจาก v0.9.37 Stabilization โดยเน้นความสมดุล การจัดแรงงานจำนวนมาก การอ่านรายงานจบเดือน จังหวะเหตุการณ์ และการสำรวจพื้นที่แบบค่อย ๆ ค้นพบ

## จุดสำคัญ

- ระดับความยาก 4 ระดับ
- เด็กอายุ 8–15 ปีช่วยงานได้ที่กำลัง 50% เมื่อมีผู้ใหญ่ทำงานเดียวกัน
- จัดแรงงานหลายคนพร้อมกันและล้างงานทั้งหมดจากปุ่มจัดตามความถนัด
- การ์ดก่อสร้างแสดงเฉพาะวัตถุดิบที่ต้องใช้ พร้อมไฮไลต์สีแดงเมื่อไม่พอ
- รวมความเสี่ยง แนวโน้มเดือนหน้า และคำเตือนก่อนจบเดือนไว้ในแท็บข่าวสาร
- แผนที่แสดงเฉพาะพื้นที่ที่พบจากภูมิประเทศ เหตุการณ์ ข่าวลือ หรือการสำรวจ
- Event Pacing ลดเหตุการณ์หมวดเดิมที่เกิดซ้ำถี่
- รายงานจบเดือนแสดงสถานะก่อน–หลังและเหตุผลการเปลี่ยนแปลง
- Save Migration รุ่น 4 รองรับบันทึกเก่า

## ติดตั้ง

แตกไฟล์ ZIP ลงในโฟลเดอร์แยกจากโครงการเดิม แล้วรัน PowerShell:

```powershell
powershell -ExecutionPolicy Bypass `
  -File ".\apply-v0938-balance-ux.ps1" `
  -ProjectPath "C:\Users\phass\evolution-of-us"
```

ตัวติดตั้งจะสำรองโครงการเดิม ติดตั้งแพ็กเกจ และรันการตรวจทั้งหมด

## เปิดเกม

```powershell
cd "C:\Users\phass\evolution-of-us"
npm run dev
```

เปิด `http://localhost:3000/game`

## ตรวจระบบด้วยตนเอง

```powershell
npm run typecheck
npm run check:data
npm test
npm run audit:systems
npm run build
```

หรือรันทั้งหมดด้วย:

```powershell
npm run check
```

## อัปขึ้น GitHub / Vercel

```powershell
git add -A
git commit -m "update v0.9.38 balance and UX"
git push
```

## เอกสาร

- `AUDIT_REPORT_v0938.md`
- `AUDIT_RESULT_v0938.txt`
- `QUALITY_CHECK.md`
- `docs/CHANGELOG_v0938.md`
- `docs/QUALITY_CHECK_v0938.md`
