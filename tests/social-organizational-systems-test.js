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
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
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
    const protectedSnapshot = () => JSON.stringify({
      product: [company.chip, company.software, company.integration, company.quality, company.customers],
      projects: (company.projects || []).map(project => [project.id, project.progress, project.quality, project.risk, project.status]),
      work: (company.workItems || []).map(item => [item.id, item.progress, item.status, item.blockedBy]),
      learning: [company.lessons || [], company.learningEpisodes || []],
      hiring: [company.hiringRequests || [], company.recruitingPipeline || []]
    });

    validationMode = true;
    reset(true, false, 860062);
    ensureBibleSystems();
    ensureSocialAISystems();
    ensureSocialOrganizationalSystems({ forceNormalize: true });
    assert(Array.isArray(company.socialMemoryDebug), "New and migrated companies should initialize social-memory diagnostics");
    assert(Array.isArray(company.socialConflictDebug), "New and migrated companies should initialize conflict diagnostics");
    assert(company.projectTeamChemistry && typeof company.projectTeamChemistry === "object", "New and migrated companies should initialize project-team chemistry");
    assert(company.socialOrganizationView === "culture", "New companies should begin on the Culture view");
    const [leader, teammate, crossTeam, passiveA, passiveB, groupB1, groupB2] = employees.filter(employee => employee.active);
    [leader, teammate, crossTeam, passiveA, passiveB, groupB1, groupB2].forEach((employee, index) => {
      employee.currentRoom = "meeting-room";
      employee.zone = "meeting";
      employee.x = 24 + index * 4;
      employee.y = 25;
      ensureEmployeePersonality(employee);
    });
    leader.role = "Manager";
    const before = protectedSnapshot();
    const cultureBefore = company.socialCulture.dimensions.collaboration.value;

    for (let index = 0; index < 5; index++) {
      recordSharedExperience(leader, teammate, {
        type: index % 2 ? "direct_help" : "mentoring_interaction",
        sourceEventId: `final-help-${index}`,
        roomId: "meeting-room",
        tone: "positive",
        intensity: 4,
        actorId: leader.id,
        subjectId: teammate.id,
        confidence: 88
      });
      recordSharedExperience(teammate, crossTeam, {
        type: "successful_collaboration",
        sourceEventId: `final-cross-team-${index}`,
        roomId: "meeting-room",
        tone: "positive",
        intensity: 3,
        actorId: teammate.id,
        subjectId: crossTeam.id,
        confidence: 82
      });
    }
    for (let index = 0; index < 4; index++) {
      recordSharedExperience(teammate, crossTeam, {
        type: "mentoring_interaction",
        sourceEventId: `final-informal-leadership-${index}`,
        roomId: "meeting-room",
        tone: "positive",
        intensity: 4,
        actorId: teammate.id,
        subjectId: crossTeam.id,
        confidence: 86
      });
    }
    for (let index = 0; index < 20; index++) {
      recordFamiliarityObservation(passiveA, passiveB, { roomId: "meeting-room", minutes: 60, gain: 1, cooldownMinutes: 0 });
      company.minute += 1;
    }
    for (let index = 0; index < 8; index++) {
      recordSharedExperience(groupB1, groupB2, {
        type: "direct_help",
        sourceEventId: `final-second-group-${index}`,
        roomId: "meeting-room",
        tone: "positive",
        intensity: 4,
        confidence: 82
      });
    }
    company.day += 1;
    updateSocialCulture();
    deriveInformalGroups();
    updateSocialLeadership();

    assert(protectedSnapshot() === before, "Culture, groups, and leadership must not mutate work, projects, hiring, or Institutional Learning");
    const cultureAfter = company.socialCulture.dimensions.collaboration.value;
    assert(cultureAfter > cultureBefore, "Repeated source-backed help should begin moving collaboration culture");
    assert(Math.abs(cultureAfter - cultureBefore) <= SOCIAL_CULTURE_RULES.dailyMaxDrift + .0001, "Culture should drift no faster than the shared daily constant");
    assert(company.socialCulture.dimensions.collaboration.evidenceCount > 0, "Culture values should retain contributing evidence and confidence");

    const group = company.informalGroups.find(item => item.memberIds.includes(leader.id) && item.memberIds.includes(teammate.id));
    assert(Boolean(group), "Repeated meaningful interaction should be able to form an informal group");
    assert(["type", "cohesion", "stability", "sharedHistoryScore", "conflictScore", "knowledgeFlowScore", "formedAt", "lastConfirmedAt", "confidence", "sourceEvidenceIds"].every(key => group && group[key] !== undefined), "Informal groups should expose the full derived lifecycle schema");
    assert(!(company.informalGroups || []).some(item => item.memberIds.includes(passiveA.id) && item.memberIds.includes(passiveB.id)), "Passive co-presence alone must not form an informal group");
    assert((company.informalGroups || []).some(item => item.memberIds.includes(groupB1.id) && item.memberIds.includes(groupB2.id)), "A second evidence-backed group should form independently");
    const stableGroups = JSON.stringify(company.informalGroups);
    deriveInformalGroups();
    assert(JSON.stringify(company.informalGroups) === stableGroups, "Repeated group derivation on unchanged same-day state should be deterministic and idempotent");

    company.minute += SOCIAL_CONVERSATION_RULES.conversationCooldownMinutes + 1;
    const groundedSource = "final-grounded-group-dialogue";
    recordSharedExperience(leader, teammate, {
      type: "shared_work_activity",
      sourceEventId: groundedSource,
      roomId: "meeting-room",
      tone: "neutral",
      intensity: 2,
      actorId: leader.id,
      subjectId: teammate.id,
      category: "current_work",
      confidence: 84,
      context: { workTitle: "the operating review" }
    });
    const groundedConversation = company.socialConversationState.history.find(item => item.sourceEventId === groundedSource);
    assert(groundedConversation?.facts?.groupStatement, "Established group state should be available as grounded conversation context");
    assert(company.informalGroups.some(item => item.memberIds.includes(leader.id) && item.memberIds.includes(teammate.id)), "A group-related line must remain backed by current group state");
    const leadershipConversation = company.socialConversationState.history.find(item => item.contexts?.[leader.id] && item.facts?.leadershipStatement);
    assert(Boolean(leadershipConversation), "A real mentoring or coaching event should make grounded leadership dialogue available");
    assert(Object.values(company.socialLeadership).some(state => (state.evidence || []).some(evidence => evidence.sourceEventId === leadershipConversation?.sourceEventId)), "Leadership dialogue must remain backed by leadership evidence from the same event");

    const chemistry = company.teamChemistry[employeeTeam(leader)];
    assert(["coordination", "trust", "communication", "resilience", "conflictLoad", "knowledgeCoverage", "leadershipClarity"].every(key => Number.isFinite(chemistry?.[key])), "Team chemistry should derive every specified dimension from relationship evidence");
    const leadership = socialLeadershipState(leader);
    assert(leadership.formalAuthority > 0 && leadership.evidence.length > 0, "A formal manager should have authority plus event-backed leadership evidence");
    assert(["credibility", "consistency", "coachingReputation", "recognitionFairness", "conflictHandling", "communicationClarity", "confidence", "informalInfluence"].every(key => Number.isFinite(leadership[key])), "Leadership influence should expose all bounded derived dimensions");
    assert(leadershipRecommendationMultiplier(leader.id, teammate.id) >= SOCIAL_LEADERSHIP_RULES.emotionalMultiplierMin && leadershipRecommendationMultiplier(leader.id, teammate.id) <= SOCIAL_LEADERSHIP_RULES.emotionalMultiplierMax, "Leadership credibility should only scale emotional recommendations within configured bounds");
    assert(leadershipRecommendationMultiplier(leader.id, teammate.id) !== leadershipRecommendationMultiplier(leader.id, crossTeam.id), "The same leadership signal should have a different emotional magnitude when listener trust differs");
    const informalLeadership = socialLeadershipState(teammate);
    assert(informalLeadership.formalAuthority === 0 && informalLeadership.evidence.length > 0 && informalLeadership.informalInfluence > 50, "A non-manager should be able to develop evidence-based informal influence without formal authority");
    assert(leadership.formalAuthority !== leadership.credibility, "Formal authority should remain separate from earned credibility");
    assert(Math.abs(socialCultureReportingModifier(teammate)) <= 7, "Culture influence on reporting should remain bounded");
    assert(socialGroupPreferenceModifier(leader, teammate) >= 0 && socialGroupPreferenceModifier(leader, teammate) <= 5, "Informal groups should only have a subtle bounded social-preference effect");

    for (let index = 0; index < 5; index++) {
      [groupB1, groupB2].forEach(member => recordSharedExperience(leader, member, {
        type: "direct_help",
        sourceEventId: `final-group-merge-${member.id}-${index}`,
        roomId: "meeting-room",
        tone: "positive",
        intensity: 4,
        confidence: 88
      }));
    }
    company.day += SOCIAL_GROUP_RULES.updateIntervalDays;
    deriveInformalGroups();
    assert(company.informalGroups.some(item => item.memberIds.includes(leader.id) && item.memberIds.includes(groupB1.id) && item.memberIds.includes(groupB2.id)), "Independent groups should merge deterministically when repeated meaningful interaction connects them");

    for (let index = 0; index < 10; index++) {
      [groupB1, groupB2].forEach(member => recordSharedExperience(leader, member, {
        type: "professional_disagreement",
        sourceEventId: `final-group-split-${member.id}-${index}`,
        roomId: "meeting-room",
        tone: "negative",
        intensity: 4,
        confidence: 86
      }));
    }
    company.day += SOCIAL_GROUP_RULES.updateIntervalDays;
    deriveInformalGroups();
    assert(!company.informalGroups.some(item => item.status === "active" && item.memberIds.includes(leader.id) && item.memberIds.includes(groupB1.id)), "Persistent source-backed conflict should be able to split a previously merged group");

    const groupBeforeWeakening = socialClone(company.informalGroups.find(item => item.status === "active" && item.memberIds.includes(leader.id) && item.memberIds.includes(teammate.id)) || group);
    company.socialRelationships[makeRelationshipKey(leader.id, teammate.id)].experienceSummary = {};
    company.day += SOCIAL_GROUP_RULES.updateIntervalDays;
    deriveInformalGroups();
    const weakening = company.informalGroups.find(item => item.id === groupBeforeWeakening.id);
    assert(!weakening || weakening.status === "weakening", "A group should weaken before it dissolves when evidence stops");
    if (weakening) assert(weakening.stability < groupBeforeWeakening.stability, "A weakening group should lose stability gradually");

    const socialStateBeforeUi = JSON.stringify({
      memory: company.socialMemoryStore,
      conflicts: company.socialConflicts,
      culture: company.socialCulture,
      groups: company.informalGroups,
      chemistry: company.teamChemistry,
      leadership: company.socialLeadership,
      conversations: company.socialConversationState
    });
    socialCulturePlayerHtml();
    socialGroupsPlayerHtml();
    socialNetworkPlayerHtml();
    socialLeadershipPlayerHtml();
    const socialStateAfterUi = JSON.stringify({
      memory: company.socialMemoryStore,
      conflicts: company.socialConflicts,
      culture: company.socialCulture,
      groups: company.informalGroups,
      chemistry: company.teamChemistry,
      leadership: company.socialLeadership,
      conversations: company.socialConversationState
    });
    assert(socialStateAfterUi === socialStateBeforeUi, "Inspecting Culture, Groups, Network, or Leadership must not mutate authoritative social state");
    renderSocialOrganizationPanel();
    const panelText = document.getElementById("socialOrganizationPanel")?.innerText || "";
    assert(/Culture|Groups|Network|Leadership/.test(panelText), "The player-facing People and Culture panel should expose all four views");
    setSocialOrganizationView("culture");
    assert(/confidence|evidence|changing/i.test(document.getElementById("socialOrganizationPanel")?.innerText || ""), "Culture UI should explain confidence and evidence");
    setSocialOrganizationView("leadership");
    assert(/Credibility|coaching|fairness|conflict handling|confidence/i.test(document.getElementById("socialOrganizationPanel")?.innerText || ""), "Leadership UI should explain why influence exists");

    const audit = socialSystemsIntegrityAudit();
    assert(audit.passed, `Social organizational integrity audit should pass: ${audit.errors.join("; ")}`);
    return { ok: failures.length === 0, failures };
  });

  await browser.close();
  if (runtimeErrors.length || !result.ok) {
    console.error([...runtimeErrors, ...(result.failures || [])].join("\n"));
    process.exit(1);
  }
  console.log("Social culture, groups, and leadership regression test passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
