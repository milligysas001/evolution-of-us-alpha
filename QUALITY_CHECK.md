# Quality Check — Evolution of Us v0.9.37

## คำสั่งตรวจทั้งหมด

```powershell
npm run check
```

## ผลล่าสุด

| รายการ | ผล |
|---|---|
| TypeScript `tsc --noEmit` | ผ่าน |
| JSON และ Data Schema | 38 ไฟล์ผ่าน |
| Unit Tests | 10/10 ผ่าน |
| Seed Determinism | เปรียบเทียบ 500 ค่า ตรงกัน |
| RNG Resume จาก Save State | ผ่าน |
| Save Migration | Direct Save รุ่นเก่า → Schema 3 ผ่าน |
| Save Checksum | ตรวจจับการแก้ไขไฟล์ได้ |
| Monthly Pipeline Trace | ผ่าน |
| Production Build | ผ่าน |
| HTTP Smoke Test | `/` และ `/game` ตอบกลับ 200 |
| Dependency Audit | 0 ช่องโหว่ |
| สุ่มเกมใหม่ | 250 รอบผ่าน |
| จำนวนคนเริ่มต้น | 15 ทุกครั้ง |
| อาหารเริ่มต้นต่ำสุด | ประมาณ 8.7 เดือนก่อนผลิตเพิ่ม |
| ชุดก่อสร้างเริ่มต้น | ที่พัก 3 + กองไฟ 1 + คลัง 1 และไม้เหลืออย่างน้อย 6 |
| สิ่งก่อสร้าง | 31 รายการ |
| งานวิจัย | 41 รายการ |
| Event | 338 รายการ |
| Choice | 1,017 ตัวเลือก |
| สัตว์ไม่มีคู่แต่สั่งขยายฝูง | 120 รอบ ไม่ออกลูก |

## Stabilization Flow

1. Game State ทุกการเปลี่ยนผ่าน `runSeededTransition`
2. RNG State ถูกอ่านจากเซฟก่อนคำนวณ และบันทึกกลับหลังคำนวณ
3. จบเดือนผ่าน Monthly Pipeline 12 Phase ตามลำดับตายตัว
4. Autosave ถูกห่อด้วย Save Envelope และ Checksum
5. โหลดเซฟ → ตรวจ Checksum → Migration → Normalize → Schema Validation
6. ถ้า Autosave ล่าสุดเสีย ระบบลอง Backup ก่อนหน้าโดยอัตโนมัติ
7. JSON Content ถูกตรวจ ID, ต้นทุน และ Resource Reference
8. Regression Audit เดิมยังต้องผ่านก่อน Production Build
