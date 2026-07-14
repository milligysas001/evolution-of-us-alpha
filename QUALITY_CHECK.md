# Evolution of Us v0.9.51 — Quality Check

รันคำสั่งเดียว:

```bash
npm run verify
```

เกณฑ์ผ่าน:

- TypeScript ผ่าน
- Runtime Manifest ตรงกับ Game Version 0.9.51 และ Save Schema 8
- JSON Reference อ่านได้ครบ
- Unit/Integration Test ผ่านทั้งหมด
- Runtime Event Audit: 338 Event / 1,017 Choice / 0 Error / 0 Warning
- สิ่งก่อสร้าง 31 รายการและงานวิจัย 41 รายการผ่านเงื่อนไขยุค
- Save Report, Manual Checksum และ Backup Ring ผ่าน
- Headless 100-year Sandbox ผ่าน 1,200 เดือน
- Production Build ผ่าน
- หน้า `/` และ `/game` ตอบ HTTP 200

หมายเหตุ: Chromium ของสภาพแวดล้อมตรวจอัตโนมัติอาจถูกจำกัดสิทธิ์ จึงให้ `e2e:smoke` ตรวจ Production Server ผ่าน HTTP เป็นค่าเริ่มต้น หากเครื่องมี Chromium ที่ใช้งานได้ ให้รัน `BROWSER_E2E=1 npm run e2e:smoke` เพื่อสร้างภาพ Desktop/Mobile เพิ่มเติม
