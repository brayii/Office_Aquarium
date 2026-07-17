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
    validationMode = true;
    startNewCompany();

    const choices = (role = "Firmware Engineer", dept = "software") => [
      { title: "Approve position", detail: "Authorize this role and let HR open recruiting.", effect: { board: 1 }, directive: "people", days: 8, people: { stress: -2, morale: 2 }, hire: "specialist", hireRole: role, hireDept: dept, strategy: "people", estimatedConfidence: 82 },
      { title: "Delay position", detail: "Revisit the headcount request next quarter while the team manages workload.", effect: { board: 1 }, directive: "quality", days: 6, people: { stress: 2, morale: -1 }, deferHiring: { dept, role }, strategy: "finance", estimatedConfidence: 54 },
      { title: "Reject and reprioritize", detail: "Decline the position and ask the department to reduce scope instead.", effect: { cash: .05, board: 2, quality: -1 }, directive: "cuts", days: 8, people: { stress: 4, morale: -3 }, rejectHiring: { dept, role }, strategy: "cost-control", estimatedConfidence: 44 }
    ];

    const memoFor = request => ({
      id: `hiring-recommendation-test-${request.department}`,
      repeatable: false,
      category: "people",
      title: `Hiring request: ${request.role}`,
      copy: `${request.department} requests ${request.role}.`,
      hiringRequest: request,
      generatedCommunication: {
        type: "Hiring Request",
        priority: "Decision Needed",
        sender: { name: "People and Finance Review", role: "Operating Council" },
        subject: `Hiring Request - ${request.role}`,
        message: `People and Finance reviewed the request. Evidence: ${(request.reasons || []).join("; ")}.`,
        recs: [[teamDisplayName(request.department), "Approve if the capacity evidence is credible", request.confidence], ["Finance", "Protect runway if the case is weak", 70]],
        impacts: ["Recruiting starts after approval", "Payroll increases only after a candidate joins"]
      },
      choices: choices(request.role, request.department)
    });

    company.finance = { ...(company.finance || {}), runwayDays: 180, netCashFlowDaily: -0.04 };
    const strong = memoFor({
      department: "software",
      role: "Firmware Engineer",
      requestedCount: 1,
      confidence: 82,
      reasons: ["2 project assignments uncovered", "blocked work item", "backlog 7", "skill coverage 48"],
      financeAssessment: "Runway impact is about 17 days under current cash flow",
      operationalImpact: "Staffing pressure is critical; uncovered project assignments and blocked work are creating delivery risk.",
      successionImpact: "Improves coverage if current staff leave or retire"
    });
    const strongComm = eventCommunication(strong);
    const strongIntel = buildMemoIntelligence(strong, strongComm);
    const strongScores = strong.choices.map(c => ({ title: c.title, score: Math.round(evaluateChoiceForDepartment(c, "software", { event: strong, evidence: strongIntel.evidence }).score) }));
    assert(strongIntel.recommendedChoice === "Approve position", `Strong hiring case should recommend approval, got ${strongIntel.recommendedChoice} with ${JSON.stringify(strongScores)}`);

    company.finance = { ...(company.finance || {}), runwayDays: 45, netCashFlowDaily: -0.18 };
    const weak = memoFor({
      department: "software",
      role: "Firmware Engineer",
      requestedCount: 1,
      confidence: 42,
      reasons: ["No immediate blockers are visible; the signal is based on forward staffing risk."],
      financeAssessment: "Runway impact is material while cash flow is negative",
      operationalImpact: "Staffing pressure is manageable; managers are monitoring before operational failures appear.",
      successionImpact: "Improves coverage if current staff leave or retire"
    });
    const weakComm = eventCommunication(weak);
    const weakIntel = buildMemoIntelligence(weak, weakComm);
    assert(weakIntel.recommendedChoice !== "Approve position", `Weak hiring case with tight runway should not automatically recommend approval, got ${weakIntel.recommendedChoice}`);

    return { ok: failures.length === 0, failures, strongChoice: strongIntel.recommendedChoice, weakChoice: weakIntel.recommendedChoice, strongScores };
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
