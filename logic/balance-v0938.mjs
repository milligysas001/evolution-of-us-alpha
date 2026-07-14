/** Pure helpers used by v0.9.38 balance tests and future engine extraction. */
export function workFactorForAge(age) {
  const value = Number(age);
  if (!Number.isFinite(value) || value < 8) return 0;
  if (value <= 15) return 0.5;
  if (value >= 60) return 0.55;
  return 1;
}

export const startingLocationByTerrain = Object.freeze({
  riverbank: "shallowStream",
  forestEdge: "deepWoods",
  rockyHollow: "rockyRidge",
  openMeadow: "huntingGround",
  coldHighland: "oldCave",
  marshland: "marshPools",
});

export function initialVisibleLocations(terrain) {
  const location = startingLocationByTerrain[terrain] ?? "shallowStream";
  return [location];
}

export function eventPacingMultiplierLite(history, event, difficulty = "normal") {
  const recent = Array.isArray(history) ? history : [];
  const category = String(event?.category ?? "ทั่วไป");
  const id = String(event?.id ?? "");
  let multiplier = 1;
  if (recent[0]?.id === id) multiplier *= 0.15;
  if (recent.slice(0, 1).some((entry) => entry.category === category)) multiplier *= 0.35;
  else if (recent.slice(0, 3).some((entry) => entry.category === category)) multiplier *= 0.65;
  else if (recent.slice(0, 6).some((entry) => entry.category === category)) multiplier *= 0.84;
  if (event?.rare && recent.slice(0, 12).some((entry) => entry.rare)) multiplier *= 0.55;
  const danger = Number(event?.danger ?? 0);
  const dangerScale = { story: 0.8, normal: 1, survival: 1.15, ironman: 1.28 }[difficulty] ?? 1;
  if (danger > 0) multiplier *= dangerScale;
  return Math.max(0.02, multiplier);
}
