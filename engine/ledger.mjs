const MAX_CURRENT_ENTRIES = 500;
const MAX_HISTORY_MONTHS = 48;

export function emptyLedger(game = {}) {
  return {
    currentMonthKey: ledgerMonthKey(game),
    current: [],
    history: [],
    sequence: 0,
  };
}

export function ledgerMonthKey(game) {
  return `${Number(game?.year || 1)}-${String(Number(game?.month || 1)).padStart(2, "0")}`;
}

export function normalizeLedger(game) {
  const raw = game?.ledger && typeof game.ledger === "object" ? game.ledger : {};
  return {
    currentMonthKey: typeof raw.currentMonthKey === "string" ? raw.currentMonthKey : ledgerMonthKey(game),
    current: Array.isArray(raw.current) ? raw.current.filter(validEntry).slice(-MAX_CURRENT_ENTRIES) : [],
    history: Array.isArray(raw.history) ? raw.history.filter((item) => item && typeof item === "object").slice(-MAX_HISTORY_MONTHS) : [],
    sequence: Number.isInteger(raw.sequence) && raw.sequence >= 0 ? raw.sequence : 0,
  };
}

function validEntry(entry) {
  return entry && typeof entry === "object" && typeof entry.id === "string" && typeof entry.kind === "string" && Number.isFinite(entry.amount);
}

export function appendLedgerEntries(game, entries, options = {}) {
  if (!Array.isArray(entries) || entries.length === 0) return game;
  const ledger = normalizeLedger(game);
  const currentMonthKey = options.monthKey || ledgerMonthKey(game);
  const existingIds = new Set(ledger.current.map((entry) => entry.id));
  const accepted = [];
  let sequence = ledger.sequence;
  for (const raw of entries) {
    const amount = Number(raw?.amount || 0);
    if (!Number.isFinite(amount) || Math.abs(amount) < 1e-9) continue;
    sequence += 1;
    const id = String(raw.id || `${currentMonthKey}-${sequence}-${raw.kind || "entry"}-${raw.key || "value"}`);
    if (existingIds.has(id)) continue;
    existingIds.add(id);
    accepted.push({
      id,
      monthKey: currentMonthKey,
      resolutionId: raw.resolutionId || options.resolutionId || null,
      phase: String(raw.phase || options.phase || "action"),
      system: String(raw.system || options.system || "system"),
      kind: String(raw.kind || "resource"),
      key: String(raw.key || "unknown"),
      amount,
      reason: String(raw.reason || options.reason || "การเปลี่ยนแปลงในเกม"),
      detail: raw.detail ? String(raw.detail) : "",
    });
  }
  if (accepted.length === 0) return game;
  return {
    ...game,
    ledger: {
      ...ledger,
      currentMonthKey,
      current: [...ledger.current, ...accepted].slice(-MAX_CURRENT_ENTRIES),
      sequence,
    },
  };
}

