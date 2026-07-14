export const MONTH_PHASES = Object.freeze({
  START: "month_start",
  PLANNING: "planning",
  DECISION: "decision",
  READY: "ready",
  RESOLVING: "resolving",
  REPORT: "report",
  COMPLETED: "completed",
});

export function monthKey(game) {
  return `${Number(game?.year || 1)}-${String(Number(game?.month || 1)).padStart(2, "0")}`;
}

export function emptyMonthFlow(game = {}) {
  return {
    phase: MONTH_PHASES.PLANNING,
    monthKey: monthKey(game),
    activeResolutionId: null,
    resolvedMonthKeys: [],
    lastCompletedResolutionId: null,
    interruptedRecovery: false,
  };
}

export function normalizeMonthFlow(game) {
  const currentKey = monthKey(game);
  const raw = game?.monthFlow && typeof game.monthFlow === "object" ? game.monthFlow : {};
  const valid = new Set(Object.values(MONTH_PHASES));
  let phase = valid.has(raw.phase) ? raw.phase : MONTH_PHASES.PLANNING;
  let interruptedRecovery = Boolean(raw.interruptedRecovery);

  // A browser refresh must never leave a save permanently locked in RESOLVING.
  if (phase === MONTH_PHASES.RESOLVING) {
    phase = MONTH_PHASES.READY;
    interruptedRecovery = true;
  }
  if (phase === MONTH_PHASES.REPORT && !game?.summaryModal) {
    // Legacy saves discarded the report modal. Continue safely instead of trapping the player.
    phase = MONTH_PHASES.PLANNING;
    interruptedRecovery = true;
  } else if (game?.summaryModal && phase !== MONTH_PHASES.REPORT) {
    // A saved report is authoritative and must be acknowledged before planning the next month.
    phase = MONTH_PHASES.REPORT;
  }
  if (raw.monthKey && raw.monthKey !== currentKey && phase !== MONTH_PHASES.REPORT) {
    phase = MONTH_PHASES.PLANNING;
  }
  // Outside resolution/report, derive the visible flow from the decisions that actually exist.
  // This makes save/load return to the correct planning state without trusting stale UI flags.
  if (phase !== MONTH_PHASES.RESOLVING && phase !== MONTH_PHASES.REPORT) {
    const leaderReady = Boolean(game?.leaderActionSelected);
    const eventReady = Boolean(game?.selectedChoiceId);
    phase = leaderReady && eventReady
      ? MONTH_PHASES.READY
      : leaderReady || eventReady
        ? MONTH_PHASES.DECISION
        : MONTH_PHASES.PLANNING;
  }

  return {
    phase,
    monthKey: currentKey,
    activeResolutionId: typeof raw.activeResolutionId === "string" ? raw.activeResolutionId : null,
    resolvedMonthKeys: Array.isArray(raw.resolvedMonthKeys) ? raw.resolvedMonthKeys.filter((item) => typeof item === "string").slice(-36) : [],
    lastCompletedResolutionId: typeof raw.lastCompletedResolutionId === "string" ? raw.lastCompletedResolutionId : null,
    interruptedRecovery,
  };
}

export function monthReadiness(game, options = {}) {
  const reasons = [];
  if (options.requireLeader !== false && !game?.leaderActionSelected) reasons.push("ยังไม่ได้เลือกการกระทำของผู้นำ");
  if (options.requireEvent !== false && !game?.selectedChoiceId) reasons.push("ยังไม่ได้ตอบเหตุการณ์ประจำเดือน");
  if (options.extraReason) reasons.push(String(options.extraReason));
  return { ready: reasons.length === 0, reasons };
}

export function createResolutionId(game) {
  const rngCalls = Number(game?.rng?.calls || 0);
  const eventId = String(game?.currentEventId || "event").replace(/[^a-zA-Z0-9_-]+/g, "-");
  return `resolve-${monthKey(game)}-${rngCalls}-${eventId}`;
}

export function beginMonthResolution(game, options = {}) {
  const flow = normalizeMonthFlow(game);
  const readiness = monthReadiness(game, options);
  if (!readiness.ready) return { ok: false, game, reason: readiness.reasons.join(" · "), flow };
  if (flow.resolvedMonthKeys.includes(monthKey(game))) return { ok: false, game, reason: "เดือนนี้ถูกคำนวณผลแล้ว", flow };
  if (flow.phase === MONTH_PHASES.RESOLVING) return { ok: false, game, reason: "ระบบกำลังคำนวณผลเดือนนี้", flow };
  const resolutionId = createResolutionId(game);
  return {
    ok: true,
    resolutionId,
    game: {
      ...game,
      monthFlow: {
        ...flow,
        phase: MONTH_PHASES.RESOLVING,
        activeResolutionId: resolutionId,
        interruptedRecovery: false,
      },
    },
  };
}

export function finishMonthResolution(game, completedMonthKey, resolutionId) {
  const flow = normalizeMonthFlow(game);
  return {
    ...game,
    monthFlow: {
      ...flow,
      phase: MONTH_PHASES.REPORT,
      monthKey: monthKey(game),
      activeResolutionId: resolutionId,
      lastCompletedResolutionId: resolutionId,
      resolvedMonthKeys: Array.from(new Set([...(flow.resolvedMonthKeys || []), completedMonthKey])).slice(-36),
      interruptedRecovery: false,
    },
  };
}

export function enterPlanningPhase(game) {
  const flow = normalizeMonthFlow(game);
  return {
    ...game,
    monthFlow: {
      ...flow,
      phase: MONTH_PHASES.PLANNING,
      monthKey: monthKey(game),
      activeResolutionId: null,
      interruptedRecovery: false,
    },
  };
}
