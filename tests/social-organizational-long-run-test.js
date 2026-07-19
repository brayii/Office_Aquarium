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
  const runtimeErrors = [];
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", error => runtimeErrors.push(`PAGE: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") runtimeErrors.push(`CONSOLE: ${message.text()}`);
  });
  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const run = seed => {
      validationMode = true;
      reset(true, false, seed);
      ensureBibleSystems();
      ensureSocialAISystems();
      ensureSocialOrganizationalSystems({ forceNormalize: true });
      const active = employees.filter(employee => employee.active);
      active.forEach((employee, index) => {
        employee.currentRoom = "meeting-room";
        employee.zone = "meeting";
        employee.x = 20 + index * 3;
        employee.y = 20 + (index % 2) * 2;
      });
      const protectedBefore = JSON.stringify({
        product: [company.chip, company.software, company.integration, company.quality, company.customers],
        projects: (company.projects || []).map(project => [project.id, project.progress, project.quality, project.risk, project.status]),
        work: (company.workItems || []).map(item => [item.id, item.progress, item.status, item.blockedBy]),
        learning: [company.lessons || [], company.learningEpisodes || []]
      });
      const checkpoints = {};
      for (let day = 1; day <= 365; day++) {
        company.day = day;
        company.minute = TIME_RULES.workdayStartMinute;
        const a = active[day % active.length];
        const b = active[(day + 1) % active.length];
        const sourceBase = `social-long-${day}-${a.id}-${b.id}`;
        if (day % 9 === 0) {
          recordSharedExperience(a, b, { type: "professional_disagreement", sourceEventId: `${sourceBase}-conflict`, roomId: "meeting-room", tone: "negative", intensity: 3, actorId: a.id, subjectId: b.id, confidence: 78 });
          company.minute += SOCIAL_ORGANIZATION_RULES.conflict.minimumRepairAgeMinutes + 1;
          recordSharedExperience(a, b, { type: "constructive_feedback", sourceEventId: `${sourceBase}-repair`, roomId: "meeting-room", tone: "positive", intensity: 4, actorId: a.id, subjectId: b.id, confidence: 84 });
        } else if (day % 5 === 0) {
          recordSharedExperience(a, b, { type: "mentoring_interaction", sourceEventId: `${sourceBase}-mentor`, roomId: "meeting-room", tone: "positive", intensity: 3, actorId: a.id, subjectId: b.id, confidence: 82 });
        } else {
          recordSharedExperience(a, b, { type: "shared_work_activity", sourceEventId: `${sourceBase}-work`, roomId: "meeting-room", tone: day % 3 ? "neutral" : "positive", intensity: 2, actorId: a.id, subjectId: b.id, confidence: 75 });
        }
        processSocialOrganizationDaily();
        if ([90, 180, 365].includes(day)) {
          const audit = socialSystemsIntegrityAudit();
          checkpoints[day] = {
            passed: audit.passed,
            errors: audit.errors,
            memories: company.socialMemoryStore.records.length,
            compressed: company.socialMemoryStore.compressedCount,
            conflicts: company.socialConflicts.length,
            unresolved: audit.unresolvedConflicts,
            groups: company.informalGroups.length,
            conversations: company.socialConversationState.history.length,
            sourceEvents: company.socialSourceEvents.length,
            maxRelationshipCooldowns: Math.max(0, ...Object.values(company.socialRelationships || {}).map(record => Object.keys(record.cooldowns || {}).length))
          };
        }
      }
      const protectedAfter = JSON.stringify({
        product: [company.chip, company.software, company.integration, company.quality, company.customers],
        projects: (company.projects || []).map(project => [project.id, project.progress, project.quality, project.risk, project.status]),
        work: (company.workItems || []).map(item => [item.id, item.progress, item.status, item.blockedBy]),
        learning: [company.lessons || [], company.learningEpisodes || []]
      });
      const canonical = JSON.stringify({
        memoryStore: company.socialMemoryStore,
        conflicts: company.socialConflicts,
        culture: company.socialCulture,
        groups: company.informalGroups,
        groupHistory: company.informalGroupHistory,
        chemistry: company.teamChemistry,
        leadership: company.socialLeadership,
        conversations: company.socialConversationState
      });
      const cultureValues = Object.values(company.socialCulture.dimensions).map(dimension => dimension.value);
      const activeInfluence = Object.values(company.socialLeadership).filter(state => state.employeeId !== null).map(state => state.informalInfluence);
      const personalitySignatures = active.map(employee => JSON.stringify(employee.personality));
      return { checkpoints, protectedBefore, protectedAfter, canonical, cultureValues, activeInfluence, personalitySignatures };
    };

    const first = run(860063);
    const second = run(860063);
    [90, 180, 365].forEach(day => {
      assert(first.checkpoints[day]?.passed, `${day}-day social-system integrity audit should pass: ${(first.checkpoints[day]?.errors || []).join("; ")}`);
      assert(first.checkpoints[day]?.memories <= SOCIAL_MEMORY_RULES.globalCap, `${day}-day run should remain under the global memory cap`);
      assert(first.checkpoints[day]?.sourceEvents <= SOCIAL_MEMORY_RULES.maxSourceEvents, `${day}-day run should remain under the social source-event cap`);
      assert(first.checkpoints[day]?.maxRelationshipCooldowns <= SOCIAL_ORGANIZATION_RULES.maxRelationshipCooldowns, `${day}-day run should keep relationship cooldown maps bounded`);
    });
    assert(first.protectedBefore === first.protectedAfter, "A 365-day isolated social run must not mutate project work, product progress, or Institutional Learning");
    assert(first.canonical === second.canonical, "The 365-day social run should replay identically from the same seed and source-event schedule");
    assert(first.checkpoints[365].compressed > 0, "A 365-day run should exercise deterministic memory compression");
    assert(first.checkpoints[365].conflicts > 0 && first.checkpoints[365].unresolved < first.checkpoints[365].conflicts, "Long-run conflicts should occur and repairs should resolve a meaningful share");
    assert(first.checkpoints[365].groups > 1 && first.checkpoints[365].groups < employees.filter(employee => employee.active).length, "Long-run groups should remain diverse without collapsing into one universal cluster");
    assert(Math.max(...first.cultureValues) - Math.min(...first.cultureValues) > .1 && first.cultureValues.every(value => value > 20 && value < 80), "Long-run culture should remain varied and avoid runaway positive or negative convergence");
    assert(first.activeInfluence.some(value => value > 50), "Long-run social evidence should allow informal influence to emerge");
    assert(new Set(first.personalitySignatures).size > 1, "Core personality diversity should remain intact during long-run culture adaptation");
    return { ok: failures.length === 0, failures, checkpoints: first.checkpoints };
  });

  await browser.close();
  if (runtimeErrors.length || !result.ok) {
    console.error([...runtimeErrors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log(`Social organizational 90/180/365-day regression test passed: ${JSON.stringify(result.checkpoints)}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
