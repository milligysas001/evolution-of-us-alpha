# QUALITY CHECK — v0.9.8

ตรวจ/เพิ่มระบบหลัก:

- เปลี่ยน version/save key เป็น v0.9.8
- เพิ่ม gold ใน Resources และแสดงในบัญชีทรัพยากร
- เพิ่ม dynamic labor unlock ตามเงื่อนไข:
  - เพาะปลูก: basicFarming หรือ farmPlot
  - ดูแลน้ำสะอาด: waterFinding หรือ well
  - ถนอมอาหาร: foodPreservation หรือ storage
  - ซ่อม/ผลิตเครื่องมือ: simpleCraft หรือ workshop
  - เก็บสมุนไพร/ต้มยา: herbalCare หรือ healerHut
  - ลาดตระเวน/วางกับดัก: watchRoutine หรือ watchPost/palisade
  - แลกเปลี่ยน/ขายของส่วนเกิน: stage ไม่ใช่ค่ายพักแรม หรือ meetingHall
  - สอนเด็ก/บันทึกความรู้: storyRecords หรือ meetingHall
- normalizeLabor จะลบแรงงานในงานที่ยังไม่ปลดล็อก และลดจำนวนถ้าเกินแรงงานจริง
- endTurn จะป้องกันการจบเดือนถ้าใช้แรงงานเกิน
- resourceLedger เพิ่ม emoji และข้อมูลผลิต/ใช้/สุทธิสำหรับทรัพยากรสำคัญ
- production คำนวณงานใหม่: farm, water, preserve, craft, herbs, patrol, trade, teach
- Settings UI เพิ่ม version, reset save, tutorial, debug report
- ตรวจ TSX syntax ด้วย TypeScript transpile diagnostics แล้วผ่าน
