import test from "node:test";
import assert from "node:assert/strict";
import { CURRENT_GAME_VERSION, CURRENT_SCHEMA_VERSION, createSaveEnvelope, migrateSavePayload, verifySaveEnvelope } from "../save/migrations.mjs";

function legacyGame() {
  return {
    version: "0.9.32",
    leaderName: "Mara",
    houseName: "Vaelen",
    origin: "builder",
    year: 2,
    month: 4,
    stage: "ค่ายพักแรม",
    flags: null,
  };
}

test("legacy direct save migrates to current schema", () => {
  const result = migrateSavePayload(legacyGame());
  assert.equal(result.game.version, CURRENT_GAME_VERSION);
  assert.equal(result.game.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(typeof result.game.rng.seed, "string");
  assert.ok(Array.isArray(result.game.pendingEvents));
  assert.equal(result.game.difficulty, "normal");
  assert.ok(Array.isArray(result.game.eventHistory));
});

test("save envelope checksum verifies", () => {
  const migrated = migrateSavePayload(legacyGame()).game;
  const envelope = createSaveEnvelope(migrated, { source: "test" });
  assert.deepEqual(verifySaveEnvelope(envelope), { ok: true, reason: "ok" });
});

test("tampered envelope is detected and still migratable with warning", () => {
  const envelope = createSaveEnvelope(migrateSavePayload(legacyGame()).game);
  envelope.game.year = 999;
  assert.equal(verifySaveEnvelope(envelope).ok, false);
  const result = migrateSavePayload(envelope);
  assert.equal(result.checksumValid, false);
  assert.ok(result.warnings.length > 0);
});
