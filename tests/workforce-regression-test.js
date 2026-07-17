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

    // Growth hiring must append new capacity even if an inactive person with the same role exists.
    const inactiveSlot = employees.length;
    employees[inactiveSlot] = { ...employees[0], id: inactiveSlot, name: "Former Firmware Engineer", role: "Firmware Engineer", active: false, offsite: true, relationship: {}, social: {} };
    const beforeGrowthHire = activeCount();
    const growthItem = startRecruiting("Firmware Engineer", "specialist", "software", { backfill: false, source: "approved-headcount" });
    completeRecruitingHire(growthItem, makeStrongCandidate());
    const growthHire = employees.find(e => e.active && e.role === "Firmware Engineer" && e.joinedDay === company.day && e.id !== inactiveSlot);
    assert(activeCount() === beforeGrowthHire + 1, `Approved growth hire should increase active count from ${beforeGrowthHire} to ${beforeGrowthHire + 1}, got ${activeCount()}`);
    assert(growthHire, "Approved growth hire should create a new employee instead of overwriting an inactive same-role slot");
    assert(employees[inactiveSlot] && employees[inactiveSlot].active === false, "Growth hire should leave inactive historical employee inactive");

    // Explicit backfills may reuse an inactive slot, but they still become visible active employees and survive refresh.
    company.openRoles.push("Firmware Engineer");
    const beforeBackfill = activeCount();
    const backfillItem = startRecruiting("Firmware Engineer", "specialist", "software", { backfill: true, source: "vacancy" });
    completeRecruitingHire(backfillItem, makeStrongCandidate());
    const backfillHire = employees[inactiveSlot];
    assert(activeCount() === beforeBackfill + 1, "Backfill should restore one active employee");
    assert(backfillHire && backfillHire.active && backfillHire.performanceManagement?.stage === "onboarding", "Backfill should become an onboarding employee in the reused slot");
    saveGame();
    assert(loadGame(), "Save/load should succeed after an onboarding backfill");
    const loadedBackfill = employees.find(e => e.id === inactiveSlot);
    assert(loadedBackfill && loadedBackfill.active && loadedBackfill.performanceManagement?.stage === "onboarding", "Onboarding employee should survive refresh/save-load");
    company.day = (loadedBackfill.onboarding.startDay || loadedBackfill.joinedDay || company.day) + loadedBackfill.onboarding.duration;
    completeDueOnboarding();
    saveGame();
    assert(loadGame(), "Save/load should succeed after onboarding completion");
    const completedBackfill = employees.find(e => e.id === inactiveSlot);
    assert(completedBackfill && completedBackfill.active && completedBackfill.performanceManagement?.stage !== "onboarding", "Completed onboarding employee should stay active after refresh");

    // Completed recruiting history must not evict slow active searches from the pipeline.
    const slowSearch = { id: "slow-active-search", role: "Software Engineer", department: "software", status: "searching", stage: "searching", day: company.day - 40, searchStartedDay: company.day - 40, dueDay: company.day + 12 };
    company.recruitingPipeline = Array.from({ length: 32 }, (_, i) => ({ id: `accepted-history-${i}`, role: "Finance Analyst", department: "finance", status: "accepted", filledDay: company.day - i })).concat([slowSearch]);
    pruneRecruitingPipeline();
    assert(company.recruitingPipeline.some(r => r.id === "slow-active-search" && r.status === "searching"), "Pipeline pruning should keep active searches even when completed history is long");

    // Existing saves with old bad states should repair instead of leaving hiring permanently stuck.
    company.recruitingPipeline = [{ id: "old-contractor-state", role: "Finance Analyst", department: "finance", status: "contractor", stage: "contractor", day: company.day - 4, dueDay: company.day - 1 }];
    ensureWorkforceEconomySystems();
    assert(company.recruitingPipeline[0].status === "searching" && company.recruitingPipeline[0].contractorCoverage, "Old contractor coverage should resume recruiting instead of killing the search");
    company.recruitingPipeline = [{ id: "accepted-without-hire", role: "Product Manager", department: "product", status: "accepted", stage: "offer", day: company.day - 6, filledDay: company.day - 5, dueDay: company.day - 5 }];
    ensureWorkforceEconomySystems();
    assert(company.recruitingPipeline[0].status === "searching" && company.recruitingPipeline[0].repairedMissingHire, "Accepted record without a matching hire should be repaired back to active search");

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

    // Onboarding completion should not make the hire disappear from workforce visibility.
    const onboardingHire = employees.find(e => e.active && e.performanceManagement?.stage === "onboarding");
    assert(onboardingHire, "Expected an onboarding hire before completion visibility check");
    const activeBeforeCompletion = activeCount();
    company.day = (onboardingHire.onboarding.startDay || onboardingHire.joinedDay || company.day) + onboardingHire.onboarding.duration;
    completeDueOnboarding();
    const completedRows = hiringPipelineRows();
    assert(activeCount() === activeBeforeCompletion, "Completing onboarding should not remove the employee");
    assert(completedRows.some(row => row.status === "Onboarding Complete" && row.role === onboardingHire.role), "Completed onboarding should remain visible as a recent hire");

    // Hiring explanations should use the same assessment that created the signal, not raw zero-value debug fields.
    employees.forEach(e => {
      e.stress = 86;
    });
    updateStaffingModel();
    updateHiringNeedHistory();
    const peopleRow = hiringPipelineRows().find(row => row.dept === "people");
    assert(peopleRow, "People staffing signal should be visible under organization-wide pressure");
    assert(!/capacity gap 0|overload 0|backlog 0|blocked 0|skill 0/i.test(peopleRow.reason), `Hiring reason should not dump zero-value counters: ${peopleRow.reason}`);
    assert((peopleRow.evidence || []).length >= 1, "Hiring row should include concrete evidence");
    const pipelineHtml = hiringPipelineHtml();
    assert(pipelineHtml.includes("Situation:"), "Hiring pipeline should use Situation wording");
    assert(!/capacity gap 0|blocked 0|skill 0/i.test(pipelineHtml), "Hiring pipeline HTML should not expose unrelated zero counters");

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
