const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { chromium } = require("playwright");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

function releaseMetadata() {
  return JSON.parse(spawnSync(
    process.execPath,
    [path.resolve("tools", "release-metadata.js"), "json"],
    { encoding: "utf8" }
  ).stdout);
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function recursiveFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? recursiveFiles(absolute) : [absolute];
  });
}

function contentType(file) {
  return {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".md": "text/plain",
    ".mp3": "audio/mpeg",
    ".txt": "text/plain"
  }[path.extname(file).toLowerCase()] || "application/octet-stream";
}

function createItchLikeServer(root) {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent((request.url || "/").split("?")[0]);
    if (pathname === "/sandbox") {
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(`<!doctype html><html><body style="margin:0"><iframe id="game" sandbox="allow-scripts allow-pointer-lock allow-downloads" src="/index.html" style="border:0;width:1200px;height:800px"></iframe></body></html>`);
      return;
    }
    if (pathname === "/favicon.ico") {
      response.writeHead(204);
      response.end();
      return;
    }
    const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = path.resolve(root, requested);
    if (!file.startsWith(path.resolve(root)) || !fs.existsSync(file)) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": contentType(file) });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve => {
    server.listen(0, "127.0.0.1", () => resolve({
      server,
      url: `http://127.0.0.1:${server.address().port}`
    }));
  });
}

async function runItchFrameStartupSmoke(browser, extractionRoot) {
  const { server, url } = await createItchLikeServer(extractionRoot);
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error" && !/favicon/i.test(message.text())) errors.push(message.text());
    });
    page.on("requestfailed", request => {
      if (!/favicon/i.test(request.url())) errors.push(`${request.url()} - ${request.failure()?.errorText || "failed"}`);
    });
    await page.goto(`${url}/sandbox`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    const frame = page.frames().find(candidate => candidate.url().includes("/index.html"));
    if (!frame) return { ok: false, errors: errors.concat("itch frame did not load index.html") };
    const before = await frame.evaluate(() => ({
      summary: document.getElementById("saveSummary")?.textContent || "",
      newCompanyDisabled: document.getElementById("newCompany")?.disabled ?? true,
      continueDisabled: document.getElementById("continueCompany")?.disabled ?? false
    }));
    await frame.click("#newCompany");
    await page.waitForTimeout(500);
    const after = await frame.evaluate(() => ({
      startupHidden: document.getElementById("startupOverlay")?.classList.contains("hidden") || false,
      heading: document.querySelector("h1")?.textContent || "",
      employeeCount: Array.isArray(employees) ? employees.filter(employee => employee.active).length : 0,
      soundGestureSeen: soundController?.userGestureSeen === true
    }));
    await page.close();
    return {
      ok: before.summary !== "Checking for a saved company..." &&
        !before.newCompanyDisabled &&
        before.continueDisabled &&
        after.startupHidden &&
        after.heading === "Office Aquarium" &&
        after.employeeCount === 8 &&
        after.soundGestureSeen &&
        errors.length === 0,
      before,
      after,
      errors
    };
  } finally {
    server.close();
  }
}

