/**
 * Generic deterministic monthly pipeline.
 * Each phase receives the current state, the shared change log, and context.
 */
export function runMonthlyPipeline(initialState, phases, context = {}) {
  let state = initialState;
  const changes = [];
  const trace = [];

  for (const phase of phases) {
    if (!phase || typeof phase.run !== "function") continue;
    const before = snapshotCore(state);
    const result = phase.run(state, changes, context);
    if (result && typeof result === "object" && "state" in result) {
      state = result.state;
      if (Array.isArray(result.changes)) changes.push(...result.changes);
    } else if (result !== undefined) {
      state = result;
    }
    const after = snapshotCore(state);
    trace.push({ id: String(phase.id || "phase"), before, after, delta: diffCore(before, after) });
  }

  return { state, changes, trace };
}

function snapshotCore(state) {
  const resources = state?.resources && typeof state.resources === "object" ? { ...state.resources } : {};
  return {
    year: Number(state?.year ?? 0),
    month: Number(state?.month ?? 0),
    population: Array.isArray(state?.people) ? state.people.filter((person) => person?.alive !== false).length : 0,
    resources,
  };
}

function diffCore(before, after) {
  const resourceDelta = {};
  const keys = new Set([...Object.keys(before.resources || {}), ...Object.keys(after.resources || {})]);
  for (const key of keys) {
    const delta = Number(after.resources?.[key] ?? 0) - Number(before.resources?.[key] ?? 0);
    if (Math.abs(delta) > 1e-9) resourceDelta[key] = delta;
  }
  return {
    year: after.year - before.year,
    month: after.month - before.month,
    population: after.population - before.population,
    resources: resourceDelta,
  };
}
