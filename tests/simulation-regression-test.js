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
  await page.evaluate(() => startNewCompany());
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    if (typeof company === "undefined" || typeof simulateMinute !== "function") {
      return { ok: false, reason: "Simulation globals unavailable" };
    }
    function stableSnapshotHash() {
      const activeEmployees = employees
        .filter(e => e.active)
        .map(e => ({
          id: e.id,
          role: e.role,
          action: e.action,
          stress: Math.round(e.stress || 0),
          morale: Math.round(e.morale || 0),
          focus: Math.round(e.focus || 0),
          energy: Math.round(e.energy || 0),
          offsite: !!e.offsite,
          sickDays: e.sickDays || 0,
          recentOutput: Number(e.recentOutput || 0).toFixed(3)
        }))
        .sort((a, b) => a.id - b.id);
      const projects = [...(company.projects || []), ...(company.projectArchive || [])]
        .map(p => ({
          id: p.id,
          status: p.status,
          progress: Number(p.progress || 0).toFixed(2),
          budgetSpent: Number(p.budgetSpent || 0).toFixed(3),
          revenue: Number(p.dailyRevenue || 0).toFixed(4),
          customers: Math.round(p.customers || 0),
          risk: Math.round(p.performance?.riskTrend ?? p.visibleRisk ?? 0)
        }))
        .sort((a, b) => String(a.id).localeCompare(String(b.id)));
      const snapshot = {
        day: company.day,
        minute: company.minute,
        randomState: company.randomState,
        phase: company.phase,
        cash: Number(company.cash || 0).toFixed(4),
        board: Math.round(company.board || 0),
        trust: Math.round(company.trust || 0),
        quality: Math.round(company.quality || 0),
        integration: Math.round(company.integration || 0),
        customers: Math.round(company.customers || 0),
        valuation: Number(company.valuation || 0).toFixed(3),
        dailyRevenue: Number(company.dailyRevenue || 0).toFixed(4),
        eventCooldown: company.eventCooldown || 0,
        directive: company.directive || null,
        directiveDays: company.directiveDays || 0,
        employees: activeEmployees,
        projects,
        messages: (company.messages || []).length,
        communications: (company.communications || []).length,
        learningEpisodes: (company.learningEpisodes || []).length,
        lessons: (company.lessons || []).map(l => [l.key, l.state, Math.round(l.confidence || 0), l.reinforcements || 0]).slice(0, 20),
        decisionThreads: (company.decisionThreads || []).map(t => [t.id, t.phase, t.state]).slice(0, 20)
      };
      const text = JSON.stringify(snapshot);
      let hash = 2166136261 >>> 0;
      for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619) >>> 0;
      }
      return hash.toString(16);
    }
    function advanceToDay(targetDay, maxTicks = 30000) {
      const oldValidationMode = typeof validationMode !== "undefined" ? validationMode : false;
      validationMode = true;
      for (let i = 0; i < maxTicks && company.day < targetDay; i += 1) {
        company.paused = false;
        simulateMinute(false);
        if (company.gameOver || company.lastSimulationError) break;
      }
      validationMode = oldValidationMode;
      return !company.gameOver && !company.lastSimulationError && company.day >= targetDay;
    }
    const learningBefore = (company.learningEpisodes || []).length;
    const communicationsBefore = (company.communications || []).length;
    company.escalationQueue = Array.isArray(company.escalationQueue) ? company.escalationQueue : [];
    company.escalationQueue.unshift({
      id: "regression-ceo-decision",
      title: "Regression Decision Review",
      copy: "A controlled regression memo checks whether CEO decisions still archive and create learning episodes.",
      category: "quality",
      repeatable: true,
      choices: [
        { title: "Approve a validation sprint", detail: "Use a bounded quality check before continuing.", strategy: "quality", directive: "quality", days: 3, effect: { quality: 1, integration: 0.5 }, people: { stress: 0, morale: 1 } },
        { title: "Continue the current plan", detail: "Keep work moving without changing resources.", strategy: "speed", directive: "speed", days: 2, effect: { integration: 1 }, people: { stress: 1, morale: 0 } },
        { title: "Delay for more evidence", detail: "Pause briefly and ask for stronger evidence.", strategy: "pilot", directive: "quality", days: 2, effect: { quality: 0.5 }, people: { stress: -1, morale: 0 } }
      ]
    });
    const oldValidationMode = typeof validationMode !== "undefined" ? validationMode : false;
    validationMode = true;
    maybeCreateDecisionEvent();
    validationMode = oldValidationMode;
    const decisionApplied =
      (company.communications || []).length > communicationsBefore &&
      (company.learningEpisodes || []).length > learningBefore;
    company.speed = 12;
    for (let i = 0; i < 2400; i += 1) {
      company.paused = false;
      simulateMinute(false);
      if (company.gameOver || company.lastSimulationError) break;
      if (company.day >= 3) break;
    }
    const beforeSave = {
      day: company.day,
      minute: company.minute,
      employees: employees.filter(e => e.active).length,
      messages: (company.messages || []).length,
      projects: (company.projects || []).length,
      lastSimulationError: company.lastSimulationError || null,
      lastDailyCloseStatus: company.lastDailyCloseStatus || null,
      learningEpisodes: (company.learningEpisodes || []).length,
      communications: (company.communications || []).length,
      decisionApplied,
      hash: stableSnapshotHash()
    };
    if (typeof saveGame === "function") saveGame();
    const loadOk = typeof loadGame === "function" ? loadGame() : false;
    const afterLoad = {
      day: company.day,
      minute: company.minute,
      employees: employees.filter(e => e.active).length,
      lastSimulationError: company.lastSimulationError || null,
      hash: stableSnapshotHash()
    };
    const hashEqualAfterLoad = beforeSave.hash === afterLoad.hash;
    const reachedDay50 = advanceToDay(50, 12000);
    if (typeof saveGame === "function") saveGame();
    const saveKey = typeof SAVE_KEY !== "undefined" ? SAVE_KEY : "office-aquarium-living-office-v3";
    const savedDay50 = localStorage.getItem(saveKey);
    const day50Hash = stableSnapshotHash();
    const reachedDay100A = reachedDay50 && advanceToDay(100, 14000);
    const hashA = stableSnapshotHash();
    if (savedDay50) localStorage.setItem(saveKey, savedDay50);
    const reloadDay50Ok = typeof loadGame === "function" ? loadGame() : false;
    const day50ReloadHash = stableSnapshotHash();
    const reachedDay100B = reloadDay50Ok && day50ReloadHash === day50Hash && advanceToDay(100, 14000);
    const hashB = stableSnapshotHash();
    const deterministicContinuation = reachedDay100A && reachedDay100B && hashA === hashB;
    return {
      ok: company.day >= 100 && decisionApplied && !beforeSave.lastSimulationError && loadOk && beforeSave.day === afterLoad.day && beforeSave.employees === afterLoad.employees && hashEqualAfterLoad && deterministicContinuation,
      beforeSave,
      afterLoad,
      loadOk,
      hashEqualAfterLoad,
      deterministic: {
        reachedDay50,
        reloadDay50Ok,
        day50Hash,
        day50ReloadHash,
        reachedDay100A,
        reachedDay100B,
        hashA,
        hashB,
        deterministicContinuation
      }
    };
  });

  await browser.close();
  const ok = errors.length === 0 && result.ok;
  console.log(JSON.stringify({ ok, result, errors: errors.slice(0, 8) }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
