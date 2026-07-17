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
    const validRooms = Object.keys(ROOM_CAPACITY || {});
    const foundingRoles = ["Software Engineer","Firmware Engineer","Hardware Engineer","Chip Architect","Software QA Engineer","Industrial Designer","Product Manager","Finance Analyst"];

    validationMode = true;
    ensureBibleSystems();
    ensureWorkforceEconomySystems();
    ensureProjectPortfolio();

    assert(typeof ROLE_DEFINITIONS === "object", "ROLE_DEFINITIONS should exist");
    assert(typeof roomForAction === "function", "roomForAction should exist");
    assert(Object.keys(ROLE_DEFINITIONS).length === 15, "Expected 15 canonical role definitions");
    assert(!Object.keys(ROLE_DEFINITIONS).includes("CEO"), "CEO must not be a role definition");
    assert(!employees.some(e => /CEO|Board/i.test(e.role)), "CEO and board must not be employees");

    Object.entries(ROLE_DEFINITIONS).forEach(([role, def]) => {
      assert(def.department, `${role} missing department`);
      assert(validRooms.includes(def.primaryRoom), `${role} has invalid primary room`);
      (def.secondaryRooms || []).forEach(room => assert(validRooms.includes(room), `${role} has invalid secondary room ${room}`));
      assert(Array.isArray(def.allowedActivities) && def.allowedActivities.length > 0, `${role} missing allowed activities`);
      assert(def.projectCapabilities && Object.keys(def.projectCapabilities).length > 0, `${role} missing project capabilities`);
    });

    const active = employees.filter(e => e.active);
    assert(active.length === 8, `Expected exactly 8 founding employees, got ${active.length}`);
    assert(JSON.stringify(active.map(e => e.role)) === JSON.stringify(foundingRoles), `Founding roles changed: ${active.map(e => e.role).join(", ")}`);
    active.forEach(e => {
      assert(e.homeRoom === rolePrimaryRoom(e.role), `${e.role} has wrong home room`);
      assert(e.homeZone === zoneForRoom(e.homeRoom), `${e.role} has wrong home zone`);
      assert(e.department === roleDepartment(e.role), `${e.role} has wrong department`);
    });

    const byRole = role => active.find(e => e.role === role);
    assert(roomForAction(byRole("Software Engineer"), "work", { work: { type: "software" } }) === "software-studio", "Software work should use Software Studio");
    assert(roomForAction(byRole("Hardware Engineer"), "work", { work: { type: "hardware" } }) === "hardware-lab", "Hardware work should use Hardware Lab");
    assert(roomForAction(byRole("Software QA Engineer"), "lab", { work: { type: "verification" } }) === "hardware-lab", "Validation can use Hardware Lab");
    assert(roomForAction(byRole("Product Manager"), "meeting", {}) === "meeting-room", "Planning should use Meeting Room");
    assert(roomForAction(byRole("Finance Analyst"), "work", { work: { type: "runway" } }) === "executive-suite", "Finance work should use Executive Suite");
    assert(roomForAction(byRole("Firmware Engineer"), "break", {}) === "break-area", "Breaks should use Break Area");

    const engineer = byRole("Software Engineer");
    const startingSoftware = company.software;
    moveToZone(engineer, zoneForRoom(roomForAction(engineer, "work", { work: { type: "software" } })), true);
    engineer.lastAction = "work";
    engineer.action = "working";
    const effect = applyRoomTickEffects(engineer);
    assert(engineer.currentRoom === "software-studio", "Employee should record current room");
    assert(effect.productivity > 0 && effect.productivity <= 1.12, "Room productivity effect should be bounded");
    assert(company.software === startingSoftware, "Room occupancy alone must not create product progress");

    const beforeLessons = JSON.stringify(company.lessons || {});
    applyRoomTickEffects(engineer);
    assert(JSON.stringify(company.lessons || {}) === beforeLessons, "Room occupancy alone must not create institutional lessons");

    const project = (company.projects || []).find(p => /Legacy/i.test(p.title)) || (company.projects || [])[0];
    assert(project, "Legacy Flagship project should exist");
    ensureProjectAllocations();
    const coverage = derivedStaffingCoverage(project);
    assert(coverage > 0, "Legacy project should have some staffing coverage from founding team");
    assert(Object.values(project.requiredHeadcount || {}).reduce((s, v) => s + Number(v || 0), 0) <= 8, "Legacy project should be completable by founding team capacity");

    company.cash = 80;
    company.finance.runwayDays = 999;
    company.hiringPolicy.mode = "normal";
    startRecruiting("Software QA Engineer", "specialist", "quality");
    const item = company.recruitingPipeline[0];
    assert(item.role === "Software QA Engineer" && item.department === "quality", "Recruiting should use canonical role and department");
    const candidate = generateRecruitingCandidate(item);
    ["role","skills","experience","salaryExpectation","personality","strengths","weaknesses","availability","hiringDifficulty","cultureFit","growthPotential"].forEach(key => assert(candidate[key] !== undefined, `Candidate missing ${key}`));

    item.status = "searching";
    item.dueDay = company.day;
    item.attempts = 0;
    company.forceRecruitingCandidateForTest = { skill: 42, cultureFit: 35, experience: 36, leadership: 24, salaryPremium: 0, exceptional: false, mediocre: true, forceRetry: true };
    processRecruitingPipeline();
    company.forceRecruitingCandidateForTest = null;
    assert(item.status === "searching", "Failed candidate should restart search instead of stalling");
    assert(item.dueDay > company.day, "Restarted search should receive a future due day");

    const beforeCount = employees.filter(e => e.active).length;
    completeRecruitingHire(item, { skill: 82, cultureFit: 76, experience: 70, leadership: 58, salaryPremium: 0 });
    const hire = employees.filter(e => e.active).find(e => e.joinedDay === company.day && e.role === "Software QA Engineer");
    assert(employees.filter(e => e.active).length === beforeCount + 1, "Completed recruiting should add one employee");
    assert(hire && hire.homeRoom === rolePrimaryRoom(hire.role), "New hire should inherit room profile");
    assert(hire && hire.department === "quality", "New hire should inherit canonical department");

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Rooms, roles, and hiring regression test passed");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
