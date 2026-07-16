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
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.evaluate(() => startNewCompany());
  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    ensureBibleSystems();
    const project = (company.projects || [])[0];
    if (project) project.hiddenReality = { trueMarketDemand: 99, trueStrategicValue: 98, hiddenFailureModes: ["secret"], hiddenUpsideTriggers: ["secret"] };
    const employeeObs = buildEmployeeObservation(employees[0].id);
    const managerObs = buildManagerObservation("hardware");
    const customerObs = buildCustomerSuccessObservation("enterprise");
    const irObs = buildInvestorRelationsObservation();
    const boardObs = buildBoardObservation();
    const ceoObs = buildCEOObservation();
    const normal = JSON.stringify({ employeeObs, managerObs, customerObs, irObs, boardObs, ceoObs });
    assert(!/hiddenReality|trueMarketDemand|trueStrategicValue|hiddenFailureModes|hiddenUpsideTriggers|debugState/.test(normal), "Normal observations must not expose hidden project truth");
    assert(employeeObs && managerObs && customerObs && irObs && boardObs && ceoObs, "All observation builders should return objects");
    const debug = typeof customerMarketDebugHtml === "function" && typeof crisisDebugHtml === "function";
    assert(debug, "AI Debug helpers should remain available for hidden/debug inspection");
    return { ok: failures.length === 0, failures };
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
