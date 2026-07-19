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
      projects: JSON.stringify((company.projects || []).map(p => ({ id: p.id, progress: p.progress, quality: p.quality, risk: p.risk, status: p.status }))),
      work: JSON.stringify((company.workItems || []).map(w => ({ id: w.id, progress: w.progress, status: w.status, blockedBy: w.blockedBy }))),
      assignments: JSON.stringify(employees.map(e => ({ id: e.id, action: e.action, taskProgress: e.taskProgress, activeCollaboration: e.activeCollaboration })))
    });
    const unchanged = (before, label) => {
      assert(company.chip === before.chip && company.software === before.software && company.integration === before.integration, `${label} must not change product progress`);
      assert(company.quality === before.quality && company.customers === before.customers, `${label} must not change quality or customers`);
      assert(JSON.stringify(company.lessons || []) === before.lessons && JSON.stringify(company.learningEpisodes || []) === before.learningEpisodes, `${label} must not change Institutional Learning`);
      assert(JSON.stringify(company.hiringRequests || []) === before.hiring && JSON.stringify(company.recruitingPipeline || []) === before.recruiting, `${label} must not change hiring or recruiting`);
      assert(JSON.stringify((company.projects || []).map(p => ({ id: p.id, progress: p.progress, quality: p.quality, risk: p.risk, status: p.status }))) === before.projects, `${label} must not change project state`);
      assert(JSON.stringify((company.workItems || []).map(w => ({ id: w.id, progress: w.progress, status: w.status, blockedBy: w.blockedBy }))) === before.work, `${label} must not change work items`);
      assert(JSON.stringify(employees.map(e => ({ id: e.id, action: e.action, taskProgress: e.taskProgress, activeCollaboration: e.activeCollaboration }))) === before.assignments, `${label} may stage physical presence but must not change work selection or progress`);
    };

    validationMode = true;
    reset(true, false, 678901);
    ensureBibleSystems();
    ensureSocialAISystems();
    const [observer, expert, difficult, unknown] = employees.filter(e => e.active);
    [observer, expert, difficult, unknown].forEach(e => { e.currentRoom = "break-area"; e.zone = "break"; ensureEmployeePersonality(e); });

    assert(workplaceReputationFor(unknown, { create: false }) === null, "New employees should begin reputation-unknown until evidence exists");
    assert(reputationLabelFor(workplaceReputationFor(unknown, { create: true })) === "Mostly unknown", "Unknown should be a valid non-negative reputation state");
    const oneBadDay = employees.filter(e => e.active)[4];
    recordWorkplaceReputationObservation(oneBadDay, { type: "conflict_observed", tone: "negative", intensity: 5, sourceEventId: "stage5-one-bad-day" });
    const oneBadRep = workplaceReputationFor(oneBadDay);
    assert(oneBadRep.dimensions.approachability === 50 && oneBadRep.dimensions.professionalism === 50, "One bad day should create evidence but not immediately damage reputation dimensions");

    const beforePositive = boundarySnapshot();
    recordSharedExperience(observer, expert, { type: "direct_help", sourceEventId: "stage5-help-1", tone: "positive", intensity: 5 });
    recordSharedExperience(difficult, expert, { type: "blocker_resolved_together", sourceEventId: "stage5-blocker-1", tone: "positive", intensity: 5 });
    recordSharedExperience(observer, expert, { type: "shared_work_activity", sourceEventId: "stage5-work-1", tone: "positive", intensity: 4 });
    unchanged(beforePositive, "Positive reputation evidence");
    const expertRep = workplaceReputationFor(expert);
    assert(expertRep.confidence > 0, "Repeated evidence should increase reputation confidence");
    assert(expertRep.dimensions.technical > 50 && expertRep.dimensions.reliability > 50, "Helpful repeated work should increase technical and reliability reputation");

    const beforeNegative = boundarySnapshot();
    recordSharedExperience(observer, difficult, { type: "conflict_observed", sourceEventId: "stage5-conflict-1", tone: "negative", intensity: 5 });
    recordSharedExperience(expert, difficult, { type: "interruption_shared", sourceEventId: "stage5-interrupt-1", tone: "negative", intensity: 5 });
    recordSharedExperience(observer, difficult, { type: "deadline_pressure_together", sourceEventId: "stage5-pressure-1", tone: "negative", intensity: 4 });
    unchanged(beforeNegative, "Negative reputation evidence");
    const difficultRep = workplaceReputationFor(difficult);
    assert(difficultRep.dimensions.approachability < 50 || difficultRep.dimensions.professionalism < 50, "Repeated negative evidence should be able to produce a negative reputation");
    assert(difficultRep.dimensions.technical !== difficultRep.dimensions.approachability, "Reputation dimensions should remain separate, not one popularity score");

    const observerRep = workplaceReputationFor(observer);
    assert(observerRep.dimensions.approachability !== expertRep.dimensions.approachability || observerRep.dimensions.technical !== expertRep.dimensions.technical, "Everyone should not converge toward the same positive reputation");

    const beforeWeight = boundarySnapshot();
    const expertWeight = socialPreferenceWeight(observer, expert, { type: "project_discussion", roomId: "break-area" });
    const difficultWeight = socialPreferenceWeight(observer, difficult, { type: "project_discussion", roomId: "break-area" });
    unchanged(beforeWeight, "Reputation preference weighting");
    assert(expertWeight !== difficultWeight, "Reputation may influence voluntary social preference weights");

    const emotion = socialPreferenceEmotion(observer, { selectedEmployeeId: difficult.id, reasonCode: "social_preference_reputation_expectation" }, { type: "conversation", roomId: "break-area" });
    assert(Object.keys(emotion).sort().join(",") === "moraleDelta,reasonCode,stressDelta", "Reputation emotional output should remain stress/morale trace only");
    assert(Math.abs(emotion.moraleDelta) <= 0.45 && Math.abs(emotion.stressDelta) <= 0.45, "Reputation emotional influence should be small and bounded");

    debugMode = false;
    showEmployee(expert.id);
    const normalText = document.getElementById("employeeModal").innerText;
    assert(!/Workplace Reputation|Technical \d|Reliability \d|Approachability \d|Professionalism \d|Contributing Observations/i.test(normalText), "Normal UI should not expose hidden reputation scores");
    debugMode = true;
    showEmployee(expert.id);
    const debugText = document.getElementById("employeeModal").textContent;
    assert(/Workplace Reputation|Technical|Reliability|Approachability|Professionalism|Contributing Observations|Confidence/i.test(debugText), "AI Debug should expose workplace reputation trace");

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Social AI workplace-reputation regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
