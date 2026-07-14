# Evolution of Us v0.9.37 — Stabilization

## Game Engine

- แยกลำดับคำนวณจบเดือนออกเป็น `engine/monthly-pipeline.mjs`
- ทุก Phase มีชื่อ ลำดับ และ Trace ก่อน/หลังเพื่อใช้ตรวจบั๊ก
- แยกตัวจัดการ Transition ที่ผูกสถานะ RNG กับ Game State
- แยกระบบสุ่มออกจาก UI และลบ `Math.random()` จาก `app/game/page.tsx`

## Seeded Random

- ใช้ xorshift32
- เก็บ `seed`, `state` และ `calls` ในไฟล์เซฟ
- โหลดเซฟแล้วการสุ่มเดินต่อจากตำแหน่งเดิม
- Seed เดียวกันให้ลำดับผลสุ่มเหมือนกัน
- Shuffle, Pick, ID, Event, อากาศ, ประชากร, สัตว์ และความเสี่ยงใช้แหล่งสุ่มเดียวกัน

## Save Migration

- เพิ่ม Save Envelope: `evolution-of-us-save`
- เพิ่ม `schemaVersion: 3`
- รองรับบันทึกแบบ Direct JSON จากเวอร์ชันเก่า
- ย้ายเซฟเก่าเป็นโครงสร้างปัจจุบันก่อนใช้งาน
- เพิ่ม Checksum FNV-1a ตรวจไฟล์ถูกแก้หรือเสียหาย
- หาก Autosave ล่าสุดเสีย ระบบลองกู้ Autosave ก่อนหน้าให้อัตโนมัติ

## Schema Validation

- ตรวจชื่อผู้นำ ตระกูล Origin ยุค ปี เดือน ทรัพยากร ค่าสถานะ และประชากร
- ตรวจช่วงค่า Health, Morale, Fatigue และ Metric
- ตรวจ Person ID ซ้ำ
- ตรวจ RNG State
- ตรวจ JSON ข้อมูลเกม ต้นทุนสิ่งก่อสร้าง และ Resource Reference

## Test Suite

- Node Test Runner 10 Tests
- Random determinism / resume / shuffle
- Save migration / checksum / tamper detection
- Schema validation / duplicate IDs / invalid ranges
- Monthly pipeline order / trace / resource delta
- Legacy regression audit: 250 เกมเริ่มต้น, 338 Events, 1,017 Choices, 31 Buildings, 41 Research
- Production TypeScript และ Next.js Build

## Dependency Stability

- ล็อกเวอร์ชัน Next.js, React, TypeScript และ Type Definitions
- ยกเลิกการใช้ `latest`, `^` และ `~` ใน Dependency หลัก
