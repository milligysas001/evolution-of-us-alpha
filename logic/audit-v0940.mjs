import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { CURRENT_GAME_VERSION, CURRENT_SCHEMA_VERSION } from "../save/migrations.mjs";

const root = path.resolve(import.meta.dirname, "..");
const page = fs.readFileSync(path.join(root, "app", "game", "page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const patch = JSON.parse(fs.readFileSync(path.join(root, "data", "game", "v0940_narrative_interface_polish.json"), "utf8"));

assert.equal(CURRENT_GAME_VERSION, "0.9.41");
assert.equal(CURRENT_SCHEMA_VERSION, 6);
assert.equal(pkg.version, "0.9.41");
assert.equal(pkg.name, "evolution-of-us-v0941");
assert.equal(patch.version, "0.9.40");

const warningsStart = page.indexOf("function endMonthWarnings");
const warningsEnd = page.indexOf("function smartGuidance", warningsStart);
const warningsBlock = page.slice(warningsStart, warningsEnd);
assert.equal(warningsBlock.includes("ยังไม่ได้เลือกการกระทำผู้นำ"), false, "รายงานยังมีคำเตือนการกระทำผู้นำ");
assert.equal(warningsBlock.includes("ยังไม่ได้ตอบเหตุการณ์"), false, "รายงานยังมีคำเตือนการตอบเหตุการณ์");

assert.ok(page.includes('const actionMissing = !game.leaderActionSelected;'));
assert.ok(page.includes('const eventMissing = !game.selectedChoiceId;'));
assert.ok(page.includes('disabled={blocked}'), "หน้าตัดสินใจต้องยังบังคับเลือกให้ครบ");
assert.equal(page.includes("คำนวณผลจริงตามความถนัด"), false);

for (const token of [
  'className="topbar game-topbar"',
  'className="topbar-core"',
  'className="topbar-details"',
  'className="topbar-actions"',
  'พงศาวดารฉบับเต็มของตระกูล',
  'ลำดับเหตุการณ์ตั้งแต่ต้นจนจบ',
  'รายชื่อผู้จากไปทั้งหมด',
  'contextualChoiceCopy',
  'describeChoiceOutcome',
  'addMonthlyChronicle',
  'slice(0, 1000)',
]) assert.ok(page.includes(token), `ขาดระบบ v0.9.40: ${token}`);

for (const removed of [
  '"รับมืออย่างระมัดระวัง"',
  '"ใช้แรงงานแก้ปัญหาทันที"',
  '"ให้ชุมชนร่วมตัดสินใจ"',
]) assert.equal(page.includes(removed), false, `ยังมีคำทางเลือกกลางซ้ำ: ${removed}`);

for (const token of [
  '.game-topbar', '.topbar-core', '.topbar-details', '.topbar-actions',
  '.bulk-labor-toolbar .compact-select', '.endgame-full-chronicle',
  '.endgame-year-groups', '.endgame-summary-grid'
]) assert.ok(css.includes(token), `ขาด CSS v0.9.40: ${token}`);

assert.ok(css.includes('min-height: 42px'));
assert.ok(css.includes('overflow-x: auto'));

console.log(JSON.stringify({
  status: "PASS",
  version: CURRENT_GAME_VERSION,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  reportDecisionWarningsRemoved: true,
  workforceTextCleaned: true,
  topbarReworked: true,
  bulkLaborTextVisible: true,
  fullEndgameChronicle: true,
  contextualEventChoices: true,
}, null, 2));
