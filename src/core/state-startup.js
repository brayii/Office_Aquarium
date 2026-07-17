const SAVE_KEY="office-aquarium-living-office-v3";
const SAVE_VERSION=38;
const zones={dev:{x:[9,41],y:[14,40]},lab:{x:[58,91],y:[14,40]},meet:{x:[9,29],y:[64,88]},break:{x:[42,58],y:[64,88]},exec:{x:[72,91],y:[64,88]}};
const names=["Maya","Leo","Aisha","Noah","Priya","Ethan","Sofia","Marcus"];
const roles=FOUNDING_ROLES;
const colors=["#4a78c2","#ef6f6c","#2ab7a9","#d9972b","#7a5af8","#5f9f64","#d65b9e","#52606d"];
const traits=[["perfectionist","ambitious"],["social","creative"],["focused","introverted"],["cautious","loyal"],["ambitious","social"],["skeptical","focused"],["creative","independent"],["cautious","analytical"]];
const initialCompany={day:0,minute:480,randomState:2463534242,nextRuntimeId:1,cash:18,board:72,trust:68,chip:22,software:31,quality:38,integration:15,customers:0,dailyRevenue:0,valuation:42,phase:"prototype",marketSentiment:50,marketConfidence:50,leadershipReputation:50,valuationQuality:50,investorAppetite:50,marketNoiseState:0,valuationHistory:[],valuationShocks:[],boardMarketLessons:{},lastValuationReviewDay:-999,lastValuationMemoDay:-999,lastFundraisingMemoDay:-999,lastValuationStoryDay:-999,lastBoardValuationState:null,valuationDrivers:{},boardProfile:null,founderOwnership:100,investorOwnership:0,boardControlPressure:0,worldState:{capitalClimate:50,sectorEnthusiasm:50,interestRatePressure:50,supplyReliability:50,talentMarket:50,competitorAggression:50,customerBudgetClimate:50},marketRangeView:"1m",directive:null,directiveDays:0,policyTransition:null,selected:0,paused:false,speed:1,soundMode:"both",soundEnabled:true,pendingEvent:null,eventCooldown:0,eventHistory:{},recentEventCategories:[],cashEventArmed:true,completedEvents:[],crisis:null,crisisDays:0,gameOver:false,costEfficiency:1,pilotDays:0,openRoles:[],newspapers:[],weekStartSnapshot:null,weeklyEvents:[],communications:[],communicationView:"inbox",history:[],lessons:[],nextLessonId:1,departmentLearning:{},lastLessonReviewDay:-999,delayedDecisionEffects:[],decisionHistory:[],decisionThreads:[],nextDecisionThreadId:1,executiveReputations:{},leadership:{qualityFocus:55,speedFocus:50,innovation:55,employeeWellbeing:55,financialDiscipline:55,customerFocus:55,transparency:55,riskTolerance:50,accountability:55,longTermThinking:55},organizationalMomentum:{burnout:0,turnover:0,innovation:0,trust:0,execution:0,financial:0,culture:0},quarterlyReviews:[],annualReviews:[],lastQuarterlyReviewDay:0,lastAnnualReviewDay:0,crisisRiskDays:{burnout:0,financial:0,product:0,reputation:0,leadership:0,staffing:0,operational:0},crisisType:null,crisisStage:null,capabilityNeeds:{...DEFAULT_COMPANY_CAPABILITY_NEEDS},capabilityCoverage:{},capabilityGaps:[],capabilityConsequences:{},capabilityPromotionCandidates:[],capabilityFulfillmentOptions:{},capabilityAudit:null,workItems:[],issueRecords:[],departmentObjectives:{},informationSources:{},nextWorkItemId:1,nextIssueId:1,nextMessageId:1,nextEscalationId:1,employeeMessages:[],teamReports:[],suppressionRecords:[],escalationQueue:[],escalatedMessageIds:[],communicationStats:{helpRequests:0,statusReports:0,riskReports:0,opportunityReports:0,suppressedReports:0,rumors:0},socialRelationships:{},socialMemories:[],roomPresenceCounters:{},storyChains:[],nextStoryId:1,playtest:{sessions:0,notes:[],lastChecklistDay:-999},operatingHealthHistory:[],executiveBriefing:null,executiveBriefingArchive:[],simulationMetrics:{daily:[],counters:{actions:{},qualityMistakes:0,sickness:0,resignations:0,firings:0,coaching:0,ceoDecisions:0,executiveMemos:0,queuedEscalations:0,localIssues:0,collaborations:0},lastBalance:null},workforceLessons:{},culture:{innovation:55,workLife:55,communication:55,riskTolerance:50,qualityDiscipline:58,politics:25},market:{aiDemand:52,hardwareDemand:50,supplyPressure:32,capitalClimate:55,competitorHeat:45},log:["You became CEO. The office is now running without direct employee control."]};
let company,employees,timer=null,debugMode=false,selectedEmployeeId=null,validationMode=false,currentSimulationContext=null,lastValidationReport=null,lastInboxSoundCount=null,musicUnavailable=false,alertsUnavailable=false,pausedBeforeResetPrompt=false;
function updatePauseButton(){
  const button=document.getElementById("pauseBtn");
  if(!button||!company)return;
  button.textContent=company.paused?">":"II";
  button.title=company.paused?"Resume simulation":"Pause simulation";
  button.setAttribute("aria-label",button.title);
}
const saveRepository=new SaveRepository(SAVE_KEY,SAVE_VERSION);
const soundController=new SoundController({musicSrc:"assets/audio/game_music_loop.mp3",alertSrc:"assets/audio/new_message_alert.mp3"});
const simulationTimer=new SimulationTimer();
const validationSession=new ValidationSession(saveRepository,simulationTimer);
const musicAudio=soundController.music,messageAudio=soundController.alert;
function createSafeAudio(src,options={}){return soundController.create(src,options);}
const PERSONALITY_KEYS=["workPace","sociability","collaboration","riskTolerance","adaptability","initiative","resilience","detailOrientation","empathy","structureNeed"];
const SOCIAL_EXPERIENCE_TYPES=new Set(["shared_work_activity","shared_meeting","shared_break","direct_help","blocker_resolved_together","deadline_pressure_together","milestone_success_together","milestone_failure_together","recognition_shared","interruption_shared","conflict_observed","crisis_response_together","onboarding_support","mentoring_interaction"]);
const EMPTY_RELATIONSHIP_INTERPRETATION={trust:0,respect:0,comfort:0,professionalFriction:0};
function hashText32(text){
  let h=2166136261>>>0;
  for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
  return h>>>0;
}
function personalityRandom(seed){
  let s=seed>>>0;
  return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};
}
function personalitySeedForEmployee(eOrId,role="",salt=""){
  const id=typeof eOrId==="object"?eOrId.id:eOrId;
  const name=typeof eOrId==="object"?eOrId.name:"";
  return hashText32(`${SAVE_VERSION}|${company?.randomState??2463534242}|${id}|${name}|${role}|${salt}`);
}
function generateEmployeePersonality(seed,role=""){
  const rand=personalityRandom(seed),roleHint=roleDepartment(role);
  const profile={};
  PERSONALITY_KEYS.forEach(k=>profile[k]=Number((rand()*2-1).toFixed(3)));
  if(roleHint==="quality")profile.detailOrientation=clamp(profile.detailOrientation+.14,-1,1);
  if(roleHint==="product")profile.empathy=clamp(profile.empathy+.10,-1,1);
  if(roleHint==="finance")profile.structureNeed=clamp(profile.structureNeed+.10,-1,1);
  if(roleHint==="software")profile.adaptability=clamp(profile.adaptability+.08,-1,1);
  if(roleHint==="hardware")profile.detailOrientation=clamp(profile.detailOrientation+.08,-1,1);
  return profile;
}
function derivePersonalityArchetypes(profile={}){
  const scored=[
    ["Fast Builder",(profile.workPace||0)+(profile.initiative||0)*.7],
    ["Perfectionist",(profile.detailOrientation||0)+(profile.structureNeed||0)*.6],
    ["Mentor",(profile.empathy||0)+(profile.collaboration||0)*.7],
    ["Lone Wolf",-(profile.sociability||0)+(profile.structureNeed||0)*.25],
    ["Visionary",(profile.riskTolerance||0)+(profile.initiative||0)*.7+(profile.adaptability||0)*.4],
    ["Diplomat",(profile.empathy||0)+(profile.sociability||0)*.5],
    ["Organizer",(profile.structureNeed||0)+(profile.detailOrientation||0)*.45],
    ["Curious",(profile.adaptability||0)+(profile.initiative||0)*.35],
    ["Steady Worker",(profile.resilience||0)+(profile.structureNeed||0)*.35],
    ["Social Connector",(profile.sociability||0)+(profile.collaboration||0)*.7]
  ].sort((a,b)=>b[1]-a[1]);
  const labels=scored.filter(([,v])=>v>.25).slice(0,3).map(([name])=>name);
  scored.forEach(([name])=>{if(labels.length<2&&!labels.includes(name))labels.push(name);});
  return labels.filter((v,i,a)=>a.indexOf(v)===i).slice(0,4);
}
function defaultEmotionalState(profile={}){
  return {
    socialBattery:Math.round(clamp(55+(profile.sociability||0)*18-(profile.structureNeed||0)*8,15,95)),
    frustration:20,
    belonging:Math.round(clamp(55+(profile.empathy||0)*10+(profile.collaboration||0)*8,20,95)),
    recognitionSatisfaction:55,
    psychologicalSafety:60,
    recoveryDebt:0,
    conflictFatigue:0,
    needForQuietFocus:Math.round(clamp(48+(profile.structureNeed||0)*18-(profile.sociability||0)*12,10,95)),
    needForSocialInteraction:Math.round(clamp(48+(profile.sociability||0)*20+(profile.collaboration||0)*8,10,95))
  };
}
function ensureEmployeePersonality(e,{force=false,salt=""}={}){
  if(!e)return e;
  if(force||!Number.isFinite(e.personalitySeed))e.personalitySeed=personalitySeedForEmployee(e,e.role,salt);
  if(force||!e.personality||typeof e.personality!=="object")e.personality=generateEmployeePersonality(e.personalitySeed,e.role);
  PERSONALITY_KEYS.forEach(k=>{if(!Number.isFinite(e.personality[k]))e.personality[k]=0;});
  e.personalityArchetypes=Array.isArray(e.personalityArchetypes)&&e.personalityArchetypes.length&&!force?e.personalityArchetypes:derivePersonalityArchetypes(e.personality);
  e.emotionalState={...defaultEmotionalState(e.personality),...(e.emotionalState||{})};
  e.emotionalCooldowns=e.emotionalCooldowns&&typeof e.emotionalCooldowns==="object"?e.emotionalCooldowns:{};
  e.emotionalDailyTotals={day:company?.day??0,moraleGain:0,moraleLoss:0,stressGain:0,stressLoss:0,...(e.emotionalDailyTotals||{})};
  e.emotionalLimits={maxDailyMoraleGain:8,maxDailyMoraleLoss:8,maxDailyStressGain:10,maxDailyStressLoss:10,...(e.emotionalLimits||{})};
  e.recentEmotionalEvents=Array.isArray(e.recentEmotionalEvents)?e.recentEmotionalEvents.slice(0,12):[];
  e.personalityDescription=personalityDescription(e);
  return e;
}
function resetEmployeeEmotionalDay(e){
  ensureEmployeePersonality(e);
  if(e.emotionalDailyTotals?.day!==company.day){
    e.emotionalDailyTotals={day:company.day,moraleGain:0,moraleLoss:0,stressGain:0,stressLoss:0};
    Object.keys(e.emotionalCooldowns||{}).forEach(k=>{e.emotionalCooldowns[k]=Math.max(0,(e.emotionalCooldowns[k]||0)-1);if(e.emotionalCooldowns[k]<=0)delete e.emotionalCooldowns[k];});
  }
}
function emotionalCapDelta(e,kind,delta){
  const totals=e.emotionalDailyTotals,limits=e.emotionalLimits;
  if(delta>0){
    const key=kind==="morale"?"moraleGain":"stressGain",limit=kind==="morale"?limits.maxDailyMoraleGain:limits.maxDailyStressGain;
    const allowed=Math.max(0,limit-(totals[key]||0)),applied=Math.min(delta,allowed);totals[key]=(totals[key]||0)+applied;return applied;
  }
  if(delta<0){
    const key=kind==="morale"?"moraleLoss":"stressLoss",limit=kind==="morale"?limits.maxDailyMoraleLoss:limits.maxDailyStressLoss;
    const allowed=Math.max(0,limit-(totals[key]||0)),applied=-Math.min(Math.abs(delta),allowed);totals[key]=(totals[key]||0)+Math.abs(applied);return applied;
  }
  return 0;
}
// EMPLOYEE AI BOUNDARY:
// Work/Institutional AI decides and performs work.
// Social Personality AI only recommends stress and morale changes.
// Do not allow this system to directly modify project, task, skill,
// hiring, staffing, learning, productivity, customer, or company-risk state.
function evaluateEmployeeEmotionalReaction({employee,event={},relationshipContext={},workloadContext={},roomContext={}}={}){
  const e=employee;if(!e)return {moraleDelta:0,stressDelta:0,reasonCode:"missing-employee",sourceEventId:event?.id||null,relatedEmployeeIds:[]};
  ensureEmployeePersonality(e);
  const p=e.personality,rel=Number(relationshipContext.relationshipScore??averageRelationship?.(e)??0),workload=Number(workloadContext.pressure??e.stress??50),roomStress=Number(roomContext.stress??0),congestion=Number(roomContext.congestion??0);
  let moraleDelta=0,stressDelta=0,reasonCode=event.type||"daily";
  if(event.type==="social"){moraleDelta+=.7+(p.sociability||0)*1.1+(rel>20?.5:rel<0?-.5:0);stressDelta+=-(.25+(p.sociability||0)*.35)+(p.structureNeed||0)*.25;}
  else if(event.type==="focus"){moraleDelta+=.35+(p.structureNeed||0)*.55+(p.detailOrientation||0)*.35;stressDelta+=-(.15+(p.resilience||0)*.25)+(congestion>.8?.5:0);}
  else if(event.type==="workload"){stressDelta+=.45+Math.max(0,workload-60)*.035-(p.resilience||0)*.55-(p.adaptability||0)*.2;moraleDelta+=workload>72?-(.35+(p.structureNeed||0)*.18):.12+(p.initiative||0)*.18;}
  else if(event.type==="recovery"){stressDelta-=.8+(p.resilience||0)*.35+(p.structureNeed||0)*.12;moraleDelta+=.2+(p.resilience||0)*.18;}
  else {stressDelta+=roomStress*.35-(p.resilience||0)*.18;moraleDelta+=(rel>20?.12:0)-(rel<-20?.25:0);}
  return {moraleDelta:Number(clamp(moraleDelta,-3,3).toFixed(3)),stressDelta:Number(clamp(stressDelta,-3,3).toFixed(3)),reasonCode,sourceEventId:event.id||null,relatedEmployeeIds:relationshipContext.relatedEmployeeIds||[]};
}
function logSocialEmotionalTrace(trace){
  if(!company)return trace;
  company.socialEmotionTraces=Array.isArray(company.socialEmotionTraces)?company.socialEmotionTraces:[];
  company.socialEmotionTraces=[trace,...company.socialEmotionTraces].slice(0,80);
  company.lastSocialEmotionalEffect=trace;
  return trace;
}
function notifyEmployeeEmotionChanged(e,trace){
  if(!e)return false;
  if(!validationMode&&typeof document!=="undefined"){
    document.dispatchEvent(new CustomEvent("employee-state-changed",{detail:{employeeId:e.id,trace}}));
    const modal=document.getElementById("employeeModal");
    if(selectedEmployeeId===e.id&&modal&&!modal.classList.contains("hidden")&&typeof showEmployee==="function")showEmployee(e.id);
    const node=document.getElementById(`agent-${e.id}`);
    if(node)node.dataset.emotionalStateChanged=`${trace?.timestamp?.absoluteMinute??company?.minute??0}`;
    return true;
  }
  return false;
}
function applyEmotionalRecommendation({employeeId,stressDelta=0,moraleDelta=0,reasonCode="emotion",sourceEventId=null,relatedEmployeeIds=[],timestamp=null}={}){
  const e=(employees||[]).find(x=>x.id===Number(employeeId)&&x.active);
  const requestedStress=Number(stressDelta)||0,requestedMorale=Number(moraleDelta)||0,ts=timestamp||simulationTimestamp();
  if(!e){
    return logSocialEmotionalTrace({type:"social_emotion_applied",employeeId:Number(employeeId),oldStress:null,stressDeltaRequested:requestedStress,stressDeltaApplied:0,newStress:null,oldMorale:null,moraleDeltaRequested:requestedMorale,moraleDeltaApplied:0,newMorale:null,reasonCode,sourceEventId,relatedEmployeeIds,blockedByCooldown:false,blockedByCap:false,status:"employee_missing",timestamp:ts});
  }
  ensureEmployeePersonality(e);resetEmployeeEmotionalDay(e);
  const oldStress=Number(e.stress)||0,oldMorale=Number(e.morale)||0,code=`${sourceEventId||"local"}:${e.id}:${reasonCode}`;
  if(e.emotionalCooldowns[code]>0){
    return logSocialEmotionalTrace({type:"social_emotion_applied",employeeId:e.id,oldStress,stressDeltaRequested:requestedStress,stressDeltaApplied:0,newStress:oldStress,oldMorale,moraleDeltaRequested:requestedMorale,moraleDeltaApplied:0,newMorale:oldMorale,reasonCode,sourceEventId,relatedEmployeeIds,blockedByCooldown:true,blockedByCap:false,status:"blocked_by_cooldown",timestamp:ts});
  }
  if(requestedStress===0&&requestedMorale===0){
    return logSocialEmotionalTrace({type:"social_emotion_applied",employeeId:e.id,oldStress,stressDeltaRequested:0,stressDeltaApplied:0,newStress:oldStress,oldMorale,moraleDeltaRequested:0,moraleDeltaApplied:0,newMorale:oldMorale,reasonCode,sourceEventId,relatedEmployeeIds,blockedByCooldown:false,blockedByCap:false,status:"zero_reaction",timestamp:ts});
  }
  const moraleApplied=emotionalCapDelta(e,"morale",requestedMorale),stressApplied=emotionalCapDelta(e,"stress",requestedStress);
  const blockedByCap=(requestedMorale!==moraleApplied)||(requestedStress!==stressApplied);
  e.morale=clamp(oldMorale+moraleApplied,0,100);e.stress=clamp(oldStress+stressApplied,0,100);
  e.emotionalCooldowns[code]=1;
  e.lastEmotionalReaction={moraleDelta:moraleApplied,stressDelta:stressApplied,reasonCode,sourceEventId,relatedEmployeeIds};
  e.recentEmotionalEvents=[{day:company.day,minute:company.minute,reasonCode,moraleDelta:moraleApplied,stressDelta:stressApplied,sourceEventId},...(e.recentEmotionalEvents||[])].slice(0,12);
  const state=e.emotionalState||{};
  state.frustration=clamp((state.frustration||20)+Math.max(0,stressApplied)*2-Math.max(0,-stressApplied),0,100);
  state.belonging=clamp((state.belonging||55)+Math.max(0,moraleApplied)*.8-Math.max(0,-moraleApplied)*.9,0,100);
  state.recoveryDebt=clamp((state.recoveryDebt||0)+Math.max(0,stressApplied)*.8-Math.max(0,-stressApplied)*1.2,0,100);
  const trace={type:"social_emotion_applied",employeeId:e.id,oldStress,stressDeltaRequested:requestedStress,stressDeltaApplied:stressApplied,newStress:e.stress,oldMorale,moraleDeltaRequested:requestedMorale,moraleDeltaApplied:moraleApplied,newMorale:e.morale,reasonCode,sourceEventId,relatedEmployeeIds,blockedByCooldown:false,blockedByCap,status:blockedByCap&&stressApplied===0&&moraleApplied===0?"blocked_by_daily_cap":blockedByCap?"applied_with_cap":"applied",timestamp:ts};
  trace.uiNotified=notifyEmployeeEmotionChanged(e,trace);
  return logSocialEmotionalTrace(trace);
}
const emotionalSystem={applyRecommendation:applyEmotionalRecommendation};
function applyEmployeeEmotionalReaction(args){
  const e=args?.employee;if(!e)return null;
  const reaction=evaluateEmployeeEmotionalReaction(args);
  const trace=emotionalSystem.applyRecommendation({employeeId:e.id,stressDelta:reaction.stressDelta,moraleDelta:reaction.moraleDelta,reasonCode:reaction.reasonCode,sourceEventId:reaction.sourceEventId,relatedEmployeeIds:reaction.relatedEmployeeIds,timestamp:simulationTimestamp()});
  return {...reaction,moraleDelta:trace?.moraleDeltaApplied||0,stressDelta:trace?.stressDeltaApplied||0,capped:trace?.blockedByCap||false,blockedByCooldown:trace?.blockedByCooldown||false};
}
function makeRelationshipKey(employeeAId,employeeBId){
  return [Number(employeeAId),Number(employeeBId)].sort((a,b)=>a-b).join(":");
}
function simulationTimestamp(day=company?.day||0,minute=company?.minute||0){
  return {day,minute,absoluteMinute:day*1440+minute};
}
function emptyRelationshipInterpretation(){
  return {...EMPTY_RELATIONSHIP_INTERPRETATION};
}
function ensureSocialAISystems(){
  if(!company)return;
  company.socialRelationships=company.socialRelationships&&typeof company.socialRelationships==="object"?company.socialRelationships:{};
  company.socialMemories=Array.isArray(company.socialMemories)?company.socialMemories:[];
  company.roomPresenceCounters=company.roomPresenceCounters&&typeof company.roomPresenceCounters==="object"?company.roomPresenceCounters:{};
  company.socialPreferenceHistory=Array.isArray(company.socialPreferenceHistory)?company.socialPreferenceHistory.slice(0,80):[];
  company.socialPreferenceDebug=Array.isArray(company.socialPreferenceDebug)?company.socialPreferenceDebug.slice(0,24):[];
  company.socialEmotionTraces=Array.isArray(company.socialEmotionTraces)?company.socialEmotionTraces.slice(0,80):[];
  company.lastSocialEmotionalEffect=company.lastSocialEmotionalEffect||null;
  company.workplaceReputations=company.workplaceReputations&&typeof company.workplaceReputations==="object"?company.workplaceReputations:{};
  Object.entries(company.socialRelationships).forEach(([key,record])=>{
    const ids=key.split(":").map(Number);
    if(ids.length!==2||ids.some(id=>!Number.isFinite(id))){delete company.socialRelationships[key];return;}
    record.employeeAId=Number.isFinite(record.employeeAId)?record.employeeAId:ids[0];
    record.employeeBId=Number.isFinite(record.employeeBId)?record.employeeBId:ids[1];
    record.familiarity=clamp(Number(record.familiarity)||0,0,100);
    record.interactionCount=Math.max(0,Number(record.interactionCount)||0);
    record.positiveExperienceCount=Math.max(0,Number(record.positiveExperienceCount)||0);
    record.neutralExperienceCount=Math.max(0,Number(record.neutralExperienceCount)||0);
    record.negativeExperienceCount=Math.max(0,Number(record.negativeExperienceCount)||0);
    record.recentExperiences=Array.isArray(record.recentExperiences)?record.recentExperiences.slice(0,20):[];
    record.experienceSummary=record.experienceSummary&&typeof record.experienceSummary==="object"?record.experienceSummary:{};
    record.relationship=record.relationship&&typeof record.relationship==="object"?record.relationship:emptyRelationshipInterpretation();
    record.relationship.trust=clamp(Number(record.relationship.trust)||0,0,100);
    record.relationship.respect=clamp(Number(record.relationship.respect)||0,0,100);
    record.relationship.comfort=clamp(Number(record.relationship.comfort)||0,0,100);
    record.relationship.professionalFriction=clamp(Number(record.relationship.professionalFriction)||0,0,100);
    record.relationshipInputs=record.relationshipInputs&&typeof record.relationshipInputs==="object"?record.relationshipInputs:{};
    record.lastRelationshipEvaluationAt=record.lastRelationshipEvaluationAt||null;
    record.recentInteractionTypes=Array.isArray(record.recentInteractionTypes)?record.recentInteractionTypes.slice(0,12):[];
    record.cooldowns=record.cooldowns&&typeof record.cooldowns==="object"?record.cooldowns:{};
    record.stressHistory=Number(record.stressHistory)||0;
    record.moraleHistory=Number(record.moraleHistory)||0;
  });
  Object.entries(company.workplaceReputations).forEach(([id,rep])=>{
    if(!(employees||[]).some(e=>e.id===Number(id))){delete company.workplaceReputations[id];return;}
    rep.dimensions=rep.dimensions&&typeof rep.dimensions==="object"?rep.dimensions:{};
    rep.dimensions.technical=clamp(Number.isFinite(Number(rep.dimensions.technical))?Number(rep.dimensions.technical):50,0,100);
    rep.dimensions.reliability=clamp(Number.isFinite(Number(rep.dimensions.reliability))?Number(rep.dimensions.reliability):50,0,100);
    rep.dimensions.approachability=clamp(Number.isFinite(Number(rep.dimensions.approachability))?Number(rep.dimensions.approachability):50,0,100);
    rep.dimensions.professionalism=clamp(Number.isFinite(Number(rep.dimensions.professionalism))?Number(rep.dimensions.professionalism):50,0,100);
    rep.observations=Array.isArray(rep.observations)?rep.observations.slice(0,36):[];
    rep.recentChanges=Array.isArray(rep.recentChanges)?rep.recentChanges.slice(0,12):[];
    rep.confidence=clamp(Number(rep.confidence)||0,0,100);
    rep.lastUpdatedAt=rep.lastUpdatedAt||null;
  });
}
function workplaceReputationFor(employeeOrId,{create=false}={}){
  ensureSocialAISystems();
  const id=Number(employeeOrId?.id??employeeOrId);
  if(!Number.isFinite(id))return null;
  if(!company.workplaceReputations[id]&&create){
    company.workplaceReputations[id]={employeeId:id,dimensions:{technical:50,reliability:50,approachability:50,professionalism:50},confidence:0,observations:[],recentChanges:[],lastUpdatedAt:null};
  }
  return company.workplaceReputations[id]||null;
}
function workplaceReputationObservationDelta(type,tone,intensity=1){
  const scale=clamp(Number(intensity)||1,1,5)/5;
  const positive=tone==="positive",negative=tone==="negative",mixed=tone==="mixed";
  const delta={technical:0,reliability:0,approachability:0,professionalism:0};
  if(type==="direct_help"||type==="blocker_resolved_together"){delta.technical+=5*scale;delta.reliability+=4*scale;delta.approachability+=3*scale;delta.professionalism+=2*scale;}
  else if(type==="shared_work_activity"){delta.technical+=positive?3*scale:mixed?1*scale:0;delta.reliability+=positive?3*scale:negative?-2*scale:1*scale;}
  else if(type==="shared_meeting"){delta.professionalism+=positive?3*scale:negative?-4*scale:1*scale;delta.approachability+=positive?2*scale:negative?-2*scale:0;}
  else if(type==="shared_break"){delta.approachability+=positive?4*scale:negative?-2*scale:1*scale;}
  else if(type==="deadline_pressure_together"){delta.reliability+=positive?2*scale:mixed?-1*scale:-3*scale;delta.professionalism+=mixed?-1*scale:negative?-3*scale:1*scale;}
  else if(type==="milestone_success_together"||type==="recognition_shared"){delta.technical+=3*scale;delta.reliability+=4*scale;delta.professionalism+=2*scale;}
  else if(type==="milestone_failure_together"){delta.reliability-=3*scale;delta.professionalism-=1*scale;}
  else if(type==="interruption_shared"){delta.professionalism-=4*scale;delta.approachability-=2*scale;}
  else if(type==="conflict_observed"){delta.approachability-=4*scale;delta.professionalism-=5*scale;delta.reliability-=1*scale;}
  else if(type==="onboarding_support"||type==="mentoring_interaction"){delta.approachability+=3*scale;delta.professionalism+=2*scale;delta.reliability+=2*scale;}
  if(negative){delta.approachability-=1.5*scale;delta.professionalism-=1.5*scale;}
  if(positive){delta.professionalism+=.8*scale;}
  return delta;
}
function recordWorkplaceReputationObservation(employee,context={}){
  const rep=workplaceReputationFor(employee,{create:true});
  if(!rep)return null;
  const type=normalizeSocialExperienceType(context.type||"shared_work_activity"),tone=context.tone||"neutral",intensity=clamp(Number(context.intensity)||1,1,5);
  const sourceId=context.sourceEventId||context.experienceId||`${type}-${company.day}-${company.minute}-${employee.id}`;
  if((rep.observations||[]).some(o=>o.sourceId===sourceId&&o.type===type))return rep;
  const delta=workplaceReputationObservationDelta(type,tone,intensity);
  const observation={day:company.day,minute:company.minute,type,tone,intensity,sourceId,delta};
  rep.observations=[observation,...(rep.observations||[])].slice(0,36);
  const evidenceCount=rep.observations.length;
  rep.confidence=clamp(evidenceCount*8+(new Set(rep.observations.map(o=>o.type)).size*5),0,100);
  const weight=evidenceCount<2?0:clamp(.18+(rep.confidence/100)*.18,.18,.36);
  const before={...rep.dimensions};
  for(const key of ["technical","reliability","approachability","professionalism"]){
    rep.dimensions[key]=clamp((rep.dimensions[key]??50)+(delta[key]||0)*weight,0,100);
  }
  rep.lastUpdatedAt=simulationTimestamp();
  const changed=Object.entries(rep.dimensions).map(([k,v])=>({key:k,delta:Number((v-(before[k]??50)).toFixed(3))})).filter(x=>Math.abs(x.delta)>.01);
  if(changed.length)rep.recentChanges=[{day:company.day,minute:company.minute,type,tone,changes:changed},...(rep.recentChanges||[])].slice(0,12);
  return rep;
}
function reputationLabelFor(rep){
  if(!rep||Number(rep.confidence||0)<16)return "Mostly unknown";
  const d=rep.dimensions||{},strong=Object.entries(d).filter(([,v])=>v>=64).sort((a,b)=>b[1]-a[1]),weak=Object.entries(d).filter(([,v])=>v<=38).sort((a,b)=>a[1]-b[1]);
  if(strong.length&&weak.length)return `${strong[0][0]} strength, ${weak[0][0]} concern`;
  if(strong.length)return `Known for ${strong[0][0]}`;
  if(weak.length)return `${weak[0][0]} concern`;
  return "Developing reputation";
}
function socialRelationshipRecord(aId,bId,{create=false}={}){
  ensureSocialAISystems();
  if(!Number.isFinite(Number(aId))||!Number.isFinite(Number(bId))||Number(aId)===Number(bId))return null;
  const key=makeRelationshipKey(aId,bId);
  if(!company.socialRelationships[key]&&create){
    const [employeeAId,employeeBId]=key.split(":").map(Number);
    company.socialRelationships[key]={employeeAId,employeeBId,familiarity:0,interactionCount:0,firstMetAt:null,lastInteractionAt:null,positiveExperienceCount:0,neutralExperienceCount:0,negativeExperienceCount:0,recentExperiences:[],experienceSummary:{},relationship:emptyRelationshipInterpretation(),relationshipInputs:{},lastRelationshipEvaluationAt:null,recentInteractionTypes:[],cooldowns:{},stressHistory:0,moraleHistory:0};
  }
  return company.socialRelationships[key]||null;
}
function personalityCompatibility(a,b){
  ensureEmployeePersonality(a);ensureEmployeePersonality(b);
  const pa=a?.personality||{},pb=b?.personality||{};
  let distance=0,count=0;
  PERSONALITY_KEYS.forEach(k=>{if(Number.isFinite(pa[k])&&Number.isFinite(pb[k])){distance+=Math.abs(pa[k]-pb[k]);count++;}});
  return count?clamp(1-distance/(count*2),0,1):.5;
}
function pairExperienceMetric(record,type){
  const summary=record?.experienceSummary?.[type];
  return summary?Number(summary.count)||0:0;
}
function recentExperienceWeight(record,types=[]){
  const wanted=new Set(types);
  return (record?.recentExperiences||[]).reduce((sum,x,index)=>sum+(wanted.has(x.type)?(Number(x.intensity)||1)*Math.max(.25,1-index*.04):0),0);
}
function evaluateRelationshipInterpretation(record){
  ensureSocialAISystems();
  if(!record)return emptyRelationshipInterpretation();
  const a=employees?.find(e=>e.id===record.employeeAId),b=employees?.find(e=>e.id===record.employeeBId);
  if(!a||!b)return record.relationship||emptyRelationshipInterpretation();
  ensureEmployeePersonality(a);ensureEmployeePersonality(b);
  const compat=personalityCompatibility(a,b),familiarity=clamp(Number(record.familiarity)||0,0,100);
  const positive=Number(record.positiveExperienceCount)||0,neutral=Number(record.neutralExperienceCount)||0,negative=Number(record.negativeExperienceCount)||0,total=Math.max(1,positive+neutral+negative);
  const positiveRatio=positive/total,negativeRatio=negative/total;
  const directHelp=pairExperienceMetric(record,"direct_help"),blockers=pairExperienceMetric(record,"blocker_resolved_together"),work=pairExperienceMetric(record,"shared_work_activity"),meetings=pairExperienceMetric(record,"shared_meeting"),breaks=pairExperienceMetric(record,"shared_break");
  const deadline=pairExperienceMetric(record,"deadline_pressure_together"),success=pairExperienceMetric(record,"milestone_success_together"),failure=pairExperienceMetric(record,"milestone_failure_together"),recognition=pairExperienceMetric(record,"recognition_shared"),interruptions=pairExperienceMetric(record,"interruption_shared"),conflict=pairExperienceMetric(record,"conflict_observed"),crisis=pairExperienceMetric(record,"crisis_response_together"),onboarding=pairExperienceMetric(record,"onboarding_support"),mentoring=pairExperienceMetric(record,"mentoring_interaction");
  const recentHelp=recentExperienceWeight(record,["direct_help","blocker_resolved_together","onboarding_support","mentoring_interaction"]);
  const recentFriction=recentExperienceWeight(record,["deadline_pressure_together","milestone_failure_together","interruption_shared","conflict_observed"]);
  const paceMismatch=Math.abs((a.personality.workPace||0)-(b.personality.workPace||0)),detailMismatch=Math.abs((a.personality.detailOrientation||0)-(b.personality.detailOrientation||0)),structureMismatch=Math.abs((a.personality.structureNeed||0)-(b.personality.structureNeed||0));
  const styleMismatch=(paceMismatch*.45+detailMismatch*.35+structureMismatch*.20);
  const sharedPressure=deadline+crisis+failure;
  const trust=clamp(18+familiarity*.22+positiveRatio*20+directHelp*3.5+blockers*5+onboarding*3+mentoring*3+crisis*2.5+recentHelp*1.1-negativeRatio*16-failure*3-conflict*4-interruptions*2,0,100);
  const respect=clamp(22+familiarity*.13+work*1.3+meetings*.9+success*5+recognition*4.5+blockers*5+directHelp*2.2+mentoring*3+sharedPressure*1.4-negativeRatio*7,0,100);
  const comfort=clamp(24+familiarity*.28+compat*22+breaks*4+meetings*1.3+positiveRatio*12+directHelp*1.2+onboarding*2.5-conflict*5-interruptions*3-failure*2.2-styleMismatch*9,0,100);
  const professionalFriction=clamp(8+negativeRatio*22+deadline*4.2+failure*4+interruptions*5+conflict*8+styleMismatch*22+recentFriction*1.1-Math.min(12,comfort*.08)-Math.min(8,trust*.05),0,100);
  record.relationship={trust:Math.round(trust),respect:Math.round(respect),comfort:Math.round(comfort),professionalFriction:Math.round(professionalFriction)};
  record.relationshipInputs={familiarity:Math.round(familiarity),positive,neutral,negative,compatibility:Number(compat.toFixed(3)),styleMismatch:Number(styleMismatch.toFixed(3)),recentHelp:Number(recentHelp.toFixed(2)),recentFriction:Number(recentFriction.toFixed(2)),counts:{directHelp,blockers,work,meetings,breaks,deadline,success,failure,recognition,interruptions,conflict,crisis,onboarding,mentoring}};
  record.lastRelationshipEvaluationAt=simulationTimestamp();
  return record.relationship;
}
function relationshipInterpretationFor(a,b,{evaluate=false}={}){
  const record=socialRelationshipRecord(a?.id,b?.id,{create:false});
  if(!record)return emptyRelationshipInterpretation();
  return evaluate?evaluateRelationshipInterpretation(record):(record.relationship||emptyRelationshipInterpretation());
}
function evaluateEmployeeRelationshipInterpretations(e){
  if(!e?.active)return;
  ensureSocialAISystems();
  Object.values(company.socialRelationships||{}).forEach(record=>{
    if(record.employeeAId!==e.id&&record.employeeBId!==e.id)return;
    const otherId=record.employeeAId===e.id?record.employeeBId:record.employeeAId;
    const other=employees?.find(x=>x.id===otherId&&x.active);
    if(other)evaluateRelationshipInterpretation(record);
  });
}
function relationshipEmotionalReaction(employee,coworker,eventType="social"){
  const record=socialRelationshipRecord(employee?.id,coworker?.id,{create:false});
  if(!record?.lastRelationshipEvaluationAt)return {stressDelta:0,moraleDelta:0,reasonCode:`relationship_${eventType}`};
  const rel=record.relationship||emptyRelationshipInterpretation();
  const trust=Number(rel.trust)||0,comfort=Number(rel.comfort)||0,friction=Number(rel.professionalFriction)||0,respect=Number(rel.respect)||0;
  let moraleDelta=0,stressDelta=0,reasonCode=`relationship_${eventType}`;
  if(eventType==="helpful_nearby"){moraleDelta+=(trust-50)/45+(respect-50)/80;stressDelta-=Math.max(0,comfort-50)/90;}
  else if(eventType==="interruption"){stressDelta+=.4+Math.max(0,friction-35)/35-Math.max(0,comfort-55)/70;moraleDelta-=Math.max(0,friction-55)/90;}
  else if(eventType==="pressure"){stressDelta+=Math.max(0,friction-45)/45-Math.max(0,trust-60)/80;moraleDelta+=Math.max(0,respect-65)/100;}
  else {moraleDelta+=(comfort-50)/85+(trust-50)/110;stressDelta+=Math.max(0,friction-55)/85-Math.max(0,comfort-65)/100;}
  return {stressDelta:Number(clamp(stressDelta,-1.5,1.5).toFixed(3)),moraleDelta:Number(clamp(moraleDelta,-1.5,1.5).toFixed(3)),reasonCode};
}
function normalizeSocialExperienceType(type){
  if(SOCIAL_EXPERIENCE_TYPES.has(type))return type;
  return {
    same_room_presence:"shared_work_activity",
    shared_work_event:"shared_work_activity",
    shared_break:"shared_break",
    same_meeting:"shared_meeting",
    direct_help:"direct_help",
    first_meeting:"shared_work_activity"
  }[type]||"shared_work_activity";
}
function socialExperienceTone(reactions={},fallback="neutral"){
  const values=Object.values(reactions||{});
  if(!values.length)return fallback;
  const positive=values.filter(r=>(r.moraleDelta||0)>0.15&&(r.stressDelta||0)<0.8).length;
  const negative=values.filter(r=>(r.stressDelta||0)>0.6||(r.moraleDelta||0)<-0.15).length;
  if(positive&&negative)return "mixed";
  if(positive)return "positive";
  if(negative)return "negative";
  return fallback;
}
function socialExperienceReaction(employee,coworker,type,intensity,tone){
  ensureEmployeePersonality(employee);
  const p=employee.personality||{};
  let moraleDelta=0,stressDelta=0,reasonCode=`experience_${type}`;
  if(type==="shared_break"){moraleDelta=1.2+(p.sociability||0)*.7;stressDelta=-(.8+(p.empathy||0)*.25);}
  else if(type==="shared_meeting"){moraleDelta=(p.collaboration||0)*.55;stressDelta=(p.structureNeed||0)>.35?-.4:.6-(p.collaboration||0)*.3;}
  else if(type==="direct_help"){moraleDelta=2.1+(p.empathy||0)*.7+(p.collaboration||0)*.45;stressDelta=-(1+(p.empathy||0)*.35);}
  else if(type==="blocker_resolved_together"){moraleDelta=2.6+(p.collaboration||0)*.55;stressDelta=-(.7+(p.resilience||0)*.35);}
  else if(type==="deadline_pressure_together"){moraleDelta=(p.resilience||0)*.35-.8;stressDelta=2.1-(p.resilience||0)*.45;}
  else if(type==="milestone_success_together"||type==="recognition_shared"){moraleDelta=2.2+(p.sociability||0)*.4;stressDelta=-.7;}
  else if(type==="milestone_failure_together"){moraleDelta=-1.4;stressDelta=2.4-(p.resilience||0)*.45;}
  else if(type==="interruption_shared"){moraleDelta=-.8;stressDelta=1.5;}
  else if(type==="conflict_observed"){moraleDelta=-1.4;stressDelta=2.3;}
  else {moraleDelta=.7+(p.collaboration||0)*.35;stressDelta=(tone==="negative"?1.2:0)-(tone==="positive"?.6:0);}
  if(tone==="negative"){moraleDelta-=.8;stressDelta+=1.1;}
  if(tone==="positive"){moraleDelta+=.7;stressDelta-=.5;}
  if(tone==="mixed"){moraleDelta+=.2;stressDelta+=.7;}
  const relationshipReaction=relationshipEmotionalReaction(employee,coworker,type==="interruption_shared"?"interruption":type==="deadline_pressure_together"?"pressure":type==="direct_help"||type==="blocker_resolved_together"?"helpful_nearby":"social");
  moraleDelta+=relationshipReaction.moraleDelta*.45;
  stressDelta+=relationshipReaction.stressDelta*.45;
  const scale=clamp((Number(intensity)||1)/3,.45,1.35);
  return {moraleDelta:Math.round(clamp(moraleDelta*scale,-3,3)),stressDelta:Math.round(clamp(stressDelta*scale,-4,4)),reasonCode,sourceEventId:null,relatedEmployeeIds:[coworker.id]};
}
function applySocialReaction(employee,reaction){
  const trace=emotionalSystem.applyRecommendation({employeeId:employee?.id,stressDelta:reaction?.stressDelta||0,moraleDelta:reaction?.moraleDelta||0,reasonCode:reaction?.reasonCode||"social_reaction",sourceEventId:reaction?.sourceEventId||null,relatedEmployeeIds:reaction?.relatedEmployeeIds||[],timestamp:simulationTimestamp()});
  return {...reaction,moraleDelta:trace?.moraleDeltaApplied||0,stressDelta:trace?.stressDeltaApplied||0,capped:trace?.blockedByCap||false,blockedByCooldown:trace?.blockedByCooldown||false,status:trace?.status};
}
function recordSharedExperience(a,b,{type="shared_work_activity",sourceEventId=null,roomId=null,projectId=null,participants=null,tone=null,intensity=1,requireSource=false}={}){
  if(!a?.active||!b?.active||a.id===b.id)return null;
  const experienceType=normalizeSocialExperienceType(type);
  if((requireSource||experienceType==="direct_help"||experienceType==="blocker_resolved_together")&&!sourceEventId)return null;
  const record=socialRelationshipRecord(a.id,b.id,{create:true}),pairKey=makeRelationshipKey(a.id,b.id),id=`${sourceEventId||`local-${company.day}-${company.minute}`}:${experienceType}:${pairKey}`;
  if((record.recentExperiences||[]).some(x=>x.id===id)){
    [a,b].forEach(employee=>logSocialEmotionalTrace({type:"social_emotion_applied",employeeId:employee.id,oldStress:employee.stress,stressDeltaRequested:0,stressDeltaApplied:0,newStress:employee.stress,oldMorale:employee.morale,moraleDeltaRequested:0,moraleDeltaApplied:0,newMorale:employee.morale,reasonCode:`experience_${experienceType}`,sourceEventId:id,relatedEmployeeIds:[a.id,b.id].filter(x=>x!==employee.id),blockedByCooldown:false,blockedByCap:false,status:"duplicate_event",timestamp:simulationTimestamp()}));
    return record;
  }
  const boundedIntensity=clamp(Math.round(Number(intensity)||1),1,5);
  const reactionA=socialExperienceReaction(a,b,experienceType,boundedIntensity,tone||"neutral");
  const reactionB=socialExperienceReaction(b,a,experienceType,boundedIntensity,tone||"neutral");
  reactionA.sourceEventId=id;reactionB.sourceEventId=id;
  const appliedA=applySocialReaction(a,reactionA),appliedB=applySocialReaction(b,reactionB);
  const reactions={[a.id]:{stressDelta:appliedA?.stressDelta||0,moraleDelta:appliedA?.moraleDelta||0,reasonCode:appliedA?.reasonCode||reactionA.reasonCode},[b.id]:{stressDelta:appliedB?.stressDelta||0,moraleDelta:appliedB?.moraleDelta||0,reasonCode:appliedB?.reasonCode||reactionB.reasonCode}};
  const emotionalTone=tone||socialExperienceTone(reactions,"neutral");
  const now=simulationTimestamp();
  const experience={id,type:experienceType,timestamp:now,sourceEventId:sourceEventId||null,roomId:roomId||null,projectId:projectId||null,participants:participants||[a.id,b.id],emotionalTone,intensity:boundedIntensity,employeeReactions:reactions,dedupeKey:id};
  record.recentExperiences=[experience,...(record.recentExperiences||[])].slice(0,20);
  const summary=record.experienceSummary[experienceType]||{count:0,positive:0,neutral:0,negative:0,mixed:0,lastAt:null};
  summary.count++;summary[emotionalTone]=(summary[emotionalTone]||0)+1;summary.lastAt=now.absoluteMinute;record.experienceSummary[experienceType]=summary;
  if(emotionalTone==="positive")record.positiveExperienceCount++;else if(emotionalTone==="negative")record.negativeExperienceCount++;else record.neutralExperienceCount++;
  record.stressHistory=Number(((record.stressHistory||0)+(reactions[a.id].stressDelta||0)+(reactions[b.id].stressDelta||0)).toFixed(3));
  record.moraleHistory=Number(((record.moraleHistory||0)+(reactions[a.id].moraleDelta||0)+(reactions[b.id].moraleDelta||0)).toFixed(3));
  evaluateRelationshipInterpretation(record);
  recordWorkplaceReputationObservation(a,{type:experienceType,tone:emotionalTone,intensity:boundedIntensity,sourceEventId:sourceEventId||id,experienceId:id});
  recordWorkplaceReputationObservation(b,{type:experienceType,tone:emotionalTone,intensity:boundedIntensity,sourceEventId:sourceEventId||id,experienceId:id});
  return record;
}
function socialEncounterEmotion(employee,coworker,type,gain){
  ensureEmployeePersonality(employee);
  const p=employee.personality||{};
  let moraleDelta=0,stressDelta=0,reasonCode=`social_${type}`;
  if(type==="same_room_presence"){moraleDelta=(p.sociability||0)>.45?.12:0;stressDelta=(p.sociability||0)<-.45?.18:0;}
  else if(type==="shared_break"){moraleDelta=.25+(p.sociability||0)*.22;stressDelta=-(.12+(p.empathy||0)*.06);}
  else if(type==="same_meeting"){moraleDelta=.12+(p.collaboration||0)*.16;stressDelta=(p.structureNeed||0)>.35?-.04:.08-(p.collaboration||0)*.08;}
  else if(type==="shared_work_event"){moraleDelta=.22+(p.collaboration||0)*.22;stressDelta=-(p.collaboration||0)*.08;}
  else if(type==="direct_help"){moraleDelta=.35+(p.empathy||0)*.24+(p.collaboration||0)*.18;stressDelta=-(p.empathy||0)*.08;}
  else if(type==="first_meeting"){moraleDelta=(p.sociability||0)>.5?.35:0;stressDelta=(p.sociability||0)<-.45?.35:0;}
  const scale=clamp(gain/3,.25,1.1);
  return {moraleDelta:Number(clamp(moraleDelta*scale,-1.2,1.2).toFixed(3)),stressDelta:Number(clamp(stressDelta*scale,-1.2,1.2).toFixed(3)),reasonCode,sourceEventId:null,relatedEmployeeIds:[coworker.id]};
}
function socialPreferenceOpportunityRoom(employee,opportunity={}){
  return opportunity.roomId||employee?.currentRoom||roomForZone?.(employee?.zone)||null;
}
function socialPreferenceSocialBattery(employee){
  ensureEmployeePersonality(employee);
  const p=employee?.personality||{},state=employee?.emotionalState||{};
  if(Number.isFinite(Number(state.socialBattery)))return clamp(Number(state.socialBattery),0,100);
  return clamp(55+(p.sociability||0)*22-(employee?.stress||50)*.22+(employee?.morale||50)*.12,0,100);
}
function socialPreferenceCandidates(employee,opportunity={}){
  ensureSocialAISystems();
  const room=socialPreferenceOpportunityRoom(employee,opportunity);
  const allowed=Array.isArray(opportunity.participantIds)?new Set(opportunity.participantIds.map(Number)):null;
  const candidates=(employees||[]).filter(other=>{
    if(!other?.active||other.offsite||other.id===employee?.id)return false;
    if(allowed&&!allowed.has(other.id))return false;
    const otherRoom=other.currentRoom||roomForZone?.(other.zone)||null;
    return room&&otherRoom===room;
  });
  const allowAlone=opportunity.allowAlone!==false&&["break","hallway","waiting","waiting_for_equipment","conversation","meeting_before_after","project_discussion","mentoring"].includes(opportunity.type||"conversation");
  return {room,candidates,allowAlone};
}
function recentSocialPreferencePenalty(employeeId,candidateId){
  ensureSocialAISystems();
  const recent=(company.socialPreferenceHistory||[]).filter(x=>x.employeeId===employeeId).slice(0,8);
  const matches=recent.filter(x=>String(x.selectedEmployeeId??"alone")===String(candidateId??"alone")).length;
  return Math.max(0,matches)*7;
}
function socialPreferenceWeight(employee,candidate,opportunity={}){
  ensureSocialAISystems();ensureEmployeePersonality(employee);
  const p=employee.personality||{},battery=socialPreferenceSocialBattery(employee),stress=Number(employee.stress)||50,morale=Number(employee.morale)||50,type=opportunity.type||"conversation";
  if(candidate?.type==="alone"){
    let weight=18+(50-battery)*.38+Math.max(0,stress-62)*.22+(p.sociability<0?Math.abs(p.sociability)*18:0)+(type==="break"?8:0);
    weight-=Math.max(0,p.sociability)*10;
    weight-=recentSocialPreferencePenalty(employee.id,null);
    return clamp(weight,4,85);
  }
  const coworker=candidate,record=socialRelationshipRecord(employee.id,coworker.id,{create:false}),rel=record?.relationship||emptyRelationshipInterpretation();
  const familiarity=Number(record?.familiarity)||0,trust=Number(rel.trust)||0,respect=Number(rel.respect)||0,comfort=Number(rel.comfort)||0,friction=Number(rel.professionalFriction)||0;
  const rep=workplaceReputationFor(coworker,{create:false}),rd=rep?.dimensions||{},repConfidence=clamp(Number(rep?.confidence)||0,0,100)/100;
  const compatibility=personalityCompatibility(employee,coworker),teamMatch=employeeTeam?.(employee)===employeeTeam?.(coworker)?1:0;
  let weight=24+familiarity*.22+trust*.18+respect*.14+comfort*.20-friction*.24+compatibility*18+teamMatch*5;
  weight+=(p.sociability||0)*12+(p.collaboration||0)*10+(p.empathy||0)*6;
  weight+=repConfidence*((Number(rd.approachability??50)-50)*.16+(Number(rd.reliability??50)-50)*.10+(Number(rd.professionalism??50)-50)*.10+(Number(rd.technical??50)-50)*.06);
  weight+=Math.max(0,morale-55)*.08-Math.max(0,stress-72)*.12;
  if(type==="mentoring"||type==="project_discussion")weight+=(respect-45)*.12+(p.collaboration||0)*6;
  if(familiarity<18)weight+=clamp((company.culture?.communication||50)-45,0,14)*.35+4;
  weight-=recentSocialPreferencePenalty(employee.id,coworker.id);
  return clamp(weight,3,100);
}
function socialPreferenceReasonCode(employee,selected,opportunity={}){
  if(!selected||selected.type==="alone"){
    const battery=socialPreferenceSocialBattery(employee);
    return battery<42||employee?.stress>70?"social_preference_recovery_alone":"social_preference_alone";
  }
  const record=socialRelationshipRecord(employee.id,selected.id,{create:false}),rel=record?.relationship||emptyRelationshipInterpretation();
  if((rel.professionalFriction||0)>65)return "social_preference_friction";
  if((rel.trust||0)>60||(rel.comfort||0)>60)return "social_preference_trusted_coworker";
  if((record?.familiarity||0)<18)return "social_preference_new_contact";
  if((rel.respect||0)>60)return "social_preference_respected_coworker";
  return `social_preference_${opportunity.type||"conversation"}`;
}
function chooseSocialPreference(employee,opportunity={},options={}){
  ensureSocialAISystems();
  const {room,candidates,allowAlone}=socialPreferenceCandidates(employee,opportunity);
  const weighted=candidates.map(candidate=>({employeeId:candidate.id,name:candidate.name,type:"coworker",weight:Number(socialPreferenceWeight(employee,candidate,opportunity).toFixed(3)),reasonCode:socialPreferenceReasonCode(employee,candidate,opportunity)}));
  if(allowAlone)weighted.push({employeeId:null,name:"Spend time alone",type:"alone",weight:Number(socialPreferenceWeight(employee,{type:"alone"},opportunity).toFixed(3)),reasonCode:socialPreferenceReasonCode(employee,{type:"alone"},opportunity)});
  const total=weighted.reduce((sum,c)=>sum+Math.max(0,c.weight),0);
  let roll=simulationRandom()*Math.max(1,total),selected=weighted[weighted.length-1]||null;
  for(const candidate of weighted){roll-=Math.max(0,candidate.weight);if(roll<=0){selected=candidate;break;}}
  const decision={day:company.day,minute:company.minute,employeeId:employee?.id,employeeName:employee?.name,opportunityType:opportunity.type||"conversation",roomId:room,selectedEmployeeId:selected?.employeeId??null,selectedName:selected?.name||"No interaction",selectedType:selected?.type||"none",reasonCode:selected?.reasonCode||"social_preference_none",candidates:weighted};
  if(options.record!==false){
    company.socialPreferenceHistory=[decision,...(company.socialPreferenceHistory||[])].slice(0,80);
    company.socialPreferenceDebug=[decision,...(company.socialPreferenceDebug||[])].slice(0,24);
  }
  return decision;
}
function socialPreferenceEmotion(employee,preference,opportunity={}){
  ensureEmployeePersonality(employee);
  const selectedId=preference?.selectedEmployeeId??null,p=employee?.personality||{};
  let stressDelta=0,moraleDelta=0,reasonCode=preference?.reasonCode||"social_preference_none";
  if(selectedId==null){
    const battery=socialPreferenceSocialBattery(employee);
    stressDelta=battery<50?-.22:employee?.stress>70?-.16:0;
    moraleDelta=(p.sociability||0)>.45?-.04:.05;
  }else{
    const coworker=(employees||[]).find(x=>x.id===selectedId),record=socialRelationshipRecord(employee.id,selectedId,{create:false}),rel=record?.relationship||emptyRelationshipInterpretation();
    const trust=Number(rel.trust)||0,comfort=Number(rel.comfort)||0,friction=Number(rel.professionalFriction)||0,respect=Number(rel.respect)||0;
    const rep=workplaceReputationFor(selectedId,{create:false}),rd=rep?.dimensions||{},repConfidence=clamp(Number(rep?.confidence)||0,0,100)/100;
    moraleDelta=(comfort-45)/180+(trust-45)/220+(respect-50)/260+(p.sociability||0)*.04;
    stressDelta=Math.max(0,friction-55)/150-Math.max(0,comfort-60)/180-Math.max(0,trust-65)/220;
    moraleDelta+=repConfidence*((Number(rd.approachability??50)-50)/340+(Number(rd.reliability??50)-50)/420);
    stressDelta+=repConfidence*((50-Number(rd.professionalism??50))/360+(50-Number(rd.reliability??50))/430);
    if(coworker&&socialPreferenceOpportunityRoom(employee,opportunity)!==(coworker.currentRoom||roomForZone?.(coworker.zone)||null)){moraleDelta=0;stressDelta=0;reasonCode="social_preference_invalid_opportunity";}
  }
  return {stressDelta:Number(clamp(stressDelta,-.45,.45).toFixed(3)),moraleDelta:Number(clamp(moraleDelta,-.45,.45).toFixed(3)),reasonCode};
}
function applySocialPreferenceOpportunity(employee,opportunity={}){
  const preference=chooseSocialPreference(employee,opportunity);
  const emotion=socialPreferenceEmotion(employee,preference,opportunity);
  const reaction={...emotion,sourceEventId:`social-pref-${company.day}-${company.minute}-${employee.id}`,relatedEmployeeIds:preference.selectedEmployeeId!=null?[preference.selectedEmployeeId]:[]};
  applySocialReaction(employee,reaction);
  employee.socialPreferenceContext={...preference,emotion};
  return preference;
}
function socialPreferenceDebugHtml(e){
  ensureSocialAISystems();
  const decisions=(company.socialPreferenceDebug||[]).filter(d=>d.employeeId===e?.id).slice(0,5);
  if(!decisions.length)return "No social preference decisions yet.";
  return decisions.map(d=>`Day ${d.day}, minute ${d.minute}: ${d.opportunityType} in ${d.roomId||"unknown room"} selected ${d.selectedName} (${d.reasonCode}).<br>Candidates: ${(d.candidates||[]).map(c=>`${c.name} ${Number(c.weight||0).toFixed(1)} ${c.reasonCode}`).join("; ")||"none"}`).join("<br><br>");
}
function workplaceReputationDebugHtml(e){
  const rep=workplaceReputationFor(e,{create:false});
  if(!rep)return "Mostly unknown; no reputation evidence yet.";
  const d=rep.dimensions||{},observations=(rep.observations||[]).slice(0,6).map(o=>`${o.type} ${o.tone} intensity ${o.intensity} source ${o.sourceId}`).join("<br>")||"none";
  const changes=(rep.recentChanges||[]).slice(0,5).map(c=>`Day ${c.day}: ${c.type} ${c.tone} - ${c.changes.map(x=>`${x.key} ${x.delta>0?"+":""}${x.delta}`).join(", ")}`).join("<br>")||"none";
  return `Confidence ${Math.round(rep.confidence||0)} - ${reputationLabelFor(rep)}<br>Technical ${Math.round(d.technical??50)}; Reliability ${Math.round(d.reliability??50)}; Approachability ${Math.round(d.approachability??50)}; Professionalism ${Math.round(d.professionalism??50)}<br><br><strong>Contributing Observations</strong><br>${observations}<br><br><strong>Recent Changes</strong><br>${changes}`;
}
function socialEmotionTraceDebugHtml(e){
  const trace=(company.socialEmotionTraces||[]).find(t=>t.employeeId===e?.id)||company.lastSocialEmotionalEffect;
  if(!trace)return "No social emotional effect recorded yet.";
  const employee=(employees||[]).find(x=>x.id===trace.employeeId);
  const stress=`${trace.oldStress??"n/a"} -> ${trace.newStress??"n/a"} (${trace.stressDeltaApplied>0?"+":""}${trace.stressDeltaApplied??0})`;
  const morale=`${trace.oldMorale??"n/a"} -> ${trace.newMorale??"n/a"} (${trace.moraleDeltaApplied>0?"+":""}${trace.moraleDeltaApplied??0})`;
  return `Employee: ${employee?.name||trace.employeeId}<br>Event: ${trace.sourceEventId||"local"}<br>Reason: ${trace.reasonCode}<br>Stress: ${stress}<br>Morale: ${morale}<br>Applied: ${trace.status==="applied"?"yes":trace.status}<br>Blocked by cooldown: ${trace.blockedByCooldown?"yes":"no"}; blocked by daily cap: ${trace.blockedByCap?"yes":"no"}<br>Related employees: ${(trace.relatedEmployeeIds||[]).join(", ")||"none"}<br>UI notified: ${trace.uiNotified?"yes":"no"}`;
}
function applySocialEncounterEmotion(employee,coworker,type,sourceEventId,gain){
  const reaction=socialEncounterEmotion(employee,coworker,type,gain);
  reaction.sourceEventId=sourceEventId;
  return applySocialReaction(employee,reaction);
}
function recordSocialEncounter(a,b,{type="same_room_presence",gain=.25,sourceEventId=null,roomId=null,cooldownMinutes=120}={}){
  if(!a?.active||!b?.active||a.offsite||b.offsite||a.id===b.id)return null;
  ensureSocialAISystems();
  const record=socialRelationshipRecord(a.id,b.id,{create:true}),now=simulationTimestamp(),cooldownKey=`${type}:${sourceEventId||roomId||"local"}`;
  const last=Number(record.cooldowns[cooldownKey])||-999999;
  if(now.absoluteMinute-last<cooldownMinutes)return record;
  const first=record.interactionCount===0;
  const appliedGain=clamp(Number(gain)||0,0,5);
  record.cooldowns[cooldownKey]=now.absoluteMinute;
  record.familiarity=clamp((record.familiarity||0)+appliedGain,0,100);
  record.interactionCount++;
  if(first){
    record.firstMetAt=now;
    company.socialMemories.unshift({type:"first_met",employeeIds:[a.id,b.id],timestamp:now,roomId:roomId||null,sourceEventId:sourceEventId||null});
    record.familiarity=clamp(Math.max(record.familiarity,appliedGain),0,100);
  }
  record.lastInteractionAt=now;
  record.recentInteractionTypes=[{type,day:company.day,minute:company.minute,sourceEventId:sourceEventId||null,gain:appliedGain},...(record.recentInteractionTypes||[])].slice(0,12);
  recordSharedExperience(a,b,{type:normalizeSocialExperienceType(type),sourceEventId:sourceEventId||`${type}-${makeRelationshipKey(a.id,b.id)}-${company.day}-${company.minute}`,roomId,participants:[a.id,b.id],tone:null,intensity:type==="direct_help"?2:type==="shared_break"?1:1});
  return record;
}
function observeRoomFamiliarity(minutes=5){
  ensureSocialAISystems();
  const present=employees.filter(e=>e.active&&!e.offsite&&(e.currentRoom||roomForZone?.(e.zone))).map(e=>({employee:e,room:e.currentRoom||roomForZone(e.zone)}));
  const seen=new Set();
  for(let i=0;i<present.length;i++)for(let j=i+1;j<present.length;j++){
    if(present[i].room!==present[j].room)continue;
    const a=present[i].employee,b=present[j].employee,key=`${makeRelationshipKey(a.id,b.id)}:${present[i].room}`;
    seen.add(key);
    company.roomPresenceCounters[key]=(company.roomPresenceCounters[key]||0)+minutes;
    const threshold=present[i].room==="break-area"?20:60;
    if(company.roomPresenceCounters[key]>=threshold){
      const encounterType=present[i].room==="break-area"?"shared_break":present[i].room==="meeting-room"?"same_meeting":"same_room_presence";
      recordSocialEncounter(a,b,{type:encounterType,gain:present[i].room==="break-area"?.8:.35,roomId:present[i].room,cooldownMinutes:present[i].room==="break-area"?90:120});
      company.roomPresenceCounters[key]=0;
    }
  }
  Object.keys(company.roomPresenceCounters).forEach(key=>{if(!seen.has(key))company.roomPresenceCounters[key]=0;});
}
function familiaritySummaryForEmployee(e){
  ensureSocialAISystems();
  const records=Object.values(company.socialRelationships).filter(r=>r.employeeAId===e.id||r.employeeBId===e.id);
  if(!records.length)return "Still getting to know the team";
  const known=records.filter(r=>r.familiarity>=15).length,well=records.filter(r=>r.familiarity>=60).length;
  const top=records.slice().sort((a,b)=>(b.familiarity||0)-(a.familiarity||0))[0],otherId=top?.employeeAId===e.id?top.employeeBId:top?.employeeAId,other=employees.find(x=>x.id===otherId);
  const recentHelp=records.find(r=>(r.recentExperiences||[]).some(x=>x.type==="direct_help"||x.type==="blocker_resolved_together"));
  if(recentHelp)return `Recently shared meaningful work with ${employees.find(x=>x.id===(recentHelp.employeeAId===e.id?recentHelp.employeeBId:recentHelp.employeeAId))?.name||"a coworker"}`;
  if(well>0)return `Knows ${well} coworker${well===1?"":"s"} well; most familiar with ${other?.name||"a coworker"}`;
  if(known>0)return `Recognizes several coworkers; most familiar with ${other?.name||"a coworker"}`;
  return "Has met coworkers, but most relationships are still new";
}
function socialFamiliarityDebugHtml(e){
  ensureSocialAISystems();
  const rows=Object.entries(company.socialRelationships).filter(([,r])=>r.employeeAId===e.id||r.employeeBId===e.id).sort((a,b)=>(b[1].familiarity||0)-(a[1].familiarity||0)).slice(0,8);
  if(!rows.length)return "No recorded pair familiarity yet.";
  return rows.map(([key,r])=>{
    const otherId=r.employeeAId===e.id?r.employeeBId:r.employeeAId,other=employees.find(x=>x.id===otherId);
    const recent=(r.recentInteractionTypes||[]).slice(0,3).map(x=>`${x.type} day ${x.day} source ${x.sourceEventId||"local"}`).join("; ")||"none";
    const experiences=(r.recentExperiences||[]).slice(0,3).map(x=>`${x.type} ${x.emotionalTone} intensity ${x.intensity} source ${x.sourceEventId||"local"} dedupe ${x.dedupeKey}`).join("; ")||"none";
    const rel=r.relationship||emptyRelationshipInterpretation(),inputs=r.relationshipInputs||{},last=r.lastRelationshipEvaluationAt?`day ${r.lastRelationshipEvaluationAt.day}, minute ${r.lastRelationshipEvaluationAt.minute}`:"not evaluated";
    return `Pair ${key} (${other?.name||"missing employee"})<br>Familiarity ${Number(r.familiarity||0).toFixed(2)}; interactions ${r.interactionCount||0}<br>First met ${r.firstMetAt?`day ${r.firstMetAt.day}, minute ${r.firstMetAt.minute}`:"not recorded"}; last ${r.lastInteractionAt?`day ${r.lastInteractionAt.day}, minute ${r.lastInteractionAt.minute}`:"none"}<br>Relationship Interpretation: Trust ${rel.trust||0}; Respect ${rel.respect||0}; Comfort ${rel.comfort||0}; Professional Friction ${rel.professionalFriction||0}<br>Interpretation Inputs familiarity ${inputs.familiarity??"n/a"}; compatibility ${inputs.compatibility??"n/a"}; style mismatch ${inputs.styleMismatch??"n/a"}; recent help ${inputs.recentHelp??"n/a"}; recent friction ${inputs.recentFriction??"n/a"}; last evaluation ${last}<br>Recent ${recent}<br>Shared Experiences ${experiences}<br>Aggregate Counts +${r.positiveExperienceCount||0} / ${(r.neutralExperienceCount||0)} / -${r.negativeExperienceCount||0}<br>Stress history ${Number(r.stressHistory||0).toFixed(2)}; morale history ${Number(r.moraleHistory||0).toFixed(2)}<br>Cooldowns ${Object.keys(r.cooldowns||{}).length}`;
  }).join("<br><br>");
}
function applyDailyPersonalityEmotion(e){
  if(!e?.active)return null;
  evaluateEmployeeRelationshipInterpretations(e);
  const team=employeeTeam?.(e)||roleDepartment(e.role),teamState=company.teams?.[team]||{},room=e.currentRoom||roomForZone?.(e.zone)||rolePrimaryRoom(e.role);
  const rel=typeof averageRelationship==="function"?averageRelationship(e):0,pressure=Math.max(Number(teamState.pressure||0),Number(e.stress||0));
  const type=e.action?.includes("talking")||e.action?.includes("collaborating")?"social":e.action?.includes("break")?"recovery":pressure>65?"workload":"focus";
  return applyEmployeeEmotionalReaction({employee:e,event:{type,id:`daily-${company.day}`},relationshipContext:{relationshipScore:rel},workloadContext:{pressure},roomContext:{room,congestion:roomCongestion?.(room)||0,stress:e.roomEffect?.stress||0}});
}
function personalityDescription(e){
  const p=e?.personality||{},parts=[];
  parts.push((p.detailOrientation||0)>.35?"Careful":(p.workPace||0)>.35?"Fast-moving":(p.resilience||0)>.35?"Steady":"Balanced");
  parts.push((p.sociability||0)>.35?"social":(p.sociability||0)<-.35?"independent":"adaptable");
  if((p.structureNeed||0)>.35)parts.push("prefers clear structure");
  else if((p.adaptability||0)>.35)parts.push("handles change well");
  else if((p.empathy||0)>.35)parts.push("notices team mood");
  else if((p.resilience||0)<-.35)parts.push("needs recovery time");
  return parts.join(" and ");
}
const eventLibrary=[
{id:"burnout",repeatable:true,title:"Engineering workload warning",copy:"Several employees are showing sustained stress. The CTO asks how leadership should respond.",trigger:()=>avgStress()>67,choices:[{title:"Delay the launch",detail:"Protect quality and reduce stress.",effect:{cash:-.5,board:-6,trust:5},directive:"quality",days:10,people:{stress:-18,morale:8}},{title:"Hire contractors",detail:"Relieve pressure at a cash cost.",effect:{cash:-2.2,board:1,trust:2},directive:"people",days:12,people:{stress:-12,morale:5}},{title:"Keep pushing",detail:"Preserve schedule and increase risk.",effect:{board:5,trust:-4},directive:"speed",days:8,people:{stress:10,morale:-8}}]},
{id:"milestone",title:"Prototype breakthrough",copy:"The hardware team reached a major milestone. Product leadership needs direction.",trigger:()=>company.chip>48,choices:[{title:"Begin customer testing",detail:"Reveal defects early and build trust.",effect:{cash:-1,board:2,trust:8,quality:5},directive:"quality",days:12,people:{stress:3,morale:4}},{title:"Accelerate toward launch",detail:"Move faster with more execution risk.",effect:{cash:-.8,board:6,trust:-2,integration:8},directive:"speed",days:10,people:{stress:8,morale:-2}},{title:"Return to research",detail:"Improve long-term quality.",effect:{cash:-1.4,board:-4,trust:4,quality:9},directive:"quality",days:14,people:{stress:-4,morale:6}}]},
{id:"launch",title:"Launch authorization",copy:"The product is ready enough for market. The board asks whether to launch, run a limited pilot, or keep polishing.",trigger:()=>company.phase==="customer trial"&&company.integration>=68,choices:[{title:"Full launch",detail:"Start recurring revenue, with launch risk.",effect:{cash:-1.2,board:8,customers:28},directive:"speed",days:7,launch:"full",people:{stress:8,morale:6}},{title:"Limited pilot",detail:"Lower revenue, safer learning.",effect:{cash:-.6,board:3,customers:12,trust:5},directive:"quality",days:10,launch:"pilot",people:{stress:2,morale:4}},{title:"Keep polishing",detail:"Improve quality but delay sales.",effect:{cash:-.8,board:-5,quality:10},directive:"quality",days:12,people:{stress:-3,morale:2}}]},
{id:"pilot-review",title:"Pilot review",copy:"The limited pilot produced enough data for a launch decision.",trigger:()=>company.phase==="pilot"&&company.pilotDays>=8,choices:[{title:"Expand to full launch",detail:"Convert pilot learning into recurring revenue.",effect:{cash:-.7,board:6,customers:18,trust:3},directive:"revenue",days:8,launch:"full",people:{stress:5,morale:5}},{title:"Extend the pilot",detail:"Keep learning with lower risk and lower revenue.",effect:{cash:-.3,quality:5,trust:4,customers:4},directive:"quality",days:8,launch:"extend",people:{stress:-2,morale:2}},{title:"Pause and repair",detail:"Stop commercial expansion and address weaknesses.",effect:{cash:-.5,board:-3,quality:9,trust:2},directive:"quality",days:10,launch:"repair",people:{stress:-5,morale:3}}]},
{id:"hiring",repeatable:true,title:"Critical role vacancy",copy:"A key employee has left. The company needs a staffing decision before progress stalls.",trigger:()=>Array.isArray(company.openRoles)&&company.openRoles.length>0,choices:[{title:"Hire a specialist",detail:"Replace the missing role quickly at a significant cost.",effect:{cash:-2.4,board:2},hire:"specialist",directive:"people",days:7,people:{stress:-4,morale:5}},{title:"Promote internally",detail:"Restore capability cheaply, but increase workload.",effect:{cash:-.6,board:1},hire:"promote",directive:"speed",days:8,people:{stress:7,morale:2}},{title:"Use contractors",detail:"Temporary output without a permanent employee.",effect:{cash:-1.2,board:0,quality:-2},hire:"contractor",directive:"speed",days:6,people:{stress:-1,morale:1}}]},
{id:"cash",repeatable:true,title:"Cash runway concern",copy:"Finance warns that operating cash is becoming tight.",trigger:()=>cashEventEligible(),choices:[{title:"Cut operating costs",detail:"Extend runway but increase resentment.",effect:{cash:3,board:4,trust:-3},directive:"cuts",days:14,people:{stress:9,morale:-10}},{title:"Raise new funding",detail:"Add cash and board pressure.",effect:{cash:7,board:3},directive:null,days:0,people:{stress:-2,morale:2}},{title:"Focus on revenue",detail:"Shift effort toward customers.",effect:{cash:2,board:5,trust:3,customers:3},directive:"revenue",days:10,people:{stress:5,morale:-3}}]},
{id:"culture",repeatable:true,title:"Culture conflict reaches leadership",copy:"A disagreement over priorities is spreading through the office.",trigger:()=>lowestMorale()<42||lowestRelationship()<-25,choices:[{title:"Back management",detail:"Clarify authority but risk trust.",effect:{board:3,trust:-2},directive:"speed",days:8,people:{stress:7,morale:-6}},{title:"Back the engineers",detail:"Improve morale but weaken authority.",effect:{board:-3,trust:2},directive:"quality",days:10,people:{stress:-5,morale:9}},{title:"Order mediation",detail:"Repair relationships and reduce stress.",effect:{cash:-.5,trust:1},directive:"people",days:12,people:{stress:-9,morale:6,relationship:10}}]},
{id:"market-shift",repeatable:true,title:"Market pressure shifts",copy:"Customers and competitors are changing expectations faster than the roadmap can comfortably absorb.",trigger:()=>company.day>8&&(company.market.competitorHeat>62||company.market.aiDemand>68||company.market.supplyPressure>62),choices:[{title:"Lean into demand",detail:"Increase market momentum while adding execution stress.",effect:{cash:-1.1,board:5,trust:4,customers:8},directive:"speed",days:9,people:{stress:7,morale:-2},culture:{riskTolerance:5,innovation:4},opinion:{competence:3,fear:2}},{title:"Protect reliability",detail:"Slow growth and use discipline to preserve trust.",effect:{cash:-.7,trust:7,quality:7,board:-2},directive:"quality",days:10,people:{stress:-3,morale:4},culture:{qualityDiscipline:6,workLife:2},opinion:{trust:4,competence:2,support:2}},{title:"Reposition sales",detail:"Focus customer promises on what the company can actually deliver.",effect:{cash:-.4,trust:5,customers:3,board:1},directive:"revenue",days:8,people:{stress:2,morale:1},culture:{communication:5,politics:-2},opinion:{fairness:2,competence:2}}]},
{id:"performance",repeatable:true,title:"Performance review escalation",copy:"A sustained performance gap has become visible. Leadership must decide whether to invest, reorganize, or remove the role.",trigger:()=>false,choices:[{title:"Coach the employee",detail:"Spend management time to recover capability and trust.",effect:{cash:-.4,board:-1},directive:"people",days:8,people:{stress:-6,morale:7},performance:"coach",culture:{support:4,communication:4},opinion:{support:7,fairness:4,trust:3}},{title:"Reassign responsibilities",detail:"Reduce immediate risk but create coordination strain.",effect:{board:2,quality:2},directive:"quality",days:7,people:{stress:3,morale:-1},performance:"reassign",culture:{qualityDiscipline:3,politics:2},opinion:{competence:2,fairness:-1}},{title:"Fire and backfill",detail:"Remove the role holder, create a vacancy, and damage psychological safety.",effect:{cash:-.2,board:4,trust:-2},directive:"cuts",days:6,people:{stress:8,morale:-8},performance:"fire",culture:{workLife:-4,politics:5},opinion:{fear:10,fairness:-8,trust:-5,support:-5}}]}
];
function makeEmployee(i){
  const goalProfiles=[
    {mastery:.92,promotion:.72,friendship:.28,stability:.45,recognition:.62},
    {mastery:.66,promotion:.48,friendship:.76,stability:.42,recognition:.55},
    {mastery:.88,promotion:.58,friendship:.24,stability:.52,recognition:.46},
    {mastery:.84,promotion:.38,friendship:.36,stability:.78,recognition:.42},
    {mastery:.54,promotion:.82,friendship:.72,stability:.38,recognition:.84},
    {mastery:.82,promotion:.46,friendship:.34,stability:.64,recognition:.52},
    {mastery:.74,promotion:.56,friendship:.58,stability:.48,recognition:.68},
    {mastery:.62,promotion:.64,friendship:.32,stability:.82,recognition:.58}
  ];
  const role=roles[i]||"Product Manager",traitSet=traits[i%traits.length]||traits[0],goalProfile=goalProfiles[i%goalProfiles.length]||goalProfiles[0],base=zoneForRoom(rolePrimaryRoom(role));
  const employee=normalizeEmployeeRoleProfile({
    id:i,name:names[i]||`Employee ${i+1}`,role,traits:[...traitSet],zone:base,homeZone:base,x:50,y:50,
    energy:72+simulationRandom()*18,stress:18+simulationRandom()*22,morale:65+simulationRandom()*20,
    focus:55+simulationRandom()*30,relationship:{},social:{},goals:{...goalProfile},
    memories:[],action:"arriving",thought:"Getting ready for the day.",taskProgress:0,
    actionMinutes:0,active:true,offsite:false,sickDays:0,daysAtRisk:0,achievements:0,
    lastAction:null,repeatCount:0,cooldowns:{break:0,meeting:0,socialize:0,collaborate:0,complain:0},
    decisionTrace:{chosen:"arriving",scores:{},reasons:[]},opinionOfCEO:{trust:62,fairness:58,competence:64,support:56,fear:12},careerLevel:1,careerHistory:["Founding team"],beliefs:{},dailyBriefing:null,currentIntention:null,skills:baseSkillsForRole(role),performance:{recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999},learning:{caution:0,mentor:0,risk:0,collaboration:0,helpSeeking:0,testing:0,focusWork:0,reporting:0,suppression:0,initiative:0,recovery:0,contextualPreferences:{}},communication:{reportsMade:0,reportsSuppressed:0,helpRequests:0,lastReportDay:-999,lastHelpRequestDay:-999,rumorsShared:0},knownMessages:[],actionOutcomeContext:null,activeCollaboration:null,activeMeeting:null,learnedLessons:{testing:0,collaboration:0,documentation:0,escalation:0,innovation:0,riskTaking:0,planning:0,mentoring:0,recovery:0},lessonAcceptance:null,joinedDay:company?.day||0,age:28+i*4+Math.floor(simulationRandom()*4),stayScore:72,retentionRisk:28,jobSearchDays:0,retirementReadiness:0,quarterlyReview:null,promotionExpectation:45,salarySatisfaction:65,recognitionSatisfaction:60
  });
  return ensureEmployeePersonality(employee,{salt:`founding-${i}`});
}
function resetCommunicationUi(){
  lastInboxSoundCount=null;
  document.body?.classList.remove("ceo-review-active","old-message-review-active");
  const inboxView=document.getElementById("commInboxView"),archiveView=document.getElementById("commArchiveView");
  if(inboxView)inboxView.classList.remove("hidden");
  if(archiveView)archiveView.classList.add("hidden");
  document.getElementById("commInboxTab")?.classList.add("active");
  document.getElementById("commArchiveTab")?.classList.remove("active");
  const archiveList=document.getElementById("memoArchiveList"),archiveDetail=document.getElementById("memoArchiveDetail");
  if(archiveList)archiveList.innerHTML="";
  if(archiveDetail)archiveDetail.innerHTML="";
}
function reset(skipSave=false,randomize=false,seedState=null){document.getElementById("gameOverOverlay")?.classList.add("hidden");company=typeof structuredClone==="function"?structuredClone(initialCompany):JSON.parse(JSON.stringify(initialCompany));resetCommunicationUi();if(Number.isFinite(seedState))company.randomState=seedState>>>0;if(randomize){const climates=[{name:"Cautious market",cash:-1.5,board:4,trust:3},{name:"Investor optimism",cash:2,board:6,trust:-2},{name:"Competitive pressure",cash:0,board:-3,trust:1},{name:"Stable opening",cash:0,board:0,trust:0}];const climate=climates[Math.floor(simulationRandom()*climates.length)];company.cash=clamp(company.cash+climate.cash,14,21);company.board=clamp(company.board+climate.board,58,82);company.trust=clamp(company.trust+climate.trust,55,78);company.valuation=clamp(company.valuation+rand(-4,4),34,50);company.log=[`You became CEO during a ${climate.name.toLowerCase()}. The office is running without direct employee control.`];}employees=names.map((_,i)=>makeEmployee(i));if(randomize){const shuffled=traits.map(x=>[...x]).sort(()=>simulationRandom()-.5);employees.forEach((e,i)=>{e.traits=shuffled[i];e.energy=clamp(e.energy+rand(-8,8),55,95);e.morale=clamp(e.morale+rand(-8,8),52,90);e.focus=clamp(e.focus+rand(-8,8),45,92);});}employees.forEach(a=>employees.forEach(b=>{if(a!==b)a.relationship[b.id]=Math.round(simulationRandom()*55-18)}));company.weekStartSnapshot=captureWeekSnapshot();ensureBibleSystems?.();updateManufacturingAndStakeholders?.();updateCompanyInformationSystem?.();collectDailyMetrics?.();buildOffice();renderDecisionEvent();render();if(!validationMode)restartTimer();if(!skipSave&&!validationMode)saveGame();}
function saveGame(){try{if(currentSimulationContext?.mode==="isolated-validation")throw new Error("Production save blocked during isolated validation.");saveRepository.write(company,employees);document.getElementById("saveNote").textContent="Saved on this device";}catch(e){document.getElementById("saveNote").textContent="Autosave unavailable";}}
function loadGame(){try{const data=saveRepository.read();if(!data)return false;company={...saveRepository.clone(initialCompany),...(data.company||{})};const loadedRandomState=Number.isFinite(company.randomState)?(company.randomState>>>0):2463534242;const loadedNextRuntimeId=Math.max(1,Number(company.nextRuntimeId)||1);company.randomState=loadedRandomState;company.nextRuntimeId=loadedNextRuntimeId;const migrationEmployeeDefaults=i=>{const savedRandom=company.randomState;company.randomState=(0x9e3779b9+Math.imul(i+1,0x85ebca6b))>>>0;const fresh=makeEmployee(i);company.randomState=savedRandom;return fresh;};const savedEmployees=Array.isArray(data.employees)?data.employees:[];const employeeSlots=Math.max(names.length,...savedEmployees.map(e=>Number(e.id)).filter(Number.isFinite).map(id=>id+1));employees=Array.from({length:employeeSlots},(_,i)=>{const fresh=migrationEmployeeDefaults(i),saved=savedEmployees.find(e=>e.id===i)||{};return{
      ...fresh,...saved,
      relationship:{...fresh.relationship,...(saved.relationship||{})},
      social:{...fresh.social,...(saved.social||{})},
      goals:{...fresh.goals,...(saved.goals||{})},
      memories:Array.isArray(saved.memories)?saved.memories:[],
      cooldowns:{...fresh.cooldowns,...(saved.cooldowns||{})},
      decisionTrace:saved.decisionTrace||fresh.decisionTrace,opinionOfCEO:{...fresh.opinionOfCEO,...(saved.opinionOfCEO||{})},careerLevel:Number(saved.careerLevel)||fresh.careerLevel,careerHistory:Array.isArray(saved.careerHistory)?saved.careerHistory:fresh.careerHistory,beliefs:{...fresh.beliefs,...(saved.beliefs||{})},dailyBriefing:saved.dailyBriefing||fresh.dailyBriefing,currentIntention:saved.currentIntention||fresh.currentIntention,skills:{...fresh.skills,...(saved.skills||{})},performance:{...fresh.performance,...(saved.performance||{})},learning:{...fresh.learning,...(saved.learning||{}),contextualPreferences:{...(fresh.learning?.contextualPreferences||{}),...(saved.learning?.contextualPreferences||{})}},communication:{...fresh.communication,...(saved.communication||{})},knownMessages:Array.isArray(saved.knownMessages)?saved.knownMessages:[],actionOutcomeContext:saved.actionOutcomeContext||null,activeCollaboration:saved.activeCollaboration||null,activeMeeting:saved.activeMeeting||null,
      learnedLessons:{...fresh.learnedLessons,...(saved.learnedLessons||{})},
      lessonAcceptance:saved.lessonAcceptance??fresh.lessonAcceptance,
      personalitySeed:Number.isFinite(saved.personalitySeed)?saved.personalitySeed:fresh.personalitySeed,
      personality:saved.personality&&typeof saved.personality==="object"?saved.personality:fresh.personality,
      personalityArchetypes:Array.isArray(saved.personalityArchetypes)?saved.personalityArchetypes:fresh.personalityArchetypes,
      emotionalState:saved.emotionalState&&typeof saved.emotionalState==="object"?saved.emotionalState:fresh.emotionalState,
      emotionalCooldowns:saved.emotionalCooldowns&&typeof saved.emotionalCooldowns==="object"?saved.emotionalCooldowns:fresh.emotionalCooldowns,
      emotionalDailyTotals:saved.emotionalDailyTotals&&typeof saved.emotionalDailyTotals==="object"?saved.emotionalDailyTotals:fresh.emotionalDailyTotals,
      emotionalLimits:saved.emotionalLimits&&typeof saved.emotionalLimits==="object"?saved.emotionalLimits:fresh.emotionalLimits,
      recentEmotionalEvents:Array.isArray(saved.recentEmotionalEvents)?saved.recentEmotionalEvents:fresh.recentEmotionalEvents,
      lastEmotionalReaction:saved.lastEmotionalReaction||fresh.lastEmotionalReaction||null,
      joinedDay:Number.isFinite(saved.joinedDay)?saved.joinedDay:(fresh.joinedDay||0),age:Number.isFinite(saved.age)?saved.age:fresh.age,stayScore:Number.isFinite(saved.stayScore)?saved.stayScore:72,retentionRisk:Number.isFinite(saved.retentionRisk)?saved.retentionRisk:28,jobSearchDays:Number(saved.jobSearchDays)||0,retirementReadiness:Number(saved.retirementReadiness)||0,quarterlyReview:saved.quarterlyReview||null,promotionExpectation:Number.isFinite(saved.promotionExpectation)?saved.promotionExpectation:45,salarySatisfaction:Number.isFinite(saved.salarySatisfaction)?saved.salarySatisfaction:65,recognitionSatisfaction:Number.isFinite(saved.recognitionSatisfaction)?saved.recognitionSatisfaction:60
    };});company.randomState=loadedRandomState;employees.forEach(e=>{normalizeEmployeeRoleProfile(e);ensureEmployeePersonality(e);});employees.forEach(a=>employees.forEach(b=>{if(a!==b&&typeof a.relationship[b.id]!=="number")a.relationship[b.id]=0;}));company.completedEvents=Array.isArray(company.completedEvents)?company.completedEvents:[];company.costEfficiency=clamp(Number(company.costEfficiency)||1,.72,1.08);company.pilotDays=Number(company.pilotDays)||0;
company.openRoles=Array.isArray(company.openRoles)?company.openRoles:[];
company.newspapers=Array.isArray(company.newspapers)?company.newspapers:[];
company.weeklyEvents=Array.isArray(company.weeklyEvents)?company.weeklyEvents:[];
company.communications=Array.isArray(company.communications)?company.communications:[];
company.communicationView=company.communicationView||"inbox";
company.randomState=Number.isFinite(company.randomState)?(company.randomState>>>0):2463534242;
company.nextRuntimeId=Math.max(1,Number(company.nextRuntimeId)||1);
company.soundMode=["muted","alerts","music","both"].includes(company.soundMode)?company.soundMode:(company.soundEnabled?"both":"muted");
company.soundEnabled=company.soundMode!=="muted";
company.eventHistory=company.eventHistory&&typeof company.eventHistory==="object"?company.eventHistory:{};
company.recentEventCategories=Array.isArray(company.recentEventCategories)?company.recentEventCategories:[];
company.cashEventArmed=company.cashEventArmed!==false;
company.history=Array.isArray(company.history)?company.history:[];
company.lessons=Array.isArray(company.lessons)?company.lessons:[];
company.nextLessonId=Number(company.nextLessonId)||1;
company.departmentLearning=company.departmentLearning&&typeof company.departmentLearning==="object"?company.departmentLearning:{};
company.lastLessonReviewDay=Number.isFinite(company.lastLessonReviewDay)?company.lastLessonReviewDay:-999;
company.delayedDecisionEffects=Array.isArray(company.delayedDecisionEffects)?company.delayedDecisionEffects:[];
company.decisionHistory=Array.isArray(company.decisionHistory)?company.decisionHistory:[];
company.decisionThreads=Array.isArray(company.decisionThreads)?company.decisionThreads:[];
company.decisionThreads.forEach(t=>{t.audit={reaction:false,operational:false,major:false,legacy:false,...(t.audit||{})};t.phaseDueDays={reaction:(t.createdDay??company.day)+2,operational:(t.createdDay??company.day)+7,major:(t.createdDay??company.day)+21,legacy:(t.createdDay??company.day)+38,...(t.phaseDueDays||{})};t.followUps=Array.isArray(t.followUps)?t.followUps:[];t.state=t.state||"Pending";});
company.nextDecisionThreadId=Math.max(1,Number(company.nextDecisionThreadId)||1);
company.executiveReputations=company.executiveReputations&&typeof company.executiveReputations==="object"?company.executiveReputations:{};
company.leadership={qualityFocus:55,speedFocus:50,innovation:55,employeeWellbeing:55,financialDiscipline:55,customerFocus:55,transparency:55,riskTolerance:50,accountability:55,longTermThinking:55,...(company.leadership||{})};
company.organizationalMomentum={burnout:0,turnover:0,innovation:0,trust:0,execution:0,financial:0,culture:0,...(company.organizationalMomentum||{})};
company.quarterlyReviews=Array.isArray(company.quarterlyReviews)?company.quarterlyReviews:[];
company.annualReviews=Array.isArray(company.annualReviews)?company.annualReviews:[];
company.lastQuarterlyReviewDay=Number(company.lastQuarterlyReviewDay)||0;
company.lastAnnualReviewDay=Number(company.lastAnnualReviewDay)||0;
company.crisisRiskDays={burnout:0,financial:0,product:0,reputation:0,leadership:0,staffing:0,operational:0,...(company.crisisRiskDays||{})};
company.crisisType=company.crisisType||null;
company.crisisStage=company.crisisStage||null;
if(company.crisis&&typeof company.crisis==="object")company.crisis.currentProgressDetail=company.crisis.currentProgressDetail||null;
company.capabilityNeeds={...DEFAULT_COMPANY_CAPABILITY_NEEDS,...(company.capabilityNeeds||{})};
company.capabilityCoverage=company.capabilityCoverage&&typeof company.capabilityCoverage==="object"?company.capabilityCoverage:{};
company.capabilityGaps=Array.isArray(company.capabilityGaps)?company.capabilityGaps:[];
company.capabilityConsequences=company.capabilityConsequences&&typeof company.capabilityConsequences==="object"?company.capabilityConsequences:{};
company.capabilityPromotionCandidates=Array.isArray(company.capabilityPromotionCandidates)?company.capabilityPromotionCandidates:[];
company.capabilityFulfillmentOptions=company.capabilityFulfillmentOptions&&typeof company.capabilityFulfillmentOptions==="object"?company.capabilityFulfillmentOptions:{};
company.capabilityAudit=company.capabilityAudit&&typeof company.capabilityAudit==="object"?company.capabilityAudit:null;
company.workItems=Array.isArray(company.workItems)?company.workItems:[];
company.workItems.forEach(w=>{if(w.blockerAwareness&&typeof w.blockerAwareness==="object")w.blockerAwareness={observed:Number(w.blockerAwareness.observed)||0,lastActualCount:Number(w.blockerAwareness.lastActualCount)||0,detectionProbability:Number(w.blockerAwareness.detectionProbability)||0,lastObservedDay:w.blockerAwareness.lastObservedDay,observedBy:w.blockerAwareness.observedBy};else if((w.blockedBy||[]).length)w.blockerAwareness={observed:0,lastActualCount:(w.blockedBy||[]).length,detectionProbability:0};});
company.workforceAllocationSnapshot=company.workforceAllocationSnapshot&&typeof company.workforceAllocationSnapshot==="object"?company.workforceAllocationSnapshot:null;
company.issueRecords=Array.isArray(company.issueRecords)?company.issueRecords:[];
company.suppressionRecords=Array.isArray(company.suppressionRecords)?company.suppressionRecords:[];
company.operatingHealthHistory=Array.isArray(company.operatingHealthHistory)?company.operatingHealthHistory:[];
company.executiveBriefing=company.executiveBriefing&&typeof company.executiveBriefing==="object"?company.executiveBriefing:null;
company.executiveBriefingArchive=Array.isArray(company.executiveBriefingArchive)?company.executiveBriefingArchive:[];
company.departmentObjectives=company.departmentObjectives&&typeof company.departmentObjectives==="object"?company.departmentObjectives:{};
company.informationSources=company.informationSources&&typeof company.informationSources==="object"?company.informationSources:{};
company.nextWorkItemId=Number(company.nextWorkItemId)||1;
company.nextIssueId=Number(company.nextIssueId)||1;
company.nextMessageId=Number(company.nextMessageId)||1;
company.nextEscalationId=Number(company.nextEscalationId)||1;
company.nextStoryId=Number(company.nextStoryId)||1;
company.storyChains=Array.isArray(company.storyChains)?company.storyChains:[];
company.playtest={sessions:0,notes:[],lastChecklistDay:-999,...(company.playtest||{})};
company.employeeMessages=Array.isArray(company.employeeMessages)?company.employeeMessages:[];
company.escalationQueue=Array.isArray(company.escalationQueue)?company.escalationQueue:[];
company.escalatedMessageIds=Array.isArray(company.escalatedMessageIds)?company.escalatedMessageIds:[];
company.teamReports=Array.isArray(company.teamReports)?company.teamReports:[];
company.communicationStats={helpRequests:0,statusReports:0,riskReports:0,opportunityReports:0,suppressedReports:0,rumors:0,...(company.communicationStats||{})};
company.simulationMetrics=normalizeSimulationMetrics(company.simulationMetrics);
company.culture={...initialCompany.culture,...(company.culture||{})};
company.market={...initialCompany.market,...(company.market||{})};
company.weekStartSnapshot=company.weekStartSnapshot||captureWeekSnapshot();
if(company.openRole&&!company.openRoles.includes(company.openRole))company.openRoles.push(company.openRole);
delete company.openRole;
company.randomState=loadedRandomState;company.nextRuntimeId=loadedNextRuntimeId;ensureBibleSystems?.();rebuildRuntimeIndexes?.();ensureProjectAllocations?.();company.randomState=loadedRandomState;company.nextRuntimeId=loadedNextRuntimeId;buildOffice(true);renderDecisionEvent();render();restartTimer();company.randomState=loadedRandomState;company.nextRuntimeId=loadedNextRuntimeId;return true;}catch(e){console.warn("Save migration failed",e);return false;}}

