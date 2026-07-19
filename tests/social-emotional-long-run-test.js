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
    validationMode = true;
    reset(true, false, 998877);
    ensureBibleSystems();
    const createTraceSummary = e => ({
      minMorale: e.morale,
      maxMorale: e.morale,
      minStress: e.stress,
      maxStress: e.stress,
      moraleSum: 0,
      stressSum: 0,
      samples: 0,
      positiveEvents: 0,
      negativeEvents: 0,
      mixedEvents: 0,
      moraleDirectionChanges: 0,
      stressDirectionChanges: 0,
      lastMorale: e.morale,
      lastStress: e.stress,
      lastMoraleDirection: 0,
      lastStressDirection: 0,
      moraleAt100: 0,
      stressAt0: 0
    });
    employees.forEach((e, i) => {
      e.morale = 55 + (i % 3) * 4;
      e.stress = 35 + (i % 4) * 5;
      e.emotionalDailyTotals = { day: company.day, moraleGain: 0, moraleLoss: 0, stressGain: 0, stressLoss: 0 };
      e.emotionalLimits = { maxDailyMoraleGain: 100, maxDailyMoraleLoss: 100, maxDailyStressGain: 100, maxDailyStressLoss: 100 };
    });
    const traces = new Map(employees.filter(e => e.active).map(e => [e.id, createTraceSummary(e)]));

    while (company.day < 90 && !company.gameOver && !company.lastSimulationError) {
      // Preserve crisis pressure while preventing an unrelated timeout from ending this social/emotional observation.
      if (company.crisis) {
        company.crisis.deadlineDay = Math.max(company.crisis.deadlineDay || 0, 120);
        company.crisisDays = Math.max(0, company.crisis.deadlineDay - company.day);
      }
      simulateMinute(false);
      employees.filter(e => e.active).forEach(e => {
        if (!traces.has(e.id)) traces.set(e.id, createTraceSummary(e));
        const t = traces.get(e.id);
        const moraleDelta = e.morale - t.lastMorale;
        const stressDelta = e.stress - t.lastStress;
        const moraleDirection = Math.sign(moraleDelta);
        const stressDirection = Math.sign(stressDelta);
        const positiveSignal = moraleDelta > .001 || stressDelta < -.001;
        const negativeSignal = moraleDelta < -.001 || stressDelta > .001;
        if (positiveSignal && negativeSignal) t.mixedEvents++;
        else if (positiveSignal) t.positiveEvents++;
        else if (negativeSignal) t.negativeEvents++;
        if (moraleDirection && t.lastMoraleDirection && moraleDirection !== t.lastMoraleDirection) t.moraleDirectionChanges++;
        if (stressDirection && t.lastStressDirection && stressDirection !== t.lastStressDirection) t.stressDirectionChanges++;
        if (moraleDirection) t.lastMoraleDirection = moraleDirection;
        if (stressDirection) t.lastStressDirection = stressDirection;
        t.lastMorale = e.morale;
        t.lastStress = e.stress;
        t.minMorale = Math.min(t.minMorale, e.morale);
        t.maxMorale = Math.max(t.maxMorale, e.morale);
        t.minStress = Math.min(t.minStress, e.stress);
        t.maxStress = Math.max(t.maxStress, e.stress);
        t.moraleSum += e.morale;
        t.stressSum += e.stress;
        t.samples++;
        if (e.morale >= 99.9) t.moraleAt100++;
        if (e.stress <= 0.1) t.stressAt0++;
      });
    }

    const relationships = Object.values(company.socialRelationships || {});
    const activeEmployees = employees.filter(e => e.active);
    const possiblePairs = activeEmployees.length * (activeEmployees.length - 1) / 2;
    const unknownPairs = Math.max(0, possiblePairs - relationships.length);
    relationships.forEach(record => evaluateRelationshipInterpretation(record));
    const interpreted = relationships.map(record => record.interpretation || {});
    const positivePairs = interpreted.filter(rel => (rel.trust || 0) > 70 && (rel.comfort || 0) > 70 && (rel.professionalFriction || 0) < 15).length;
    const relationshipBands = SOCIAL_ORGANIZATION_RULES.relationshipBands;
    const frictionPairs = interpreted.filter(rel => (rel.professionalFriction || 0) >= relationshipBands.materialFriction).length;
    const neutralPairs = unknownPairs + relationships.filter(record => (record.familiarity || 0) < 18 || !record.lastRelationshipEvaluationAt).length;
    const negativeExperiences = relationships.reduce((sum, record) => sum + (record.negativeExperienceCount || 0), 0);
    const mixedExperiences = relationships.reduce((sum, record) => sum + Object.values(record.experienceSummary || {}).reduce((typeSum, summary) => typeSum + (summary.mixed || 0), 0), 0);
    const highTrustHighFriction = interpreted.filter(rel => (rel.trust || 0) >= relationshipBands.substantialTrust && (rel.professionalFriction || 0) >= relationshipBands.materialFriction).length;
    const highestTrustFrictionPairs = relationships
      .filter(record => (record.interpretation?.professionalFriction || 0) >= relationshipBands.materialFriction)
      .sort((a, b) => (b.interpretation?.trust || 0) - (a.interpretation?.trust || 0))
      .slice(0, 5)
      .map(record => ({
        trust: record.interpretation?.trust,
        respect: record.interpretation?.respect,
        comfort: record.interpretation?.comfort,
        friction: record.interpretation?.professionalFriction,
        counts: record.relationshipInputs?.counts
      }));
    const highComfortLowRespect = interpreted.filter(rel => (rel.comfort || 0) >= 65 && (rel.respect || 0) <= 45).length;
    const comfortValues = interpreted.map(rel => rel.comfort || 0);
    const avgComfort = comfortValues.reduce((sum, value) => sum + value, 0) / Math.max(1, comfortValues.length);
    const variance = comfortValues.reduce((sum, value) => sum + Math.pow(value - avgComfort, 2), 0) / Math.max(1, comfortValues.length);
    const summaries = [...traces.values()];
    const pinnedMorale = summaries.filter(t => t.moraleAt100 > 120).length;
    const pinnedStressZero = summaries.filter(t => t.stressAt0 > 120).length;
    const emotionalMovement = summaries.filter(t => (t.maxMorale - t.minMorale) > 3 && (t.maxStress - t.minStress) > 3).length;
    const moraleDirectionChanges = summaries.filter(t => t.moraleDirectionChanges > 0).length;
    const stressDirectionChanges = summaries.filter(t => t.stressDirectionChanges > 0).length;
    const positiveEventEmployees = summaries.filter(t => t.positiveEvents > 0).length;
    const negativeEventEmployees = summaries.filter(t => t.negativeEvents > 0).length;
    const mixedEventEmployees = summaries.filter(t => t.mixedEvents > 0).length;
    const traceSignatures = new Set(summaries.map(t => [
      Math.round(t.minMorale / 4), Math.round(t.maxMorale / 4),
      Math.round(t.minStress / 4), Math.round(t.maxStress / 4),
      Math.round((t.moraleSum / Math.max(1, t.samples)) / 4),
      Math.round((t.stressSum / Math.max(1, t.samples)) / 4),
      Math.min(9, t.moraleDirectionChanges), Math.min(9, t.stressDirectionChanges)
    ].join("|")));
    const passiveSocialEvents = (company.socialEmotionTraces || []).filter(trace => /same[_-]room|co[_-]?presence|room[_-]presence/i.test(`${trace.sourceEventId || ""} ${trace.reasonCode || ""}`)).length;

    assert(company.day >= 90, `Expected to reach day 90; stopped on day ${company.day}, gameOver ${!!company.gameOver}, failure ${company.failureCode || "none"}, error ${company.lastSimulationError?.message || company.lastSimulationError || "none"}`);
    assert(!company.lastSimulationError, `Simulation error during social-emotional long run: ${company.lastSimulationError?.message || company.lastSimulationError}`);
    assert(relationships.length > 0, "Long run should create relationship records");
    assert(positivePairs < Math.max(relationships.length, 1), "Relationships should not universally converge to strongly positive");
    assert(frictionPairs > 0 || negativeExperiences > 0 || variance > 8, "Relationship model should retain diversity instead of collapsing to one positive state");
    assert(neutralPairs > 0 || (possiblePairs <= 28 && (frictionPairs > 0 || variance > 8)), "Some relationships should remain unfamiliar/neutral, or a small mature office should retain non-positive relationship diversity");
    assert(highTrustHighFriction > 0, "A natural long run should be able to retain substantial trust alongside material professional friction");
    assert(highComfortLowRespect > 0, "A natural long run should be able to produce personal comfort without high professional respect");
    assert(negativeExperiences > 0 && mixedExperiences > 0, "Actual project and workplace outcomes should create both negative and mixed shared histories");
    assert(pinnedMorale < Math.ceil(summaries.length / 2), "Most employees should not remain pinned at 100 morale");
    assert(pinnedStressZero < Math.ceil(summaries.length / 2), "Most employees should not remain pinned at zero stress");
    assert(emotionalMovement >= Math.ceil(summaries.length / 3), "Employees should show meaningful stress and morale movement");
    assert(moraleDirectionChanges >= Math.ceil(summaries.length / 3), "Morale traces should not be monotonic for most employees");
    assert(stressDirectionChanges >= Math.ceil(summaries.length / 3), "Stress traces should not be monotonic for most employees");
    assert(positiveEventEmployees >= Math.ceil(summaries.length / 3) && negativeEventEmployees >= Math.ceil(summaries.length / 3) && mixedEventEmployees > 0, "Long-run traces should include positive, negative, and mixed emotional movement");
    assert(traceSignatures.size >= Math.min(3, Math.ceil(summaries.length / 3)), "Employee emotional traces should not be nearly identical");
    assert(passiveSocialEvents === 0, "Passive co-presence must not contribute emotional events");

    return {
      ok: failures.length === 0,
      failures,
      day: company.day,
      gameOver:!!company.gameOver,
      failureCode:company.failureCode||null,
      lastSimulationError:company.lastSimulationError||null,
      relationships: relationships.length,
      positivePairs,
      frictionPairs,
      neutralPairs,
      unknownPairs,
      negativeExperiences,
      mixedExperiences,
      highTrustHighFriction,
      highestTrustFrictionPairs,
      highComfortLowRespect,
      comfortVariance: Number(variance.toFixed(2)),
      emotionalMovement,
      moraleDirectionChanges,
      stressDirectionChanges,
      positiveEventEmployees,
      negativeEventEmployees,
      mixedEventEmployees,
      traceSignatures: traceSignatures.size,
      passiveSocialEvents,
      averageMorale: Number((summaries.reduce((sum, t) => sum + t.moraleSum / Math.max(1, t.samples), 0) / Math.max(1, summaries.length)).toFixed(2)),
      averageStress: Number((summaries.reduce((sum, t) => sum + t.stressSum / Math.max(1, t.samples), 0) / Math.max(1, summaries.length)).toFixed(2))
    };
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
