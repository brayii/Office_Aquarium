const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");
const failures = [];
let checks = 0;
const assert = (condition, message) => {
  checks += 1;
  if (!condition) failures.push(message);
};

require(path.join(root, "src", "core", "constants.js"));
const rules = globalThis.OFFICE_AQUARIUM_CONSTANTS;

assert(rules && typeof rules === "object", "Shared constants should initialize");
assert(Object.isFrozen(rules), "Shared constants root should be frozen");
assert(Object.isFrozen(rules.hiring?.onboarding), "Nested hiring constants should be frozen");
assert(Object.isFrozen(rules.rooms?.capacities), "Room capacities should be frozen");
assert(rules.storage.maxPersistedCharacters > 0 && rules.storage.transientCompanyKeys.includes("runtime"), "Save-size budget and transient state exclusions should be centralized");
assert(rules.storage.compactFormat && rules.storage.compactKeys.length > 50 && new Set(rules.storage.compactKeys).size === rules.storage.compactKeys.length, "Compact-save format and append-only key dictionary should be centralized and unique");

assert(rules.time.daysPerWeek === 7, "Calendar week should be centralized");
assert(rules.time.daysPerMonth === 30, "Calendar month should be centralized");
assert(rules.time.daysPerQuarter === 91, "Quarter length should be centralized");
assert(rules.time.daysPerYear === 365, "Year length should be centralized");

assert(rules.rooms.capacities["software-studio"] === 8, "Software Studio capacity should be canonical");
assert(rules.rooms.capacities["hardware-lab"] === 6, "Hardware Lab capacity should be canonical");
assert(rules.rooms.rerouteThreshold === 1.25, "Room rerouting threshold should be canonical");

assert(rules.projectLifecycle.terminalStatuses.includes("failed"), "Failed projects should be terminal");
assert(!rules.projectLifecycle.activeStatuses.includes("paused"), "Paused projects should not execute");
assert(rules.projectLifecycle.activeIncludingPausedStatuses.includes("paused"), "Paused projects should remain reportable");

