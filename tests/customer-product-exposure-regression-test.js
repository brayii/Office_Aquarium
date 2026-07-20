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
  page.on("console", msg => { if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`); });
  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.evaluate(() => startNewCompany());
  await page.waitForTimeout(200);

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    validationMode = true;
    ensureBibleSystems();
    ensureCustomerMarketSystems();
    company.phase = "launched";
    company.customerSegments.enterprise.activeCustomers = 20;
    company.customerSegments.smallBusiness.activeCustomers = 20;
    company.customerSegments.enterprise.sentiment = 70;
    company.customerSegments.smallBusiness.sentiment = 70;
    company.customerSegments.enterprise.switchingCost = 85;
    company.customerSegments.enterprise.churnRisk = 72;
    company.customerSegments.enterprise.trust = 35;
    company.customerSegments.enterprise.sentiment = 30;
    updateRetentionOutlook(company.customerSegments.enterprise);
    assert(company.customerSegments.enterprise.retentionOutlook > company.customerSegments.enterprise.sentiment, "High switching cost should preserve retention outlook while sentiment is low");

    const hardwareProject = { id: "hardware-product-test", title: "Hardware Product Test", status: "completed", family: "AI accelerator", performance: { quality: 20, executionHealth: 35, strategicConfidence: 55, riskTrend: 85, customerInterest: 60 }, quality: 20, visibleRisk: 85, customerInterest: 60 };
    const softwareProject = { id: "software-product-test", title: "Software Product Test", status: "completed", family: "software platform", performance: { quality: 85, executionHealth: 80, strategicConfidence: 80, riskTrend: 20, customerInterest: 70 }, quality: 85, visibleRisk: 20, customerInterest: 70 };
    company.projectArchive = [hardwareProject, softwareProject];
    company.customerSegments.enterprise.sentiment = 70;
    company.customerSegments.enterprise.supportSatisfaction = 40;
    company.customerSegments.enterprise.reliabilitySatisfaction = 70;
    company.customerSegments.smallBusiness.sentiment = 70;
    company.customerSegments.smallBusiness.supportSatisfaction = 70;
    company.customerSegments.smallBusiness.reliabilitySatisfaction = 70;
    syncCustomerExposure("enterprise", hardwareProject.id, { usageShare: .90, contractShare: .80, dependency: .90, publicVisibility: .80 });
    syncCustomerExposure("smallBusiness", softwareProject.id, { usageShare: .85, contractShare: .75, dependency: .35, publicVisibility: .30 });
    const enterpriseBefore = company.customerSegments.enterprise.sentiment;
    const smallBefore = company.customerSegments.smallBusiness.sentiment;
    updateCustomerMarketDaily();
    const enterpriseDrop = enterpriseBefore - company.customerSegments.enterprise.sentiment;
    const smallDrop = smallBefore - company.customerSegments.smallBusiness.sentiment;
    assert(enterpriseDrop > smallDrop, `Hardware-exposed enterprise should be hurt more than unrelated software customers (${enterpriseDrop} vs ${smallDrop})`);

    const supportBefore = company.customerSegments.enterprise.supportSatisfaction;
    const qualityBefore = company.customerSegments.enterprise.reliabilitySatisfaction;
    const supportIssue = recordCustomerExperience("enterprise", "support-delay", 72, "Enterprise support queue is delayed.", "support-regression", false);
    const unresolvedBefore = company.customerSegments.enterprise.currentIssues.filter(issue => !issue.resolved).length;
    applyCustomerStrategyDecision({ segmentId: "enterprise", mode: "support" });
    assert(company.customerSegments.enterprise.supportSatisfaction > supportBefore, "Support intervention should improve support satisfaction");
    assert(company.customerSegments.enterprise.reliabilitySatisfaction <= qualityBefore + 1, "Support intervention should not masquerade as broad product-quality recovery");
    assert(company.customerSegments.enterprise.currentIssues.filter(issue => !issue.resolved).length < unresolvedBefore, "Funded support should resolve at least one underlying customer issue");
    assert(supportIssue.resolved, "Resolved customer issue should update the canonical experience record");
    const episode = (company.learningEpisodes || []).find(e => e.domain === "customer" && e.customerSegmentIds?.includes("enterprise"));
    assert(episode?.interventionType === "support-staffing", `Customer learning should record typed intervention, got ${episode?.interventionType}`);

    company.phase = "launched";
    company.trust = 70;
    company.customers = 0;
    const zeroCustomerCost = calculateLivingFinance();
    company.customers = 100;
    const hundredCustomerCost = calculateLivingFinance();
    const customerScaleCost = hundredCustomerCost - zeroCustomerCost;
    assert(customerScaleCost >= .24 && customerScaleCost <= .34, `One hundred launched customers should add realistic recurring operating cost, got $${customerScaleCost.toFixed(3)}M/day`);

    validationMode = false;
    return { ok: failures.length === 0, failures, exposure: company.customerSegments.enterprise.productExposure, retentionOutlook: company.customerSegments.enterprise.retentionOutlook, customerScaleCost: Number(customerScaleCost.toFixed(3)) };
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
