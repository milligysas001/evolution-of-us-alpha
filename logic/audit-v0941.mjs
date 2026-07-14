import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { CURRENT_GAME_VERSION, CURRENT_SCHEMA_VERSION, migrateSavePayload } from "../save/migrations.mjs";
import { evaluateVictory, victoryProgress } from "./dynasty-endgame.mjs";

const root = path.resolve(import.meta.dirname, "..");
const page = fs.readFileSync(path.join(root, "app", "game", "page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const patch = JSON.parse(fs.readFileSync(path.join(root, "data", "game", "v0942_decision_focus_expressive_status.json"), "utf8"));

assert.equal(CURRENT_GAME_VERSION, "0.9.42");
assert.equal(CURRENT_SCHEMA_VERSION, 6);
assert.equal(pkg.version, "0.9.42");
assert.equal(pkg.name, "evolution-of-us-v0941");
assert.equal(patch.version, "0.9.42");
assert.equal(patch.schemaVersion, 6);

// Layout and decision flow
assert.ok(page.includes('type View = "เมือง" | "ตัดสินใจ"'));
assert.ok(page.includes('safeView === "ตัดสินใจ" && <EventPanel'));
assert.ok(page.includes('className={`top-decision-button'));
assert.ok(page.includes('visibleViews.filter((v) => v !== "ตัดสินใจ")'));
assert.ok(page.includes('eventIntroOpen && !game.selectedChoiceId'));
assert.ok(css.includes('.top-decision-button'));
assert.ok(css.includes('.event-intro-modal'));
assert.equal(page.includes('<aside className="event-panel">'), false);
assert.equal(page.includes('setEventPopupOpen'), false);
assert.equal(page.includes('<button onClick={endTurn}>จบเดือนนี้'), false);
assert.ok(page.includes('className="decision-grid"'));
assert.ok(css.includes('grid-template-columns: minmax(248px, 282px) minmax(0, 1fr);'));
assert.ok(css.includes('.decision-page'));
assert.ok(css.includes('.bottom-nav { display: none; }'));

// Concise chronicle
assert.ok(page.includes('พงศาวดารเก็บเฉพาะหนึ่งบทสรุปต่อเดือน'));
assert.ok(page.includes('title: `สรุปเดือน ${gameBefore.month}'));
assert.equal(page.includes('if (["milestone", "rare", "death"].includes(entry.kind)) return true;'), false);
assert.ok(page.includes('แต่ละเดือนเก็บเป็นบทสรุปเดียว'));

// Heir feedback
for (const token of ['function heirSystemUnlocked', 'selected-heir-banner', 'แต่งตั้ง ${candidate.name} เป็นทายาทแล้ว', 'onClick={() => appointHeir(person.id)}']) {
  assert.ok(page.includes(token), `missing heir flow: ${token}`);
}

// Names and settlement naming
for (const token of ['CULTURAL_NAME_POOLS', 'greek:', 'egyptian:', 'mesopotamian:', 'persian:', 'nordic:', 'eastAsian:', 'uniquePersonName', 'pendingSettlementRename', 'settlementNameHistory', 'settlement-name-modal']) {
  assert.ok(page.includes(token), `missing naming system: ${token}`);
}
const migrated = migrateSavePayload({ version: "0.9.40", schemaVersion: 5, leaderName: "Nora", houseName: "Vaelen", origin: "builder", difficulty: "normal", stage: "เมืองเล็ก", year: 4, month: 2, people: [{ id: "leader", name: "Nora", age: 40, health: 80, morale: 80, fatigue: 0, alive: true }] });
assert.equal(migrated.game.schemaVersion, 6);
assert.equal(migrated.game.settlementName, "เมือง Vaelen");
assert.equal(migrated.game.victory.chosenPath, null);

// Automatic difficulty-scaled victory tracking
assert.equal(page.includes('selectVictoryPath'), false);
assert.ok(page.includes('<article className={`victory-card'));
const base = {
  difficulty: "normal", stage: "ค่ายพักแรม", people: [{ id: "leader", alive: true }], resources: { food: 0, gold: 0, knowledge: 0 },
  metrics: { security: 0 }, buildings: {}, researchDone: {}, neighbors: [], military: {}, crisis: {}, dynasty: {}, victory: {}
};
const story = victoryProgress({ ...base, difficulty: "story" });
const ironman = victoryProgress({ ...base, difficulty: "ironman" });
assert.notDeepEqual(story.enduring.details, ironman.enduring.details);
const evaluated = evaluateVictory({ ...base, victory: { chosenPath: "trade", completedPaths: [], achievedAt: null, ending: null, lastEvaluation: {} } });
assert.equal(evaluated.victory.chosenPath, null);

console.log(JSON.stringify({
  status: "PASS",
  version: CURRENT_GAME_VERSION,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  rightDecisionRailRemoved: true,
  decisionTabIntegrated: true,
  conciseMonthlyChronicle: true,
  heirFeedbackVisible: true,
  diverseUniqueNames: true,
  settlementRenaming: true,
  automaticVictoryPaths: true,
  responsiveWideLayout: true
}, null, 2));
