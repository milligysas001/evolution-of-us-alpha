export function ageWorkFactor(age) {
  const value = Number(age || 0);
  if (value < 8) return 0;
  if (value <= 15) return 0.5;
  if (value <= 59) return 1;
  if (value <= 69) return 0.65;
  return 0.4;
}

export function effectiveWorkerPower(person, options = {}) {
  if (!person || person.alive === false) return 0;
  let factor = ageWorkFactor(person.age);
  if (factor <= 0) return 0;
  if (person.age >= 8 && person.age <= 15 && options.hasAdultSupervisor === false) return 0;
  if (person.sick) factor *= 0.45;
  if (person.injured) factor *= 0.45;
  const health = clamp(Number(person.health ?? 100), 0, 100) / 100;
  const fatigue = clamp(Number(person.fatigue ?? 0), 0, 100);
  factor *= Math.max(0.25, health);
  factor *= Math.max(0.2, 1 - fatigue / 125);
  factor *= Number(options.jobBonus || 1);
  return Math.round(factor * 1000) / 1000;
}

export function economySnapshot(game) {
  const population = Array.isArray(game?.people) ? game.people.filter((person) => person?.alive !== false).length : 0;
  const resources = game?.resources || {};
  const monthlyFoodNeed = Math.max(1, population * 1.5);
  const monthlyWaterNeed = Math.max(1, population * 1.2);
  return {
    population,
    monthlyFoodNeed,
    monthlyWaterNeed,
    foodMonths: Number(resources.food || 0) / monthlyFoodNeed,
    waterMonths: Number(resources.water || 0) / monthlyWaterNeed,
    laborAssigned: Object.values(game?.labor || {}).reduce((sum, value) => sum + Number(value || 0), 0),
  };
}

export function validateLaborAssignments(game, assignments = game?.laborAssignments || {}) {
  const issues = [];
  const seen = new Map();
  const people = new Map((Array.isArray(game?.people) ? game.people : []).map((person) => [person.id, person]));
  for (const [job, ids] of Object.entries(assignments || {})) {
    for (const id of Array.isArray(ids) ? ids : []) {
      if (!people.has(id)) issues.push({ severity: "error", job, personId: id, message: "อ้างบุคคลที่ไม่มีอยู่" });
      if (seen.has(id)) issues.push({ severity: "error", job, personId: id, message: `ถูกจัดซ้ำกับงาน ${seen.get(id)}` });
      seen.set(id, job);
    }
  }
  return { ok: issues.length === 0, issues };
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
