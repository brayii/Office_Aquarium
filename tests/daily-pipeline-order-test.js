const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

async function launchBrowser() {
  for (const executablePath of chromeCandidates) {
    if (fs.existsSync(executablePath)) return chromium.launch({ headless: true, executablePath });
  }
  return chromium.launch({ headless: true });
}

async function main() {
  const errors = [];
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on("pageerror", error => errors.push(`PAGE: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`CONSOLE: ${message.text()}`);
  });

  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    validationMode = true;
    debugMode = false;
    startNewCompany();
    company.dailyStageStatus = [];
    company.lastInvestorRelationsReportDay = -999;
    company.investorRelationsForecasts = [];
    company.minute = OFFICE_AQUARIUM_CONSTANTS.time.workdayEndMinute - 5;
    company.paused = false;

    simulateMinute(false);

    const expected = [...OFFICE_AQUARIUM_CONSTANTS.dailyPipeline.stageOrder];
    const records = (company.dailyStageStatus || [])
      .filter(record => record.day === company.day && expected.includes(record.stage))
      .slice()
      .reverse();
    const actual = records.map(record => record.stage);
    assert(JSON.stringify(actual) === JSON.stringify(expected), `Daily stages ran out of order: ${actual.join(" -> ")}`);
    assert(records.length === expected.length, `Expected ${expected.length} daily stages, found ${records.length}`);
    assert(records.every(record => record.status === "ok"), "Every daily stage should finish successfully");
    assert(records.every(record => !("hashBefore" in record) && !("hashAfter" in record)), "Normal play should not compute expensive per-stage hashes");
    assert(company.lastDailyCloseStatus?.status === "ok", "Daily close should report success");
    assert(!company.lastSimulationError, "Daily close should not record a simulation error");

    const valuationPoints = (company.valuationHistory || []).filter(point => point.day === company.day);
    assert(valuationPoints.length === 1, `Expected one valuation point for day ${company.day}, found ${valuationPoints.length}`);

    const valuationBefore = company.valuation;
    const historyBefore = JSON.stringify(company.valuationHistory);
    const randomBefore = company.randomState;
    updateDailyValuationCore();
    updateDailyValuationCore();
    assert(company.valuation === valuationBefore, "Repeated same-day valuation calls should not change valuation");
    assert(JSON.stringify(company.valuationHistory) === historyBefore, "Repeated same-day valuation calls should not add history");
    assert(company.randomState === randomBefore, "Repeated same-day valuation calls should not consume random values");

    const forecastsBefore = (company.investorRelationsForecasts || []).length;
    boardValuationView();
    boardValuationView();
    boardValuationView();
    assert((company.investorRelationsForecasts || []).length === forecastsBefore, "Reading the Board view should not create duplicate investor forecasts");

    validationMode = false;
    return {
      ok: failures.length === 0,
      failures,
      day: company.day,
      expected,
      actual,
      valuationPoints: valuationPoints.length,
      forecastsBefore,
      forecastsAfter: (company.investorRelationsForecasts || []).length
    };
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
