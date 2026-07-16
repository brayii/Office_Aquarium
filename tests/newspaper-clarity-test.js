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
    validationMode = true;
    startNewCompany();
    company.weekStartSnapshot = captureWeekSnapshot();
    company.weekStartSnapshot.cash += 1.2;
    company.weekStartSnapshot.customers -= 2;
    company.weekStartSnapshot.board += 4;
    company.weekStartSnapshot.morale += 3;
    company.weeklyEvents = [
      { text: "CEO decision: Approve a validation sprint.", type: "leadership", importance: 5, day: company.day, meta: { choiceTitle: "Approve a validation sprint", projectTitle: "Project Phoenix" } },
      { text: "Decision outcome: Mixed result.", type: "leadership", importance: 4, day: company.day, meta: { choiceTitle: "Approve a validation sprint", projectTitle: "Project Phoenix" } },
      { text: "Project Phoenix hit a development blocker: missing specification.", type: "project", importance: 4, day: company.day },
      { text: "Maya is taking a break.", type: "people", importance: 1, day: company.day },
      { text: "Leo is at home.", type: "people", importance: 1, day: company.day },
      { text: "Firmware rework increased after rushed technical work.", type: "quality", importance: 3, day: company.day },
      { text: "The board issued a strike: cash discipline concern.", type: "board", importance: 6, day: company.day },
      { text: "Customer renewal risk increased.", type: "customer", importance: 4, day: company.day },
      { text: "Supplier answer pending delayed validation.", type: "project", importance: 3, day: company.day }
    ];
    company.storyChains = [{
      id: "story-regression",
      subject: "Launch date retained",
      lastDay: company.day,
      beats: [
        { day: company.day - 2, text: "Update runway forecast" },
        { day: company.day - 1, text: "Update runway forecast" },
        { day: company.day, text: "validation sprint approved" },
        { day: company.day, text: "engineering spending increased" }
      ]
    }];
    employees.forEach(employee => {
      employee.action = "home";
      employee.stress = 35;
      employee.taskProgress = 0;
      employee.achievements = 0;
    });
    employees[0].action = "break";
    employees[0].stress = 82;
    employees[0].role = "Chip Architect";
    publishWeeklyNewspaper();
    const issue = company.newspapers[0];
    renderNewspapers();
    const text = document.getElementById("newspaperArchive").innerText;
    const storyTexts = (issue.storyThread?.beats || []).map(beat => beat.text);
    assert(issue.summary && issue.summary.length > 80, "Issue should include an executive weekly summary");
    assert((issue.majorDecisions || []).length >= 1, "Issue should separate major decisions");
    assert((issue.notableEvents || []).length <= 5, "Issue should keep notable events focused");
    assert((issue.metricExplanations || []).some(line => /Cash fell|Cash rose/.test(line)), "Metric changes should include a cash explanation");
    assert(!text.includes("CEO decision:"), "Rendered newspaper should not repeat raw CEO decision labels");
    assert(text.includes("Project Phoenix"), "Decision and outcome wording should include the relevant project when available");
    assert(!text.includes("related issue"), "Decision outcomes should not fall back to vague related-issue wording when metadata exists");
    assert(!text.includes("Maya is taking a break."), "Ordinary break wording should not appear as news");
    assert(!text.includes("Leo is at home."), "Ordinary off-hours status should not appear as news");
    assert(/Major Decisions/i.test(text), "Rendered newspaper should show Major Decisions");
    assert(/Notable Events/i.test(text), "Rendered newspaper should show Notable Events");
    assert(text.includes("Primary risk:"), "Risk Desk should include compact indicators");
    assert(storyTexts.length === new Set(storyTexts.map(s => s.toLowerCase())).size, "Story chain should not repeat duplicate labels");
    assert(!/severity \d+|confidence \d+|score \d+/i.test(text), "Normal newspaper text should not expose debug score language");
    assert(!/hiddenReality|trueTechnicalDifficulty|randomState/.test(text), "Newspaper should not leak hidden simulation state");
    company.weeklyEvents = [];
    company.weekStartSnapshot = captureWeekSnapshot();
    publishWeeklyNewspaper();
    const quiet = company.newspapers[0];
    assert(quiet.headline === "Quiet Week", `Quiet week should use quiet headline, got ${quiet.headline}`);
    assert(/No major strategic events occurred/.test(quiet.summary), "Quiet week should explain that no CEO decision was required");
    company.weeklyEvents = [
      { text: "The board issued a strike: cash discipline concern.", type: "board", importance: 6, day: company.day },
      { text: "Customer renewal risk increased.", type: "customer", importance: 5, day: company.day },
      { text: "Project Phoenix hit a development blocker: missing specification.", type: "project", importance: 5, day: company.day },
      { text: "Firmware rework increased after rushed technical work.", type: "quality", importance: 4, day: company.day },
      { text: "Supplier answer pending delayed validation.", type: "project", importance: 4, day: company.day },
      { text: "Maya is taking a break.", type: "people", importance: 1, day: company.day },
      { text: "Leo is at home.", type: "people", importance: 1, day: company.day },
      { text: "Cash discipline concern repeated.", type: "finance", importance: 4, day: company.day }
    ];
    company.weekStartSnapshot = captureWeekSnapshot();
    publishWeeklyNewspaper();
    const critical = company.newspapers[0];
    assert(/^Critical Week/.test(critical.headline), `High-intensity week should use critical headline, got ${critical.headline}`);
    assert((critical.notableEvents || []).length <= 3, "High-intensity week should surface only the top notable events");
    validationMode = false;
    return { ok: failures.length === 0, failures, headline: issue.headline, summary: issue.summary, textPreview: text.slice(0, 900) };
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
