import test from "node:test";
import assert from "node:assert/strict";
import {
  VICTORY_PATHS,
  chooseVictoryPath,
  emptyDynastyState,
  evaluateVictory,
  heirCandidates,
  normalizeDynastyState,
  victoryProgress,
} from "../logic/dynasty-endgame.mjs";
import { migrateSavePayload } from "../save/migrations.mjs";

function gameFixture() {
  return {
    version: "0.9.40",
    saveVersion: "0.9.40",
    schemaVersion: 5,
    leaderName: "Elowen",
    houseName: "Vaelen",
    stage: "นครรัฐ",
    year: 18,
    month: 4,
    people: [
      { id: "leader", name: "Elowen", age: 68, alive: true, health: 72, morale: 80, kin: "ตระกูล Vaelen", houseName: "Vaelen", traits: ["สุขุม"], childrenIds: ["heir"] },
      { id: "heir", name: "Mira", age: 31, alive: true, health: 88, morale: 86, kin: "ตระกูล Vaelen", houseName: "Vaelen", traits: ["เรียนรู้ไว"], parentIds: ["leader"] },
      ...Array.from({ length: 118 }, (_, index) => ({ id: `p-${index}`, name: `P${index}`, age: 20, alive: true, health: 70, morale: 70, kin: "ชาวเมือง", traits: [] })),
    ],
    resources: { food: 4000, gold: 220, knowledge: 260 },
    metrics: { security: 90, trust: 80, health: 80, morale: 80, cohesion: 80, fairness: 80 },
    buildings: { marketSquare: 1, caravanPost: 1, palisade: 2, barracks: 2 },
    researchDone: Object.fromEntries(Array.from({ length: 36 }, (_, index) => [`r${index}`, true])),
    neighbors: [
      { tradeTreaty: true, alliance: true, atWar: false, relation: 75 },
      { tradeTreaty: true, alliance: true, atWar: false, relation: 70 },
      { tradeTreaty: true, alliance: false, atWar: false, relation: 65 },
    ],
    military: { soldiers: 80, readiness: 90, equipment: 90 },
    crisis: { resolved: true },
    casualties: [],
    logs: [],
    dynasty: { ...emptyDynastyState({ leaderName: "Elowen", people: [{ id: "leader", alive: true }] }), generation: 3, currentLeaderId: "leader" },
    victory: { chosenPath: "trade", completedPaths: [], achievedAt: null, ending: null, lastEvaluation: {} },
  };
}

test("legacy saves migrate dynasty, victory, and settlement naming into current schema", () => {
  const result = migrateSavePayload({ version: "0.9.38", schemaVersion: 4, leaderName: "Elowen", houseName: "Vaelen", people: [{ id: "leader", name: "Elowen", alive: true, kin: "ตระกูล Vaelen" }] });
  assert.equal(result.game.schemaVersion, 8);
  assert.equal(result.game.dynasty.generation, 1);
  assert.deepEqual(result.game.victory.completedPaths, []);
  assert.equal(result.game.people[0].houseName, "Vaelen");
});

test("heir candidates prioritize healthy blood relatives", () => {
  const candidates = heirCandidates(gameFixture());
  assert.equal(candidates[0].person.id, "heir");
  assert.equal(candidates[0].blood, true);
});

test("legacy path selection remains readable but current evaluation is automatic", () => {
  const game = gameFixture();
  const selected = chooseVictoryPath(game, "knowledge");
  assert.equal(selected.victory.chosenPath, "knowledge");
  const evaluated = evaluateVictory(selected);
  assert.equal(evaluated.victory.chosenPath, null);
  assert.ok(VICTORY_PATHS.knowledge.title.includes("ความรู้"));
});

test("all completed paths are detected automatically and generate an ending chronicle", () => {
  const game = gameFixture();
  const evaluated = evaluateVictory(game);
  assert.ok(evaluated.victory.completedPaths.includes("trade"));
  assert.ok(evaluated.victory.completedPaths.length > 1);
  assert.ok(evaluated.victory.ending.path in VICTORY_PATHS);
  assert.equal(evaluated.victory.ending.population, 120);
});

test("all victory paths expose understandable progress details", () => {
  const progress = victoryProgress(gameFixture());
  for (const [key, item] of Object.entries(progress)) {
    assert.ok(item.current >= 0 && item.current <= 100, key);
    assert.ok(item.details.length >= 3, key);
  }
});

test("dynasty normalization repairs missing current leader", () => {
  const game = gameFixture();
  const dynasty = normalizeDynastyState({ ...game, dynasty: { generation: 2, currentLeaderId: "missing" } });
  assert.equal(dynasty.currentLeaderId, "leader");
  assert.equal(dynasty.generation, 2);
});
