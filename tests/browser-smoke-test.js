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

  const status = await page.evaluate(() => ({
    title: document.title,
    heading: document.querySelector("h1")?.textContent || "",
    timeText: document.body.innerText.match(/Day\s+\d+[^\n]*/)?.[0] || "",
    employeeCards: document.querySelectorAll("#employeeList .employee-card, .employee-card").length,
    inboxText: document.querySelector("#commInboxTab")?.textContent || "",
    bodyPreview: document.body.innerText.slice(0, 160)
  }));

  await browser.close();

  const ok =
    errors.length === 0 &&
    status.heading.includes("Office Aquarium") &&
    status.timeText.includes("Day 1") &&
    status.employeeCards >= 6;

  console.log(JSON.stringify({ ok, status, errors: errors.slice(0, 8) }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
