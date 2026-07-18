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

  const fileUrl = `file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };

    validationMode = true;
    startNewCompany();
    const firstProfiles = employees.map(e => ({ id: e.id, profile: { ...e.emotionalProfile }, morale: e.morale, stress: e.stress }));
    startNewCompany();
    const secondProfiles = employees.map(e => ({ id: e.id, profile: { ...e.emotionalProfile } }));
    validationMode = false;

    const profilesMatch = firstProfiles.every((row, index) => JSON.stringify(row.profile) === JSON.stringify(secondProfiles[index].profile));
    assert(profilesMatch, "Same seed should produce identical emotional profiles");

    const baselines = employees.map(e => `${e.emotionalProfile.moraleBaseline}:${e.emotionalProfile.stressBaseline}`);
    assert(new Set(baselines).size > 1, "Employees should have varied personal emotional baselines");

    const e = employees[0];
    e.active = true;
    e.emotionalCooldowns = {};
    e.emotionalDailyTotals = { day: company.day, moraleGain: 0, moraleLoss: 0, stressGain: 0, stressLoss: 0 };
    e.emotionalLimits = { maxDailyMoraleGain: 100, maxDailyMoraleLoss: 100, maxDailyStressGain: 100, maxDailyStressLoss: 100 };

    e.morale = 50;
    e.stress = 35;
    const pos = applyEmployeeEmotionDelta(e, { moraleDelta: 4, stressDelta: -1, reasonCode: "positive-test", sourceEventId: "positive-test" });
    assert(pos.moraleDeltaApplied > 0, "Positive events can increase morale");
    assert(pos.stressDeltaApplied < 0, "Recovery/positive events can decrease stress");

    const moraleAfterPositive = e.morale;
    const stressAfterPositive = e.stress;
    const neg = applyEmployeeEmotionDelta(e, { moraleDelta: -3, stressDelta: 4, reasonCode: "negative-test", sourceEventId: "negative-test" });
    assert(e.morale < moraleAfterPositive && neg.moraleDeltaApplied < 0, "Negative events can decrease morale");
    assert(e.stress > stressAfterPositive && neg.stressDeltaApplied > 0, "Pressure can increase stress");

    const moraleBeforeMixed = e.morale;
    const stressBeforeMixed = e.stress;
    const mixed = applyEmployeeEmotionDelta(e, { moraleDelta: 3, stressDelta: 2, reasonCode: "mixed-test", sourceEventId: "mixed-test" });
    assert(e.morale > moraleBeforeMixed && e.stress > stressBeforeMixed && mixed.moraleDeltaApplied > 0 && mixed.stressDeltaApplied > 0, "Mixed events can raise both morale and stress");

    e.morale = e.emotionalProfile.moraleBaseline + 18;
    e.stress = e.emotionalProfile.stressBaseline + 18;
    const highMorale = e.morale;
    const highStress = e.stress;
    applyEmotionalHomeostasis(e);
    assert(e.morale < highMorale, "Morale above baseline should drift down");
    assert(e.stress < highStress, "Stress above baseline should drift down");

    e.morale = e.emotionalProfile.moraleBaseline - 16;
    e.stress = e.emotionalProfile.stressBaseline - 12;
    const lowMorale = e.morale;
    const lowStress = e.stress;
    applyEmotionalHomeostasis(e);
    assert(e.morale > lowMorale, "Morale below baseline should drift up");
    assert(e.stress > lowStress, "Stress below baseline should drift up instead of forcing to zero");

    e.morale = 95;
    e.emotionalDailyTotals = { day: company.day, moraleGain: 0, moraleLoss: 0, stressGain: 0, stressLoss: 0 };
    const capped = applyEmployeeEmotionDelta(e, { moraleDelta: 5, stressDelta: 0, reasonCode: "soft-cap-test", sourceEventId: "soft-cap-test" });
    assert(capped.moraleDeltaApplied > 0 && capped.moraleDeltaApplied < 1, `Ordinary morale gains near the soft cap should be small, got ${capped.moraleDeltaApplied}`);

    e.morale = 84;
    e.emotionalCooldowns = {};
    e.emotionalDailyTotals = { day: company.day, moraleGain: 0, moraleLoss: 0, stressGain: 0, stressLoss: 0 };
    for (let i = 0; i < 30; i += 1) {
      applyEmployeeEmotionDelta(e, { moraleDelta: 1, stressDelta: 0, reasonCode: `minor-positive-${i}`, sourceEventId: `minor-positive-${i}` });
      if (i % 3 === 0) applyEmotionalHomeostasis(e);
    }
    assert(e.morale < 99, `Repeated minor positives should not pin morale at 100, got ${e.morale}`);

    const introvert = { ...e, id: 9001, active: true, personality: { ...e.personality, sociability: -0.9, structureNeed: 0.8, resilience: -0.2 }, emotionalState: defaultEmotionalState({ sociability: -0.9, structureNeed: 0.8 }) };
    const extrovert = { ...e, id: 9002, active: true, personality: { ...e.personality, sociability: 0.9, structureNeed: -0.4, resilience: 0.4 }, emotionalState: defaultEmotionalState({ sociability: 0.9, structureNeed: -0.4 }) };
    ensureEmployeeEmotionalProfile(introvert, { force: true });
    ensureEmployeeEmotionalProfile(extrovert, { force: true });
    const introvertSocial = evaluateEmployeeEmotionalReaction({ employee: introvert, event: { type: "social", id: "personality-social" }, relationshipContext: { relationshipScore: 20 } });
    const extrovertSocial = evaluateEmployeeEmotionalReaction({ employee: extrovert, event: { type: "social", id: "personality-social" }, relationshipContext: { relationshipScore: 20 } });
    assert(introvertSocial.moraleDelta !== extrovertSocial.moraleDelta || introvertSocial.stressDelta !== extrovertSocial.stressDelta, "Different personalities should produce different reactions");

    const savedMorale = e.morale;
    const savedStress = e.stress;
    const savedProfile = JSON.stringify(e.emotionalProfile);
    saveGame();
    const loaded = loadGame();
    const loadedEmployee = employees.find(x => x.id === e.id);
    assert(loaded, "Save should load after emotional migration");
    assert(JSON.stringify(loadedEmployee.emotionalProfile) === savedProfile, "Save/load should preserve baselines and rates");
    assert(Math.abs(loadedEmployee.morale - savedMorale) < 0.001, "Save/load should preserve current morale");
    assert(Math.abs(loadedEmployee.stress - savedStress) < 0.001, "Save/load should preserve current stress");

    validationMode = true;
    startNewCompany();
    company.speed = 12;
    const traces = new Map(employees.map(emp => [emp.id, { minMorale: emp.morale, maxMorale: emp.morale, minStress: emp.stress, maxStress: emp.stress, atMorale100: 0, atStress0: 0 }]));
    const targetDay = 70;
    for (let i = 0; i < 50000 && company.day < targetDay && !company.gameOver && !company.lastSimulationError; i += 1) {
      // This suite measures emotional movement; loss-path timing is covered by dedicated crisis tests.
      if (company.crisis) {
        company.crisis.deadlineDay = Math.max(company.crisis.deadlineDay || 0, targetDay + 30);
        company.crisisDays = Math.max(0, company.crisis.deadlineDay - company.day);
      }
      company.paused = false;
      simulateMinute(false);
      employees.filter(emp => emp.active).forEach(emp => {
        if (!traces.has(emp.id)) traces.set(emp.id, { minMorale: emp.morale, maxMorale: emp.morale, minStress: emp.stress, maxStress: emp.stress, atMorale100: 0, atStress0: 0 });
        const t = traces.get(emp.id);
        t.minMorale = Math.min(t.minMorale, emp.morale);
        t.maxMorale = Math.max(t.maxMorale, emp.morale);
        t.minStress = Math.min(t.minStress, emp.stress);
        t.maxStress = Math.max(t.maxStress, emp.stress);
        if (emp.morale >= 99.9) t.atMorale100 += 1;
        if (emp.stress <= 0.1) t.atStress0 += 1;
      });
    }
    const summaries = [...traces.values()];
    const nonMonotonic = summaries.filter(t => t.maxMorale - t.minMorale > 2 && t.maxStress - t.minStress > 2).length;
    const pinnedMorale = summaries.filter(t => t.atMorale100 > 40).length;
    const pinnedStressZero = summaries.filter(t => t.atStress0 > 40).length;
    assert(company.day >= targetDay, `Long-run emotional test should reach day ${targetDay}; stopped on day ${company.day}, gameOver ${!!company.gameOver}, failure ${company.failureCode || "none"}, error ${company.lastSimulationError?.message || company.lastSimulationError || "none"}`);
    assert(nonMonotonic >= Math.max(2, Math.floor(summaries.length / 3)), "Long-run traces should show varied rises and falls");
    assert(pinnedMorale < Math.ceil(summaries.length / 2), "Most employees should not remain pinned at 100 morale");
    assert(pinnedStressZero < Math.ceil(summaries.length / 2), "Most employees should not remain pinned at zero stress");
    assert((company.emotionalTraces || []).some(t => t.type === "emotional_homeostasis"), "Homeostatic updates should be logged");
    assert((company.emotionalTraces || []).some(t => t.type === "emotional_event" || t.type === "social_emotion_applied"), "Event effects should be logged");

    return { ok: failures.length === 0, failures, profiles: firstProfiles, longRun: { day: company.day, gameOver:!!company.gameOver, failureCode:company.failureCode||null, lastSimulationError:company.lastSimulationError||null, nonMonotonic, pinnedMorale, pinnedStressZero } };
  });

  await browser.close();
  const ok = errors.length === 0 && result.ok;
  console.log(JSON.stringify({ ok, result, errors }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
