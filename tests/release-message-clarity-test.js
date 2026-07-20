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

    company.finance.runwayDays = 52;
    company.recruitingPipeline = [{
      id: "clarity-freeze-role",
      role: "Firmware Engineer",
      department: "software",
      status: "searching",
      stage: "searching",
      day: company.day - 12,
      searchStartedDay: company.day - 12,
      dueDay: company.day + 4,
      attempts: 2,
      market: "tight",
      expectedFillDays: 28
    }];
    const policyEvent = makeHiringPolicyReviewEvent("release clarity test");
    const policyComm = eventCommunication(policyEvent);
    const policyText = `${policyComm.message} ${(policyEvent.choices || []).map(c => renderDecisionChoiceHtml(c, policyEvent).replace(/<[^>]+>/g, " ")).join(" ")}`;
    assert(/set the hiring rule/i.test(policyText), "Hiring policy memo should explain it is setting policy");
    assert(/not approve a specific candidate/i.test(policyText), "Hiring policy memo should not sound like candidate approval");
    assert(/Freeze new headcount/i.test(policyText), "Hiring policy choices should use headcount wording");
    assert(!/Approve the .* hire/i.test(policyText), `Hiring policy memo should not use role approval wording: ${policyText}`);

    const freezeItem = company.recruitingPipeline[0];
    queueHiringExceptionEvent(freezeItem, "freeze", null);
    const freezeEvent = company.escalationQueue.find(ev => ev.id && String(ev.id).includes("hiring-exception-clarity-freeze-role"));
    const freezeComm = eventCommunication(freezeEvent);
    const freezeText = `${freezeComm.message} ${(freezeEvent.choices || []).map(c => renderDecisionChoiceHtml(c, freezeEvent).replace(/<[^>]+>/g, " ")).join(" ")}`;
    assert(/not a candidate approval/i.test(freezeText), "Hiring freeze exception should say it is not candidate approval");
    assert(/Continue the Firmware Engineer search/i.test(freezeText), "Freeze exception should offer a role-specific continue-search choice");
    assert(/Use temporary contractor coverage/i.test(freezeText), "Freeze exception should offer contractor coverage");
    assert(/Close the Firmware Engineer search/i.test(freezeText), "Freeze exception should offer closing the role");
    assert(!/Increase salary band/i.test(freezeText), `Freeze exception should not show failed-search salary wording: ${freezeText}`);

    const staleExecutivePhrases = /Requested action:|Executive attention:|decision threshold|Order portfolio triage|Protect growth bets|Cut project burn|Hold roadmap line|Approve recommended layoffs|Reject layoffs for now|Continue unchanged|Pause and reduce risk/i;

    const proposal = makeProject({ family: "firmware", originType: "department", status: "proposal", scope: 1 });
    const proposalEvent = makeProjectProposalEvent(proposal);
    const proposalText = `${proposalEvent.generatedCommunication.message} ${(proposalEvent.choices || []).map(c => c.title).join(" ")}`;
    assert(/asking whether .* should enter the active portfolio/i.test(proposalText), `Project proposal should explain the decision naturally: ${proposalText}`);
    assert(!staleExecutivePhrases.test(proposalText), `Project proposal should avoid stale strategy-engine wording: ${proposalText}`);

    const projectControlEvent = makeProjectControlEvent({
      ...proposal,
      status: "active",
      progress: 48,
      budgetSpent: 0.42,
      budgetApproved: 1.4,
      performance: { staffingCoverage: 62, riskTrend: 78, budgetVariance: 12 }
    }, "review");
    const projectControlText = `${projectControlEvent.generatedCommunication.message} ${(projectControlEvent.choices || []).map(c => c.title).join(" ")}`;
    assert(/asking for direction/i.test(projectControlText), `Project control memo should explain the executive request: ${projectControlText}`);
    assert(!staleExecutivePhrases.test(projectControlText), `Project control memo should avoid stale strategy-engine wording: ${projectControlText}`);

    const customerEvent = makeCustomerStrategicMemo();
    const customerText = `${customerEvent.generatedCommunication.message} ${(customerEvent.choices || []).map(c => c.title).join(" ")}`;
    assert(/asking for direction/i.test(customerText), `Customer memo should explain why CEO direction is needed: ${customerText}`);
    assert(!/Hold roadmap line|sentiment \d+,\s*churn risk \d+/i.test(customerText), `Customer memo should avoid terse score wording: ${customerText}`);

    const backgroundEvent = makeBackgroundExecutiveEvent({ id: "clarity-background", department: "operations", title: "Supplier quote changed", description: "A supplier changed pricing assumptions on a useful component.", severity: 83, recoveryPaths: ["Negotiate a smaller order", "Accept a short delay"] });
    const backgroundText = `${backgroundEvent.title} ${backgroundEvent.generatedCommunication.message}`;
    assert(/needs executive direction/i.test(backgroundText), `Background memo should use a clear subject: ${backgroundText}`);
    assert(!staleExecutivePhrases.test(backgroundText), `Background memo should avoid engine wording: ${backgroundText}`);

    company.escalationQueue = [];
    company.pendingEvent = null;
    company.messageFingerprints = {};
    company.lastInformationalEscalationDay = OFFICE_AQUARIUM_CONSTANTS.time.neverDay;
    company.day = 40;
    const firstInfo = {
      id: "info-cadence-one",
      type: "status-report",
      contentCode: "QUALITY_TREND",
      status: "manager-reviewed",
      fromId: employees[0].id,
      fromName: employees[0].name,
      department: "quality",
      subject: "Quality trend update",
      severity: 58,
      urgency: 42,
      confidence: 72,
      evidence: ["Verification found a small but measurable improvement."]
    };
    assert(archiveInformationalEscalation(firstInfo), "First routine executive information update should enter the Inbox");
    const secondInfo = { ...firstInfo, id: "info-cadence-two" };
    assert(!archiveInformationalEscalation(secondInfo), "Routine executive information should respect the minimum Inbox gap");
    company.escalationQueue = [];
    company.day += OFFICE_AQUARIUM_CONSTANTS.executiveInbox.informationalMinimumGapDays;
    assert(!archiveInformationalEscalation(secondInfo), "Repeated executive information should respect its longer topic cooldown");
    company.day += OFFICE_AQUARIUM_CONSTANTS.executiveInbox.informationalRepeatWindowDays;
    assert(archiveInformationalEscalation(secondInfo), "A materially old informational topic should be eligible again");

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
