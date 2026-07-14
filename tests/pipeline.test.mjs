import test from "node:test";
import assert from "node:assert/strict";
import { runMonthlyPipeline } from "../engine/monthly-pipeline.mjs";

test("monthly pipeline runs phases in order and records trace", () => {
  const initial = { year: 1, month: 1, people: [{ alive: true }], resources: { food: 10, wood: 0 } };
  const result = runMonthlyPipeline(initial, [
    { id: "produce", run: (state, changes) => { changes.push("ผลิตอาหาร +5"); return { ...state, resources: { ...state.resources, food: state.resources.food + 5 } }; } },
    { id: "consume", run: (state, changes) => { changes.push("บริโภคอาหาร -3"); return { ...state, resources: { ...state.resources, food: state.resources.food - 3 } }; } },
  ]);
  assert.equal(result.state.resources.food, 12);
  assert.deepEqual(result.changes, ["ผลิตอาหาร +5", "บริโภคอาหาร -3"]);
  assert.deepEqual(result.trace.map((item) => item.id), ["produce", "consume"]);
  assert.equal(result.trace[0].delta.resources.food, 5);
  assert.equal(result.trace[1].delta.resources.food, -3);
});
