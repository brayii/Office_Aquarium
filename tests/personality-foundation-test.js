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

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const profileSnapshot = () => employees.filter(e => e.active).map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      seed: e.personalitySeed,
      personality: { ...(e.personality || {}) },
      archetypes: [...(e.personalityArchetypes || [])]
    }));
    const sameProfile = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const validPersonality = e => {
      const keys = ["workPace","sociability","collaboration","riskTolerance","adaptability","initiative","resilience","detailOrientation","empathy","structureNeed"];
      return Number.isFinite(e.personalitySeed) &&
        e.personality &&
        keys.every(k => Number.isFinite(e.personality[k]) && e.personality[k] >= -1 && e.personality[k] <= 1) &&
        Array.isArray(e.personalityArchetypes) &&
        e.personalityArchetypes.length >= 2 &&
        e.emotionalState &&
        e.emotionalCooldowns &&
        e.emotionalDailyTotals;
    };

    validationMode = true;
    reset(true, false, 123456);
    ensureBibleSystems();
    employees.forEach(e => ensureEmployeePersonality(e));

    const active = employees.filter(e => e.active);
    assert(active.length === 8, "Founding team should start with eight employees");
    active.forEach(e => assert(validPersonality(e), `${e.name} missing valid personality state`));
    assert(!active.some(e => /CEO|Board/i.test(`${e.name} ${e.role}`)), "CEO or board should not be generated as an employee");
    const distinctFounders = new Set(active.map(e => JSON.stringify(e.personality || {}))).size;
    assert(distinctFounders > 1, "Founding employees should not all have identical personalities");

    const firstRun = profileSnapshot();
    reset(true, false, 123456);
    const secondRun = profileSnapshot();
    assert(sameProfile(firstRun, secondRun), "Same simulation seed should generate the same founding profiles");
    reset(true, false, 654321);
    const thirdRun = profileSnapshot();
    assert(!sameProfile(firstRun, thirdRun), "Different simulation seeds should vary founding profiles");

    const employee = employees.find(e => e.active);
    const coworker = employees.find(e => e.active && e.id !== employee.id);
    const beforeCompany = {
      chip: company.chip,
      software: company.software,
      integration: company.integration,
      quality: company.quality,
      qualityMistakes: company.qualityMistakes,
      lessons: JSON.stringify(company.lessons || {}),
      recruiting: JSON.stringify(company.recruitingPipeline || []),
      hiring: JSON.stringify(company.hiringRequests || []),
      projects: JSON.stringify((company.projects || []).map(p => ({ id: p.id, progress: p.progress, health: p.health, quality: p.quality, risk: p.risk })))
    };
    const boundaryResult = evaluateEmployeeEmotionalReaction({
      employee,
      event: { id: "test-social", type: "collaboration-success", intensity: 80, sentiment: "positive", relationshipImpact: 60 },
      relationshipContext: { coworkerId: coworker.id, relationshipScore: 72, conflict: 0 },
      workloadContext: { pressure: 45, overload: 0, deadlineRisk: 20 },
      roomContext: { crowdedness: 25, noise: 25 }
    });
    assert(Object.keys(boundaryResult).sort().join(",") === "moraleDelta,reasonCode,relatedEmployeeIds,sourceEventId,stressDelta", "Emotional evaluation should return only stress/morale trace data");
    const beforeEmployee = { morale: employee.morale, stress: employee.stress, focus: employee.focus, energy: employee.energy, lessons: JSON.stringify(employee.learnedLessons || {}) };
    applyEmployeeEmotionalReaction({
      employee,
      event: { id: "test-social", type: "collaboration-success", intensity: 80, sentiment: "positive", relationshipImpact: 60 },
      relationshipContext: { coworkerId: coworker.id, relationshipScore: 72, conflict: 0 },
      workloadContext: { pressure: 45, overload: 0, deadlineRisk: 20 },
      roomContext: { crowdedness: 25, noise: 25 }
    });
    assert(employee.focus === beforeEmployee.focus && employee.energy === beforeEmployee.energy, "Personality reaction must not change focus or energy directly");
    assert(JSON.stringify(employee.learnedLessons || {}) === beforeEmployee.lessons, "Personality reaction must not change employee learning");
    assert(employee.morale !== beforeEmployee.morale || employee.stress !== beforeEmployee.stress, "Personality reaction should affect stress or morale");
    assert(company.chip === beforeCompany.chip && company.software === beforeCompany.software && company.integration === beforeCompany.integration, "Personality reaction must not change product progress");
    assert(company.quality === beforeCompany.quality && company.qualityMistakes === beforeCompany.qualityMistakes, "Personality reaction must not change quality directly");
    assert(JSON.stringify(company.lessons || {}) === beforeCompany.lessons, "Personality reaction must not change institutional learning");
    assert(JSON.stringify(company.recruitingPipeline || []) === beforeCompany.recruiting, "Personality reaction must not change recruiting");
    assert(JSON.stringify(company.hiringRequests || []) === beforeCompany.hiring, "Personality reaction must not change hiring requests");
    assert(JSON.stringify((company.projects || []).map(p => ({ id: p.id, progress: p.progress, health: p.health, quality: p.quality, risk: p.risk }))) === beforeCompany.projects, "Personality reaction must not change project stats");

    const introvert = { ...employee, personality: { workPace: 0, sociability: -0.9, collaboration: -0.8, riskTolerance: 0, adaptability: 0, initiative: 0, resilience: -0.4, detailOrientation: 0, empathy: 0, structureNeed: 0.7 }, emotionalState: defaultEmotionalState({ sociability: -0.9, resilience: -0.4, structureNeed: 0.7 }) };
    const connector = { ...employee, personality: { workPace: 0, sociability: 0.9, collaboration: 0.9, riskTolerance: 0, adaptability: 0.4, initiative: 0, resilience: 0.5, detailOrientation: 0, empathy: 0.7, structureNeed: -0.3 }, emotionalState: defaultEmotionalState({ sociability: 0.9, collaboration: 0.9, resilience: 0.5 }) };
    const introvertResult = evaluateEmployeeEmotionalReaction({ employee: introvert, event: { type: "crowding", intensity: 70 }, roomContext: { crowdedness: 95, noise: 80 }, workloadContext: { pressure: 65 } });
    const connectorResult = evaluateEmployeeEmotionalReaction({ employee: connector, event: { type: "crowding", intensity: 70 }, roomContext: { crowdedness: 95, noise: 80 }, workloadContext: { pressure: 65 } });
    assert(introvertResult.stressDelta !== connectorResult.stressDelta || introvertResult.moraleDelta !== connectorResult.moraleDelta, "Same event should affect different personalities differently");
    assert(Number.isFinite(introvertResult.stressDelta) && Number.isFinite(introvertResult.moraleDelta), "Morale and stress deltas should be finite and independent values");

    employee.emotionalLimits = { maxDailyMoraleGain: 1, maxDailyMoraleLoss: 1, maxDailyStressGain: 1, maxDailyStressLoss: 1 };
    employee.emotionalCooldowns = {};
    employee.emotionalDailyTotals = { day: company.day, moraleGain: 0, moraleLoss: 0, stressGain: 0, stressLoss: 0 };
    const firstReaction = applyEmployeeEmotionalReaction({ employee, event: { id: "cooldown-test", type: "deadline-pressure", intensity: 100 }, workloadContext: { pressure: 100, overload: 100, deadlineRisk: 100 } });
    const secondReaction = applyEmployeeEmotionalReaction({ employee, event: { id: "cooldown-test", type: "deadline-pressure", intensity: 100 }, workloadContext: { pressure: 100, overload: 100, deadlineRisk: 100 } });
    assert(Math.abs(firstReaction.stressDelta) <= 1 && Math.abs(firstReaction.moraleDelta) <= 1, "Daily caps should limit a reaction");
    assert(secondReaction.stressDelta === 0 && secondReaction.moraleDelta === 0, "Repeated same event should respect cooldowns");

    saveGame();
    const savedProfiles = profileSnapshot();
    const loaded = loadGame();
    assert(loaded, "Saved company should load");
    assert(sameProfile(savedProfiles, profileSnapshot()), "Save/load should preserve exact personality profiles");

    company.cash = 80;
    company.finance.runwayDays = 999;
    startRecruiting("Software QA Engineer", "specialist", "quality");
    const item = company.recruitingPipeline[company.recruitingPipeline.length - 1];
    const beforeHireCount = employees.filter(e => e.active).length;
    completeRecruitingHire(item, { skill: 82, cultureFit: 76, experience: 70, leadership: 58, salaryPremium: 0 });
    const hire = employees.filter(e => e.active).find(e => e.joinedDay === company.day && e.role === "Software QA Engineer");
    assert(employees.filter(e => e.active).length === beforeHireCount + 1, "Completed recruiting should add a new hire");
    assert(hire && validPersonality(hire), "New hires should receive the same personality system");

    const promoteTarget = employees.find(e => e.active && e.id !== hire.id);
    const beforePromotion = JSON.stringify({ seed: promoteTarget.personalitySeed, personality: promoteTarget.personality, archetypes: promoteTarget.personalityArchetypes });
    promoteTarget.careerLevel += 1;
    promoteTarget.achievements += 3;
    ensureEmployeePersonality(promoteTarget);
    const afterPromotion = JSON.stringify({ seed: promoteTarget.personalitySeed, personality: promoteTarget.personality, archetypes: promoteTarget.personalityArchetypes });
    assert(beforePromotion === afterPromotion, "Promotion-like career changes should preserve personality");

    debugMode = false;
    showEmployee(employee.id);
    const normalModal = document.getElementById("employeeModal").innerText;
    assert(/Personality/i.test(normalModal), "Normal employee UI should show a personality summary");
    assert(!/workPace|Personality Seed|Emotional Drivers|socialBattery/.test(normalModal), "Normal UI should not show raw personality/debug fields");
    debugMode = true;
    showEmployee(employee.id);
    const debugModal = document.getElementById("employeeModal").textContent;
    assert(/Personality Seed|workPace|Emotional Drivers|Reason Codes/i.test(debugModal), "AI Debug should show personality trace details");
    debugMode = false;
    renderDecisionEvent();
    const normalBody = document.body.innerText;
    assert(!/socialBattery|recognitionSatisfaction|Personality Seed|needForQuietFocus/.test(normalBody), "Hidden emotional drivers should not leak into normal CEO messages");

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Personality foundation regression test passed");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
