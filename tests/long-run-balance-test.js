const path = require("path");
const os = require("os");
const fs = require("fs");
const vm = require("vm");
const { chromium } = require("playwright");

function loadOfficeAquariumConstants() {
  const context = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(path.resolve("src", "core", "constants.js"), "utf8"), context);
  return context.globalThis.OFFICE_AQUARIUM_CONSTANTS;
}

function positiveIntegerEnvironment(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  return value;
}

async function main() {
  const constants = loadOfficeAquariumConstants();
  const validationRules = constants.validation;
  const executablePath = fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  const errors = [];
  const fullRun = process.env.OFFICE_AQUARIUM_LONG_RUN === "1";
  const seedCount = positiveIntegerEnvironment("OFFICE_AQUARIUM_SEED_COUNT", fullRun ? validationRules.developmentSeedsPerStrategy : 1);
  const targetDay = positiveIntegerEnvironment("OFFICE_AQUARIUM_HORIZON_DAYS", fullRun ? validationRules.firstYearHorizonDays : 60);
  const defaultStrategies = validationRules.strategies.filter(strategy => strategy !== "recovery-focused").join(",");
  const strategies = (process.env.OFFICE_AQUARIUM_STRATEGIES || defaultStrategies).split(",").map(value => value.trim()).filter(Boolean);
  const invalidStrategies = strategies.filter(strategy => !validationRules.strategies.includes(strategy));
  if (!strategies.length || invalidStrategies.length) {
    throw new Error(`OFFICE_AQUARIUM_STRATEGIES contains unsupported values: ${invalidStrategies.join(", ") || "none supplied"}.`);
  }
  const concurrency = Math.max(1, Math.min(Number(process.env.OFFICE_AQUARIUM_CONCURRENCY) || Math.min(4, os.cpus().length), seedCount * strategies.length));
  const jobs = strategies.flatMap(strategy => Array.from({ length: seedCount }, (_, index) => ({ strategy, seed: `release-${strategy}-${index + 1}` })));
  const reports = [];
  let cursor = 0;
  const runWorker = async () => {
    const page = await browser.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const report = await page.evaluate(({ targetDay, seed, strategy }) => runBalanceProjection(targetDay, { seed, strategy }), { targetDay, ...job });
      reports.push(report);
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: concurrency }, runWorker));
  await browser.close();
  reports.sort((left, right) =>
    strategies.indexOf(left.strategy) - strategies.indexOf(right.strategy) ||
    String(left.seed).localeCompare(String(right.seed))
  );

  const summarize = strategyReports => {
    const survivalRate = Math.round(strategyReports.filter(report => report.survival).length / Math.max(1, strategyReports.length) * 100);
    const statusCounts = strategyReports.reduce((out, report) => (out[report.result] = (out[report.result] || 0) + 1, out), {});
    const failureCauses = strategyReports.reduce((out, report) => (out[report.failureCause] = (out[report.failureCause] || 0) + 1, out), {});
    const orderedCash = strategyReports.map(report => report.cash).sort((a, b) => a - b);
    const failureDays = strategyReports.filter(report => !report.survival).map(report => report.finalDay).sort((a, b) => a - b);
    const median = orderedCash[Math.floor((orderedCash.length - 1) / 2)] || 0;
    const average = selector => strategyReports.reduce((sum, report) => sum + (Number(selector(report)) || 0), 0) / Math.max(1, strategyReports.length);
    return {
      runs: strategyReports.length,
      survivalRate,
      statusCounts,
      failureCauses,
      medianFailureDay: failureDays.length ? failureDays[Math.floor((failureDays.length - 1) / 2)] : null,
      medianFinalCash: median,
      averageStress: Math.round(average(report => report.avgStress)),
      averageMorale: Math.round(average(report => report.avgMorale)),
      averageHeadcount: Number(average(report => report.activeEmployees).toFixed(1)),
      averageProjectCompletions: Number(average(report => report.projectCompletion).toFixed(1)),
      averageHiringCount: Number(average(report => report.hiringCount).toFixed(1)),
      averageActiveProjects: Number(average(report => report.activeProjectCount).toFixed(1)),
      averageFinalBlockers: Number(average(report => report.finalBlockedWork).toFixed(1)),
      averageFinalBacklog: Number(average(report => report.finalBacklog).toFixed(1)),
      averageFinalInvestorConfidence: Math.round(average(report => report.finalInvestorConfidence ?? report.investorConfidence)),
      averageFinalBoard: Math.round(average(report => report.finalBoard)),
      averageFinalCompanyRisk: Math.round(average(report => report.finalSurvivalRisk ?? report.companyRisk)),
      averageDecisionsPerMonth: Number(average(report => report.ceoDecisions / Math.max(1, report.daysRun) * constants.time.daysPerMonth).toFixed(1)),
      averageMemosPerMonth: Number(average(report => report.executiveMemos / Math.max(1, report.daysRun) * constants.time.daysPerMonth).toFixed(1)),
      maximumSaveCharacters: Math.max(0, ...strategyReports.map(report => report.saveAnalysis?.serializedCharacters || 0))
    };
  };
  const byStrategy = Object.fromEntries(strategies.map(strategy => [strategy, summarize(reports.filter(report => report.strategy === strategy))]));
  const systemErrors = reports.filter(report => !report.systemErrorFree).length;
  const timeouts = reports.filter(report => report.result === "timed_out").length;
  const falsePasses = reports.filter(report =>
    (report.result === "timed_out" && report.contractPassed) ||
    (report.result === "completed" && !report.reachedTarget)
  ).length;
  const targetRanges = Object.fromEntries(
    Object.entries(validationRules.survivalTargets).map(([strategy, range]) => [strategy, [range.minimum, range.maximum]])
  );
  const survivalRangeGateApplied = fullRun && targetDay === validationRules.firstYearHorizonDays;
  const rangeFailures = survivalRangeGateApplied ? strategies.filter(strategy => {
    const range = targetRanges[strategy];
    return range && (byStrategy[strategy].survivalRate < range[0] || byStrategy[strategy].survivalRate > range[1]);
  }) : [];
  const result = { ok: systemErrors === 0 && timeouts === 0 && falsePasses === 0 && rangeFailures.length === 0, full: fullRun, seedCount, targetDay, strategies, concurrency, survivalRangeGateApplied, systemErrors, timeouts, falsePasses, rangeFailures, byStrategy, reports };
  if (process.env.OFFICE_AQUARIUM_WRITE_REPORTS === "1") {
    const reportDir = path.resolve("dist", "reports");
    const reportSuffix = targetDay === validationRules.firstYearHorizonDays ? "" : `-day-${targetDay}`;
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, `long-run-strategy-matrix${reportSuffix}.json`), JSON.stringify(result, null, 2));
    const rows = strategies.map(strategy => {
      const item = byStrategy[strategy];
      return `| ${strategy} | ${item.runs} | ${item.survivalRate}% | ${item.medianFailureDay ?? "none"} | $${item.medianFinalCash}M | ${item.averageHeadcount} | ${item.averageProjectCompletions} | ${item.averageActiveProjects} | ${item.averageFinalBlockers} | ${item.averageFinalBacklog} | ${item.averageFinalInvestorConfidence} | ${item.averageFinalBoard} | ${item.averageFinalCompanyRisk} | ${item.averageDecisionsPerMonth} | ${item.averageMemosPerMonth} | ${item.maximumSaveCharacters} |`;
    });
    const markdown = `# Office Aquarium Long-Run Strategy Matrix\n\nHorizon: Day ${targetDay}  \nSeeds per strategy: ${seedCount}  \nFirst-year survival gate applied: ${survivalRangeGateApplied ? "yes" : "no"}  \nSystem errors: ${systemErrors}  \nTimeouts: ${timeouts}\n\n| Strategy | Runs | Survival | Median failure day | Median cash | Avg headcount | Avg completions | Avg active projects | Avg final blockers | Avg final backlog | Avg investor | Avg board | Avg risk | Decisions/month | Memos/month | Max save chars |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n${rows.join("\n")}\n\n## Failure Causes\n\n\`\`\`json\n${JSON.stringify(Object.fromEntries(strategies.map(strategy => [strategy, byStrategy[strategy].failureCauses])), null, 2)}\n\`\`\`\n`;
    fs.writeFileSync(path.join(reportDir, `long-run-strategy-matrix${reportSuffix}.md`), markdown);
  }
  const ok = errors.length === 0 && result.ok;
  const detailLimit = Math.max(0, Number(process.env.OFFICE_AQUARIUM_CONSOLE_REPORT_LIMIT) || validationRules.consoleReportDetailLimit || 0);
  const consoleResult = {
    ...result,
    reports: detailLimit ? reports.slice(0, detailLimit) : `[${reports.length} detailed run records omitted; set OFFICE_AQUARIUM_CONSOLE_REPORT_LIMIT to include them]`
  };
  console.log(JSON.stringify({ ok, result: consoleResult, errors }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
