import { createSaveEnvelope, isSaveEnvelope, migrateSavePayload, verifySaveEnvelope } from "./migrations.mjs";

export const MAX_MANUAL_SLOTS = 3;
export const MAX_AUTOSAVE_BACKUPS = 5;

export function createManualSlotRecord({ id, label, game, metadata = {} }) {
  return {
    id: String(id),
    label: String(label || id),
    updatedAt: new Date().toISOString(),
    envelope: createSaveEnvelope(game, { source: "manual-slot", slotId: String(id), ...metadata }),
  };
}

export function normalizeManualSlotRecord(record) {
  if (!record || typeof record !== "object" || !record.id) return { ok: false, reason: "invalid-record", record: null };
  try {
    const envelope = isSaveEnvelope(record.envelope)
      ? record.envelope
      : isSaveEnvelope(record.game)
        ? record.game
        : record.game && typeof record.game === "object"
          ? createSaveEnvelope(record.game, { source: "legacy-manual-slot", slotId: String(record.id) })
          : null;
    if (!envelope) return { ok: false, reason: "missing-game", record: null };
    const verified = verifySaveEnvelope(envelope);
    if (!verified.ok) return { ok: false, reason: verified.reason, record: { ...record, envelope, corrupted: true } };
    const migrated = migrateSavePayload(envelope);
    return {
      ok: true,
      reason: "ok",
      record: {
        id: String(record.id),
        label: String(record.label || record.id),
        updatedAt: String(record.updatedAt || envelope.savedAt || new Date(0).toISOString()),
        envelope: createSaveEnvelope(migrated.game, { source: "manual-slot-normalized", slotId: String(record.id) }),
        corrupted: false,
      },
      game: migrated.game,
    };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "invalid-record", record: { ...record, corrupted: true } };
  }
}

export function normalizeManualSlots(input) {
  const records = Array.isArray(input) ? input : [];
  const valid = [];
  const invalid = [];
  for (const raw of records.slice(0, MAX_MANUAL_SLOTS * 2)) {
    const result = normalizeManualSlotRecord(raw);
    if (result.ok && result.record) valid.push(result.record);
    else if (result.record?.id) invalid.push(result.record);
  }
  const byId = new Map();
  for (const record of valid) byId.set(record.id, record);
  return { valid: [...byId.values()].slice(0, MAX_MANUAL_SLOTS), invalid };
}

export function manualSlotGame(record) {
  const result = normalizeManualSlotRecord(record);
  if (!result.ok) throw new Error(`ช่องบันทึกเสียหาย: ${result.reason}`);
  return result.game;
}

export function rotateAutosaveBackups(existing, envelope, options = {}) {
  const limit = Math.max(1, Number(options.limit || MAX_AUTOSAVE_BACKUPS));
  if (!isSaveEnvelope(envelope) || !verifySaveEnvelope(envelope).ok) throw new Error("ไม่สามารถสำรองบันทึกที่ไม่ผ่านการตรวจความสมบูรณ์");
  const list = Array.isArray(existing) ? existing : [];
  const fingerprint = envelope.checksum;
  const next = [{ savedAt: envelope.savedAt, checksum: fingerprint, envelope }, ...list.filter((item) => item?.checksum !== fingerprint && isSaveEnvelope(item?.envelope) && verifySaveEnvelope(item.envelope).ok)];
  return next.slice(0, limit);
}

export function recoveryCandidates(currentEnvelope, backupRing = [], legacyBackup = null) {
  const candidates = [];
  if (currentEnvelope) candidates.push({ source: "current", envelope: currentEnvelope });
  for (const item of Array.isArray(backupRing) ? backupRing : []) {
    if (item?.envelope) candidates.push({ source: "rotating-backup", envelope: item.envelope });
  }
  if (legacyBackup) candidates.push({ source: "legacy-backup", envelope: legacyBackup });
  return candidates;
}

export function saveCheckpointReason(previous, next) {
  if (!previous) return "initial";
  if (previous.year !== next.year || previous.month !== next.month) return "month-change";
  if (previous.monthFlow?.phase !== next.monthFlow?.phase && next.monthFlow?.phase === "report") return "monthly-report";
  if (previous.stage !== next.stage) return "stage-change";
  if (previous.settlementName !== next.settlementName) return "settlement-name";
  if (previous.dynasty?.designatedHeirId !== next.dynasty?.designatedHeirId) return "heir-change";
  if ((previous.victory?.completedPaths?.length || 0) !== (next.victory?.completedPaths?.length || 0)) return "victory";
  if (previous.currentEventId !== next.currentEventId || previous.selectedChoiceId !== next.selectedChoiceId || previous.leaderActionSelected !== next.leaderActionSelected) return "decision";
  return "state-change";
}
