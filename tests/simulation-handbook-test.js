const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const expectedSections = [
  "welcome",
  "quick-start",
  "understanding-the-simulation",
  "your-role",
  "user-interface-guide",
  "reading-employees",
  "conversations",
  "projects",
  "hiring",
  "office-culture",
  "leadership",
  "winning",
  "beginner-tips",
  "advanced-systems",
  "faq"
];

const requiredUiTopics = [
  "Company Time",
  "Cash",
  "Board Confidence",
  "Company Risk",
  "Live Office",
  "CEO Communications",
  "People",
  "Reports",
  "Valuation Trend",
  "Department Briefings",
  "Operational Dashboard",
  "Project Portfolio",
  "Workforce and Financial Pressure",
  "Internal Reports",
  "People and Culture",
  "Company Story",
  "Organizational Dynamics",
  "Story Threads",
  "Lessons",
  "Company History",
  "Weekly Report",
  "Sound",
  "Restart Company"
];

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

async function launchBrowser() {
  for (const executablePath of chromeCandidates) {
    if (fs.existsSync(executablePath)) return chromium.launch({ headless: true, executablePath });
  }
  return chromium.launch({ headless: true });
}

async function main() {
  const errors = [];
  const checks = {};
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on("pageerror", error => errors.push(`PAGE: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`CONSOLE: ${message.text()}`);
  });

  const fileUrl = `file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
  await page.click("#newCompany");
  await page.waitForTimeout(250);
  await page.click("#settingsBtn");
  await page.click("#guideBtn");
  await page.waitForTimeout(120);

  checks.title = (await page.locator("#handbookTitle").textContent())?.trim();
  checks.buttonTitle = (await page.locator("#guideBtn").textContent())?.trim();
  checks.dialogSemantics = await page.locator("#guideModal").evaluate(modal => ({
    role: modal.getAttribute("role"),
    modal: modal.getAttribute("aria-modal"),
    labelledBy: modal.getAttribute("aria-labelledby"),
    describedBy: modal.getAttribute("aria-describedby")
  }));
  checks.sectionIds = await page.locator(".handbook-section").evaluateAll(nodes => nodes.map(node => node.dataset.handbookSection));
  checks.tocCount = await page.locator(".handbook-toc-button").count();
  checks.defaultOpen = await page.locator("#handbook-section-welcome[open]").count();

  await page.click('[data-handbook-target="quick-start"].handbook-toc-button');
  checks.quickStartOpen = await page.locator("#handbook-section-quick-start[open]").count();
  checks.onlyOneOpenAfterToc = await page.locator(".handbook-section[open]").count();
  checks.quickStartAligned = await page.evaluate(() => {
    const reader = document.getElementById("handbookReader").getBoundingClientRect();
    const summary = document.querySelector("#handbook-section-quick-start > summary").getBoundingClientRect();
    return summary.top >= reader.top - 1 && summary.top <= reader.top + 18;
  });
  checks.previousLabel = (await page.locator("#handbookPrevious").innerText()).trim();
  checks.nextLabel = (await page.locator("#handbookNext").innerText()).trim();

  await page.click("#handbookNext");
  checks.nextOpenedUnderstanding = await page.locator("#handbook-section-understanding-the-simulation[open]").count();
  await page.click("#handbookPrevious");
  checks.previousReturnedQuickStart = await page.locator("#handbook-section-quick-start[open]").count();

  await page.fill("#handbookSearch", "onboarding");
  await page.waitForTimeout(80);
  checks.searchResultCount = await page.locator("#handbookSearchResults .handbook-search-result").count();
  checks.searchHasHiringPipeline = await page.locator('#handbookSearchResults [data-handbook-topic="hiring-pipeline"]').count();
  await page.click('#handbookSearchResults [data-handbook-topic="hiring-pipeline"]');
  checks.searchOpenedHiring = await page.locator("#handbook-section-hiring[open]").count();
  checks.searchTopicExists = await page.locator("#handbook-topic-hiring-pipeline").count();
  checks.searchTopicAligned = await page.evaluate(() => {
    const reader = document.getElementById("handbookReader").getBoundingClientRect();
    const topic = document.getElementById("handbook-topic-hiring-pipeline").getBoundingClientRect();
    return topic.top >= reader.top - 1 && topic.top <= reader.top + 18;
  });

  checks.linkAudit = await page.evaluate(() => {
    const sectionIds = new Set([...document.querySelectorAll(".handbook-section")].map(node => node.dataset.handbookSection));
    const topics = new Map([...document.querySelectorAll(".handbook-topic")].map(node => [node.dataset.handbookTopicId, node.closest(".handbook-section")?.dataset.handbookSection]));
    const links = [...document.querySelectorAll(".handbook-related-link")];
    const broken = links.filter(link => {
      const sectionId = link.dataset.handbookTarget;
      const topicId = link.dataset.handbookTopic;
      return !sectionIds.has(sectionId) || (topicId && topics.get(topicId) !== sectionId);
    }).map(link => `${link.dataset.handbookTarget}:${link.dataset.handbookTopic}`);
    return { count: links.length, broken };
  });

  checks.contextOpen = await page.evaluate(() => {
    const opened = window.OfficeAquariumHandbook.open("advanced-systems", "learning-and-memory");
    return {
      opened,
      modalVisible: !document.getElementById("guideModal").classList.contains("hidden"),
      sectionOpen: document.getElementById("handbook-section-advanced-systems").open,
      topicExists: !!document.getElementById("handbook-topic-learning-and-memory"),
      sectionCount: window.OfficeAquariumHandbook.sections.length,
      topicCount: window.OfficeAquariumHandbook.topics.length
    };
  });

  checks.focusTrap = await page.evaluate(() => {
    const modal = document.getElementById("guideModal");
    const focusable = [...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(element => element.getClientRects().length > 0);
    const last = focusable[focusable.length - 1];
    last.focus();
    return { firstId: focusable[0]?.id, lastId: last?.id };
  });
  await page.keyboard.press("Tab");
  checks.focusTrap.forwardTarget = await page.evaluate(() => document.activeElement?.id || "");
  await page.keyboard.press("Shift+Tab");
  checks.focusTrap.backwardTarget = await page.evaluate(() => document.activeElement?.id || "");

  checks.requiredUiCoverage = await page.evaluate(requiredTopics => {
    const text = document.getElementById("handbookSectionList")?.textContent || "";
    return requiredTopics.filter(topic => !text.includes(topic));
  }, requiredUiTopics);

  await page.locator("#handbookReader").evaluate(element => {
    element.scrollTop = element.scrollHeight;
  });
  await page.click("#handbookTop");
  await page.waitForTimeout(450);
  checks.returnedToTop = await page.locator("#handbookReader").evaluate(element => element.scrollTop <= 4);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.OfficeAquariumHandbook.open("user-interface-guide", "mobile-and-settings"));
  await page.waitForTimeout(100);
  checks.mobileLayout = await page.evaluate(() => {
    const card = document.querySelector(".handbook-card");
    const reader = document.getElementById("handbookReader");
    const rect = card.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      cardFits: rect.left >= 0 && rect.right <= window.innerWidth + 1 && rect.top >= 0 && rect.bottom <= window.innerHeight + 1,
      noHorizontalReaderOverflow: reader.scrollWidth <= reader.clientWidth + 1,
      readerScrollable: reader.scrollHeight > reader.clientHeight,
      tocHorizontal: getComputedStyle(document.querySelector(".handbook-toc")).overflowX === "auto"
    };
  });

  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  checks.escapeClosed = await page.locator("#guideModal.hidden").count();
  await browser.close();

  const ok =
    errors.length === 0 &&
    checks.title === "Simulation Handbook" &&
    checks.buttonTitle === "Simulation Handbook" &&
    checks.dialogSemantics.role === "dialog" &&
    checks.dialogSemantics.modal === "true" &&
    checks.dialogSemantics.labelledBy === "handbookTitle" &&
    checks.dialogSemantics.describedBy === "handbookIntro" &&
    JSON.stringify(checks.sectionIds) === JSON.stringify(expectedSections) &&
    checks.tocCount === expectedSections.length &&
    checks.defaultOpen === 1 &&
    checks.quickStartOpen === 1 &&
    checks.onlyOneOpenAfterToc === 1 &&
    checks.quickStartAligned &&
    checks.previousLabel.includes("Welcome") &&
    checks.nextLabel.includes("Understanding the Simulation") &&
    checks.nextOpenedUnderstanding === 1 &&
    checks.previousReturnedQuickStart === 1 &&
    checks.searchResultCount > 0 &&
    checks.searchHasHiringPipeline === 1 &&
    checks.searchOpenedHiring === 1 &&
    checks.searchTopicExists === 1 &&
    checks.searchTopicAligned &&
    checks.linkAudit.count >= 30 &&
    checks.linkAudit.broken.length === 0 &&
    checks.contextOpen.opened &&
    checks.contextOpen.modalVisible &&
    checks.contextOpen.sectionOpen &&
    checks.contextOpen.topicExists &&
    checks.contextOpen.sectionCount === expectedSections.length &&
    checks.contextOpen.topicCount >= 40 &&
    checks.focusTrap.forwardTarget === checks.focusTrap.firstId &&
    checks.focusTrap.backwardTarget === checks.focusTrap.lastId &&
    checks.requiredUiCoverage.length === 0 &&
    checks.returnedToTop &&
    checks.mobileLayout.cardFits &&
    checks.mobileLayout.noHorizontalReaderOverflow &&
    checks.mobileLayout.readerScrollable &&
    checks.mobileLayout.tocHorizontal &&
    checks.escapeClosed === 1;

  console.log(JSON.stringify({ ok, checks, errors }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