function hasSavedCompany(){return saveRepository.exists();}
function savedCompanySummary(){return saveRepository.summary();}
function updateStartupScreen(){const info=savedCompanySummary(),btn=document.getElementById("continueCompany"),summary=document.getElementById("saveSummary");btn.disabled=!info;if(!info){summary.textContent="No saved company was found on this device.";return;}const when=info.savedAt?new Date(info.savedAt).toLocaleString():"an earlier session";summary.textContent=`Saved company: Day ${info.day}, ${info.identity}, $${info.cash.toFixed(1)}M cash, $${info.valuation.toFixed(1)}M valuation - saved ${when}.`; }
function soundWantsMusic(){return soundController.wantsMusic();}
function soundWantsAlerts(){return soundController.wantsAlerts();}
function syncSoundUi(){soundController.syncUi();}
function startBackgroundMusic(){soundController.startMusic();}
function stopBackgroundMusic(){soundController.stopMusic();}
function playMessageAlert(){soundController.playAlert();}
function applySoundMode(value){
  soundController.applyMode(value);
  if(!validationMode)saveGame();
}
function enterSimulation(){document.getElementById("startupOverlay").classList.add("hidden");syncSoundUi();startBackgroundMusic();}
function startNewCompany(){saveRepository.remove();reset(false,true);enterSimulation();document.getElementById("confirmResetOverlay").classList.add("hidden");}
function requestReset(){pausedBeforeResetPrompt=!!company.paused;company.paused=true;updatePauseButton();document.getElementById("confirmResetOverlay").classList.remove("hidden");}
function cancelResetPrompt(){document.getElementById("confirmResetOverlay").classList.add("hidden");if(company){company.paused=pausedBeforeResetPrompt;updatePauseButton();}}

