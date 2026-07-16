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
    const makeProject = (id, title, requiredHeadcount, priority = 70) => ({
      id,
      family: "AI accelerator",
      codename: id.replace(/^p-/, "").toUpperCase(),
      title,
      originType: "regression",
      proposingDepartment: "hardware",
      createdDay: company.day,
      status: "execution",
      priority,
      scope: 1,
      budgetApproved: 1,
      budgetSpent: 0,
      estimatedDuration: 90,
      estimatedCost: 1.2,
      estimatedBenefit: 70,
      requiredDepartments: Object.keys(requiredHeadcount),
      requiredHeadcount,
      requiredSkills: { hardware: 65, verification: 65, communication: 40 },
      staffAllocations: {},
      assignedEmployees: [],
      workItemIds: [],
      deadlineDay: company.day + 90,
      progress: 35,
      quality: 58,
      integration: 42,
      customerInterest: 55,
      visibleRisk: 48,
      visibleConfidence: 66,
      hiddenReality: { trueTechnicalDifficulty: 65, trueStrategicValue: 70, hiddenObsolescenceRate: 10 },
      performance: { progress: 35, scheduleVariance: 0, budgetVariance: 0, quality: 58, integration: 42, teamHealth: 70, staffingCoverage: 100, workloadOverload: 0, blockerCount: 0, customerInterest: 55, strategicConfidence: 66, riskTrend: 48 }
    });

    validationMode = true;
    ensureBibleSystems();
    ensureWorkforceEconomySystems();
    ensureProjectPortfolio();
    company.projects = [];
    company.projectProposals = [];
    company.projectArchive = [];
    company.workItems = [];
    company.recruitingPipeline = [];
    company.hiringRequests = [];
    company.escalationQueue = [];
    company.pendingEvent = null;

    employees.forEach((e, index) => {
      e.active = index < 6;
      e.role = index < 2 ? "Chip Architect" : index === 2 ? "Verification Engineer" : index === 3 ? "Product Manager" : "Finance Analyst";
      e.skills = index < 2
        ? { hardware: 88, architecture: 80, verification: 72, communication: 60, leadership: 55 }
        : index === 2
          ? { verification: 18, hardware: 20, communication: 35, leadership: 30 }
          : { product: 80, communication: 70, leadership: 45 };
      e.focus = 72;
      e.stress = 46;
      e.morale = 70;
      e.offsite = false;
      e.performanceManagement = { ...(e.performanceManagement || {}), stage: "active" };
      e.workload = null;
    });

    const core = makeProject("p-core", "Project Core: Existing Commitment", { hardware: 2 }, 95);
    const release = makeProject("p-release", "Project Release: Coverage Gap", { hardware: 1, quality: 1 }, 60);
    core.staffAllocations = { [employees[0].id]: .75, [employees[1].id]: .75 };
    release.staffAllocations = { [employees[2].id]: .75 };
    company.projects = [core, release];
    const blockerWork = {
      id: "blocker-work",
      title: "Release: Validate thermal integration",
      department: "quality",
      type: "verification",
      priority: 85,
      difficulty: 70,
      progress: 40,
      qualityRisk: 82,
      blockedBy: ["missing thermal chamber data"],
      requiredSkills: { verification: 65 },
      assignedTeam: "quality",
      ownerId: employees[2].id,
      collaborators: [],
      deadlineDay: company.day + 12,
      visibleTo: ["quality", "hardware"],
      createdDay: company.day - 4,
      status: "open",
      stage: "Testing",
      projectId: release.id,
      blockerAwareness: { observed: 0, lastActualCount: 1, detectionProbability: .25 }
    };
    company.workItems = [blockerWork];
    release.workItemIds = [blockerWork.id];
    rebuildRuntimeIndexes();
    computeProjectCapacityState(activeProjects());

    const snapshot = buildWorkforceAllocationSnapshot();
    const hardware = snapshot.departments.hardware;
    const quality = snapshot.departments.quality;
    const releaseSnap = snapshot.projects[release.id];
    assert(hardware.activeHeadcount >= 2, "Hardware department should have enough people in headcount terms");
    assert(releaseSnap.missingAssignments >= 2, `Release project should still have missing qualified assignments, got ${releaseSnap.missingAssignments}`);
    assert(snapshot.totals.missingAssignments === Object.values(snapshot.projects).reduce((sum, p) => sum + p.missingAssignments, 0), "Crisis total must equal the sum of project missing assignments");
    assert(criticalStaffingGapCount() === snapshot.totals.missingAssignments, "Critical staffing gap count should come from the allocation snapshot");
    assert(quality.actualBlockedWork === 1 && quality.observedBlockedWork === 0 && quality.unreportedBlockedWork === 1, "Hidden blocker truth and manager awareness should be separate");

    const beforeUnrelated = snapshot.totals.missingAssignments;
    employees[3].active = true;
    employees[3].role = "Product Manager";
    const afterUnrelated = buildWorkforceAllocationSnapshot().totals.missingAssignments;
    assert(afterUnrelated === beforeUnrelated, "Hiring or activating an unrelated role must not improve project staffing crisis coverage");

    employees[4].active = true;
    employees[4].role = "Verification Engineer";
    employees[4].skills = { verification: 92, hardware: 60, communication: 70, leadership: 50 };
    release.staffAllocations[employees[4].id] = 1;
    const afterQualified = buildWorkforceAllocationSnapshot().totals.missingAssignments;
    assert(afterQualified === beforeUnrelated - 1, `Qualified allocation should reduce missing assignments exactly once (${beforeUnrelated} -> ${afterQualified})`);

    company.crisis = makeCrisisCandidate("staffing", staffingCrisisBreakdown(buildWorkforceAllocationSnapshot()), 76);
    const detail = staffingCrisisProgressDetail(buildWorkforceAllocationSnapshot());
    assert(detail.currentMissingAssignments === afterQualified, "Staffing crisis progress should use current snapshot missing assignments");
    assert(detail.initialMissingAssignments >= detail.currentMissingAssignments, "Staffing crisis progress should preserve initial missing assignments");
    company.crisis = null;
    company.crisisStage = null;
    company.crisisType = null;
    company.crisisRiskDays = { ...(company.crisisRiskDays || {}), staffing: 5 };
    employees.forEach(e => { e.stress = 72; });
    release.staffAllocations = { [employees[2].id]: .75 };
    company.projects = [release];
    rebuildRuntimeIndexes();
    const oneProjectCandidate = typedCrisisCandidate();
    assert(oneProjectCandidate?.type !== "staffing", "One active project with two missing assignments should stay a portfolio/workforce warning, not a company staffing crisis");

    const second = makeProject("p-second", "Project Second: Shared Shortage", { software: 2, quality: 1 }, 70);
    company.projects.push(second);
    rebuildRuntimeIndexes();
    const broaderSnapshot = buildWorkforceAllocationSnapshot();
    const broaderSeverity = staffingCrisisSeverity(broaderSnapshot);
    const broaderCandidate = typedCrisisCandidate();
    assert(broaderSeverity.affectedProjects >= 2 && broaderSnapshot.totals.missingAssignments >= 4, "Broader staffing shortage setup should affect multiple projects");
    assert(broaderCandidate?.type === "staffing", `Broader multi-project shortage should be eligible for staffing crisis, got ${broaderCandidate?.type || "none"}`);

    const html = projectPortfolioHtml() + departmentBriefingHtml() + workforceFinancialPressureHtml();
    assert(html.includes("Project allocation gap"), "Workforce UI should label project allocation gap");
    assert(html.includes("project coverage"), "Project card should label project coverage");
    assert(html.includes("Reported blockers"), "UI should display reported blockers rather than mixing hidden truth");
    assert(!/staffing gap/i.test(html), "Normal UI should not use ambiguous staffing gap wording");

    saveGame();
    const loaded = loadGame();
    const savedWork = company.workItems.find(w => w.id === "blocker-work");
    assert(loaded, "Save/load should succeed");
    assert(savedWork?.blockerAwareness && savedWork.blockerAwareness.observed === 0, "Blocker awareness should survive save/load");

    validationMode = false;
    return {
      ok: failures.length === 0,
      failures,
      snapshot: {
        missingAssignments: snapshot.totals.missingAssignments,
        releaseMissing: releaseSnap.missingAssignments,
        actualBlockedWork: quality.actualBlockedWork,
        observedBlockedWork: quality.observedBlockedWork
      },
      afterQualified,
      htmlPreview: html.slice(0, 800)
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
