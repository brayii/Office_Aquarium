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
      assignments: JSON.stringify(employees.map(e => ({ id: e.id, action: e.action, taskProgress: e.taskProgress, activeCollaboration: e.activeCollaboration })))
    });
    const unchanged = (before, label) => {
      assert(company.chip === before.chip && company.software === before.software && company.integration === before.integration, `${label} must not change product progress`);
      assert(company.quality === before.quality && company.customers === before.customers, `${label} must not change quality or customers`);
      assert(JSON.stringify(company.lessons || []) === before.lessons && JSON.stringify(company.learningEpisodes || []) === before.learningEpisodes, `${label} must not change Institutional Learning`);
      assert(JSON.stringify(company.hiringRequests || []) === before.hiring && JSON.stringify(company.recruitingPipeline || []) === before.recruiting, `${label} must not change hiring or recruiting`);
      assert(projectSnapshot() === before.projects, `${label} must not change project state`);
      assert(JSON.stringify(employees.map(e => ({ id: e.id, action: e.action, taskProgress: e.taskProgress, activeCollaboration: e.activeCollaboration }))) === before.assignments, `${label} may stage physical presence but must not change work selection or progress`);
    };

    validationMode = true;
    reset(true, false, 456789);
    ensureBibleSystems();
    const rngBeforeMigration = company.randomState;
    delete company.socialRelationships;
    ensureSocialAISystems();
    assert(company.randomState === rngBeforeMigration, "Relationship interpretation migration should not consume RNG");

    const [a, b, c, d] = employees.filter(e => e.active);
    a.personality = { workPace: 0.8, sociability: -0.2, collaboration: 0.2, riskTolerance: 0.4, adaptability: 0.2, initiative: 0.8, resilience: 0.3, detailOrientation: -0.3, empathy: 0.1, structureNeed: -0.2 };
    b.personality = { workPace: -0.5, sociability: 0.1, collaboration: 0.7, riskTolerance: -0.1, adaptability: 0.1, initiative: 0.1, resilience: 0.4, detailOrientation: 0.9, empathy: 0.4, structureNeed: 0.8 };
    c.personality = { workPace: 0.7, sociability: 0.7, collaboration: 0.6, riskTolerance: 0.2, adaptability: 0.4, initiative: 0.5, resilience: 0.5, detailOrientation: -0.2, empathy: 0.8, structureNeed: -0.3 };
    d.personality = { ...c.personality };
    [a, b, c, d].forEach(e => ensureEmployeePersonality(e));

    const beforePositive = boundarySnapshot();
    recordSharedExperience(a, b, { type: "direct_help", sourceEventId: "stage3-help-1", tone: "positive", intensity: 3 });
    recordSharedExperience(a, b, { type: "blocker_resolved_together", sourceEventId: "stage3-blocker-1", tone: "positive", intensity: 4, projectId: "stage3-project", requireSource: true });
    recordSharedExperience(a, b, { type: "deadline_pressure_together", sourceEventId: "stage3-pressure-1", tone: "mixed", intensity: 4 });
    unchanged(beforePositive, "Relationship interpretation");

    const keyAB = makeRelationshipKey(a.id, b.id);
    const relAB = company.socialRelationships[keyAB].interpretation;
    assert(["trust", "respect", "comfort", "professionalFriction", "confidence"].every(k => Number.isFinite(relAB[k]) && relAB[k] >= 0 && relAB[k] <= 100), "Relationship interpretation should maintain bounded hidden values and evidence confidence");
    assert(relAB.trust > 0 && relAB.respect > 0, "Helpful shared work should derive trust and respect from history");
    assert(relAB.professionalFriction > 0, "Deadline pressure and work-style mismatch may derive professional friction");
    assert(company.socialRelationships[keyAB].lastRelationshipEvaluationAt, "Relationship interpretation should record the last evaluation time");

    const firstDerived = JSON.stringify(relAB);
    const firstInputs = JSON.stringify(company.socialRelationships[keyAB].relationshipInputs);
    evaluateRelationshipInterpretation(company.socialRelationships[keyAB]);
    assert(JSON.stringify(company.socialRelationships[keyAB].interpretation) === firstDerived && JSON.stringify(company.socialRelationships[keyAB].relationshipInputs) === firstInputs, "Same history and same personalities should derive deterministic relationship values");

    const beforeNegative = boundarySnapshot();
    recordSharedExperience(a, c, { type: "interruption_shared", sourceEventId: "stage3-interrupt-1", tone: "negative", intensity: 3 });
    recordSharedExperience(a, c, { type: "conflict_observed", sourceEventId: "stage3-conflict-1", tone: "negative", intensity: 4 });
    recordSharedExperience(a, c, { type: "milestone_failure_together", sourceEventId: "stage3-failure-1", tone: "mixed", intensity: 5 });
    unchanged(beforeNegative, "Friction relationship interpretation");
    const keyAC = makeRelationshipKey(a.id, c.id);
    const relAC = company.socialRelationships[keyAC].interpretation;
    assert(relAC.professionalFriction !== relAB.professionalFriction || relAC.comfort !== relAB.comfort, "Different histories should not force all relationships toward the same outcome");

    for (let i = 0; i < 7; i++) recordSharedExperience(a, b, { type: "direct_help", sourceEventId: `stage3-trust-help-${i}`, tone: "positive", intensity: 3 });
    for (let i = 0; i < 3; i++) recordSharedExperience(a, b, { type: "deadline_pressure_together", sourceEventId: `stage3-trust-pressure-${i}`, tone: "mixed", intensity: 4 });
    recordSharedExperience(a, b, { type: "conflict_observed", sourceEventId: "stage3-trust-conflict", tone: "negative", intensity: 3 });
    const trustWithFriction = company.socialRelationships[keyAB].interpretation;
    assert(trustWithFriction.trust >= 60 && trustWithFriction.professionalFriction >= 25, "Source-backed history should be able to derive high trust alongside high professional friction");

    const beforeComfort = boundarySnapshot();
    for (let i = 0; i < 8; i++) recordSharedExperience(c, d, { type: "shared_break", sourceEventId: `stage3-comfort-break-${i}`, tone: "positive", intensity: 2 });
    unchanged(beforeComfort, "Comfort relationship interpretation");
    const comfortWithoutRespect = company.socialRelationships[makeRelationshipKey(c.id, d.id)].interpretation;
    assert(comfortWithoutRespect.comfort >= 65 && comfortWithoutRespect.respect <= 45, "Source-backed social history should be able to derive high comfort without professional respect");

    const beforeEmotion = boundarySnapshot();
    const interruptionReaction = relationshipEmotionalReaction(a, c, "interruption");
    assert(Object.keys(interruptionReaction).sort().join(",") === "moraleDelta,reasonCode,stressDelta", "Relationship emotional output should be stress/morale trace only");
    assert(interruptionReaction.stressDelta >= 0, "High-friction interruption should recommend stress rather than work changes");
    unchanged(beforeEmotion, "Relationship emotional recommendation");

    const strangerReaction = relationshipEmotionalReaction(a, { id: 99999 }, "social");
    assert(strangerReaction.stressDelta === 0 && strangerReaction.moraleDelta === 0, "No interpreted history should produce no relationship adjustment");

    const saved = JSON.stringify(company.socialRelationships);
    saveGame();
    assert(loadGame(), "Saved company should load");
    ensureSocialAISystems();
    assert(JSON.stringify(company.socialRelationships) === saved, "Relationship interpretation should survive save/load exactly");

    debugMode = false;
    showEmployee(a.id);
    const normalText = document.getElementById("employeeModal").innerText;
    assert(!/Relationship Interpretation|Professional Friction|relationshipInputs|style mismatch|recent help/i.test(normalText), "Normal UI should not expose hidden relationship interpretation");
    debugMode = true;
    showEmployee(a.id);
    const debugText = document.getElementById("employeeModal").textContent;
    assert(/Relationship Interpretation|Trust|Respect|Comfort|Professional Friction|Interpretation Inputs/i.test(debugText), "AI Debug should expose relationship interpretation trace");
    debugMode = false;
    renderDecisionEvent();
    assert(!/Professional Friction|relationshipInputs|Relationship Interpretation/i.test(document.body.innerText), "CEO communications should not leak hidden relationship interpretation");

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Social AI relationship-interpretation regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
