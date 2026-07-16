const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

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
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const publicBanned = /Restore the company|day\(s\)|has been sustained|Trigger threshold|Risk state active|internal intelligence flags|leadership signal changes|company absorbs the trade-off|investigation 0%/i;
    const rawScoreLeak = /\bseverity\s+\d+|\burgency\s+\d+|\bconfidence\s+\d+|Confidence:\s*\d+%/i;

    validationMode = true;
    startNewCompany();
    render();

    assert(document.getElementById("companyViewSelect").value === "all", "Company View should default to All");

    const crisisTypes = ["staffing", "financial", "leadership", "product", "burnout", "operational"];
    crisisTypes.forEach(type => {
      const candidate = makeCrisisCandidate(type, [`${crisisDefinition(type).title} has been sustained for 5 day(s).`], 88);
      startCrisis(candidate);
      const text = crisisPlayerMessage(company.crisis);
      const lines = text.split(/\n+/).filter(Boolean);
      const title = lines[0] || "";
      const body = lines.slice(1).join("\n");
      assert(text.includes("Current impact:"), `${type} crisis should explain current impact`);
      assert(text.includes("Suggested review:"), `${type} crisis should suggest what to review`);
      assert(text.includes("Recovery deadline:"), `${type} crisis should show a recovery deadline`);
      assert(!publicBanned.test(text), `${type} crisis should avoid engine wording: ${text}`);
      assert(!rawScoreLeak.test(text), `${type} crisis should not expose raw severity/urgency/confidence scores`);
      assert(!body.includes(`${title}:`), `${type} crisis should not repeat the title as title: body`);
      company.crisis = null;
    });

    startCrisis(makeCrisisCandidate("staffing", ["Staffing continuity has been sustained for 5 day(s)."], 92));
    render();
    const bannerText = document.getElementById("crisisText").innerText;
    assert(bannerText.includes("Staffing Continuity Crisis"), "Rendered crisis banner should have a clear title");
    assert(bannerText.includes("Current impact:"), "Rendered crisis banner should include impact");
    assert(!publicBanned.test(bannerText), `Rendered crisis banner should avoid engine wording: ${bannerText}`);
    assert(!rawScoreLeak.test(bannerText), "Rendered crisis banner should not expose raw scores");

    company.employeeMessages = [
      {
        id: "release-clarity-report-1",
        type: "risk-report",
        status: "open",
        fromName: "Maya",
        department: "hardware",
        createdDay: company.day - 2,
        subject: "Thermal review needs attention",
        severity: 92,
        urgency: 78,
        confidence: 72,
        evidence: ["Two verification reviews found unresolved thermal integration work."]
      }
    ];
    const internalReportText = internalReportsHtml().replace(/<[^>]+>/g, " ");
    assert(!/day\(s\)/i.test(internalReportText), "Internal reports should use natural day wording");
    assert(!rawScoreLeak.test(internalReportText), "Internal reports should not expose raw severity or confidence scores");
    assert(/reported 2 days ago/.test(internalReportText), "Internal reports should still show clear timing");

    const timing = projectTimingForecast({
      progress: 42,
      targetDay: company.day + 10,
      status: "active",
      performance: { scheduleVariance: 2, staffingCoverage: 80, blockerCount: 1 }
    });
    assert(!/day\(s\)/i.test(timing.summary), "Project timing should use natural day wording");

    validationMode = false;
    return { ok: failures.length === 0, failures, bannerText, internalReportText, timing: timing.summary };
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
