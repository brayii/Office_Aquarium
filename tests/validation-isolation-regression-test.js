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
  await page.waitForTimeout(250);

  const result = await page.evaluate(() => {
    const originalWrite = saveRepository.write.bind(saveRepository);
    let productionWrites = 0;
    saveRepository.write = function wrappedProductionWrite(...args) {
      productionWrites += 1;
      return originalWrite(...args);
    };

    function liveHash() {
      return typeof hashAuthoritativeState === "function" ? hashAuthoritativeState(company, employees) : stateHash();
    }

    function summarizeLive() {
      return {
        hash: liveHash(),
        day: company.day,
        minute: company.minute,
        randomState: company.randomState,
        nextRuntimeId: company.nextRuntimeId,
        timerId: timer,
        timerServiceId: simulationTimer.id,
        projectIds: (company.projects || []).map(p => p.id).join("|"),
        projectCount: (company.projects || []).length,
        allocationIds: Object.keys(company.projectAllocations || {}).sort().join("|"),
        employeeIds: employees.map(e => `${e.id}:${e.active}:${e.role}`).join("|"),
        customers: company.customers,
        openRoles: JSON.stringify(company.openRoles || []),
        recruiting: JSON.stringify(company.recruitingPipeline || []),
        onboarding: JSON.stringify(company.onboardingQueue || []),
        crisis: JSON.stringify(company.crisis || null),
        messages: JSON.stringify((company.employeeMessages || []).slice(-8)),
        communications: (company.communications || []).length,
        lessons: (company.learningEpisodes || []).length,
        writes: productionWrites
      };
    }

    ensureBibleSystems();
    company.projects = Array.isArray(company.projects) ? company.projects : [];
    if (company.projects.length < 2 && typeof proposeProject === "function") {
      proposeProject("ai-accelerator");
      proposeProject("firmware-platform");
    }
    ensureProjectAllocations();
    company.customers = 42;
    company.openRoles = ["Verification Engineer"];
    company.recruitingPipeline = [{ id: "regression-role", role: "Firmware Engineer", status: "candidate-search", targetDay: company.day + 15 }];
    company.onboardingQueue = [{ id: "regression-onboarding", role: "QA Engineer", daysRemaining: 8 }];
    company.crisis = { id: "regression-crisis", type: "staffing", stage: "watch", daysRemaining: 20 };
    company.employeeMessages = [{ id: "regression-message", subject: "Regression staffing warning", status: "queued-for-ceo" }];
    company.learningEpisodes = [{ id: "regression-learning", domain: "staffing", status: "open" }];
    collectDailyMetrics();

    const before = summarizeLive();
    const projection = runBalanceProjection(12, { seed: "validation-isolation-live-safety" });
    const afterProjection = summarizeLive();
    const matrix = runBalanceMatrix(4, 10);
    const afterMatrix = summarizeLive();

    const failureContext = createIsolatedValidationContext({ seed: "validation-isolation-failure" });
    let failureCaught = false;
    try {
      runBalanceProjection(failureContext, {
        days: 60,
        seed: "validation-isolation-failure",
        failureHook: ({ day }) => {
          if (day >= 1) throw new Error("Injected validation failure");
        }
      });
    } catch (error) {
      failureCaught = /Injected validation failure/.test(error.message);
    }
    const afterFailure = summarizeLive();

    const matrixA = runBalanceMatrix(4, 8);
    const hashesA = matrixA.reports.map(r => r.deterministicHash).join("|");
    const manualReports = ["matrix-order-1", "matrix-order-2", "matrix-order-3", "matrix-order-4"].map(seed => {
      const context = createIsolatedValidationContext({ seed });
      return runBalanceProjection(context, { days: 8, seed });
    });
    const manualReportsAgain = ["matrix-order-1", "matrix-order-2", "matrix-order-3", "matrix-order-4"].map(seed => {
      const context = createIsolatedValidationContext({ seed });
      return runBalanceProjection(context, { days: 8, seed });
    });
    const manualStable = manualReports.map(r => r.deterministicHash).join("|") === manualReportsAgain.map(r => r.deterministicHash).join("|");

    const unchangedAfterProjection = JSON.stringify(before) === JSON.stringify(afterProjection);
    const unchangedAfterMatrix = JSON.stringify(before) === JSON.stringify(afterMatrix);
    const unchangedAfterFailure = JSON.stringify(before) === JSON.stringify(afterFailure);
    const noStorageWrites = before.writes === afterProjection.writes && before.writes === afterMatrix.writes && before.writes === afterFailure.writes;
    const reportsIsolated = projection.storageWrites === 0 && matrix.reports.every(r => r.storageWrites === 0);

    return {
      ok: unchangedAfterProjection && unchangedAfterMatrix && unchangedAfterFailure && noStorageWrites && reportsIsolated && failureCaught && manualStable && hashesA.length > 0,
      unchangedAfterProjection,
      unchangedAfterMatrix,
      unchangedAfterFailure,
      noStorageWrites,
      reportsIsolated,
      failureCaught,
      manualStable,
      before,
      afterProjection,
      afterMatrix,
      afterFailure,
      projection: { daysRun: projection.daysRun, hash: projection.deterministicHash, storageWrites: projection.storageWrites },
      matrix: { runs: matrix.runs, hashes: hashesA },
      errors: (company.systemErrors || []).slice(0, 3)
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
