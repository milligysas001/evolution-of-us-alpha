import { createRngState, random, runWithRng } from "./random.mjs";
import { beginMonthResolution, emptyMonthFlow, enterPlanningPhase, finishMonthResolution, monthKey } from "./month-flow.mjs";
import { appendStateDiffLedger, closeLedgerMonth, emptyLedger } from "./ledger.mjs";
import { validateWorldSystems } from "./world-integrity.mjs";

const DIFFICULTY = {
  story: { food: 210, risk: .72, production: 1.12 },
  normal: { food: 150, risk: 1, production: 1 },
  survival: { food: 118, risk: 1.22, production: .94 },
  ironman: { food: 102, risk: 1.38, production: .9 },
};
const STRATEGIES = {
  balanced: { forage: .38, build: .18, care: .12, research: .14, guard: .18 },
  food: { forage: .58, build: .12, care: .1, research: .08, guard: .12 },
  research: { forage: .34, build: .12, care: .1, research: .3, guard: .14 },
  military: { forage: .36, build: .12, care: .08, research: .08, guard: .36 },
  random: null,
};

export function createHeadlessGame(options = {}) {
  const difficulty = options.difficulty || "normal";
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.normal;
  const people = Array.from({ length: 15 }, (_, index) => ({ id: `p-${index}`, name: `P${index}`, age: index < 2 ? 12 + index : 18 + (index * 3) % 45, health: 82, morale: 62, fatigue: 8, alive: true }));
  const game = {
    year: 1, month: 1, difficulty, leaderActionSelected: true, selectedChoiceId: "headless", currentEventId: "headless-month",
    resources: { food: cfg.food, water: 150, wood: 68, stone: 16, tools: 6, herbs: 4, gold: 0 },
    metrics: { morale: 55, security: 42, trust: 52, health: 56, cohesion: 50, fairness: 50 },
    people, buildings: {}, researchDone: {}, labor: {}, flags: {}, locations: {}, buildingCondition: {}, dynasty: {}, victory: {}, eventRuntime: {}, integrationFlags: {},
    animalState: { animals: { goats: 0, chickens: 0, dogs: 0, cows: 0, pigs: 0 } }, neighbors: [], outposts: [], military: { soldiers: 0 },
    logs: [], casualties: [], memories: [], rumors: [], notifications: [], pendingEvents: [], delayedEvents: [], recentEventIds: [], eventHistory: [],
  };
  game.monthFlow = emptyMonthFlow(game);
  game.ledger = emptyLedger(game);
  return game;
}

export function runHeadlessCoreSimulation(options = {}) {
  const runs = Math.max(1, Number(options.runs || 100));
  const months = Math.max(1, Number(options.months || 120));
  const strategy = options.strategy || "balanced";
  const difficulty = options.difficulty || "normal";
  const startedAt = performance.now();
  let survived = 0;
  let totalPopulation = 0;
  let totalFood = 0;
  let resolvedMonths = 0;
  for (let run = 0; run < runs; run += 1) {
    const seed = `${options.seed || "headless-core"}-${difficulty}-${strategy}-${run}`;
    const result = runWithRng(createRngState(seed), () => simulateRun(createHeadlessGame({ difficulty }), months, strategy, Boolean(options.sandbox)));
    survived += result.value.alive ? 1 : 0;
    totalPopulation += result.value.population;
    totalFood += result.value.food;
    resolvedMonths += result.value.resolvedMonths;
  }
  return {
    difficulty, strategy, runs, months,
    survivalRate: survived / runs,
    averagePopulation: totalPopulation / runs,
    averageFood: totalFood / runs,
    resolvedMonths,
    elapsedMs: Math.round((performance.now() - startedAt) * 100) / 100,
  };
}

