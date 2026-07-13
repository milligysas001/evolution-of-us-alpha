# QUALITY CHECK v0.9.29

ตรวจแล้วในชุด ZIP:

- JSON ใน `data/game/*.json` parse ได้
- `app/game/page.tsx` และ `app/page.tsx` ผ่าน TypeScript transpile diagnostics
- เพิ่ม Type/State สำหรับ guilds, outposts, factions, leaderAge, heir
- เพิ่ม resource keys ใหม่ครบใน baseResources และ labels สำคัญ
- ซ่อนแท็บนโยบายเมื่อยังไม่ปลดล็อก
- ไม่มี backup folder ติด ZIP

หลังติดตั้งในเครื่องจริงให้รัน:

```powershell
npm run check
```
