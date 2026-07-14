import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const node = process.execPath;

function run(label, args) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(node, args, { cwd: root, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const tests = fs.readdirSync(path.join(root, "tests")).filter((name) => name.endsWith(".test.mjs")).sort().map((name) => path.join("tests", name));
run("TypeScript", [path.join("node_modules", "typescript", "bin", "tsc"), "--noEmit"]);
run("Data Schema", [path.join("logic", "validate-data-v0938.mjs")]);
run("Unit Tests", ["--test", ...tests]);
run("Legacy Regression Audit", [path.join("logic", "audit-v0936.cjs")]);
run("Stabilization Audit", [path.join("logic", "audit-v0937.mjs")]);
run("Balance and UX Audit", [path.join("logic", "audit-v0938.mjs")]);
run("Dynasty and Endgame Audit", [path.join("logic", "audit-v0939.mjs")]);
run("Narrative and Interface Audit", [path.join("logic", "audit-v0940.mjs")]);
run("Production Build", [path.join("node_modules", "next", "dist", "bin", "next"), "build"]);
console.log("\nALL CHECKS PASSED — Evolution of Us v0.9.40");