function simulateRun(initial, months, strategyName, sandbox = false) {
  let game = initial;
  let resolvedMonths = 0;
  for (let index = 0; index < months; index += 1) {
    const begun = beginMonthResolution(game, { requireLeader: true, requireEvent: true });
    if (!begun.ok) throw new Error(`headless flow rejected month ${monthKey(game)}: ${begun.reason}`);
    const before = begun.game;
    let after = resolveCoreMonth(before, strategyName, sandbox);
    const completed = monthKey(before);
    after = appendStateDiffLedger(before, after, { system: "headless-core", phase: "monthly-resolution", reason: `กลยุทธ์ ${strategyName}`, resolutionId: begun.resolutionId, includeMetrics: true });
    after = closeLedgerMonth(after, completed, [], { resolutionId: begun.resolutionId });
    after = finishMonthResolution(after, completed, begun.resolutionId);
    resolvedMonths += 1;
    if (!validateWorldSystems(after).ok) throw new Error("headless world integrity failed");
    if (!sandbox && alive(after).length < 6) return result(after, false, resolvedMonths);
    game = enterPlanningPhase({ ...after, monthFlow: after.monthFlow, selectedChoiceId: "headless", leaderActionSelected: true });
  }
  return result(game, true, resolvedMonths);
}

function resolveCoreMonth(game, strategyName, sandbox = false) {
  const cfg = DIFFICULTY[game.difficulty] || DIFFICULTY.normal;
  const population = alive(game).length;
  const available = game.people.reduce((sum, person) => sum + (!person.alive ? 0 : person.age < 8 ? 0 : person.age <= 15 ? .5 : person.age >= 70 ? .4 : person.age >= 60 ? .65 : 1), 0);
  const split = strategyName === "random" ? randomSplit() : STRATEGIES[strategyName] || STRATEGIES.balanced;
  const foragePower = available * split.forage;
  const carePower = available * split.care;
  const guardPower = available * split.guard;
  const production = foragePower * (2.25 + random() * .65) * cfg.production;
  const consumption = population * 1.52;
  const shock = random() < .22 * cfg.risk ? (5 + random() * 18) * cfg.risk : 0;
  const rawFood = Math.max(0, game.resources.food + production - consumption - shock);
  const rawWater = Math.max(0, game.resources.water + available * .8 - population * 1.18);
  const nextFood = sandbox ? Math.max(rawFood, population * 12) : rawFood;
  const nextWater = sandbox ? Math.max(rawWater, population * 9) : rawWater;
  const shortage = sandbox ? false : nextFood < population * .55 || nextWater < population * .35;
  const diseaseChance = Math.max(.01, .13 * cfg.risk - carePower * .012);
  let people = game.people.map((person) => ({ ...person, age: game.month === 12 ? person.age + 1 : person.age, fatigue: Math.max(0, Math.min(100, person.fatigue + 7 - carePower * .15)), health: Math.max(0, Math.min(100, person.health + carePower * .1 - (shortage ? 8 : 0))) }));
  if (!sandbox && random() < diseaseChance) {
    const target = people.filter((person) => person.alive)[Math.floor(random() * population)];
    if (target) target.health -= 18 * cfg.risk;
  }
  people = people.map((person) => person.alive && person.health <= 0 ? { ...person, alive: sandbox, health: sandbox ? 35 : person.health } : person);
  if (!shortage && game.resources.food > population * 7 && random() < .025) people.push({ id: `born-${game.year}-${game.month}-${people.length}`, name: "New", age: 0, health: 78, morale: 60, fatigue: 0, alive: true });
  const month = game.month === 12 ? 1 : game.month + 1;
  const year = game.month === 12 ? game.year + 1 : game.year;
  return {
    ...game, year, month, people,
    resources: { ...game.resources, food: nextFood, water: nextWater, wood: game.resources.wood + available * split.build * 1.2, herbs: Math.max(0, game.resources.herbs + carePower * .08 - (random() < diseaseChance ? 1 : 0)) },
    metrics: { ...game.metrics, health: clamp(game.metrics.health + carePower * .14 - (shortage ? 7 : 0)), security: clamp(game.metrics.security + guardPower * .12 - random() * cfg.risk), morale: clamp(game.metrics.morale + (shortage ? -5 : 1)) },
    selectedChoiceId: "headless", leaderActionSelected: true,
  };
}
function randomSplit() {
  const values = [random(), random(), random(), random(), random()];
  const sum = values.reduce((a, b) => a + b, 0);
  const [forage, build, care, research, guard] = values.map((value) => value / sum);
  return { forage, build, care, research, guard };
}
function alive(game) { return game.people.filter((person) => person.alive !== false); }
function result(game, isAlive, resolvedMonths) { return { alive: isAlive, population: alive(game).length, food: game.resources.food, resolvedMonths }; }
function clamp(value) { return Math.max(0, Math.min(100, value)); }
