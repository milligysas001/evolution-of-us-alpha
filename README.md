# Evolution of Us v0.9.51

**Integrity, Recovery & Performance Patch**

เกมบริหารชุมชนและตระกูลแบบรายเดือน พัฒนาจากค่ายพักแรมไปสู่อาณาจักร พร้อมระบบประชากร แรงงาน Event ก่อสร้าง วิจัย การสำรวจ สัตว์ การค้า เมืองข้างเคียง ทหาร ราชวงศ์ ชัยชนะ และพงศาวดาร

## คำสั่งหลัก

```bash
npm ci
npm run dev
npm run verify
```

`npm run verify` ตรวจ TypeScript, Runtime Manifest, JSON Reference, Unit/Integration Tests, Event Runtime, Balance Stress Model, Production Build และ Route Smoke Test

## ข้อมูล Runtime กับ JSON

- เกมใช้งานข้อมูลจาก `app/game/page.tsx`, `engine/` และ `save/`
- `data/game/*.json` เป็นข้อมูลอ้างอิงสำหรับตรวจสอบและการย้ายระบบ
- `data/game/runtime-manifest.json` แสดงจำนวนข้อมูลที่ Runtime ใช้จริง

## บันทึกเกม

- Save Schema: 8
- Manual Save 3 ช่องพร้อม Checksum
- Autosave และสำรองหมุนเวียน 5 จุด
- รองรับ Migration จากบันทึกรุ่นก่อนหน้า
- ดาวน์โหลดและนำเข้า JSON ได้จากหน้าตั้งค่า

อ่านรายละเอียดที่ `docs/CHANGELOG_v0951.md`
