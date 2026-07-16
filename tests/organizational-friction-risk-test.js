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
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", err => errors.push(`PAGE: ${err.message}`));
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`);
  });
  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.evaluate(() => startNewCompany());
  await page.waitForTimeout(200);

  const result = await page.evaluate(() => {
    const checks = [];
    function assert(name, ok, detail = "") {
      checks.push({ name, ok: !!ok, detail });
    }
    function resetHealthyBaseline() {
      company.cash = 18;
      company.board = 82;
      company.trust = 80;
      company.quality = 82;
      company.integration = 80;
      company.customerSentiment = 80;
      company.unpaidPayrollDays = 0;
      company.finance = { ...(company.finance || {}), runwayDays: 160, netCashFlowDaily: -0.05 };
      company.market = { ...(company.market || {}), competitorHeat: 35, aiDemand: 68, supplyPressure: 30 };
      company.manufacturing = { ...(company.manufacturing || {}), readiness: 75, supplyRisk: 25, yield: 75 };
      company.portfolioHealth = { ...(company.portfolioHealth || {}), concentrationRisk: 18 };
      company.staffingModel = {};
      employees.forEach(e => {
        e.active = true;
        e.stress = 95;
        e.morale = 70;
        e.retentionRisk = 0;
        e.retention = { ...(e.retention || {}), searching: false };
      });
      ensureBibleSystems();
      updateStaffingModel();
    }

    resetHealthyBaseline();
    updateCompanyRiskComponents();
    assert("burnout alone cannot make overall risk Critical", company.companyRiskComponents.label !== "Critical", company.companyRiskComponents.label);

    company.finance.runwayDays = 18;
    company.finance.netCashFlowDaily = -0.32;
    company.quality = 24;
    company.integration = 25;
    company.customerSentiment = 22;
    company.board = 24;
    updateCompanyRiskComponents();
    assert("multiple deteriorating pillars can make company risk Critical", company.companyRiskComponents.label === "Critical", company.companyRiskComponents.label);

    resetHealthyBaseline();
    company.unpaidPayrollDays = 1;
    updateCompanyRiskComponents();
    assert("unpaid payroll can make risk Critical", company.companyRiskComponents.label === "Critical", company.companyRiskComponents.label);

    resetHealthyBaseline();
    const before = JSON.stringify(company.departmentFriction);
    company.day += 1;
    company.lastFrictionUpdateDay = -999;
    updateDepartmentFrictionDaily();
    const after = JSON.stringify(company.departmentFriction);
    assert("hidden friction drifts daily", before !== after);

    updateExecutiveObservations();
    assert("executive observations exist", (company.executiveObservations || []).length > 0);
    assert("old balance-note sentence removed from page", !document.body.innerText.includes("No immediate balance warning from the latest telemetry."));
    assert("observations have traceable source ids", (company.executiveObservations || []).every(o => Array.isArray(o.sourceIds) && o.sourceIds.length));

    company.escalationQueue = [{ id: "normal-a", title: "Normal memo A", choices: [{ title: "A" }, { title: "B" }, { title: "C" }] }, { id: "normal-b", title: "Normal memo B", choices: [{ title: "A" }, { title: "B" }, { title: "C" }] }];
    company.pendingEvent = null;
    company.inboxFlow = { day: company.day, openedToday: 1, lastOpenedDay: company.day };
    const held = nextEligibleQueuedMemo();
    assert("non-urgent queued memo waits after daily inbox limit", held === null);

    const failed = checks.filter(c => !c.ok);
    return { ok: failed.length === 0, checks, failed };
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
