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
    const [a, b, c] = employees.filter(e => e.active);
    a.currentRoom = "break-area";
    b.currentRoom = "break-area";
    c.currentRoom = "hardware-lab";

    const rngBeforeFirstAccess = company.randomState;
    const viewAB = getSocial(a, b.id);
    const scoreAB = socialScore(a, b.id);
    assert(company.randomState === rngBeforeFirstAccess, "Derived social adapter must not consume live RNG");
    assert(Object.keys(company.socialRelationships || {}).length === 0, "Reading social view must not fabricate pair records");
    assert(!("friendship" in viewAB) && !("rivalry" in viewAB), "Legacy social view must not expose friendship or rivalry");
    assert(Number.isFinite(scoreAB), "Derived social score should remain finite for compatibility callers");

    const beforePassive = snapshotWork();
    const beforeEmotionCount = (company.socialEmotionTraces || []).length;
    for (let i = 0; i < 4; i++) observeRoomFamiliarity(5);
    const keyAB = makeRelationshipKey(a.id, b.id);
    assert(company.socialRelationships[keyAB]?.familiarity > 0, "Passive same-room exposure should build familiarity");
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
