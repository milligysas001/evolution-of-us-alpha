import fs from "node:fs";
import path from "node:path";
import { validateContentCollection } from "../save/schema.mjs";
import { GAME_VERSION, SAVE_SCHEMA_VERSION } from "../config/version.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = path.join(root, "data", "game");
const files = fs.readdirSync(dataDir).filter((name) => name.endsWith(".json")).sort();
const problems = [];
const parsed = new Map();

for (const file of files) {
  const full = path.join(dataDir, file);
  try {
    const value = JSON.parse(fs.readFileSync(full, "utf8"));
    parsed.set(file, value);
    if (Array.isArray(value) && value.every((item) => item && typeof item === "object" && "id" in item)) {
      const result = validateContentCollection(value, file);
      for (const issue of result.issues) problems.push(`${issue.path}: ${issue.message}`);
    }
  } catch (error) {
    problems.push(`${file}: JSON อ่านไม่ได้ (${error instanceof Error ? error.message : String(error)})`);
  }
}

const resources = parsed.get("resources.json") ?? [];
const resourceIds = new Set(resources.map((item) => item.id));
for (const item of parsed.get("buildings.json") ?? []) {
  if (!item.cost || typeof item.cost !== "object" || Object.keys(item.cost).length === 0) problems.push(`buildings.json:${item.id} ไม่มีต้นทุน`);
  for (const [key, value] of Object.entries(item.cost ?? {})) {
    if (!resourceIds.has(key)) problems.push(`buildings.json:${item.id} ใช้ทรัพยากรไม่รู้จัก ${key}`);
    if (!Number.isFinite(value) || value <= 0) problems.push(`buildings.json:${item.id}.${key} ต้นทุนต้องมากกว่า 0`);
  }
  if (!Number.isFinite(item.workRequired) || item.workRequired <= 0) problems.push(`buildings.json:${item.id} workRequired ไม่ถูกต้อง`);
}
for (const item of parsed.get("research.json") ?? []) {
  if (!Number.isFinite(item.cost) || item.cost <= 0) problems.push(`research.json:${item.id} cost ไม่ถูกต้อง`);
}
for (const event of parsed.get("events.sample.json") ?? []) {
  if (!Array.isArray(event.choices) || event.choices.length === 0) problems.push(`events.sample.json:${event.id} ไม่มีตัวเลือก`);
  const choiceIds = new Set();
  for (const choice of event.choices ?? []) {
    if (!choice.id || choiceIds.has(choice.id)) problems.push(`events.sample.json:${event.id} choice id ซ้ำ/ว่าง ${choice.id}`);
    choiceIds.add(choice.id);
  }
}

const runtimeManifest = parsed.get("runtime-manifest.json");
if (!runtimeManifest || runtimeManifest.gameVersion !== GAME_VERSION || Number(runtimeManifest.saveSchemaVersion) !== SAVE_SCHEMA_VERSION) {
  problems.push("runtime-manifest.json ไม่ตรงกับเวอร์ชันเกมปัจจุบัน กรุณารัน npm run manifest:runtime");
} else {
  if (Number(runtimeManifest.counts?.buildings || 0) < (parsed.get("buildings.json") ?? []).length) problems.push("จำนวนสิ่งก่อสร้าง Runtime น้อยกว่าข้อมูลอ้างอิง");
  if (Number(runtimeManifest.counts?.research || 0) < (parsed.get("research.json") ?? []).length) problems.push("จำนวนงานวิจัย Runtime น้อยกว่าข้อมูลอ้างอิง");
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({
  status: "PASS",
  jsonFiles: files.length,
  role: "Portable JSON เป็นข้อมูลอ้างอิง ส่วน Runtime Manifest เป็นจำนวนที่เกมใช้จริง",
  portableReference: { resources: resources.length, buildings: (parsed.get("buildings.json") ?? []).length, research: (parsed.get("research.json") ?? []).length, eventSamples: (parsed.get("events.sample.json") ?? []).length },
  runtime: runtimeManifest?.counts ?? null,
}, null, 2));
