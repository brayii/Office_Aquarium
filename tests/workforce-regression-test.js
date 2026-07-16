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
    const activeCount = () => employees.filter(e => e.active).length;
    const hiringCounts = () => {
      const rows = hiringPipelineRows();
      const statuses = rows.reduce((out, row) => {
        out[row.status] = (out[row.status] || 0) + row.count;
        return out;
      }, {});
      const records = company.recruitingPipeline || [];
      return {
        rows,
        statuses,
        requisitions: records.filter(r => r.status === "requisition").length,
        searching: records.filter(r => r.status === "searching").length,
        interviewing: records.filter(r => r.status === "interviewing").length,
        offers: records.filter(r => r.status === "offer").length,
        paused: records.filter(r => r.status === "paused-policy").length,
        onboarding: employees.filter(e => e.active && e.performanceManagement?.stage === "onboarding").length
      };
    };
    const makeStrongCandidate = () => ({ skill: 88, cultureFit: 82, experience: 78, leadership: 64, salaryPremium: 2, exceptional: false, mediocre: false });

    if (typeof ensureWorkforceEconomySystems !== "function" || typeof startRecruiting !== "function") {
      return { ok: false, failures: ["Workforce functions unavailable"] };
    }

    validationMode = true;
    ensureBibleSystems();
    ensureWorkforceEconomySystems();

    // No-hidden-cap and forced-success hiring: fill enough approved roles to exceed 20 active employees.
    company.cash = 80;
    company.finance.runwayDays = 999;
    company.hiringPolicy.mode = "normal";
    const roles = [
      ["Verification Engineer", "quality"], ["Firmware Engineer", "software"], ["Chip Architect", "hardware"],
      ["Product Manager", "product"], ["Finance Analyst", "finance"], ["QA Engineer", "quality"],
      ["Software Lead", "software"], ["Industrial Designer", "hardware"], ["Verification Engineer", "quality"],
      ["Firmware Engineer", "software"], ["Product Manager", "product"], ["Finance Analyst", "finance"],
      ["QA Engineer", "quality"]
    ];
    for (const [role, dept] of roles) {
      company.day += 1;
      startRecruiting(role, "specialist", dept);
      const item = company.recruitingPipeline[0];
      completeRecruitingHire(item, makeStrongCandidate());
    }
    assert(activeCount() >= 20, `Expected active workforce above 20, got ${activeCount()}`);
    assert(employees.some(e => e.active && e.performanceManagement?.stage === "onboarding"), "Expected new hires to enter onboarding");

    // Parallel hiring: three approved roles should advance independently and survive save/load.
    company.recruitingPipeline = [];
    company.day += 1;
    [["Verification Engineer", "quality"], ["Firmware Engineer", "software"], ["Finance Analyst", "finance"]].forEach(([role, dept]) => {
      startRecruiting(role, "specialist", dept);
      company.recruitingPipeline[0].dueDay = company.day;
    });
    processRecruitingPipeline();
    assert(company.recruitingPipeline.filter(r => r.status === "searching").length === 3, "Parallel requisitions should all move to candidate search");
    const beforeSave = JSON.stringify(company.recruitingPipeline.map(r => [r.id, r.role, r.department, r.status, r.dueDay]));
    saveGame();
    const loaded = loadGame();
    const afterLoad = JSON.stringify(company.recruitingPipeline.map(r => [r.id, r.role, r.department, r.status, r.dueDay]));
    assert(loaded && beforeSave === afterLoad, "Recruiting pipeline state should survive save/load exactly");

    // Recruiting retry: a weak candidate should restart search, not permanently block the role.
    const retryItem = company.recruitingPipeline.find(r => r.status === "searching");
    retryItem.dueDay = company.day;
    retryItem.attempts = 0;
    company.forceRecruitingCandidateForTest = { skill: 42, cultureFit: 35, experience: 36, leadership: 24, salaryPremium: 0, exceptional: false, mediocre: true, forceRetry: true };
    processRecruitingPipeline();
    company.forceRecruitingCandidateForTest = null;
    assert(retryItem.status === "searching", "Weak candidate should keep role in searching state");
    assert(retryItem.dueDay > company.day, "Retry search should receive a new due day");
    assert(company.hiringRequestHistory.some(h => h.role === retryItem.role && h.status === "search-continued"), "Retry should be recorded in hiring history");

    // Low-runway policy: shortage remains visible while noncritical hiring is suppressed.
    company.hiringPolicy.mode = "frozen";
    company.cash = 2.5;
    company.finance.netCashFlowDaily = -0.18;
    company.finance.runwayDays = 13;
    updateStaffingModel();
    const st = company.staffingModel.software;
    recordSuppressedHiringNeed("software", roleForDepartmentHire("software"), "suppressed by hiring freeze", 88, 73);
    const suppressedRows = hiringPipelineRows().filter(r => r.status === "Suppressed by Hiring Policy");
    assert(suppressedRows.length >= 1 || (company.hiringRequests || []).some(r => r.status === "suppressed-policy"), "Suppressed hiring need should remain visible");
    assert(st, "Software staffing model should exist under low runway");

    // Management capacity should raise maximum useful staffing.
    company.hiringPolicy.mode = "normal";
    updateStaffingModel();
    const beforeMax = company.staffingModel.software.maximumUseful;
    const leader = employees.find(e => e.active);
    leader.skills = { ...(leader.skills || {}), leadership: 96 };
    updateStaffingModel();
    assert(company.staffingModel.software.maximumUseful >= beforeMax, "Leadership capacity should not reduce maximum useful staffing");

    // Pipeline reconciliation: visible counts should match underlying recruiting and onboarding records.
    const counts = hiringCounts();
    assert((counts.statuses["Candidate Search"] || 0) === counts.searching, "Visible candidate search count should match records");
    assert((counts.statuses["Onboarding"] || 0) === counts.onboarding, "Visible onboarding count should match active onboarding employees");

    validationMode = false;
    return {
      ok: failures.length === 0,
      failures,
      activeEmployees: activeCount(),
      pipeline: hiringCounts(),
      sampleRows: hiringPipelineRows().slice(0, 5)
    };
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
