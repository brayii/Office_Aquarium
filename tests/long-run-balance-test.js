const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const fs = require("fs");
  const executablePath = fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", err => errors.push(err.message));
  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  const fullRun = process.env.OFFICE_AQUARIUM_LONG_RUN === "1";
  const result = await page.evaluate((fullRun) => {
    const reports = [];
    const full = !!fullRun;
    const seeds = full ? [101, 202, 303, 404, 505] : [101];
    const targetDay = full ? 365 : 60;
    for (const seed of seeds) {
      localStorage.clear();
      startNewCompany();
      validationMode = true;
      company.randomState = seed;
      for (let i = 0; i < 25000 && company.day < targetDay; i += 1) {
        company.paused = false;
        simulateMinute(false);
        if (company.gameOver || company.lastSimulationError) break;
      }
      reports.push({
        seed,
        day: company.day,
        gameOver: !!company.gameOver,
        failureOwner: company.failureOwner,
        failureCode: company.failureCode,
        cash: Number((company.cash || 0).toFixed(2)),
        board: Math.round(company.board || 0),
        customers: Math.round(company.customers || 0),
        crises: (company.crisisLearningEpisodes || []).length,
        recovered: (company.crisisLearningEpisodes || []).filter(e => e.outcome === "resolved").length,
        errors: (company.systemErrors || []).length
      });
    }
    validationMode = false;
    const failureRate = reports.filter(r => r.gameOver).length / reports.length;
    return { ok: reports.every(r => !r.errors) && failureRate < .8, reports, failureRate, targetDay, full };
  }, fullRun);
  await browser.close();
  const ok = errors.length === 0 && result.ok;
  console.log(JSON.stringify({ ok, result, errors }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
