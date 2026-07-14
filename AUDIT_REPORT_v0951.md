# Evolution of Us v0.9.51 — Integrity, Recovery & Performance Audit

วันที่ตรวจ: 14 กรกฎาคม 2026

## ภาพรวม

เวอร์ชันนี้แก้จุดเสี่ยงที่พบจากการตรวจ v0.9.50 โดยเน้นความถูกต้องของรอบเดือน การบันทึก การกู้คืน Event Runtime, Ledger และประสิทธิภาพเมื่อประชากรเพิ่มขึ้น ไม่มีการเพิ่มระบบเกมใหญ่ใหม่

## 1. Save และ Recovery

- Save Schema เพิ่มเป็นรุ่น 8
- Autosave, Manual Save และไฟล์ Export ใช้ Save Envelope + Checksum รูปแบบเดียวกัน
- เก็บ `summaryModal` และข้อมูลรายงานจบเดือนลงใน Save
- Save ระหว่างหน้า Report จะกลับมาเปิดรายงานเดิมก่อนเริ่มเดือนใหม่
- Save ที่ค้างใน Resolving จะกู้กลับสู่ Ready ไม่ล็อกเกมถาวร
- Autosave Backup หมุนเวียนสูงสุด 5 จุด
- ลองกู้ตามลำดับ: บันทึกล่าสุด → Backup หมุนเวียน → Backup รุ่นเก่า
- ตรวจช่อง Manual Save ที่ Checksum เสียและแจ้งในหน้าตั้งค่า
- จำกัดข้อมูลนำเข้าไม่เกิน 5 MB
- แจ้งเตือนเมื่อ `localStorage` เต็มหรือ Autosave เขียนไม่สำเร็จ

## 2. Monthly Flow

สถานะเดือนที่ใช้งานจริง:

`planning → decision → ready → resolving → report`

- Phase ถูกคำนวณจากการกระทำผู้นำและคำตอบ Event จริง
- ใช้ Resolution ID ป้องกันการคำนวณเดือนเดียวกันซ้ำ
- เก็บประวัติเดือนที่คำนวณแล้ว 36 เดือน
- หยุด Autosave ระหว่าง Resolving
- ต้องปิดรายงานเดือนเดิมก่อนวางแผนเดือนใหม่

## 3. Transaction Ledger

- การกระทำของผู้เล่นที่เปลี่ยนทรัพยากรหรือค่าสภาพเมืองถูกจับเป็น State Diff Ledger
- การคำนวณจบเดือนใช้ Ledger เดือนเดียวกันและปิดบัญชีหนึ่งครั้ง
- เก็บรายการเดือนปัจจุบันสูงสุด 500 รายการ
- เก็บประวัติย้อนหลัง 48 เดือน
- รายงานสามารถแยกที่มา ระบบ เหตุผล Phase และ Resolution ID

ข้อจำกัดที่ยังตั้งใจคงไว้: สูตรเกมเก่าบางส่วนยังคำนวณภายใน `app/game/page.tsx` แล้ว Ledger จับผลต่างก่อน–หลัง แทนการเรียก Transaction Service โดยตรงทุกบรรทัด วิธีนี้ลดความเสี่ยง Regression ในแพตช์นี้ แต่ควรย้ายสูตรทีละระบบในรอบ Refactor ใหญ่ภายหลัง

## 4. Event Integrity

ตรวจ Runtime จริง ไม่ใช่เฉพาะ JSON ตัวอย่าง:

- Event: 338
- Choice: 1,017
- Event Error: 0
- Event Warning: 0
- ทดลองใช้ Choice ครบ 1,017 รายการ
- ตรวจ ID ซ้ำ, Choice ว่าง, Effect ว่าง, Resource/Metric/Path/Risk ID, Follow-up Event, Delayed Event และข้อความที่บอกต้นทุนแต่ไม่มีผลจริง
- แก้ Choice `ignore_clay` ให้เกิดผลด้านขวัญและเส้นทางเอาตัวรอดจริง

## 5. Runtime Data กับ Portable JSON

แก้ปัญหาจำนวนข้อมูลไม่ตรงกันโดยกำหนดบทบาทให้ชัดเจน:

