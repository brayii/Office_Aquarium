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
      movement: JSON.stringify(employees.map(e => ({ id: e.id, zone: e.zone, x: e.x, y: e.y, action: e.action, currentRoom: e.currentRoom })))
    });
    const unchanged = (before, label) => {
      assert(company.chip === before.chip && company.software === before.software && company.integration === before.integration, `${label} must not change product progress`);
      assert(company.quality === before.quality && company.customers === before.customers, `${label} must not change quality or customers`);
      assert(JSON.stringify(company.lessons || []) === before.lessons && JSON.stringify(company.learningEpisodes || []) === before.learningEpisodes, `${label} must not change Institutional Learning`);
      assert(JSON.stringify(company.hiringRequests || []) === before.hiring && JSON.stringify(company.recruitingPipeline || []) === before.recruiting, `${label} must not change hiring or recruiting`);
      assert(JSON.stringify((company.projects || []).map(p => ({ id: p.id, progress: p.progress, quality: p.quality, risk: p.risk, status: p.status }))) === before.projects, `${label} must not change project state`);
      assert(JSON.stringify((company.workItems || []).map(w => ({ id: w.id, progress: w.progress, status: w.status, blockedBy: w.blockedBy }))) === before.work, `${label} must not change work items`);
      assert(JSON.stringify(employees.map(e => ({ id: e.id, zone: e.zone, x: e.x, y: e.y, action: e.action, currentRoom: e.currentRoom }))) === before.movement, `${label} must not change movement or selected tasks`);
    };

    validationMode = true;
    reset(true, false, 567890);
    ensureBibleSystems();
    ensureSocialAISystems();
    const [a, b, c, d] = employees.filter(e => e.active);
    a.currentRoom = "break-area"; b.currentRoom = "break-area"; c.currentRoom = "break-area"; d.currentRoom = "software-studio";
    a.zone = b.zone = c.zone = "break"; d.zone = "dev";
    a.personality = { workPace: 0.1, sociability: 0.75, collaboration: 0.75, riskTolerance: 0, adaptability: 0.2, initiative: 0.2, resilience: 0.2, detailOrientation: 0, empathy: 0.5, structureNeed: -0.2 };
    b.personality = { workPace: 0.1, sociability: 0.65, collaboration: 0.85, riskTolerance: 0, adaptability: 0.2, initiative: 0.2, resilience: 0.2, detailOrientation: 0, empathy: 0.6, structureNeed: -0.1 };
    c.personality = { workPace: -0.8, sociability: -0.6, collaboration: -0.5, riskTolerance: 0, adaptability: 0, initiative: 0, resilience: -0.2, detailOrientation: 0.9, empathy: -0.3, structureNeed: 0.8 };
    [a, b, c, d].forEach(e => ensureEmployeePersonality(e));

    recordSharedExperience(a, b, { type: "direct_help", sourceEventId: "stage4-help", tone: "positive", intensity: 5 });
    recordSharedExperience(a, b, { type: "shared_break", sourceEventId: "stage4-break", tone: "positive", intensity: 4 });
    recordSharedExperience(a, c, { type: "conflict_observed", sourceEventId: "stage4-conflict", tone: "negative", intensity: 5 });
    evaluateEmployeeRelationshipInterpretations(a);

    const beforeChoice = boundarySnapshot();
    const decision = chooseSocialPreference(a, { type: "break", roomId: "break-area", allowAlone: true }, { record: false });
    unchanged(beforeChoice, "Social preference evaluation");
    assert(decision.candidates.some(x => x.employeeId === b.id), "Preference should evaluate coworkers already in the room");
    assert(decision.candidates.some(x => x.employeeId === c.id), "Preference should evaluate multiple valid coworkers");
    assert(decision.candidates.some(x => x.type === "alone"), "Preference should include spending time alone");
    assert(!decision.candidates.some(x => x.employeeId === d.id), "Preference must not invent an interaction with someone in another room");
    const weightB = decision.candidates.find(x => x.employeeId === b.id).weight;
    const weightC = decision.candidates.find(x => x.employeeId === c.id).weight;
    assert(weightB > weightC, "Trust, comfort, and positive history should increase preference weight over high-friction coworkers");

    const emotion = socialPreferenceEmotion(a, { selectedEmployeeId: b.id, reasonCode: "social_preference_trusted_coworker" }, { type: "break", roomId: "break-area" });
    assert(Object.keys(emotion).sort().join(",") === "moraleDelta,reasonCode,stressDelta", "Preference emotion should only expose stress, morale, and reason code");
    assert(Math.abs(emotion.moraleDelta) <= 0.45 && Math.abs(emotion.stressDelta) <= 0.45, "Preference emotion should be small and bounded");

    const introvert = { ...a, id: 9001, active: true, offsite: false, stress: 82, morale: 45, zone: "break", currentRoom: "break-area", personality: { ...a.personality, sociability: -0.9, collaboration: -0.7, empathy: -0.2, structureNeed: 0.8 }, emotionalState: { socialBattery: 22 } };
    ensureEmployeePersonality(introvert);
    const aloneWeight = socialPreferenceWeight(introvert, { type: "alone" }, { type: "break", roomId: "break-area" });
    const coworkerWeight = socialPreferenceWeight(introvert, b, { type: "break", roomId: "break-area" });
    assert(aloneWeight >= coworkerWeight * 0.65, "Low battery or introverted employees should have a real chance to take breaks alone");

    const beforeApply = boundarySnapshot();
    const applied = applySocialPreferenceOpportunity(a, { type: "break", roomId: "break-area", allowAlone: true });
    assert(applied.candidates.length >= 3, "Applied preference should keep candidate trace for AI Debug");
    assert(JSON.stringify((company.projects || []).map(p => ({ id: p.id, progress: p.progress, quality: p.quality, risk: p.risk, status: p.status }))) === beforeApply.projects, "Applied social preference must not change projects");
    assert(JSON.stringify(company.hiringRequests || []) === beforeApply.hiring && JSON.stringify(company.recruitingPipeline || []) === beforeApply.recruiting, "Applied social preference must not change hiring");
    assert(JSON.stringify(employees.map(e => ({ id: e.id, zone: e.zone, x: e.x, y: e.y, action: e.action, currentRoom: e.currentRoom }))) === beforeApply.movement, "Applied social preference must not move employees");
    assert(company.socialPreferenceDebug.length > 0, "Applied preference should be visible to AI Debug");

    debugMode = false;
    showEmployee(a.id);
    const normalText = document.getElementById("employeeModal").innerText;
    assert(!/Social Preferences|Candidates:|social_preference_/i.test(normalText), "Normal UI should not expose social preference internals");
    debugMode = true;
    showEmployee(a.id);
    const debugText = document.getElementById("employeeModal").textContent;
    assert(/Social Preferences|Candidates:|social_preference_/i.test(debugText), "AI Debug should expose social preference trace");

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Social AI social-preferences regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
