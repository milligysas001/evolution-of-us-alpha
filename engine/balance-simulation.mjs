import { createRngState, runWithRng, random } from "./random.mjs";

export const DIFFICULTY_TARGETS = Object.freeze({
  story: { min: 0.85, max: 0.95 },
  normal: { min: 0.65, max: 0.8 },
  survival: { min: 0.4, max: 0.6 },
  ironman: { min: 0.2, max: 0.4 },
});

export function runLightweightBalanceSimulation(config = {}) {
  const difficulty = config.difficulty || "normal";
  const runs = Math.max(1, Number(config.runs || 1000));
  const months = Math.max(1, Number(config.months || 12));
  let survived = 0;
  let totalFood = 0;
  let totalPopulation = 0;
  for (let i = 0; i < runs; i += 1) {
    const seed = `${config.seed || "balance"}-${difficulty}-${i}`;
    const result = runWithRng(createRngState(seed), () => simulateOne(difficulty, months));
    if (result.value.alive) survived += 1;
    totalFood += result.value.food;
    totalPopulation += result.value.population;
  }
  return {
    difficulty,
    runs,
    months,
    survivalRate: survived / runs,
    averageFood: totalFood / runs,
    averagePopulation: totalPopulation / runs,
    target: DIFFICULTY_TARGETS[difficulty] || DIFFICULTY_TARGETS.normal,
  };
}

function simulateOne(difficulty, months) {
  const config = {
    story: { food: 175, production: 26.5, eventLoss: 9, shockChance: 0.24, famineLimit: 4, collapseChance: 0.008 },
    normal: { food: 140, production: 24.5, eventLoss: 12, shockChance: 0.33, famineLimit: 3, collapseChance: 0.024 },
    survival: { food: 118, production: 23.5, eventLoss: 15, shockChance: 0.40, famineLimit: 3, collapseChance: 0.041 },
    ironman: { food: 112, production: 22.8, eventLoss: 17, shockChance: 0.46, famineLimit: 3, collapseChance: 0.070 },
  }[difficulty] || { food: 140, production: 24.5, eventLoss: 12, shockChance: 0.33, famineLimit: 3, collapseChance: 0.024 };
  let food = config.food;
  let population = 15;
  let alive = true;
  let famineMonths = 0;
  for (let month = 0; month < months; month += 1) {
    const production = config.production * (0.65 + random() * 0.55);
    const consumption = population * 1.62;
    const eventLoss = random() < config.shockChance ? (0.35 + random() * 0.85) * config.eventLoss : 0;
    food += production - consumption - eventLoss;
    if (random() < config.collapseChance) { alive = false; break; }
    if (food < consumption * 0.2) famineMonths += 1;
    else famineMonths = Math.max(0, famineMonths - 1);
    if (food < 0) {
      const losses = random() < 0.72 ? 1 + (random() < 0.18 ? 1 : 0) : 0;
      population -= losses;
      food = 0;
    }
    if (famineMonths > config.famineLimit || population <= 9) { alive = false; break; }
    if (food > consumption * 4 && random() < 0.06) population += 1;
  }
  return { alive, food, population };
}
