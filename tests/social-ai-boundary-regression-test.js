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

  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const snapshotWork = () => JSON.stringify({
      chip: company.chip,
      software: company.software,
      integration: company.integration,
      quality: company.quality,
      trust: company.trust,
      customers: company.customers,
      projects: (company.projects || []).map(p => ({ id: p.id, status: p.status, progress: p.progress, performance: p.performance, allocations: p.staffAllocations })),
      workItems: (company.workItems || []).map(w => ({ id: w.id, progress: w.progress, blockedBy: w.blockedBy, qualityRisk: w.qualityRisk, ownerId: w.ownerId, status: w.status })),
      assignments: employees.map(e => ({ id: e.id, action: e.action, zone: e.zone, x: e.x, y: e.y, taskProgress: e.taskProgress, activeCollaboration: e.activeCollaboration }))
    });

    validationMode = true;
    reset(true, false, 112233);
    ensureBibleSystems();
    updateCompanyInformationSystem();
    assert(employees.every(e => !("social" in e) && !("relationship" in e)), "Employees should not keep legacy mutable social or relationship containers");
    assert(employees.every(e => !("friendship" in (e.goals || {})) && Number.isFinite(Number(e.goals?.socialConnection))), "Employee social drive should use socialConnection, not legacy friendship");
    const [a, b, c] = employees.filter(e => e.active);
    a.currentRoom = "break-area";
    b.currentRoom = "break-area";
    c.currentRoom = "hardware-lab";

    const rngBeforeFirstAccess = company.randomState;
    const viewAB = getRelationshipView(a, b);
    const scoreAB = relationshipPreferenceScore(a, b);
    assert(company.randomState === rngBeforeFirstAccess, "Canonical relationship view must not consume live RNG");
    assert(Object.keys(company.socialRelationships || {}).length === 0, "Reading social view must not fabricate pair records");
    assert(!("friendship" in viewAB) && !("rivalry" in viewAB), "Canonical relationship view must not expose legacy friendship or rivalry");
    assert(Number.isFinite(scoreAB), "Relationship preference score should remain finite");

    const beforePassive = snapshotWork();
    const beforeEmotionCount = (company.socialEmotionTraces || []).length;
    for (let i = 0; i < 4; i++) observeRoomFamiliarity(5);
    const keyAB = makeRelationshipKey(a.id, b.id);
    assert(company.socialRelationships[keyAB]?.familiarity > 0, "Passive same-room exposure should build familiarity");
    assert(company.socialRelationships[keyAB]?.interactionCount === 0, "Passive same-room exposure should not claim that an interaction occurred");
    assert(company.socialRelationships[keyAB]?.lastSeenAt, "Passive same-room exposure should record when coworkers were last observed together");
    assert((company.socialRelationships[keyAB].recentExperiences || []).length === 0, "Passive co-presence should not create shared experience history");
    assert((company.socialEmotionTraces || []).length === beforeEmotionCount, "Passive co-presence should not create emotional traces");
    assert(snapshotWork() === beforePassive, "Passive Social AI observation must not change work/project state");

    const beforeExperience = snapshotWork();
    const moraleBefore = a.morale;
    const stressBefore = a.stress;
    recordSharedExperience(a, b, { type: "direct_help", sourceEventId: "boundary-direct-help", tone: "positive", intensity: 2, requireSource: true });
    assert(snapshotWork() === beforeExperience, "Real Social AI event must still not directly change work/project state");
    assert(a.morale !== moraleBefore || a.stress !== stressBefore, "Real Social AI event may change stress or morale through the emotional system");
    const latestTrace = (company.socialEmotionTraces || [])[0];
    assert(latestTrace?.ownerSystem === AI_SYSTEM_OWNERS.social, "Social emotional trace should identify Social AI owner");

    const cohesionBeforeHiddenRelationship = derivedCohesion();
    const stayBeforeHiddenRelationship = employeeStayScore(a);
    company.socialRelationships[makeRelationshipKey(a.id, c.id)] = {
      employeeAId: Math.min(a.id, c.id),
      employeeBId: Math.max(a.id, c.id),
      familiarity: 100,
      interactionCount: 10,
      firstMetAt: simulationTimestamp(),
      lastInteractionAt: simulationTimestamp(),
      positiveExperienceCount: 10,
      neutralExperienceCount: 0,
      negativeExperienceCount: 0,
      recentExperiences: [],
      experienceSummary: {},
      interpretation: { trust: 100, respect: 100, comfort: 100, professionalFriction: 0, confidence: 100 },
      relationshipInputs: {},
      lastRelationshipEvaluationAt: simulationTimestamp(),
      recentInteractionTypes: [],
      reputationObservations: [],
      cooldowns: {},
      stressHistory: 0,
      moraleHistory: 0
    };
    assert(derivedCohesion() === cohesionBeforeHiddenRelationship, "Hidden relationship interpretation must not directly change company cohesion");
    assert(employeeStayScore(a) === stayBeforeHiddenRelationship, "Hidden relationship interpretation must not directly change retention scoring");

    let workGuardRejected = false;
    try {
      assertWorkAIInputsDoNotContainSocialState({ skillFit: 0.8, nested: { relationshipTrust: 72 } });
    } catch (error) {
      workGuardRejected = /relationshipTrust/.test(error.message);
      company.lastSimulationError = null;
      company.paused = false;
    }
    assert(workGuardRejected, "Work AI boundary guard should reject nested Social AI fields");

    const work = (company.workItems || []).find(w => w.status === "open");
    if (work) {
      const target = availableCollaborator(a);
      startCollaborationSession(a, target || b, { work });
      applyCollaborationOutcome(a);
      const outcome = (company.actionOutcomes || [])[0];
      assert(!outcome || outcome.ownerSystem === AI_SYSTEM_OWNERS.work, "Work outcome trace should identify Work AI owner");
    }

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Social AI boundary regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
