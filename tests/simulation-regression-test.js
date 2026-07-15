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
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    if (typeof company === "undefined" || typeof simulateMinute !== "function") {
      return { ok: false, reason: "Simulation globals unavailable" };
    }
    company.speed = 12;
    for (let i = 0; i < 2400; i += 1) {
      company.paused = false;
      simulateMinute(false);
      if (company.gameOver || company.lastSimulationError) break;
      if (company.day >= 3) break;
    }
    const beforeSave = {
      day: company.day,
      minute: company.minute,
      employees: employees.filter(e => e.active).length,
      messages: (company.messages || []).length,
      projects: (company.projects || []).length,
      lastSimulationError: company.lastSimulationError || null,
      lastDailyCloseStatus: company.lastDailyCloseStatus || null,
      hash: typeof stateHash === "function" ? stateHash() : null
    };
    if (typeof saveGame === "function") saveGame();
    const loadOk = typeof loadGame === "function" ? loadGame() : false;
    const afterLoad = {
      day: company.day,
      minute: company.minute,
      employees: employees.filter(e => e.active).length,
      lastSimulationError: company.lastSimulationError || null,
      hash: typeof stateHash === "function" ? stateHash() : null
    };
    return {
      ok: company.day >= 1 && !beforeSave.lastSimulationError && loadOk && beforeSave.day === afterLoad.day && beforeSave.employees === afterLoad.employees,
      beforeSave,
      afterLoad,
      loadOk
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
