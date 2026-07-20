const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

async function main() {
  const longRunDriver = fs.readFileSync(path.resolve("tests", "long-run-balance-test.js"), "utf8");
  const executablePath = fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  const errors = [];
  if (!/survivalRangeGateApplied\s*=\s*fullRun\s*&&\s*targetDay\s*===\s*validationRules\.firstYearHorizonDays/.test(longRunDriver)) {
    errors.push("first-year survival ranges are not isolated from extended-horizon smoke runs");
  }
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const run = (name, options = {}) => {
      const context = createIsolatedValidationContext({ seed: `contract-${name}`, strategy: "balanced" });
      const report = runProjectionInContext(context, { days: options.days ?? 2, seed: `contract-${name}`, failureHook: options.failureHook, maxTicks: options.maxTicks });
      return { name, report, metricDays: context.validationDaily.map(item => item.day) };
    };
    const cases = [
      run("reaches-target"),
      run("fails-before-target", {
        days: 3,
        failureHook: ({ day, company }) => {
          if (day >= 1) {
            company.gameOver = true;
            company.failureType = "company-failure";
            company.failureOwner = "company-failure";
            company.failureCode = "CONTRACT_TEST_FAILURE";
          }
        }
      }),
      run("times-out", { days: 2, maxTicks: 1 }),
      run("system-error", {
        days: 2,
        failureHook: () => {
          throw new Error("Controlled validation-stage failure");
        }
      }),
      run("exact-horizon", { days: 1 })
    ];
    const byName = Object.fromEntries(cases.map(item => [item.name, item.report]));
    const failures = [];
    if (byName["reaches-target"].result !== "completed" || !byName["reaches-target"].reachedTarget) failures.push("target run did not complete");
    if (byName["fails-before-target"].result !== "company_failed" || byName["fails-before-target"].reachedTarget) failures.push("gameplay failure was not classified correctly");
    if (byName["times-out"].result !== "timed_out" || byName["times-out"].contractPassed) failures.push("timeout was accepted");
    if (byName["system-error"].result !== "system_error" || byName["system-error"].systemErrorFree) failures.push("system error was not separated");
    if (byName["exact-horizon"].result !== "completed" || byName["exact-horizon"].finalDay !== byName["exact-horizon"].targetDay) failures.push("exact horizon did not complete");
    if (cases.some(item => item.report.totalTicks > item.report.tickBudget)) failures.push("tick budget exceeded");
    if (cases.some(item => new Set(item.metricDays).size !== item.metricDays.length)) failures.push("validation metrics contain duplicate daily snapshots");
    const completedReport = byName["reaches-target"];
    const requiredTrajectoryFields = ["board", "trust", "investorConfidence", "shareholderPressure", "survivalRisk", "activeProjects", "blockedWork", "backlog", "quality", "integration"];
    if (!completedReport.financialTrajectory?.length) failures.push("projection trajectory is missing");
    if (requiredTrajectoryFields.some(field => !completedReport.financialTrajectory?.every(entry => Number.isFinite(Number(entry[field]))))) failures.push("projection trajectory is missing leadership or project diagnostics");
    if (["finalBoard", "finalTrust", "finalInvestorConfidence", "finalShareholderPressure"].some(field => !Number.isFinite(Number(completedReport[field])))) failures.push("projection summary is missing final leadership diagnostics");
    return { ok: failures.length === 0, failures, cases: cases.map(({ name, report }) => ({ name, result: report.result, finalDay: report.finalDay, targetDay: report.targetDay, totalTicks: report.totalTicks, tickBudget: report.tickBudget, contractPassed: report.contractPassed, systemErrorFree: report.systemErrorFree })) };
  });

  await browser.close();
  const ok = errors.length === 0 && result.ok;
  console.log(JSON.stringify({ ok, result, errors }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
