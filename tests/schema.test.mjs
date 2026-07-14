import test from "node:test";
import assert from "node:assert/strict";
import { validateGameSave } from "../save/schema.mjs";
import { createRngState } from "../engine/random.mjs";

function validGame() {
  const resources = Object.fromEntries(["food","wood","stone","tools","herbs","hides","water","waterReserve","knowledge","fuel","ore","gold","feed","ironOre","coal","timber","bricks","textiles","salt","spices","influence","steel","luxuries","warhorses","manpower","siegeMaterials"].map((key) => [key, 0]));
  return {
    version: "0.9.38", saveVersion: "0.9.38", schemaVersion: 4,
    leaderName: "Nora", houseName: "Vaelen", origin: "builder", difficulty: "normal", year: 1, month: 1, stage: "ค่ายพักแรม",
    resources,
    metrics: { morale: 50, security: 50, trust: 50, health: 50, cohesion: 50, fairness: 50 },
    people: [{ id: "leader", name: "Nora", age: 30, health: 80, morale: 70, fatigue: 0, alive: true }],
    rng: createRngState("EOU-SCHEMA"),
    buildings: {}, researchDone: {}, labor: {}, flags: {}, locations: {}, buildingCondition: {},
    logs: [], casualties: [], memories: [], rumors: [], notifications: [], pendingEvents: [], delayedEvents: [], recentEventIds: [], eventHistory: [], neighbors: [], outposts: [],
  };
}

test("valid strict save passes", () => {
  assert.equal(validateGameSave(validGame(), { strict: true }).ok, true);
});

test("invalid month and duplicate people fail", () => {
  const game = validGame();
  game.month = 13;
  game.people.push({ ...game.people[0], name: "Copy" });
  const result = validateGameSave(game, { strict: true });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((item) => item.path === "month"));
  assert.ok(result.issues.some((item) => item.message.includes("ID ซ้ำ")));
});