assert(rules.hiring.onboarding.defaultDurationDays === 28, "Onboarding fallback should be consistent");
assert(rules.hiring.onboarding.minDurationDays < rules.hiring.onboarding.maxDurationDays, "Onboarding duration bounds should be valid");
assert(rules.hiring.advancingRecruitingStatuses.every(status => rules.hiring.activeRecruitingStatuses.includes(status)), "Advancing recruiting stages should be active stages");
assert(rules.executiveInbox.randomEventCooldownMinutes < rules.executiveInbox.decisionCooldownMinutes, "A completed CEO decision should create the longer inbox cooldown");
assert(rules.social.modelVersion === 4, "Canonical Social AI model version should be centralized");
assert(rules.social.neutralInterpretation.confidence === 0, "Unknown relationship interpretation should carry zero confidence");
assert(rules.social.relationshipBands.substantialTrust < rules.social.relationshipBands.trusted && rules.social.relationshipBands.materialFriction < rules.social.relationshipBands.severeFriction, "Relationship interpretation bands should be centralized and ordered");
assert(rules.social.workInputForbiddenKeys.includes("relationship") && rules.social.workInputForbiddenKeys.includes("reputation"), "Work AI social-state exclusions should be centralized");
assert(rules.social.experienceAliases.onboarding_introduction === "onboarding_support", "Legacy social experience aliases should be centralized");
assert(rules.social.passiveLegacyExperienceTypes.includes("same_room_presence"), "Passive legacy experience types should be centralized");
assert(rules.social.trustDamagingConflictExperienceTypes.includes("credit_dispute") && !rules.social.trustDamagingConflictExperienceTypes.includes("professional_disagreement"), "Trust-damaging conflict types should distinguish misconduct from ordinary disagreement");
assert(rules.social.conflict.minimumRepairAgeMinutes > 0 && rules.social.conflict.repairAcceptanceThreshold > 0, "Conflict and repair thresholds should be centralized");
assert(rules.social.memory.perRelationshipCap < rules.social.memory.perEmployeeCap && rules.social.memory.perEmployeeCap < rules.social.memory.globalCap, "Social memory bounds should be centralized and ordered");
assert(rules.social.maxRelationshipCooldowns > 0 && rules.social.relationshipCooldownRetentionMinutes > 0, "Relationship cooldown retention should be centrally bounded");
assert(rules.social.conversations.categories.length === 15 && rules.social.conversations.minimumExchanges === 2 && rules.social.conversations.maximumExchanges === 4, "Visible-conversation categories and exchange bounds should be centralized");
assert(rules.social.culture.dailyMaxDrift > 0 && rules.social.culture.dailyMaxDrift < 1, "Culture drift should use a small centralized daily bound");
assert(rules.social.groups.updateIntervalDays > 0 && rules.social.groups.maxGroupSize > 1, "Informal-group lifecycle rules should be centralized");
assert(rules.social.leadership.emotionalMultiplierMin > 0 && rules.social.leadership.emotionalMultiplierMax < 2, "Leadership emotional influence should be centrally bounded");
assert(rules.laborMarket.departments.includes("hardware") && rules.laborMarket.departments.includes("people"), "Labor-market departments should be centralized");
assert(Number.isFinite(rules.laborMarket.scarcity.software) && Number.isFinite(rules.laborMarket.baseline.acceptanceRate), "Labor-market modifiers should be centralized");
assert(rules.employment.benefitsRate > 0 && rules.employment.payrollTaxRate > 0, "Recurring employment-cost rates should be centralized");
assert(rules.employment.severanceWeeksMin < rules.employment.severanceWeeksMax, "Severance bounds should be centralized");
assert(rules.aiOwners.work === "work-ai" && rules.aiOwners.social === "social-ai" && rules.aiOwners.emotional === "emotional-system", "AI trace owners should be centralized");
assert(rules.departments.core.includes("hardware") && rules.departments.learning.includes("company"), "Department identifiers should be centralized");
assert(rules.productPhases.order[0] === "prototype" && rules.productPhases.order.at(-1) === "launched", "Product phase order should be centralized");
assert(rules.hiring.policyModes.criticalOnly === "critical-only", "Hiring policy modes should be centralized");
assert(rules.projectLearning.keys.includes("staffingTiming") && rules.projectLearning.keys.includes("customerValidation"), "Project learning keys should be centralized");
assert(rules.projectLearning.scoreMin < 0 && rules.projectLearning.scoreMax > 0 && rules.projectLearning.decayDays > 0, "Project learning bounds and decay should be centralized");
assert(rules.workforceLearning.scoreMin < 0 && rules.workforceLearning.scoreMax > 0, "Workforce learning bounds should be centralized");
assert(rules.institutionalLearning.reviewRank.long > rules.institutionalLearning.reviewRank.medium, "Institutional review windows should have a canonical order");
assert(rules.institutionalLearning.stateRank.validated > rules.institutionalLearning.stateRank.provisional, "Institutional lesson states should not regress");
assert(rules.institutionalLearning.stateWeights.validated > rules.institutionalLearning.stateWeights.provisional, "Validated lessons should influence behavior more than provisional lessons");
assert(rules.institutionalLearning.suppressionIndependenceWindowDays > 0, "Suppression evidence independence should use a shared review window");
assert(rules.institutionalLearning.maxEpisodes > 0 && rules.institutionalLearning.maxEvidenceRecords > rules.institutionalLearning.maxEpisodes, "Institutional-learning history bounds should be centralized");
assert(Math.abs(Object.values(rules.riskPillars.weights).reduce((sum, weight) => sum + weight, 0) - 1) < 0.0001, "Risk-pillar weights should total one");
assert(rules.manufacturing.fulfillmentThreshold > 0 && rules.manufacturing.fulfillmentThreshold < 1, "Manufacturing fulfillment threshold should be canonical");
assert(rules.dailyPipeline.stageOrder[0] === "employee-outcomes" && rules.dailyPipeline.stageOrder.at(-1) === "save", "Daily pipeline boundaries should be canonical");
assert(new Set(rules.dailyPipeline.stageOrder).size === rules.dailyPipeline.stageOrder.length, "Daily pipeline stages should be unique");

const roleDefinitions = read("src/core/role-definitions.js");
const workforce = read("src/systems/workforce-leadership.js");
const projects = read("src/systems/project-portfolio.js");
const operatingHealth = read("src/systems/operating-health-simulation.js");
const executiveMessages = read("src/systems/executive-messages.js");
const marketValuation = read("src/systems/market-valuation.js");
const institutionalLearning = read("src/systems/institutional-company-intelligence.js");
const dailyPipeline = read("src/systems/daily-pipeline.js");
const html = read("Office_Aquarium.html");
const stateStartup = read("src/core/state-startup.js");
const renderingValidation = read("src/ui/rendering-validation.js");
const runtimeServices = read("src/services/runtime-services.js");
const consumers = [roleDefinitions, workforce, projects, operatingHealth, executiveMessages, marketValuation, stateStartup, renderingValidation].join("\n");