function getSocial(e,otherId){
  if(!e.social)e.social={};
  if(!e.social[otherId]){
    const base=Number(e.relationship?.[otherId]||0);
    e.social[otherId]={
      trust:clamp(base+rand(-8,8),-100,100),
      respect:clamp(base+rand(-5,12),-100,100),
      friendship:clamp(base+rand(-12,10),-100,100),
      rivalry:clamp(Math.max(0,-base)+rand(0,8),0,100)
    };
  }
  return e.social[otherId];
}

function socialScore(e,otherId){
  const s=getSocial(e,otherId);
  return s.trust*.34+s.respect*.34+s.friendship*.42-s.rivalry*.4;
}

function adjustSocial(a,b,delta={}){
  const sa=getSocial(a,b.id), sb=getSocial(b,a.id);
  for(const key of ["trust","respect","friendship","rivalry"]){
    if(delta[key]){
      sa[key]=clamp(sa[key]+delta[key],key==="rivalry"?0:-100,100);
      sb[key]=clamp(sb[key]+delta[key],key==="rivalry"?0:-100,100);
    }
  }
  a.relationship[b.id]=Math.round(socialScore(a,b.id));
  b.relationship[a.id]=Math.round(socialScore(b,a.id));
}

function addMemory(e,type,text,emotion="neutral",strength=10,subject="company"){
  if(!e.memories)e.memories=[];
  e.memories.unshift({type,text,emotion,strength,subject,day:company.day});
  e.memories=e.memories.slice(0,12);
}


