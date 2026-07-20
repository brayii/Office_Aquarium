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
  const executablePath = chromeCandidates.find(candidate => fs.existsSync(candidate));
  return chromium.launch({ headless: true, executablePath });
}

async function main() {
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const browserErrors = [];
  page.on("pageerror", error => browserErrors.push(`PAGE: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") browserErrors.push(`CONSOLE: ${message.text()}`);
  });
  const fileUrl = `file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    startNewCompany();
    company.paused = true;
    saveGame();
    company.cash += 0.25;
    saveGame();
  });

  const result = await page.evaluate(() => {
    const failures = [];
    const check = (condition, message) => {
      if (!condition) failures.push(message);
    };
    const baselineCompany = structuredClone(company);
    const baselineEmployees = structuredClone(employees);
    const resetState = () => {
      company = structuredClone(baselineCompany);
      employees = structuredClone(baselineEmployees);
      company.paused = false;
      company.gameOver = false;
      company.runtimeFailure = null;
      company.lastSimulationError = null;
      company.lastDailyCloseStatus = null;
      company.systemErrors = [];
      document.getElementById("runtimeErrorOverlay").classList.add("hidden");
    };

    resetState();
    const originalMinuteCore = simulateMinuteCore;
    simulateMinuteCore = () => {
      throw new Error("Controlled minute-cycle failure");
    };
    simulateMinute(true);
    simulateMinuteCore = originalMinuteCore;
    render();
    const realEmergencyDetail = saveRepository.readDetailed();
    check(company.paused, "minute-cycle failure pauses the simulation");
    check(company.lastSimulationError?.phase === "simulateMinute", "minute-cycle failure records its stage");
    check(realEmergencyDetail.recoverable, "minute-cycle failure preserves a last-known-good backup");
    check(company.saveHealth?.emergency === true, "minute-cycle failure records emergency-save status");
    check(
      !document.getElementById("runtimeErrorOverlay").classList.contains("hidden"),
      "minute-cycle failure opens the recovery dialog"
    );
    check(
      document.getElementById("officeHeadline").textContent === "Simulation paused for recovery.",
      "office status no longer says the company is running after failure"
    );

    const originalHandlers = dailyPipelineHandlers;
    const originalSaveGame = saveGame;
    const stageResults = [];
    saveGame = () => ({ ok: true, size: 1, sizeStatus: "healthy", backupCreated: true });
    for (const targetStage of DAILY_PIPELINE_STAGE_ORDER) {
      resetState();
      dailyPipelineHandlers = () => Object.fromEntries(
        DAILY_PIPELINE_STAGE_ORDER.map(stage => [
          stage,
          stage === targetStage
            ? () => {
              throw new Error(`Controlled ${targetStage} failure`);
            }
            : () => {}
        ])
      );
      dailyClose();
      render();
      const overlay = document.getElementById("runtimeErrorOverlay");
      const stageResult = {
        stage: targetStage,
        paused: company.paused,
        recordedPhase: company.lastSimulationError?.phase || null,
        closeStatus: company.lastDailyCloseStatus?.status || null,
        overlayVisible: !overlay.classList.contains("hidden"),
        playerStage: document.getElementById("runtimeErrorStage").textContent,
        officeHeadline: document.getElementById("officeHeadline").textContent,
        rawStackVisible: overlay.innerText.includes("runtime-recovery-regression-test") ||
          overlay.innerText.includes("Controlled ") && overlay.innerText.includes(" at ")
      };
      stageResults.push(stageResult);
      check(stageResult.paused, `${targetStage} failure pauses the simulation`);
      check(stageResult.recordedPhase === `dailyClose:${targetStage}`, `${targetStage} failure records the exact stage`);
      check(stageResult.closeStatus === "error", `${targetStage} failure marks daily close as failed`);
      check(stageResult.overlayVisible, `${targetStage} failure opens the recovery dialog`);
      check(stageResult.officeHeadline === "Simulation paused for recovery.", `${targetStage} failure updates office status`);
      check(!stageResult.rawStackVisible, `${targetStage} failure hides raw stack details from the player`);
    }
    dailyPipelineHandlers = originalHandlers;
    saveGame = originalSaveGame;

    const diagnostic = runtimeDiagnosticsPayload();
    check(diagnostic.applicationVersion === OFFICE_AQUARIUM_CONSTANTS.release.applicationVersion, "diagnostics include app version");
    check(diagnostic.saveVersion === SAVE_VERSION, "diagnostics include save version");
    check(diagnostic.runtimeFailure && diagnostic.lastSimulationError, "diagnostics include failure state");
    check(
      diagnostic.systemErrors.length <= OFFICE_AQUARIUM_CONSTANTS.runtimeRecovery.maximumSystemErrors,
      "diagnostics respect the system-error history limit"
    );
    check(
      document.getElementById("runtimeErrorOverlay").getAttribute("role") === "alertdialog" &&
        document.getElementById("runtimeErrorTitle").getAttribute("tabindex") === "-1",
      "runtime recovery uses accessible alert-dialog semantics"
    );
    check(
      !document.getElementById("runtimeRestoreBackup").disabled,
      "runtime recovery offers the protected backup when available"
    );

    return {
      ok: failures.length === 0,
      failures,
      testedStages: stageResults.map(result => ({
        stage: result.stage,
        phase: result.recordedPhase,
        playerStage: result.playerStage
      })),
      realEmergencySave: {
        current: realEmergencyDetail.current.status,
        backup: realEmergencyDetail.backup.status,
        recoverable: realEmergencyDetail.recoverable
      }
    };
  });

  await page.locator("#runtimeErrorTitle").focus();
  await page.keyboard.press("Shift+Tab");
  const trappedAtEnd = await page.evaluate(() => document.activeElement?.id === "restartAfterRuntimeError");
  if (!trappedAtEnd) result.failures.push("runtime recovery does not wrap backward focus to its final action");
  await page.keyboard.press("Escape");
  const remainsOpen = await page.evaluate(() =>
    !document.getElementById("runtimeErrorOverlay").classList.contains("hidden") &&
    document.activeElement?.id === "runtimeErrorTitle"
  );
  if (!remainsOpen) result.failures.push("runtime recovery can be dismissed without choosing a recovery action");
  result.ok = result.failures.length === 0;

  await browser.close();
  const expectedConsoleErrors = browserErrors.filter(message => !message.includes("Controlled"));
  const ok = expectedConsoleErrors.length === 0 && result.ok;
  console.log(JSON.stringify({ ok, result, errors: expectedConsoleErrors }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
