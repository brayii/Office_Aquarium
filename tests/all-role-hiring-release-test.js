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
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const browserErrors = [];
  page.on("pageerror", error => browserErrors.push(`PAGE: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") browserErrors.push(`CONSOLE: ${message.text()}`);
  });

  const fileUrl = `file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const expectedRooms = {
      "Software Engineer": "software-studio",
      "Firmware Engineer": "software-studio",
      "Software QA Engineer": "software-studio",
      "Technical Lead": "software-studio",
      "Software Architect": "software-studio",
      "Hardware Engineer": "hardware-lab",
      "Chip Architect": "hardware-lab",
      "Electrical Engineer": "hardware-lab",
      "Industrial Designer": "hardware-lab",
      "Manufacturing Engineer": "hardware-lab",
      "Product Manager": "meeting-room",
      "Finance Analyst": "executive-suite",
      "Manager": "meeting-room",
      "Director": "executive-suite",
      "Vice President": "executive-suite"
    };
    const strongCandidate = {
      skill: 88,
      cultureFit: 82,
      experience: 80,
      leadership: 72,
      salaryPremium: 0,
      exceptional: false,
      mediocre: false
    };

    validationMode = true;
    startNewCompany();
    ensureBibleSystems();
    ensureWorkforceEconomySystems();

    const roles = allRecruitableRoles();
    assert(roles.length === 15, `Expected 15 recruitable roles, got ${roles.length}`);
    assert(JSON.stringify([...roles].sort()) === JSON.stringify(Object.keys(expectedRooms).sort()), "Recruitable role list does not match the release role catalog");
    roles.forEach(role => {
      assert(rolePrimaryRoom(role) === expectedRooms[role], `${role} should primarily use ${expectedRooms[role]}, got ${rolePrimaryRoom(role)}`);
      assert(["hardware","software","quality","product","finance","people"].includes(roleDepartment(role)), `${role} has an invalid hiring department`);
    });

    company.day = 150;
    company.cash = 80;
    company.valuation = 180;
    company.customers = 180;
    company.dailyRevenue = .5;
    company.phase = "launched";
    company.finance = { ...(company.finance || {}), runwayDays: 999, netCashFlowDaily: .2 };
    company.organizationMaturity = { stage: "established" };
    const targets = organizationRoleTargets("established");
    assert(roles.every(role => targets[role] >= 1), `Every role must have an established-company target: ${JSON.stringify(targets)}`);

    // Prove each role can become the exact next organizational demand rather than
    // being hidden behind another role in the same department.
    for (const missingRole of roles) {
      employees.length = 0;
      let id = 0;
      Object.entries(targets).forEach(([role, target]) => {
        const count = Math.max(0, target - (role === missingRole ? 1 : 0));
        for (let i = 0; i < count; i += 1) employees.push({ id: id++, role, active: true, offsite: false });
      });
      company.openRoles = [];
      company.hiringRequests = [];
      company.recruitingPipeline = [];
      company.escalationQueue = [];
      company.pendingEvent = null;
      const gap = organizationalRoleGapForDepartment(roleDepartment(missingRole));
      assert(gap?.role === missingRole, `${missingRole} cannot become the next organizational role gap; got ${gap?.role || "none"}`);
      assert(roleForHiringNeed(roleDepartment(missingRole)) === missingRole, `${missingRole} cannot reach the hiring request selector`);
    }

    // Run the real CEO approval, recruiting, onboarding, room assignment, and
    // save/load path once for every role.
    startNewCompany();
    ensureBibleSystems();
    ensureWorkforceEconomySystems();
    company.cash = 120;
    company.finance = { ...(company.finance || {}), runwayDays: 999, netCashFlowDaily: .25 };
    company.hiringPolicy.mode = "normal";
    const hiredIds = [];
    for (const role of roles) {
      company.day += 1;
      const department = roleDepartment(role);
      const requestId = `release-role-request-${company.day}-${role.replace(/\s+/g, "-").toLowerCase()}`;
      const request = { id: requestId, day: company.day, department, role, status: hiringRequestStatus("queued"), score: 94, confidence: 88 };
      const event = makeHiringRequestEvent(department, company.staffingModel?.[department] || {}, role, requestId);
      company.hiringRequests.unshift(request);
      assert(event.hiringRequest?.role === role, `${role} request changed to ${event.hiringRequest?.role || "none"} while the memo was created`);
      assert(event.hiringRequest?.requestId === requestId, `${role} memo lost its request identity`);

      company.pendingEvent = event;
      company.pendingEvent = prepareStrategicDecision(company.pendingEvent);
      company.pendingCommunication = null;
      company.selected = company.pendingEvent.choices.findIndex(choice => canonicalRole(choice.hireRole) === role);
      assert(company.selected >= 0, `${role} memo does not contain an approval choice for the requested role`);
      const beforeCount = employees.filter(employee => employee.active).length;
      applyDecision();

      const recruiting = company.recruitingPipeline.find(item => activeRecruitingStatusSet().has(item.status) && canonicalRole(item.role) === role && item.department === department);
      assert(recruiting, `Approving ${role} did not start the matching recruiting search`);
      assert(request.status === hiringRequestStatus("approved"), `${role} request remained ${request.status} after approval`);
      if (!recruiting) continue;

      completeRecruitingHire(recruiting, strongCandidate);
      const hire = employees.find(employee => employee.active && canonicalRole(employee.role) === role && employee.joinedDay === company.day && !hiredIds.includes(employee.id));
      assert(hire, `${role} recruiting completed without creating an active employee`);
      if (!hire) continue;
      hiredIds.push(hire.id);
      assert(employees.filter(employee => employee.active).length === beforeCount + 1, `${role} did not increase active headcount`);
      assert(hire.homeRoom === expectedRooms[role], `${role} joined in ${hire.homeRoom || "no room"} instead of ${expectedRooms[role]}`);
      assert(hire.homeZone === zoneForRoom(expectedRooms[role]), `${role} joined in the wrong office zone`);
      assert(hire.performanceManagement?.stage === "onboarding", `${role} did not enter onboarding`);

      hire.onboarding.startDay = company.day - hire.onboarding.duration;
      completeDueOnboarding();
      assert(hire.active && hire.performanceManagement?.stage !== "onboarding", `${role} disappeared or remained stuck when onboarding completed`);

      saveGame();
      assert(loadGame(), `${role} save could not reload`);
      const loadedHire = employees.find(employee => employee.id === hire.id);
      assert(loadedHire?.active, `${role} disappeared after save/load`);
      assert(loadedHire?.homeRoom === expectedRooms[role], `${role} lost its room assignment after save/load`);
    }

    assert(hiredIds.length === roles.length, `Only ${hiredIds.length} of ${roles.length} roles completed the full hiring path`);
    roles.forEach(role => assert(employees.some(employee => employee.active && canonicalRole(employee.role) === role), `${role} is absent after the all-role hiring run`));

    // Two separately approved positions for the same role must produce two
    // requisitions, while reopening the same approval must not duplicate it.
    company.recruitingPipeline = [];
    const parallelRequestIds = [];
    for (let i = 0; i < 2; i += 1) {
      company.day += 1;
      const role = "Software Engineer", department = roleDepartment(role);
      const requestId = `parallel-software-request-${i}`;
      const request = { id: requestId, day: company.day, department, role, status: hiringRequestStatus("queued") };
      const event = makeHiringRequestEvent(department, company.staffingModel?.[department] || {}, role, requestId);
      company.hiringRequests.unshift(request);
      company.pendingEvent = event;
      company.pendingEvent = prepareStrategicDecision(company.pendingEvent);
      company.selected = company.pendingEvent.choices.findIndex(choice => choice.hireRole === role);
      applyDecision();
      parallelRequestIds.push(requestId);
    }
    const parallelSearches = company.recruitingPipeline.filter(item => activeRecruitingStatusSet().has(item.status) && item.role === "Software Engineer" && parallelRequestIds.includes(item.hiringRequestId));
    const parallelDebug = {
      pipeline: company.recruitingPipeline.filter(item => item.role === "Software Engineer").map(item => ({ id: item.id, requestId: item.hiringRequestId, status: item.status })),
      requests: company.hiringRequests.filter(item => item.role === "Software Engineer").slice(0,4).map(item => ({ id: item.id, status: item.status, pipelineId: item.pipelineId }))
    };
    assert(parallelSearches.length === 2, `Two approved Software Engineer positions produced ${parallelSearches.length} recruiting searches: ${JSON.stringify(parallelDebug)}`);
    assert(new Set(parallelSearches.map(item => item.id)).size === 2, `Parallel Software Engineer approvals reused one requisition: ${JSON.stringify(parallelDebug)}`);

    // Legacy saves with a queued record but no corresponding inbox memo must
    // recover instead of blocking that role forever.
    company.escalationQueue = [];
    company.pendingEvent = null;
    company.recruitingPipeline = [];
    const stale = { id: "legacy-stale-manager-request", day: company.day - 12, department: "people", role: "Manager", status: hiringRequestStatus("queued") };
    company.hiringRequests = [stale];
    repairHiringRequestIntegrity();
    assert(stale.status === hiringRequestStatus("orphaned"), `Stale request repair left Manager in ${stale.status}`);
    assert(committedRoleCount("Manager") === 0, "A repaired stale Manager request still counts as committed headcount");

    // Delay and rejection must resolve the original request instead of leaving a
    // hidden queued record that blocks the role forever.
    for (const outcome of ["delayed", "rejected"]) {
      company.day += 1;
      company.escalationQueue = [];
      company.pendingEvent = null;
      company.recruitingPipeline = [];
      const role = outcome === "delayed" ? "Technical Lead" : "Electrical Engineer";
      const department = roleDepartment(role);
      const requestId = `release-${outcome}-${company.day}`;
      const request = { id: requestId, day: company.day, department, role, status: hiringRequestStatus("queued") };
      const event = makeHiringRequestEvent(department, company.staffingModel?.[department] || {}, role, requestId);
      company.hiringRequests = [request];
      company.pendingEvent = event;
      company.pendingEvent = prepareStrategicDecision(company.pendingEvent);
      company.selected = company.pendingEvent.choices.findIndex(choice => outcome === "delayed" ? !!choice.deferHiring : !!choice.rejectHiring);
      assert(company.selected >= 0, `${role} memo is missing its ${outcome} choice`);
      applyDecision();
      assert(request.status === hiringRequestStatus(outcome), `${role} ${outcome} decision did not immediately resolve the original request`);
      repairHiringRequestIntegrity();
      assert(request.status === hiringRequestStatus(outcome), `${role} ${outcome} decision left the original request in ${request.status}`);
      assert(!company.hiringRequests.some(record => record.status === hiringRequestStatus("queued") && hiringRequestMatches(record,department,role)), `${role} remained secretly queued after being ${outcome}`);
    }

    validationMode = false;
    return {
      ok: failures.length === 0,
      failures,
      hiredRoles: roles,
      finalActiveEmployees: employees.filter(employee => employee.active).length
    };
  });

  await browser.close();
  const ok = result.ok && browserErrors.length === 0;
  console.log(JSON.stringify({ ok, result, browserErrors }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
