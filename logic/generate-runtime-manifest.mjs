import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { GAME_VERSION, SAVE_SCHEMA_VERSION } from "../config/version.mjs";

const root = process.cwd();
const sourceText = fs.readFileSync(path.join(root, "app/game/page.tsx"), "utf8");
const source = ts.createSourceFile("page.tsx", sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function objectPropertyCount(variableName) {
  let count = 0;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === variableName && node.initializer && ts.isObjectLiteralExpression(node.initializer)) count = node.initializer.properties.length;
    ts.forEachChild(node, visit);
  }
  visit(source);
  return count;
}
let choiceCalls = 0;
let eventWeightNodes = 0;
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(source) === "choice") choiceCalls += 1;
  if (ts.isPropertyAssignment(node) && node.name.getText(source).replace(/["']/g, "") === "weight") eventWeightNodes += 1;
  ts.forEachChild(node, visit);
}
visit(source);
const manifest = {
  generatedAt: new Date().toISOString(),
  gameVersion: GAME_VERSION,
  saveSchemaVersion: SAVE_SCHEMA_VERSION,
  runtimeSource: "app/game/page.tsx + engine/*.mjs",
  portableJsonRole: "reference-and-porting-draft",
  counts: {
    buildings: objectPropertyCount("buildingData"),
    research: objectPropertyCount("researchData"),
    staticChoiceFactories: choiceCalls,
    runtimeEventsLastRegression: 338,
    runtimeChoicesLastRegression: 1017,
    eventWeightNodes,
  },
  note: "ไฟล์ JSON ใน data/game เป็นข้อมูลอ้างอิง ไม่ใช่แหล่งข้อมูล Runtime เพียงชุดเดียว จนกว่าการย้ายข้อมูลออกจาก React จะเสร็จสมบูรณ์",
};
fs.writeFileSync(path.join(root, "data/game/runtime-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
