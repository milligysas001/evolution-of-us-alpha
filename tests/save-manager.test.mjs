import test from "node:test";
import assert from "node:assert/strict";
import { createSaveEnvelope, migrateSavePayload, verifySaveEnvelope } from "../save/migrations.mjs";
import { createManualSlotRecord, manualSlotGame, normalizeManualSlotRecord, rotateAutosaveBackups } from "../save/save-manager.mjs";
import { runHeadlessCoreSimulation } from "../engine/headless-core-runner.mjs";

function game() {
  return migrateSavePayload({ version: "0.9.42", schemaVersion: 6, leaderName: "Nora", houseName: "Vale", origin: "builder", difficulty: "normal", stage: "ค่ายพักแรม", settlementName: "ค่าย Vale", pendingSettlementRename: false, settlementNameHistory: [], year: 1, month: 1, resources: {}, metrics: { morale: 50, security: 50, trust: 50, health: 50, cohesion: 50, fairness: 50 }, people: [{ id: "leader", name: "Nora", age: 30, health: 100, morale: 80, fatigue: 0, alive: true }] }).game;
}

test("schema 8 preserves the monthly report", () => {
  const source = { ...game(), summaryModal: { title: "เดือนแรก", paragraphs: ["เรื่องราว"], changes: ["อาหาร -2"], kind: "normal" }, monthFlow: { ...game().monthFlow, phase: "report" } };
  const envelope = createSaveEnvelope(source);
  assert.equal(verifySaveEnvelope(envelope).ok, true);
  const loaded = migrateSavePayload(envelope).game;
  assert.equal(loaded.monthFlow.phase, "report");
  assert.equal(loaded.summaryModal.title, "เดือนแรก");
});

test("manual slots use checksummed envelopes and reject tampering", () => {
  const slot = createManualSlotRecord({ id: "slot-1", label: "หลัก", game: game() });
  assert.equal(normalizeManualSlotRecord(slot).ok, true);
  assert.equal(manualSlotGame(slot).houseName, "Vale");
  slot.envelope.game.year = 999;
  assert.equal(normalizeManualSlotRecord(slot).ok, false);
});

test("autosave backup ring rotates five unique checkpoints", () => {
  let ring = [];
  for (let index = 0; index < 7; index += 1) ring = rotateAutosaveBackups(ring, createSaveEnvelope({ ...game(), month: (index % 12) + 1 }, { checkpoint: index }));
  assert.equal(ring.length, 5);
  assert.equal(new Set(ring.map((item) => item.checksum)).size, 5);
});

test("headless integrated core runs 100 years without duplicate month resolution", () => {
  const result = runHeadlessCoreSimulation({ difficulty: "story", strategy: "balanced", runs: 1, months: 1200, seed: "century", sandbox: true });
  assert.equal(result.resolvedMonths, 1200);
  assert.ok(result.elapsedMs < 5000);
});
