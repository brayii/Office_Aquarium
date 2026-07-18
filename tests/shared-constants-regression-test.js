const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

require(path.join(root, "src", "core", "constants.js"));
const rules = globalThis.OFFICE_AQUARIUM_CONSTANTS;

assert(rules && typeof rules === "object", "Shared constants should initialize");
assert(Object.isFrozen(rules), "Shared constants root should be frozen");
assert(Object.isFrozen(rules.hiring?.onboarding), "Nested hiring constants should be frozen");
assert(Object.isFrozen(rules.rooms?.capacities), "Room capacities should be frozen");

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
assert(rules.social.modelVersion === 3, "Canonical Social AI model version should be centralized");
assert(rules.social.neutralInterpretation.confidence === 0, "Unknown relationship interpretation should carry zero confidence");
assert(rules.social.workInputForbiddenKeys.includes("relationship") && rules.social.workInputForbiddenKeys.includes("reputation"), "Work AI social-state exclusions should be centralized");
assert(rules.social.experienceAliases.onboarding_introduction === "onboarding_support", "Legacy social experience aliases should be centralized");
assert(rules.social.passiveLegacyExperienceTypes.includes("same_room_presence"), "Passive legacy experience types should be centralized");
assert(rules.laborMarket.departments.includes("hardware") && rules.laborMarket.departments.includes("people"), "Labor-market departments should be centralized");
assert(Number.isFinite(rules.laborMarket.scarcity.software) && Number.isFinite(rules.laborMarket.baseline.acceptanceRate), "Labor-market modifiers should be centralized");
assert(rules.employment.benefitsRate > 0 && rules.employment.payrollTaxRate > 0, "Recurring employment-cost rates should be centralized");
assert(rules.employment.severanceWeeksMin < rules.employment.severanceWeeksMax, "Severance bounds should be centralized");
assert(rules.aiOwners.work === "work-ai" && rules.aiOwners.social === "social-ai" && rules.aiOwners.emotional === "emotional-system", "AI trace owners should be centralized");

const roleDefinitions = read("src/core/role-definitions.js");
const workforce = read("src/systems/workforce-leadership.js");
const projects = read("src/systems/project-portfolio.js");
const operatingHealth = read("src/systems/operating-health-simulation.js");
const executiveMessages = read("src/systems/executive-messages.js");
const marketValuation = read("src/systems/market-valuation.js");
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
assert(!/runwayDays\s*\|\|\s*(?:999|[A-Z_]+\.unknownFutureDay)/.test(consumers), "A zero-day runway must not be replaced by the unknown-runway sentinel");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  checks: 44,
  sections: ["time", "rooms", "hiring", "projectLifecycle", "executiveInbox", "socialOwnership", "laborMarket", "employment"]
}, null, 2));
