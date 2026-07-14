import assert from "node:assert/strict";
import { runHeadlessCoreSimulation } from "../engine/headless-core-runner.mjs";

const difficulties = ["story", "normal", "survival", "ironman"];
const strategies = ["balanced", "food", "research", "military", "random"];
const rows = [];
for (const difficulty of difficulties) {
  for (const strategy of strategies) {
    rows.push(runHeadlessCoreSimulation({ difficulty, strategy, runs: 500, months: 18, seed: "v0951-balance" }));
  }
}
const balanced = Object.fromEntries(rows.filter((row) => row.strategy === "balanced").map((row) => [row.difficulty, row.survivalRate]));
assert.ok(balanced.story >= balanced.normal, "story must not be harder than normal");
assert.ok(balanced.normal >= balanced.survival, "normal must not be harder than survival");
assert.ok(balanced.survival >= balanced.ironman, "survival must not be harder than highest difficulty");
assert.ok(balanced.story >= .95, "story core stress survival should remain approachable");
assert.ok(balanced.normal >= .85, "normal core stress survival fell below the regression floor");
assert.ok(balanced.survival >= .2 && balanced.survival <= .75, "survival core stress difficulty is outside the expected band");
assert.ok(balanced.ironman <= .3, "highest difficulty is not meaningfully harder in the core stress model");
const century = runHeadlessCoreSimulation({ difficulty: "normal", strategy: "balanced", runs: 1, months: 1200, seed: "v0951-century", sandbox: true });
assert.equal(century.resolvedMonths, 1200);
assert.ok(century.elapsedMs < 5000, `100-year sandbox simulation is too slow: ${century.elapsedMs}ms`);
console.log(JSON.stringify({ status: "PASS", model: "headless-core-stress-model", horizonMonths: 18, note: "ใช้ตรวจลำดับความยากและ Regression ของแกนคำนวณ ไม่ใช่การรับรองผลการเล่นจริงทุก Event", balanced, rows, century }, null, 2));
