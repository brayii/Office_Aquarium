const path = require("path");
const { chromium } = require("playwright");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

async function launchBrowser() {
  const fs = require("fs");
  for (const executablePath of chromeCandidates) {
    if (fs.existsSync(executablePath)) return chromium.launch({ headless: true, executablePath });
  }
  return chromium.launch({ headless: true });
}

async function main() {
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on("pageerror", err => errors.push(`PAGE: ${err.message}`));
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`);
  });

  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    validationMode = true;
    startNewCompany();
    ensureBibleSystems();
    ensureProjectPortfolio();
    ensureWorkforceEconomySystems();

    const project = (company.projects || [])[0];
    assert(!!project, "Startup should create at least one active project");
    project.hiddenReality = {
      ...(project.hiddenReality || {}),
      trueTechnicalDifficulty: 94,
      trueMarketDemand: 7,
      trueStrategicValue: 9,
      trueKnowledgeValue: 13,
      trueTalentRetentionValue: 11,
      hiddenFailureModes: ["secret integration trap"],
      hiddenUpsideTriggers: ["secret market trigger"],
      hiddenObsolescenceRate: 80
    };
    project.performance = {
      ...(project.performance || {}),
      riskTrend: 92,
      blockerCount: 3,
      staffingCoverage: 25,
      scheduleVariance: 55,
      budgetVariance: 40,
      quality: 31,
      executionHealth: 20
    };
    project.progress = 35;
    project.quality = 31;
    project.visibleRisk = 82;
    project.staffAllocations = {};
    project.requiredDepartments = ["hardware", "software", "quality"];
    project.requiredHeadcount = { hardware: 3, software: 2, quality: 2 };

    company.marketConfidence = 0;
    company.valuationQuality = 0;
    company.investorAppetite = 0;
    company.leadershipReputation = 0;
    company.customerSentiment = 0;
    company.trust = 0;
    company.board = 8;
    company.cash = 1;
    company.finance = { ...(company.finance || {}), runwayDays: 0, netCashFlowDaily: -0.4 };
    company.portfolioHealth = { ...(company.portfolioHealth || {}), averageScheduleVariance: 65, atRiskProjects: 2 };
    company.companyRiskComponents = { total: 90, label: "Critical" };
    company.manufacturing = { ...(company.manufacturing || {}), supplyRisk: 95, readiness: 8, yield: 22, capacity: 14 };
    employees.forEach(e => {
      e.active = true;
      e.morale = 22;
      e.stress = 88;
      e.focus = 42;
      e.opinionOfCEO = { ...(e.opinionOfCEO || {}), trust: 0, fairness: 0 };
    });

    updatePortfolioHealth();
    const health = derivedOperatingHealth();
    recordOperatingHealthSnapshot();
    const ceoObs = buildCEOObservation();
    const employeeObs = buildEmployeeObservation(employees[0].id);
    const managerObs = buildManagerObservation(project.requiredDepartments[0]);
    const normalText = JSON.stringify({ health, ceoObs, employeeObs, managerObs, publicProject: publicProjectObservation(project) });

    assert(health.investorConfidence < 28, `Zero-valued investor inputs should depress investor confidence, got ${health.investorConfidence}`);
    assert(boardConfidenceTarget(health.morale, avgStress()) < 35, `Board target should honor zero trust/customer sentiment, got ${boardConfidenceTarget(health.morale, avgStress())}`);
    assert(health.portfolioHealth < 55, `Strained project should lower portfolio health, got ${health.portfolioHealth}`);
    assert(health.hardwareHealth === null || health.hardwareHealth < 60, `Hardware health should not look strong under severe staffing/risk pressure, got ${health.hardwareHealth}`);
    assert(health.manufacturingHealth < 45, `Manufacturing health should respond to high supply risk and low readiness, got ${health.manufacturingHealth}`);
    assert(company.operatingHealthHistory.length > 0, "Operating Health snapshots should be recorded");
    assert(!/hiddenReality|trueTechnicalDifficulty|trueMarketDemand|trueStrategicValue|trueKnowledgeValue|trueTalentRetentionValue|hiddenFailureModes|hiddenUpsideTriggers/.test(normalText), "Normal Operating Health and observations must not expose hidden project truth");
    assert(/hiddenReality|trueTechnicalDifficulty/.test(JSON.stringify(project)), "The test project should still contain hidden truth internally");

    validationMode = false;
    return {
      ok: failures.length === 0,
      failures,
      health,
      boardTarget: boardConfidenceTarget(health.morale, avgStress()),
      publicPreview: normalText.slice(0, 500)
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
