import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRngState, random, runWithRng } from "../engine/random.mjs";
import { createSaveEnvelope, migrateSavePayload, verifySaveEnvelope, CURRENT_GAME_VERSION, CURRENT_SCHEMA_VERSION } from "../save/migrations.mjs";
import { validateGameSave } from "../save/schema.mjs";
import { runMonthlyPipeline } from "../engine/monthly-pipeline.mjs";

const root = path.resolve(import.meta.dirname, "..");
const page = fs.readFileSync(path.join(root, "app", "game", "page.tsx"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.equal(CURRENT_GAME_VERSION, "0.9.39");
assert.equal(CURRENT_SCHEMA_VERSION, 5);
assert.equal((page.match(/Math\.random/g) ?? []).length, 0, "app/game/page.tsx ยังมี Math.random");
for (const token of [
  'from "../../engine/random.mjs"',
  'from "../../engine/transition.mjs"',
  'from "../../engine/monthly-pipeline.mjs"',
  'from "../../save/migrations.mjs"',
  'from "../../save/schema.mjs"',
  'runSeededTransition(prev, fn)',
  'runMonthlyPipeline(normalizedGame',
  'createSaveEnvelope(safeGameForStorage(game)',
  'schemaVersion: CURRENT_SCHEMA_VERSION',
]) assert.ok(page.includes(token), `ขาด stabilization token: ${token}`);

for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
  assert.ok(!/[~^*]|latest/i.test(String(version)), `dependency ${name} ยังไม่ล็อกเวอร์ชัน: ${version}`);
}
for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
  assert.ok(!/[~^*]|latest/i.test(String(version)), `devDependency ${name} ยังไม่ล็อกเวอร์ชัน: ${version}`);
}

const seqA = runWithRng(createRngState("EOU-AUDIT-937"), () => Array.from({ length: 500 }, () => random())).value;
const seqB = runWithRng(createRngState("EOU-AUDIT-937"), () => Array.from({ length: 500 }, () => random())).value;
assert.deepEqual(seqA, seqB, "Seed เดียวกันให้ผลไม่เหมือนกัน");
assert.ok(seqA.every((value) => value >= 0 && value < 1), "RNG ให้ค่าเกินช่วง 0..1");

const resources = Object.fromEntries(["food","wood","stone","tools","herbs","hides","water","waterReserve","knowledge","fuel","ore","gold","feed","ironOre","coal","timber","bricks","textiles","salt","spices","influence","steel","luxuries","warhorses","manpower","siegeMaterials"].map((key) => [key, 0]));
const fixture = {
  version: "0.9.36", difficulty: "normal", leaderName: "Audit", houseName: "Stability", origin: "builder", year: 1, month: 1, stage: "ค่ายพักแรม",
  resources, metrics: { morale: 50, security: 50, trust: 50, health: 50, cohesion: 50, fairness: 50 },
  people: [{ id: "leader", name: "Audit", age: 30, health: 80, morale: 70, fatigue: 0, alive: true }],
  buildings: {}, researchDone: {}, labor: {}, flags: {}, locations: {}, buildingCondition: {},
  logs: [], casualties: [], memories: [], rumors: [], notifications: [], pendingEvents: [], delayedEvents: [], recentEventIds: [], eventHistory: [], neighbors: [], outposts: [],
};
const migrated = migrateSavePayload(fixture).game;
assert.equal(migrated.version, "0.9.39");
assert.equal(migrated.schemaVersion, 5);
assert.equal(validateGameSave(migrated, { strict: true }).ok, true);
const envelope = createSaveEnvelope(migrated, { source: "audit" });
assert.equal(verifySaveEnvelope(envelope).ok, true);
envelope.game.month = 12;
assert.equal(verifySaveEnvelope(envelope).ok, false, "Checksum ไม่จับการแก้ไฟล์");

const pipeline = runMonthlyPipeline({ year: 1, month: 1, people: [{ alive: true }], resources: { food: 10 } }, [
  { id: "a", run: (state, changes) => { changes.push("a"); return { ...state, resources: { food: state.resources.food + 2 } }; } },
  { id: "b", run: (state, changes) => { changes.push("b"); return { ...state, resources: { food: state.resources.food - 1 } }; } },
]);
assert.equal(pipeline.state.resources.food, 11);
assert.deepEqual(pipeline.trace.map((item) => item.id), ["a", "b"]);

console.log(JSON.stringify({
  status: "PASS",
  version: CURRENT_GAME_VERSION,
  seededValuesCompared: seqA.length,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  checksumTamperDetection: true,
  pipelinePhasesChecked: pipeline.trace.length,
  mathRandomInGamePage: 0,
  pinnedDependencies: Object.keys(pkg.dependencies ?? {}).length + Object.keys(pkg.devDependencies ?? {}).length,
}, null, 2));