- Runtime Source of Truth: `app/game/page.tsx`, `engine/`, `save/`
- Portable JSON: ข้อมูลอ้างอิงและร่างสำหรับย้ายระบบ
- Runtime Manifest: `data/game/runtime-manifest.json`

จำนวน Runtime:

- สิ่งก่อสร้าง 31
- งานวิจัย 41
- Event 338
- Choice 1,017

ไม่ได้อ้างว่า JSON ตัวอย่าง 7 สิ่งก่อสร้าง / 8 งานวิจัย / 2 Event เป็นข้อมูลเกมครบชุดอีกต่อไป

## 6. Economy, Workforce และ Performance

- เด็ก 8–15 ปีมีกำลัง 50% และต้องมีผู้ใหญ่ในงานเดียวกัน
- ตรวจคนถูกจัดซ้ำหลายงาน
- รายชื่อคนค้นหาตามชื่อ บทบาท และคุณลักษณะ
- เรียงตามความเร่งด่วน ชื่อ ความล้า หรือสุขภาพ
- แบ่งหน้า 40 คน ลดการ Render รายชื่อทั้งหมดพร้อมกัน
- Autosave Debounce 1.6 วินาที
- Backup และ Leader Board อัปเดตเฉพาะ Checkpoint สำคัญ

## 7. Security และ Developer Tools

- ลบรหัสผู้พัฒนา `248655` ออกจาก Client
- เครื่องมือภายในถูก Render เฉพาะ Development Build
- Import Save สำหรับผู้เล่นถูกย้ายออกจากเครื่องมือนักพัฒนาไปอยู่ในระบบบันทึกปกติ

## 8. Balance และ Long-run Tests

Core Stress Model 18 เดือน กลยุทธ์สมดุล:

- เน้นเรื่องราว: 100.0%
- สมดุล: 96.8%
- เอาชีวิตรอด: 41.0%
- ท้าทายสูงสุด: 6.4%

ตัวเลขนี้ใช้ตรวจลำดับความยากและ Regression ของแกนคำนวณเท่านั้น ไม่ใช่การรับรองอัตรารอดของการเล่นจริงทุก Event

Long-run Sandbox:

- 100 ปีในเกม
- 1,200 เดือน
- Resolution ไม่ซ้ำ
- ผ่านเกณฑ์เวลา 5 วินาที

## 9. ผลตรวจอัตโนมัติ

- TypeScript: ผ่าน
- JSON Reference + Runtime Manifest: ผ่าน
- Unit/Integration Tests: 31/31
- Runtime Event Audit: ผ่าน
- Runtime Buildings/Research Audit: 31/41
- Animal no-pair simulations: 120 รอบ
- Production Build: ผ่าน
- Route Smoke Test `/` และ `/game`: HTTP 200
- Dependency Audit: 0 ช่องโหว่

## 10. ข้อจำกัดการตรวจ UI

Production Route ถูกทดสอบจริงผ่าน Next Server แล้ว แต่ Chromium ในสภาพแวดล้อมนี้ถูกจำกัดสิทธิ์ด้าน DBus/Netlink และไม่สามารถทำ Screenshot E2E ได้อย่างเสถียร จึงไม่อ้างว่าผ่านการตรวจภาพทุกความกว้าง 100% หลังติดตั้งควรเปิด Chrome จริงตรวจ Desktop, Tablet และ Mobile รอบสุดท้าย

## 11. งานโครงสร้างที่ไม่ควรรวมใน Patch นี้

ไฟล์ `app/game/page.tsx` ยังมีขนาดใหญ่ การย้าย Event 338 ตัว สูตรเศรษฐกิจทั้งหมด และ View ทุกหน้าออกพร้อมกันมีความเสี่ยงสูงต่อ Save และ Gameplay Regression แพตช์นี้จึงแยกเฉพาะแกนที่จำเป็นและเพิ่ม Runtime Audit ครอบไว้ก่อน การ Refactor ต่อควรทำแบบโมดูลต่อโมดูลพร้อม Golden Save Test ไม่ควรย้ายทั้งไฟล์ในครั้งเดียว
