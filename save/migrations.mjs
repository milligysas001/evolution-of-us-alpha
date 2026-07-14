import { createRngState, normalizeRngState } from "../engine/random.mjs";
import { emptyDynastyState, emptyVictoryState, normalizeDynastyState, normalizeVictoryState } from "../logic/dynasty-endgame.mjs";

export const CURRENT_GAME_VERSION = "0.9.42";
export const CURRENT_SCHEMA_VERSION = 6;
export const SAVE_FORMAT = "evolution-of-us-save";

export function stableStringify(value) {
  return JSON.stringify(sortValue(value));
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((result, key) => {
    result[key] = sortValue(value[key]);
    return result;
  }, {});
}

export function checksum(value) {
  const text = typeof value === "string" ? value : stableStringify(value);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function createSaveEnvelope(game, metadata = {}) {
  const cleanGame = { ...game, version: CURRENT_GAME_VERSION, saveVersion: CURRENT_GAME_VERSION, schemaVersion: CURRENT_SCHEMA_VERSION };
  const payload = {
    format: SAVE_FORMAT,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    gameVersion: CURRENT_GAME_VERSION,
    savedAt: new Date().toISOString(),
    metadata: {
      houseName: String(cleanGame.houseName || ""),
      leaderName: String(cleanGame.leaderName || ""),
      year: Number(cleanGame.year || 1),
      month: Number(cleanGame.month || 1),
      stage: String(cleanGame.stage || "ค่ายพักแรม"),
      ...metadata,
    },
    game: cleanGame,
  };
  return { ...payload, checksum: checksum(payload) };
}

export function isSaveEnvelope(value) {
  return !!value && typeof value === "object" && value.format === SAVE_FORMAT && value.game && typeof value.game === "object";
}

export function verifySaveEnvelope(value) {
  if (!isSaveEnvelope(value)) return { ok: false, reason: "not-envelope" };
  const { checksum: stored, ...payload } = value;
  if (typeof stored !== "string") return { ok: false, reason: "missing-checksum" };
  return checksum(payload) === stored ? { ok: true, reason: "ok" } : { ok: false, reason: "checksum-mismatch" };
}

export function migrateSavePayload(input) {
  const warnings = [];
  const envelopeCheck = isSaveEnvelope(input) ? verifySaveEnvelope(input) : { ok: true, reason: "legacy-direct-save" };
  if (isSaveEnvelope(input) && !envelopeCheck.ok) warnings.push("รหัสตรวจความสมบูรณ์ของไฟล์บันทึกไม่ตรงกัน อาจถูกแก้ไขหรือเสียหาย");
  const source = isSaveEnvelope(input) ? input.game : input;
  if (!source || typeof source !== "object" || Array.isArray(source)) throw new Error("Save payload must be an object");

  let game = structuredCloneSafe(source);
  const fromVersion = String(game.saveVersion || game.version || "0.9.0");
  const fromSchema = Number(game.schemaVersion || (isSaveEnvelope(input) ? input.schemaVersion : 0) || 0);

  if (fromSchema < 1) {
    game.saveVersion = fromVersion;
    game.schemaVersion = 1;
  }
  if (fromSchema < 2) {
    const seed = String(game.seed || `${game.houseName || "House"}-${game.leaderName || "Leader"}`);
    game.rng = normalizeRngState(game.rng, seed);
    game.schemaVersion = 2;
  }
  if (fromSchema < 3) {
    game.flags = game.flags && typeof game.flags === "object" ? game.flags : {};
    game.pendingEvents = Array.isArray(game.pendingEvents) ? game.pendingEvents : [];
    game.delayedEvents = Array.isArray(game.delayedEvents) ? game.delayedEvents : [];
    game.recentEventIds = Array.isArray(game.recentEventIds) ? game.recentEventIds : [];
    game.schemaVersion = 3;
  }

  if (fromSchema < 4) {
    game.difficulty = ["story", "normal", "survival", "ironman"].includes(game.difficulty) ? game.difficulty : "normal";
    game.eventHistory = Array.isArray(game.eventHistory) ? game.eventHistory : [];
    game.schemaVersion = 4;
  }

  if (fromSchema < 5) {
    game.people = Array.isArray(game.people) ? game.people.map((person) => ({
      ...person,
      houseName: person.houseName || (String(person.kin || "").includes(game.houseName || "") ? game.houseName : ""),
      parentIds: Array.isArray(person.parentIds) ? person.parentIds : [],
      spouseId: typeof person.spouseId === "string" ? person.spouseId : null,
      childrenIds: Array.isArray(person.childrenIds) ? person.childrenIds : [],
      familyRole: person.familyRole || (person.id === "leader" ? "ผู้ก่อตั้ง" : String(person.kin || "").includes(game.houseName || "") ? "สมาชิกตระกูล" : "ชาวเมือง"),
    })) : [];
    game.dynasty = normalizeDynastyState({ ...game, dynasty: game.dynasty || emptyDynastyState(game) });
    game.victory = normalizeVictoryState({ ...game, victory: game.victory || emptyVictoryState() });
    game.schemaVersion = 5;
  }

  if (fromSchema < 6) {
    const stage = String(game.stage || "ค่ายพักแรม");
    const prefix = stage === "ค่ายพักแรม" ? "ค่ายตระกูล" : stage === "ชุมชนแรกเริ่ม" ? "ชุมชน" : stage === "หมู่บ้านถาวร" ? "หมู่บ้าน" : stage.includes("เมือง") ? "เมือง" : stage === "นครรัฐ" ? "นครรัฐ" : "อาณาจักร";
    game.settlementName = String(game.settlementName || `${prefix} ${game.houseName || "ไร้นาม"}`);
    game.pendingSettlementRename = Boolean(game.pendingSettlementRename);
    game.lastNamedStage = String(game.lastNamedStage || stage);
    game.settlementNameHistory = Array.isArray(game.settlementNameHistory) ? game.settlementNameHistory.slice(0, 24) : [];
    game.victory = { ...normalizeVictoryState(game), chosenPath: null };
    game.schemaVersion = 6;
  }

  game.dynasty = normalizeDynastyState(game);
  game.victory = normalizeVictoryState(game);

  const fallbackSeed = `${game.houseName || "House"}-${game.leaderName || "Leader"}-${game.year || 1}-${game.month || 1}`;
  game.rng = normalizeRngState(game.rng || createRngState(fallbackSeed), fallbackSeed);
  game.version = CURRENT_GAME_VERSION;
  game.saveVersion = CURRENT_GAME_VERSION;
  game.schemaVersion = CURRENT_SCHEMA_VERSION;

  return { game, fromVersion, fromSchema, warnings, checksumValid: envelopeCheck.ok };
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
