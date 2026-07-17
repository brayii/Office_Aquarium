const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

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

function currentSaveVersion() {
  const constants = fs.readFileSync(path.resolve("src/core/constants.js"), "utf8");
  const match = constants.match(/saveVersion\s*:\s*(\d+)/);
  if (!match) throw new Error("Could not read saveVersion from src/core/constants.js");
  return Number(match[1]);
}

async function main() {
  const expectedVersion = currentSaveVersion();
  const errors = [];
  const failures = [];
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", err => errors.push(`PAGE: ${err.message}`));
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`);
  });

  const assert = (condition, message) => { if (!condition) failures.push(message); };
  const fileUrl = `file:///${path.resolve("tests/Office_Aquarium_Failure_Test.html").replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });

  const pageInfo = await page.evaluate(() => ({
    title: document.title,
    saveVersion: SAVE_VERSION,
    saveKey: SAVE_KEY,
    buttons: [...document.querySelectorAll("button")].map(button => button.id).filter(Boolean)
  }));
  assert(pageInfo.title.includes("Failure Tester"), "Failure-test page should load");
  assert(pageInfo.saveVersion === expectedVersion, `Failure-test page save version should match current version ${expectedVersion}`);
  ["ceoFailure", "companyFailure", "rolloverTest", "projectArchiveTest", "projectCloseoutTest", "hiringPipelineTest", "inboxDecisionTest", "commercialRevenueTest", "runLocalChecks"].forEach(id => {
    assert(pageInfo.buttons.includes(id), `Failure-test page should expose ${id}`);
  });

  const scenarios = [
    ["#ceoFailure", save => save.company.board === 0 && save.company.gameOver === false, "CEO removal save should start board confidence at zero"],
    ["#companyFailure", save => save.company.cash < 0 && save.company.gameOver === false, "Company failure save should start below insolvency threshold"],
    ["#rolloverTest", save => save.company.day === 70 && save.company.minute === 1195, "Rollover save should start at day 70, 7:55 PM"],
    ["#projectArchiveTest", save => (save.company.projects || []).length === 1 && (save.company.projectArchive || []).length === 1, "Archive integrity save should include one active and one archived project"],
    ["#projectCloseoutTest", save => (save.company.projects || [])[0]?.progress >= 99.5, "Closeout save should create a near-complete project"],
    ["#hiringPipelineTest", save => save.employees.length === 9 && (save.company.recruitingPipeline || []).length === 1, "Hiring pipeline save should include an onboarding employee and active recruiting item"],
    ["#inboxDecisionTest", save => (save.company.escalationQueue || [])[0]?.choices?.length === 3, "Inbox decision save should include exactly three choices"],
    ["#commercialRevenueTest", save => (save.company.projectArchive || [])[0]?.commercialStatus === "launched" && (save.company.projectArchive || [])[0]?.projectedDailyRevenue > 0, "Revenue save should include a launched commercial archive project with projected revenue"]
  ];

  for (const [button, validate, message] of scenarios) {
    await page.evaluate(() => localStorage.clear());
    await page.click(button);
    const saved = await page.evaluate(key => localStorage.getItem(key), pageInfo.saveKey);
    let parsed = null;
    try { parsed = saved ? JSON.parse(saved) : null; } catch (error) { failures.push(`${button} produced invalid JSON: ${error.message}`); }
    assert(!!parsed, `${button} should write a save`);
    if (parsed) {
      assert(parsed.saveVersion === expectedVersion, `${button} should write save version ${expectedVersion}`);
      assert(Array.isArray(parsed.employees) && parsed.employees.length >= 8, `${button} should write founding employees`);
      assert(validate(parsed), message);
    }
  }

  await page.click("#runLocalChecks");
  const checksText = await page.locator("#checkList").innerText();
  assert(checksText.includes("PASS: Save version is current"), "Local checks should confirm current save version");

  await browser.close();
  const ok = errors.length === 0 && failures.length === 0;
  console.log(JSON.stringify({ ok, expectedVersion, failures, errors }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
