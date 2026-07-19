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
    if (fs.existsSync(executablePath)) {
      return chromium.launch({ headless: true, executablePath });
    }
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
  await page.waitForTimeout(300);
  await page.click("#newCompany");
  await page.waitForTimeout(1200);
  await page.click("#employeeList .employee-card");
  await page.waitForTimeout(200);
  const modalOpened = await page.locator("#employeeModal:not(.hidden)").count();
  await page.click("#closeEmployee");
  await page.waitForTimeout(200);
  const modalClosed = await page.locator("#employeeModal.hidden").count();
  await page.click("#settingsBtn");
  await page.waitForTimeout(120);
  await page.click("#guideBtn");
  await page.waitForTimeout(120);
  const guideOpened = await page.locator("#guideModal:not(.hidden)").count();
  await page.click("#closeGuide");
  await page.waitForTimeout(120);
  const guideClosed = await page.locator("#guideModal.hidden").count();
  await page.selectOption("#companyViewSelect", "projects");
  await page.waitForTimeout(120);
  const projectViewVisible = await page.locator("#projectPortfolioWrap:not(.view-hidden)").count();
  const workforceViewHidden = await page.locator("#workforcePressure.view-hidden").count();
  const boundedPanelLayout = await page.evaluate(() => {
    document.querySelectorAll(".ceo-mail-list,.employee-list").forEach(list => {
      const source = list.firstElementChild;
      if (!source) return;
      for (let i = 0; i < 18; i += 1) {
        const clone = source.cloneNode(true);
        clone.removeAttribute("onclick");
        list.appendChild(clone);
      }
    });
    if (typeof syncOfficeSidePanelHeight === "function") syncOfficeSidePanelHeight();
    const officePanel = document.querySelector(".main-grid.living-first>.office-panel");
    const inboxPanel = document.querySelector(".main-grid.living-first>.right-stack>section:nth-child(1)");
    const peoplePanel = document.querySelector(".main-grid.living-first>.right-stack>section:nth-child(2)");
    const employeeList = document.querySelector("#employeeList");
    const inboxList = document.querySelector("#commInboxList");
    const officeHeight = Math.round(officePanel?.getBoundingClientRect().height || 0);
    const inboxHeight = Math.round(inboxPanel?.getBoundingClientRect().height || 0);
    const peopleHeight = Math.round(peoplePanel?.getBoundingClientRect().height || 0);
    return {
      officeHeight,
      inboxHeight,
      peopleHeight,
      employeeOverflow: getComputedStyle(employeeList).overflowY,
      inboxOverflow: getComputedStyle(inboxList).overflowY,
      employeeCanScroll: employeeList.scrollHeight > employeeList.clientHeight,
      inboxCanScroll: inboxList.scrollHeight > inboxList.clientHeight,
      inboxBounded: inboxHeight <= officeHeight + 2,
      peopleBounded: peopleHeight <= officeHeight + 2
    };
  });

  const status = await page.evaluate(() => ({
    title: document.title,
    heading: document.querySelector("h1")?.textContent || "",
    timeText: document.body.innerText.match(/Day\s+\d+[^\n]*/)?.[0] || "",
    employeeCards: document.querySelectorAll("#employeeList .employee-card, .employee-card").length,
    inboxText: document.querySelector("#commInboxTab")?.textContent || "",
    bodyPreview: document.body.innerText.slice(0, 160)
  }));
  status.modalOpened = modalOpened;
  status.modalClosed = modalClosed;
  status.guideOpened = guideOpened;
  status.guideClosed = guideClosed;
  status.projectViewVisible = projectViewVisible;
  status.workforceViewHidden = workforceViewHidden;
  status.boundedPanelLayout = boundedPanelLayout;

  await browser.close();

  const ok =
    errors.length === 0 &&
    status.heading.includes("Office Aquarium") &&
    status.timeText.includes("Day 1") &&
    status.employeeCards >= 6 &&
    status.modalOpened === 1 &&
    status.modalClosed === 1 &&
    status.guideOpened === 1 &&
    status.guideClosed === 1 &&
    status.projectViewVisible === 1 &&
    status.workforceViewHidden === 1 &&
    status.boundedPanelLayout.inboxBounded &&
    status.boundedPanelLayout.peopleBounded &&
    status.boundedPanelLayout.employeeCanScroll &&
    status.boundedPanelLayout.inboxCanScroll;

  console.log(JSON.stringify({ ok, status, errors: errors.slice(0, 8) }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
