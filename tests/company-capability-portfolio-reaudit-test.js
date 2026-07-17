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
  page.on("console", msg => { if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`); });

  const fileUrl = `file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.evaluate(() => startNewCompany());
  await page.waitForTimeout(200);

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };

    validationMode = true;
    ensureBibleSystems();
    ensureWorkforceEconomySystems();
    ensureProjectPortfolio();
    updatePortfolioHealth();
    updateCompanyCapabilitySystem({ createSupport: true });

    const requiredCapabilities = [
      "managementCapacity",
      "portfolioGovernance",
      "financialPlanning",
      "manufacturingReadiness",
      "customerSupportCapacity",
      "technicalLeadership",
      "mentoringCapacity",
      "successionCoverage",
      "crossProjectCoordination",
      "executiveCommunication"
    ];
    requiredCapabilities.forEach(cap => {
      assert(Object.prototype.hasOwnProperty.call(company.capabilityNeeds, cap), `${cap} missing from company capability needs`);
      assert(Array.isArray(COMPANY_CAPABILITY_TO_ROLES[cap]) && COMPANY_CAPABILITY_TO_ROLES[cap].length, `${cap} missing authoritative role map`);
      assert(Array.isArray(capabilityFulfillmentOptions(cap)) && capabilityFulfillmentOptions(cap).length >= 5, `${cap} missing fulfillment options`);
    });

    assert(!employees.some(e => /CEO|Board/i.test(e.role)), "CEO and board must not become employee roles");
    assert(roleCapabilityContribution("Finance Analyst", "financialPlanning") > roleCapabilityContribution("Product Manager", "financialPlanning"), "Finance Analyst should contribute more to financial planning than Product Manager");
    assert(roleCapabilityContribution("Manufacturing Engineer", "manufacturingReadiness") > roleCapabilityContribution("Product Manager", "manufacturingReadiness"), "Manufacturing Engineer should contribute to manufacturing readiness");

    company.projects = [];
    company.projectProposals = [];
    company.projectArchive = [];
    company.workItems = [];
    company.phase = "launched";
    company.customers = 220;
    company.manufacturing = { ...(company.manufacturing || {}), readiness: 22, yield: 38, supplyRisk: 88 };
    company.finance = { ...(company.finance || {}), runwayDays: 44, netCashFlowDaily: -0.18 };
    company.board = 38;
    employees.forEach(e => {
      e.active = true;
      e.role = "Software Engineer";
      normalizeEmployeeRoleProfile(e);
      e.stress = 78;
      e.focus = 54;
      e.performanceManagement = { ...(e.performanceManagement || {}), stage: "active" };
      e.workload = null;
    });

    const projects = ["AI accelerator", "firmware telemetry", "customer portal", "manufacturing yield"].map((family, i) => makeProject({ family, status: "execution", scope: 1.25, seed: `capability-test-${i}` }));
    company.projects = projects;
    projects.forEach(p => {
      p.requiredHeadcount = { hardware: 2, software: 2, quality: 1 };
      p.staffAllocations = {};
      p.visibleRisk = 78;
      p.performance = { ...(p.performance || {}), riskTrend: 82, blockerCount: 1, workloadOverload: 20 };
      reauditProjectRequirements(p);
    });

    updatePortfolioHealth();
    updateStaffingModel();
    updateCompanyCapabilitySystem({ createSupport: true });

    const gaps = company.capabilityGaps || [];
    assert(gaps.some(g => g.capability === "managementCapacity"), "Management capacity gap should emerge from overloaded company");
    assert(gaps.some(g => g.capability === "portfolioGovernance"), "Portfolio governance gap should emerge from multi-project portfolio");
    assert(gaps.some(g => g.capability === "financialPlanning"), "Financial planning gap should emerge from low runway");
    assert(gaps.some(g => g.capability === "manufacturingReadiness"), "Manufacturing readiness gap should emerge from supply/manufacturing pressure");
    assert(gaps.some(g => g.capability === "technicalLeadership"), "Technical leadership gap should emerge from technical project risk");
    assert(Object.keys(company.capabilityConsequences || {}).length > 0, "Capability gaps should create consequences");
    assert((company.workItems || []).some(w => w.companyCapability), "Capability gaps should create support work, not fake project progress");

    const peopleSignal = capabilityHiringSignalForDepartment("people");
    const financeSignal = capabilityHiringSignalForDepartment("finance");
    assert(peopleSignal && ["Manager", "Director", "Vice President"].includes(peopleSignal.role), `People capability signal should recommend a leadership role, got ${peopleSignal && peopleSignal.role}`);
    assert(financeSignal && financeSignal.role === "Finance Analyst", `Finance capability signal should recommend Finance Analyst, got ${financeSignal && financeSignal.role}`);

    const peopleAssessment = hiringNeedAssessment("people", company.staffingModel.people);
    assert(peopleAssessment.factors.some(f => f.key === "company-capability"), "Hiring assessment should include company capability source");

    const senior = employees[0];
    senior.role = "Software Engineer";
    normalizeEmployeeRoleProfile(senior);
    senior.skills.leadership = 82;
    senior.skills.communication = 78;
    senior.skills.architecture = 82;
    senior.skills.software = 88;
    senior.stress = 30;
    const candidate = promotionCandidateForCapability("technicalLeadership");
    assert(candidate && candidate.readiness > 0 && COMPANY_CAPABILITY_TO_ROLES.technicalLeadership.includes(candidate.targetRole), "Promotion candidate should use skill, experience, workload, and role readiness");

    const legacy = makeProject({ family: "AI accelerator", originType: "legacy", status: "execution", scope: 1.2, seed: "legacy-capability-test" });
    legacy.title = "Legacy Flagship Chip Platform";
    legacy.requiredHeadcount = { hardware: 3, software: 3, quality: 2, people: 4 };
    reauditProjectRequirements(legacy);
    const legacyRequired = Object.values(legacy.requiredHeadcount).reduce((s, v) => s + Number(v || 0), 0);
    assert(legacyRequired <= 8, `Legacy Flagship should remain completable by founding eight, got required ${legacyRequired}`);
    assert(!legacy.requiredRoles.some(role => ["Manager", "Director", "Vice President", "Manufacturing Engineer"].includes(role)), "Legacy project should not falsely require executive/manufacturing roles");

    [...projects, legacy].forEach(p => {
      ["successRequirements","requiredCapabilities","preferredCapabilities","optionalCapabilities","requiredRoles","preferredRoles","optionalRoles","mechanicsAvailable","staffingPaths","learningDomains"].forEach(key => {
        assert(Array.isArray(p[key]), `${p.title} missing ${key}`);
      });
      assert(p.requirementAudit && p.requirementAudit.reason, `${p.title} missing requirement audit`);
    });

    const html = projectPortfolioHtml();
    assert(html.includes("Capabilities:"), "Portfolio UI should show project capability fields");
    assert(developerValidationHtml(employees[0], "", "", null, employees[0].opinionOfCEO || {}).includes("Company Capabilities"), "AI Debug should expose company capability trace");

    validationMode = false;
    return { ok: failures.length === 0, failures, gaps: gaps.map(g => `${g.capability}:${g.gap}`), supportWork: (company.workItems || []).filter(w => w.companyCapability).length };
  });

  await browser.close();
  const ok = errors.length === 0 && result.ok;
  console.log(JSON.stringify({ ok, result, errors: errors.slice(0, 8) }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
