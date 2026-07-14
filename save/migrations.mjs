import { createRngState, normalizeRngState } from "../engine/random.mjs";
import { emptyDynastyState, emptyVictoryState, normalizeDynastyState, normalizeVictoryState } from "../logic/dynasty-endgame.mjs";
import { emptyMonthFlow, normalizeMonthFlow } from "../engine/month-flow.mjs";
import { emptyLedger, normalizeLedger } from "../engine/ledger.mjs";
import { GAME_VERSION, SAVE_SCHEMA_VERSION, SAVE_FORMAT } from "../config/version.mjs";

export const CURRENT_GAME_VERSION = GAME_VERSION;
export const CURRENT_SCHEMA_VERSION = SAVE_SCHEMA_VERSION;
export { SAVE_FORMAT };

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
      settlementName: String(cleanGame.settlementName || ""),
      population: Array.isArray(cleanGame.people) ? cleanGame.people.filter((person) => person?.alive !== false).length : 0,
      phase: String(cleanGame.monthFlow?.phase || "planning"),
      hasMonthlyReport: Boolean(cleanGame.summaryModal),
      resolutionId: cleanGame.monthFlow?.lastCompletedResolutionId || cleanGame.monthFlow?.activeResolutionId || null,
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

  if (fromSchema < 7) {
    game.monthFlow = emptyMonthFlow(game);
    game.ledger = emptyLedger(game);
    game.eventRuntime = game.eventRuntime && typeof game.eventRuntime === "object" ? game.eventRuntime : { cooldowns: {}, occurrences: {}, lastCategory: "", lastEventId: "" };
    game.integrationFlags = game.integrationFlags && typeof game.integrationFlags === "object" ? game.integrationFlags : { ledgerEnabled: true, eventIntegrityChecked: false };
    game.schemaVersion = 7;
  }


  if (fromSchema < 8) {
    // Schema 8 keeps the monthly report in the save so a refresh cannot strand the player in REPORT phase.
    game.summaryModal = normalizeSummaryModal(game.summaryModal);
    game.saveRuntime = game.saveRuntime && typeof game.saveRuntime === "object" ? game.saveRuntime : {
      lastCheckpoint: "migration",
      lastSavedAt: null,
      recoveryCount: 0,
    };
    game.schemaVersion = 8;
  }

  game.dynasty = normalizeDynastyState(game);
  game.victory = normalizeVictoryState(game);
  game.monthFlow = normalizeMonthFlow(game);
  game.ledger = normalizeLedger(game);
  game.eventRuntime = game.eventRuntime && typeof game.eventRuntime === "object" ? game.eventRuntime : { cooldowns: {}, occurrences: {}, lastCategory: "", lastEventId: "" };
  game.integrationFlags = game.integrationFlags && typeof game.integrationFlags === "object" ? game.integrationFlags : { ledgerEnabled: true, eventIntegrityChecked: false };
  game.summaryModal = normalizeSummaryModal(game.summaryModal);
  game.saveRuntime = game.saveRuntime && typeof game.saveRuntime === "object" ? game.saveRuntime : { lastCheckpoint: "normalization", lastSavedAt: null, recoveryCount: 0 };

  const fallbackSeed = `${game.houseName || "House"}-${game.leaderName || "Leader"}-${game.year || 1}-${game.month || 1}`;
  game.rng = normalizeRngState(game.rng || createRngState(fallbackSeed), fallbackSeed);
  game.version = CURRENT_GAME_VERSION;
  game.saveVersion = CURRENT_GAME_VERSION;
  game.schemaVersion = CURRENT_SCHEMA_VERSION;

  return { game, fromVersion, fromSchema, warnings, checksumValid: envelopeCheck.ok };
}

function normalizeSummaryModal(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const report = value.report && typeof value.report === "object" ? {
    eventTitle: String(value.report.eventTitle || ""),
    choiceTitle: String(value.report.choiceTitle || ""),
    leaderAction: String(value.report.leaderAction || ""),
    populationBefore: Number(value.report.populationBefore || 0),
    populationAfter: Number(value.report.populationAfter || 0),
    deaths: Number(value.report.deaths || 0),
    resourceRows: Array.isArray(value.report.resourceRows) ? value.report.resourceRows.slice(0, 64) : [],
    metricRows: Array.isArray(value.report.metricRows) ? value.report.metricRows.slice(0, 32) : [],
    warnings: Array.isArray(value.report.warnings) ? value.report.warnings.map(String).slice(0, 24) : [],
    ledgerRows: Array.isArray(value.report.ledgerRows) ? value.report.ledgerRows.slice(0, 96) : [],
  } : undefined;
  return {
    title: String(value.title || "รายงานจบเดือน"),
    paragraphs: Array.isArray(value.paragraphs) ? value.paragraphs.map(String).slice(0, 12) : [],
    changes: Array.isArray(value.changes) ? value.changes.map(String).slice(0, 240) : [],
    kind: ["normal","good","bad","death","rare","milestone"].includes(value.kind) ? value.kind : "normal",
    ...(report ? { report } : {}),
  };
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
