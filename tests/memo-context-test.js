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
    const project = {
      id: "project-phoenix-context",
      title: "Project Phoenix Release Validation",
      codename: "Project Phoenix",
      type: "firmware",
      status: "active",
      progress: 47,
      createdDay: company.day,
      targetDay: company.day + 42,
      requiredStaff: 3,
      allocatedStaff: { hardware: 1, software: 1, quality: 1 },
      performance: {
        riskTrend: 74,
        quality: 58,
        staffingCoverage: 67,
        scheduleVariance: 9,
        blockerCount: 2,
        customerInterest: 61
      },
      hiddenReality: {
        trueTechnicalDifficulty: 72,
        trueMarketDemand: 63,
        trueStrategicValue: 70,
        trueKnowledgeValue: 64,
        trueTalentRetentionValue: 59,
        hiddenTimingWindow: 100,
        hiddenObsolescenceRate: 18
      }
    };
    company.projects = [project, ...(company.projects || [])];
    company.pendingEvent = {
      id: "memo-context-regression",
      title: "Project Phoenix release plan needs a decision",
      copy: "Engineering and Product need executive direction before committing more time and budget.",
      category: "project",
      repeatable: true,
      projectDecision: { id: project.id, action: "review" },
      generatedCommunication: {
        type: "Portfolio Memo",
        priority: "Decision Needed",
        sender: { name: "Maya", role: "VP Engineering" },
        subject: "Project Phoenix release plan needs a decision",
        message: "Project Phoenix needs a release-plan decision before the team commits more time and budget."
      },
      choices: [
        { title: "Approve a validation sprint", detail: "Give the team one bounded sprint to reduce release risk.", strategy: "quality", projectDecision: { id: project.id, action: "validate" }, effect: { quality: 1 } },
        { title: "Continue the current plan", detail: "Keep the current release plan and monitor the next checkpoint.", strategy: "speed", projectDecision: { id: project.id, action: "continue" }, effect: { integration: 1 } },
        { title: "Reduce the first-release scope", detail: "Remove lower-priority scope from the first release.", strategy: "quality", projectDecision: { id: project.id, action: "scope" }, effect: { quality: 1, trust: 1 } }
      ]
    };
    company.pendingCommunication = null;
    company.selected = 0;
    renderDecisionEvent();
    const memoText = document.getElementById("memoContainer").innerText;
    const choiceText = document.getElementById("decisionGrid").innerText;
    const eventCopy = document.getElementById("eventCopy").innerText;
    assert(/Decision context/i.test(memoText), "Memo should show a decision context block near the top");
    assert(memoText.includes("Project Phoenix Release Validation"), "Memo should name the related project");
    assert(eventCopy.includes("Project Phoenix Release Validation"), "Inbox summary should name the related project");
    assert(choiceText.includes("Applies to: Project: Project Phoenix Release Validation"), "Choice cards should say what project the option applies to");
    assert(!/project-phoenix-context\b/.test(memoText), "Normal memo should prefer the project name over the internal id");

    company.manufacturing = { ...(company.manufacturing || {}), supplyRisk: 92, readiness: 38, yield: 44 };
    const speedChoice = { title: "Commit to the market window", detail: "Move quickly while demand is visible.", strategy: "speed", projectDecision: { id: project.id, action: "continue" } };
    const validationChoice = { title: "Approve a validation sprint", detail: "Reduce project and supply risk before committing.", strategy: "quality", projectDecision: { id: project.id, action: "validate" } };
    const highSupplySpeed = hiddenProjectFitScore(project, speedChoice, company.pendingEvent);
    const highSupplyValidation = hiddenProjectFitScore(project, validationChoice, company.pendingEvent);
    company.manufacturing.supplyRisk = 20;
    const lowSupplySpeed = hiddenProjectFitScore(project, speedChoice, company.pendingEvent);
    assert(highSupplySpeed < lowSupplySpeed - 6, `High supply risk should make speed choices less suitable (${highSupplySpeed} vs ${lowSupplySpeed})`);
    assert(highSupplyValidation > highSupplySpeed, `Under high supply risk, validation should fit better than speed (${highSupplyValidation} vs ${highSupplySpeed})`);
    company.manufacturing.supplyRisk = 95;
    project.performance.riskTrend = 88;
    project.performance.blockerCount = 3;
    speedChoice.uncertainty = "High";
    const surpriseSamples = [];
    for (let i = 0; i < 60; i++) {
      const beforeDelayed = company.delayedDecisionEffects.length;
      const beforeHistory = company.decisionHistory.length;
      company.randomState = (123456 + i * 7919) >>> 0;
      const outcome = evaluateStrategicOutcome(company.pendingEvent, speedChoice);
      surpriseSamples.push(Number(outcome.outcomeSurprise) || 0);
      company.delayedDecisionEffects.length = beforeDelayed;
      company.decisionHistory.length = beforeHistory;
    }
    assert(surpriseSamples.some(v => v < 0), "Risky decisions should sometimes produce negative hidden execution surprises");
    validationMode = false;
    return { ok: failures.length === 0, failures, memoPreview: memoText.slice(0, 700), choicePreview: choiceText.slice(0, 700), eventCopy, highSupplySpeed, highSupplyValidation, lowSupplySpeed, surpriseSamples: surpriseSamples.slice(0, 12) };
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
