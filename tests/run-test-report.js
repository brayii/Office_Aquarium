const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
const mainTestScript = packageJson.scripts.test || "";
const scripts = mainTestScript
  .split("&&")
  .map(part => part.trim())
  .filter(part => /^npm\s+run\s+(?:test:|verify:)/.test(part));

if (!scripts.length) {
  console.error("No test scripts found in package.json test command.");
  process.exit(1);
}

const started = Date.now();
const results = [];

for (const command of scripts) {
  const name = command.replace(/^npm\s+run\s+/, "");
  const testStarted = Date.now();
  process.stdout.write(`\n[RUN] ${name}\n`);
  const result = spawnSync(command, {
    cwd: process.cwd(),
    shell: true,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20
  });
  const durationMs = Date.now() - testStarted;
  const passed = result.status === 0;
  results.push({ name, command, passed, status: result.status, durationMs });
  process.stdout.write(`[${passed ? "PASS" : "FAIL"}] ${name} (${(durationMs / 1000).toFixed(1)}s)\n`);
  if (!passed) {
    const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
    const tail = output.split(/\r?\n/).slice(-80).join("\n");
    process.stdout.write(`${tail}\n`);
  }
}

const passed = results.filter(result => result.passed).length;
const failed = results.length - passed;
const passRate = results.length ? Math.round((passed / results.length) * 1000) / 10 : 0;
const totalSeconds = Math.round((Date.now() - started) / 100) / 10;

const summary = {
  ok: failed === 0,
  total: results.length,
  passed,
  failed,
  passRate,
  totalSeconds,
  failedTests: results.filter(result => !result.passed).map(result => result.name)
};

process.stdout.write(`\nOffice Aquarium Test Report\n`);
process.stdout.write(`Result: ${summary.ok ? "PASS" : "FAIL"}\n`);
process.stdout.write(`Passed: ${passed}/${results.length} (${passRate}%)\n`);
process.stdout.write(`Runtime: ${totalSeconds}s\n`);
if (summary.failedTests.length) process.stdout.write(`Failed: ${summary.failedTests.join(", ")}\n`);
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

if (!summary.ok) process.exit(1);
