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
assert(rules.release.applicationVersion === "0.9.0" && rules.release.displayVersion === "Public Beta 0.9", "Public beta release identity should be centralized");
assert(rules.release.offline === true && rules.release.telemetry === false, "Offline and telemetry release claims should be centralized");
assert(rules.storage.maxPersistedCharacters > 0 && rules.storage.transientCompanyKeys.includes("runtime"), "Save-size budget and transient state exclusions should be centralized");
assert(rules.storage.softWarningCharacters < rules.storage.compactionThresholdCharacters && rules.storage.compactionThresholdCharacters < rules.storage.hardLimitCharacters, "Save warning, compaction, and hard limits should be centrally ordered");
assert(rules.storage.hardLimitCharacters + rules.storage.reservedMarginCharacters === rules.storage.maxPersistedCharacters, "Save hard limit plus reserved margin should equal the supported budget");
assert(rules.storage.compactFormat && rules.storage.compactKeys.length > 50 && new Set(rules.storage.compactKeys).size === rules.storage.compactKeys.length, "Compact-save format and append-only key dictionary should be centralized and unique");
assert(rules.validation.firstYearHorizonDays === rules.time.daysPerYear && rules.validation.developmentSeedsPerStrategy >= 20, "First-year matrix horizon and development seed count should be centralized");
assert(rules.validation.strategies.includes("conservative") && rules.validation.strategies.includes("balanced") && rules.validation.strategies.includes("growth-oriented"), "Release validation strategies should be centralized");
assert(rules.validation.hiringDecision.strategy.balanced.minimumProjectedRunwayDays > rules.validation.hiringDecision.strategy["growth-oriented"].minimumProjectedRunwayDays, "Validation hiring strategies should use distinct centralized affordability limits");
assert(rules.validation.hiringDecision.maximumNeedScore > 0 && rules.validation.hiringDecision.emergencyApprovalPenalty > 0, "Validation hiring need and emergency approval bounds should be centralized");
assert(rules.validation.decisionSafety.criticalCashThreshold < rules.validation.decisionSafety.tightCashThreshold && rules.validation.decisionSafety.criticalRunwayDays < rules.validation.decisionSafety.tightRunwayDays, "Validation financial safety bands should be centrally ordered");
assert(rules.validation.decisionSafety.speedCriticalPenalty > rules.validation.decisionSafety.speedWarningPenalty, "Critical product-quality pressure should carry the stronger centralized speed penalty");
assert(rules.validation.decisionSafety.strategyMultipliers["growth-oriented"].expansion < rules.validation.decisionSafety.strategyMultipliers.balanced.expansion, "Growth validation should accept more portfolio risk than the balanced strategy");

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
assert(rules.social.conversations.categories.length === 15 && rules.social.conversations.templatesPerCategory >= 40 && rules.social.conversations.minimumExchanges === 4 && rules.social.conversations.maximumExchanges === 5, "Visible-conversation categories, template depth, and exchange bounds should be centralized");
assert(rules.social.conversations.maxTemplatesPerCategory === 60 && rules.social.conversations.templatesPerCategory <= rules.social.conversations.maxTemplatesPerCategory, "Conversation template depth should use the centralized 40-60 range");
assert(rules.social.conversations.maxStored > 0 && rules.social.conversations.maxStored <= 24 && rules.social.memory.maxSourceEvents <= 720, "Conversation and source-evidence retention should remain within the shared save budget");
assert(rules.social.conversations.groundedTriggerTypes.includes("task-finished") && rules.social.conversations.groundedTriggerTypes.includes("department-return"), "Task completion and department return should be centralized grounded triggers");
assert(rules.social.conversations.approachDurationMinutes > 0 && rules.social.conversations.resumeDurationMinutes > 0 && rules.social.conversations.personalSpacePercent > 0, "Conversation presence timing and personal-space rules should be centralized");
assert(rules.rooms.departmentWorkRooms.includes("software-studio") && rules.rooms.departmentWorkRooms.includes("hardware-lab"), "Cross-department return rooms should be centralized");
assert(rules.social.culture.dailyMaxDrift > 0 && rules.social.culture.dailyMaxDrift < 1, "Culture drift should use a small centralized daily bound");
assert(rules.social.groups.updateIntervalDays > 0 && rules.social.groups.maxGroupSize > 1, "Informal-group lifecycle rules should be centralized");
assert(rules.social.groups.sustainedInteractionJoinCount > rules.social.groups.minimumMeaningfulInteractions, "Informal groups should require sustained evidence before a lower-scoring relationship can join");
assert(rules.social.leadership.emotionalMultiplierMin > 0 && rules.social.leadership.emotionalMultiplierMax < 2, "Leadership emotional influence should be centrally bounded");
assert(rules.laborMarket.departments.includes("hardware") && rules.laborMarket.departments.includes("people"), "Labor-market departments should be centralized");
assert(Number.isFinite(rules.laborMarket.scarcity.software) && Number.isFinite(rules.laborMarket.baseline.acceptanceRate), "Labor-market modifiers should be centralized");
assert(rules.employment.benefitsRate > 0 && rules.employment.payrollTaxRate > 0, "Recurring employment-cost rates should be centralized");
assert(rules.employment.severanceWeeksMin < rules.employment.severanceWeeksMax, "Severance bounds should be centralized");
assert(rules.economy.growthBaselineHeadcount > 0 && rules.economy.growthOverheadPerEmployeeDaily > 0, "Company scale costs should be centralized");
const customerScaleCost = rules.economy.manufacturingCustomerDaily + rules.economy.supportCustomerDaily + rules.economy.growthOverheadPerCustomerDaily;
const weightedCustomerContract = Object.values(rules.customerMarket.segmentDefinitions).reduce((sum, segment) => sum + segment.weight * segment.contractValue, 0);
assert(customerScaleCost > 0 && customerScaleCost < weightedCustomerContract, "Post-launch customer scale costs should be meaningful without exceeding the weighted contract value");
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
assert(rules.riskPillars.valuationSnapshotDefault >= 0 && rules.riskPillars.valuationSnapshotDefault <= 100, "Valuation risk should have a centralized migration default");
assert(rules.projectDevelopment.backlogTaper.at(-1).multiplier === 0 && rules.projectDevelopment.closeoutBacklogProgress >= 95, "Project closeout backlog taper should be centralized");
assert(rules.projectDevelopment.projectWorkItemLimit < rules.projectDevelopment.totalWorkItemLimit, "Project and total work-item limits should be centrally ordered");
assert(rules.projectDevelopment.defaultEstimatedDurationDays > 0 && rules.projectDevelopment.recentClosedWorkItemRetentionDays > 0, "Project timing and closed-work retention defaults should be centralized");
assert(rules.projectDevelopment.completionTelemetryLimit > rules.projectDevelopment.totalWorkItemLimit, "Cumulative project completion telemetry should use a centralized long-run bound");
assert(rules.projectDevelopment.expectedWorkItemCycleDays > 1 && rules.projectDevelopment.minimumPlannedWorkItems > 0, "Project work-package planning should use centralized pacing bounds");
assert(rules.crisisBalance.sustainedRiskDays >= 3, "Company crises should require a centralized sustained-risk window");
assert(rules.crisisBalance.operational.immediateBlockedItems > rules.crisisBalance.operational.warningBlockedItems, "Immediate operational crisis pressure should exceed the warning threshold");
assert(rules.crisisBalance.financial.severeLossRunwayDays > 0 && rules.crisisBalance.product.severeProjectRisk > 0, "Financial and product crisis corroboration thresholds should be centralized");
assert(rules.crisisBalance.financial.warningDailyLoss < rules.crisisBalance.financial.severeDailyLoss, "Financial warning loss should remain below the severe crisis threshold");
assert(Object.keys(rules.crisisBalance.definitions).length >= 10 && Object.isFrozen(rules.crisisBalance.definitions), "Crisis ownership and deadlines should have one frozen definition table");
assert(rules.crisisBalance.interventions.blockerClearCount > 0 && rules.crisisBalance.interventions.contractorCoverageDays > 0, "Crisis recovery effects should use shared bounded constants");
assert(rules.crisisBalance.recovery.financial.warningNetCashFlow < rules.crisisBalance.recovery.financial.healthyNetCashFlow, "Financial recovery bands should be centrally ordered");
assert(rules.manufacturing.fulfillmentThreshold > 0 && rules.manufacturing.fulfillmentThreshold < 1, "Manufacturing fulfillment threshold should be canonical");
assert(rules.customerMarket.strategicMemoCooldownDays >= rules.time.daysPerWeek, "Customer strategy memo cadence should be centralized and non-spammy");
assert(Object.keys(rules.customerMarket.segmentDefinitions).length === 5 && Object.isFrozen(rules.customerMarket.segmentDefinitions), "Customer segment economics should be centralized and frozen");
assert(rules.executiveInbox.informationalMinimumGapDays >= rules.time.daysPerWeek, "Routine informational Inbox cadence should be centralized and non-spammy");
assert(rules.executiveInbox.informationalRepeatWindowDays > rules.executiveInbox.informationalMinimumGapDays, "Repeated informational topics should have a longer cooldown than unrelated updates");
assert(rules.executiveInbox.internalDecisionMinimumGapDays > rules.executiveInbox.informationalMinimumGapDays, "Internal decision escalations should be less frequent than routine informational updates");
assert(rules.executiveInbox.internalDecisionRepeatWindowDays > rules.executiveInbox.internalDecisionMinimumGapDays, "Repeated internal decisions should have a longer cooldown than unrelated decisions");
assert(Math.abs(rules.investorRelations.reaction.previousConfidenceWeight + rules.investorRelations.reaction.derivedConfidenceWeight - 1) < 0.0001, "Investor confidence blend weights should total one");
assert(rules.investorRelations.memoCadence.routineMinimumGapDays > rules.investorRelations.memoCadence.urgentMinimumGapDays, "Routine valuation memos should have a longer cooldown than urgent market warnings");
assert(rules.investorRelations.memoCadence.fundraisingMinimumGapDays >= rules.investorRelations.memoCadence.routineMinimumGapDays, "Fundraising reviews should use the longest investor-relations cooldown");
assert(rules.telemetry.persistedDailySnapshots >= rules.time.daysPerMonth * 2, "Persisted telemetry should retain enough history for player-facing trends");
assert(rules.telemetry.persistedDailySnapshots < rules.validation.firstYearHorizonDays, "Persisted telemetry should not duplicate the complete isolated-validation history");
assert(Math.abs(rules.organizationalMomentum.previousWeight + rules.organizationalMomentum.targetWeight - 1) < 0.0001, "Organizational momentum blend weights should total one");
assert(rules.boardGovernance.pipDurationDays === rules.time.daysPerQuarter, "CEO PIP duration should use the shared quarterly calendar");
assert(rules.boardGovernance.pipOfferCooldownDays < rules.boardGovernance.pipDurationDays, "CEO PIP offer cooldown should be shorter than a full PIP review period");
assert(rules.hiring.minimumRequestMemoGapDays >= rules.hiring.requestCadenceDays * 2, "Hiring request cadence should be centrally rate-limited");
assert(rules.portfolioGovernance.projectReviewIntervalDays > rules.portfolioGovernance.projectReviewCadenceDays, "Portfolio review interval should exceed its polling cadence");
assert(rules.projectLifecycle.capacityConsumingActions.includes("pilot") && rules.projectLifecycle.capacityConsumingActions.includes("resume"), "Project capacity-consuming actions should cover pilot and resume decisions");
assert(rules.projectLifecycle.capacityReliefActions.includes("delay") && rules.projectLifecycle.capacityReliefActions.includes("split"), "Project capacity-relief actions should cover delayed and phased decisions");
assert(rules.portfolioGovernance.boardConcernCadenceDays >= rules.time.daysPerMonth, "Routine board portfolio concerns should not recur more than monthly");
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
const simulationHandbook = read("src/ui/simulation-handbook.js");
const runtimeServices = read("src/services/runtime-services.js");
const socialOrganization = read("src/systems/social-organizational.js");
const consumers = [roleDefinitions, workforce, projects, operatingHealth, executiveMessages, marketValuation, stateStartup, renderingValidation].join("\n");
const runtimeJavaScriptFiles = fs.readdirSync(path.join(root, "src"), { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith(".js"))
  .map(entry => path.join(entry.parentPath || entry.path, entry.name))
  .filter(file => path.resolve(file) !== path.join(root, "src", "core", "constants.js"));
const copiedSentinels = runtimeJavaScriptFiles.filter(file => /(?<![\w.])(?:-999999|-999|999|2463534242)(?![\w.])/.test(fs.readFileSync(file, "utf8")));

assert(/const ROOM_RULES=OFFICE_AQUARIUM_CONSTANTS\.rooms/.test(roleDefinitions), "Room behavior should use shared room rules");
assert(!/const ROOM_CAPACITY=\s*\{/.test(roleDefinitions), "Room capacities should not be redeclared");
assert(/WORKFORCE_HIRING_RULES=OFFICE_AQUARIUM_CONSTANTS\.hiring/.test(workforce), "Workforce behavior should use shared hiring rules");
assert(!/duration\|\|(?:21|28)/.test(workforce), "Onboarding should not use a copied fallback duration");
assert(!/\["requisition","searching","interviewing","offer"/.test(workforce), "Recruiting status sets should not be copied into workforce behavior");
assert(/projectLifecycle\.terminalStatuses/.test(projects), "Project closeout should use shared terminal statuses");
assert(/projectLifecycle\.activeStatuses/.test(projects), "Project execution should use shared active statuses");
assert(/time\.daysPerYear/.test(operatingHealth), "Daily employment cost should use the shared year length");
assert(/function estimatedMarginalEmployeeDailyCost\(/.test(operatingHealth), "Hiring decisions should share one fully loaded marginal employee cost helper");
assert(/ECONOMY_RULES=OFFICE_AQUARIUM_CONSTANTS\.economy/.test(workforce), "Living finance should use shared economy rules");
assert(!/\(\.010\+active\.length\*\.0025\)|active\.length-8\)\*\.012/.test(workforce), "Living finance should not retain copied scale-cost constants");
assert(/CUSTOMER_SEGMENT_DEFS=OFFICE_AQUARIUM_CONSTANTS\.customerMarket\.segmentDefinitions/.test(read("src/systems/customer-market.js")), "Customer segment economics should use shared constants");
assert(/OFFICE_AQUARIUM_CONSTANTS\.executiveInbox/.test(executiveMessages), "Inbox pacing should use shared inbox rules");
assert(/validation\.hiringDecision/.test(executiveMessages) && /estimatedMarginalEmployeeDailyCost/.test(executiveMessages), "Validation hiring choices should use shared affordability rules and marginal cost");
assert(/validation\.decisionSafety/.test(executiveMessages), "Validation spending, quality, and portfolio safeguards should use shared constants");
assert(!/OFFICE_AQUARIUM_CONSTANTS\.hiring\.(?:dailyDecisionMemoLimit|maxQueuedMemosBeforeRandomEvents)/.test(executiveMessages), "General inbox rules should not live under hiring");
assert(/time\.daysPerMonth/.test(marketValuation) && /time\.daysPerYear/.test(marketValuation), "Valuation ranges should use shared calendar rules");
assert(/company\.randomState\?\?OFFICE_AQUARIUM_CONSTANTS\.determinism\.defaultRandomState/.test(marketValuation), "A valid zero random state must not be replaced by the default seed");
assert(!/company\.day\/(?:91|365)|\/365\b|>=91\b|>=365\b/.test(workforce), "Workforce reviews and annual calculations should not copy calendar lengths");
assert(!/\["completed","canceled","(?:failed",)?"rejected","merged"\]/.test(consumers), "Project terminal states should not be copied by consumers");
assert(/SOCIAL_RULES\.modelVersion/.test(stateStartup), "Social model migration should use the shared model version");
assert(/SOCIAL_RULES\.workInputForbiddenKeys/.test(operatingHealth), "Work AI boundary guard should use shared forbidden input keys");
assert(/function runwayDaysOrUnknown\(/.test(runtimeServices), "Runway sentinel handling should have one shared conversion helper");
assert(/OFFICE_AQUARIUM_CONSTANTS\.storage\.compactFormat/.test(runtimeServices) && /serialize\(companyState,employeeState/.test(runtimeServices), "Save persistence should use the shared compact format");
assert(/OFFICE_AQUARIUM_CONSTANTS\.release/.test(stateStartup), "Player-facing release metadata should come from shared constants");
assert(/OFFICE_AQUARIUM_CONSTANTS\.validation/.test(renderingValidation), "Validation horizons and statuses should come from shared constants");
assert(copiedSentinels.length === 0, `Runtime files should not copy shared sentinel values: ${copiedSentinels.map(file => path.relative(root, file)).join(", ")}`);
assert(rules.handbook.defaultSection === "welcome" && rules.handbook.searchResultLimit > 0, "Simulation Handbook navigation defaults should be centralized");
assert(/SIMULATION_HANDBOOK_CONFIG\s*=\s*OFFICE_AQUARIUM_CONSTANTS\.handbook/.test(simulationHandbook), "Simulation Handbook behavior should consume shared configuration");
assert(!/runwayDays\s*\|\|\s*(?:999|[A-Z_]+\.unknownFutureDay)/.test(consumers), "A zero-day runway must not be replaced by the unknown-runway sentinel");
assert(/PROJECT_LEARNING_RULES=OFFICE_AQUARIUM_CONSTANTS\.projectLearning/.test(projects), "Project learning should use shared lesson rules");
assert(/OFFICE_AQUARIUM_CONSTANTS\.projectDevelopment/.test(projects) && /OFFICE_AQUARIUM_CONSTANTS\.projectDevelopment/.test(institutionalLearning), "Project backlog producers should share project-development rules");
assert(/function projectAgeDays\(/.test(projects) && /function projectScheduleVariance\(/.test(projects), "Project age and schedule variance should use canonical helpers");
assert(/function projectPlannedWorkItemCount\(/.test(projects) && /function projectCompletedWorkProgress\(/.test(projects), "Completed work should feed project progress through canonical planning helpers");
assert(/function compactWorkItemHistory\(/.test(institutionalLearning) && /compactWorkItemHistory\(company\.workItems\)/.test(workforce), "Open work-item preservation should use one canonical compaction helper");
assert(!/(?:createdDay|startedDay|closedDay|searchStartedDay)\s*\|\|\s*company\.day/.test(`${projects}\n${executiveMessages}\n${marketValuation}\n${institutionalLearning}\n${workforce}`), "Valid Day 0 timestamps must not be treated as missing");
assert(!/company\.workItems[\s\S]{0,180}\.slice\(-(?:36|52)\)/.test(`${institutionalLearning}\n${workforce}`), "Long-run pruning must not silently discard open work using legacy fixed slices");
assert(/WORKFORCE_LEARNING_RULES=OFFICE_AQUARIUM_CONSTANTS\.workforceLearning/.test(workforce), "Workforce learning should use shared lesson bounds");
assert(/INSTITUTIONAL_LEARNING_RULES=OFFICE_AQUARIUM_CONSTANTS\.institutionalLearning/.test(institutionalLearning), "Institutional learning should use shared review rules");
assert(/INSTITUTIONAL_LEARNING_RULES\.maxEpisodes/.test(institutionalLearning) && /INSTITUTIONAL_LEARNING_RULES\.maxEvidenceRecords/.test(institutionalLearning), "Institutional-learning history caps should use shared constants");
assert(/RISK_PILLAR_RULES=OFFICE_AQUARIUM_CONSTANTS\.riskPillars/.test(workforce), "Company risk should use shared pillar rules");
assert(/OFFICE_AQUARIUM_CONSTANTS\.crisisBalance/.test(workforce), "Crisis escalation should use shared corroboration thresholds");
assert(/const CRISIS_DEFINITIONS=OFFICE_AQUARIUM_CONSTANTS\.crisisBalance\.definitions/.test(workforce), "Crisis ownership and deadlines should not be redeclared in workforce behavior");
assert(/OFFICE_AQUARIUM_CONSTANTS\.crisisBalance\.recovery/.test(workforce) && /OFFICE_AQUARIUM_CONSTANTS\.crisisBalance\.interventions/.test(workforce), "Crisis recovery scoring and interventions should consume shared constants");
assert(/OFFICE_AQUARIUM_CONSTANTS\.investorRelations\.reaction/.test(marketValuation), "Investor confidence updates should consume shared reaction constants");
assert(/OFFICE_AQUARIUM_CONSTANTS\.investorRelations\.memoCadence/.test(marketValuation), "Investor and fundraising memo cadence should consume shared constants");
assert(/OFFICE_AQUARIUM_CONSTANTS\.telemetry\.persistedDailySnapshots/.test(executiveMessages) && /OFFICE_AQUARIUM_CONSTANTS\.telemetry\.persistedDailySnapshots/.test(renderingValidation), "Persisted telemetry retention should consume one shared constant");
assert(/OFFICE_AQUARIUM_CONSTANTS\.organizationalMomentum/.test(workforce), "Organizational momentum should consume shared financial and smoothing constants");
assert(/BOARD_GOVERNANCE_RULES=OFFICE_AQUARIUM_CONSTANTS\.boardGovernance/.test(workforce), "Board strikes and CEO PIP lifecycle should consume shared governance constants");
assert(/internalDecisionMinimumGapDays/.test(workforce) && /decisionEscalationFingerprints/.test(institutionalLearning), "Internal decision cadence should be enforced and recorded through shared state");
assert(/projectLifecycle\.capacityConsumingActions/.test(executiveMessages) && /projectLifecycle\.capacityReliefActions/.test(executiveMessages), "Project recommendation scoring should consume shared action classifications");
assert(/updateCompanyRiskComponents\(\{recordForValuation:true\}\)/.test(dailyPipeline), "The daily risk stage should publish the canonical valuation-risk snapshot");
assert(/const valuationRisk=Number\.isFinite\(Number\(company\.valuationRiskScore\)\)/.test(marketValuation) && /riskMultiplier=clamp\(1-valuationRisk\/260/.test(marketValuation), "Daily valuation should consume the saved risk snapshot instead of a display cache");
assert(!/function workforceFinancialPressureHtml\(\)\s*\{\s*ensureWorkforceEconomySystems\(\);updateCompanyRiskComponents\(\)/.test(workforce), "Rendering Workforce and Financial Pressure must not recalculate authoritative risk");
assert(/HIRING_POLICY_MODES=WORKFORCE_HIRING_RULES\.policyModes/.test(workforce), "Workforce policy behavior should use shared policy modes");
assert(/DAILY_PIPELINE_STAGE_ORDER=OFFICE_AQUARIUM_CONSTANTS\.dailyPipeline\.stageOrder/.test(dailyPipeline), "Daily close should use the shared stage order");
assert(/MANUFACTURING_RULES=OFFICE_AQUARIUM_CONSTANTS\.manufacturing/.test(dailyPipeline), "Manufacturing fulfillment should use shared thresholds");
assert(/dailyCloseCoreOrdered\(\)/.test(workforce), "The guarded daily close should call the canonical ordered pipeline");
assert(html.indexOf("src/systems/market-valuation.js") < html.indexOf("src/systems/daily-pipeline.js"), "The daily pipeline should load after its market dependency");
assert(html.indexOf("src/systems/daily-pipeline.js") < html.indexOf("src/facades/simulation-systems.js"), "The daily pipeline should load before compatibility facades");

const conversationConsumers = `${socialOrganization}\n${stateStartup}`;
Object.keys(rules.social.conversations).forEach(key => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const directReference = new RegExp(`(?:SOCIAL_CONVERSATION_RULES|OFFICE_AQUARIUM_CONSTANTS\\.social\\.conversations)\\.${escaped}\\b`);
  assert(directReference.test(conversationConsumers), `Conversation constant ${key} should have a runtime consumer`);
});
assert(/function\s+createGroundedConversationOpportunity\s*\(/.test(socialOrganization), "Presentation-only conversation opportunities should have one canonical creator");
assert(/if\s*\(\s*!event\.context\?\.presentationOnly\s*\)/.test(socialOrganization), "Presentation-only conversations must not fabricate emotional recall outcomes");
assert(/function\s+recordCompletedWorkConversationOpportunity\s*\(/.test(institutionalLearning), "Completed collaborative work should use the canonical conversation-opportunity producer");
assert(/departmentWorkRooms\.includes\(previousRoom\)/.test(stateStartup), "Department-return conversations should consume canonical room definitions");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  checks,
  sections: ["release", "storage", "validation", "time", "rooms", "hiring", "projectLifecycle", "projectDevelopment", "executiveInbox", "telemetry", "socialOwnership", "laborMarket", "employment", "institutionalLearning", "riskPillars", "crisisBalance", "dailyPipeline"]
}, null, 2));
