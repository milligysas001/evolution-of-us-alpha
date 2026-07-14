/* Runtime regression audit for Evolution of Us v0.9.51.
 * The TypeScript page is transpiled beside its source so all relative engine imports resolve.
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const { validateEventCollection } = require("../engine/event-integrity.mjs");
const { GAME_VERSION, SAVE_SCHEMA_VERSION } = require("../config/version.mjs");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "app", "game", "page.tsx");
const tempPath = path.join(root, "app", "game", ".audit-runtime-v0951.cjs");
const exportNames = [
  "allEvents", "createInitialGame", "buildingData", "researchData", "requiredBuildingStage", "requiredResearchStage",
  "buildingVisibleInStage", "researchVisibleInStage", "applyChoice", "resolveAnimals", "normalizeAnimalState",
  "animalBreedingEligibility", "animalCount", "foodNeedFor", "emptyResearch", "emptyBuildings", "emptyAnimalState",
  "resourceShortLabel", "stageRank"
];
function assert(condition, message) { if (!condition) throw new Error(message); }
function finiteNonNegative(obj, label) {
  for (const [key, value] of Object.entries(obj || {})) {
    assert(Number.isFinite(Number(value)), `${label}.${key} is not finite`);
    assert(Number(value) >= 0, `${label}.${key} is negative`);
  }
}
function loadRuntime() {
  let source = fs.readFileSync(sourcePath, "utf8");
  source += `\nexport { ${exportNames.join(", ")} };\n`;
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: sourcePath,
  }).outputText;
  fs.writeFileSync(tempPath, output);
  return require(tempPath);
}

try {
  const runtime = loadRuntime();
  const { allEvents, createInitialGame, buildingData, researchData, requiredBuildingStage, requiredResearchStage, buildingVisibleInStage, researchVisibleInStage, applyChoice, resolveAnimals, normalizeAnimalState, animalBreedingEligibility, animalCount, foodNeedFor, emptyResearch, emptyBuildings, emptyAnimalState, resourceShortLabel } = runtime;
  const stages = ["ค่ายพักแรม", "ชุมชนแรกเริ่ม", "หมู่บ้านถาวร", "เมืองเล็ก", "เมืองการค้า", "นครรัฐ", "อาณาจักร"];
  const origins = ["builder", "hunter", "healer", "keeper", "mediator"];
  const difficulties = ["story", "normal", "survival", "ironman"];
  const coverage = {};
  for (const difficulty of difficulties) {
    let minimum = Infinity;
    for (let index = 0; index < 50; index += 1) {
      const game = createInitialGame({ leaderName: `Audit${index}`, houseName: `Runtime${difficulty}${index}`, origin: origins[index % origins.length], difficulty });
      assert(game.version === GAME_VERSION, `new game version mismatch: ${game.version}`);
      assert(game.schemaVersion === undefined || game.schemaVersion === SAVE_SCHEMA_VERSION, "new game schema mismatch");
      assert(game.people.length === 15, `initial population is ${game.people.length}`);
      assert(new Set(game.people.map((person) => person.name)).size === game.people.length, "duplicate starting names in one settlement");
      const months = game.resources.food / Math.max(1, foodNeedFor(game));
      minimum = Math.min(minimum, months);
      finiteNonNegative(game.resources, "initial.resources");
    }
    coverage[difficulty] = Number(minimum.toFixed(2));
  }
  assert(coverage.story >= coverage.normal && coverage.normal >= coverage.survival && coverage.survival >= coverage.ironman, "starting food coverage is not ordered by difficulty");

  const buildingIds = Object.keys(buildingData);
  const researchIds = Object.keys(researchData);
  assert(buildingIds.length === 31, `expected 31 buildings, got ${buildingIds.length}`);
  assert(researchIds.length === 41, `expected 41 research items, got ${researchIds.length}`);
  for (const id of buildingIds) {
    const rows = Object.entries(buildingData[id].cost || {});
    assert(rows.length > 0, `${id} has no construction cost`);
    for (const [key, value] of rows) {
      assert(Number.isFinite(value) && value > 0, `${id}.${key} cost must be positive`);
      assert(resourceShortLabel(key) !== key, `${key} has no Thai resource label`);
    }
    assert(stages.includes(requiredBuildingStage(id)), `${id} has invalid building stage`);
  }
  for (const id of researchIds) assert(stages.includes(requiredResearchStage(id)), `${id} has invalid research stage`);
  const stageBase = createInitialGame({ leaderName: "Stage", houseName: "AuditStage", origin: "builder", difficulty: "normal" });
  for (let index = 0; index < stages.length; index += 1) {
    const game = { ...stageBase, stage: stages[index] };
    for (const id of buildingIds) assert(buildingVisibleInStage(game, id) === (stages.indexOf(requiredBuildingStage(id)) <= index), `building visibility mismatch: ${id}/${stages[index]}`);
    for (const id of researchIds) assert(researchVisibleInStage(game, id) === (stages.indexOf(requiredResearchStage(id)) <= index), `research visibility mismatch: ${id}/${stages[index]}`);
  }

  assert(allEvents.length === 338, `expected 338 events, got ${allEvents.length}`);
  const integrity = validateEventCollection(allEvents, { requireGlobalChoiceIds: true });
  assert(integrity.ok, integrity.issues.filter((row) => row.severity === "error").slice(0, 20).map((row) => `${row.path}: ${row.message}`).join("\n"));
  assert(integrity.stats.choices === 1017, `expected 1017 choices, got ${integrity.stats.choices}`);

  const richBase = createInitialGame({ leaderName: "Event", houseName: "RuntimeEvent", origin: "builder", difficulty: "normal" });
  const rich = {
    ...richBase,
    stage: "อาณาจักร",
    resources: Object.fromEntries(Object.keys(richBase.resources).map((key) => [key, 10000])),
    researchDone: Object.fromEntries(Object.keys(emptyResearch()).map((key) => [key, true])),
    buildings: Object.fromEntries(Object.keys(emptyBuildings()).map((key) => [key, 2])),
    animalState: { ...emptyAnimalState(), animals: { goats: 4, chickens: 8, dogs: 2, cows: 4, pigs: 4 }, health: 90, hunger: 0 },
    metrics: Object.fromEntries(Object.keys(richBase.metrics).map((key) => [key, 70])),
  };
  let choicesApplied = 0;
  for (const event of allEvents) {
    if (event.condition) assert(typeof event.condition(rich) === "boolean", `${event.id} condition did not return boolean`);
    assert(Number.isFinite(Number(event.weight(rich))), `${event.id} weight is not finite`);
    for (const choice of event.choices) {
      choicesApplied += 1;
      const result = applyChoice(structuredClone(rich), event, choice);
      finiteNonNegative(result.resources, `${event.id}/${choice.id}.resources`);
      finiteNonNegative(result.metrics, `${event.id}/${choice.id}.metrics`);
      assert(Array.isArray(result.people), `${event.id}/${choice.id} lost people array`);
    }
  }

  const animalBase = createInitialGame({ leaderName: "Animal", houseName: "RuntimeAnimal", origin: "builder", difficulty: "normal" });
  const oneGoat = { ...animalBase, researchDone: { ...animalBase.researchDone, animalKeeping: true, fodderPrep: true }, resources: { ...animalBase.resources, food: 1000, feed: 1000, water: 1000 }, animalState: { ...normalizeAnimalState(animalBase.animalState), animals: { goats: 1, chickens: 0, dogs: 0, cows: 0, pigs: 0 }, health: 90, hunger: 0 }, animalAction: "breed" };
  assert(!animalBreedingEligibility(oneGoat).ready, "single animal incorrectly eligible for breeding");
  for (let index = 0; index < 120; index += 1) assert(animalCount(resolveAnimals(structuredClone(oneGoat)).game) <= 1, "animal bred without a same-species pair");

  console.log(JSON.stringify({ status: "PASS", version: GAME_VERSION, schema: SAVE_SCHEMA_VERSION, initialRuns: 200, minimumStartingFoodCoverageMonths: coverage, buildingsChecked: buildingIds.length, researchChecked: researchIds.length, eventsChecked: integrity.stats.events, choicesValidated: integrity.stats.choices, choicesApplied, eventWarnings: integrity.stats.warnings, warningSamples: integrity.issues.filter((row) => row.severity === "warning").slice(0, 80).map((row) => { const match = row.path.match(/events\[(\d+)\]\.choices\[(\d+)\]/); const event = match ? allEvents[Number(match[1])] : null; const choice = match && event ? event.choices[Number(match[2])] : null; return { ...row, eventId: event?.id, eventTitle: event?.title, choiceId: choice?.id, choiceTitle: choice?.title, delta: choice?.delta }; }), animalNoPairSimulations: 120 }, null, 2));
} finally {
  try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
}
