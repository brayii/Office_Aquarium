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
    const companyBoundarySnapshot = () => ({
      chip: company.chip,
      software: company.software,
      integration: company.integration,
      quality: company.quality,
      lessons: JSON.stringify(company.lessons || []),
      learningEpisodes: JSON.stringify(company.learningEpisodes || []),
      hiring: JSON.stringify(company.hiringRequests || []),
      recruiting: JSON.stringify(company.recruitingPipeline || []),
      projects: projectSnapshot()
    });

    validationMode = true;
    reset(true, false, 234567);
    ensureBibleSystems();
    const rngBeforeMigration = company.randomState;
    delete company.socialRelationships;
    delete company.socialMemoryStore;
    delete company.socialMemories;
    delete company.roomPresenceCounters;
    ensureSocialAISystems();
    assert(company.randomState === rngBeforeMigration, "Social AI migration should not consume or alter live RNG state");
    assert(Object.keys(company.socialRelationships || {}).length === 0, "Old-save migration should begin with no fabricated relationship history");
    const [a, b, c] = employees.filter(e => e.active);
    const keyAB = makeRelationshipKey(a.id, b.id);
    assert(keyAB === makeRelationshipKey(b.id, a.id), "Pair keys should be order-independent");
    assert(Object.keys(company.socialRelationships || {}).length === 0, "New company should not fabricate social relationship records");
    assert(socialRelationshipRecord(a.id, c.id) === null, "No encounter should mean no record");

    const beforeBoundary = companyBoundarySnapshot();
    const beforeAssignments = employees.map(e => ({ id: e.id, action: e.action, taskProgress: e.taskProgress, activeCollaboration: e.activeCollaboration }));
    const first = recordSocialEncounter(a, b, { type: "shared_work_activity", gain: 2, sourceEventId: "unit-work-1", roomId: "software-studio", cooldownMinutes: 120 });
    assert(first && first.interactionCount === 1, "First valid encounter should create exactly one pair record");
    assert(first.firstMetAt && company.socialMemoryStore.records.some(m => m.type === "first_interaction" && ((m.ownerId === a.id && m.subjectId === b.id) || (m.ownerId === b.id && m.subjectId === a.id))), "First meeting should create canonical directional first-interaction memories");
    assert(first.familiarity > 0 && first.familiarity <= 100, "Familiarity should increase and remain bounded");
    assert(Object.keys(company.socialRelationships).filter(k => k === keyAB).length === 1, "Only one record should exist per pair");
    assert(JSON.stringify(employees.map(e => ({ id: e.id, action: e.action, taskProgress: e.taskProgress, activeCollaboration: e.activeCollaboration }))) === JSON.stringify(beforeAssignments), "Social observation may stage physical presence but must not change work selection or progress");
    assert(company.chip === beforeBoundary.chip && company.software === beforeBoundary.software && company.integration === beforeBoundary.integration, "Social familiarity must not change product progress");
    assert(company.quality === beforeBoundary.quality, "Social familiarity must not directly change quality");
    assert(JSON.stringify(company.lessons || []) === beforeBoundary.lessons && JSON.stringify(company.learningEpisodes || []) === beforeBoundary.learningEpisodes, "Social familiarity must not change Institutional Learning");
    assert(JSON.stringify(company.hiringRequests || []) === beforeBoundary.hiring && JSON.stringify(company.recruitingPipeline || []) === beforeBoundary.recruiting, "Social familiarity must not change hiring or recruiting");
    assert(projectSnapshot() === beforeBoundary.projects, "Social familiarity must not change project state");

    const afterFirstFamiliarity = first.familiarity;
    recordSocialEncounter(a, b, { type: "shared_work_activity", gain: 2, sourceEventId: "unit-work-1", roomId: "software-studio", cooldownMinutes: 120 });
    assert(company.socialRelationships[keyAB].familiarity === afterFirstFamiliarity, "Source-event cooldown should prevent repeated stacking");

    const beforeRoomRecords = Object.keys(company.socialRelationships).length;
    a.currentRoom = "hardware-lab";
    b.currentRoom = "hardware-lab";
    const interactionCountBeforeRoom = company.socialRelationships[keyAB].interactionCount;
    const experiencesBeforeRoom = company.socialRelationships[keyAB].recentExperiences.length;
    const emotionCountBeforeRoom = (company.socialEmotionTraces || []).length;
    for (let i = 0; i < 11; i++) observeRoomFamiliarity(5);
    assert(Object.keys(company.socialRelationships).length === beforeRoomRecords, "Same-room exposure should not apply before the threshold");
    observeRoomFamiliarity(5);
    assert(company.socialRelationships[keyAB].interactionCount === interactionCountBeforeRoom, "Same-room exposure should not count as an actual interaction");
    assert(company.socialRelationships[keyAB].recentExperiences.length === experiencesBeforeRoom, "Same-room exposure should not create relationship evidence");
    assert((company.socialEmotionTraces || []).length === emotionCountBeforeRoom, "Same-room exposure should not create emotional reactions");
    assert(company.socialRelationships[keyAB].lastSeenAt, "Same-room exposure should update last-seen context");
    const afterRoomFamiliarity = company.socialRelationships[keyAB].familiarity;
    for (let i = 0; i < 12; i++) observeRoomFamiliarity(5);
    assert(company.socialRelationships[keyAB].familiarity === afterRoomFamiliarity, "Same-room cooldown should prevent per-tick stacking");

    const keyAC = makeRelationshipKey(a.id, c.id);
    a.currentRoom = "break-area";
    c.currentRoom = "break-area";
    for (let i = 0; i < 4; i++) observeRoomFamiliarity(5);
    assert(company.socialRelationships[keyAC] && company.socialRelationships[keyAC].familiarity > 0, "Shared break should create pair familiarity after meaningful break time");
    assert(company.socialRelationships[keyAC].interactionCount === 0, "Sharing a break room should not imply a shared conversation");

    const socialIntrovert = { ...a, id: 1001, personality: { workPace: 0, sociability: -0.9, collaboration: -0.7, riskTolerance: 0, adaptability: 0, initiative: 0, resilience: 0, detailOrientation: 0, empathy: 0, structureNeed: 0.8 }, emotionalState: defaultEmotionalState({ sociability: -0.9, structureNeed: 0.8 }) };
    const socialConnector = { ...a, id: 1002, personality: { workPace: 0, sociability: 0.9, collaboration: 0.8, riskTolerance: 0, adaptability: 0, initiative: 0, resilience: 0, detailOrientation: 0, empathy: 0.7, structureNeed: -0.5 }, emotionalState: defaultEmotionalState({ sociability: 0.9, collaboration: 0.8, empathy: 0.7 }) };
    const introvertReaction = socialExperienceReaction(socialIntrovert, b, "shared_break", 3, "positive");
    const connectorReaction = socialExperienceReaction(socialConnector, b, "shared_break", 3, "positive");
    assert(introvertReaction.moraleDelta !== connectorReaction.moraleDelta || introvertReaction.stressDelta !== connectorReaction.stressDelta, "Personality may change emotional reaction");
    assert(Object.keys(introvertReaction).sort().join(",") === "moraleDelta,reasonCode,relatedEmployeeIds,sourceEventId,stressDelta", "Social emotion output should be stress/morale trace only");
    assert(Math.abs(introvertReaction.moraleDelta) <= 3 && Math.abs(introvertReaction.stressDelta) <= 4, "Shared-experience emotion should remain bounded");

    company.socialRelationships[keyAB].familiarity = 150;
    ensureSocialAISystems({ forceNormalize: true });
    assert(company.socialRelationships[keyAB].familiarity === 100, "Familiarity should be bounded at 100");

    Object.values(company.socialRelationships || {}).forEach(record => evaluateRelationshipInterpretation(record));
    const savedRelationships = JSON.stringify(company.socialRelationships);
    saveGame();
    const loaded = loadGame();
    assert(loaded, "Save should load");
    ensureSocialAISystems();
    assert(JSON.stringify(company.socialRelationships) === savedRelationships, "Save/load should preserve exact familiarity records");
    assert(Object.keys(company.socialRelationships).length === new Set(Object.keys(company.socialRelationships)).size, "Load should not duplicate pair records");
    company.socialRelationships[makeRelationshipKey(a.id, 9999)] = { employeeAId: a.id, employeeBId: 9999, familiarity: 12, interactionCount: 1, firstMetAt: null, lastInteractionAt: null, recentInteractionTypes: [], cooldowns: {}, stressHistory: 0, moraleHistory: 0 };
    assert(typeof socialFamiliarityDebugHtml(employees.find(e => e.id === a.id)) === "string", "Deleted/missing employees should not corrupt debug lookup");

    debugMode = false;
    showEmployee(a.id);
    const normalText = document.getElementById("employeeModal").innerText;
    assert(/Coworker Familiarity/i.test(normalText), "Normal profile should show a short familiarity summary");
    assert(!/Familiarity \d|Pair \d|interactionCount|socialRelationships|firstMetAt/i.test(normalText), "Normal UI should not expose raw pair data");
    debugMode = true;
    showEmployee(a.id);
    const debugText = document.getElementById("employeeModal").textContent;
    assert(/Social Familiarity|Pair|Familiarity|interactions|Cooldowns|Stress history|morale history/i.test(debugText), "AI Debug should expose familiarity trace details");
    debugMode = false;
    renderDecisionEvent();
    assert(!/socialRelationships|firstMetAt|interactionCount/i.test(document.body.innerText), "CEO messages should not leak hidden pair records");

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Social AI familiarity regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
