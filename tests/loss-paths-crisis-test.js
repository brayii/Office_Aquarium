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
  const errors = [];
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on("pageerror", err => errors.push(`PAGE: ${err.message}`));
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`);
  });

  const fileUrl = `file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.evaluate(() => startNewCompany());
  await page.waitForTimeout(200);

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const technicalRoles = new Set(["Chip Architect", "Firmware Engineer", "Software Lead", "QA Engineer", "Verification Engineer"]);

    const fresh = () => {
      startNewCompany();
      validationMode = true;
      ensureBibleSystems();
      ensureWorkforceEconomySystems?.();
      employees.forEach((e, index) => {
        e.active = true;
        e.offsite = false;
        e.daysAtRisk = 0;
        e.stress = 40;
        e.morale = 70;
        e.role = index < 4 ? ["Chip Architect", "Firmware Engineer", "Verification Engineer", "Software Lead"][index] : e.role;
      });
      company.cash = 10;
      company.board = 55;
      company.trust = 55;
      company.customerSentiment = 55;
      company.phase = "prototype";
      company.unpaidPayrollDays = 0;
      company.crisis = null;
      company.crisisDays = 0;
      company.crisisType = null;
      company.crisisStage = null;
      company.gameOver = false;
      company.failureOwner = null;
      company.failureCode = null;
      company.lastBoardStrikeFailureCode = null;
      company.finance = { ...(company.finance || {}), netCashFlowDaily: -0.02, runwayDays: 300 };
      company.shareholders = { ...(company.shareholders || {}), confidence: 55, pressure: 25 };
      company.manufacturing = { ...(company.manufacturing || {}), readiness: 70, yield: 70, capacity: 70, supplyRisk: 30 };
      company.boardGovernance = { ...(company.boardGovernance || {}), strikes: 0, lastStrikeDay: -999, pipActive: false };
      company.organizationalMomentum = { ...(company.organizationalMomentum || {}), execution: 0, burnout: 0 };
      company.workItems = [];
      company.projectArchive = [
        ...(company.projectArchive || []),
        ...(company.projects || []).map(project => ({ ...project, status: "completed", completedDay: company.day, closedDay: company.day }))
      ];
      company.projects = [];
    };

    const assertImmediate = (label, setup, owner, code) => {
      fresh();
      setup();
      evaluateFailure();
      assert(company.gameOver, `${label}: expected game over`);
      assert(company.failureOwner === owner, `${label}: expected owner ${owner}, got ${company.failureOwner}`);
      assert(company.failureCode === code, `${label}: expected code ${code}, got ${company.failureCode}`);
    };

    assertImmediate("insolvency", () => { company.cash = -2.1; }, "company-failure", "COMPANY_INSOLVENCY");
    assertImmediate("board zero", () => { company.board = 0; }, "ceo-fired", "CEO_BOARD_CONFIDENCE_ZERO");
    assertImmediate("no employees", () => { employees.forEach(e => e.active = false); }, "company-failure", "COMPANY_NO_EMPLOYEES");
    assertImmediate("no technical employees", () => { employees.forEach(e => { e.active = true; e.role = "Finance Analyst"; }); }, "company-failure", "COMPANY_NO_TECHNICAL_EMPLOYEES");
    assertImmediate("trust collapse", () => { company.phase = "launched"; company.trust = 0; }, "company-failure", "COMPANY_TRUST_COLLAPSE");
    assertImmediate("payroll", () => { company.unpaidPayrollDays = 2; }, "company-failure", "COMPANY_PAYROLL_FAILURE");
    assertImmediate("three board strikes", () => { company.boardGovernance.strikes = 3; }, "ceo-fired", "CEO_THREE_BOARD_STRIKES");

    fresh();
    company.boardGovernance.strikes = 2;
    company.boardGovernance.lastStrikeDay = -999;
    company.boardGovernance.pipActive = true;
    company.boardGovernance.pipDeadlineDay = company.day;
    company.boardGovernance.pipTargets = { minimumCash: 20, minimumBoard: 80, minimumTrust: 80, maximumNetDailyLoss: -0.001 };
    maybeIssueOrEvaluatePip();
    evaluateFailure();
    assert(company.gameOver && company.failureOwner === "ceo-fired" && company.failureCode === "CEO_PIP_FAILURE", `PIP failure should remove CEO with CEO_PIP_FAILURE, got ${company.failureOwner}/${company.failureCode}`);

    const reachabilitySetups = {
      financial: () => { company.cash = -0.5; company.finance.netCashFlowDaily = -0.3; company.finance.runwayDays = 0; },
      leadership: () => { company.board = 5; company.shareholders.pressure = 90; },
      burnout: () => { employees.forEach(e => { e.stress = 94; e.daysAtRisk = 3; }); company.organizationalMomentum.burnout = 30; },
      "investor-confidence": () => { company.shareholders.confidence = 5; company.shareholders.pressure = 90; },
      reputation: () => { company.trust = 5; company.customerSentiment = 10; },
      product: () => { company.quality = 20; company.integration = 35; company.projects = [{ id: "risk", status: "execution", performance: { riskTrend: 90 } }]; },
      staffing: () => { employees.forEach((e, i) => { e.active = i < 3; }); employees[0].role = "Chip Architect"; company.openRoles = ["Firmware Engineer", "Verification Engineer"]; },
      operational: () => { company.workItems = Array.from({ length: 5 }, (_, i) => ({ id: `w${i}`, progress: 50, blockedBy: ["dependency"] })); company.organizationalMomentum.execution = -30; employees.forEach(e => e.stress = 70); },
      manufacturing: () => { company.phase = "launched"; company.manufacturing.supplyRisk = 96; company.manufacturing.readiness = 25; }
    };
    for (const [type, setup] of Object.entries(reachabilitySetups)) {
      fresh();
      setup();
      const candidate = typedCrisisCandidate();
      assert(candidate?.type === type, `${type}: expected reachable typed crisis, got ${candidate?.type || "none"}`);
      assert(Array.isArray(candidate?.visibleSignals) && candidate.visibleSignals.length > 0, `${type}: expected visible signals`);
      assert(Array.isArray(candidate?.recoveryCriteria) && candidate.recoveryCriteria.length > 0, `${type}: expected recovery criteria`);
    }

    const timeoutCodes = {
      financial: ["company-failure", "COMPANY_CASH_CRISIS_TIMEOUT"],
      leadership: ["ceo-fired", "CEO_LEADERSHIP_CRISIS_TIMEOUT"],
      burnout: ["ceo-fired", "CEO_BURNOUT_CRISIS_TIMEOUT"],
      "investor-confidence": ["ceo-fired", "CEO_INVESTOR_CRISIS_TIMEOUT"],
      reputation: ["company-failure", "COMPANY_REPUTATION_CRISIS_TIMEOUT"],
      product: ["company-failure", "COMPANY_PRODUCT_CRISIS_TIMEOUT"],
      staffing: ["company-failure", "COMPANY_STAFFING_CRISIS_TIMEOUT"],
      operational: ["company-failure", "COMPANY_OPERATIONAL_CRISIS_TIMEOUT"],
      manufacturing: ["company-failure", "COMPANY_MANUFACTURING_CRISIS_TIMEOUT"]
    };
    for (const [type, [owner, code]] of Object.entries(timeoutCodes)) {
      fresh();
      reachabilitySetups[type]?.();
      startCrisis(makeCrisisCandidate(type, [`${type} test evidence`], 90));
      company.day = company.crisis.deadlineDay;
      advanceCrisisDay();
      assert(company.gameOver, `${type}: expected timeout game over`);
      assert(company.failureOwner === owner, `${type}: expected owner ${owner}, got ${company.failureOwner}`);
      assert(company.failureCode === code, `${type}: expected code ${code}, got ${company.failureCode}`);
    }

    for (const type of Object.keys(timeoutCodes)) {
      fresh();
      startCrisis(makeCrisisCandidate(type, [`${type} recovery evidence`], 90));
      company.cash = 12;
      company.finance.netCashFlowDaily = -0.01;
      company.finance.runwayDays = 500;
      company.board = 55;
      company.shareholders.confidence = 60;
      company.shareholders.pressure = 20;
      company.trust = 60;
      company.customerSentiment = 60;
      company.quality = 70;
      company.integration = 65;
      company.manufacturing = { ...(company.manufacturing || {}), readiness: 70, yield: 70, capacity: 70, supplyRisk: 30 };
      company.organizationalMomentum.execution = 10;
      company.organizationalMomentum.burnout = 0;
      company.openRoles = [];
      company.workItems = [];
      employees.forEach((e, i) => { e.active = true; e.stress = 35; e.daysAtRisk = 0; e.role = i < 4 ? ["Chip Architect", "Firmware Engineer", "Verification Engineer", "Software Lead"][i] : e.role; });
      const recoveryProgress = crisisRecoveryProgress(type);
      const recoverySnapshot = type === "staffing" ? buildWorkforceAllocationSnapshot() : null;
      evaluateFailure();
      assert(!company.gameOver, `${type}: recovery should not end game`);
      assert(!company.crisis, `${type}: expected crisis to clear on recovery; progress ${recoveryProgress}; staffing ${JSON.stringify(recoverySnapshot?.totals || {})}`);
    }

    validationMode = false;
    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  const ok = errors.length === 0 && result.ok;
  console.log(JSON.stringify({ ok, result, errors: errors.slice(0, 8) }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
