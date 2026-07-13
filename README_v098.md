# Evolution of Us v0.9.8 — Alpha Test Ready + Dynamic Labor Unlock

เวอร์ชันนี้ต่อยอดจาก v0.9.7 โดยเพิ่มระบบที่จำเป็นสำหรับแชร์ให้เพื่อนทดสอบและเล่นระยะยาวขึ้น

## สิ่งที่เพิ่ม

- แสดง Version ในเกม: Alpha v0.9.8
- กันแรงงานติดลบก่อนจบเดือน ถ้าใช้แรงงานเกิน ระบบจะไม่ให้ผ่านและแจ้งเตือน
- ระบบงานแรงงานปลดล็อกตามวิจัย / อาคาร / ระยะถิ่นฐาน
- เพิ่มงานใหม่ เช่น เพาะปลูก, ดูแลน้ำสะอาด, ถนอมอาหาร, ซ่อม/ผลิตเครื่องมือ, เก็บสมุนไพร, ลาดตระเวน, แลกเปลี่ยน/ขายของส่วนเกิน, สอนเด็ก/บันทึกความรู้
- บัญชีทรัพยากรมี emoji และแสดงทรัพยากรเพิ่ม เช่น เครื่องมือ, สมุนไพร, หนังสัตว์, ทอง
- ทองได้จากงานแลกเปลี่ยน/ขายของส่วนเกิน เช่น อาหาร หนังสัตว์ สมุนไพร และเครื่องมือ
- หน้า Settings ชัดเจนขึ้น มี Version, Local Save, Reset Save, Tutorial และ Debug Report
- เพิ่ม `postcss.config.mjs` แบบปลอดภัยสำหรับ Vercel

## วิธีติดตั้ง

```powershell
powershell -ExecutionPolicy Bypass -File .\apply-v098-alpha-ready.ps1
```

หรือกำหนด path เอง:

```powershell
powershell -ExecutionPolicy Bypass -File .\apply-v098-alpha-ready.ps1 -ProjectPath "C:\Users\phass\evolution-of-us"
```

หลังขึ้น Ready เปิด:

```text
http://localhost:3000
```

## หมายเหตุ

ระบบเซฟเปลี่ยนเป็น `eou-v098-save` แนะนำให้เริ่มเกมใหม่เพื่อให้ระบบปลดล็อกงานและทองทำงานครบ
