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
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
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
    const protectedSnapshot = () => JSON.stringify({
      chip: company.chip,
      software: company.software,
      integration: company.integration,
      quality: company.quality,
      customers: company.customers,
      projects: (company.projects || []).map(project => ({ id: project.id, progress: project.progress, quality: project.quality, risk: project.risk, status: project.status })),
      workItems: (company.workItems || []).map(item => ({ id: item.id, progress: item.progress, status: item.status, blockedBy: item.blockedBy })),
      lessons: company.lessons || [],
      learningEpisodes: company.learningEpisodes || [],
      hiringRequests: company.hiringRequests || [],
      recruitingPipeline: company.recruitingPipeline || []
    });

    validationMode = true;
    reset(true, false, 860061);
    ensureBibleSystems();
    ensureSocialAISystems();
    ensureSocialOrganizationalSystems({ forceNormalize: true });
    const [a, b, observer, confidentialObserver] = employees.filter(employee => employee.active);
    [a, b, observer, confidentialObserver].forEach((employee, index) => {
      employee.currentRoom = "software-studio";
      employee.zone = "studio";
      employee.x = 30 + index * 3;
      employee.y = 30;
      ensureEmployeePersonality(employee);
    });
    a.personality.forgivenessRate = 1;
    b.personality.forgivenessRate = 1;

    const before = protectedSnapshot();
    const passiveMemoryCount = company.socialMemoryStore.records.length;
    recordFamiliarityObservation(observer, confidentialObserver, { roomId: "software-studio", minutes: 60, gain: 1, cooldownMinutes: 0 });
    assert(company.socialMemoryStore.records.length === passiveMemoryCount, "Passive co-presence should not create meaningful social memory");

    observer.personality.forgivenessRate = -1;
    observer.personality.structureNeed = 1;
    confidentialObserver.personality.forgivenessRate = 1;
    confidentialObserver.personality.empathy = 1;
    const encodingSource = registerSocialSourceEvent({ id: "stage7-personality-source", type: "dismissive_comment", actorId: a.id, subjectId: b.id, participantIds: [a.id, b.id], roomId: "software-studio", tone: "negative", intensity: 4, confidence: 80 });
    const encodingSourceBefore = JSON.stringify(encodingSource);
    const encodingExperience = { type: "dismissive_comment", sourceEventId: encodingSource.id, timestamp: encodingSource.timestamp, roomId: encodingSource.roomId, participants: [a.id, b.id], emotionalTone: "negative", intensity: 4, context: {} };
    const sensitiveEncoding = encodeSocialMemory(observer, b, encodingSource, encodingExperience);
    const forgivingEncoding = encodeSocialMemory(confidentialObserver, b, encodingSource, encodingExperience);
    assert(sensitiveEncoding.intensity !== forgivingEncoding.intensity || sensitiveEncoding.valence !== forgivingEncoding.valence, "Personality should create different bounded memory interpretations of the same unchanged source event");
    assert(JSON.stringify(encodingSource) === encodingSourceBefore, "Personality-based encoding must not change source-event truth");
    const conflictSource = "stage6-professional-disagreement";
    recordSharedExperience(a, b, {
      type: "professional_disagreement",
      sourceEventId: conflictSource,
      roomId: "software-studio",
      projectId: company.projects?.[0]?.id || null,
      tone: "negative",
      intensity: 4,
      actorId: a.id,
      subjectId: b.id,
      confidence: 88,
      context: { workTitle: "Release integration review", purpose: "resolve the verification approach" }
    });

    const conflict = company.socialConflicts.find(item => item.sourceEventId === conflictSource);
    assert(Boolean(conflict), "A source-backed professional disagreement should create a conflict record");
    assert(conflict?.status === "unresolved", "A new conflict should begin unresolved");
    assert(conflict?.relationshipBefore && conflict?.relationshipAfter, "Conflict debug state should preserve before and after relationship views");
    assert(conflict?.emotionalRecommendations && conflict?.personalityModifiers, "Conflict should preserve emotional recommendations and personality modifiers");
    assert((company.socialConflictDebug || []).some(item => item.conflictId === conflict?.id), "Conflict creation should produce a bounded debug trace");
    assert(protectedSnapshot() === before, "Conflict and memory processing must not mutate work, projects, hiring, or Institutional Learning");

    const conflictMemories = socialMemoryRecords(a.id, { subjectId: b.id }).filter(memory => memory.sourceEventId === conflictSource && memory.tags.includes("conflict"));
    assert(conflictMemories.length >= 1 && conflictMemories.every(memory => !memory.resolved), "Conflict memories should be directional and unresolved");
    assert(conflictMemories.every(memory => Number.isFinite(memory.ownerId) && Number.isFinite(memory.subjectId)), "Structured memories should expose canonical owner and subject employee IDs");
    assert(conflictMemories.every(memory => SOCIAL_MEMORY_RULES.types.includes(memory.type) && ["negative", "neutral", "positive", "mixed"].includes(memory.valence)), "Structured memories should use controlled memory types and valence labels");
    const firstRecall = JSON.stringify(recallMostRelevant(a.id, { subjectId: b.id, tags: ["conflict"], limit: 4 }));
    const secondRecall = JSON.stringify(recallMostRelevant(a.id, { subjectId: b.id, tags: ["conflict"], limit: 4 }));
    assert(firstRecall === secondRecall, "Relevant social recall should be deterministic and read-only");
    assert(recallByTag(a.id, b.id, ["conflict"], 3).length > 0, "The subject-aware recallByTag signature should find conflict memories");
    assert(recallMostRelevant(a.id, b.id, { roomId: "software-studio" }, 3).length > 0, "The positional recallMostRelevant signature should support person and context queries");
    const debugBefore = JSON.stringify(company.socialMemoryStore),rngBeforeDebug = company.randomState;
    socialOrganizationDebugHtml(a);
    assert(JSON.stringify(company.socialMemoryStore) === debugBefore && company.randomState === rngBeforeDebug, "Debug inspection should not mutate memory or consume simulation RNG");

    const conflictConversation = company.socialConversationState.history.find(item => item.sourceEventId === conflictSource);
    assert(Boolean(conflictConversation), "The meaningful conflict event should create the visible conversation, not a synthetic first-meeting greeting");
    assert(conflictConversation?.category === "conflict", "A professional disagreement should use the conflict conversation category");
    assert(conflictConversation?.exchanges.length >= 4 && conflictConversation?.exchanges.length <= 5, "Visible conversations should contain a greeting, topic, reply, optional follow-up, and goodbye");
    assert(conflictConversation?.exchanges.every(exchange => !/\{\w+\}/.test(exchange.text)), "Visible conversation text must not contain unresolved template placeholders");
    assert(conflictConversation?.contexts?.[a.id]?.relationship && conflictConversation?.contexts?.[a.id]?.recentMemoryIds, "Conversation context should include relationship, memory, emotion, location, and time data");
    const selectionSignals = socialDialogueSelectionSignals(a, "conflict", conflictConversation.contexts[a.id]);
    assert(selectionSignals.relationship && selectionSignals.emotion && Array.isArray(selectionSignals.recentCategories), "Template rotation should consider the listener relationship, current emotion, and recent category history");
    assert((company.socialConversationState.recentCategoryHistory[a.id] || []).includes("conflict"), "Conversation rotation should retain bounded recent category history");
    const directTemplate = SOCIAL_DIALOGUE_TEMPLATES.conflict.find(template => template.id.endsWith("-0"));
    const contextualTemplate = SOCIAL_DIALOGUE_TEMPLATES.conflict.find(template => template.id.endsWith("-2"));
    assert(dialogueTemplateWeight(directTemplate, a, b, "conflict", socialSourceEventById(conflictSource), 0, conflictConversation.contexts[a.id]) !== dialogueTemplateWeight(contextualTemplate, a, b, "conflict", socialSourceEventById(conflictSource), 0, conflictConversation.contexts[a.id]), "Relationship and emotion signals should produce a weighted deterministic template ranking");
    assert(!conflictConversation?.facts?.cultureStatement || company.socialCulture.evidence.some(evidence => evidence.sourceEventId === conflictSource), "Any culture statement must be backed by culture evidence from the same source event");
    assert((company.socialConversationState.knowledge[observer.id] || []).some(item => item.sourceEventId === conflictSource), "A nearby attentive employee should be able to overhear an ordinary conversation");
    assert(!(company.socialConversationState.knowledge[confidentialObserver.id] || []).some(item => item.sourceEventId === "stage8-confidential"), "Confidential information should never be overheard");

    company.minute += SOCIAL_CONVERSATION_RULES.approachDurationMinutes;
    processVisibleConversationsMinute();
    buildOffice(true);
    render();
    renderVisibleConversations();
    const firstBubble = document.querySelector(`[data-conversation-id="${conflictConversation.id}"]`);
    renderVisibleConversations();
    const secondBubble = document.querySelector(`[data-conversation-id="${conflictConversation.id}"]`);
    assert(Boolean(firstBubble) && firstBubble === secondBubble, "Office redraws should reuse a visible speech bubble instead of recreating it");
    const bubbleBounds = firstBubble?.getBoundingClientRect();
    assert(!bubbleBounds || (bubbleBounds.left >= -1 && bubbleBounds.right <= window.innerWidth + 1), "A phone-width speech bubble should stay inside the viewport");
    assert(document.documentElement.scrollWidth <= window.innerWidth + 1, "Visible conversations should not create horizontal page overflow on phones");
    document.querySelector(".workspace-tabs")?.classList.add("active");
    document.getElementById("socialOrganizationWrap")?.classList.remove("collapsed");
    renderSocialOrganizationPanel();
    const socialPanel = document.getElementById("socialOrganizationPanel");
    assert(!socialPanel || socialPanel.scrollWidth <= socialPanel.clientWidth + 1, "The People and Culture panel should fit a phone viewport without horizontal overflow");

    const frustrationBeforeHomeostasis = a.emotionalState.frustration;
    for (let index = 0; index < 120; index++) emotionalSystem.homeostasis(a);
    assert(a.emotionalState.frustration < frustrationBeforeHomeostasis, "Temporary conflict frustration should fade through Emotional System homeostasis");

    company.minute += Math.max(SOCIAL_ORGANIZATION_RULES.conflict.minimumRepairAgeMinutes, SOCIAL_CONVERSATION_RULES.conversationCooldownMinutes) + 1;
    const repairSource = "stage6-constructive-follow-up";
    recordSharedExperience(a, b, {
      type: "constructive_feedback",
      sourceEventId: repairSource,
      roomId: "software-studio",
      tone: "positive",
      intensity: 4,
      actorId: a.id,
      subjectId: b.id,
      confidence: 90,
      context: { workTitle: "Release integration review", outcome: "the disagreement was clarified" }
    });
    assert(conflict.status === "resolved", "A credible, accepted follow-up should resolve the linked conflict");
    assert(conflict.resolutionSourceEventId === repairSource, "Repair should retain an explicit link to its source event");
    assert(conflict.repairAttempts.some(attempt => attempt.accepted), "Conflict history should preserve the accepted repair attempt");
    const acceptedRepairTrace = (company.socialConflictDebug || []).find(item => item.sourceEventId === repairSource);
    assert(acceptedRepairTrace?.evidenceMemoryIds?.length > 0 && acceptedRepairTrace?.emotionalRecommendations, "Repair diagnostics should retain the evidence and emotional recommendation used for the decision");
    assert(JSON.stringify(acceptedRepairTrace?.relationshipAfter) === JSON.stringify(conflict.relationshipAfter), "Repair diagnostics should capture the final re-derived relationship state");
    const repairedMemories = socialMemoryRecords(a.id, { subjectId: b.id }).filter(memory => memory.sourceEventId === repairSource);
    assert(repairedMemories.some(memory => memory.tags.includes("repair")), "Only a repair linked to an actual conflict should receive a repair tag");
    assert((company.socialMemoryDebug || []).some(item => item.type === "emotional-recall"), "A contextual conversation should evaluate bounded emotional memory recall");
    const repeatedRecall = applySocialMemoryRecallRecommendation(a, b, socialSourceEventById(repairSource), "repair");
    assert(!repeatedRecall || repeatedRecall.status === "cooldown", "Memory recall cooldowns should prevent repeated emotional spam from the same relationship context");

    observer.personality.forgivenessRate = -1;
    confidentialObserver.personality.forgivenessRate = -1;
    const rejectedConflictSource = "stage6-rejected-conflict";
    recordSharedExperience(observer, confidentialObserver, {
      type: "dismissive_comment",
      sourceEventId: rejectedConflictSource,
      roomId: "software-studio",
      tone: "negative",
      intensity: 5,
      actorId: observer.id,
      subjectId: confidentialObserver.id,
      confidence: 90
    });
    company.minute += SOCIAL_ORGANIZATION_RULES.conflict.minimumRepairAgeMinutes + 1;
    const rejectedRepairSource = "stage6-rejected-apology";
    recordSharedExperience(observer, confidentialObserver, {
      type: "apology",
      sourceEventId: rejectedRepairSource,
      roomId: "software-studio",
      tone: "positive",
      intensity: 1,
      actorId: observer.id,
      subjectId: confidentialObserver.id,
      confidence: 65
    });
    const rejectedConflict = company.socialConflicts.find(item => item.sourceEventId === rejectedConflictSource);
    assert(rejectedConflict?.status === "repair_attempted" && rejectedConflict?.repairAttempts.some(attempt => !attempt.accepted), "A weak repair between low-forgiveness employees should remain unresolved and preserve the ignored attempt");
    assert(socialMemoryRecords(observer.id, { subjectId: confidentialObserver.id }).some(memory => memory.sourceEventId === rejectedConflictSource), "Rejected repair must preserve the original conflict memory");
    assert(socialMemoryRecords(observer.id, { subjectId: confidentialObserver.id }).some(memory => memory.sourceEventId === rejectedRepairSource), "Rejected repair must preserve the attempted repair memory");

    const confidentialBefore = (company.socialConversationState.history || []).length;
    recordSharedExperience(a, confidentialObserver, {
      type: "conversation",
      sourceEventId: "stage8-confidential",
      roomId: "software-studio",
      privacy: "confidential",
      tone: "neutral",
      intensity: 2,
      context: { purpose: "a protected personnel matter" }
    });
    assert(company.socialConversationState.history.length === confidentialBefore, "Confidential events should not create visible speech bubbles");
    assert(!(company.socialConversationState.knowledge[observer.id] || []).some(item => item.sourceEventId === "stage8-confidential"), "Confidential events should not create overheard knowledge");

    const templateCounts = Object.fromEntries(Object.entries(SOCIAL_DIALOGUE_TEMPLATES).map(([category, templates]) => [category, templates.length]));
    assert(SOCIAL_CONVERSATION_RULES.categories.length === 15, "The visible conversation system should expose all 15 required categories");
    assert(Object.values(templateCounts).every(count => count >= 40 && count <= 60), "Every conversation category should contain 40 to 60 deterministic templates");

    for (let index = 0; index < 42; index++) {
      recordSharedExperience(a, b, {
        type: "shared_break",
        sourceEventId: `stage7-routine-${index}`,
        roomId: "software-studio",
        tone: "neutral",
        intensity: 1
      });
    }
    const boundedRelationship = socialRelationshipRecord(a.id, b.id, { create: false });
    assert((boundedRelationship?.recentExperiences || []).every(experience =>
      !("employeeReactions" in experience) &&
      !("relationshipBefore" in experience) &&
      !("relationshipAfter" in experience) &&
      !("context" in experience)
    ), "Relationship history should retain compact evidence instead of duplicating full source-event and reaction snapshots");
    for (let index = 0; index < SOCIAL_ORGANIZATION_RULES.maxRelationshipCooldowns + 20; index++) {
      boundedRelationship.cooldowns[`bounded-test-${index}`] = simulationTimestamp().absoluteMinute - index;
    }
    pruneSocialRelationshipCooldowns(boundedRelationship);
    assert(Object.keys(boundedRelationship.cooldowns).length <= SOCIAL_ORGANIZATION_RULES.maxRelationshipCooldowns, "Relationship event cooldowns should remain bounded");
    assert(socialMemoryRecords(a.id, { subjectId: b.id }).length <= SOCIAL_MEMORY_RULES.perRelationshipCap, "Directional relationship memory should honor its configured cap");
    assert(company.socialMemoryStore.compressedCount > 0, "Memory overflow should be deterministically compressed into summaries");

    const routineMemory = socialMemoryRecords(a.id, { subjectId: b.id }).find(memory => memory.sourceEventId === "stage7-routine-41");
    company.day += SOCIAL_MEMORY_RULES.routineDecayDays * 2 + 1;
    processSocialOrganizationDaily();
    assert(!routineMemory || !company.socialMemoryStore.records.some(memory => memory.id === routineMemory.id), "Old low-intensity routine memories should age into compressed summaries");

    const storedBeforeSave = JSON.stringify(canonicalize({
      conflicts: company.socialConflicts,
      memories: company.socialMemoryStore,
      conversations: company.socialConversationState,
      culture: company.socialCulture,
      groups: company.informalGroups,
      leadership: company.socialLeadership
    }));
    saveGame();
    assert(loadGame(), "The social-system state should load from a normal save");
    ensureSocialAISystems();
    ensureSocialOrganizationalSystems({ forceNormalize: true });
    const storedAfterLoad = JSON.stringify(canonicalize({
      conflicts: company.socialConflicts,
      memories: company.socialMemoryStore,
      conversations: company.socialConversationState,
      culture: company.socialCulture,
      groups: company.informalGroups,
      leadership: company.socialLeadership
    }));
    assert(storedAfterLoad === storedBeforeSave, "Conflict, memory, conversation, culture, group, and leadership state should survive save/load exactly");

    return { ok: failures.length === 0, failures, templateCounts };
  });

  await browser.close();
  if (runtimeErrors.length || !result.ok) {
    console.error([...runtimeErrors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Social conflict, memory, and visible-conversation regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
