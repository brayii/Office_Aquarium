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
    startNewCompany();
    ensureMarketValuationSystems();

    const applyScenario = strong => {
      company.day = strong ? 41 : 40;
      company.valuation = 42;
      company.valuationHistory = [];
      company.lastValuationUpdateDay = -999;
      company.randomState = 123456789;
      company.cash = strong ? 42 : 2;
      company.customers = strong ? 220 : 0;
      company.dailyRevenue = strong ? 0.34 : 0;
      company.customerSentiment = strong ? 86 : 24;
      company.trust = strong ? 84 : 22;
      company.quality = strong ? 88 : 28;
      company.board = strong ? 84 : 24;
      company.marketSentiment = strong ? 82 : 24;
      company.marketConfidence = strong ? 80 : 25;
      company.leadershipReputation = strong ? 82 : 28;
      company.valuationQuality = strong ? 86 : 24;
      company.investorAppetite = strong ? 78 : 22;
      company.crisis = strong ? null : { category: "financial", stage: "critical" };
      company.companyRiskComponents = { total: strong ? 14 : 88, label: strong ? "Healthy" : "Critical" };
      company.valuationRiskScore = strong ? 14 : 88;
      company.finance = {
        ...(company.finance || {}),
        netCashFlowDaily: strong ? 0.12 : -0.35,
        runwayDays: strong ? OFFICE_AQUARIUM_CONSTANTS.time.unknownFutureDay : 5
      };
      company.manufacturing = {
        ...(company.manufacturing || {}),
        readiness: strong ? 88 : 24,
        yield: strong ? 90 : 30,
        capacity: strong ? 84 : 25,
        supplyRisk: strong ? 16 : 90
      };
      company.valuationDrivers = {};
      employees.filter(employee => employee.active).forEach(employee => {
        employee.morale = strong ? 84 : 25;
        employee.stress = strong ? 20 : 90;
        employee.focus = strong ? 86 : 32;
      });
      updatePortfolioHealth();
      updateDailyValuationCore(true);
      return {
        target: company.valuationDrivers.valuationTarget,
        value: company.valuation,
        history: company.valuationHistory.slice()
      };
    };

    const weak = applyScenario(false);
    const strong = applyScenario(true);
    assert(strong.target > weak.target, `Strong fundamentals should produce a higher valuation target (${strong.target} vs ${weak.target})`);
    assert(strong.target - weak.target >= 15, `Valuation should materially distinguish strong and weak companies (${strong.target} vs ${weak.target})`);
    assert(strong.history.length === 1, "A forced daily valuation should record one point");

    const valueBefore = company.valuation;
    const historyBefore = JSON.stringify(company.valuationHistory);
    const randomBefore = company.randomState;
    updateDailyValuationCore();
    updateDailyValuationCore();
    assert(company.valuation === valueBefore, "Same-day valuation updates should be idempotent");
    assert(JSON.stringify(company.valuationHistory) === historyBefore, "Same-day valuation updates should not duplicate history");
    assert(company.randomState === randomBefore, "Same-day valuation updates should not consume deterministic random state");

    company.lastInvestorUpdateDay = -999;
    updateInvestorReaction();
    const investorBefore = JSON.stringify(company.investorSentiment);
    const investorRandomBefore = company.randomState;
    updateInvestorReaction();
    assert(JSON.stringify(company.investorSentiment) === investorBefore, "Investor reaction should update at most once per day");
    assert(company.randomState === investorRandomBefore, "Repeated investor reaction should not consume random state");

    company.investorSentiment.confidence = 70;
    company.shareholders.confidence = 70;
    company.valuationHistory = [{ day: company.day, valuation: company.valuation }];
    const stableInvestorStart = company.investorSentiment.confidence;
    for (let offset = 1; offset <= 90; offset += 1) {
      company.day += 1;
      company.lastInvestorUpdateDay = OFFICE_AQUARIUM_CONSTANTS.time.neverDay;
      company.valuationHistory.push({ day: company.day, valuation: company.valuation });
      updateInvestorReaction();
    }
    const stableInvestorEnd = company.investorSentiment.confidence;
    assert(stableInvestorEnd > 50, `Stable strong fundamentals should not create automatic investor collapse (${stableInvestorStart.toFixed(1)} to ${stableInvestorEnd.toFixed(1)})`);

    company.lastInvestorRelationsReportDay = -999;
    company.investorRelationsForecasts = [];
    boardValuationView();
    const forecastsBefore = company.investorRelationsForecasts.length;
    boardValuationView();
    boardValuationView();
    assert(company.investorRelationsForecasts.length === forecastsBefore, "Repeated Board views should not create duplicate forecasts");

    company.valuationHistory = [
      { day: 5, valuation: 44 },
      { day: 2, valuation: 41 },
      { day: 4, valuation: 43 },
      { day: 3, valuation: 42 }
    ];
    const allSeries = valuationSeries(Infinity);
    assert(allSeries.map(point => point.day).join(",") === "2,3,4,5", "Valuation chart series should be chronological");
    company.marketRangeView = "1w";
    assert(valuationRangeConfig().days === OFFICE_AQUARIUM_CONSTANTS.time.daysPerWeek, "One-week valuation range should use the shared calendar");
    company.marketRangeView = "1y";
    assert(valuationRangeConfig().days === OFFICE_AQUARIUM_CONSTANTS.time.daysPerYear, "One-year valuation range should use the shared calendar");

    validationMode = false;
    return {
      ok: failures.length === 0,
      failures,
      weak,
      strong,
      stableInvestor: { start: stableInvestorStart, end: stableInvestorEnd },
      forecasts: company.investorRelationsForecasts.length,
      seriesDays: allSeries.map(point => point.day)
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