export function resourceDiffEntries(before, after, options = {}) {
  const left = before?.resources && typeof before.resources === "object" ? before.resources : {};
  const right = after?.resources && typeof after.resources === "object" ? after.resources : {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const rows = [];
  for (const key of keys) {
    const amount = Number(right[key] || 0) - Number(left[key] || 0);
    if (Math.abs(amount) < 1e-9) continue;
    rows.push({
      kind: "resource",
      key,
      amount,
      system: options.system || "state-change",
      phase: options.phase || "action",
      reason: options.reason || "การเปลี่ยนแปลงทรัพยากร",
      resolutionId: options.resolutionId || null,
    });
  }
  return rows;
}

export function metricDiffEntries(before, after, options = {}) {
  const left = before?.metrics && typeof before.metrics === "object" ? before.metrics : {};
  const right = after?.metrics && typeof after.metrics === "object" ? after.metrics : {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const rows = [];
  for (const key of keys) {
    const amount = Number(right[key] || 0) - Number(left[key] || 0);
    if (Math.abs(amount) < 1e-9) continue;
    rows.push({
      kind: "metric",
      key,
      amount,
      system: options.system || "state-change",
      phase: options.phase || "action",
      reason: options.reason || "การเปลี่ยนแปลงสภาพเมือง",
      resolutionId: options.resolutionId || null,
    });
  }
  return rows;
}

export function appendStateDiffLedger(before, after, options = {}) {
  if (!before || !after) return after;
  const entries = [
    ...resourceDiffEntries(before, after, options),
    ...(options.includeMetrics ? metricDiffEntries(before, after, options) : []),
  ];
  return appendLedgerEntries(after, entries, options);
}

export function entriesFromPipelineTrace(trace, options = {}) {
  const entries = [];
  for (const row of Array.isArray(trace) ? trace : []) {
    const resourceDelta = row?.delta?.resources && typeof row.delta.resources === "object" ? row.delta.resources : {};
    for (const [key, amount] of Object.entries(resourceDelta)) {
      if (!Number.isFinite(Number(amount)) || Math.abs(Number(amount)) < 1e-9) continue;
      entries.push({
        id: `${options.resolutionId || "resolution"}-${row.id}-${key}`,
        resolutionId: options.resolutionId || null,
        phase: "monthly-resolution",
        system: String(row.id || "monthly-phase"),
        kind: "resource",
        key,
        amount: Number(amount),
        reason: options.reasonMap?.[row.id] || phaseLabel(row.id),
      });
    }
  }
  return entries;
}

export function closeLedgerMonth(game, completedMonthKey, entries = [], options = {}) {
  let withEntries = appendLedgerEntries(game, entries, { monthKey: completedMonthKey, resolutionId: options.resolutionId, phase: "monthly-resolution" });
  const ledger = normalizeLedger(withEntries);
  const monthEntries = ledger.current.filter((entry) => entry.monthKey === completedMonthKey);
  const previousHistory = ledger.history.filter((row) => row.monthKey !== completedMonthKey);
  const summary = summarizeLedgerEntries(monthEntries);
  return {
    ...withEntries,
    ledger: {
      currentMonthKey: ledgerMonthKey(game),
      current: [],
      history: [...previousHistory, { monthKey: completedMonthKey, resolutionId: options.resolutionId || null, entries: monthEntries, summary }].slice(-MAX_HISTORY_MONTHS),
      sequence: ledger.sequence,
    },
  };
}

export function summarizeLedgerEntries(entries) {
  const resources = {};
  const metrics = {};
  for (const entry of Array.isArray(entries) ? entries : []) {
    const target = entry.kind === "metric" ? metrics : resources;
    target[entry.key] = Number(target[entry.key] || 0) + Number(entry.amount || 0);
  }
  return { resources, metrics, count: Array.isArray(entries) ? entries.length : 0 };
}

export function latestLedgerMonth(game) {
  const ledger = normalizeLedger(game);
  return ledger.history.at(-1) || null;
}

function phaseLabel(id) {
  const labels = {
    "event-choice": "ผลจากการตัดสินใจเหตุการณ์",
    "camp-policies": "ผลจากนโยบายค่าย",
    weather: "ผลจากอากาศและฤดูกาล",
    "production-consumption": "การผลิตและการบริโภค",
    exploration: "ผลจากการสำรวจ",
    military: "ค่าใช้จ่ายและผลจากกองกำลัง",
    neighbors: "ความสัมพันธ์และการค้ากับเมืองข้างเคียง",
    "risks-health": "สุขภาพ การรักษา และความเสี่ยง",
    "dynasty-succession": "ครอบครัวและการสืบทอด",
    skills: "การพัฒนาความชำนาญ",
    "grief-recovery": "การฟื้นตัวจากความสูญเสีย",
    "delayed-events": "ผลเหตุการณ์ที่เกิดล่าช้า",
    "stage-progression": "การพัฒนาถิ่นฐาน",
  };
  return labels[id] || String(id || "ผลประจำเดือน");
}
