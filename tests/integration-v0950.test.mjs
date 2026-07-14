import test from "node:test";
import assert from "node:assert/strict";
import { MONTH_PHASES, beginMonthResolution, emptyMonthFlow, finishMonthResolution, enterPlanningPhase, normalizeMonthFlow } from "../engine/month-flow.mjs";
import { appendStateDiffLedger, closeLedgerMonth, latestLedgerMonth } from "../engine/ledger.mjs";
import { validateEventCollection } from "../engine/event-integrity.mjs";
import { ageWorkFactor, effectiveWorkerPower, validateLaborAssignments } from "../engine/economy-labor.mjs";
import { validateWorldSystems } from "../engine/world-integrity.mjs";
import { runLightweightBalanceSimulation } from "../engine/balance-simulation.mjs";

function game() {
  return {
    year: 1, month: 1, leaderActionSelected: true, selectedChoiceId: "choice-a", currentEventId: "event-a",
    resources: { food: 100, wood: 20, water: 50 }, metrics: { morale: 50 },
    people: [{ id: "adult", age: 30, health: 100, fatigue: 0, alive: true }, { id: "child", age: 12, health: 100, fatigue: 0, alive: true }],
    laborAssignments: { forage: ["adult", "child"] },
    animalState: { animals: { goat: 2 } }, locations: { forest: { progress: 50 } }, neighbors: [], military: { soldiers: 0 },
    monthFlow: emptyMonthFlow({ year: 1, month: 1 }),
  };
}

test("checkpoint 1: month resolution is idempotent and ledger closes once", () => {
  const start = game();
  const begun = beginMonthResolution(start);
  assert.equal(begun.ok, true);
  const changed = { ...begun.game, resources: { ...begun.game.resources, food: 75, wood: 30 } };
  const logged = appendStateDiffLedger(begun.game, changed, { system: "monthly", reason: "ทดสอบผลเดือน", resolutionId: begun.resolutionId });
  const closed = closeLedgerMonth(logged, "1-01", [], { resolutionId: begun.resolutionId });
  const sameMonthFinished = finishMonthResolution(closed, "1-01", begun.resolutionId);
  assert.equal(sameMonthFinished.monthFlow.phase, "report");
  assert.equal(latestLedgerMonth(sameMonthFinished).summary.resources.food, -25);
  assert.equal(beginMonthResolution(sameMonthFinished).ok, false);
  const nextMonth = { ...sameMonthFinished, month: 2 };
  assert.equal(enterPlanningPhase(nextMonth).monthFlow.phase, "planning");
});

test("checkpoint 2: event integrity catches broken follow-up and empty effect", () => {
  const report = validateEventCollection([{ id: "a", title: "A", text: "เรื่อง", choices: [{ id: "c", title: "เลือก", addPending: "missing" }] }]);
  assert.equal(report.ok, false);
  assert.ok(report.issues.some((item) => item.message.includes("ไม่มีอยู่")));
});

test("checkpoint 3: child labor requires adult supervision and assignments cannot duplicate", () => {
  assert.equal(ageWorkFactor(12), 0.5);
  assert.equal(effectiveWorkerPower(game().people[1], { hasAdultSupervisor: false }), 0);
  assert.equal(effectiveWorkerPower(game().people[1], { hasAdultSupervisor: true }), 0.5);
  const audit = validateLaborAssignments(game(), { forage: ["adult"], build: ["adult"] });
  assert.equal(audit.ok, false);
});

test("checkpoint 4: world systems reject impossible military and animal states", () => {
  const broken = game();
  broken.animalState.animals.goat = -1;
  broken.military.soldiers = 99;
  const result = validateWorldSystems(broken);
  assert.equal(result.ok, false);
  assert.ok(result.issues.length >= 2);
});

test("checkpoint 6: balance simulation is deterministic and ordered by difficulty", () => {
  const story = runLightweightBalanceSimulation({ difficulty: "story", runs: 300, seed: "v0950" });
  const ironman = runLightweightBalanceSimulation({ difficulty: "ironman", runs: 300, seed: "v0950" });
  assert.ok(story.survivalRate >= ironman.survivalRate);
  assert.equal(story.runs, 300);
});


test("month phase derives planning, decision, and ready from real choices", () => {
  const base = game();
  assert.equal(normalizeMonthFlow({ ...base, leaderActionSelected: false, selectedChoiceId: null }).phase, MONTH_PHASES.PLANNING);
  assert.equal(normalizeMonthFlow({ ...base, leaderActionSelected: true, selectedChoiceId: null }).phase, MONTH_PHASES.DECISION);
  assert.equal(normalizeMonthFlow({ ...base, leaderActionSelected: true, selectedChoiceId: "choice-a" }).phase, MONTH_PHASES.READY);
});
