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
    validationMode = false;
    company.paused = false;

    const event = {
      id: "communication-lifecycle-regression",
      title: "Lifecycle staffing memo",
      copy: "People Operations needs a CEO decision on whether to approve a constrained staffing response.",
      category: "hiring",
      repeatable: true,
      generatedCommunication: {
        type: "Workforce Memo",
        priority: "Decision Needed",
        sender: { name: "Iris", role: "People Operations" },
        subject: "Approve constrained staffing response",
        message: "People Operations recommends approving one constrained hire because delivery pressure is rising."
      },
      choices: [
        { title: "Approve one critical hire", detail: "Authorize HR to fill one critical role.", strategy: "people", effect: { cash: -0.2, trust: 1 }, directive: "people", days: 5 },
        { title: "Delay the hire", detail: "Wait for the next workforce review.", strategy: "finance", effect: { board: 1 }, directive: "cuts", days: 3 },
        { title: "Reject the request", detail: "Keep the current staffing model unchanged.", strategy: "cost-control", effect: { trust: -1 }, directive: "cuts", days: 3 }
      ]
    };

    company.escalationQueue = [prepareStrategicDecision(event)];
    company.pendingEvent = null;
    company.pendingCommunication = null;
    company.communications = [];
    company.communicationView = "inbox";
    renderDecisionEvent();

    assert(company.pendingEvent === null, "Queued messages should not become active until clicked");
    assert(document.getElementById("memoContainer").classList.contains("hidden"), "Memo body should remain hidden while only queued");
    assert(document.getElementById("commInboxList").innerText.includes("Approve constrained staffing response"), "Inbox should list queued memo");
    assert(document.getElementById("eventCopy").innerText.includes("Click a message"), "Main inbox copy should tell the player to click a message");

    const opened = openQueuedMemoAt(0);
    assert(opened, "Click/open should activate the queued memo");
    assert(!!company.pendingEvent, "Opening a queued memo should set pendingEvent");
    assert(company.escalationQueue.length === 0, "Opened memo should be removed from queue");
    assert(company.paused === true, "Opening a CEO decision should pause for review");
    assert(!document.getElementById("memoContainer").classList.contains("hidden"), "Opened memo should render message body");
    assert(!document.getElementById("decisionGrid").classList.contains("hidden"), "Opened decision memo should show the choice area");
    assert(getComputedStyle(document.getElementById("decisionGrid")).display !== "none", "Opened decision memo choice area should be visible");
    assert(document.getElementById("decisionGrid").children.length === 3, "Opened decision memo should render exactly three choices");
    assert(document.getElementById("decisionGrid").innerText.includes("Approve one critical hire"), "Opened memo should render choices");

    const selectedIndex = company.pendingEvent.choices.findIndex(choice => choice.title === "Approve one critical hire");
    assert(selectedIndex >= 0, "Opened memo should keep the approve-hire choice available");
    company.selected = selectedIndex;
    applyDecision();
    assert(company.pendingEvent === null, "Applying a choice should clear pendingEvent");
    assert(company.pendingCommunication === null, "Applying a choice should clear pendingCommunication");
    assert(company.communications.length === 1, "Applying a choice should create one archived communication");
    const archived = company.communications[0];
    assert(archived.decision === "Approve one critical hire", "Archived communication should preserve the chosen option");
    assert(archived.read === true, "Archived communication should be marked read after decision");
    assert(archived.deleted === false, "Archived communication should start in saved old messages");
    assert(!!archived.structuredMessage, "Archived communication should keep structured message data");

    setCommunicationView("archive");
    assert(document.getElementById("memoArchiveList").innerText.includes("Approve constrained staffing response"), "Archive should list saved old message");
    showArchivedMemo(0);
    assert(document.getElementById("memoArchiveDetail").innerText.includes("Your recorded choice: Approve one critical hire"), "Old message detail should show only the recorded choice result");
    setArchivedMemoDeleted(0, true);
    assert(company.communications[0].deleted === true, "Delete should mark old message deleted");
    assert(company.communicationArchiveMode === "deleted", "Deleting should switch to deleted old messages");
    setArchivedMemoDeleted(0, false);
    assert(company.communications[0].deleted === false, "Restore should unmark old message deleted");
    assert(company.communicationArchiveMode === "saved", "Restoring should switch back to saved old messages");

    saveGame();
    const beforeReload = {
      count: company.communications.length,
      decision: company.communications[0].decision,
      deleted: company.communications[0].deleted,
      threadCount: (company.messageThreads || []).length,
      qualityCount: (company.messageQualityHistory || []).length
    };
    const loaded = loadGame();
    const afterReload = {
      loaded,
      count: company.communications.length,
      decision: company.communications[0]?.decision,
      deleted: company.communications[0]?.deleted,
      threadCount: (company.messageThreads || []).length,
      qualityCount: (company.messageQualityHistory || []).length
    };
    assert(loaded, "Saved game should reload");
    assert(afterReload.count === beforeReload.count, "Reload should preserve old messages");
    assert(afterReload.decision === beforeReload.decision, "Reload should preserve recorded choice");
    assert(afterReload.deleted === false, "Reload should preserve restored old-message state");
    assert(afterReload.threadCount >= 1, "Reload should preserve message thread records");
    assert(afterReload.qualityCount >= 1, "Reload should preserve message quality history");

    company.communications = [];
    company.escalationQueue = [];
    company.pendingEvent = null;
    company.pendingCommunication = null;
    company.communicationView = "inbox";
    const queuedInfo = queueInformationalCommunication({
      type: "Executive Information Memo",
      priority: "FYI",
      from: "People Operations",
      role: "HR",
      subject: "Informational workforce update",
      message: "People Operations is informing the CEO that an operational workforce item was handled locally.",
      recs: [],
      impacts: ["No CEO decision is required"],
      signature: "Regards,\nPeople Operations\nHR"
    }, { id: "informational-lifecycle-regression", category: "people", title: "Informational workforce update" });
    renderDecisionEvent();
    assert(queuedInfo, "Informational update should queue into the visible inbox");
    assert(company.communications.length === 0, "Informational update should not become an old message before it is opened");
    assert(company.escalationQueue.length === 1, "Informational update should wait in the inbox queue");
    assert(document.getElementById("commInboxList").innerText.includes("Informational workforce update"), "Inbox should list informational update");

    const openedInfo = openQueuedMemoAt(0);
    assert(openedInfo, "Opening informational update should activate it");
    assert(company.pendingEvent?.informationalOnly === true, "Informational update should remain marked informational");
    assert(document.getElementById("decisionGrid").classList.contains("hidden"), "Informational update should not show strategic choice cards");
    assert(document.getElementById("applyDecision").innerText.includes("File Message"), "Informational update should use a file-message action");
    applyDecision();
    assert(company.pendingEvent === null, "Filing informational update should clear pending event");
    assert(company.communications.length === 1, "Filing informational update should create one old message");
    assert(company.communications[0].decision === "Filed after review", "Filed informational update should show that the CEO opened it before archiving");

    company.communications = [];
    company.escalationQueue = [prepareStrategicDecision({ ...event, id: "mislabeled-decision-regression", informationalOnly: true, choices: event.choices.map(choice => ({ ...choice })) })];
    company.pendingEvent = null;
    company.pendingCommunication = null;
    renderDecisionEvent();
    const openedMislabeledDecision = openQueuedMemoAt(0);
    assert(openedMislabeledDecision, "Mislabeled decision memo should open from inbox");
    assert(company.pendingEvent?.informationalOnly === true, "Regression fixture should remain mislabeled internally");
    assert(!document.getElementById("decisionGrid").classList.contains("hidden"), "Decision memo with three choices should not hide choices even if informational flag is set");
    assert(document.getElementById("decisionGrid").children.length === 3, "Mislabeled decision memo should still render exactly three choices");
    assert(document.getElementById("applyDecision").innerText.includes("Record CEO Decision"), "Mislabeled decision memo should still use the decision action");
    company.selected = company.pendingEvent.choices.findIndex(choice => choice.title === "Approve one critical hire");
    assert(company.selected >= 0, "Mislabeled decision memo should keep the approve-hire choice available");
    applyDecision();
    assert(company.communications[0]?.decision === "Approve one critical hire", "Mislabeled decision memo should archive the selected CEO choice, not file as informational");

    return { ok: failures.length === 0, failures, beforeReload, afterReload };
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
