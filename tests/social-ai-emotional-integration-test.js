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

  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const projectSnapshot = () => JSON.stringify((company.projects || []).map(p => ({ id: p.id, progress: p.progress, quality: p.quality, risk: p.risk, status: p.status })));
    const boundarySnapshot = () => ({
      chip: company.chip,
      software: company.software,
      integration: company.integration,
      quality: company.quality,
      customers: company.customers,
      lessons: JSON.stringify(company.lessons || []),
      learningEpisodes: JSON.stringify(company.learningEpisodes || []),
      hiring: JSON.stringify(company.hiringRequests || []),
      recruiting: JSON.stringify(company.recruitingPipeline || []),
      projects: projectSnapshot(),
      work: JSON.stringify((company.workItems || []).map(w => ({ id: w.id, progress: w.progress, status: w.status, blockedBy: w.blockedBy }))),
      movement: JSON.stringify(employees.map(e => ({ id: e.id, zone: e.zone, x: e.x, y: e.y, action: e.action, currentRoom: e.currentRoom })))
    });
    const unchanged = (before, label) => {
      assert(company.chip === before.chip && company.software === before.software && company.integration === before.integration, `${label} must not change product progress`);
      assert(company.quality === before.quality && company.customers === before.customers, `${label} must not change quality or customers`);
      assert(JSON.stringify(company.lessons || []) === before.lessons && JSON.stringify(company.learningEpisodes || []) === before.learningEpisodes, `${label} must not change Institutional Learning`);
      assert(JSON.stringify(company.hiringRequests || []) === before.hiring && JSON.stringify(company.recruitingPipeline || []) === before.recruiting, `${label} must not change hiring or recruiting`);
      assert(projectSnapshot() === before.projects, `${label} must not change project state`);
      assert(JSON.stringify((company.workItems || []).map(w => ({ id: w.id, progress: w.progress, status: w.status, blockedBy: w.blockedBy }))) === before.work, `${label} must not change work items`);
      assert(JSON.stringify(employees.map(e => ({ id: e.id, zone: e.zone, x: e.x, y: e.y, action: e.action, currentRoom: e.currentRoom }))) === before.movement, `${label} must not change movement or selected tasks`);
    };

    validationMode = true;
    reset(true, false, 789012);
    ensureBibleSystems();
    ensureSocialAISystems();
    const [a, b] = employees.filter(e => e.active);
    [a, b].forEach(e => {
      e.currentRoom = "break-area";
      e.zone = "break";
      e.stress = 40;
      e.morale = 50;
      e.emotionalCooldowns = {};
      e.emotionalDailyTotals = { day: company.day, moraleGain: 0, moraleLoss: 0, stressGain: 0, stressLoss: 0 };
      e.emotionalLimits = { maxDailyMoraleGain: 20, maxDailyMoraleLoss: 20, maxDailyStressGain: 20, maxDailyStressLoss: 20 };
    });
    a.personality = { workPace: 0, sociability: 0.9, collaboration: 0.75, riskTolerance: 0, adaptability: 0.2, initiative: 0.2, resilience: 0.4, detailOrientation: 0, empathy: 0.85, structureNeed: -0.3 };
    b.personality = { workPace: 0, sociability: 0.7, collaboration: 0.7, riskTolerance: 0, adaptability: 0.2, initiative: 0.2, resilience: 0.4, detailOrientation: 0, empathy: 0.7, structureNeed: -0.2 };
    [a, b].forEach(e => ensureEmployeePersonality(e));

    const beforePositive = boundarySnapshot();
    const aMoraleBefore = a.morale, bMoraleBefore = b.morale, aStressBefore = a.stress;
    recordSharedExperience(a, b, { type: "shared_break", sourceEventId: "integration-positive-break", tone: "positive", intensity: 5 });
    assert(a.morale >= aMoraleBefore + 1, "Positive shared break should visibly increase employee A morale");
    assert(b.morale >= bMoraleBefore + 1, "Positive shared break should visibly increase employee B morale");
    assert(a.stress <= aStressBefore, "Positive shared break should not increase employee A stress");
    const positiveTrace = (company.socialEmotionTraces || []).find(t => t.sourceEventId && t.sourceEventId.includes("integration-positive-break") && t.employeeId === a.id && t.status === "applied");
    assert(positiveTrace && positiveTrace.moraleDeltaApplied !== 0, "Positive social event should create an applied emotional trace");
    unchanged(beforePositive, "Positive social emotion integration");

    const afterPositiveMorale = a.morale, tracesBeforeDuplicate = company.socialEmotionTraces.length;
    recordSharedExperience(a, b, { type: "shared_break", sourceEventId: "integration-positive-break", tone: "positive", intensity: 5 });
    assert(a.morale === afterPositiveMorale, "Duplicate social event should not stack morale");
    assert(company.socialEmotionTraces.length >= tracesBeforeDuplicate, "Duplicate social event should still be traceable");
    assert((company.socialEmotionTraces || []).some(t => t.status === "duplicate_event" && t.sourceEventId.includes("integration-positive-break")), "Duplicate social event should explain that it was blocked");

    const moraleBeforeLater = a.morale;
    recordSharedExperience(a, b, { type: "shared_break", sourceEventId: "integration-later-break", tone: "positive", intensity: 5 });
    assert(a.morale > moraleBeforeLater, "A later valid social event should apply normally");

    const beforeNegative = boundarySnapshot();
    const stressBeforeNegative = a.stress;
    recordSharedExperience(a, b, { type: "deadline_pressure_together", sourceEventId: "integration-negative-pressure", tone: "negative", intensity: 5 });
    assert(a.stress >= stressBeforeNegative + 1 || b.stress >= 41, "Negative pressure event should visibly increase stress for at least one employee");
    const negativeTrace = (company.socialEmotionTraces || []).find(t => t.sourceEventId && t.sourceEventId.includes("integration-negative-pressure") && t.stressDeltaApplied > 0);
    assert(negativeTrace, "Negative social event should create a traceable stress increase");
    unchanged(beforeNegative, "Negative social emotion integration");

    validationMode = false;
    debugMode = true;
    showEmployee(a.id);
    const modalBefore = document.getElementById("employeeModal").innerText;
    const moraleBeforeUi = a.morale;
    recordSharedExperience(a, b, { type: "shared_break", sourceEventId: "integration-ui-break", tone: "positive", intensity: 5 });
    const modalAfter = document.getElementById("employeeModal").innerText;
    assert(a.morale > moraleBeforeUi, "UI scenario should still change canonical morale");
    assert(modalAfter.includes(`Morale\n${Math.round(a.morale)}`) || modalAfter.includes(`Morale ${Math.round(a.morale)}`), "Employee detail panel should refresh to canonical morale value");
    assert(/Last Social Emotional Effect|Applied: yes|integration-ui-break/i.test(modalAfter), "AI Debug should show the last social emotional effect chain");
    assert(modalAfter !== modalBefore, "Employee detail panel should update after emotional change");

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Social AI emotional integration regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