function recordHistory(text,type="general",importance=1){
  company.history=Array.isArray(company.history)?company.history:[];
company.workItems=Array.isArray(company.workItems)?company.workItems:[];
company.issueRecords=Array.isArray(company.issueRecords)?company.issueRecords:[];
company.departmentObjectives=company.departmentObjectives&&typeof company.departmentObjectives==="object"?company.departmentObjectives:{};
company.informationSources=company.informationSources&&typeof company.informationSources==="object"?company.informationSources:{};
company.executiveBriefing=company.executiveBriefing&&typeof company.executiveBriefing==="object"?company.executiveBriefing:null;
company.executiveBriefingArchive=Array.isArray(company.executiveBriefingArchive)?company.executiveBriefingArchive:[];
company.nextWorkItemId=Number(company.nextWorkItemId)||1;
company.nextIssueId=Number(company.nextIssueId)||1;
  company.history.unshift({day:company.day,text,type,importance});
  company.history=company.history.slice(0,260);
}
function adjustCEOOpinion(e,delta={}){
  e.opinionOfCEO={trust:62,fairness:58,competence:64,support:56,fear:12,...(e.opinionOfCEO||{})};
  Object.entries(delta).forEach(([k,v])=>{e.opinionOfCEO[k]=clamp((e.opinionOfCEO[k]||0)+v,0,100);});
}
function adjustCulture(delta={}){
  company.culture={...initialCompany.culture,...(company.culture||{})};
  Object.entries(delta).forEach(([k,v])=>{company.culture[k]=clamp((company.culture[k]||50)+v,0,100);});
}
function updateMarket(){
  company.market={...initialCompany.market,...(company.market||{})};
  company.market.aiDemand=clamp(company.market.aiDemand+rand(-1.2,1.6)+(company.phase==="launched" ? .2 : 0),20,95);
  company.market.hardwareDemand=clamp(company.market.hardwareDemand+rand(-1,1.4)+(company.trust>70 ? .15 : 0),20,95);
  company.market.supplyPressure=clamp(company.market.supplyPressure+rand(-1.3,1.5)+(company.chip>60 ? .12 : 0),5,90);
  company.market.capitalClimate=clamp(company.market.capitalClimate+rand(-1.4,1.2)+(company.cash<8?-0.2:0),15,90);
  company.market.competitorHeat=clamp(company.market.competitorHeat+rand(-1,1.8)+(company.customers>40 ? .18 : 0),10,95);
}
function performanceScore(e){
  const p={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
  const team=employeeTeam(e);
  const rolePressure=team==="hardware"?company.manufacturing?.supplyRisk||0:team==="software"?100-company.integration:team==="quality"?100-company.quality:team==="product"?100-company.customerSentiment:100-(company.shareholders?.confidence||50);
  const lowOutput=Math.max(0,6-p.recentOutput)*2.5;
  const absence=p.absenceDays*9;
  const mistakes=p.qualityMistakes*10;
  const moraleRisk=Math.max(0,45-e.morale)*.35;
  const focusRisk=Math.max(0,45-e.focus)*.45;
  const teamImpact=Math.max(0,rolePressure-55)*.18;
  const coachingRelapse=p.coachingDays>0?-14:0;
  return lowOutput+absence+mistakes+moraleRisk+focusRisk+teamImpact+coachingRelapse;
}
function updatePerformanceReviewRisk(e){
  if(!e.active)return;
  e.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
  const score=performanceScore(e);
  if(score>28)e.performance.reviewRiskDays=clamp((e.performance.reviewRiskDays||0)+1,0,12);
  else e.performance.reviewRiskDays=clamp((e.performance.reviewRiskDays||0)-1,0,12);
}
function performanceTarget(){
  return employees.filter(e=>e.active).map(e=>{
    e.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
    return {e,score:performanceScore(e),riskDays:e.performance.reviewRiskDays||0,lastReviewDay:e.performance.lastReviewDay??-999};
  }).filter(x=>x.score>28&&x.riskDays>=4&&company.day-x.lastReviewDay>=20).sort((a,b)=>(b.riskDays-a.riskDays)||(b.score-a.score))[0]?.e||null;
}
function memoryBias(e,type){
  return (e.memories||[])
    .filter(m=>m.type===type)
    .reduce((sum,m)=>sum+m.strength*Math.max(.2,1-(company.day-m.day)*.08),0);
}

function decayMemories(e){
  if(!e.memories)return;
  e.memories=e.memories
    .map(m=>({...m,strength:m.strength*(m.type.includes("CEO") ? .97 : .92)}))
    .filter(m=>m.strength>1.5);
}

function tickCooldowns(e,minutes=5){
  if(!e.cooldowns)e.cooldowns={};
  Object.keys(e.cooldowns).forEach(k=>e.cooldowns[k]=Math.max(0,(e.cooldowns[k]||0)-minutes));
}

function weightedChoice(scoreMap){
  const ranked=Object.entries(scoreMap).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const floor=ranked[ranked.length-1]?.[1]||0;
  const weighted=ranked.map(([action,score])=>[action,Math.max(.01,Math.exp((score-floor)/18))]);
  const total=weighted.reduce((s,[,w])=>s+w,0);
  let roll=simulationRandom()*total;
  for(const [action,w] of weighted){roll-=w;if(roll<=0)return action;}
  return weighted[0][0];
}

function projectNeedFor(e){
  const role=canonicalRole(e.role),cap=roleProjectCapabilities(role);
  if(company.integration<55&&(cap.integration>.55||role==="Product Manager"))return "integration";
  if(company.quality<58&&(cap.quality>.5||role==="Industrial Designer"))return "quality";
  if(company.chip<company.software&&(cap.hardware>.55||role==="Firmware Engineer"))return "hardware";
  if(company.software<=company.chip&&(cap.software>.55||role==="Firmware Engineer"))return "software";
  if(company.cash<10||company.shareholders?.pressure>65)return "finance";
  return "general";
}
function roleCompatibility(a,b,need=projectNeedFor(a)){
  const pair=[canonicalRole(a.role),canonicalRole(b.role)].sort().join("|");
  const strong={
    "Chip Architect|Firmware Engineer":24,"Firmware Engineer|Technical Lead":26,"Product Manager|Technical Lead":22,
    "Software QA Engineer|Technical Lead":22,"Chip Architect|Software QA Engineer":24,
    "Finance Analyst|Product Manager":18,"Industrial Designer|Product Manager":18,"Firmware Engineer|Software QA Engineer":18,
    "Hardware Engineer|Software QA Engineer":18,"Hardware Engineer|Firmware Engineer":20
  };
  const skill=b.skills||baseSkillsForRole(b.role);
  const needSkill={integration:(skill.firmware+skill.software+skill.product)/3,quality:skill.verification,hardware:(skill.hardware+skill.architecture)/2,software:skill.software,finance:skill.finance,general:(skill.communication+skill.leadership)/2}[need]||45;
  return (strong[pair]||0)+needSkill*.28;
}
function availableCollaborator(e){
  const need=projectNeedFor(e);
  return employees
    .filter(x=>x.active&&!x.offsite&&x.id!==e.id&&x.stress<88)
    .map(x=>({x,score:socialScore(e,x.id)*.35+roleCompatibility(e,x,need)+(x.focus||50)*.12-(x.stress||0)*.18+(x.action?.includes("collaborating")?-8:0)}))
    .sort((a,b)=>b.score-a.score)[0]?.x||null;
}

function captureWeekSnapshot(){
  const active=employees.filter(e=>e.active);
  return{
    day:company.day,cash:company.cash,board:company.board,trust:company.trust,
    chip:company.chip,software:company.software,quality:company.quality,integration:company.integration,
    customers:company.customers,revenue:company.dailyRevenue,
    morale:active.reduce((s,e)=>s+e.morale,0)/Math.max(1,active.length),
    stress:active.reduce((s,e)=>s+e.stress,0)/Math.max(1,active.length),
    phase:company.phase,activeEmployees:active.length
  };
}
function recordWeeklyEvent(text,type="general",importance=1,meta={}){
  company.weeklyEvents=Array.isArray(company.weeklyEvents)?company.weeklyEvents:[];
company.communications=Array.isArray(company.communications)?company.communications:[];
company.communicationView=company.communicationView||"inbox";
company.eventHistory=company.eventHistory&&typeof company.eventHistory==="object"?company.eventHistory:{};
company.recentEventCategories=Array.isArray(company.recentEventCategories)?company.recentEventCategories:[];
company.cashEventArmed=company.cashEventArmed!==false;
company.history=Array.isArray(company.history)?company.history:[];
company.workItems=Array.isArray(company.workItems)?company.workItems:[];
company.issueRecords=Array.isArray(company.issueRecords)?company.issueRecords:[];
company.departmentObjectives=company.departmentObjectives&&typeof company.departmentObjectives==="object"?company.departmentObjectives:{};
company.informationSources=company.informationSources&&typeof company.informationSources==="object"?company.informationSources:{};
company.nextWorkItemId=Number(company.nextWorkItemId)||1;
company.nextIssueId=Number(company.nextIssueId)||1;
company.nextMessageId=Number(company.nextMessageId)||1;
company.nextEscalationId=Number(company.nextEscalationId)||1;
company.employeeMessages=Array.isArray(company.employeeMessages)?company.employeeMessages:[];
company.escalationQueue=Array.isArray(company.escalationQueue)?company.escalationQueue:[];
company.escalatedMessageIds=Array.isArray(company.escalatedMessageIds)?company.escalatedMessageIds:[];
company.teamReports=Array.isArray(company.teamReports)?company.teamReports:[];
company.communicationStats={helpRequests:0,statusReports:0,riskReports:0,opportunityReports:0,suppressedReports:0,rumors:0,...(company.communicationStats||{})};
company.simulationMetrics=normalizeSimulationMetrics(company.simulationMetrics);
company.culture={...initialCompany.culture,...(company.culture||{})};
company.market={...initialCompany.market,...(company.market||{})};
  company.weeklyEvents.push({text,type,importance,day:company.day,meta:meta&&typeof meta==="object"?meta:{}});
  company.weeklyEvents=company.weeklyEvents.slice(-40);
}
function signed(value,digits=0){const n=Number(value)||0;return `${n>=0?"+":""}${n.toFixed(digits)}`;}
function htmlEscape(text){
  return String(text??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
function qualitativeLevel(value,{low=35,high=70,lowText="Low",midText="Mixed",highText="Strong"}={}){
  const n=Number(value)||0;
  if(n<low)return lowText;
  if(n>=high)return highText;
  return midText;
}
function titleCase(text){return String(text||"").replace(/\b\w/g,c=>c.toUpperCase());}
function plainDecisionTitle(text){
  let t=String(text||"").replace(/^CEO decision:\s*/i,"").replace(/^Decision outcome:\s*/i,"").trim();
  const lower=t.toLowerCase();
  const project=[...(company.projects||[]),...(company.projectArchive||[]),...(company.projectProposals||[])].find(p=>lower.includes(String(p.title||"").toLowerCase())||lower.includes(String(p.codename||"").toLowerCase()));
  if(/^approve position/i.test(t))return "Approved a new role for the department after workforce review.";
  if(/^delay position/i.test(t))return "Delayed a hiring request to protect runway and reassess workload.";
  if(/^reject and reprioritize/i.test(t))return "Rejected a hiring request and asked the department to reduce scope.";
  if(/^approve/i.test(t))return `${t.replace(/^approve/i,"Approved")}${project?` for ${project.title}`:""}.`.replace(/\.\.$/,".");
  if(/^delay/i.test(t))return `${t.replace(/^delay/i,"Delayed")}${project?` for ${project.title}`:""}.`.replace(/\.\.$/,".");
  if(/^continue/i.test(t))return `${t.replace(/^continue/i,"Continued")}${project?` on ${project.title}`:""}.`.replace(/\.\.$/,".");
  if(/^cancel/i.test(t))return `${t.replace(/^cancel/i,"Canceled")} ${project?project.title:"the project"}.`;
  return t.endsWith(".")?t:`${t}.`;
}
function decisionSubjectFromMeta(meta={}){
  if(meta.projectTitle)return meta.projectTitle;
  if(meta.projectId){
    const p=[...(company.projects||[]),...(company.projectArchive||[]),...(company.projectProposals||[])].find(project=>project.id===meta.projectId);
    if(p)return p.title;
  }
  if(meta.workItemId){
    const w=(company.workItems||[]).find(work=>work.id===meta.workItemId);
    if(w)return w.title;
  }
  if(meta.subject)return meta.subject;
  return null;
}
function explainWeeklyEvent(event){
  const text=String(event?.text||"").trim();
  const meta=event?.meta||{};
  if(!text)return "";
  if(/^CEO decision:/i.test(text)){
    const subject=decisionSubjectFromMeta(meta);
    const base=plainDecisionTitle(text);
    return subject&&!base.includes(subject)?`${base.replace(/\.$/,"")} for ${subject}.`:base;
  }
  if(/^Decision outcome:/i.test(text))return explainDecisionOutcome(event);
  if(/Product phase advanced to/i.test(text)){
    const phase=text.replace(/.*Product phase advanced to\s*/i,"").replace(/\.$/,"");
    return `The product moved into ${phase}, which changes what evidence and execution risk matter next.`;
  }
  if(/hit a development blocker/i.test(text))return text.replace(/\.$/,".")+" The project now has visible development friction for the team to resolve.";
  if(/board issued a strike/i.test(text))return "The Board raised a formal concern, increasing pressure on leadership to explain cash discipline and execution risk.";
  if(/cash discipline/i.test(text))return text.replace(/\.$/,".")+" Finance and the Board are watching whether spending matches the company's current runway.";
  if(/was unblocked by/i.test(text)||/unblocked/i.test(text))return text.replace(/\.$/,".")+" That reduced near-term execution friction.";
  if(/created rework/i.test(text))return text.replace(/\.$/,".")+" This adds quality pressure rather than simple progress.";
  if(/joined as the new/i.test(text)||/HR hired/i.test(text))return text.replace(/\.$/,".")+" The new hire will need onboarding before becoming fully productive.";
  if(/resigned|retired|fired|left through|layoffs/i.test(text))return text.replace(/\.$/,".")+" The change affects continuity, morale, and staffing coverage.";
  if(/completed/i.test(text)&&/Project/i.test(text))return text.replace(/\.$/,".")+" Completion moves attention from development risk toward commercial value.";
  return text.endsWith(".")?text:`${text}.`;
}
function explainDecisionOutcome(event){
  const text=typeof event==="string"?event:String(event?.text||"");
  const meta=typeof event==="string"?{}:(event?.meta||{});
  const clean=String(text||"").replace(/^Decision outcome:\s*/i,"").trim();
  const lower=clean.toLowerCase();
  const project=[...(company.projects||[]),...(company.projectArchive||[]),...(company.projectProposals||[])].find(p=>lower.includes(String(p.title||"").toLowerCase())||lower.includes(String(p.codename||"").toLowerCase()));
  const subject=decisionSubjectFromMeta(meta)||project?.title||"the decision";
  const choice=meta.choiceTitle||meta.decisionTitle||null;
  const tone=/negative|worsen|delay|cost|risk|miss|pressure/.test(lower)?"worsened":/positive|improved|gained|reduced|resolved|success/.test(lower)?"improved":"remained mixed";
  const action=choice?String(choice).replace(/\.$/,"").replace(/^Approve/i,"approve").replace(/^Delay/i,"delay").replace(/^Continue/i,"continue").replace(/^Cancel/i,"cancel").replace(/^Reject/i,"reject").replace(/^Fund/i,"fund").replace(/^Move/i,"move").replace(/^Reassign/i,"reassign").replace(/^./,c=>c.toLowerCase()):null;
  const lead=action?`The decision to ${action}`:"The decision";
  if(tone==="improved")return `${lead} improved ${subject}, although the full long-term result is still being watched.`;
  if(tone==="worsened")return `${lead} created pressure around ${subject}; near-term risk or cost increased while the longer-term result remains uncertain.`;
  return `${lead} produced mixed early results for ${subject}; some evidence improved, but the long-term outcome remains uncertain.`;
}
function weeklyMetricExplanation(delta,now){
  const lines=[];
  if(Math.abs(delta.cash)>=.05){
    const cause=(company.portfolioHealth?.totalProjectSpendDaily||0)>.01||company.finance?.totalDailyCost>0?"normal operating activity, payroll, and project spending":"normal operating activity";
    lines.push(`Cash ${delta.cash<0?"fell":"rose"} by $${Math.abs(delta.cash).toFixed(1)}M across ${cause}.`);
  }
  if(Math.abs(delta.customers)>=1)lines.push(`${Math.abs(Math.round(delta.customers))} customer${Math.abs(Math.round(delta.customers))===1?"":"s"} ${delta.customers>0?"joined":"left"} after recent commercial activity.`);
  if(Math.abs(delta.board)>=1)lines.push(`Board confidence ${delta.board>0?"improved":"weakened"} by ${Math.abs(Math.round(delta.board))} point${Math.abs(Math.round(delta.board))===1?"":"s"} based on operating and leadership signals.`);
  if(Math.abs(delta.morale)>=1)lines.push(`Morale ${delta.morale>0?"improved":"declined"} by ${Math.abs(Math.round(delta.morale))} point${Math.abs(Math.round(delta.morale))===1?"":"s"} as employees reacted to workload and company conditions.`);
  if(now.phase!==delta.phaseBefore)lines.push(`The product entered the ${now.phase} phase, changing the company's operating priorities.`);
  return lines;
}
function weeklyMetricInterpretation(delta,now,intelligence){
  if(now.cash<6||company.finance?.runwayDays<75)return "Financial flexibility is tight, so spending decisions and project scope matter more next week.";
  if(Math.round(now.customers)>0&&delta.cash<-.5)return "Customer activity is present, but current spending is reducing financial flexibility.";
  if(intelligence?.topRisks?.[0])return `The main operating signal to watch is ${String(intelligence.topRisks[0].title||"current risk").replace(/\.$/,"").toLowerCase()}.`;
  if(delta.customers>0&&delta.board>=0)return "Commercial and board signals are improving, while execution still needs steady follow-through.";
  return "The company is operating steadily, with no single metric overwhelming the week.";
}
function weeklyExecutiveSummary({events,majorDecisions,notableEvents,metricExplanations,delta,now,intelligence}){
  if(!events.length&&Math.abs(delta.cash)<.05&&Math.abs(delta.customers)<1&&Math.abs(delta.board)<1&&Math.abs(delta.morale)<1){
    return "No major strategic events occurred. Departments continued executing existing plans, and no new CEO decision was required.";
  }
  const changed=majorDecisions[0]?.text||notableEvents[0]?.text||metricExplanations[0]||"The company completed another operating week.";
  const improved=delta.customers>0?"customer activity improved":delta.board>0?"board confidence improved":delta.morale>0?"morale improved":notableEvents.find(e=>/completed|unblocked|hired|launched|raised|improved/i.test(e.text))?.text||"some internal work continued";
  const risk=intelligence?.topRisks?.[0]?.title||notableEvents.find(e=>/blocked|rework|risk|strike|resigned|layoff|pressure|fell|weakened/i.test(e.text))?.text||(delta.cash<0?"cash reserves tightened":"execution risk remains the main item to monitor");
  return `${changed} ${String(improved).replace(/\.$/,"").replace(/^./,c=>c.toUpperCase())}. The main concern for next week is ${String(risk).replace(/\.$/,"").toLowerCase()}.`;
}
function isWeakWeeklyEvent(event){
  const text=String(event?.text||"");
  if((event?.importance||0)<2&&/(is taking a break|is at home|at home|taking a break)/i.test(text))return true;
  if((event?.importance||0)<2&&event?.type==="people")return true;
  if(/^Simulation balance watch:/i.test(text))return true;
  return false;
}
function meaningfulPeopleToWatch(){
  const active=employees.filter(e=>e.active);
  const candidates=active.map(e=>{
    const reasons=[];
    if(e.stress>78)reasons.push("under sustained workload pressure");
    if(e.sickDays>0)reasons.push("unavailable while assigned work may need coverage");
    if((e.performance?.qualityMistakes||0)>1)reasons.push("connected to recent quality rework");
    if((e.performance?.reviewRiskDays||0)>=3)reasons.push("approaching a documented performance review");
    if((e.retentionRisk||0)>60||e.jobSearchDays>0)reasons.push("showing elevated retention risk");
    if((e.achievements||0)>1||e.taskProgress>18)reasons.push("contributing visible project progress");
    if(e.action==="break"&&e.stress>70)reasons.push("taking recovery time after pressure");
    return {e,reasons,score:reasons.length*20+(e.stress||0)*.2+(e.achievements||0)*5+(e.taskProgress||0)*.5};
  }).filter(x=>x.reasons.length&&x.e.action!=="home"&&!(x.e.action==="break"&&x.e.stress<=70)).sort((a,b)=>b.score-a.score).slice(0,2);
  return candidates.map(({e,reasons})=>`${e.name}, ${e.role} - ${reasons[0]}.`);
}
function dedupeStoryBeats(beats=[]){
  const seen=new Set();
  return beats.map(b=>({day:b.day,text:String(b.text||"").replace(/^Update\s+/i,"").trim(),type:b.type})).filter(b=>{
    const key=b.text.toLowerCase();
    if(!key||seen.has(key))return false;
    seen.add(key);return true;
  });
}
function storyChainForWeeklyIssue(intelligence){
  const sourceSet=new Set(intelligence.sourceIds||[]);
  const storyThread=(company.storyChains||[]).slice().sort((a,b)=>{
    const aMatch=(a.beats||[]).some(beat=>[...sourceSet].some(id=>String(beat.text||"").includes(String(id).split(":").pop()))),bMatch=(b.beats||[]).some(beat=>[...sourceSet].some(id=>String(beat.text||"").includes(String(id).split(":").pop())));
    return (bMatch?20:0)+(b.lastDay||0)-((aMatch?20:0)+(a.lastDay||0));
  })[0];
  if(!storyThread)return null;
  const beats=dedupeStoryBeats(storyThread.beats||[]).slice(-5);
  if(!beats.length)return null;
  return {subject:storyThread.subject,beats};
}
function riskDeskNarrative(issue){
  const pillars=issue.riskPillars||company.riskPillars||{};
  const top=Object.entries(pillars).map(([key,value])=>({key,value:Number(value)||0,label:typeof riskPillarName==="function"?riskPillarName(key):key})).sort((a,b)=>b.value-a.value);
  const label=issue.riskLabel||company.companyRiskComponents?.label||"Watch";
  const primary=top[0],secondary=top[1];
  if(primary&&primary.value>24){
    return `Overall company risk is ${String(label).toLowerCase()}. The main contributor is ${primary.label}${secondary&&secondary.value>35?`, followed by ${secondary.label}`:""}. The weekly signal is about pressure building through the organization, not a single isolated metric.`;
  }
  const observation=issue.executiveObservation||company.executiveObservations?.[0]?.text;
  return observation||"Overall company risk remains manageable. The item to watch is whether current workload remains sustainable as projects advance.";
}
function chooseHeadline(events,delta,current){
  const snapshot=buildExecutiveIntelligenceSnapshot();
  const topRisk=snapshot.topRisks?.[0],topOpportunity=snapshot.topOpportunities?.[0];
  const major=[...(events||[])].sort((a,b)=>(b.importance||0)-(a.importance||0))[0],majorText=String(major?.text||"");
  const highIntensity=(events||[]).filter(e=>(e.importance||0)>=4).length>=3||(events||[]).length>=8;
  const quiet=!(events||[]).length&&Math.abs(delta.cash)<.05&&Math.abs(delta.customers)<1&&Math.abs(delta.board)<1&&Math.abs(delta.morale)<1;
  if(quiet)return "Quiet Week";
  if(highIntensity&&/board|cash|runway|financial/i.test((events||[]).map(e=>e.text).join(" ")))return "Critical Week: Board and Cash Discipline Lead the Agenda";
  if(highIntensity)return "Critical Week: Multiple Operating Signals Need Attention";
  if(/^CEO decision:/i.test(majorText)){
    const clean=majorText.replace(/^CEO decision:\s*/i,"").replace(/\.$/,"");
    if(/launch|market window|release/i.test(clean))return "Company Holds Release Plan While Execution Risk Remains";
    if(/validation|quality|verification/i.test(clean))return "Validation Work Becomes This Week's Main Leadership Focus";
    if(/hire|position|staff/i.test(clean))return "Leadership Reviews Staffing Against Runway and Workload";
    if(/project/i.test(clean))return "Portfolio Decision Reshapes Project Priorities";
    return `${titleCase(clean)} Becomes the Week's Executive Decision`;
  }
  if(/blocked|blocker/i.test(majorText))return "Development Blockers Shape the Week's Execution Risk";
  if(/board issued a strike|cash discipline|runway|financial/i.test(majorText))return "Board and Cash Discipline Become the Week's Main Concern";
  if(/completed/i.test(majorText)&&/project/i.test(majorText))return "Completed Project Shifts Attention Toward Commercial Value";
  if(major)return explainWeeklyEvent(major).replace(/\.$/,"");
  if(topRisk&&topRisk.priority>=75)return topRisk.title;
  if(topOpportunity&&topOpportunity.priority>=60)return topOpportunity.title;
  if(current.phase!==delta.phaseBefore)return `Company advances into ${String(current.phase).replace(/\b\w/g,c=>c.toUpperCase())}`;
  if(delta.customers>10)return `Customer growth accelerates by ${Math.round(delta.customers)}`;
  if(delta.trust>5)return "Customer trust rises sharply";
  if(delta.board<-5)return "Board confidence weakens after difficult week";
  if(delta.morale<-6)return "Employee morale falls across the company";
  return "A steady week of progress inside the company";
}
function publishWeeklyNewspaper(){
  if(!company.weekStartSnapshot)company.weekStartSnapshot=captureWeekSnapshot();
  const before=company.weekStartSnapshot,now=captureWeekSnapshot();
  const delta={
    cash:now.cash-before.cash,board:now.board-before.board,trust:now.trust-before.trust,
    customers:now.customers-before.customers,morale:now.morale-before.morale,
    stress:now.stress-before.stress,phaseBefore:before.phase
  };
  const events=[...(company.weeklyEvents||[])].filter(e=>!isWeakWeeklyEvent(e));
  const intelligence=buildExecutiveIntelligenceSnapshot();
  const headline=chooseHeadline(events,delta,now),topEvents=events.sort((a,b)=>(b.importance||0)-(a.importance||0)).slice(0,8);
  const highIntensity=topEvents.filter(e=>(e.importance||0)>=4).length>=3||events.length>=8;
  const majorDecisions=topEvents.filter(e=>/^CEO decision:/i.test(e.text)).slice(0,3).map(e=>({...e,text:explainWeeklyEvent(e)}));
  const notableEvents=topEvents.filter(e=>!/^CEO decision:/i.test(e.text)).slice(0,highIntensity?3:5).map(e=>({...e,text:explainWeeklyEvent(e)}));
  const metricExplanations=weeklyMetricExplanation(delta,now);
  const summary=weeklyExecutiveSummary({events,majorDecisions,notableEvents,metricExplanations,delta,now,intelligence});
  const storyThread=storyChainForWeeklyIssue(intelligence);
  const people=meaningfulPeopleToWatch();
  const issue={
    week:Math.floor(company.day/5),publishedAt:`Day ${company.day+1}`,storyLead:null,storyThread,
    title:"Office Aquarium Weekly",headline,summary,
    metrics:{cash:now.cash,board:now.board,trust:now.trust,customers:now.customers,revenue:now.revenue,morale:now.morale,stress:now.stress,phase:now.phase},
    events:topEvents,
    majorDecisions,
    notableEvents,
    metricExplanations,
    glanceInterpretation:weeklyMetricInterpretation(delta,now,intelligence),
    people,
    riskPillars:{...(company.riskPillars||{})},
    riskLabel:company.companyRiskComponents?.label||null,
    executiveObservation:company.executiveObservations?.[0]?.text||null,
    detectedFriction:company.managerDetections?.[0]?.text||null,
    localResponse:company.localFrictionResponses?.[0]?.action||null,
    intelligence:{risk:intelligence.topRisks?.[0]?.title||null,opportunity:intelligence.topOpportunities?.[0]?.title||null,tension:intelligence.departmentBeliefs?.[0]?.title||null,trend:intelligence.majorTrends?.[0]?.title||null}
  };
  company.newspapers=Array.isArray(company.newspapers)?company.newspapers:[];
  company.newspapers.unshift(issue);
  company.newspapers=company.newspapers.slice(0,24);
  company.weeklyEvents=[];
  company.weekStartSnapshot=captureWeekSnapshot();
  company.log.push(`Office Aquarium Weekly published: ${headline}`);
  if(!validationMode)saveGame();
}
function renderNewspapers(){
  ensureBibleSystems?.();
  const archive=document.getElementById("newspaperArchive"),count=document.getElementById("newspaperCount"),select=document.getElementById("newspaperSelect"),summary=document.getElementById("newspaperSummary");
  if(!archive||!count)return;
  const issues=Array.isArray(company.newspapers)?company.newspapers:[];
  count.textContent=issues.length;
  if(select){
    select.innerHTML=issues.map((issue,i)=>`<option value="${i}">Week ${issue.week} - ${issue.headline}</option>`).join("");
    const chosen=clamp(Number(company.selectedNewspaperIndex)||0,0,Math.max(0,issues.length-1));
    select.value=String(chosen);
    select.onchange=()=>{company.selectedNewspaperIndex=Number(select.value)||0;renderNewspapers();if(!validationMode)saveGame();};
  }
  if(summary)summary.textContent=issues.length?`${issues.length} issue(s) archived; showing one issue to keep long saves readable.`:"";
  if(!issues.length){archive.innerHTML='<div class="paper-empty">No issue yet. The first newspaper appears after five simulated workdays.</div>';return;}
  const issue=issues[clamp(Number(company.selectedNewspaperIndex)||0,0,issues.length-1)]||issues[0];
  const majorDecisions=Array.isArray(issue.majorDecisions)?issue.majorDecisions:[...(issue.events||[])].filter(e=>/^CEO decision:/i.test(e.text||"")).map(e=>({...e,text:explainWeeklyEvent(e)}));
  const notableEvents=Array.isArray(issue.notableEvents)?issue.notableEvents:[...(issue.events||[])].filter(e=>!/^CEO decision:/i.test(e.text||"")).map(e=>({...e,text:explainWeeklyEvent(e)})).slice(0,5);
  const metricExplanations=Array.isArray(issue.metricExplanations)?issue.metricExplanations:[];
  const people=Array.isArray(issue.people)?issue.people:[];
  const storyBeats=dedupeStoryBeats(issue.storyThread?.beats||[]);
  const riskNarrative=riskDeskNarrative(issue);
  archive.innerHTML=`
    <article class="paper-issue">
      <div class="paper-masthead">
        <div><div class="paper-date">Week ${htmlEscape(issue.week)} - ${htmlEscape(issue.publishedAt)}</div><h3>${htmlEscape(issue.title)}</h3></div>
        <div class="phase-badge">${htmlEscape(titleCase(issue.metrics.phase))}</div>
      </div>
      <h3 class="paper-headline">${htmlEscape(issue.headline)}</h3>
      <p class="paper-summary">${htmlEscape(issue.summary||"No major strategic events occurred. Departments continued executing existing plans, and no new CEO decision was required.")}</p>
      <div class="paper-columns">
        <section class="paper-section"><h4>This Week</h4><p><strong>Major Decisions</strong></p><ul>${majorDecisions.length?majorDecisions.slice(0,3).map(e=>`<li>${htmlEscape(e.text)}</li>`).join(""):"<li>No CEO decision was required this week.</li>"}</ul><p><strong>Notable Events</strong></p><ul>${notableEvents.length?notableEvents.slice(0,(issue.events||[]).length>8?3:5).map(e=>`<li>${htmlEscape(e.text)}</li>`).join(""):"<li>Departments continued executing existing plans without a major incident.</li>"}</ul></section>
        <section class="paper-section"><h4>Company at a Glance</h4><ul>
          <li>Cash: $${Number(issue.metrics.cash).toFixed(1)}M</li>
          <li>Customers: ${Math.round(issue.metrics.customers)}</li>
          <li>Daily revenue: $${Number(issue.metrics.revenue).toFixed(2)}M</li>
          <li>Board confidence: ${Math.round(issue.metrics.board)}</li>
          <li>Morale: ${Math.round(issue.metrics.morale)}</li>
        </ul><p>${htmlEscape(issue.glanceInterpretation||weeklyMetricInterpretation({cash:0,customers:0,board:0,morale:0,phaseBefore:issue.metrics.phase},issue.metrics,issue.intelligence))}</p>${metricExplanations.length?`<ul>${metricExplanations.slice(0,4).map(m=>`<li>${htmlEscape(m)}</li>`).join("")}</ul>`:""}</section>
        <section class="paper-section"><h4>People to Watch</h4><ul>${people.length?people.map(p=>`<li>${htmlEscape(p)}</li>`).join(""):"<li>No employee required executive attention this week.</li>"}</ul></section>
        <section class="paper-section"><h4>Story Chain</h4><ul>${issue.storyThread&&storyBeats.length?`<li>${htmlEscape(issue.storyThread.subject)}</li>${storyBeats.map(b=>`<li>Day ${(b.day??0)+1}: ${htmlEscape(b.text)}</li>`).join("")}`:"<li>No connected chain dominated the week.</li>"}</ul></section>
        <section class="paper-section"><h4>Risk Desk</h4><p>${htmlEscape(riskNarrative)}</p><ul>
          <li>Overall Company Risk: ${htmlEscape(issue.riskLabel||company.companyRiskComponents?.label||"Watch")}</li>
          ${Object.entries(issue.riskPillars||{}).sort((a,b)=>(b[1]||0)-(a[1]||0)).slice(0,2).map(([k,v])=>`<li>${htmlEscape(typeof riskPillarName==="function"?riskPillarName(k):k)}: ${Math.round(v)>=70?"High":Math.round(v)>=45?"Elevated":Math.round(v)>=25?"Watch":"Low"}</li>`).join("")}
          ${issue.detectedFriction?`<li>Detected friction: ${htmlEscape(issue.detectedFriction)}</li>`:""}
          ${issue.localResponse?`<li>Improving area: ${htmlEscape(issue.localResponse)}</li>`:""}
          ${issue.intelligence?.risk?`<li>Primary risk: ${htmlEscape(issue.intelligence.risk)}</li>`:""}
          ${issue.intelligence?.trend?`<li>Trend: ${htmlEscape(issue.intelligence.trend)}</li>`:""}
          ${issue.intelligence?.opportunity?`<li>Opportunity: ${htmlEscape(issue.intelligence.opportunity)}</li>`:""}
          <li>Current phase: ${htmlEscape(issue.metrics.phase)}</li>
        </ul></section>
      </div>
    </article>`;
}

function buildOffice(preservePositions=false){const office=document.getElementById("office");office.querySelectorAll(".agent").forEach(n=>n.remove());employees.filter(e=>e.active).forEach(e=>{const n=document.createElement("div");n.className="agent";n.id=`agent-${e.id}`;const color=colors[e.id%colors.length]||"#2ab7a9";n.innerHTML=`<div class="thought"></div><div class="avatar" style="background:${color}">${(e.name||"?")[0]}<span class="activity-dot"></span></div><small>${e.name}</small>`;n.onclick=()=>showEmployee(e.id);office.appendChild(n);if(preservePositions&&Number.isFinite(e.x)&&Number.isFinite(e.y)){n.style.transition="none";n.style.left=e.x+"%";n.style.top=e.y+"%";setTimeout(()=>n.style.transition="",20);}else moveToZone(e,e.zone,true);});}
function simulationRandom(){
  if(company){
    company.randomState=Number(company.randomState)||((company.day+1)*1103515245+12345);
    company.randomState=(Math.imul(company.randomState,1664525)+1013904223)>>>0;
    return company.randomState/4294967296;
  }
  return Math.random();
}
function nextSimulationId(prefix="id"){
  if(!company)return `${prefix}-0`;
  company.nextRuntimeId=Math.max(1,Number(company.nextRuntimeId)||1);
  return `${prefix}-${company.day}-${company.nextRuntimeId++}`;
}
function rand(a,b){return a+simulationRandom()*(b-a)} function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function moveToZone(e,z,instant=false){e.zone=z;e.x=rand(zones[z].x[0],zones[z].x[1]);e.y=rand(zones[z].y[0],zones[z].y[1]);const n=document.getElementById(`agent-${e.id}`);if(n){if(instant)n.style.transition="none";n.style.left=e.x+"%";n.style.top=e.y+"%";if(instant)setTimeout(()=>n.style.transition="",20);}}
function socialTarget(e){return employees.filter(x=>x.active&&!x.offsite&&x.id!==e.id).sort((a,b)=>socialScore(e,b.id)-socialScore(e,a.id))[0]||null;}
function workStage(work){
  if(!work)return "Unassigned";
  if(work.status==="closed"||work.progress>=100)return "Complete";
  const blockers=Array.isArray(work.blockedBy)?work.blockedBy:[];
  if(blockers.length)return `Blocked: ${blockers[0]}`;
  const p=Number(work.progress)||0;
  if(p<12)return "Investigation";
  if(p<30)return "Requirements";
  if(p<62)return "Implementation";
  if(p<84)return ["verification","quality","integration"].includes(work.type)?"Testing":"Review";
  return "Ready for review";
}
function workStatusLabel(work){
  if(!work)return "No active work";
  const p=Math.round(Number(work.progress)||0);
  const blockers=Array.isArray(work.blockedBy)?work.blockedBy.length:0;
  const suffix=blockers?`${blockers} blocker${blockers===1?"":"s"}`:`${p}%`;
  return `${workStage(work)} - ${suffix}`;
}
function projectStatusLabel(p){return String(p?.status||"proposal").replace(/\b\w/g,c=>c.toUpperCase());}
function projectSeededRandom(seedText){
  let h=2166136261>>>0;
  for(let i=0;i<String(seedText).length;i++){h^=String(seedText).charCodeAt(i);h=Math.imul(h,16777619);}
  return function(){h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
}
function projectFamilies(){
  return {
    hardware:["AI accelerator","next-generation processor","memory controller","low-power architecture","chip packaging","verification platform","manufacturing automation","yield improvement","firmware-hardware integration","security hardening"],
    software:["driver rewrite","firmware modernization","developer SDK","cloud platform","customer portal","internal tools","observability system","deployment automation","security update","data platform"],
    business:["enterprise sales initiative","university partnership","supplier diversification","customer-success program","pricing transformation","partner ecosystem","patent portfolio","market campaign","support expansion"],
    internal:["training program","knowledge management","lab modernization","process automation","compliance initiative","succession program","culture improvement"]
  };
}
function projectDepartmentForFamily(family){
  if(["AI accelerator","next-generation processor","memory controller","low-power architecture","chip packaging","manufacturing automation","yield improvement","firmware-hardware integration","security hardening"].includes(family))return "hardware";
  if(["driver rewrite","firmware modernization","developer SDK","cloud platform","customer portal","internal tools","observability system","deployment automation","security update","data platform"].includes(family))return "software";
  if(["enterprise sales initiative","customer-success program","pricing transformation","partner ecosystem","market campaign","support expansion"].includes(family))return "product";
  return "finance";
}
function projectRequiredDepartments(family,primary=projectDepartmentForFamily(family)){
  const set=new Set([primary]);
  if(["hardware","software"].includes(primary))set.add("quality");
  if(["AI accelerator","customer portal","developer SDK","enterprise sales initiative"].includes(family))set.add("product");
  if(["manufacturing automation","yield improvement","supplier diversification"].includes(family))set.add("hardware");
  set.add("finance");
  return [...set];
}
function createProjectReality(seed,family){
  const r=projectSeededRandom(seed),base=family.includes("AI")||family.includes("next-generation")?12:0;
  return {
    trueTechnicalDifficulty:Math.round(35+base+r()*45),
    trueMarketDemand:Math.round(25+r()*65),
    trueStrategicValue:Math.round(30+r()*65),
    trueCustomerExcitement:Math.round(20+r()*70),
    trueManufacturingComplexity:Math.round((projectDepartmentForFamily(family)==="hardware"?40:15)+r()*45),
    trueCompetitorPressure:Math.round(20+r()*70),
    trueExpansionPotential:Math.round(20+r()*75),
    trueKnowledgeValue:Math.round(25+r()*70),
    trueTalentRetentionValue:Math.round(20+r()*70),
    hiddenFailureModes:["scope creep","late integration risk","supplier timing","market timing"].filter(()=>r()>.45),
    hiddenUpsideTriggers:["customer pull","technical breakthrough","reusable platform","hiring magnet"].filter(()=>r()>.5),
    hiddenObsolescenceRate:Math.round(r()*45),
    hiddenTimingWindow:Math.round(45+r()*220)
  };
}
