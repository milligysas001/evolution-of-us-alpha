/* Evolution of Us v0.9.35 regression audit.
 * It transpiles the current game module temporarily so real runtime data/functions are tested.
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "app", "game", "page.tsx");
const tempPath = path.join(root, ".audit-page-v0935.cjs");
const exportNames = [
  "allEvents", "createInitialGame", "buildingData", "researchData", "requiredBuildingStage", "requiredResearchStage",
  "buildingVisibleInStage", "researchVisibleInStage", "applyChoice", "resolveAnimals", "normalizeAnimalState",
  "animalBreedingEligibility", "animalCount", "foodNeedFor", "payCost", "hasCost", "emptyResearch", "emptyBuildings",
  "emptyAnimalState", "resourceShortLabel", "stageRank"
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function finiteObject(obj, label) {
  for (const [key, value] of Object.entries(obj ?? {})) {
    assert(Number.isFinite(value), `${label}.${key} is not finite`);
    assert(value >= 0, `${label}.${key} is negative`);
  }
}
function loadRuntime() {
  let source = fs.readFileSync(sourcePath, "utf8");
  source += `\nexport { ${exportNames.join(", ")} };\n`;
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: sourcePath,
  }).outputText;
  fs.writeFileSync(tempPath, output);
  return require(tempPath);
}

let runtime;
try {
  runtime = loadRuntime();
  const {
    allEvents, createInitialGame, buildingData, researchData, requiredBuildingStage, requiredResearchStage,
    buildingVisibleInStage, researchVisibleInStage, applyChoice, resolveAnimals, normalizeAnimalState,
    animalBreedingEligibility, animalCount, foodNeedFor, payCost, hasCost, emptyResearch, emptyBuildings,
    emptyAnimalState, resourceShortLabel,
  } = runtime;

  const stages = ["ค่ายพักแรม", "ชุมชนแรกเริ่ม", "หมู่บ้านถาวร", "เมืองเล็ก", "เมืองการค้า", "นครรัฐ", "อาณาจักร"];
  const origins = ["builder", "hunter", "healer", "keeper", "mediator"];
  const initialRuns = 250;
  let minFoodMonths = Infinity;
  let minRemainingWood = Infinity;

  for (let index = 0; index < initialRuns; index++) {
    let game = createInitialGame({ leaderName: `Audit${index}`, houseName: "Test", origin: origins[index % origins.length] });
    assert(game.people.length === 15, `initial population is ${game.people.length}, expected 15`);
    const need = foodNeedFor(game);
    const months = game.resources.food / Math.max(1, need);
    minFoodMonths = Math.min(minFoodMonths, months);
    assert(months >= 8.5, `starting food only covers ${months.toFixed(2)} months before spoilage buffer`);
    let reserve = game.resources.food;
    for (let month = 1; month <= 6; month++) {
      assert(reserve >= need, `starting food ran out before month ${month}`);
      reserve -= need;
      const worstCaseSpoil = Math.floor(Math.max(0, reserve - 35) * 0.18);
      reserve -= worstCaseSpoil;
    }
    assert(reserve >= 0, "starting food did not survive six-month worst-case spoilage simulation");

    const bundle = ["shelter", "shelter", "shelter", "campfire", "storage"];
    for (const id of bundle) {
      assert(hasCost(game, buildingData[id].cost), `starting resources cannot pay for ${id}`);
      game = payCost(game, buildingData[id].cost);
    }
    minRemainingWood = Math.min(minRemainingWood, game.resources.wood);
    finiteObject(game.resources, "startingBundle.resources");
  }

  const buildingIds = Object.keys(buildingData);
  assert(buildingIds.length === 29, `expected 29 buildings, got ${buildingIds.length}`);
  for (const id of buildingIds) {
    const cost = buildingData[id].cost;
    const rows = Object.entries(cost);
    assert(rows.length > 0, `${id} has no construction cost`);
    for (const [key, value] of rows) {
      assert(Number.isFinite(value) && value > 0, `${id}.${key} cost must be positive`);
      assert(resourceShortLabel(key) !== key, `${key} has no Thai resource label`);
    }
    assert(stages.includes(requiredBuildingStage(id)), `${id} has invalid stage`);
  }
  for (const id of Object.keys(researchData)) assert(stages.includes(requiredResearchStage(id)), `${id} has invalid research stage`);

  const stageGame = createInitialGame({ leaderName: "Stage", houseName: "Audit", origin: "builder" });
  for (let i = 0; i < stages.length; i++) {
    const game = { ...stageGame, stage: stages[i] };
    for (const id of buildingIds) {
      const visible = buildingVisibleInStage(game, id);
      const should = stages.indexOf(requiredBuildingStage(id)) <= i;
      assert(visible === should, `building stage visibility mismatch: ${id} at ${stages[i]}`);
    }
    for (const id of Object.keys(researchData)) {
      const visible = researchVisibleInStage(game, id);
      const should = stages.indexOf(requiredResearchStage(id)) <= i;
      assert(visible === should, `research stage visibility mismatch: ${id} at ${stages[i]}`);
    }
  }

  assert(allEvents.length === 336, `expected 336 events, got ${allEvents.length}`);
  const eventIds = new Set();
  const choiceIds = new Set();
  let choiceCount = 0;
  for (const event of allEvents) {
    assert(event.id && !eventIds.has(event.id), `duplicate/blank event id: ${event.id}`);
    eventIds.add(event.id);
    assert(Array.isArray(event.choices) && event.choices.length > 0, `${event.id} has no choices`);
    for (const choice of event.choices) {
      choiceCount++;
      assert(choice.id && !choiceIds.has(choice.id), `duplicate/blank choice id: ${choice.id}`);
      choiceIds.add(choice.id);
    }
  }
  assert(choiceCount === 1011, `expected 1011 choices, got ${choiceCount}`);

  const richBase = createInitialGame({ leaderName: "Event", houseName: "Audit", origin: "builder" });
  const rich = {
    ...richBase,
    stage: "อาณาจักร",
    resources: Object.fromEntries(Object.keys(richBase.resources).map((key) => [key, 10000])),
    researchDone: Object.fromEntries(Object.keys(emptyResearch()).map((key) => [key, true])),
    buildings: Object.fromEntries(Object.keys(emptyBuildings()).map((key) => [key, 2])),
    animalState: { ...emptyAnimalState(), animals: { goats: 4, chickens: 8, dogs: 2, cows: 4, pigs: 4 }, health: 90, hunger: 0 },
    metrics: Object.fromEntries(Object.keys(richBase.metrics).map((key) => [key, 70])),
  };
  for (const event of allEvents) {
    if (event.condition) assert(typeof event.condition(rich) === "boolean", `${event.id} condition did not return boolean`);
    assert(Number.isFinite(event.weight(rich)), `${event.id} weight is not finite`);
    for (const choice of event.choices) {
      const result = applyChoice(structuredClone(rich), event, choice);
      finiteObject(result.resources, `${event.id}/${choice.id}.resources`);
      finiteObject(result.metrics, `${event.id}/${choice.id}.metrics`);
      assert(Array.isArray(result.people), `${event.id}/${choice.id} lost people array`);
    }
  }

  const animalBase = createInitialGame({ leaderName: "Animal", houseName: "Audit", origin: "builder" });
  const oneGoat = {
    ...animalBase,
    researchDone: { ...animalBase.researchDone, animalKeeping: true, fodderPrep: true },
    resources: { ...animalBase.resources, food: 1000, feed: 1000, water: 1000 },
    animalState: { ...normalizeAnimalState(animalBase.animalState), animals: { goats: 1, chickens: 0, dogs: 0, cows: 0, pigs: 0 }, health: 90, hunger: 0 },
    animalAction: "breed",
  };
  assert(!animalBreedingEligibility(oneGoat).ready, "single animal incorrectly eligible for breeding");
  for (let i = 0; i < 120; i++) {
    const result = resolveAnimals(structuredClone(oneGoat)).game;
    assert(animalCount(result) <= 1, "animal bred without a same-species pair");
  }
  const goatPair = { ...oneGoat, animalState: { ...oneGoat.animalState, animals: { ...oneGoat.animalState.animals, goats: 2 } } };
  assert(animalBreedingEligibility(goatPair).ready, "healthy researched pair should be eligible to breed");
  const noResearch = { ...goatPair, researchDone: { ...goatPair.researchDone, animalKeeping: false } };
  assert(!animalBreedingEligibility(noResearch).ready, "breeding should require animalKeeping research");

  const pig = {
    ...animalBase,
    researchDone: { ...animalBase.researchDone, animalKeeping: true, fodderPrep: true },
    resources: { ...animalBase.resources, food: 1000, feed: 1000, water: 1000, hides: 0 },
    animalState: { ...normalizeAnimalState(animalBase.animalState), animals: { goats: 0, chickens: 0, dogs: 0, cows: 0, pigs: 1 }, health: 90, hunger: 0 },
    animalAction: "slaughter",
  };
  const pigResult = resolveAnimals(structuredClone(pig)).game;
  assert(pigResult.resources.food === 1022, `pig slaughter should add 22 food, got ${pigResult.resources.food - 1000}`);
  assert(pigResult.resources.hides === 1, "pig slaughter should add 1 hide");
  assert(normalizeAnimalState(pigResult.animalState).animals.pigs === 0, "pig was not removed after slaughter");

  console.log(JSON.stringify({
    status: "PASS",
    version: "0.9.35",
    initialRuns,
    populationEachRun: 15,
    minimumStartingFoodCoverageMonths: Number(minFoodMonths.toFixed(2)),
    minimumWoodAfterThreeSheltersCampfireStorage: minRemainingWood,
    buildingsChecked: buildingIds.length,
    researchChecked: Object.keys(researchData).length,
    eventsChecked: allEvents.length,
    choicesApplied: choiceCount,
    animalNoPairSimulations: 120,
  }, null, 2));
} finally {
  try { if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
}