async function main() {
  const release = releaseMetadata();
  const archive = path.resolve("dist", release.webArchiveName);
  const hashFile = `${archive}.sha256`;
  const failures = [];
  const check = (condition, message) => {
    if (!condition) failures.push(message);
  };
  check(fs.existsSync(archive), "versioned web archive exists");
  check(fs.existsSync(hashFile), "web archive hash sidecar exists");
  if (failures.length) throw new Error(failures.join("; "));

  const expectedArchiveHash = fs.readFileSync(hashFile, "utf8").trim().split(/\s+/)[0];
  check(sha256(archive) === expectedArchiveHash, "web archive matches its SHA-256 sidecar");

  const extractionRoot = fs.mkdtempSync(path.join(os.tmpdir(), "office-aquarium-web-"));
  try {
    const extraction = spawnSync(
      "tar",
      ["-xf", archive, "-C", extractionRoot],
      { encoding: "utf8" }
    );
    if (extraction.status !== 0) {
      throw new Error(`Web archive did not extract cleanly: ${extraction.stderr || extraction.stdout}`);
    }

    const expectedTopLevel = new Set([
      "assets",
      "ASSET_ATTRIBUTION.md",
      "index.html",
      "LICENSE",
      "PLAYER_GUIDE.md",
      "RELEASE_NOTES.md",
      "release-manifest.json",
      "SHA256SUMS.txt",
      "THIRD_PARTY_NOTICES.md"
    ]);
    const topLevel = fs.readdirSync(extractionRoot).sort();
    check(topLevel.every(name => expectedTopLevel.has(name)), "web package contains only approved top-level entries");
    check([...expectedTopLevel].every(name => topLevel.includes(name)), "web package includes every required release entry");

    const allRelativeFiles = recursiveFiles(extractionRoot).map(file => path.relative(extractionRoot, file).replace(/\\/g, "/"));
    const forbidden = allRelativeFiles.filter(file =>
      /(^|\/)(tests|node_modules|misc|\.git|dist)(\/|$)/i.test(file) ||
      /CODEX_|IMPLEMENTATION_PLAN|WORKLOG|READINESS_AUDIT/i.test(file)
    );
    check(forbidden.length === 0, `web package excludes private and developer files: ${forbidden.join(", ")}`);

    const manifest = JSON.parse(fs.readFileSync(path.join(extractionRoot, "release-manifest.json"), "utf8"));
    const packagedIndex = fs.readFileSync(path.join(extractionRoot, "index.html"), "utf8");
    check(manifest.version === release.applicationVersion, "package manifest uses the release version");
    check(manifest.packageType === "itch-web", "package manifest identifies the web package");
    check(manifest.offline === true && manifest.telemetry === false, "package manifest records offline privacy behavior");
    check(!/<script[^>]+src=/i.test(packagedIndex), "itch web package inlines JavaScript into index.html");
    check(!/<link[^>]+href="src\//i.test(packagedIndex), "itch web package inlines source stylesheets into index.html");
    const manifestFailures = manifest.files.filter(entry => {
      const file = path.join(extractionRoot, ...entry.path.split("/"));
      return !fs.existsSync(file) || fs.statSync(file).size !== entry.bytes || sha256(file) !== entry.sha256;
    });
    check(manifestFailures.length === 0, "every staged file matches the package manifest");

    const executablePath = chromeCandidates.find(candidate => fs.existsSync(candidate));
    const browser = await chromium.launch({ headless: true, executablePath });
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    const browserErrors = [];
    const failedRequests = [];
    page.on("pageerror", error => browserErrors.push(`PAGE: ${error.message}`));
    page.on("console", message => {
      if (message.type() === "error") browserErrors.push(`CONSOLE: ${message.text()}`);
    });
    page.on("requestfailed", request => failedRequests.push(`${request.url()} - ${request.failure()?.errorText || "failed"}`));
    const fileUrl = `file:///${path.join(extractionRoot, "index.html").replace(/\\/g, "/")}`;
    await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.click("#newCompany");
    await page.waitForTimeout(200);
    const initial = await page.evaluate(() => {
      company.paused = true;
      company.day = 12;
      company.cash = 22.5;
      const saved = saveGame();
      return {
        heading: document.querySelector("h1")?.textContent,
        version: document.querySelector("[data-release-version]")?.textContent,
        employees: employees.filter(employee => employee.active).length,
        saved,
        sound: document.getElementById("soundMode").value,
        developerHidden: document.getElementById("developerToolsPanel")?.classList.contains("hidden") ?? true
      };
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    const continueEnabled = await page.locator("#continueCompany").isEnabled();
    await page.click("#continueCompany");
    await page.waitForTimeout(250);
    const resumed = await page.evaluate(() => ({
      day: company.day,
      cash: company.cash,
      startupHidden: document.getElementById("startupOverlay").classList.contains("hidden"),
      saveVersion: SAVE_VERSION
    }));
    await page.click("#settingsBtn");
    await page.click("#guideBtn");
    const handbookVisible = await page.locator("#guideModal:not(.hidden)").count();
    await page.click("#closeGuide");
    await page.click("#settingsBtn");
    await page.click("#resetBtn");
    const restartPromptVisible = await page.locator("#confirmResetOverlay:not(.hidden)").count();
    await page.click("#cancelReset");
    const restartCanceled = await page.locator("#confirmResetOverlay.hidden").count();

    const packagedSystems = await page.evaluate(() => {
      company.paused = true;
      const foundingHeadcount = employees.filter(employee => employee.active).length;
      const recruitingItem = startRecruiting("Software Engineer", "specialist", "software", {
        source: "packaged-web-smoke"
      });
      const candidate = {
        skill: 74,
        cultureFit: 72,
        experience: 68,
        leadership: 55,
        salaryPremium: 0,
        strengths: ["controlled package validation"],
        weaknesses: []
      };
      completeRecruitingHire(recruitingItem, candidate);
      const hire = employees.find(employee =>
        employee.active &&
        employee.joinedDay === company.day &&
        employee.role === "Software Engineer" &&
        employee.id >= foundingHeadcount
      );
      const onboardingStarted = hire?.performanceManagement?.stage === "onboarding";
      if (hire?.onboarding) {
        company.day = hire.onboarding.startDay + hire.onboarding.duration;
        completeDueOnboarding();
      }

      recordWeeklyEvent("The package validation company completed a release milestone.", "product", 4);
      publishWeeklyNewspaper();
      queueInformationalCommunication({
        type: "Executive Update",
        priority: "FYI",
        sender: { name: "Release Operations", role: "Operations" },
        subject: "Package validation update",
        message: "The packaged simulation completed its clean launch checks."
      }, {
        id: "packaged-web-smoke-update",
        category: "operations",
        title: "Package validation update"
      });
      render();

      const activeProject = (company.projects || [])[0];
      return {
        foundingHeadcount,
        hiringPipelineCreated: Boolean(recruitingItem),
        onboardingStarted,
        onboardingCompleted: hire?.performanceManagement?.stage === "none" &&
          hire?.onboarding?.productivity === 100,
        finalHeadcount: employees.filter(employee => employee.active).length,
        activeProject: Boolean(activeProject),
        projectRendered: document.getElementById("projectPortfolio")?.innerText.includes(activeProject?.title || ""),
        reportsRendered: Boolean(document.getElementById("internalReports")?.innerText.trim()),
        newspaperPublished: (company.newspapers || []).length > 0 &&
          !document.getElementById("newspaperArchive")?.innerText.includes("No issue yet"),
        inboxQueued: (company.escalationQueue || []).some(event => event.id === "packaged-web-smoke-update"),
        audioSources: {
          music: musicAudio?.src || "",
          alert: messageAudio?.src || ""
        }
      };
    });

    await page.locator('#commInboxList .ceo-mail-item.openable', { hasText: "Package validation update" }).click();
    const openedInboxMessage = await page.evaluate(() =>
      (company.pendingCommunication?.subject || company.pendingEvent?.title) === "Package validation update" &&
      !document.getElementById("memoContainer").classList.contains("hidden") &&
      document.getElementById("applyDecision").textContent === "File Message"
    );
    await page.click("#applyDecision");
    await page.click("#commArchiveTab");
    const archivedMessageVisible = await page.locator("#memoArchiveList .archive-item").count();
    await page.locator("#memoArchiveList .archive-item").first().click();
    const archivedMessageDetail = await page.evaluate(() =>
      document.getElementById("memoArchiveDetail")?.innerText.includes("Package validation update") &&
      document.getElementById("memoArchiveDetail")?.innerText.includes("Filed after review")
    );

    const destinationSmoke = await page.evaluate(() => {
      const visible = element => Boolean(element) && getComputedStyle(element).display !== "none";
      officeSystems.ui.switchTab("company");
      const companyVisible = visible(document.querySelector('[data-section="company"]'));
      const reportsAvailable = Boolean(document.getElementById("internalReports")?.innerText.trim());
      officeSystems.ui.switchTab("newspaper");
      const newspaperVisible = visible(document.querySelector('[data-section="newspaper"]'));
      const newspaperReadable = Boolean(document.getElementById("newspaperArchive")?.innerText.trim());
      officeSystems.ui.switchTab("office");
      return { companyVisible, reportsAvailable, newspaperVisible, newspaperReadable };
    });

    const recoveryUi = await page.evaluate(() => {
      showRuntimeFailure({
        phase: "dailyClose:financials",
        message: "Controlled packaged recovery check"
      }, { ok: true });
      const runtimeVisible = !document.getElementById("runtimeErrorOverlay").classList.contains("hidden");
      const runtimeStage = document.getElementById("runtimeErrorStage").textContent;
      document.getElementById("runtimeErrorOverlay").classList.add("hidden");
      endGame("Controlled packaged loss-flow check.", "ceo-fired", "PACKAGE_SMOKE");
      const lossVisible = !document.getElementById("gameOverOverlay").classList.contains("hidden");
      document.getElementById("gameOverOverlay").classList.add("hidden");
      company.gameOver = false;
      company.paused = true;
      return { runtimeVisible, runtimeStage, lossVisible };
    });

    const saveRecovery = await page.evaluate(() => {
      localStorage.setItem(SAVE_KEY, "{controlled-corruption");
      returnToTitle();
      updateStartupScreen();
      return {
        panelVisible: !document.getElementById("saveRecoveryPanel").classList.contains("hidden"),
        state: saveRepository.readDetailed().status,
        recoverable: saveRepository.readDetailed().recoverable
      };
    });
    const backupRestored = await page.evaluate(() => restoreBackupCompany());
    const restoredCompanyVisible = await page.evaluate(() =>
      document.getElementById("startupOverlay").classList.contains("hidden") &&
      !company.gameOver
    );
    const itchFrameStartup = await runItchFrameStartupSmoke(browser, extractionRoot);

    check(initial.heading === "Office Aquarium", "clean package launches Office Aquarium");
    check(initial.version === release.displayVersion, "clean package displays the release version");
    check(initial.employees === 8, "clean package starts the founding team");
    check(initial.saved?.ok, "clean package creates a verified local save");
    check(initial.sound === "both", "clean package defaults to music and alerts");
    check(initial.developerHidden, "clean package hides developer tools");
    check(continueEnabled, "clean package exposes Continue for a valid save");
    check(resumed.day === 12 && resumed.cash === 22.5 && resumed.startupHidden, "clean package reloads the saved company");
    check(handbookVisible === 1, "clean package opens the Simulation Handbook");
    check(restartPromptVisible === 1 && restartCanceled === 1, "clean package shows and cancels restart confirmation");
    check(packagedSystems.hiringPipelineCreated, "clean package opens an approved recruiting requisition");
    check(packagedSystems.onboardingStarted, "clean package creates a real onboarding employee");
    check(packagedSystems.onboardingCompleted, "clean package completes onboarding into productive headcount");
    check(packagedSystems.finalHeadcount === packagedSystems.foundingHeadcount + 1, "clean package preserves the completed hire");
    check(packagedSystems.activeProject && packagedSystems.projectRendered, "clean package renders the active project portfolio");
    check(packagedSystems.reportsRendered, "clean package renders company reports");
    check(packagedSystems.newspaperPublished, "clean package publishes and renders the Weekly Report");
    check(packagedSystems.inboxQueued && openedInboxMessage, "clean package opens a queued CEO Inbox message");
    check(archivedMessageVisible > 0 && archivedMessageDetail, "clean package files the read message in Old Messages");
    check(destinationSmoke.companyVisible && destinationSmoke.reportsAvailable, "clean package opens Company reports");
    check(destinationSmoke.newspaperVisible && destinationSmoke.newspaperReadable, "clean package opens the Paper archive");
    check(packagedSystems.audioSources.music.includes("game_music_loop.mp3"), "clean package wires the music asset");
    check(packagedSystems.audioSources.alert.includes("new_message_alert.mp3"), "clean package wires the alert asset");
    check(recoveryUi.runtimeVisible && recoveryUi.runtimeStage.length > 0, "clean package exposes the runtime recovery notice");
    check(recoveryUi.lossVisible, "clean package exposes the company loss flow");
    check(saveRecovery.panelVisible && saveRecovery.recoverable, "clean package distinguishes corrupt current data from a valid backup");
    check(backupRestored && restoredCompanyVisible, "clean package restores the last-known-good backup");
    check(itchFrameStartup.ok, `itch-style iframe startup works: ${JSON.stringify(itchFrameStartup)}`);
    check(browserErrors.length === 0, `clean package has no browser errors: ${browserErrors.join("; ")}`);
    check(failedRequests.length === 0, `clean package has no missing assets: ${failedRequests.join("; ")}`);
    await browser.close();

    const result = {
      ok: failures.length === 0,
      failures,
      archive: {
        name: release.webArchiveName,
        bytes: fs.statSync(archive).size,
        sha256: expectedArchiveHash,
        files: manifest.files.length
      },
      smoke: {
        employees: initial.employees,
        resumedDay: resumed.day,
        handbookVisible: handbookVisible === 1,
        restartConfirmed: restartPromptVisible === 1,
        hiringAndOnboarding: packagedSystems.onboardingCompleted,
        inboxAndArchive: archivedMessageDetail,
        projectReportsAndPaper: packagedSystems.projectRendered && packagedSystems.reportsRendered && packagedSystems.newspaperPublished,
        runtimeAndSaveRecovery: recoveryUi.runtimeVisible && saveRecovery.recoverable && backupRestored,
        itchFrameStartup: itchFrameStartup.ok,
        browserErrors: browserErrors.length,
        failedRequests: failedRequests.length
      }
    };
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } finally {
    fs.rmSync(extractionRoot, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
