/**
 * Deterministic pseudo-random generator for Evolution of Us.
 * Uses xorshift32 and stores the complete state in the save game.
 */

const UINT32_MAX_PLUS_ONE = 0x100000000;
let active = { seed: "EOU-default", state: 0x6d2b79f5, calls: 0 };

export function hashSeed(seed) {
  const text = String(seed || "EOU-default");
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 0x6d2b79f5;
}

export function normalizeSeed(seed) {
  return String(seed || "EOU-default").trim().slice(0, 96) || "EOU-default";
}

export function createSeed(prefix = "EOU") {
  let entropy = "";
  try {
    if (globalThis.crypto?.getRandomValues) {
      const values = new Uint32Array(3);
      globalThis.crypto.getRandomValues(values);
      entropy = Array.from(values, (value) => value.toString(36)).join("-");
    }
  } catch {
    entropy = "";
  }
  const stamp = Date.now().toString(36);
  return `${prefix}-${stamp}-${entropy || (performanceNowSafe() * 1000).toFixed(0)}`.slice(0, 96);
}

function performanceNowSafe() {
  try { return globalThis.performance?.now?.() ?? 0; } catch { return 0; }
}

export function createRngState(seed) {
  const normalized = normalizeSeed(seed);
  return { seed: normalized, state: hashSeed(normalized), calls: 0 };
}

export function normalizeRngState(value, fallbackSeed = "EOU-default") {
  const seed = normalizeSeed(value?.seed ?? fallbackSeed);
  const state = Number.isFinite(value?.state) ? (Number(value.state) >>> 0) : hashSeed(seed);
  const calls = Number.isFinite(value?.calls) ? Math.max(0, Math.floor(Number(value.calls))) : 0;
  return { seed, state: state || hashSeed(seed), calls };
}

export function setActiveRng(value) {
  active = normalizeRngState(value);
  return snapshotRng();
}

export function snapshotRng() {
  return { seed: active.seed, state: active.state >>> 0, calls: active.calls };
}

export function random() {
  let x = active.state >>> 0;
  x ^= (x << 13) >>> 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  active.state = (x >>> 0) || hashSeed(`${active.seed}:${active.calls + 1}`);
  active.calls += 1;
  return active.state / UINT32_MAX_PLUS_ONE;
}

export function randomInt(min, maxInclusive) {
  const low = Math.ceil(Number(min));
  const high = Math.floor(Number(maxInclusive));
  if (!Number.isFinite(low) || !Number.isFinite(high) || high < low) throw new Error(`Invalid randomInt range: ${min}..${maxInclusive}`);
  return low + Math.floor(random() * (high - low + 1));
}

export function pickRandom(items) {
  if (!Array.isArray(items) || items.length === 0) throw new Error("pickRandom requires a non-empty array");
  return items[randomInt(0, items.length - 1)];
}

export function shuffleRandom(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function uidFromRng(prefix = "id") {
  const partA = Math.floor(random() * UINT32_MAX_PLUS_ONE).toString(36);
  const partB = active.calls.toString(36);
  return `${prefix}-${partA}-${partB}`;
}

export function runWithRng(rngState, callback) {
  const previous = snapshotRng();
  setActiveRng(rngState);
  try {
    const value = callback();
    return { value, rng: snapshotRng() };
  } finally {
    setActiveRng(previous);
  }
}
