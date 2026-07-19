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
      risk: JSON.stringify(company.companyRiskComponents || {}),
      lessons: JSON.stringify(company.lessons || []),
      learningEpisodes: JSON.stringify(company.learningEpisodes || []),
      hiring: JSON.stringify(company.hiringRequests || []),
      recruiting: JSON.stringify(company.recruitingPipeline || []),
      projects: projectSnapshot(),
      positions: JSON.stringify(employees.map(e => ({ id: e.id, zone: e.zone, x: e.x, y: e.y, action: e.action })))
    });

    validationMode = true;
    reset(true, false, 345678);
    ensureBibleSystems();
    const rngBeforeMigration = company.randomState;
    delete company.socialRelationships;
    ensureSocialAISystems();
    assert(company.randomState === rngBeforeMigration, "Shared-experience migration should not consume RNG");
    const [a, b, c] = employees.filter(e => e.active);
    const keyAB = makeRelationshipKey(a.id, b.id);
    assert(normalizeSocialExperienceType("not-a-real-type") === "shared_work_activity", "Unknown experience types should normalize to a controlled type");

    const before = boundarySnapshot();
    const directWithoutSource = recordSharedExperience(a, b, { type: "direct_help", intensity: 2, requireSource: true });
    assert(directWithoutSource === null, "Direct help should require a real source event");
    assert(Object.keys(company.socialRelationships || {}).length === 0, "Rejected direct help should not create pair history");

    const workRecord = recordSharedExperience(a, b, { type: "shared_work_activity", sourceEventId: "work-event-1", projectId: "project-test", participants: [a.id, b.id], tone: "positive", intensity: 2 });
    assert(workRecord && workRecord.recentExperiences.length === 1, "Valid shared work should record one experience");
    assert(workRecord.positiveExperienceCount === 1, "Positive shared work should increment positive count");
    const exp = workRecord.recentExperiences[0];
    assert(exp.type === "shared_work_activity" && exp.emotionalTone === "positive", "Experience should preserve type and tone");
    assert(exp.intensity >= 1 && exp.intensity <= 5, "Experience intensity should be bounded");
    assert(exp.dedupeKey === "work-event-1:shared_work_activity:" + keyAB, "Experience should use stable dedupe key");
    assert(!("employeeReactions" in exp) && !("relationshipBefore" in exp) && !("relationshipAfter" in exp), "Bounded relationship history should not duplicate full emotional or relationship snapshots");
    assert((company.socialEmotionTraces || []).some(trace => trace.sourceEventId === exp.id && trace.employeeId === a.id), "The canonical Emotional System trace should retain the per-employee reaction");
    assert(company.socialMemoryStore.records.some(memory => memory.sourceEventId === "work-event-1" && memory.ownerId === a.id && memory.subjectId === b.id), "The canonical directional memory store should retain the source-backed social interpretation");
    assert(company.chip === before.chip && company.software === before.software && company.integration === before.integration, "Shared experience must not change product progress");
    assert(company.quality === before.quality && company.customers === before.customers, "Shared experience must not change quality or customers");
    assert(JSON.stringify(company.lessons || []) === before.lessons && JSON.stringify(company.learningEpisodes || []) === before.learningEpisodes, "Shared experience must not change Institutional Learning");
    assert(JSON.stringify(company.hiringRequests || []) === before.hiring && JSON.stringify(company.recruitingPipeline || []) === before.recruiting, "Shared experience must not change hiring or recruiting");
    assert(projectSnapshot() === before.projects, "Shared experience must not change project state");
    assert(JSON.stringify(employees.map(e => ({ id: e.id, zone: e.zone, x: e.x, y: e.y, action: e.action }))) === before.positions, "Shared experience must not change movement or task selection");

    recordSharedExperience(a, b, { type: "shared_work_activity", sourceEventId: "work-event-1", projectId: "project-test", participants: [a.id, b.id], tone: "positive", intensity: 2 });
    assert(company.socialRelationships[keyAB].recentExperiences.length === 1, "Duplicate source event should be ignored");

    const mixedRecord = recordSharedExperience(a, b, { type: "deadline_pressure_together", sourceEventId: "deadline-1", tone: "mixed", intensity: 7 });
    assert(mixedRecord.recentExperiences[0].intensity === 5, "Major-event intensity should clamp to 5");
    assert(mixedRecord.experienceSummary.deadline_pressure_together.mixed === 1, "Summary should preserve mixed tone counts");

    recordSocialEncounter(a, c, { type: "shared_break", gain: 1, sourceEventId: "break-session-1", roomId: "break-area", cooldownMinutes: 120 });
    const keyAC = makeRelationshipKey(a.id, c.id);
    assert(company.socialRelationships[keyAC].recentExperiences.some(x => x.type === "shared_break"), "Stage 1 encounters should now create Stage 2 shared-break history");

    recordSharedExperience(a, b, { type: "blocker_resolved_together", sourceEventId: "blocker-1", projectId: "project-test", tone: "positive", intensity: 3, requireSource: true });
    assert(company.socialRelationships[keyAB].recentExperiences.some(x => x.type === "blocker_resolved_together" && x.intensity === 3), "Actual blocker resolution should be recordable for real participants");

    for (let i = 0; i < 30; i++) {
      recordSharedExperience(a, b, { type: "shared_meeting", sourceEventId: `meeting-${i}`, tone: i % 2 ? "neutral" : "positive", intensity: 1 });
    }
    assert(company.socialRelationships[keyAB].recentExperiences.length === SOCIAL_RULES.maxRecentExperiences, "Recent experience detail should honor the shared bounded-history constant");
    assert(company.socialRelationships[keyAB].experienceSummary.shared_meeting.count === 30, "Aggregate summary should retain expired detailed history");

    const saved = JSON.stringify(company.socialRelationships);
    saveGame();
    assert(loadGame(), "Saved company should load");
    ensureSocialAISystems();
    assert(JSON.stringify(company.socialRelationships) === saved, "Shared experiences should survive save/load exactly");
    assert(Object.keys(company.socialRelationships).length === new Set(Object.keys(company.socialRelationships)).size, "Load should not duplicate relationship records");
    company.socialRelationships[makeRelationshipKey(a.id, 9999)] = { employeeAId: a.id, employeeBId: 9999, familiarity: 4, interactionCount: 1, firstMetAt: null, lastInteractionAt: null, positiveExperienceCount: 0, neutralExperienceCount: 1, negativeExperienceCount: 0, recentExperiences: [{ id: "missing-employee-test", type: "shared_work_activity", timestamp: simulationTimestamp(), sourceEventId: "missing", roomId: null, projectId: null, participants: [a.id, 9999], emotionalTone: "neutral", intensity: 1, employeeReactions: {}, dedupeKey: "missing" }], experienceSummary: { shared_work_activity: { count: 1, positive: 0, neutral: 1, negative: 0, mixed: 0, lastAt: 1 } }, recentInteractionTypes: [], cooldowns: {}, stressHistory: 0, moraleHistory: 0 };
    assert(typeof socialFamiliarityDebugHtml(employees.find(e => e.id === a.id)) === "string", "Deleted employee references should be debug-safe");

    debugMode = false;
    showEmployee(a.id);
    const normalText = document.getElementById("employeeModal").innerText;
    assert(!/positiveExperienceCount|negativeExperienceCount|dedupe|sourceEventId|Shared Experiences/i.test(normalText), "Normal UI should not expose raw experience data");
    debugMode = true;
    showEmployee(a.id);
    const debugText = document.getElementById("employeeModal").textContent;
    assert(/Shared Experiences|Aggregate Counts|dedupe|source/i.test(debugText), "AI Debug should expose shared-experience trace data");

    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error([...errors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Social AI shared-experiences regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
