import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { CURRENT_GAME_VERSION, CURRENT_SCHEMA_VERSION, migrateSavePayload } from "../save/migrations.mjs";
import { eventPacingMultiplierLite, initialVisibleLocations, workFactorForAge } from "./balance-v0938.mjs";

const root = path.resolve(import.meta.dirname, "..");
const page = fs.readFileSync(path.join(root, "app", "game", "page.tsx"), "utf8");
const home = fs.readFileSync(path.join(root, "app", "page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.equal(CURRENT_GAME_VERSION, "0.9.38");
assert.equal(CURRENT_SCHEMA_VERSION, 4);
assert.equal(pkg.version, "0.9.38");
assert.equal(pkg.name, "evolution-of-us-v0938");

for (const token of [
  'type Difficulty = "story" | "normal" | "survival" | "ironman"',
  'foodReserveMonths: 6',
  'เด็กอายุ 8–15 ปีช่วยงานได้ด้วยกำลัง 50%',
  'peopleCounts.assigned > 0 ? "เอางานจากทุกคนออก" : "จัดตามความถนัด"',
  'assignManyPeople(selectedPeople, bulkJob)',
  'report: buildMonthlyReport(game, nextBase, event, selected)',
  'eventPacingMultiplier(game, event)',
  'eventHistory',
  'initialLocationsForTerrain',
  'revealLocationFromEvent',
  'locationAdjacency',
  'discovered.map((key)',
]) assert.ok(page.includes(token), `ขาดระบบ v0.9.38: ${token}`);

assert.ok(home.includes('reserve: "อาหารประมาณ 6 เดือน"'), "หน้าเริ่มเกมไม่แสดงเสบียงระดับสมดุล 6 เดือน");
assert.ok(home.includes("ระดับความยาก"), "หน้าเริ่มเกมไม่มีตัวเลือกระดับความยาก");
assert.ok(css.includes(".bulk-labor-toolbar"), "ไม่มีรูปแบบแถบจัดแรงงานจำนวนมาก");
assert.ok(css.includes(".monthly-report-kpis"), "ไม่มีรูปแบบรายงานจบเดือนใหม่");

for (const forbidden of ["กดแล้วหักวัตถุดิบทันที", "วัตถุดิบจ่ายแล้ว", "ไม่หักวัตถุดิบซ้ำ"]) {
  assert.equal(page.includes(forbidden), false, `ยังพบข้อความที่ต้องนำออก: ${forbidden}`);
}

const buildStart = page.indexOf("function BuildView");
const buildEnd = page.indexOf("function ResearchView", buildStart);
const buildView = page.slice(buildStart, buildEnd > buildStart ? buildEnd : buildStart + 30000);
assert.ok(buildView.includes('className={row.enough || paused || already ? "cost-chip enough" : "cost-chip missing"}'), "วัตถุดิบที่ไม่พอไม่ได้ใช้สถานะสีแดง");
assert.ok(buildView.includes('{resourceIcon(row.key)} {resourceShortLabel(row.key)} {fmt(row.required)}'), "การ์ดก่อสร้างไม่แสดงเฉพาะปริมาณที่ต้องใช้");
assert.equal(buildView.includes("row.current"), false, "การ์ดก่อสร้างยังแสดงจำนวนวัตถุดิบที่มีอยู่");

const newsStart = page.indexOf("function NewsView");
const newsEnd = page.indexOf("function MerchantView", newsStart);
const newsView = page.slice(newsStart, newsEnd);
for (const token of ["<RiskPanel", "<ForecastPanel", "<EndWarningPanel"]) assert.ok(newsView.includes(token), `แท็บข่าวสารขาด ${token}`);
const sidebarStart = page.indexOf('<aside className="sidebar">');
const sidebarEnd = page.indexOf("</aside>", sidebarStart);
const sidebar = page.slice(sidebarStart, sidebarEnd);
for (const token of ["<RiskPanel", "<ForecastPanel", "<EndWarningPanel"]) assert.equal(sidebar.includes(token), false, `Sidebar ยังมี ${token}`);

assert.equal(workFactorForAge(7), 0);
assert.equal(workFactorForAge(8), 0.5);
assert.equal(workFactorForAge(15), 0.5);
assert.equal(workFactorForAge(16), 1);
assert.deepEqual(initialVisibleLocations("marshland"), ["marshPools"]);
const freshPacing = eventPacingMultiplierLite([], { id: "rain", category: "อากาศ", danger: 1 }, "normal");
const repeatedPacing = eventPacingMultiplierLite([{ id: "heat", category: "อากาศ", rare: false }], { id: "rain", category: "อากาศ", danger: 1 }, "normal");
assert.ok(repeatedPacing < freshPacing, "Event pacing ไม่ลดเหตุการณ์หมวดเดิมที่เพิ่งเกิด");

const migrated = migrateSavePayload({ version: "0.9.37", leaderName: "Audit", houseName: "Balance", origin: "builder", year: 1, month: 1 }).game;
assert.equal(migrated.difficulty, "normal");
assert.ok(Array.isArray(migrated.eventHistory));
assert.equal(migrated.schemaVersion, 4);

console.log(JSON.stringify({
  status: "PASS",
  version: CURRENT_GAME_VERSION,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  childWorkRange: "8–15 years at 50%",
  constructionCostDisplay: "required quantity only; shortage highlighted",
  workforceBulkTools: true,
  newsRiskAndForecast: true,
  explorationFogOfDiscovery: true,
  eventPacing: true,
  monthlyReport: true,
}, null, 2));
