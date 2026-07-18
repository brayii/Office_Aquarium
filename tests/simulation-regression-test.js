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
      return typeof hashAuthoritativeState === "function" ? hashAuthoritativeState(company, employees) : stateHash();
    }
    function authoritativeDifferencePaths(left, right, path = "", output = []) {
      if (output.length >= 30 || Object.is(left, right)) return output;
      if (left === null || right === null || typeof left !== "object" || typeof right !== "object") {
        output.push({ path, left, right });
        return output;
      }
      const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
      [...keys].sort().forEach(key => {
        if (output.length >= 30) return;
        const nextPath = path ? `${path}.${key}` : key;
        if (!(key in left) || !(key in right)) output.push({ path: nextPath, left: key in left ? left[key] : "<missing>", right: key in right ? right[key] : "<missing>" });
        else authoritativeDifferencePaths(left[key], right[key], nextPath, output);
      });
      return output;
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
    const regressionArchive = (company.communications || []).find(m => m.eventId === "regression-ceo-decision");
    const regressionDecisionHistory = (company.decisionHistory || []).find(h => h.eventId === "regression-ceo-decision");
    const regressionLearningEpisode = (company.learningEpisodes || []).find(ep =>
      ep.domain === "decision" &&
      ep.sourceId === "regression-ceo-decision" &&
      ep.choiceTitle === regressionArchive?.decision &&
      ep.decisionId
    );
    const decisionApplied =
      (company.communications || []).length > communicationsBefore &&
      (company.learningEpisodes || []).length > learningBefore &&
      !!regressionArchive &&
      !!regressionDecisionHistory &&
      regressionArchive.decision === regressionDecisionHistory.choice &&
      !!regressionLearningEpisode &&
      !company.pendingEvent;
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
      regressionDecision: {
        archived: !!regressionArchive,
        history: !!regressionDecisionHistory,
        learningEpisode: !!regressionLearningEpisode,
        archivedChoice: regressionArchive?.decision || null,
        historyChoice: regressionDecisionHistory?.choice || null,
        episodeChoice: regressionLearningEpisode?.choiceTitle || null
      },
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
    const endDayA = company.day;
    const failureA = company.failureCode || company.failureType || null;
    const employeesA = employees.filter(e => e.active).length;
    const rolesA = [...new Set(employees.filter(e => e.active).map(e => canonicalRole(e.role)))].sort();
    const hashA = stableSnapshotHash();
    const authoritativeA = {
      company: canonicalAuthoritativeState(company, "company"),
      employees: canonicalAuthoritativeState(employees, "employees")
    };
    if (savedDay50) localStorage.setItem(saveKey, savedDay50);
    const reloadDay50Ok = typeof loadGame === "function" ? loadGame() : false;
    const day50ReloadHash = stableSnapshotHash();
    const reachedDay100B = reloadDay50Ok && day50ReloadHash === day50Hash && advanceToDay(100, 14000);
    const endDayB = company.day;
    const failureB = company.failureCode || company.failureType || null;
    const employeesB = employees.filter(e => e.active).length;
    const rolesB = [...new Set(employees.filter(e => e.active).map(e => canonicalRole(e.role)))].sort();
    const hashB = stableSnapshotHash();
    const authoritativeB = {
      company: canonicalAuthoritativeState(company, "company"),
      employees: canonicalAuthoritativeState(employees, "employees")
    };
    const continuationDifferences = hashA === hashB ? [] : authoritativeDifferencePaths(authoritativeA, authoritativeB);
    const deterministicContinuation = reachedDay100A === reachedDay100B && endDayA === endDayB && failureA === failureB && employeesA === employeesB && JSON.stringify(rolesA) === JSON.stringify(rolesB) && hashA === hashB;
    const workforceGrowthObserved = employeesA > 8 && rolesA.length > 8;
    return {
      ok: reachedDay50 && decisionApplied && !beforeSave.lastSimulationError && loadOk && beforeSave.day === afterLoad.day && beforeSave.employees === afterLoad.employees && hashEqualAfterLoad && deterministicContinuation && workforceGrowthObserved,
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
        endDayA,
        endDayB,
        failureA,
        failureB,
        employeesA,
        employeesB,
        rolesA,
        rolesB,
        workforceGrowthObserved,
        hashA,
        hashB,
        continuationDifferences,
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
