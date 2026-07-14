# Evolution of Us v0.9.50 — Core Integration & Final Alpha

## Checkpoint 1 — Monthly Flow และ Ledger
- เพิ่มสถานะรอบเดือนแบบตายตัว: planning → resolving → report → planning
- ป้องกันการคำนวณเดือนเดิมซ้ำด้วย resolution ID และ resolved month key
- กู้สถานะที่ค้างระหว่าง resolving กลับเป็น ready เมื่อโหลดบันทึก
- ปิดบัญชีทรัพยากรรายเดือนจาก Engine Trace และเก็บย้อนหลัง 48 เดือน
- รายงานจบเดือนสร้างจากผลต่างจริงของทรัพยากรและค่าสภาพเมือง

## Checkpoint 2 — Event Integrity
- เพิ่ม Event Validator สำหรับ Event ID, Choice ID, ทางเลือกที่ไม่มีผล และการอ้าง Event ต่อเนื่องที่หายไป
- ตรวจ Event Runtime หนึ่งครั้งเมื่อเปิดเกมและบันทึกสถานะการตรวจ
- Event pacing เดิมยังทำงานร่วมกับ Seed และประวัติหมวดเหตุการณ์

## Checkpoint 3 — เศรษฐกิจและแรงงาน
- รวมสูตรกำลังแรงงานตามอายุ สุขภาพ ความล้า อาการป่วยและบาดเจ็บ
- เด็ก 8–15 ปีทำงาน 50% และต้องมีผู้ใหญ่ดูแลงานเดียวกัน
- ตรวจคนถูกจัดงานซ้ำและอ้างบุคคลที่ไม่มีอยู่ก่อนจบเดือน
- เพิ่มภาพรวมจำนวนเดือนที่อาหารและน้ำรองรับได้ในหน้าทรัพยากร

## Checkpoint 4 — สำรวจ สัตว์ เมือง และทหาร
- เพิ่ม World Integrity Validator ตรวจจำนวนสัตว์ ความคืบหน้าพื้นที่ เมืองข้างเคียง และจำนวนทหาร
- ป้องกันจำนวนสัตว์ติดลบ เมืองเป็นพันธมิตรและสงครามพร้อมกัน และทหารเกินประชากร
- ระบบเดิมยังคำนวณใน Monthly Pipeline ตามลำดับเดิม

## Checkpoint 5 — ครอบครัว ทายาท และชัยชนะ
- คงระบบ Dynasty และ Victory อัตโนมัติจาก v0.9.39–v0.9.42
- Save Migration รุ่น 7 รักษาผู้นำ ทายาท ประวัติการสืบทอด ชื่อถิ่นฐาน และชัยชนะเดิม
- Integration Test เดิมของทายาทและเส้นทางชัยชนะยังผ่านทั้งหมด

## Checkpoint 6 — Balance Simulation และ Performance
- เพิ่ม Simulation แบบ Seed สำหรับ 4 ระดับความยาก จำนวน 1,000 รอบในการตรวจหลัก
- ผลล่าสุด: เน้นเรื่องราว 89.7%, สมดุล 75.9%, เอาชีวิตรอด 57.9%, ท้าทายสูงสุด 36.9%
- ผลอยู่ในช่วงเป้าหมายของแต่ละระดับ
- จำกัด Ledger เดือนปัจจุบัน 500 รายการ และประวัติ 48 เดือน

## Checkpoint 7 — UX/UI, Save Migration และ Final QA
- Game Version 0.9.50
- Save Schema 7
- บันทึก Month Flow, Ledger, Event Runtime และ Integration Flags
- เซฟเก่าถูก Migration และมี Checksum/Backup ตามระบบเดิม
- TypeScript ผ่าน
- JSON/Data Validation ผ่าน 44 ไฟล์
- Unit/Integration Tests ผ่าน 26/26
- Production compilation, TypeScript และ static page generation ผ่าน
- npm audit: 0 ช่องโหว่

## หมายเหตุ
Leader Board ยังเป็นข้อมูลภายในเบราว์เซอร์ จึงยังไม่ใช่อันดับออนไลน์ที่ป้องกันการแก้คะแนน ระบบบัญชีและ Server-side verification ควรอยู่ใน v0.10.0 Beta
