const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];
const viewports = [
  { width: 320, height: 720 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 }
];

async function launchBrowser() {
  const executablePath = chromeCandidates.find(candidate => fs.existsSync(candidate));
  return chromium.launch({ headless: true, executablePath });
}

async function main() {
  const browser = await launchBrowser();
  const failures = [];
  const pageErrors = [];
  const viewportResults = [];
  const fileUrl = `file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`;

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    page.on("pageerror", error => pageErrors.push(`${viewport.width}px PAGE: ${error.message}`));
    page.on("console", message => {
      if (message.type() === "error") pageErrors.push(`${viewport.width}px CONSOLE: ${message.text()}`);
    });
    await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.click("#startupGuideBtn");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(40);
    const startupGuideReturn = await page.evaluate(() => ({
      startupVisible: !document.getElementById("startupOverlay").classList.contains("hidden"),
      guideHidden: document.getElementById("guideModal").classList.contains("hidden"),
      focusId: document.activeElement?.id || null
    }));
    if (!startupGuideReturn.startupVisible || !startupGuideReturn.guideHidden || startupGuideReturn.focusId !== "startupGuideBtn") {
      failures.push(`${viewport.width}px Handbook Escape does not return to first-launch startup`);
    }
    await page.evaluate(() => {
      startNewCompany();
      company.paused = true;
      employees[0].beliefs = {
        launchReadiness: { estimate: 61, confidence: 55, lastUpdatedDay: company.day, source: "team meeting" },
        cashRisk: { estimate: 37, confidence: 30, lastUpdatedDay: company.day, source: "office discussion" },
        qualityRisk: { estimate: 48, confidence: 82, lastUpdatedDay: company.day, source: "personal testing" }
      };
      render();
    });

    const navigation = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const buttons = [...document.querySelectorAll(".mobile-tabs button")].map(button => {
        const rect = button.getBoundingClientRect();
        return {
          text: button.textContent.trim(),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          visible: getComputedStyle(button).display !== "none" && rect.width > 0 && rect.height > 0,
          withinViewport: rect.left >= -1 && rect.right <= viewportWidth + 1
        };
      });
      return {
        buttons,
        horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1
      };
    });
    if (navigation.buttons.length !== 5) failures.push(`${viewport.width}px does not expose all five primary destinations`);
    for (const button of navigation.buttons) {
      if (!button.visible || !button.withinViewport) failures.push(`${viewport.width}px hides ${button.text}`);
      if (button.height < 44) failures.push(`${viewport.width}px ${button.text} target is under 44px`);
    }
    if (navigation.horizontalOverflow) failures.push(`${viewport.width}px page has horizontal overflow`);

    const destinations = ["office", "employees", "inbox", "company", "newspaper"];
    const destinationResults = {};
    for (const destination of destinations) {
      await page.click(`.mobile-tabs button[data-tab="${destination}"]`);
      destinationResults[destination] = await page.evaluate(destinationName => {
        const target = document.querySelector(`[data-section="${destinationName}"]`);
        return !!target && getComputedStyle(target).display !== "none";
      }, destination);
      if (!destinationResults[destination]) failures.push(`${viewport.width}px ${destination} destination does not open`);
    }

    await page.click('.mobile-tabs button[data-tab="employees"]');
    const employeeButton = page.locator("#employeeList .employee-card").first();
    await employeeButton.focus();
    await employeeButton.press("Enter");
    await page.waitForTimeout(40);
    const employeeDialog = await page.evaluate(() => ({
      open: !document.getElementById("employeeModal").classList.contains("hidden"),
      role: document.getElementById("employeeModal").getAttribute("role"),
      modal: document.getElementById("employeeModal").getAttribute("aria-modal"),
      focusId: document.activeElement?.id || null,
      text: document.getElementById("detailBody").innerText
    }));
    if (!employeeDialog.open || employeeDialog.role !== "dialog" || employeeDialog.modal !== "true") {
      failures.push(`${viewport.width}px employee profile lacks dialog semantics`);
    }
    if (employeeDialog.focusId !== "detailName") failures.push(`${viewport.width}px employee dialog does not receive focus`);
    if (!employeeDialog.text.includes("Launch readiness") || !employeeDialog.text.includes("Moderate confidence")) {
      failures.push(`${viewport.width}px employee beliefs are not explained in player language`);
    }
    if (/launchReadiness|cashRisk|qualityRisk/.test(employeeDialog.text)) {
      failures.push(`${viewport.width}px employee profile exposes internal belief keys`);
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(40);
    const focusRestored = await page.evaluate(() =>
      document.getElementById("employeeModal").classList.contains("hidden") &&
      document.activeElement?.classList.contains("employee-card")
    );
    if (!focusRestored) failures.push(`${viewport.width}px employee dialog does not restore focus after Escape`);

    const conversationResult = await page.evaluate(() => {
      ensureSocialOrganizationalSystems();
      const conversation = {
        id: "release-accessibility-conversation",
        sourceEventId: null,
        participantIds: [employees[0].id, employees[1].id],
        projectId: company.projects?.[0]?.id || null,
        roomId: "meeting-room",
        triggerType: "work-coordination",
        category: "project coordination",
        facts: { workTitle: "Release planning" },
        exchanges: [
          { speakerId: employees[0].id, text: "Can we review the next dependency?" },
          { speakerId: employees[1].id, text: "Yes. I will bring the latest project notes." }
        ]
      };
      company.socialConversationState.history.unshift(conversation);
      document.querySelector('.mobile-tabs button[data-tab="employees"]').focus();
      showSocialConversationDetails(conversation.id);
      return new Promise(resolve => setTimeout(() => resolve({
        open: !document.getElementById("conversationModal").classList.contains("hidden"),
        role: document.getElementById("conversationModal").getAttribute("role"),
        focusId: document.activeElement?.id || null,
        transcript: document.getElementById("conversationDetailBody").innerText
      }), 20));
    });
    if (!conversationResult.open || conversationResult.role !== "dialog" || conversationResult.focusId !== "conversationTitle") {
      failures.push(`${viewport.width}px conversation details lack accessible dialog behavior`);
    }
    if (!conversationResult.transcript.includes("Can we review the next dependency?")) {
      failures.push(`${viewport.width}px conversation transcript is not readable`);
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(30);
    const conversationFocusRestored = await page.evaluate(() =>
      document.getElementById("conversationModal").classList.contains("hidden") &&
      document.activeElement?.dataset?.tab === "employees"
    );
    if (!conversationFocusRestored) failures.push(`${viewport.width}px conversation dialog does not restore focus`);

    const progressiveDisclosure = await page.evaluate(() => ({
      portfolioRows: document.querySelectorAll("#projectPortfolio .health-summary-row").length,
      workforceRows: document.querySelectorAll("#workforcePressure .health-summary-row").length,
      reportsCollapsed: document.getElementById("internalReportsWrap").classList.contains("collapsed"),
      historyCollapsed: document.getElementById("companyHistoryWrap").classList.contains("collapsed"),
      developerPanelHidden: document.getElementById("developerToolsPanel")?.classList.contains("hidden") ?? true
    }));
    if (!progressiveDisclosure.portfolioRows || !progressiveDisclosure.workforceRows) {
      failures.push(`${viewport.width}px operating reports are missing labeled summary rows`);
    }
    if (!progressiveDisclosure.reportsCollapsed || !progressiveDisclosure.historyCollapsed) {
      failures.push(`${viewport.width}px secondary report detail is not progressively disclosed`);
    }
    if (!progressiveDisclosure.developerPanelHidden) failures.push(`${viewport.width}px exposes developer tools in normal play`);

    viewportResults.push({
      viewport,
      navigation,
      destinations: destinationResults,
      employeeDialog: {
        role: employeeDialog.role,
        focusId: employeeDialog.focusId,
        playerLanguage: employeeDialog.text.includes("Launch readiness")
      },
      progressiveDisclosure
    });
    await page.close();
  }

  await browser.close();
  const ok = failures.length === 0 && pageErrors.length === 0;
  console.log(JSON.stringify({ ok, failures, pageErrors, viewportResults }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
