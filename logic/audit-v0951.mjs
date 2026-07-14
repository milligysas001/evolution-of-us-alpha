import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import ts from "typescript";
import { GAME_VERSION, SAVE_SCHEMA_VERSION, BUILD_NAME } from "../config/version.mjs";
import { CURRENT_GAME_VERSION, CURRENT_SCHEMA_VERSION, createSaveEnvelope, migrateSavePayload, verifySaveEnvelope } from "../save/migrations.mjs";
import { createManualSlotRecord, normalizeManualSlotRecord, rotateAutosaveBackups } from "../save/save-manager.mjs";

const root = process.cwd();
const pagePath = path.join(root, "app/game/page.tsx");
const homePath = path.join(root, "app/page.tsx");
const pageText = fs.readFileSync(pagePath, "utf8");
const homeText = fs.readFileSync(homePath, "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "data/game/runtime-manifest.json"), "utf8"));

assert.equal(CURRENT_GAME_VERSION, GAME_VERSION);
assert.equal(CURRENT_SCHEMA_VERSION, SAVE_SCHEMA_VERSION);
assert.equal(pkg.version, GAME_VERSION);
assert.equal(lock.version, GAME_VERSION);
assert.equal(lock.packages?.[""]?.version, GAME_VERSION);
assert.ok(BUILD_NAME.length > 10);
assert.ok(!pageText.includes('summaryModal: null, savedText: "บันทึกเรียบร้อย"'), "monthly report must not be discarded by safe save");
assert.ok(pageText.includes("autosaveRingKey"));
assert.ok(pageText.includes("createManualSlotRecord"));
assert.ok(pageText.includes("appendStateDiffLedger(prev, next"));
assert.ok(pageText.includes("pageWorkers"), "workforce pagination missing");
assert.ok(homeText.includes("manualSlotGame"), "home manual slot loader must verify envelope");
assert.ok(!pageText.includes('const portableDataVersion = "0.9.16"'));
assert.ok(!homeText.includes("รุ่นทดสอบ v0.9.41"));
assert.ok(!pageText.includes("248655"), "ห้ามฝังรหัสผู้พัฒนาใน Client");
assert.ok(pageText.includes('process.env.NODE_ENV !== "production"'), "เครื่องมือนักพัฒนาต้องถูกซ่อนใน Production");
assert.ok(pkg.scripts?.["e2e:smoke"], "missing production route smoke test");
assert.ok(pkg.scripts?.["audit:runtime"], "missing runtime game audit");
assert.equal(manifest.gameVersion, GAME_VERSION);
assert.ok(manifest.counts.buildings >= 31);
assert.ok(manifest.counts.research >= 41);
assert.ok(manifest.counts.staticChoiceFactories >= 200);
assert.equal(manifest.counts.runtimeEventsLastRegression, 338);
assert.equal(manifest.counts.runtimeChoicesLastRegression, 1017);

const source = ts.createSourceFile("page.tsx", pageText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const generic = new Set(["รับมืออย่างระมัดระวัง", "ใช้แรงงานแก้ปัญหาทันที", "ให้ชุมชนร่วมตัดสินใจ", "ตรวจสอบอย่างรอบคอบ"]);
const resourceKeys = new Set(["food","wood","stone","tools","herbs","hides","water","waterReserve","knowledge","fuel","ore","gold","feed","ironOre","coal","timber","bricks","textiles","salt","spices","influence","steel","luxuries","warhorses","manpower","siegeMaterials"]);
const choiceIds = new Set();
const errors = [];
const warnings = [];
let choices = 0;
function literal(node) { return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : null; }
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(source) === "choice") {
    choices += 1;
    const [idNode, , titleNode, , hintNode, deltaNode] = node.arguments;
    const id = literal(idNode); const title = literal(titleNode); const hint = literal(hintNode);
    const generatedChoice = !id && ts.isTemplateExpression(idNode) && idNode.head.text === "" && idNode.templateSpans.length === 1 && idNode.templateSpans[0].expression.getText(source) === "seed.id";
    if (!id && !generatedChoice) errors.push("choice id ต้องเป็นข้อความคงที่หรือรูปแบบ seed.id ที่ตรวจสอบได้");
    else if (id && choiceIds.has(id)) warnings.push(`choice id ซ้ำข้าม Event: ${id}`);
    else if (id) choiceIds.add(id);
    const generatedTitle = !title && titleNode?.getText(source).startsWith("copy.");
    if (!title && !generatedTitle) errors.push(`choice ${id || "generated"} ไม่มีชื่อคงที่หรือชื่อจาก contextualChoiceCopy`);
    else if (generic.has(title)) warnings.push(`choice ${id} ใช้ข้อความกว้างเกินไป: ${title}`);
    const generatedHint = !hint && hintNode?.getText(source).startsWith("describeChoiceOutcome(");
    if (!hint?.trim() && !generatedHint) warnings.push(`choice ${id || "generated"} ไม่มีคำอธิบายผล`);
    if (deltaNode && ts.isObjectLiteralExpression(deltaNode)) {
      const resourceProp = deltaNode.properties.find((prop) => prop.name?.getText(source).replace(/["']/g, "") === "resources");
      if (resourceProp && ts.isPropertyAssignment(resourceProp) && ts.isObjectLiteralExpression(resourceProp.initializer)) {
        for (const prop of resourceProp.initializer.properties) {
          const key = prop.name?.getText(source).replace(/["']/g, "");
          if (key && !resourceKeys.has(key)) errors.push(`choice ${id} อ้างทรัพยากรที่ไม่มี: ${key}`);
        }
      }
    }
  }
  ts.forEachChild(node, visit);
}
visit(source);
assert.equal(errors.length, 0, errors.slice(0, 20).join("\n"));
assert.ok(choices >= 200);

const minimal = {
  version: "0.9.42", schemaVersion: 6, leaderName: "Audit", houseName: "Integrity", origin: "builder", difficulty: "normal", stage: "ค่ายพักแรม", settlementName: "ค่าย Audit", pendingSettlementRename: false, settlementNameHistory: [], year: 1, month: 1,
  resources: {}, metrics: { morale: 50, security: 50, trust: 50, health: 50, cohesion: 50, fairness: 50 }, people: [{ id: "leader", name: "Audit", age: 30, health: 100, morale: 80, fatigue: 0, alive: true }],
};
const migrated = migrateSavePayload(minimal).game;
assert.equal(migrated.schemaVersion, SAVE_SCHEMA_VERSION);
assert.ok(migrated.saveRuntime);
const envelope = createSaveEnvelope({ ...migrated, summaryModal: { title: "รายงาน", paragraphs: ["ทดสอบ"], changes: [], kind: "normal" }, monthFlow: { ...migrated.monthFlow, phase: "report" } });
assert.equal(verifySaveEnvelope(envelope).ok, true);
assert.equal(migrateSavePayload(envelope).game.summaryModal.title, "รายงาน");
const slot = createManualSlotRecord({ id: "slot-1", label: "ทดสอบ", game: migrated });
assert.equal(normalizeManualSlotRecord(slot).ok, true);
assert.equal(rotateAutosaveBackups([], envelope).length, 1);

console.log(JSON.stringify({ ok: true, version: GAME_VERSION, schema: SAVE_SCHEMA_VERSION, runtime: manifest.counts, choiceAudit: { choices, warnings: warnings.length, sampleWarnings: warnings.slice(0, 12) } }, null, 2));
