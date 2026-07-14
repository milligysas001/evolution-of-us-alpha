import test from "node:test";
import assert from "node:assert/strict";
import { eventPacingMultiplierLite, initialVisibleLocations, workFactorForAge } from "../logic/balance-v0938.mjs";
import { CURRENT_GAME_VERSION, CURRENT_SCHEMA_VERSION, migrateSavePayload } from "../save/migrations.mjs";

test("children age 8–15 work at exactly 50 percent", () => {
  assert.equal(workFactorForAge(7), 0);
  assert.equal(workFactorForAge(8), 0.5);
  assert.equal(workFactorForAge(15), 0.5);
  assert.equal(workFactorForAge(16), 1);
  assert.equal(workFactorForAge(60), 0.55);
});

test("a new settlement reveals only the area matching its terrain", () => {
  assert.deepEqual(initialVisibleLocations("riverbank"), ["shallowStream"]);
  assert.deepEqual(initialVisibleLocations("forestEdge"), ["deepWoods"]);
  assert.deepEqual(initialVisibleLocations("rockyHollow"), ["rockyRidge"]);
});

test("event pacing suppresses immediate category repetition", () => {
  const event = { id: "new-rain", category: "อากาศ", danger: 1 };
  const fresh = eventPacingMultiplierLite([], event, "normal");
  const repeated = eventPacingMultiplierLite([{ id: "old-rain", category: "อากาศ", rare: false }], event, "normal");
  assert.ok(repeated < fresh);
});

test("survival difficulty raises dangerous-event pressure compared with story", () => {
  const event = { id: "danger", category: "ภัย", danger: 2 };
  assert.ok(eventPacingMultiplierLite([], event, "survival") > eventPacingMultiplierLite([], event, "story"));
});

test("legacy save migrates difficulty and event history into schema 4", () => {
  const result = migrateSavePayload({ version: "0.9.37", leaderName: "Nora", houseName: "Mara", origin: "builder", year: 1, month: 1 });
  assert.equal(CURRENT_GAME_VERSION, "0.9.38");
  assert.equal(CURRENT_SCHEMA_VERSION, 4);
  assert.equal(result.game.difficulty, "normal");
  assert.deepEqual(result.game.eventHistory, []);
});
