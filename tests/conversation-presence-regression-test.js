const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

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
  const runtimeErrors = [];
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", error => runtimeErrors.push(`PAGE: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") runtimeErrors.push(`CONSOLE: ${message.text()}`);
  });

  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    const canonicalize = value => {
      if (Array.isArray(value)) return value.map(canonicalize);
      if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
      return value;
    };
    const firstDifference = (left, right, path = "root") => {
      if (Object.is(left, right)) return null;
      if (typeof left !== typeof right || left === null || right === null) return `${path}: ${JSON.stringify(left)} != ${JSON.stringify(right)}`;
      if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return `${path}.length: ${left?.length} != ${right?.length}`;
        for (let index = 0; index < left.length; index++) {
          const difference = firstDifference(left[index], right[index], `${path}[${index}]`);
          if (difference) return difference;
        }
        return null;
      }
      if (typeof left === "object") {
        const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
        for (const key of keys) {
          if (!(key in left) || !(key in right)) return `${path}.${key}: key missing`;
          const difference = firstDifference(left[key], right[key], `${path}.${key}`);
          if (difference) return difference;
        }
        return null;
      }
      return `${path}: ${JSON.stringify(left)} != ${JSON.stringify(right)}`;
    };
    const positionEmployees = (left, right) => {
      [left, right].forEach((employee, index) => {
        employee.currentRoom = "software-studio";
        employee.zone = "studio";
        employee.x = 34 + index * 8;
        employee.y = 34;
        employee.offsite = false;
        employee.action = "taking a break";
        employee.stress = 35;
        employee.morale = 70;
        employee.conversationPresence = null;
      });
    };
    const advanceTo = absoluteMinute => {
      company.day = Math.floor(absoluteMinute / OFFICE_AQUARIUM_CONSTANTS.time.minutesPerDay);
      company.minute = absoluteMinute % OFFICE_AQUARIUM_CONSTANTS.time.minutesPerDay;
      processVisibleConversationsMinute();
    };

    validationMode = true;
    reset(true, false, 401040);
    ensureBibleSystems();
    ensureSocialAISystems();
    ensureSocialOrganizationalSystems({ forceNormalize: true });
    const [a, b] = employees.filter(employee => employee.active);
    positionEmployees(a, b);
    a.personality.sociability = -.85;
    a.personality.riskTolerance = .1;
    a.personality.structureNeed = -.2;
    b.personality.sociability = .9;
    b.personality.riskTolerance = -.4;
    b.personality.structureNeed = -.2;

    const templateCounts = Object.fromEntries(Object.entries(SOCIAL_DIALOGUE_TEMPLATES).map(([category, templates]) => [category, templates.length]));
    assert(Object.values(templateCounts).every(count => count >= SOCIAL_CONVERSATION_RULES.templatesPerCategory && count <= SOCIAL_CONVERSATION_RULES.maxTemplatesPerCategory), "Every dialogue category should meet the centralized 40-60 template target");
    const triggerExpectations = [
      [{ type: "conversation", roomId: "software-studio" }, "passing-coworker", "casual"],
      [{ type: "shared_meeting" }, "meeting-transition", "meetings"],
      [{ type: "help_request" }, "help-request", "help_request"],
      [{ type: "task_completed" }, "task-finished", "celebration"],
      [{ type: "blocker_resolved_together" }, "blocker-resolved", "blockers"],
      [{ type: "milestone_success_together" }, "milestone", "celebration"],
      [{ type: "professional_disagreement" }, "conflict", "conflict"],
      [{ type: "apology" }, "repair", "repair"],
      [{ type: "mentoring_interaction" }, "mentoring", "mentoring"],
      [{ type: "shared_break", roomId: "break-area" }, "break", "casual"],
      [{ type: "department_return" }, "department-return", "current_work"],
      [{ type: "deadline_pressure_together" }, "deadline", "deadlines"],
      [{ type: "successful_collaboration", category: "appreciation" }, "work-coordination", "appreciation"],
      [{ type: "recognition_shared" }, "milestone", "recognition"],
      [{ type: "company_announcement", category: "company_news" }, "company-news", "company_news"]
    ];
    triggerExpectations.forEach(([event, expectedTrigger, expectedCategory]) => {
      assert(groundedConversationTriggerForEvent(event) === expectedTrigger, `${event.type} should map to the grounded ${expectedTrigger} trigger`);
      assert(conversationCategoryForEvent(event) === expectedCategory, `${event.type} should use the ${expectedCategory} dialogue category`);
    });

    const invalidBefore = company.socialConversationState.history.length;
    recordSharedExperience(a, b, {
      type: "random_chat",
      sourceEventId: "conversation-invalid-random",
      roomId: "software-studio",
      tone: "neutral",
      intensity: 1
    });
    assert(company.socialConversationState.history.length === invalidBefore, "An event without an approved grounded trigger must not create a conversation");

    const firstSource = "conversation-help-grounding";
    recordSharedExperience(a, b, {
      type: "direct_help",
      sourceEventId: firstSource,
      roomId: "software-studio",
      tone: "positive",
      intensity: 3,
      actorId: a.id,
      subjectId: b.id,
      category: "giving_help",
      confidence: 90,
      context: { workTitle: "Memory controller driver", purpose: "review the interface change" }
    });
    const first = company.socialConversationState.history.find(conversation => conversation.sourceEventId === firstSource);
    assert(Boolean(first), "A real help event should create a grounded conversation");
    assert(first?.triggerType === "help-request" && first?.triggerEvidenceId === firstSource, "The conversation should retain its real trigger and source evidence");
    assert(first?.exchanges[0]?.intent === "greeting" && first?.exchanges.at(-1)?.intent === "goodbye" && first?.exchanges.some(exchange => exchange.intent === "reply"), "Conversation flow should include greeting, topic, reply, and goodbye");
    assert(first?.exchanges.every(exchange => exchange.templateId && exchange.voiceStyle && !/\{\w+\}/.test(exchange.text)), "Every exchange should retain intent-selected wording without unresolved facts");
    assert(first?.exchanges.filter(exchange => exchange.speakerId === a.id).every(exchange => exchange.voiceStyle === "reserved"), "A reserved employee should use reserved wording");
    assert(first?.exchanges.filter(exchange => exchange.speakerId === b.id && exchange.intent !== "goodbye").every(exchange => exchange.voiceStyle === "extrovert"), "An extroverted employee should use extroverted wording");
    assert(first?.exchangeSchedule.length === first?.exchanges.length && first?.resumeAt > first?.endAtAbsoluteMinute, "Every exchange should have a readable timing schedule followed by a resume phase");
    assert(conversationLineDurationMinutes("This is short.", "topic") < conversationLineDurationMinutes("This sentence deliberately contains substantially more words so the player has enough time to read the complete thought.", "topic"), "Longer dialogue should remain visible longer");

    const stagedDistance = employeeDistance(a, b);
    assert(stagedDistance >= SOCIAL_CONVERSATION_RULES.personalSpacePercent * .8, "Conversation participants should retain personal space");
    assert(a.conversationPresence?.phase === "approach" && b.conversationPresence?.phase === "approach", "Participants should approach before speaking");
    assert(a.conversationPresence?.facing !== b.conversationPresence?.facing, "Participants should face one another");
    assert(a.motion?.easing === "accelerate-decelerate" && b.motion?.easing === "accelerate-decelerate", "Conversation movement should use accelerated and decelerated motion");
    const stagedX = a.x;
    moveToZone(a, "lab");
    assert(a.x === stagedX && a.officeFlow?.pendingPosition?.zone === "lab", "A work transition during a visible conversation should defer only the on-screen move");

    advanceTo(first.conversationStartAt);
    buildOffice(true);
    render();
    renderVisibleConversations();
    const bubble = document.querySelector(`[data-conversation-id="${first.id}"]`);
    const speaker = socialEmployee(first.exchanges[first.currentExchangeIndex].speakerId);
    const speakerNode = document.getElementById(`agent-${speaker.id}`);
    assert(Boolean(bubble), "The current scheduled exchange should render a speech bubble");
    assert(speakerNode?.classList.contains("conversation-speaking"), "The current speaker should remain animated while talking");
    assert(getComputedStyle(speakerNode).transitionTimingFunction !== "linear", "Office movement should not use a constant linear speed");

    advanceTo(first.endAtAbsoluteMinute);
    assert(first.phase === "resume" && a.motion?.reason === "conversation-resume" && b.motion?.reason === "conversation-resume", "Participants should turn and resume their prior activity after the goodbye");
    assert(a.zone === "lab" && a.currentRoom === "hardware-lab" && !a.officeFlow?.pendingPosition, "The deferred work destination should become visible after the goodbye");
    advanceTo(first.resumeAt + 1);
    assert(first.phase === "completed" && !a.conversationPresence && !b.conversationPresence, "Completed conversations should release both employees");

    company.minute += SOCIAL_CONVERSATION_RULES.conversationCooldownMinutes + 1;
    positionEmployees(a, b);
    const secondSource = "conversation-memory-follow-up";
    recordSharedExperience(a, b, {
      type: "successful_collaboration",
      sourceEventId: secondSource,
      roomId: "software-studio",
      tone: "positive",
      intensity: 3,
      actorId: a.id,
      subjectId: b.id,
      category: "appreciation",
      confidence: 92,
      context: { workTitle: "Memory controller driver", outcome: "the interface change passed review" }
    });
    const second = company.socialConversationState.history.find(conversation => conversation.sourceEventId === secondSource);
    assert(Boolean(second?.memoryReferences?.[a.id] || second?.memoryReferences?.[b.id]), "A later conversation should be able to reference a real prior shared memory");
    assert(second?.exchanges.some(exchange => /again|last|earlier|before|appreciate/i.test(exchange.text)), "Source-backed prior history should appear naturally in later dialogue");
    const firstTemplateIds = new Set(first.exchanges.map(exchange => exchange.templateId));
    assert(second?.exchanges.every(exchange => !firstTemplateIds.has(exchange.templateId)), "The same employee pair should prefer unused wording before repeating templates");
    assert(company.socialConversationState.pairHistory[makeRelationshipKey(a.id, b.id)]?.recentTopics.length >= 2, "Pair history should retain bounded recent topics");
    assert(company.socialConversationState.recentPartnersByEmployee[a.id]?.[0] === b.id, "Recent conversation partners should be tracked per employee");

    advanceTo(second.resumeAt + 1);
    company.minute += SOCIAL_CONVERSATION_RULES.conversationCooldownMinutes + 1;
    positionEmployees(a, b);
    a.action = "working";
    a.stress = SOCIAL_CONVERSATION_RULES.criticalStressThreshold + 2;
    const criticalBefore = company.socialConversationState.history.length;
    recordSharedExperience(a, b, {
      type: "conversation",
      sourceEventId: "conversation-critical-interruption",
      roomId: "software-studio",
      tone: "neutral",
      intensity: 1
    });
    assert(company.socialConversationState.history.length === criticalBefore, "Casual dialogue should not interrupt an employee in a critical work state");
    recordSharedExperience(a, b, {
      type: "help_request",
      sourceEventId: "conversation-critical-help",
      roomId: "software-studio",
      tone: "neutral",
      intensity: 2,
      context: { workTitle: "Release verification" }
    });
    assert(company.socialConversationState.history.some(conversation => conversation.sourceEventId === "conversation-critical-help"), "A relevant help request should still be allowed during critical work");

    const storedConversationState = canonicalize(company.socialConversationState);
    const storedPresence = canonicalize(employees.map(employee => employee.conversationPresence));
    saveGame();
    assert(loadGame(), "Conversation and presence state should load from a normal save");
    ensureSocialOrganizationalSystems({ forceNormalize: true });
    const loadedConversationState = canonicalize(company.socialConversationState);
    const loadedPresence = canonicalize(employees.map(employee => employee.conversationPresence));
    assert(JSON.stringify(loadedConversationState) === JSON.stringify(storedConversationState), `Pair history, timing, triggers, and transcript state should survive save/load (${firstDifference(storedConversationState, loadedConversationState) || "unknown difference"})`);
    assert(JSON.stringify(loadedPresence) === JSON.stringify(storedPresence), `Active physical-presence state should survive save/load (${firstDifference(storedPresence, loadedPresence) || "unknown difference"})`);

    reset(true, false, 401041);
    ensureBibleSystems();
    ensureSocialAISystems();
    ensureSocialOrganizationalSystems({ forceNormalize: true });
    const [taskOwner, taskPeer, returningEmployee, returnPeer, staleActor, staleSubject] = employees.filter(employee => employee.active);
    positionEmployees(taskOwner, taskPeer);
    const completedWork = {
      id: "conversation-completed-work",
      title: "Close memory controller verification",
      assignedTeam: "software",
      ownerId: taskOwner.id,
      collaborators: [taskPeer.id],
      projectId: null,
      priority: 80,
      progress: 100,
      status: "open"
    };
    assert(Boolean(recordCompletedWorkConversationOpportunity(completedWork)), "Completing real work should create a source-backed conversation opportunity when a coworker participated");
    const taskConversation = company.socialConversationState.history.find(conversation => conversation.sourceEventId === `work-completed-${completedWork.id}`);
    assert(taskConversation?.triggerType === "task-finished" && taskConversation?.facts?.workTitle === completedWork.title, "Task-completion dialogue should retain the completed work as evidence");
    assert(!company.socialRelationships[makeRelationshipKey(taskOwner.id, taskPeer.id)], "A presentation-only task-completion conversation must not fabricate a relationship outcome");

    returningEmployee.currentRoom = "software-studio";
    returningEmployee.zone = "dev";
    returningEmployee.homeRoom = "hardware-lab";
    returningEmployee.homeZone = "lab";
    returningEmployee.offsite = false;
    returningEmployee.conversationPresence = null;
    returnPeer.currentRoom = "hardware-lab";
    returnPeer.zone = "lab";
    returnPeer.offsite = false;
    returnPeer.conversationPresence = null;
    moveToZone(returningEmployee, "lab");
    const returnConversation = company.socialConversationState.history.find(conversation => conversation.sourceEventId.startsWith(`department-return-${returningEmployee.id}-`));
    assert(returnConversation?.triggerType === "department-return" && returnConversation?.roomId === "hardware-lab", "Returning from another department should create a grounded office-flow opportunity");

    positionEmployees(staleActor, staleSubject);
    const staleTimestamp = simulationTimestamp(company.day, company.minute - SOCIAL_CONVERSATION_RULES.sourceEventMaxAgeMinutes - 1);
    const staleExperience = {
      type: "direct_help",
      sourceEventId: "conversation-stale-source",
      actorId: staleActor.id,
      subjectId: staleSubject.id,
      roomId: "software-studio",
      timestamp: staleTimestamp,
      context: { workTitle: "Old verification request" }
    };
    const staleEvent = registerSocialSourceEvent({
      id: staleExperience.sourceEventId,
      type: staleExperience.type,
      actorId: staleActor.id,
      subjectId: staleSubject.id,
      participantIds: [staleActor.id, staleSubject.id],
      roomId: staleExperience.roomId,
      timestamp: staleTimestamp,
      context: staleExperience.context
    });
    assert(createGroundedConversationFromExperience(staleExperience, staleEvent) === null, "An expired source event must not start a new visible conversation");

    reset(true, false, 401044);
    ensureBibleSystems();
    ensureSocialAISystems();
    ensureSocialOrganizationalSystems({ forceNormalize: true });
    const [blockerOwner, blockerPeer] = employees.filter(employee => employee.active);
    employees.forEach(employee => { employee.offsite = ![blockerOwner.id, blockerPeer.id].includes(employee.id); });
    positionEmployees(blockerOwner, blockerPeer);
    const blockedWork = {
      id: "conversation-real-blocker",
      title: "Resolve memory interface mismatch",
      assignedTeam: employeeTeam(blockerOwner),
      ownerId: blockerOwner.id,
      collaborators: [blockerPeer.id],
      requiredSkills: {},
      blockedBy: ["missing interface specification"],
      progress: 45,
      qualityRisk: 60,
      priority: 78,
      deadlineDay: company.day + 4,
      createdDay: company.day,
      status: "open",
      stage: "Blocked"
    };
    company.workItems = [blockedWork];
    blockerOwner.activeCollaboration = {
      partnerId: blockerPeer.id,
      workItemId: blockedWork.id,
      sourceEventId: "conversation-blocker-collaboration"
    };
    for (let attempt = 0; attempt < 50 && blockedWork.blockedBy.length; attempt++) {
      updateEmployeeWorkContribution(blockerOwner, 1);
    }
    const blockerConversation = company.socialConversationState.history.find(conversation => conversation.sourceEventId.startsWith(`work-unblocked-${blockedWork.id}-`));
    assert(blockedWork.blockedBy.length === 0, "The deterministic blocker scenario should resolve the real work-item blocker");
    assert(blockerConversation?.triggerType === "blocker-resolved" && blockerConversation?.category === "blockers", "A real resolved work-item blocker should use blocker dialogue rather than generic help dialogue");
    const blockerTopicLines = (blockerConversation?.exchanges || []).filter(exchange => !["greeting", "goodbye"].includes(exchange.intent)).map(exchange => exchange.text);
    assert(blockerTopicLines.length >= 2 && blockerTopicLines.every(line => /cleared|resolved|continue|move again|remember/i.test(line) && !/is blocked|holding up|cannot move|need help clearing/i.test(line)), "Resolved-blocker dialogue should describe the completed resolution rather than report the old blocker as current");

    reset(true, false, 401042);
    ensureBibleSystems();
    ensureSocialAISystems();
    ensureSocialOrganizationalSystems({ forceNormalize: true });
    const [repairActor, repairSubject] = employees.filter(employee => employee.active);
    employees.forEach(employee => { employee.offsite = ![repairActor.id, repairSubject.id].includes(employee.id); });
    positionEmployees(repairActor, repairSubject);
    repairActor.personality.forgivenessRate = 1;
    repairActor.personality.empathy = 1;
    repairSubject.personality.forgivenessRate = 1;
    repairSubject.personality.empathy = 1;
    recordSharedExperience(repairActor, repairSubject, {
      type: "professional_disagreement",
      sourceEventId: "conversation-autonomous-repair-conflict",
      roomId: "software-studio",
      tone: "negative",
      intensity: 2,
      actorId: repairActor.id,
      subjectId: repairSubject.id,
      context: { workTitle: "Integration handoff", purpose: "agree on the verification order" }
    });
    const repairConflict = company.socialConflicts.find(conflict => conflict.sourceEventId === "conversation-autonomous-repair-conflict");
    const conflictConversation = company.socialConversationState.history.find(conversation => conversation.sourceEventId === "conversation-autonomous-repair-conflict");
    const repairReadyAt = Math.max(
      conflictConversation?.resumeAt + 1 || 0,
      socialTimestampValue(repairConflict.createdAt) + SOCIAL_ORGANIZATION_RULES.conflict.automaticRepair.ageMinutes + 1
    );
    advanceTo(repairReadyAt);
    positionEmployees(repairActor, repairSubject);
    observeRoomFamiliarity(5);
    const automaticRepairConversation = company.socialConversationState.history.find(conversation => conversation.sourceEventId.startsWith(`conflict-repair-${repairConflict.id}-`));
    assert(repairConflict?.repairAttempts?.length === 1, "A personality-supported repair opportunity should create one attributable repair attempt after the conflict cools");
    assert(automaticRepairConversation?.triggerType === "repair" && automaticRepairConversation?.category === "repair", "An autonomous conflict repair should produce a grounded repair conversation");

    reset(true, false, 401043);
    ensureBibleSystems();
    ensureSocialAISystems();
    ensureSocialOrganizationalSystems({ forceNormalize: true });
    const [mentor, newHire] = employees.filter(employee => employee.active);
    employees.forEach(employee => { employee.offsite = ![mentor.id, newHire.id].includes(employee.id); });
    positionEmployees(mentor, newHire);
    newHire.performanceManagement = { ...(newHire.performanceManagement || {}), stage: "onboarding" };
    newHire.joinedDay = company.day;
    newHire.onboarding = {
      startDay: company.day,
      duration: WORKFORCE_HIRING_RULES.onboarding.defaultDurationDays,
      quality: 70,
      mentorId: mentor.id,
      mentorConversationRecorded: false,
      productivity: WORKFORCE_HIRING_RULES.onboarding.startingProductivityPercent,
      projectId: null
    };
    observeRoomFamiliarity(5);
    const mentorSource = `onboarding-mentor-${newHire.id}-${newHire.onboarding.startDay}`;
    const mentoringConversation = company.socialConversationState.history.find(conversation => conversation.sourceEventId === mentorSource);
    assert(newHire.onboarding.mentorConversationRecorded === true, "A new hire should record the first grounded mentor conversation after real co-presence");
    assert(mentoringConversation?.triggerType === "mentoring" && mentoringConversation?.category === "mentoring", "Onboarding support should create a grounded mentoring conversation");

    const deterministicScenario = () => {
      reset(true, false, 401040);
      ensureBibleSystems();
      ensureSocialAISystems();
      ensureSocialOrganizationalSystems({ forceNormalize: true });
      const [left, right] = employees.filter(employee => employee.active);
      positionEmployees(left, right);
      recordSharedExperience(left, right, {
        type: "shared_meeting",
        sourceEventId: "conversation-deterministic",
        roomId: "software-studio",
        tone: "neutral",
        intensity: 2,
        context: { purpose: "release planning", workTitle: "Release plan" }
      });
      const conversation = company.socialConversationState.history.find(item => item.sourceEventId === "conversation-deterministic");
      return JSON.stringify(canonicalize({
        randomState: company.randomState,
        exchanges: conversation?.exchanges,
        schedule: conversation?.exchangeSchedule,
        presence: conversation?.presence,
        topicKey: conversation?.topicKey
      }));
    };
    const deterministicA = deterministicScenario();
    const deterministicB = deterministicScenario();
    assert(deterministicA === deterministicB, "The same seed and source event should replay identical dialogue, timing, and movement");

    return { ok: failures.length === 0, failures, templateCounts };
  });

  await browser.close();
  if (runtimeErrors.length || !result.ok) {
    console.error([...runtimeErrors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, templateCounts: result.templateCounts }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
