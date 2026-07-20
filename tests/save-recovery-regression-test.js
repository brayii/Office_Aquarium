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
  const errors = [];
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on("pageerror", error => errors.push(`PAGE: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`CONSOLE: ${message.text()}`);
  });
  const fileUrl = `file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    startNewCompany();
  });

  const result = await page.evaluate(() => {
    const failures = [];
    const checks = {};
    const testKeys = [];
    const check = (condition, message) => {
      checks[message] = !!condition;
      if (!condition) failures.push(message);
    };
    const activeCount = () => employees.filter(employee => employee.active).length;
    const addEmployeesTo = target => {
      const roles = allRecruitableRoles();
      const oldValidationMode = validationMode;
      validationMode = true;
      try {
        while (activeCount() < target) {
          const role = roles[(activeCount() - FOUNDING_ROLES.length) % roles.length];
          const employee = createRecruitingHireEmployee({
            id: `release-save-${activeCount()}`,
            role,
            department: roleDepartment(role),
            backfill: false
          });
          if (!employee) throw new Error(`Unable to create ${role}`);
        }
      } finally {
        validationMode = oldValidationMode;
      }
    };
    const normalizedPayload = repository => {
      const raw = repository.serialize(company, employees, "fixed-measurement-time");
      return { raw, parsed: repository.parseRaw(raw) };
    };

    ensureBibleSystems();
    const newGameAnalysis = saveRepository.analyze(company, employees);
    check(
      newGameAnalysis.serializedCharacters < OFFICE_AQUARIUM_CONSTANTS.storage.softWarningCharacters,
      "new-game save starts below the storage warning"
    );

    addEmployeesTo(20);
    const twentyAnalysis = saveRepository.analyze(company, employees);
    check(activeCount() === 20, "20-person company was created");
    check(
      twentyAnalysis.serializedCharacters < OFFICE_AQUARIUM_CONSTANTS.storage.softWarningCharacters,
      "20-person save stays below the storage warning"
    );

    addEmployeesTo(40);
    company.day = OFFICE_AQUARIUM_CONSTANTS.time.daysPerYear;
    ensureBibleSystems();
    const fortyAnalysis = saveRepository.analyze(company, employees);
    const fortyPayload = normalizedPayload(saveRepository);
    check(activeCount() === 40, "40-person company was created");
    check(
      fortyAnalysis.serializedCharacters <= OFFICE_AQUARIUM_CONSTANTS.storage.compactionThresholdCharacters,
      "40-person Day-365 save stays within 70% of the supported budget"
    );
    check(
      fortyPayload.parsed.company.day === OFFICE_AQUARIUM_CONSTANTS.time.daysPerYear &&
        fortyPayload.parsed.employees.filter(employee => employee.active).length === 40,
      "40-person compact save round-trips"
    );

    addEmployeesTo(60);
    const sixtyAnalysis = saveRepository.analyze(company, employees);
    const sixtyPayload = normalizedPayload(saveRepository);
    check(activeCount() === 60, "60-person company was created");
    check(
      sixtyAnalysis.serializedCharacters < OFFICE_AQUARIUM_CONSTANTS.storage.hardLimitCharacters,
      "60-person save remains below the hard limit"
    );
    check(
      OFFICE_AQUARIUM_CONSTANTS.storage.hardLimitCharacters - sixtyAnalysis.serializedCharacters >=
        OFFICE_AQUARIUM_CONSTANTS.storage.reservedMarginCharacters,
      "60-person save retains the reserved storage margin"
    );
    check(
      sixtyPayload.parsed.employees.filter(employee => employee.active).length === 60,
      "60-person compact save remains loadable"
    );
    check(
      sixtyPayload.parsed.company.randomState === company.randomState &&
        sixtyPayload.parsed.company.nextRuntimeId === company.nextRuntimeId,
      "deterministic state survives compaction"
    );
    check(
      sixtyPayload.raw.startsWith(OFFICE_AQUARIUM_CONSTANTS.storage.compressedEnvelopePrefix) ||
        sixtyPayload.raw.startsWith(OFFICE_AQUARIUM_CONSTANTS.storage.plainEnvelopePrefix),
      "save uses a supported versioned envelope"
    );

    const recoveryKey = `${SAVE_KEY}-release-recovery-test`;
    const recoveryRepository = new SaveRepository(recoveryKey, SAVE_VERSION);
    testKeys.push(recoveryKey, recoveryRepository.backupKey, recoveryRepository.candidateKey);
    company.cash = 17;
    recoveryRepository.write(company, employees);
    const firstRaw = recoveryRepository.exportRaw();
    company.cash = 19;
    recoveryRepository.write(company, employees);
    check(
      recoveryRepository.exportRaw("backup") === firstRaw,
      "second save preserves the previous current save as last-known-good"
    );

    localStorage.setItem(recoveryKey, "{damaged-current");
    let detail = recoveryRepository.readDetailed();
    check(
      detail.status === "corrupt-current-backup-available" && detail.recoverable,
      "corrupt current save is distinguished from a valid backup"
    );
    const restored = recoveryRepository.restoreBackup();
    check(
      restored.company.cash === 17 && recoveryRepository.readDetailed().status === "valid-save",
      "valid backup restores successfully"
    );

    localStorage.removeItem(recoveryKey);
    detail = recoveryRepository.readDetailed();
    check(detail.status === "backup-only" && detail.recoverable, "missing current save exposes the valid backup");

    localStorage.setItem(recoveryKey, "{damaged-current");
    localStorage.setItem(recoveryRepository.backupKey, "{damaged-backup");
    detail = recoveryRepository.readDetailed();
    check(
      detail.status === "corrupt-no-backup" && !detail.recoverable,
      "corrupt current and backup are reported without a false recovery path"
    );

    const quotaKey = `${SAVE_KEY}-release-quota-test`;
    const quotaRepository = new SaveRepository(quotaKey, SAVE_VERSION);
    testKeys.push(quotaKey, quotaRepository.backupKey, quotaRepository.candidateKey);
    quotaRepository.write(company, employees);
    const quotaPreviousRaw = quotaRepository.exportRaw();
    const nativeSetItem = Storage.prototype.setItem;
    let quotaCode = null;
    Storage.prototype.setItem = function(key, value) {
      if (key === quotaRepository.candidateKey) {
        throw new DOMException("Controlled storage quota failure", "QuotaExceededError");
      }
      return nativeSetItem.call(this, key, value);
    };
    try {
      quotaRepository.write({ ...company, cash: 25 }, employees);
    } catch (error) {
      quotaCode = error.code;
    } finally {
      Storage.prototype.setItem = nativeSetItem;
    }
    check(quotaCode === "QUOTA_EXCEEDED", "quota failure is classified");
    check(quotaRepository.exportRaw() === quotaPreviousRaw, "quota failure preserves the previous valid save");
    check(!localStorage.getItem(quotaRepository.candidateKey), "failed candidate save is cleaned up");

    const unavailableKey = `${SAVE_KEY}-release-storage-unavailable-test`;
    const unavailableRepository = new SaveRepository(unavailableKey, SAVE_VERSION);
    const nativeGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
      if (key === unavailableRepository.key || key === unavailableRepository.backupKey) {
        throw new DOMException("Controlled storage read failure", "SecurityError");
      }
      return nativeGetItem.call(this, key);
    };
    let unavailableDetail;
    try {
      unavailableDetail = unavailableRepository.readDetailed();
    } finally {
      Storage.prototype.getItem = nativeGetItem;
    }
    check(unavailableDetail.status === "storage-unavailable", "unavailable local storage is distinguished from no save");

    const originalDownload = downloadLocalText;
    let exported = null;
    downloadLocalText = (filename, text, mime) => {
      exported = { filename, text, mime };
      return true;
    };
    const mainCurrentRaw = saveRepository.serialize(company, employees, "migration-test");
    const migrationData = saveRepository.parseRaw(mainCurrentRaw);
    migrationData.saveVersion = SAVE_VERSION - 1;
    localStorage.setItem(SAVE_KEY, JSON.stringify(migrationData));
    check(
      saveRepository.readDetailed().status === "migration-required",
      "older compatible save is identified as requiring migration"
    );
    check(exportSaveSlot("current") && exported?.text, "raw save export works");
    check(
      exported?.filename.endsWith(`.${OFFICE_AQUARIUM_CONSTANTS.release.saveExportExtension}`),
      "raw save export uses the release save extension"
    );
    company.cash += .1;
    saveGame();
    exported = null;
    check(exportSaveSlot("backup") && exported?.text, "last-known-good backup export works");
    check(
      exported?.filename.includes("backup-save"),
      "backup export is clearly named"
    );
    downloadLocalText = originalDownload;

    const originalEnsureBibleSystems = ensureBibleSystems;
    ensureBibleSystems = () => {
      throw new Error("Controlled migration failure");
    };
    const migrationLoaded = loadGame();
    ensureBibleSystems = originalEnsureBibleSystems;
    updateStartupScreen();
    check(!migrationLoaded && lastLoadFailure?.code === "MIGRATION_FAILED", "migration failure is not treated as no save");
    check(
      !document.getElementById("saveRecoveryPanel").classList.contains("hidden") &&
        document.getElementById("continueCompany").disabled,
      "migration failure opens recovery UI and disables unsafe continue"
    );

    localStorage.setItem(SAVE_KEY, mainCurrentRaw);
    lastLoadFailure = null;
    check(loadGame(), "valid compact save loads after migration failure");
    const expectedNewGameEmployees = FOUNDING_ROLES.length;
    startNewCompany();
    const resetDetail = saveRepository.readDetailed();
    check(
      company.day === 0 &&
        employees.filter(employee => employee.active).length === expectedNewGameEmployees &&
        resetDetail.status === "valid-save" &&
        resetDetail.backup.status === "absent",
      "new game replaces prior state without retaining a stale backup"
    );

    const thresholds = OFFICE_AQUARIUM_CONSTANTS.storage;
    check(saveRepository.sizeStatus(thresholds.softWarningCharacters - 1) === "healthy", "healthy save threshold works");
    check(saveRepository.sizeStatus(thresholds.softWarningCharacters) === "warning", "warning save threshold works");
    check(saveRepository.sizeStatus(thresholds.compactionThresholdCharacters) === "compaction", "compaction threshold works");
    check(saveRepository.sizeStatus(thresholds.hardLimitCharacters + 1) === "hard-limit", "hard save limit works");

    testKeys.forEach(key => localStorage.removeItem(key));
    return {
      ok: failures.length === 0,
      failures,
      checks,
      measurements: {
        newGame: newGameAnalysis,
        twentyPerson: twentyAnalysis,
        fortyPersonDay365: {
          ...fortyAnalysis,
          companySections: fortyAnalysis.companySections.slice(0, 10)
        },
        sixtyPerson: {
          ...sixtyAnalysis,
          companySections: sixtyAnalysis.companySections.slice(0, 10)
        }
      }
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
