const path = require("path");
const fs = require("fs");
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
  const errors = [];
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on("pageerror", error => errors.push(`PAGE: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`CONSOLE: ${message.text()}`);
  });

  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => {
      if (!condition) failures.push(message);
    };
    const workSnapshot = () => JSON.stringify({
      chip: company.chip,
      software: company.software,
      integration: company.integration,
      quality: company.quality,
      customers: company.customers,
      projects: (company.projects || []).map(project => ({
        id: project.id,
        status: project.status,
        progress: project.progress,
        risk: project.risk,
        quality: project.quality,
        allocations: project.staffAllocations
      })),
      workItems: (company.workItems || []).map(work => ({
        id: work.id,
        status: work.status,
        progress: work.progress,
        blockers: work.blockedBy,
        qualityRisk: work.qualityRisk
      })),
      learningEpisodes: company.learningEpisodes || [],
      lessons: company.lessons || [],
      positions: employees.map(employee => ({
        id: employee.id,
        action: employee.action,
        zone: employee.zone,
        x: employee.x,
        y: employee.y
      }))
    });

    validationMode = true;
    reset(true, false, 617284);
    ensureBibleSystems();
    assert(company.socialAIModelVersion === SOCIAL_RULES.modelVersion && SOCIAL_RULES.modelVersion === 4, "Canonical Social AI model should be version 4");

    const isolatedReadRngChanges = [];
    [
      ["ensure Bible systems", () => ensureBibleSystems()],
      ["ensure project portfolio", () => ensureProjectPortfolio()],
      ["ensure project allocations", () => ensureProjectAllocations()],
      ["ensure workforce economy", () => ensureWorkforceEconomySystems()],
      ["update company capabilities", () => updateCompanyCapabilitySystem()],
      ["update staffing model", () => updateStaffingModel()],
      ["update portfolio health", () => updatePortfolioHealth()],
      ["derive operating health", () => derivedOperatingHealth()],
      ["ensure market valuation", () => ensureMarketValuationSystems()],
      ["score company fundamentals", () => companyFundamentalsScore()],
      ["build executive briefing", () => buildExecutiveBriefing()],
      ["build executive snapshot", () => buildExecutiveIntelligenceSnapshot()],
      ["render market valuation debug", () => marketValuationDebugHtml()]
    ].forEach(([label, read]) => {
      reset(true, false, 617284);
      ensureBibleSystems();
      const before = company.randomState;
      read();
      if (company.randomState !== before) isolatedReadRngChanges.push(label);
    });
    assert(isolatedReadRngChanges.length === 0, `Shared AI read/refresh routines must not consume simulation RNG: ${isolatedReadRngChanges.join(", ")}`);

    reset(true, false, 617284);
    ensureBibleSystems();
    const [a, b, c] = employees.filter(employee => employee.active);
    const rngBeforeReads = company.randomState;
    const recordsBeforeReads = Object.keys(company.socialRelationships || {}).length;
    const preferenceHistoryBeforeReads = company.socialPreferenceHistory;
    const emotionTracesBeforeReads = company.socialEmotionTraces;
    const firstView = getRelationshipView(a, b);
    relationshipPreferenceScore(a, b);
    getRelationshipView(a, c);
    assert(company.randomState === rngBeforeReads, "Canonical relationship reads must not consume simulation RNG");
    const debugRngChanges = [];
    [
      ["release readiness", () => releaseReadinessHtml()],
      ["learning validation", () => learningValidationHtml()],
      ["executive snapshot", () => buildExecutiveIntelligenceSnapshot()],
      ["operating health", () => derivedOperatingHealth()],
      ["social familiarity", () => socialFamiliarityDebugHtml(a)],
      ["social preferences", () => socialPreferenceDebugHtml(a)],
      ["workplace reputation", () => workplaceReputationDebugHtml(a)],
      ["social emotion", () => socialEmotionTraceDebugHtml(a)],
      ["customer market", () => customerMarketDebugHtml()],
      ["market valuation", () => marketValuationDebugHtml()],
      ["validation report", () => validationReportHtml()],
      ["playtest checklist", () => playtestChecklistHtml()],
      ["collaborator lookup", () => availableCollaborator(a)]
    ].forEach(([label, read]) => {
      const before = company.randomState;
      read();
      if (company.randomState !== before) debugRngChanges.push(label);
    });
    assert(debugRngChanges.length === 0, `Individual AI Debug reads must not consume simulation RNG: ${debugRngChanges.join(", ")}`);
    debugMode = true;
    showEmployee(a.id);
    debugMode = false;
    assert(company.randomState === rngBeforeReads, "AI Debug reads must not consume simulation RNG");
    assert(Object.keys(company.socialRelationships || {}).length === recordsBeforeReads, "Relationship reads must not fabricate pair records");
    assert(company.socialPreferenceHistory === preferenceHistoryBeforeReads && company.socialEmotionTraces === emotionTracesBeforeReads, "Relationship reads must not clone or rewrite social trace collections");
    assert(firstView.interpretation.confidence === 0, "Unknown relationships should remain neutral with zero confidence");

    const seed = 880011;
    const accessOrderSnapshot = order => {
      reset(true, false, seed);
      ensureBibleSystems();
      const active = employees.filter(employee => employee.active);
      order.forEach(([left, right]) => getRelationshipView(active[left], active[right]));
      return JSON.stringify({ rng: company.randomState, relationships: company.socialRelationships });
    };
    assert(accessOrderSnapshot([[0, 1], [0, 2], [1, 2]]) === accessOrderSnapshot([[1, 2], [0, 2], [0, 1]]), "First-access order must not alter RNG or relationship state");

    const runSocialSequence = () => {
      reset(true, false, seed);
      ensureBibleSystems();
      const [left, right] = employees.filter(employee => employee.active);
      recordSharedExperience(left, right, { type: "direct_help", sourceEventId: "det-help", tone: "positive", intensity: 3 });
      recordSharedExperience(left, right, { type: "deadline_pressure_together", sourceEventId: "det-pressure", tone: "mixed", intensity: 2 });
      return JSON.stringify({
        rng: company.randomState,
        pair: company.socialRelationships[makeRelationshipKey(left.id, right.id)],
        emotions: [left.morale, left.stress, right.morale, right.stress]
      });
    };
    const deterministicA = runSocialSequence();
    const deterministicB = runSocialSequence();
    assert(deterministicA === deterministicB, "The same seed and social event sequence should produce identical outputs");

    reset(true, false, 880012);
    ensureBibleSystems();
    const [continuationA, continuationB] = employees.filter(employee => employee.active);
    recordSharedExperience(continuationA, continuationB, { type: "direct_help", sourceEventId: "continuation-help", tone: "positive", intensity: 3 });
    saveGame();
    recordSharedExperience(continuationA, continuationB, { type: "deadline_pressure_together", sourceEventId: "continuation-pressure", tone: "mixed", intensity: 3 });
    const uninterruptedContinuation = JSON.stringify({
      rng: company.randomState,
      relationships: company.socialRelationships,
      employees: employees.map(employee => ({ id: employee.id, stress: employee.stress, morale: employee.morale }))
    });
    assert(loadGame(), "Saved social continuation should reload");
    const [loadedContinuationA, loadedContinuationB] = employees.filter(employee => employee.active);
    recordSharedExperience(loadedContinuationA, loadedContinuationB, { type: "deadline_pressure_together", sourceEventId: "continuation-pressure", tone: "mixed", intensity: 3 });
    const loadedContinuation = JSON.stringify({
      rng: company.randomState,
      relationships: company.socialRelationships,
      employees: employees.map(employee => ({ id: employee.id, stress: employee.stress, morale: employee.morale }))
    });
    assert(loadedContinuation === uninterruptedContinuation, "Save/load continuation should match an uninterrupted social event sequence");

    reset(true, false, 771122);
    ensureBibleSystems();
    const [passiveA, passiveB] = employees.filter(employee => employee.active);
    passiveA.currentRoom = "break-area";
    passiveB.currentRoom = "break-area";
    const passiveWorkBefore = workSnapshot();
    const passiveEmotionBefore = (company.socialEmotionTraces || []).length;
    for (let index = 0; index < 4; index++) observeRoomFamiliarity(5);
    const passiveRecord = company.socialRelationships[makeRelationshipKey(passiveA.id, passiveB.id)];
    assert(passiveRecord?.familiarity > 0, "Passive co-presence should increase familiarity");
    assert(passiveRecord?.interactionCount === 0 && !passiveRecord?.firstMetAt && !passiveRecord?.lastInteractionAt, "Passive co-presence should not claim a real interaction");
    assert(passiveRecord?.lastSeenAt && passiveRecord?.coPresenceMinutes >= 20, "Passive co-presence should retain last-seen and duration context");
    assert((passiveRecord?.recentExperiences || []).length === 0 && (passiveRecord?.reputationObservations || []).length === 0, "Passive co-presence should not create evidence or reputation observations");
    assert((company.socialEmotionTraces || []).length === passiveEmotionBefore, "Passive co-presence should not create emotional reactions");
    assert(workSnapshot() === passiveWorkBefore, "Passive Social AI observation should not change work or Institutional Learning");

    const concreteWorkBefore = workSnapshot();
    const concreteEmotionBefore = (company.socialEmotionTraces || []).length;
    recordSharedExperience(passiveA, passiveB, { type: "direct_help", sourceEventId: "concrete-help", tone: "positive", intensity: 3 });
    const concreteRecord = company.socialRelationships[makeRelationshipKey(passiveA.id, passiveB.id)];
    const experienceCount = concreteRecord.recentExperiences.length;
    const interactionCount = concreteRecord.interactionCount;
    const emotionalCount = (company.socialEmotionTraces || []).length;
    recordSharedExperience(passiveA, passiveB, { type: "direct_help", sourceEventId: "concrete-help", tone: "positive", intensity: 3 });
    assert(concreteRecord.recentExperiences.length === experienceCount && concreteRecord.interactionCount === interactionCount, "Duplicate source events should not stack experience or interaction evidence");
    assert((company.socialEmotionTraces || []).length === emotionalCount, "Duplicate source events should not create another emotional reaction");
    assert(concreteRecord.interpretation.confidence > 0, "Concrete evidence should produce a confidence-weighted interpretation");
    assert(concreteRecord.recentExperiences[0].ownerSystem === AI_SYSTEM_OWNERS.social, "Shared experiences should identify Social AI as owner");
    assert((company.socialEmotionTraces || []).length > concreteEmotionBefore && company.socialEmotionTraces[0].ownerSystem === AI_SYSTEM_OWNERS.social, "Social emotional recommendations should identify Social AI as owner");
    assert(company.emotionalTraces[0]?.ownerSystem === AI_SYSTEM_OWNERS.emotional, "Final stress and morale writes should identify the Emotional System as owner");
    assert(company.socialEmotionTraces[0] !== company.emotionalTraces[0], "Social recommendations and emotional state writes should use separate trace records");
    assert(workSnapshot() === concreteWorkBefore, "Concrete Social AI events should not directly change work or Institutional Learning");

    let guardRejected = false;
    try {
      assertWorkAIInputsDoNotContainSocialState({ skillFit: 0.75, nested: { coworkerReputation: 88 } });
    } catch (error) {
      guardRejected = /coworkerReputation/.test(error.message);
      company.lastSimulationError = null;
      company.paused = false;
    }
    assert(guardRejected, "Work AI guard should reject nested Social AI state");

    reset(true, false, 551144);
    ensureBibleSystems();
    const [legacyA, legacyB] = employees.filter(employee => employee.active);
    legacyA.social = { [legacyB.id]: { friendship: 99, rivalry: 1 } };
    legacyA.relationship = { [legacyB.id]: { trust: 99 } };
    legacyA.goals.friendship = 0.91;
    delete legacyA.goals.socialConnection;
    const legacyKey = makeRelationshipKey(legacyA.id, legacyB.id);
    company.socialRelationships[legacyKey] = {
      employeeAId: legacyA.id,
      employeeBId: legacyB.id,
      familiarity: 24,
      interactionCount: 1,
      firstMetAt: simulationTimestamp(),
      lastInteractionAt: simulationTimestamp(),
      positiveExperienceCount: 1,
      neutralExperienceCount: 0,
      negativeExperienceCount: 0,
      recentExperiences: [{
        id: `legacy-source:direct_help:${legacyKey}`,
        type: "direct_help",
        sourceEventId: "legacy-source",
        timestamp: simulationTimestamp(),
        emotionalTone: "positive",
        intensity: 2,
        participants: [legacyA.id, legacyB.id],
        employeeReactions: {},
        dedupeKey: `legacy-source:direct_help:${legacyKey}`
      }, {
        id: `legacy-room:same_room_presence:${legacyKey}`,
        type: "same_room_presence",
        sourceEventId: "legacy-room",
        timestamp: simulationTimestamp(),
        emotionalTone: "neutral",
        intensity: 1,
        participants: [legacyA.id, legacyB.id],
        employeeReactions: {},
        dedupeKey: `legacy-room:same_room_presence:${legacyKey}`
      }],
      experienceSummary: {
        direct_help: { count: 1, positive: 1, neutral: 0, negative: 0, mixed: 0, lastAt: company.minute },
        same_room_presence: { count: 1, positive: 0, neutral: 1, negative: 0, mixed: 0, lastAt: company.minute }
      },
      relationship: { trust: 88, respect: 81, comfort: 77, professionalFriction: 4 },
      recentInteractionTypes: [],
      cooldowns: {},
      stressHistory: 0,
      moraleHistory: 0
    };
    company.socialAIModelVersion = 2;
    const migrationRngBefore = company.randomState;
    const migrationWorkBefore = workSnapshot();
    const emotionalProfileBefore = JSON.stringify(legacyA.emotionalProfile);
    ensureSocialAISystems({ forceNormalize: true });
    const report = company.socialAIMigrationReport;
    assert(company.randomState === migrationRngBefore && report.rngStateBefore === report.rngStateAfter, "Social migration must not consume RNG");
    assert(workSnapshot() === migrationWorkBefore, "Social migration must not change work, projects, or Institutional Learning");
    assert(JSON.stringify(legacyA.emotionalProfile) === emotionalProfileBefore, "Social migration should preserve emotional profiles");
    assert(!("social" in legacyA) && !("relationship" in legacyA), "Social migration should remove employee-local relationship containers");
    assert(!("friendship" in legacyA.goals) && legacyA.goals.socialConnection === 0.91, "Social migration should convert the legacy friendship goal to socialConnection");
    assert(!("relationship" in company.socialRelationships[legacyKey]) && company.socialRelationships[legacyKey].interpretation, "Social migration should use only canonical interpretation state");
    assert(company.socialRelationships[legacyKey].recentExperiences.every(experience => experience.type !== "same_room_presence" && experience.ownerSystem === AI_SYSTEM_OWNERS.social), "Migration should discard passive room evidence and tag preserved experiences with Social AI ownership");
    assert(report.fromVersion === 2 && report.toVersion === 4 && report.relationshipsMigrated >= 1 && report.legacyRecordsRemoved >= 3 && report.experiencesPreserved === 1, "Migration report should account for preserved and removed state");

    const saveRng = company.randomState;
    const saveRelationships = JSON.stringify(company.socialRelationships);
    saveGame();
    assert(loadGame(), "Migrated company should reload");
    assert(company.randomState === saveRng, "Save/load should preserve deterministic RNG continuation");
    assert(JSON.stringify(company.socialRelationships) === saveRelationships, "Save/load should preserve canonical relationship state exactly");
    assert(employees.every(employee => employee.decisionTrace?.ownerSystem === AI_SYSTEM_OWNERS.work), "Employee work decision traces should identify Work AI");
    recordLearningEvidence({ domain: "institutional", eventType: "ownership-test", evidence: "Ownership regression evidence" });
    assert(company.learningEvidence[0].ownerSystem === AI_SYSTEM_OWNERS.institutional, "Institutional evidence should identify Institutional Learning");

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("AI ownership remediation regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
