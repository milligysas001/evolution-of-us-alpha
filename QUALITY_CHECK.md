# QUALITY CHECK v0.9.28

ตรวจแล้วในชุด ZIP:

- JSON ใน `data/game` parse ได้
- `app/game/page.tsx` ผ่าน TypeScript transpile syntax diagnostics
- เพิ่มระบบตามไฟล์ผู้ใช้: Weather, Relationships/Grief, Decay/Maintenance, Livestock plague, Skill mastery, Policies, Water storage, Endgame crisis
- ยังเก็บการเตรียมย้าย Godot ผ่าน `types/` และ `logic/`

หลังติดตั้งบนเครื่องจริง ให้รัน:

```powershell
npm run check
```

ถ้า Next.js รายงาน type error ที่เกิดจากสภาพแวดล้อมจริง ให้ส่งภาพ error กลับมาเพื่อ patch ต่อทันที.
