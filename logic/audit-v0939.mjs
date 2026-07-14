import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { CURRENT_GAME_VERSION, CURRENT_SCHEMA_VERSION, migrateSavePayload } from "../save/migrations.mjs";
import { VICTORY_PATHS, evaluateVictory, heirCandidates, normalizeDynastyState, victoryProgress } from "./dynasty-endgame.mjs";

const root = path.resolve(import.meta.dirname, "..");
const page = fs.readFileSync(path.join(root, "app", "game", "page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
const settingsStart = page.indexOf("function SettingsView");
const settingsEnd = page.indexOf("function estimateBuildMonths", settingsStart);
const settingsView = page.slice(settingsStart, settingsEnd);
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.equal(CURRENT_GAME_VERSION, "0.9.40");
assert.equal(CURRENT_SCHEMA_VERSION, 5);
assert.equal(pkg.version, "0.9.40");
assert.equal(pkg.name, "evolution-of-us-v0940");

for (const token of [
  'type DynastyState =',
  'type VictoryState =',
  'function designateHeir',
  'function resolveDynasticSuccession',
  'function updateFamilyRecords',
  'dynasty-succession',
  'evaluateVictory(nextBase)',
  'เส้นทางชัยชนะ',
  'พงศาวดารตอนจบ',
  'สมาชิกตระกูลที่ยังมีชีวิต',
  'appointHeir=',
]) assert.ok(page.includes(token), `ขาดระบบ v0.9.39: ${token}`);

for (const cssToken of [
  '.dynasty-grid', '.victory-grid', '.ending-chronicle', '.heir-candidate-grid', '.wrap-safe',
  'overflow-wrap: anywhere', 'grid-template-columns: repeat(auto-fit, minmax(94px, 1fr))',
]) assert.ok(css.includes(cssToken), `ขาด UX/UI rule: ${cssToken}`);

assert.equal(settingsView.includes("ผู้มาตั้งถิ่นฐานประจำปี"), false, "หน้าตั้งค่ายังแสดงผู้มาตั้งถิ่นฐานประจำปี");
assert.ok(settingsView.includes("ความคิดเห็นจากผู้เล่น"), "หน้าตั้งค่าขาดช่องทางความคิดเห็น");
assert.equal(Object.keys(VICTORY_PATHS).length, 6);

const people = [
  { id: "leader", name: "Founder", age: 70, alive: true, health: 70, morale: 70, kin: "ตระกูล Audit", houseName: "Audit", traits: [], childrenIds: ["heir"] },
  { id: "heir", name: "Heir", age: 28, alive: true, health: 92, morale: 90, kin: "ตระกูล Audit", houseName: "Audit", traits: ["เรียนรู้ไว"], parentIds: ["leader"] },
  ...Array.from({ length: 118 }, (_, i) => ({ id: `p-${i}`, name: `P${i}`, age: 25, alive: true, health: 70, morale: 70, kin: "ชาวเมือง", traits: [] })),
];
const researchDone = Object.fromEntries(Array.from({ length: 36 }, (_, i) => [`r-${i}`, true]));
researchDone.dynasticSuccession = true;
researchDone.familyRecords = true;
const fixture = {
  leaderName: "Founder", houseName: "Audit", stage: "นครรัฐ", year: 20, month: 1,
  people, resources: { food: 5000, gold: 220, knowledge: 250 },
  metrics: { security: 90, trust: 80, health: 80, morale: 80, cohesion: 80, fairness: 80 },
  buildings: { marketSquare: 1, caravanPost: 1, palisade: 2, barracks: 2 }, researchDone,
  neighbors: [
    { tradeTreaty: true, alliance: true, atWar: false, relation: 75 },
    { tradeTreaty: true, alliance: true, atWar: false, relation: 70 },
    { tradeTreaty: true, alliance: false, atWar: false, relation: 65 },
  ],
  military: { soldiers: 80, readiness: 90, equipment: 90 }, crisis: { resolved: true }, logs: [], casualties: [],
  dynasty: { founderName: "Founder", generation: 3, currentLeaderId: "leader", designatedHeirId: "heir", successionHistory: [], familyMilestones: [], lastSuccession: "" },
  victory: { chosenPath: "trade", completedPaths: [], achievedAt: null, ending: null, lastEvaluation: {} },
};
assert.equal(normalizeDynastyState(fixture).generation, 3);
assert.equal(heirCandidates(fixture)[0].person.id, "heir");
const progress = victoryProgress(fixture);
assert.equal(progress.trade.complete, true);
const completed = evaluateVictory(fixture);
assert.ok(completed.victory.completedPaths.includes("trade"));
assert.equal(completed.victory.ending.path, "trade");

const migrated = migrateSavePayload({ version: "0.9.38", schemaVersion: 4, leaderName: "Old", houseName: "Save", people: [{ id: "leader", name: "Old", alive: true, kin: "ตระกูล Save" }] }).game;
assert.equal(migrated.schemaVersion, 5);
assert.equal(migrated.dynasty.generation, 1);
assert.ok(Array.isArray(migrated.victory.completedPaths));

console.log(JSON.stringify({
  status: "PASS",
  version: CURRENT_GAME_VERSION,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  victoryPaths: Object.keys(VICTORY_PATHS).length,
  familyRelationships: true,
  heirDesignation: true,
  successionPipeline: true,
  endingChronicle: true,
  settingsAnnualSettlersCardRemoved: true,
  responsiveUiAudit: true,
}, null, 2));
