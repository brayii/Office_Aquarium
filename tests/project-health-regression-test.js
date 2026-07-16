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
    const makeControlledProject = (overrides = {}) => ({
      id: overrides.id || `test-project-${company.nextProjectId || 1}`,
      family: overrides.family || "AI accelerator",
      codename: overrides.codename || "Test",
      title: overrides.title || "Project Test: AI Accelerator",
      originType: "regression",
      proposingDepartment: overrides.proposingDepartment || "hardware",
      createdDay: company.day,
      status: overrides.status || "execution",
      priority: 70,
      scope: 1,
      budgetApproved: 1,
      budgetSpent: 0,
      estimatedDuration: 90,
      estimatedCost: 1.2,
      estimatedBenefit: 70,
      requiredDepartments: overrides.requiredDepartments || ["hardware", "quality", "finance"],
      requiredHeadcount: overrides.requiredHeadcount || { hardware: 2, quality: 1 },
      staffAllocations: overrides.staffAllocations || {},
      assignedEmployees: [],
      workItemIds: [],
      deadlineDay: company.day + 90,
      progress: 35,
      quality: 58,
      integration: 42,
      customerInterest: 55,
      visibleRisk: 48,
      visibleConfidence: 66,
      hiddenReality: { trueTechnicalDifficulty: 60, trueStrategicValue: 70, hiddenObsolescenceRate: 10 },
      performance: {
        progress: 35,
        scheduleVariance: 0,
        budgetVariance: 0,
        quality: 58,
        integration: 42,
        teamHealth: 70,
        staffingCoverage: 100,
        workloadOverload: 0,
        blockerCount: 0,
        customerInterest: 55,
        strategicConfidence: 66,
        riskTrend: 48
      },
      ...overrides
    });

    validationMode = true;
    ensureBibleSystems();
    ensureProjectPortfolio();
    ensureWorkforceEconomySystems();

    company.projects = [];
    company.projectProposals = [];
    company.projectArchive = [];
    employees.forEach(e => {
      e.active = true;
      e.role = "Finance Analyst";
      e.performanceManagement = { ...(e.performanceManagement || {}), stage: "active" };
      e.workload = null;
    });

    const staffingProject = makeControlledProject({
      id: "staffing-regression",
      title: "Project Staffing Regression",
      family: "AI accelerator",
      requiredHeadcount: { hardware: 2, quality: 1 },
      requiredDepartments: ["hardware", "quality"]
    });
    company.projects = [staffingProject];
    rebuildRuntimeIndexes();
    updatePortfolioHealth();
    const missingRows = projectStaffingDetails().filter(row => row.project.id === staffingProject.id);
    assert(Math.round(derivedStaffingCoverage(staffingProject)) === 0, `Unallocated project should have 0 staffing coverage, got ${derivedStaffingCoverage(staffingProject)}`);
    assert(missingRows.length === 2, `Expected hardware and quality missing rows, got ${missingRows.length}`);
    assert(missingRows.every(row => row.status === "uncovered"), `Expected uncovered missing rows, got ${missingRows.map(row => row.status).join(", ")}`);

    employees[0].role = "Chip Architect";
    staffingProject.staffAllocations = { [employees[0].id]: 1 };
    rebuildRuntimeIndexes();
    updatePortfolioHealth();
    const partialCoverage = derivedStaffingCoverage(staffingProject);
    assert(partialCoverage > 0 && partialCoverage < 100, `Partial allocation should create partial coverage, got ${partialCoverage}`);

    const university = makeControlledProject({
      id: "university-regression",
      family: "university partnership",
      title: "Project Signal: University Partnership",
      proposingDepartment: "finance",
      requiredDepartments: ["finance"],
      requiredHeadcount: { finance: 1 },
      performance: { ...staffingProject.performance, staffingCoverage: 100 }
    });
    const hardware = makeControlledProject({
      id: "hardware-regression",
      family: "AI accelerator",
      title: "Project Phoenix: AI Accelerator",
      proposingDepartment: "hardware",
      requiredDepartments: ["hardware", "quality"],
      requiredHeadcount: { hardware: 1, quality: 1 },
      performance: { ...staffingProject.performance, staffingCoverage: 100 }
    });
    const universityProfile = projectDependencyProfile(university);
    const hardwareProfile = projectDependencyProfile(hardware);
    assert(universityProfile.people + universityProfile.trust + universityProfile.innovation > universityProfile.hardware + universityProfile.manufacturing, "University partnership should depend more on people/trust/innovation than hardware/manufacturing");
    assert(hardwareProfile.hardware + hardwareProfile.manufacturing + hardwareProfile.quality > hardwareProfile.people, "Hardware project should depend on hardware/manufacturing/quality more than people");

    company.chip = 12;
    company.software = 72;
    company.integration = 22;
    company.quality = 28;
    company.trust = 82;
    company.board = 78;
    company.cash = 14;
    company.culture = { ...(company.culture || {}), innovation: 84, workLife: 78, communication: 76, qualityDiscipline: 35 };
    company.market = { ...(company.market || {}), aiDemand: 78, hardwareDemand: 76 };
    company.manufacturing = { ...(company.manufacturing || {}), readiness: 16, yield: 32, supplyRisk: 88 };
    employees.forEach(e => {
      e.morale = 82;
      e.stress = 24;
      e.focus = 70;
    });
    company.projects = [hardware, university];
    hardware.staffAllocations = { [employees[0].id]: 1 };
    university.staffAllocations = { [employees[1].id]: 1 };
    rebuildRuntimeIndexes();
    updatePortfolioHealth();
    const hardwareCondition = projectCompanyConditionScore(hardware).score;
    const universityCondition = projectCompanyConditionScore(university).score;
    assert(universityCondition > hardwareCondition + 12, `University conditions should outperform hardware under hardware/manufacturing stress (${universityCondition} vs ${hardwareCondition})`);

    const html = projectPortfolioHtml();
    assert(html.includes("Current Execution Health:"), "Portfolio should show Current Execution Health");
    assert(html.includes("Dependencies:"), "Portfolio should show project dependencies");
    assert(html.includes("allocated"), "Portfolio should show allocated staffing");
    assert(!html.includes("covered or under review"), "Portfolio should not use the old ambiguous staffing label");

    const sensitivityBase = makeControlledProject({
      id: "sensitivity-base",
      family: "AI accelerator",
      title: "Project Sensitivity: Base",
      requiredHeadcount: { hardware: 2 },
      requiredDepartments: ["hardware"],
      performance: { ...hardware.performance, riskTrend: 55, blockerCount: 0, workloadOverload: 0 }
    });
    const sensitivityShort = makeControlledProject({
      ...sensitivityBase,
      id: "sensitivity-short",
      title: "Project Sensitivity: Short",
      performance: { ...sensitivityBase.performance, riskTrend: 75, blockerCount: 1, workloadOverload: 10 }
    });
    sensitivityBase.staffAllocations = { [employees[0].id]: 2 };
    sensitivityShort.staffAllocations = { [employees[0].id]: 1 };
    const healthyScore = projectExecutionHealthBreakdown(sensitivityBase).current;
    const strainedScore = projectExecutionHealthBreakdown(sensitivityShort).current;
    const sensitivityDrop = healthyScore - strainedScore;
    assert(sensitivityDrop >= 8 && sensitivityDrop <= 28, `Staffing/risk sensitivity should be material but bounded, got ${sensitivityDrop}`);

    const completed = makeControlledProject({
      id: "completed-regression",
      title: "Project Complete: Regression",
      status: "completed",
      progress: 100,
      completedDay: 156,
      commercialStatus: "launched"
    });
    const completedTiming = projectTimingForecast(completed);
    assert(completedTiming.status === "complete", `Completed project should have complete timing status, got ${completedTiming.status}`);
    assert(completedTiming.short.includes("Completed on day 157"), `Completed project timing should show completion day, got ${completedTiming.short}`);
    assert(!/\d+-\d+ day/.test(completedTiming.short), `Completed project should not show a future estimate, got ${completedTiming.short}`);

    const frictionProject = makeControlledProject({
      id: "friction-regression",
      title: "Project Friction: Regression",
      family: "AI accelerator",
      requiredDepartments: ["hardware", "software", "quality"],
      requiredHeadcount: { hardware: 3, software: 2, quality: 2 },
      staffAllocations: {},
      createdDay: company.day - 80,
      deadlineDay: company.day - 3,
      progress: 42,
      quality: 38,
      visibleRisk: 86,
      hiddenReality: { trueTechnicalDifficulty: 88, trueStrategicValue: 70, hiddenObsolescenceRate: 10 }
    });
    company.projects = [frictionProject];
    company.workItems = [];
    company.randomState = 2463534242;
    company.quality = 36;
    company.integration = 28;
    employees.forEach(e => {
      e.role = "Finance Analyst";
      e.stress = 84;
      e.focus = 45;
      e.workload = null;
    });
    for (let i = 0; i < 45; i++) {
      company.day += 1;
      projectPerformanceUpdate();
    }
    const frictionItems = company.workItems.filter(w => w.projectId === frictionProject.id && w.status === "open");
    const frictionBlockers = frictionItems.reduce((sum, work) => sum + ((work.blockedBy || []).length), 0);
    assert((frictionProject.performance?.backlogCount || 0) >= 3, `Stressed project should accumulate open work/backlog, got ${frictionProject.performance?.backlogCount || 0}`);
    assert(frictionBlockers > 0 || (frictionProject.performance?.blockerCount || 0) > 0, "Stressed project should produce at least one development blocker");
    assert(projectPortfolioHtml().includes("open work"), "Portfolio should display open work/backlog count");
    assert(projectPortfolioHtml().includes("blockers"), "Portfolio should display blocker count");

    validationMode = false;
    return {
      ok: failures.length === 0,
      failures,
      partialCoverage,
      hardwareCondition,
      universityCondition,
      sensitivityDrop,
      completedTiming,
      htmlPreview: html.slice(0, 600)
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
