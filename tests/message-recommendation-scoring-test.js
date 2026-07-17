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

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const recommend = ev => {
      const comm = eventCommunication(ev);
      return buildMemoIntelligence(ev, comm).recommendedChoice;
    };

    validationMode = true;
    startNewCompany();
    ensureCustomerMarketSystems?.();
    ensureProjectPortfolio?.();
    ensureWorkforceEconomySystems?.();

    company.finance = { ...(company.finance || {}), runwayDays: 180, netCashFlowDaily: -0.03 };
    company.customerSegments.enterprise = {
      ...(company.customerSegments.enterprise || {}),
      activeCustomers: 40,
      sentiment: 28,
      supportSatisfaction: 31,
      churnRisk: 82,
      currentIssues: [{ description: "Renewal accounts are waiting on support fixes.", resolved: false }]
    };
    const customerEv = {
      id: "recommendation-customer-test",
      category: "customer",
      customerSegmentId: "enterprise",
      title: "Customer strategy review",
      copy: "Enterprise customers are under retention pressure.",
      generatedCommunication: { sender: { name: "Customer Success Council", role: "VP Customer Success" }, subject: "Customer retention pressure", message: "Enterprise customers need a decision." },
      choices: [
        { title: "Approve customer recovery plan", strategy: "customer-retention", customerStrategy: { segmentId: "enterprise", mode: "recovery" }, estimatedConfidence: 68 },
        { title: "Fund temporary support capacity", strategy: "support-capacity", customerStrategy: { segmentId: "enterprise", mode: "support" }, estimatedConfidence: 64 },
        { title: "Hold the current roadmap", strategy: "focus", customerStrategy: { segmentId: "enterprise", mode: "hold" }, estimatedConfidence: 50 }
      ]
    };
    const customerChoice = recommend(customerEv);
    assert(customerChoice !== "Hold the current roadmap", `High churn customer memo should not recommend holding the roadmap, got ${customerChoice}`);

    const highProject = {
      id: "commercial-high",
      title: "Project Lighthouse",
      status: "completed",
      progress: 100,
      commercialReadiness: 82,
      commercialPotential: 86,
      projectedDailyRevenue: 0.12,
      customerInterest: 81,
      visibleRisk: 36,
      performance: { customerInterest: 81, riskTrend: 36, quality: 78, staffingCoverage: 100 }
    };
    company.projectArchive = [highProject];
    const highCommercialChoice = recommend(makeProjectCommercializationEvent(highProject));
    assert(highCommercialChoice === "Launch commercially", `High-readiness commercial project should recommend launch, got ${highCommercialChoice}`);

    const weakProject = {
      id: "commercial-weak",
      title: "Project Fogbank",
      status: "completed",
      progress: 100,
      commercialReadiness: 34,
      commercialPotential: 39,
      projectedDailyRevenue: 0.01,
      customerInterest: 38,
      visibleRisk: 84,
      performance: { customerInterest: 38, riskTrend: 84, quality: 41, staffingCoverage: 80 }
    };
    company.projectArchive = [weakProject];
    const weakCommercialChoice = recommend(makeProjectCommercializationEvent(weakProject));
    assert(weakCommercialChoice !== "Launch commercially", `Weak commercial project should not recommend launch, got ${weakCommercialChoice}`);

    company.finance = { ...(company.finance || {}), runwayDays: 42, netCashFlowDaily: -0.19 };
    company.hiringNeedHistory = { hardware: { lastScore: 82, confidence: 80 }, software: { lastScore: 80, confidence: 76 } };
    company.portfolioHealth = { ...(company.portfolioHealth || {}), currentlyMissingStaff: 0 };
    let hiringPolicyChoice = recommend(makeHiringPolicyReviewEvent("Recommendation scoring regression test"));
    assert(hiringPolicyChoice !== "Keep normal hiring review", `Tight runway hiring policy should not recommend normal hiring, got ${hiringPolicyChoice}`);

    company.finance = { ...(company.finance || {}), runwayDays: 180, netCashFlowDaily: -0.03 };
    company.hiringNeedHistory = { hardware: { lastScore: 92, confidence: 88 }, software: { lastScore: 86, confidence: 82 }, quality: { lastScore: 84, confidence: 80 } };
    company.portfolioHealth = { ...(company.portfolioHealth || {}), currentlyMissingStaff: 3 };
    hiringPolicyChoice = recommend(makeHiringPolicyReviewEvent("Recommendation scoring regression test"));
    assert(hiringPolicyChoice !== "Freeze new headcount", `Healthy runway with real staffing pressure should not recommend a freeze, got ${hiringPolicyChoice}`);

    const layoffEv = {
      id: "recommendation-layoff-test",
      category: "finance",
      title: "Runway restructuring review",
      copy: "Finance is asking for a workforce decision because runway is tightening.",
      generatedCommunication: { sender: { name: "Finance", role: "CFO" }, subject: "Runway restructuring review", message: "Cash pressure requires a decision." },
      choices: [
        { title: "Reduce payroll by cutting roles", strategy: "cost-control", layoff: { count: 2, voluntary: false }, estimatedConfidence: 52 },
        { title: "Offer voluntary separation", strategy: "people", layoff: { count: 1, voluntary: true }, estimatedConfidence: 58 },
        { title: "Reject workforce cuts for now", strategy: "revenue", rejectLayoff: true, estimatedConfidence: 42 }
      ]
    };
    company.finance = { ...(company.finance || {}), runwayDays: 31, netCashFlowDaily: -0.22 };
    const layoffChoice = recommend(layoffEv);
    assert(layoffChoice !== "Reject workforce cuts for now", `Severe runway pressure should not recommend rejecting all restructuring, got ${layoffChoice}`);

    company.finance = { ...(company.finance || {}), runwayDays: 38, netCashFlowDaily: -0.16 };
    company.marketConfidence = 70;
    company.investorAppetite = 76;
    company.valuationQuality = 68;
    const fundingEv = {
      id: "recommendation-funding-test",
      category: "board",
      title: "Funding window review",
      copy: "The Board is asking whether the company should use investor appetite to extend runway.",
      generatedCommunication: { sender: { name: "Board Market Committee", role: "Board" }, subject: "Funding window review", message: "Runway and investor appetite need a decision." },
      choices: [
        { title: "Raise modest funding", strategy: "finance", fundraising: { mode: "modest", amount: 5, dilutionPercent: 9 }, estimatedConfidence: 70 },
        { title: "Raise aggressive funding", strategy: "growth", fundraising: { mode: "aggressive", amount: 13, dilutionPercent: 24 }, estimatedConfidence: 58 },
        { title: "Remain privately funded", strategy: "quality", estimatedConfidence: 54 }
      ]
    };
    const fundingChoice = recommend(fundingEv);
    assert(fundingChoice !== "Remain privately funded", `Tight runway with strong investor appetite should recommend funding, got ${fundingChoice}`);

    return { ok: failures.length === 0, failures, customerChoice, highCommercialChoice, weakCommercialChoice, hiringPolicyChoice, layoffChoice, fundingChoice };
  });

  await browser.close();
  if (errors.length || !result.ok) {
    console.error(JSON.stringify({ ok: false, result, errors }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, result, errors }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
