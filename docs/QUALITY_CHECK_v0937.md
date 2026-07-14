# Quality Check v0.9.37

คำสั่งตรวจระบบทั้งหมด:

```powershell
npm ci
npm run check
```

ขั้นตอนที่รวมอยู่ใน `npm run check`:

1. TypeScript (`tsc --noEmit`)
2. ตรวจ JSON และ Schema ของข้อมูลเกม
3. Unit Tests ด้วย Node Test Runner
4. Regression Audit ของ v0.9.36
5. Stabilization Audit ของ v0.9.37
6. Next.js Production Build

ผลตรวจชุดที่จัดส่ง:

- TypeScript: PASS
- Data JSON: 38 ไฟล์ PASS
- Unit Tests: 10/10 PASS
- Legacy Audit: PASS
- Stabilization Audit: PASS
- Production Build: PASS
- npm audit: 0 vulnerabilities