assert(/const ROOM_RULES=OFFICE_AQUARIUM_CONSTANTS\.rooms/.test(roleDefinitions), "Room behavior should use shared room rules");
assert(!/const ROOM_CAPACITY=\s*\{/.test(roleDefinitions), "Room capacities should not be redeclared");
assert(/WORKFORCE_HIRING_RULES=OFFICE_AQUARIUM_CONSTANTS\.hiring/.test(workforce), "Workforce behavior should use shared hiring rules");
assert(!/duration\|\|(?:21|28)/.test(workforce), "Onboarding should not use a copied fallback duration");
assert(!/\["requisition","searching","interviewing","offer"/.test(workforce), "Recruiting status sets should not be copied into workforce behavior");
assert(/projectLifecycle\.terminalStatuses/.test(projects), "Project closeout should use shared terminal statuses");
assert(/projectLifecycle\.activeStatuses/.test(projects), "Project execution should use shared active statuses");
assert(/time\.daysPerYear/.test(operatingHealth), "Daily employment cost should use the shared year length");
assert(/OFFICE_AQUARIUM_CONSTANTS\.executiveInbox/.test(executiveMessages), "Inbox pacing should use shared inbox rules");
assert(!/OFFICE_AQUARIUM_CONSTANTS\.hiring\.(?:dailyDecisionMemoLimit|maxQueuedMemosBeforeRandomEvents)/.test(executiveMessages), "General inbox rules should not live under hiring");
assert(/time\.daysPerMonth/.test(marketValuation) && /time\.daysPerYear/.test(marketValuation), "Valuation ranges should use shared calendar rules");
assert(!/company\.day\/(?:91|365)|\/365\b|>=91\b|>=365\b/.test(workforce), "Workforce reviews and annual calculations should not copy calendar lengths");
assert(!/\["completed","canceled","(?:failed",)?"rejected","merged"\]/.test(consumers), "Project terminal states should not be copied by consumers");
assert(/SOCIAL_RULES\.modelVersion/.test(stateStartup), "Social model migration should use the shared model version");
assert(/SOCIAL_RULES\.workInputForbiddenKeys/.test(operatingHealth), "Work AI boundary guard should use shared forbidden input keys");
assert(/function runwayDaysOrUnknown\(/.test(runtimeServices), "Runway sentinel handling should have one shared conversion helper");
assert(/OFFICE_AQUARIUM_CONSTANTS\.storage\.compactFormat/.test(runtimeServices) && /serialize\(companyState,employeeState/.test(runtimeServices), "Save persistence should use the shared compact format");
assert(!/runwayDays\s*\|\|\s*(?:999|[A-Z_]+\.unknownFutureDay)/.test(consumers), "A zero-day runway must not be replaced by the unknown-runway sentinel");
assert(/PROJECT_LEARNING_RULES=OFFICE_AQUARIUM_CONSTANTS\.projectLearning/.test(projects), "Project learning should use shared lesson rules");
assert(/WORKFORCE_LEARNING_RULES=OFFICE_AQUARIUM_CONSTANTS\.workforceLearning/.test(workforce), "Workforce learning should use shared lesson bounds");
assert(/INSTITUTIONAL_LEARNING_RULES=OFFICE_AQUARIUM_CONSTANTS\.institutionalLearning/.test(institutionalLearning), "Institutional learning should use shared review rules");
assert(/INSTITUTIONAL_LEARNING_RULES\.maxEpisodes/.test(institutionalLearning) && /INSTITUTIONAL_LEARNING_RULES\.maxEvidenceRecords/.test(institutionalLearning), "Institutional-learning history caps should use shared constants");
assert(/RISK_PILLAR_RULES=OFFICE_AQUARIUM_CONSTANTS\.riskPillars/.test(workforce), "Company risk should use shared pillar rules");
assert(/HIRING_POLICY_MODES=WORKFORCE_HIRING_RULES\.policyModes/.test(workforce), "Workforce policy behavior should use shared policy modes");
assert(/DAILY_PIPELINE_STAGE_ORDER=OFFICE_AQUARIUM_CONSTANTS\.dailyPipeline\.stageOrder/.test(dailyPipeline), "Daily close should use the shared stage order");
assert(/MANUFACTURING_RULES=OFFICE_AQUARIUM_CONSTANTS\.manufacturing/.test(dailyPipeline), "Manufacturing fulfillment should use shared thresholds");
assert(/dailyCloseCoreOrdered\(\)/.test(workforce), "The guarded daily close should call the canonical ordered pipeline");
assert(html.indexOf("src/systems/market-valuation.js") < html.indexOf("src/systems/daily-pipeline.js"), "The daily pipeline should load after its market dependency");
assert(html.indexOf("src/systems/daily-pipeline.js") < html.indexOf("src/facades/simulation-systems.js"), "The daily pipeline should load before compatibility facades");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  checks,
  sections: ["time", "rooms", "hiring", "projectLifecycle", "executiveInbox", "socialOwnership", "laborMarket", "employment", "institutionalLearning", "riskPillars", "dailyPipeline"]
}, null, 2));
