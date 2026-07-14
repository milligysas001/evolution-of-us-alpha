import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.E2E_PORT || (3400 + (process.pid % 900)));
const base = `http://127.0.0.1:${port}`;
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const runBrowser = process.env.BROWSER_E2E === "1";
const chromium = runBrowser ? [process.env.CHROMIUM_BIN, "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"].find((item) => item && fs.existsSync(item)) : null;
const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "eou-e2e-"));
const server = spawn(process.execPath, [nextBin, "start", "-p", String(port), "-H", "127.0.0.1"], {
  cwd: root,
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  stdio: "ignore",
  detached: process.platform !== "win32",
});
server.unref();
let serverOutput = "";

try {
  await waitForServer(`${base}/`, 45_000);
  const checks = [];
  for (const route of ["/", "/game"]) {
    const response = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) throw new Error(`${route} returned HTTP ${response.status}`);
    const html = await response.text();
    if (route === "/" && !html.includes("Evolution of Us")) throw new Error("home page brand text missing");
    if (html.includes("Application error") || html.includes("Internal Server Error")) throw new Error(`${route} contains a fatal error page`);
    checks.push({ route, status: response.status, bytes: Buffer.byteLength(html) });
  }

  const browserChecks = [];
  if (runBrowser) {
    if (!chromium) throw new Error("BROWSER_E2E=1 แต่ไม่พบ Chromium");
    for (const viewport of [{ name: "desktop", size: "1440,1000" }, { name: "mobile", size: "390,844" }]) {
      const screenshot = path.join(outputDir, `game-${viewport.name}.png`);
      const result = spawnSync(chromium, [
        "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
        `--window-size=${viewport.size}`, `--screenshot=${screenshot}`, "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=3500", `${base}/game`,
      ], { cwd: root, encoding: "utf8", timeout: 30_000, killSignal: "SIGKILL" });
      if (result.status !== 0) throw new Error(`Chromium ${viewport.name} failed: ${result.error?.message || result.stderr || result.stdout}`);
      const stat = fs.statSync(screenshot);
      if (stat.size < 8_000) throw new Error(`Chromium ${viewport.name} screenshot is unexpectedly small`);
      browserChecks.push({ viewport: viewport.name, bytes: stat.size });
    }
  }

  console.log(JSON.stringify({ status: "PASS", checks, browserMode: runBrowser ? "enabled" : "skipped-by-default", browserChecks }, null, 2));
} finally {
  stopServer();
  fs.rmSync(outputDir, { recursive: true, force: true });
}
process.exit(0);

function stopServer() {
  try {
    if (process.platform !== "win32" && server.pid) process.kill(-server.pid, "SIGTERM");
    else if (!server.killed) server.kill("SIGTERM");
  } catch {}

}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (server.exitCode !== null) throw new Error(`Next server exited early (${server.exitCode})\n${serverOutput}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Next server did not become ready\n${serverOutput}`);
}
