// ============================================================
// FINAL PRODUCT BIBLE COMPLETION LAYER
// Adds rule-based manufacturing, shareholders, teams, customer
// sentiment, offline world snapshots, and richer history usage.
// ============================================================

const INSTITUTIONAL_LESSON_KEYS=["testing","collaboration","documentation","escalation","innovation","riskTaking","planning","mentoring","recovery","helpSeeking","workloadBalancing","coaching","performanceManagement","successionPlanning","hiringTiming","retention","burnoutRecovery","terminationTiming","layoffCaution",...PROJECT_LESSON_KEYS];
function emptyLessonVector(){return Object.fromEntries(INSTITUTIONAL_LESSON_KEYS.map(k=>[k,0]));}
function normalizeLessonVector(v={}){const out=emptyLessonVector();for(const k of INSTITUTIONAL_LESSON_KEYS)out[k]=clamp(Number(v[k])||0,-10,10);return out;}
function lessonAcceptanceFor(e){
  if(!Number.isFinite(e.baseLessonAcceptance)){
    let base=.68;
    if(e.traits?.includes("loyal"))base+=.12;
    if(e.traits?.includes("cautious"))base+=.08;
    if(e.traits?.includes("skeptical"))base-=.14;
    if(e.traits?.includes("independent"))base-=.09;
    e.baseLessonAcceptance=clamp(base,.25,1.1);
  }
  const trust=((Number(e.opinionOfCEO?.trust)||55)-55)/100;
  e.dynamicLessonAcceptance=clamp((Number(e.baseLessonAcceptance)||.68)+trust,.25,1.25);
  e.lessonAcceptance=e.dynamicLessonAcceptance;
  return e.dynamicLessonAcceptance;
}
function learningEpisodeKey(domain,eventType,action,department,projectId,evidence,context={}){
  const source=context.episodeKey||context.sourceId||context.workItemId||context.messageId||context.decisionId||projectId||String(evidence||"").slice(0,80)||"general";
  return [domain,eventType,action,department||"company",source].map(v=>String(v||"").toLowerCase().replace(/\s+/g,"-")).join("|");
}
function recordLearningEvidence({domain="institutional",eventType="general",action="",outcome="mixed",magnitude=0,confidence=55,department="company",employeeIds=[],projectId=null,context={},contributors=[],evidence=""}={}){
  if(!company)return null;
  company.learningEvidence=Array.isArray(company.learningEvidence)?company.learningEvidence:[];
  const episodeKey=learningEpisodeKey(domain,eventType,action,department,projectId,evidence,context);
  const existing=company.learningEvidence.find(r=>r.episodeKey===episodeKey&&company.day-(r.day||0)<14);
  if(existing){
    existing.ownerSystem=AI_SYSTEM_OWNERS.institutional;
    existing.count=(existing.count||1)+1;
    existing.lastDay=company.day;
    existing.magnitude=clamp(((existing.magnitude||0)*(existing.count-1)+(Number(magnitude)||0))/existing.count,-10,10);
    existing.confidence=clamp(Math.max(existing.confidence||0,Number(confidence)||55),0,100);
    if(evidence&&!String(existing.evidence||"").includes(String(evidence).slice(0,40)))existing.evidence=`${existing.evidence}; ${evidence}`.slice(0,240);
    return existing;
  }
  const rec={ownerSystem:AI_SYSTEM_OWNERS.institutional,id:`learn-${company.day}-${company.learningEvidence.length+1}-${Math.floor(simulationRandom()*9999)}`,episodeKey,day:company.day,lastDay:company.day,count:1,domain,eventType,action,outcome,magnitude:Number(magnitude)||0,confidence:clamp(Number(confidence)||55,0,100),department,employeeIds:Array.isArray(employeeIds)?employeeIds:[],projectId,context,contributors:Array.isArray(contributors)?contributors:[],evidence};
  company.learningEvidence.unshift(rec);
  company.learningEvidence=company.learningEvidence.slice(0,420);
  return rec;
}
function companyLearningBaseline(){
  if(typeof updateCompanyRiskComponents==="function")updateCompanyRiskComponents();
  const active=employees.filter(e=>e.active);
  const staffing=company.staffingModel||{};
  const staffingCoverage=Object.values(staffing).reduce((s,x)=>s+(Number(x.coverage??x.staffingCoverage??100)||0),0)/Math.max(1,Object.keys(staffing).length);
  const departmentBacklog=Object.values(company.teams||{}).reduce((s,t)=>s+(Number(t.backlog)||0),0);
  const overtimeLoad=active.reduce((s,e)=>s+Math.max(0,(Number(e.stress)||0)-65),0)/Math.max(1,active.length);
  const onboarding=(company.hiringPipeline||[]).filter(r=>/onboarding/i.test(String(r.status||""))).length;
  const openRoles=(company.hiringPipeline||[]).filter(r=>!/filled|rejected|canceled/i.test(String(r.status||""))).length+(company.openRoles||[]).length;
  const segmentSnapshot=Object.fromEntries(Object.entries(company.customerSegments||{}).map(([id,seg])=>[id,{customers:Number(seg.activeCustomers)||0,sentiment:Number(seg.sentiment)||0,churnRisk:Number(seg.churnRisk)||0,revenue:Number(seg.dailyRevenue||seg.revenueDaily)||0,supportLoad:Number(seg.supportLoad||seg.openIssues?.length||seg.currentIssues?.length||0)}]));
  return {
    day:company.day,cash:Number(company.cash)||0,board:Number(company.board)||0,trust:Number(company.trust)||0,
    quality:Number(company.quality)||0,integration:Number(company.integration)||0,customers:Number(company.customers)||0,
    dailyRevenue:Number(company.dailyRevenue)||0,valuation:Number(company.valuation)||0,
    morale:active.reduce((s,e)=>s+(Number(e.morale)||0),0)/Math.max(1,active.length),
    stress:active.reduce((s,e)=>s+(Number(e.stress)||0),0)/Math.max(1,active.length),
    staffingCoverage,departmentBacklog,overtimeLoad,onboarding,openRoles,
    retentionRate:active.filter(e=>(Number(e.retentionRisk)||0)<60).length/Math.max(1,active.length)*100,
    roleOutput:active.reduce((s,e)=>s+Number(e.performance?.recentOutput ?? e.recentOutput ?? 0),0)/Math.max(1,active.length),
    customerSegments:segmentSnapshot,
    risk:Number(company.companyRiskComponents?.total??0),portfolioHealth:Number(company.portfolioHealth?.portfolioHealth??derivedOperatingHealth?.().portfolioHealth??50),
    phase:company.phase
  };
}
function learningEpisodeSubtype(domain,strategy="",choiceTitle=""){
  const s=String(`${domain} ${strategy} ${choiceTitle}`).toLowerCase();
  if(domain==="communication")return /suppress/.test(s)?"communication.noise-filtering":"communication.risk-escalation";
  if(domain==="customer")return /support|recovery|retention/.test(s)?"decision.customer.recovery":"customer.launch-support";
  if(domain==="board")return "board.market-overreaction";
  if(domain==="investor"||domain==="investor-relations")return "investor.forecast";
  if(/hire/.test(s))return /delay|reject/.test(s)?"decision.workforce.hiring-delay":"decision.workforce.hiring";
  if(/customer/.test(s))return "decision.customer.recovery";
  if(/cash|freeze|cut|finance|spend/.test(s))return "decision.finance.spending-control";
  if(/scope|reduce/.test(s))return "decision.project.scope-reduction";
  if(/validate|pilot|quality|test/.test(s))return "decision.project.validation";
  if(/launch|speed|expand/.test(s))return "decision.project.market-timing";
  return `${domain}.balanced`;
}
function expectedChannelsForEpisode(domain,strategy="",choiceTitle=""){
  const subtype=learningEpisodeSubtype(domain,strategy,choiceTitle),channels={};
  const add=(k,direction,weight)=>channels[k]={direction,weight};
  if(subtype==="decision.project.validation"){add("quality",1,.28);add("integration",1,.18);add("projectRisk",-1,.24);add("portfolioHealth",1,.18);add("cash",-1,.12);}
  else if(subtype==="decision.project.scope-reduction"){add("projectRisk",-1,.30);add("portfolioHealth",1,.22);add("cash",1,.16);add("morale",-1,.12);add("schedule",-1,.20);}
  else if(subtype==="decision.workforce.hiring"){add("staffingCoverage",1,.28);add("departmentBacklog",-1,.18);add("overtimeLoad",-1,.18);add("retentionRate",1,.14);add("roleOutput",1,.12);add("cash",-1,.10);}
  else if(subtype==="decision.workforce.hiring-delay"){add("cash",1,.22);add("staffingCoverage",-1,.22);add("departmentBacklog",1,.18);add("overtimeLoad",1,.16);add("retentionRate",-1,.12);add("risk",1,.10);}
  else if(subtype==="decision.customer.recovery"||subtype==="customer.launch-support"){add("segmentCustomers",1,.22);add("segmentSentiment",1,.28);add("segmentChurnRisk",-1,.22);add("segmentRevenue",1,.16);add("supportLoad",-1,.12);}
  else if(subtype==="decision.finance.spending-control"){add("cash",1,.30);add("risk",-1,.18);add("board",1,.16);add("morale",-1,.16);add("portfolioHealth",-1,.20);}
  else if(subtype==="board.market-overreaction"){add("valuationQuality",1,.28);add("board",1,.18);add("valuation",1,.14);add("risk",-1,.20);add("trust",1,.20);}
  else {add("portfolioHealth",1,.18);add("risk",-1,.18);add("trust",1,.16);add("morale",1,.12);add("cash",1,.12);add("quality",1,.12);add("integration",1,.12);}
  return channels;
}
function createLearningEpisode({domain="decision",subtype=null,sourceId=null,decisionId=null,decisionTitle="",choiceTitle="",strategy="balanced",department="company",projectId=null,employeeIds=[],messageId=null,baseline=null,expectedChannels=null,attributionSources=[],attributionQuality=null,reviewSchedule=null,hypotheses=[],protectedChannel=false,customerSegmentIds=null,customerExperienceIds=null,interventionType=null}={}){
  ensureBibleSystems();
  company.learningEpisodes=Array.isArray(company.learningEpisodes)?company.learningEpisodes:[];
  company.nextLearningEpisodeId=Math.max(1,Number(company.nextLearningEpisodeId)||1);
  const id=company.nextLearningEpisodeId++;
  subtype=subtype||learningEpisodeSubtype(domain,strategy,choiceTitle||decisionTitle);
  const initialAttributionQuality=Number.isFinite(attributionQuality)?attributionQuality:null;
  const episode={ownerSystem:AI_SYSTEM_OWNERS.institutional,id,domain,subtype,sourceId,decisionId,decisionTitle,choiceTitle,strategy,department,projectId,employeeIds:Array.isArray(employeeIds)?employeeIds:[],messageId,protectedChannel,customerSegmentIds:Array.isArray(customerSegmentIds)?customerSegmentIds:[],customerExperienceIds:Array.isArray(customerExperienceIds)?customerExperienceIds:[],interventionType,createdDay:company.day,baseline:baseline||companyLearningBaseline(),expectedChannels:expectedChannels||expectedChannelsForEpisode(domain,strategy,choiceTitle||decisionTitle),attributionSources:Array.isArray(attributionSources)?attributionSources:[],initialAttributionQuality,currentAttributionQuality:initialAttributionQuality,attributionQuality:initialAttributionQuality,reviewSchedule:reviewSchedule||[company.day+7,company.day+21,company.day+60],observations:[],contradictions:[],status:"pending",resolution:null,hypotheses:Array.isArray(hypotheses)?hypotheses:[]};
  company.learningEpisodes.unshift(episode);
  company.learningEpisodes=company.learningEpisodes.slice(0,180);
  return episode;
}
function learningCurrentState(){
  const base=companyLearningBaseline();
  return {...base,customerSentiment:Number(company.customerSentiment)||0,valuationQuality:Number(company.valuationQuality)||50};
}
function episodeChannelDelta(channel,b,current){
  if(["segmentCustomers","segmentSentiment","segmentChurnRisk","segmentRevenue","supportLoad"].includes(channel)){
    const ids=(current.episodeCustomerSegmentIds||b.customerSegmentIds||[]).length?(current.episodeCustomerSegmentIds||b.customerSegmentIds):Object.keys(current.customerSegments||{});
    const key={segmentCustomers:"customers",segmentSentiment:"sentiment",segmentChurnRisk:"churnRisk",segmentRevenue:"revenue",supportLoad:"supportLoad"}[channel];
    const before=ids.reduce((s,id)=>s+(Number(b.customerSegments?.[id]?.[key])||0),0)/Math.max(1,ids.length);
    const after=ids.reduce((s,id)=>s+(Number(current.customerSegments?.[id]?.[key])||0),0)/Math.max(1,ids.length);
    return after-before;
  }
  if(channel==="projectRisk"){
    const project=[...(company.projects||[]),...(company.projectArchive||[]),...(company.projectProposals||[])].find(p=>p.id===b.projectId);
    return project?-(Number(project.performance?.riskTrend??project.visibleRisk??50)-Number(b.projectRisk??project.visibleRisk??50)):0;
  }
  if(channel==="schedule"){
    const project=[...(company.projects||[]),...(company.projectArchive||[]),...(company.projectProposals||[])].find(p=>p.id===b.projectId);
    return project?-(Number(project.performance?.scheduleVariance||0)-Number(b.scheduleVariance||0)):0;
  }
  return (Number(current[channel])||0)-(Number(b[channel])||0);
}
function scoreEpisodeChannel(channel,episode,currentState){
  const cfg=episode.expectedChannels?.[channel];if(!cfg)return 0;
  const b={...(episode.baseline||{}),projectId:episode.projectId,customerSegmentIds:episode.customerSegmentIds||[]};
  const current={...currentState,episodeCustomerSegmentIds:episode.customerSegmentIds||[]};
  const delta=episodeChannelDelta(channel,b,current);
  const scaled=(channel==="dailyRevenue"||channel==="segmentRevenue"?delta*18:channel==="cash"?delta*.45:channel==="valuation"?delta*.08:["departmentBacklog","overtimeLoad","supportLoad"].includes(channel)?delta*.22:delta*.16);
  return scaled*(cfg.direction||1)*(cfg.weight||.1);
}
function communicationOutcomeScore(episode){
  if(!episode.messageId)return 0;
  const outcomes=(company.communicationOutcomes||[]).filter(o=>o.messageId===episode.messageId||o.id===episode.messageId);
  if(!outcomes.length)return 0;
  const reviewed=outcomes.filter(o=>o.reviewedDay);
  const items=reviewed.length?reviewed:outcomes;
  return items.reduce((sum,o)=>{
    const materialityAccuracy=1-Math.min(1,Math.abs(Number(o.severityError)||0)/100);
    const timingQuality=(Number(o.timingQuality)||50)/100;
    const evidenceQuality=(Number(o.evidenceQuality)||50)/100;
    const decisionUsefulness=o.usefulToDecision?1:0;
    const duplicatePenalty=o.duplicate ? .35 : 0;
    const falseAlarmPenalty=(!o.materialized&&Number(o.predictedSeverity||o.materiality||0)>60) ? .45 : 0;
    return sum+(materialityAccuracy*.25+timingQuality*.20+evidenceQuality*.20+decisionUsefulness*.15-duplicatePenalty*.10-falseAlarmPenalty*.10);
  },0)/Math.max(1,items.length);
}
function calculateEpisodeAttributionQuality(ep,current=learningCurrentState()){
  const age=company.day-(ep.createdDay||company.day);
  let score=35;
  if(ep.sourceId||ep.decisionId||ep.messageId)score+=14;
  if(ep.projectId)score+=14;
  if((ep.employeeIds||[]).length)score+=8;
  if(age<=10)score+=10;else if(age<=30)score+=7;else if(age<=75)score+=4;
  if(ep.expectedChannels&&Object.keys(ep.expectedChannels).length<=5)score+=8;
  const shocks=(company.valuationShocks||[]).filter(s=>company.day-(s.day||0)<=Math.max(7,age)&&!String(s.sourceId||"").includes(String(ep.sourceId||ep.projectId||ep.decisionId||"__none__"))).length;
  if(shocks)score-=Math.min(18,shocks*6);
  if(ep.domain==="communication"&&!ep.messageId)score-=12;
  if(ep.domain==="decision"&&!ep.decisionId&&!ep.sourceId)score-=10;
  if(Number.isFinite(ep.initialAttributionQuality)&&ep.observations?.length===0)score=(score+ep.initialAttributionQuality)/2;
  ep.currentAttributionQuality=clamp(score,0,100);
  if(!Number.isFinite(ep.initialAttributionQuality))ep.initialAttributionQuality=ep.currentAttributionQuality;
  ep.attributionQuality=ep.currentAttributionQuality;
  return ep.currentAttributionQuality;
}
function weightedEpisodeScore(episode,current,weights={},fallback=.05){
  return Object.keys(episode.expectedChannels||{}).reduce((s,ch)=>{
    const cfg=episode.expectedChannels[ch]||{};
    const domainWeight=weights[ch]??(Number.isFinite(Number(cfg.weight))?Number(cfg.weight):fallback);
    return s+scoreEpisodeChannel(ch,{...episode,expectedChannels:{[ch]:{...cfg,weight:domainWeight}}},current);
  },0);
}
function scoreDecisionLearningEpisode(episode,current=learningCurrentState()){
  return weightedEpisodeScore(episode,current,{quality:.20,integration:.16,projectRisk:.22,portfolioHealth:.20,cash:.10,trust:.12,risk:.15,board:.12},.08);
}
function scoreCommunicationLearningEpisode(episode,current=learningCurrentState()){
  return weightedEpisodeScore(episode,current,{trust:.12,risk:.10,morale:.08,portfolioHealth:.08,quality:.08,customerSentiment:.08},.04)+communicationOutcomeScore(episode);
}
function scoreCustomerLearningEpisode(episode,current=learningCurrentState()){
  return weightedEpisodeScore(episode,current,{segmentCustomers:.24,segmentSentiment:.30,segmentChurnRisk:.22,segmentRevenue:.16,supportLoad:.12,customers:.08,customerSentiment:.08},.04);
}
function scoreWorkforceLearningEpisode(episode,current=learningCurrentState()){
  return weightedEpisodeScore(episode,current,{staffingCoverage:.30,departmentBacklog:.18,overtimeLoad:.18,retentionRate:.14,roleOutput:.12,cash:.08,morale:.06,stress:.06},.05);
}
function scoreBoardLearningEpisode(episode,current=learningCurrentState()){
  return weightedEpisodeScore(episode,current,{board:.25,valuationQuality:.24,valuation:.14,risk:.18,trust:.14,cash:.08},.06);
}
function scoreInvestorRelationsEpisode(episode,current=learningCurrentState()){
  return weightedEpisodeScore(episode,current,{valuationQuality:.25,valuation:.22,board:.16,cash:.12,risk:.14,trust:.10,dailyRevenue:.10},.06);
}
function scoreLearningEpisodeOutcome(ep,current=learningCurrentState()){
  if(ep.domain==="communication")return scoreCommunicationLearningEpisode(ep,current);
  if(ep.domain==="customer")return scoreCustomerLearningEpisode(ep,current);
  if(ep.domain==="workforce")return scoreWorkforceLearningEpisode(ep,current);
  if(ep.domain==="board")return scoreBoardLearningEpisode(ep,current);
  if(ep.domain==="investor"||ep.domain==="investor-relations")return scoreInvestorRelationsEpisode(ep,current);
  return scoreDecisionLearningEpisode(ep,current);
}
function classifyLearningFailure(ep,score,attributionQuality){
  if(attributionQuality<40)return "insufficient evidence";
  const shock=(company.valuationShocks||[]).some(s=>company.day-(s.day||0)<=21&&Math.abs(s.magnitude||0)>1.5);
  if(shock)return "external shock";
  const relatedProject=ep.projectId?[...(company.projects||[]),...(company.projectArchive||[]),...(company.projectProposals||[])].find(p=>p.id===ep.projectId):null;
  const relatedDepartment=ep.department&&ep.department!=="company";
  const deptPressure=relatedDepartment&&(company.teams?.[ep.department]?.pressure>72||company.staffingModel?.[ep.department]?.understaffed);
  const projectPressure=relatedProject&&((relatedProject.performance?.staffingCoverage??100)<70||(relatedProject.performance?.blockerCount||0)>0||(relatedProject.performance?.riskTrend??0)>72);
  if(projectPressure||deptPressure)return "execution failure";
  if((company.portfolioHealth?.currentlyMissing||0)>0||avgStress()>72)return "low attribution from unrelated operating pressure";
  if(/launch|market|speed|expand/i.test(`${ep.strategy} ${ep.choiceTitle}`))return "timing failure";
  return score<0?"strategy mismatch":"mixed";
}
function lessonVectorForEpisode(ep,positive=true){
  const s=String(ep.strategy||ep.choiceTitle||"").toLowerCase();
  const v={planning:.35,documentation:.2};
  if(s.includes("quality")){v.testing=1.05;v.documentation=.55;v.planning=.55;v.earlyQA=.5;v.riskTaking=positive?-.18:-.35;}
  if(s.includes("sustainability")){v.recovery=1.1;v.burnoutRecovery=.85;v.planning=.55;v.escalation=.4;v.riskTaking=positive?-.2:-.4;}
  if(s.includes("collaboration")){v.collaboration=1.1;v.mentoring=.8;v.documentation=.35;v.crossDepartmentCoordination=.45;}
  if(s.includes("runway")){v.planning=1.05;v.documentation=.45;v.riskTaking=positive?-.15:-.3;v.escalation=.35;v.hiringTiming=.25;}
  if(s.includes("quality")||s.includes("delay")||s.includes("test")){v.testing=.8;v.riskTaking=positive?-.15:-.45;v.planning=.7;}
  if(s.includes("hire")||s.includes("people")||s.includes("coach")){v.mentoring=.65;v.recovery=.35;v.collaboration=.45;v.hiringTiming=.35;}
  if(s.includes("cut")||s.includes("freeze")||s.includes("cash")||s.includes("delay")){v.planning=.85;v.escalation=.45;v.riskTaking=positive?-.15:-.25;}
  if(s.includes("launch")||s.includes("speed")||s.includes("expand")){v.riskTaking=positive?.65:-.55;v.marketTiming=.45;v.planning=.35;}
  if(s.includes("report")||s.includes("escalat")){v.escalation=.7;v.documentation=.45;}
  if(positive)return v;
  const cause=ep.failureCause||"insufficient evidence";
  if(cause==="external shock"||cause==="insufficient evidence"||cause==="low attribution from unrelated operating pressure")return Object.fromEntries(Object.entries(v).map(([k,val])=>[k,val*.08]));
  if(cause==="execution failure"||cause==="insufficient staffing"){v.planning=(v.planning||0)+.35;v.escalation=(v.escalation||0)+.25;return normalizeLessonVector(v);}
  if(cause==="timing failure"){v.marketTiming=-(Math.abs(v.marketTiming||.35));v.planning=(v.planning||0)+.2;return normalizeLessonVector(v);}
  if(cause==="strategy mismatch"){
    const implicated=/launch|market|speed|expand/.test(s)?["riskTaking","marketTiming"]:/cash|freeze|cut|runway/.test(s)?["riskTaking","hiringTiming"]:/hire|people|coach/.test(s)?["hiringTiming","workloadBalancing"]:/quality|test|verify/.test(s)?["testing","riskTaking"]:["riskTaking"];
    return Object.fromEntries(Object.entries(v).map(([k,val])=>[k,implicated.includes(k)?-Math.abs(val)*.55:val*.10]));
  }
  return Object.fromEntries(Object.entries(v).map(([k,val])=>[k,-val*.25]));
}
function evaluateLearningEpisode(ep,reviewDay=company.day){
  const current=learningCurrentState(),score=scoreLearningEpisodeOutcome(ep,current),abs=Math.abs(score),attributionQuality=calculateEpisodeAttributionQuality(ep,current);
  const outcome=score>1.4?"positive":score<-1.4?"negative":"mixed";
  ep.observations=Array.isArray(ep.observations)?ep.observations:[];
  if(ep.observations.some(o=>o.reviewDay===reviewDay))return;
  const reviewIndex=ep.observations.length;
  if(outcome==="negative")ep.failureCause=classifyLearningFailure(ep,score,attributionQuality);
  ep.attributionQuality=attributionQuality;
  ep.observations.push({reviewDay,day:company.day,score:Number(score.toFixed(3)),outcome,attributionQuality,reviewWindow:reviewIndex===0?"short":reviewIndex===1?"medium":"long",failureCause:ep.failureCause||null,baselineDay:ep.baseline?.day,current});
  if(reviewIndex===0){ep.status="observing";return;}
  if(abs>=1.4||ep.observations.length>=ep.reviewSchedule.length){
    const positive=score>=0,confidence=clamp(36+abs*7+ep.observations.length*5+attributionQuality*.18,25,88);
    const state=reviewIndex>=2&&attributionQuality>=75&&abs>=2.2?"validated":reviewIndex>=2&&attributionQuality>=60?"provisional":attributionQuality>=40?"hypothesis":"hypothesis";
    if(attributionQuality>=40){
      const key=`${ep.subtype||learningEpisodeSubtype(ep.domain,ep.strategy,ep.choiceTitle)}-${ep.projectId||ep.department||"company"}`.toLowerCase().replace(/[^a-z0-9.]+/g,"-").slice(0,82);
      const age=company.day-(ep.createdDay||company.day);
      createOrReinforceLesson({key,title:`${ep.domain==="communication"?"Communication":"Decision"} learning: ${ep.choiceTitle||ep.decisionTitle||ep.strategy||"company action"}`,department:ep.department||"company",vector:lessonVectorForEpisode(ep,positive),outcome,confidence,evidence:`${state} review after ${age} ${age===1?"day":"days"}: ${outcome}${ep.failureCause?"; cause "+ep.failureCause:""}`,importance:ep.domain==="decision"?4:3,state,episodeKey:`episode-${ep.id}`,attributionQuality,reviewWindow:reviewIndex===1?"medium":"long"});
    }
  }
  if(ep.observations.length>=ep.reviewSchedule.length)ep.status="resolved";
}
function reviewLearningEpisodes(){
  ensureBibleSystems();
  (company.learningEpisodes||[]).forEach(ep=>{
    if(ep.status==="resolved"||ep.status==="obsolete")return;
    const due=(ep.reviewSchedule||[]).filter(day=>day<=company.day&&!ep.observations?.some(o=>o.reviewDay===day));
    due.forEach(day=>evaluateLearningEpisode(ep,day));
  });
  evaluateCommunicationOutcomeRecords();
}
function evaluateCommunicationOutcomeRecords(){
  ensureBibleSystems();
  company.communicationOutcomes=Array.isArray(company.communicationOutcomes)?company.communicationOutcomes:[];
  company.communicationOutcomes.forEach(o=>{
    if(o.reviewedDay||company.day-(o.day||0)<7)return;
    const links=o.links||{};
    const matchingIssues=(company.issueRecords||[]).filter(i=>(links.issueId&&i.id===links.issueId)||(String(i.type||"")===String(o.issueType||"")&&links.projectId&&i.projectId===links.projectId&&Math.abs((i.createdDay||0)-(o.day||0))<=10));
    const linkedWork=links.workItemId?(company.workItems||[]).find(w=>w.id===links.workItemId):null;
    const linkedCustomer=links.customerExperienceId?(company.customerExperiences||[]).find(c=>c.id===links.customerExperienceId):null;
    const linkedProject=links.projectId?[...(company.projects||[]),...(company.projectArchive||[]),...(company.projectProposals||[])].find(p=>p.id===links.projectId):null;
    const usefulToDecision=!!(o.messageId&&(company.decisionHistory||[]).some(d=>d.sourceMessageId===o.messageId||d.messageId===o.messageId));
    const observedMateriality=clamp((matchingIssues.some(i=>(i.severity||0)>65)?72:0)+(linkedWork?.blockedBy?.length?18:0)+(linkedCustomer&&!linkedCustomer.resolved?(linkedCustomer.severity||0):0)+(linkedProject?.performance?.riskTrend||0)*.35,0,100);
    const evidenceQuality=clamp((Object.values(links).some(Boolean)?30:0)+(matchingIssues.length?28:0)+(linkedWork?14:0)+(linkedCustomer?14:0)+(linkedProject?14:0),0,100);
    const materialized=observedMateriality>58||matchingIssues.some(i=>(i.severity||0)>65);
    const severityError=materialized?Math.abs((o.predictedSeverity||o.materiality||0)-observedMateriality):Math.max(0,(o.predictedSeverity||o.materiality||0)-45);
    const timingQuality=company.day-(o.day||0)<=14?80:60;
    const fingerprint=JSON.stringify(o.issueFingerprint||{issueType:o.issueType});
    const duplicate=company.communicationOutcomes.some(other=>other!==o&&other.reviewedDay&&JSON.stringify(other.issueFingerprint||{issueType:other.issueType})===fingerprint&&Math.abs((other.day||0)-(o.day||0))<=2&&other.employeeId!==o.employeeId);
    const independentConfirmation=company.communicationOutcomes.some(other=>other!==o&&other.reviewedDay&&other.issueType===o.issueType&&JSON.stringify(other.issueFingerprint||{})!==fingerprint&&Math.abs((other.day||0)-(o.day||0))<=7);
    o.observedMateriality=Math.round(observedMateriality);o.materialized=materialized;o.severityError=Math.round(severityError);o.timingQuality=timingQuality;o.evidenceQuality=Math.round(evidenceQuality);o.duplicate=duplicate;o.independentConfirmation=independentConfirmation;o.usefulToDecision=usefulToDecision;o.reviewedDay=company.day;
    const e=employees.find(emp=>emp.id===o.employeeId);
    if(!e)return;
    if(o.type==="report"){
      if(materialized&&evidenceQuality>=55){adjustLearningTrait(e,"reporting",.08,-5,10);adjustLearningTrait(e,"protectedEscalation",o.materiality>78?.04:0,-5,10);}
      if(!materialized&&duplicate){adjustLearningTrait(e,"noiseFiltering",.06,-5,10);adjustLearningTrait(e,"reporting",-.03,-5,10);}
      if(!materialized&&!duplicate&&o.materiality>65){adjustLearningTrait(e,"reporting",-.05,-5,10);}
    }
    if(o.type==="suppress"){
      if(materialized){adjustLearningTrait(e,"politicalSuppression",-.10,-5,10);adjustLearningTrait(e,"protectedEscalation",.10,-5,10);adjustLearningTrait(e,"reporting",.06,-5,10);}
      else if(duplicate||o.materiality<45){adjustLearningTrait(e,"noiseFiltering",.07,-5,10);}
    }
  });
}
const NON_AUTHORITATIVE_PATHS=new Set(["company.runtime","company.uiCache","company.companyRiskComponents","company.riskPillars","company.staffingModel","company.workforceAllocationSnapshot","company.organizationMaturity","company.capabilityNeeds","company.capabilityCoverage","company.capabilityGaps","company.capabilityConsequences","company.capabilityContributors","company.capabilityPromotionCandidates","company.capabilityFulfillmentOptions","company.capabilityAudit","company.capabilityLearningSignals","company.capabilitySystemUpdatedDay","company.lastProjectRequirementAuditDay","company.executiveBriefing","company.executiveIntelligenceSnapshot","company.executiveObservations","company.debugState","company.dailyStageStatus","company.pendingCommunication.bodyPreview","company.crisis.currentProgressDetail"]);
function isNonAuthoritativePath(path){
  if(NON_AUTHORITATIVE_PATHS.has(path))return true;
  if(/^company\.(dailyStageStatus\.\d+|lastDailyCloseStatus)\.(startedAt|completedAt|hashBefore|hashAfter)$/.test(path))return true;
  if(/^company\.learningEpisodes\.\d+\.observations$/.test(path))return true;
  if(/^employees\.\d+\.(currentRoom|roomSelectionReason|roomEffect)$/.test(path))return true;
  if(/^company\.(projects|projectArchive|projectProposals)\.\d+\.requirementAudit$/.test(path))return true;
  return /^company\.(projects|projectArchive|projectProposals)\.\d+\.(commercialReadiness|commercialPotential|projectedDailyRevenue)$/.test(path);
}
function canonicalAuthoritativeState(value,path=""){
  if(value===null||typeof value!=="object"){
    if(typeof value==="number")return Number.isFinite(value)?Number(value.toFixed(2)):0;
    return value;
  }
  if(Array.isArray(value))return value.map((item,index)=>canonicalAuthoritativeState(item,`${path}.${index}`));
  const out={};
  for(const key of Object.keys(value).sort()){
    const next=path?`${path}.${key}`:key;
    if(isNonAuthoritativePath(next))continue;
    out[key]=canonicalAuthoritativeState(value[key],next);
  }
  return out;
}
function hashAuthoritativeState(companyState=company,employeeState=employees){
  const s=JSON.stringify({company:canonicalAuthoritativeState(companyState,"company"),employees:canonicalAuthoritativeState(employeeState,"employees")});
  let h=2166136261>>>0;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
  return h.toString(16);
}
function stateHash(){return hashAuthoritativeState(company,employees);}
function ensureInstitutionalLearning(){
  if(!company)return;
  company.lessons=Array.isArray(company.lessons)?company.lessons:[];
  company.learningEvidence=Array.isArray(company.learningEvidence)?company.learningEvidence:[];
  company.learningCoverage=company.learningCoverage&&typeof company.learningCoverage==="object"?company.learningCoverage:{};
  company.nextLessonId=Number(company.nextLessonId)||1;
  company.departmentLearning=company.departmentLearning&&typeof company.departmentLearning==="object"?company.departmentLearning:{};
  for(const dept of DEPARTMENTS){
    company.departmentLearning[dept]=normalizeLessonVector(company.departmentLearning[dept]||{});
  }
  const shouldAudit=debugMode||validationMode||company.learningAuditDay!==company.day;
  if(shouldAudit){
    company.learningCoverage=validateLearningCoverage();
    company.learningAudit=runV32InstitutionalLearningAudit();
    company.learningAuditDay=company.day;
  }
  company.lastLessonReviewDay=Number.isFinite(company.lastLessonReviewDay)?company.lastLessonReviewDay:-999;
  (employees||[]).forEach(e=>{
    e.learnedLessons=normalizeLessonVector(e.learnedLessons||{});
    lessonAcceptanceFor(e);
    e.joinedDay=Number.isFinite(e.joinedDay)?e.joinedDay:0;
  });
}
function employeeLessonStrength(e,department){
  const tenure=Math.max(0,(company.day||0)-(e.joinedDay||0));
  const veteran=clamp(.65+tenure/240,.65,1.15);
  const proximity=department==="company"||employeeTeam(e)===department?1:.52;
  return veteran*proximity*lessonAcceptanceFor(e);
}
function lessonStateWeight(lesson){
  const state=lesson?.state||"unknown";
  if(state==="validated")return 1;
  if(state==="provisional")return .20;
  if(state==="hypothesis"||state==="prior")return .05;
  if(state==="contradicted")return -.10;
  if(state==="obsolete")return 0;
  return 0;
}
function applyInstitutionalLessonToEmployee(e,lesson,scale=1){
  if(!e.active)return;
  e.learnedLessons=normalizeLessonVector(e.learnedLessons||{});
  const strength=employeeLessonStrength(e,lesson.department||"company")*scale*lessonStateWeight(lesson);
  for(const [k,v] of Object.entries(normalizeLessonVector(lesson.vector))){
    e.learnedLessons[k]=clamp((e.learnedLessons[k]||0)+v*strength,-10,10);
  }
  if(Math.abs(strength)>.72&&lessonStateWeight(lesson)>0&&Math.max(...Object.values(normalizeLessonVector(lesson.vector)).map(Math.abs))>=1){
    addMemory(e,"INSTITUTIONAL_LESSON",lesson.title,lesson.outcome==="negative"?"negative":"neutral",clamp(5+lesson.confidence/18,5,11),"company");
  }
}
function createOrReinforceLesson({key,title,department="company",vector={},outcome="mixed",confidence=55,evidence="",importance=3,state=null,episodeKey=null,attributionQuality=null,reviewWindow=null}){
  ensureInstitutionalLearning();
  if(!DEPARTMENTS.includes(department))department="company";
  const reviewed=!!episodeKey&&Number(attributionQuality??60)>=40;
  if(!reviewed){confidence=Math.min(Number(confidence)||55,42);state=state==="validated"?"hypothesis":(state||"hypothesis");}
  else if(reviewWindow==="short"&&state==="validated")state="provisional";
  const existing=company.lessons.find(l=>l.key===key&&l.department===department);
  if(!reviewed){
    if(existing){
      existing.evidence=Array.isArray(existing.evidence)?existing.evidence:[];
      if(evidence&&!existing.evidence.includes(evidence))existing.evidence.unshift(evidence);
      existing.evidence=existing.evidence.slice(0,6);
      if(existing.state!=="validated"){existing.state="hypothesis";existing.confidence=Math.min(existing.confidence||42,42);}
      return existing;
    }
    const prior={id:company.nextLessonId++,key,title,department,vector:normalizeLessonVector(vector),outcome,state:"hypothesis",episodeKeys:[],confidence:clamp(confidence,0,42),evidence:evidence?[evidence]:[],createdDay:company.day,lastDay:company.day,reinforcements:0,importance,successEvidence:0,failureEvidence:0,sampleCount:0,effectEstimate:0,variance:1,pendingEvidenceOnly:true};
    company.lessons.unshift(prior);
    company.lessons=company.lessons.slice(0,36);
    return prior;
  }
  const incoming=normalizeLessonVector(vector);
  const magnitude=Object.values(incoming).reduce((s,v)=>s+Math.abs(v),0)/Math.max(1,INSTITUTIONAL_LESSON_KEYS.length);
  let lesson;
  if(existing){
    if(episodeKey&&Array.isArray(existing.episodeKeys)&&existing.episodeKeys.includes(episodeKey))return existing;
    existing.sampleCount=(existing.sampleCount||existing.reinforcements||1)+1;
    existing.successEvidence=(existing.successEvidence||0)+(outcome==="positive"?1:0);
    existing.failureEvidence=(existing.failureEvidence||0)+(outcome==="negative"?1:0);
    existing.effectEstimate=clamp(((existing.effectEstimate||0)*(existing.sampleCount-1)+(outcome==="negative"?-magnitude:magnitude))/existing.sampleCount,-10,10);
    existing.variance=clamp(((existing.variance||1)*(existing.sampleCount-1)+Math.pow(magnitude-Math.abs(existing.effectEstimate||0),2))/existing.sampleCount,0,25);
    const contradiction=(existing.outcome==="positive"&&outcome==="negative")||(existing.outcome==="negative"&&outcome==="positive");
    existing.confidence=clamp((existing.confidence||50)+Math.max(1,confidence*.04)*(contradiction?-.8:1)/(1+Math.sqrt(existing.variance||0)),0,100);
    existing.outcome=existing.successEvidence>existing.failureEvidence*1.4?"positive":existing.failureEvidence>existing.successEvidence*1.4?"negative":"mixed";
    existing.reinforcements=(existing.reinforcements||1)+1;
    existing.lastDay=company.day;
    existing.state=state||existing.state||((existing.confidence||0)>72&&reviewed?"validated":"provisional");
    existing.episodeKeys=Array.isArray(existing.episodeKeys)?existing.episodeKeys:[];
    if(episodeKey)existing.episodeKeys.unshift(episodeKey);
    existing.episodeKeys=existing.episodeKeys.slice(0,12);
    existing.evidence=Array.isArray(existing.evidence)?existing.evidence:[];
    if(evidence&&!existing.evidence.includes(evidence))existing.evidence.unshift(evidence);
    existing.evidence=existing.evidence.slice(0,6);
    existing.vector=normalizeLessonVector(Object.fromEntries(INSTITUTIONAL_LESSON_KEYS.map(k=>[k,(existing.vector?.[k]||0)*.92+incoming[k]*.28])));
    lesson=existing;
  }else{
    lesson={id:company.nextLessonId++,key,title,department,vector:incoming,outcome,state:state||(episodeKey?"provisional":"hypothesis"),episodeKeys:episodeKey?[episodeKey]:[],confidence:clamp(confidence,0,100),evidence:evidence?[evidence]:[],createdDay:company.day,lastDay:company.day,reinforcements:1,importance,successEvidence:outcome==="positive"?1:0,failureEvidence:outcome==="negative"?1:0,sampleCount:1,effectEstimate:outcome==="negative"?-magnitude:magnitude,variance:1};
    company.lessons.unshift(lesson);
    company.lessons=company.lessons.slice(0,36);
  }
  recordLearningEvidence({domain:"institutional",eventType:key,action:key,outcome,magnitude:lesson.effectEstimate||0,confidence:lesson.confidence,department,evidence,context:{episodeKey:episodeKey||key},contributors:[{type:"institutionalLesson",id:key,weight:.7},{type:"department",id:department,weight:.3}]});
  const dept=company.departmentLearning[department]||company.departmentLearning.company,stateWeight=lessonStateWeight(lesson);
  for(const [k,v] of Object.entries(lesson.vector))dept[k]=clamp((dept[k]||0)+v*.16*stateWeight,-10,10);
  employees.filter(e=>e.active).forEach(e=>applyInstitutionalLessonToEmployee(e,lesson,existing?0.55:1));
  if(!existing||lesson.state==="validated"&&company.day-(lesson.lastHistoryDay||-999)>90){recordHistory(`Institutional lesson: ${lesson.title}`,"learning",Math.max(3,importance));lesson.lastHistoryDay=company.day;}
  return lesson;
}
function createPatternLearningEpisode({key,title,department="company",domain="institutional",evidence="",expectedChannels=null,importance=3}={}){
  ensureBibleSystems();
  const sourceId=`pattern-${key}`;
  const existing=(company.learningEpisodes||[]).find(ep=>ep.sourceId===sourceId&&ep.status!=="resolved"&&company.day-(ep.createdDay||0)<95);
  if(existing)return existing;
  return createLearningEpisode({
    domain,
    subtype:`pattern.${key}`,
    sourceId,
    decisionTitle:title,
    choiceTitle:title,
    strategy:key,
    department,
    baseline:companyLearningBaseline(),
    expectedChannels:expectedChannels||expectedChannelsForEpisode(domain,key,title),
    attributionSources:[sourceId],
    attributionQuality:48,
    reviewSchedule:[company.day+10,company.day+30,company.day+75],
    hypotheses:[{strategy:key,expected:evidence||"Pattern will be reviewed before becoming an institutional lesson."}],
    protectedChannel:false
  });
}
function inheritInstitutionalLearning(e){
  ensureInstitutionalLearning();
  const dept=employeeTeam(e),deptLearning=company.departmentLearning[dept]||emptyLessonVector();
  const recent=company.lessons.slice(0,8);
  const companyAvg=emptyLessonVector();
  for(const lesson of recent)for(const [k,v] of Object.entries(lesson.vector||{}))companyAvg[k]+=v/Math.max(1,recent.length);
  e.learnedLessons=emptyLessonVector();
  for(const k of INSTITUTIONAL_LESSON_KEYS)e.learnedLessons[k]=clamp((deptLearning[k]||0)*.35+(companyAvg[k]||0)*.18,-6,6);
  e.lessonAcceptance=null;lessonAcceptanceFor(e);e.joinedDay=company.day;
  if(recent[0])addMemory(e,"ONBOARDING_LESSON",`During onboarding I learned: ${recent[0].title}`,"neutral",5,"company");
}
function institutionalUtilityBias(e){
  // State is normalized on reset/load, employee creation, and daily close.
  // Do not normalize the entire company inside every employee utility score.
  const l=e?.learnedLessons||emptyLessonVector();
  return{
    work:l.planning*.9+l.innovation*.55+l.riskTaking*.45+l.workloadBalancing*.22,
    lab:l.testing*1.35+l.documentation*.3-l.riskTaking*.15+l.earlyQA*.18,
    break:l.recovery*1.2+l.burnoutRecovery*.45,
    collaborate:l.collaboration*1.15+l.mentoring*.9+l.helpSeeking*.25+l.crossDepartmentCoordination*.22,
    meeting:l.escalation*.85+l.planning*.45+l.documentation*.55+l.performanceManagement*.12,
    complain:-l.escalation*.18-l.retention*.08
  };
}
function validateLearningBehavior(){
  const probe={
    learnedLessons:emptyLessonVector(),
    stress:78,energy:48,focus:58,morale:55,
    traits:["cautious"],opinionOfCEO:{trust:60},
    role:"Software QA Engineer",active:true
  };
  const baseline=institutionalUtilityBias(probe);
  probe.learnedLessons.helpSeeking=8;
  probe.learnedLessons.recovery=8;
  probe.learnedLessons.testing=8;
  const learned=institutionalUtilityBias(probe);
  const checks={
    helpSeekingRaisesCollaboration:learned.collaborate>baseline.collaborate,
    recoveryRaisesBreak:learned.break>baseline.break,
    testingRaisesLab:learned.lab>baseline.lab
  };
  return {checkedDay:company?.day||0,checks,ok:Object.values(checks).every(Boolean)};
}
function validateLearningCoverage(){
  const all=[...new Set([...INSTITUTIONAL_LESSON_KEYS,...PROJECT_LESSON_KEYS,...Object.keys(company.workforceLessons||{})])];
  const missing=all.filter(k=>!LEARNING_COVERAGE[k]||!(LEARNING_COVERAGE[k].producers||[]).length||!(LEARNING_COVERAGE[k].consumers||[]).length);
  const behavior=validateLearningBehavior();
  return {checkedDay:company?.day||0,total:all.length,missing,behavior,ok:missing.length===0&&behavior.ok,registry:LEARNING_COVERAGE};
}
function runV32InstitutionalLearningAudit(){
  const coverage=validateLearningCoverage();
  const deptMissing=DEPARTMENTS.filter(d=>!company.departmentLearning?.[d]);
  const projectMissing=PROJECT_LESSON_KEYS.filter(k=>{
    const v=company.projectLessons?.[k];
    return !v||typeof v!=="object"||!("score" in v)||!("confidence" in v)||!("sampleCount" in v)||!("effectEstimate" in v);
  });
  const employeeAcceptanceOk=employees.every(e=>Number.isFinite(Number(e.baseLessonAcceptance))&&Number.isFinite(Number(e.dynamicLessonAcceptance)));
  const checks=[
    {name:"Learning coverage",ok:coverage.ok,detail:coverage.ok?`${coverage.total} key(s) covered`:`Missing ${coverage.missing.join(", ")}`},
    {name:"Department registry",ok:deptMissing.length===0,detail:deptMissing.length?`Missing ${deptMissing.join(", ")}`:"All active departments initialized"},
    {name:"Typed project lessons",ok:projectMissing.length===0,detail:projectMissing.length?`Missing ${projectMissing.join(", ")}`:`${PROJECT_LESSON_KEYS.length} project key(s) normalized`},
    {name:"Dynamic lesson acceptance",ok:employeeAcceptanceOk,detail:employeeAcceptanceOk?"Base and trust-sensitive acceptance present":"One or more employees need acceptance migration"},
    {name:"Structured evidence",ok:Array.isArray(company.learningEvidence),detail:Array.isArray(company.learningEvidence)?`${company.learningEvidence.length} evidence record(s)`:"Evidence store missing"},
    {name:"Runtime indexes",ok:true,detail:"Runtime indexes rebuild during play and are excluded from save data"}
  ];
  return {checkedDay:company.day,ok:checks.every(c=>c.ok),checks};
}
function decayInstitutionalLessons(){
  ensureInstitutionalLearning();
  for(const lesson of company.lessons){
    const age=Math.max(0,company.day-(lesson.lastDay??company.day));
    if(age<90)continue;
    const factor=age>720?.82:age>360?.9:.96;
    lesson.confidence=clamp((lesson.confidence||0)*factor,0,100);
    lesson.vector=normalizeLessonVector(Object.fromEntries(INSTITUTIONAL_LESSON_KEYS.map(k=>[k,(lesson.vector?.[k]||0)*factor])));
  }
  for(const dept of DEPARTMENTS){
    const d=company.departmentLearning?.[dept];if(!d)continue;
    for(const k of Object.keys(d))d[k]=clamp(d[k]*.992,-10,10);
  }
}
function learnFromDecision(ev,d){
  if(typeof reconcileHiringRequestDecision==="function")reconcileHiringRequestDecision(ev,d);
  const title=d.title||ev.title||"CEO decision";
  const strategy=d.strategy||d.directive||d.launch||d.performance||d.action||d.policyMode||"balanced";
  const dept=ev.department||ev.category||d.department||"company";
  createDecisionLearningEpisode(ev,d,{title,strategy,department:DEPARTMENTS.includes(dept)?dept:"company"});
}
function createDecisionLearningEpisode(ev,d,meta={}){
  const title=meta.title||d.title||ev.title||"CEO decision";
  const strategy=meta.strategy||d.strategy||d.directive||d.launch||d.performance||d.action||d.policyMode||"balanced";
  const projectId=d.projectDecision?.id||d.commercializeProject?.id||d.projectId||ev.projectId||ev.projectDecision?.id||null;
  const baseline=companyLearningBaseline();
  if(projectId){
    const p=[...(company.projects||[]),...(company.projectProposals||[]),...(company.projectArchive||[])].find(x=>x.id===projectId);
    if(p){baseline.projectRisk=Number(p.performance?.riskTrend??p.visibleRisk??50);baseline.scheduleVariance=Number(p.performance?.scheduleVariance||0);baseline.projectProgress=Number(p.progress||0);}
  }
  createLearningEpisode({domain:"decision",sourceId:ev.id||ev.type||title,decisionId:ev.decisionId||ev.id||nextSimulationId("decision"),decisionTitle:ev.title||title,choiceTitle:title,strategy,department:meta.department||"company",projectId,baseline,expectedChannels:expectedChannelsForEpisode("decision",strategy,title),attributionSources:[ev.id,projectId,ev.sourceMessageId].filter(Boolean),attributionQuality:projectId?68:58,reviewSchedule:[company.day+7,company.day+21,company.day+60],hypotheses:[{strategy,expected:"Decision outcome will be reviewed after the company reacts."}]});
}
function reviewInstitutionalPatterns(){
  ensureInstitutionalLearning();
  if(company.day-company.lastLessonReviewDay<30)return;
  company.lastLessonReviewDay=company.day;
  decayInstitutionalLessons();
  const recent=(company.learningEvidence||[]).filter(e=>company.day-(e.day||0)<=120),byType=t=>recent.filter(e=>e.domain===t||e.eventType===t||String(e.eventType||"").includes(t)).length;
  if(byType("quality")>=3||byType("earlyQA")>=2)createPatternLearningEpisode({key:"quality",title:"Repeated quality evidence suggests early verification may prevent expensive rework.",department:"quality",evidence:"Structured quality evidence requires delayed review.",importance:5,expectedChannels:{quality:{direction:1,weight:.28},portfolioHealth:{direction:1,weight:.20},risk:{direction:-1,weight:.18},cash:{direction:-1,weight:.08}}});
  if(byType("burnout")>=2||byType("retention")>=2)createPatternLearningEpisode({key:"sustainability",title:"Sustained pressure may increase absence, burnout, and talent loss.",department:"people",domain:"workforce",evidence:"Structured people-risk evidence requires delayed review.",importance:5,expectedChannels:{stress:{direction:-1,weight:.30},morale:{direction:1,weight:.22},risk:{direction:-1,weight:.18},portfolioHealth:{direction:1,weight:.12}}});
  if(byType("collaboration")>=3||byType("crossDepartmentCoordination")>=2)createPatternLearningEpisode({key:"collaboration",title:"Useful collaboration may reduce blockers and spread expertise.",department:"company",domain:"communication",evidence:"Structured collaboration evidence requires delayed review.",importance:4,expectedChannels:{integration:{direction:1,weight:.22},portfolioHealth:{direction:1,weight:.18},quality:{direction:1,weight:.12},stress:{direction:-1,weight:.10}}});
  if(byType("runway")>=2||byType("hiringTiming")>=2)createPatternLearningEpisode({key:"runway",title:"Healthy reserves may preserve strategic options during uncertain periods.",department:"finance",domain:"investor-relations",evidence:"Structured finance evidence requires delayed review.",importance:5,expectedChannels:{cash:{direction:1,weight:.30},risk:{direction:-1,weight:.18},board:{direction:1,weight:.12},portfolioHealth:{direction:1,weight:.10}}});
}
function institutionalLessonsHtml(){
  ensureInstitutionalLearning();
  const lessons=company.lessons.filter(l=>(Number(l.confidence)||0)>=58||Math.abs(Object.values(l.vector||{}).reduce((m,v)=>Math.max(m,Math.abs(Number(v)||0)),0))>=.45).slice(0,5);
  if(!lessons.length)return "";
  return `<div class="lesson-card"><strong>Company Lessons</strong><small>Organizational habits that are strong enough to affect future behavior.</small></div>`+
    lessons.map(l=>{const confidence=typeof qualitativeBand==="function"?qualitativeBand(l.confidence,{low:45,high:75,lowText:"early",midText:"credible",highText:"strong"}):`${Math.round(l.confidence)}%`;return `<div class="lesson-card"><strong>${l.title}</strong><small>${String(l.department).replace(/\b\w/g,c=>c.toUpperCase())} - ${confidence} support - reinforced ${l.reinforcements||1} ${(l.reinforcements||1)===1?"time":"times"}</small><div class="lesson-tags">${Object.entries(l.vector||{}).filter(([,v])=>Math.abs(v)>=.3).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,4).map(([k,v])=>`<span class="lesson-tag">${k.replace(/([A-Z])/g," $1")} ${v>0?"+":""}${Number(v).toFixed(1)}</span>`).join("")}</div></div>`}).join("");
}
function learningValidationHtml(){
  ensureInstitutionalLearning();
  const coverage=company.learningCoverage||validateLearningCoverage();
  const audit=company.learningAudit||runV32InstitutionalLearningAudit();
  const projectTop=Object.entries(company.projectLessons||{}).filter(([,v])=>Math.abs(v.score||0)>.1).sort((a,b)=>Math.abs(b[1].score||0)-Math.abs(a[1].score||0)).slice(0,3);
  return `Learning coverage ${coverage.ok?"OK":coverage.missing.length+" missing"}; evidence ${(company.learningEvidence||[]).length} record(s).<br>`+
    `V32 Learning Audit: ${audit.ok?"Passed":"Needs review"} - ${audit.checks.map(c=>`${c.name}: ${c.ok?"OK":"Check"}`).join("; ")}<br>`+
    (projectTop.length?`Project learning: ${projectTop.map(([k,v])=>`${k.replace(/([A-Z])/g," $1")}: ${Number(v.score||0).toFixed(1)} (${Math.round(v.confidence||0)}%)`).join("; ")}`:"Project learning: no strong typed project lessons yet.");
}

function ensureBibleSystems(){
  if(!company)return;
  company.history=Array.isArray(company.history)?company.history:[];
  company.systemErrors=Array.isArray(company.systemErrors)?company.systemErrors:[];
  company.lastSimulationError=company.lastSimulationError||null;
  company.lastDailyCloseStatus=company.lastDailyCloseStatus||null;
  company.dailyStageStatus=Array.isArray(company.dailyStageStatus)?company.dailyStageStatus:[];
  company.crisisLearningEpisodes=Array.isArray(company.crisisLearningEpisodes)?company.crisisLearningEpisodes:[];
  company.nextCrisisId=Math.max(1,Number(company.nextCrisisId)||1);
  company.nextCrisisLearningEpisodeId=Math.max(1,Number(company.nextCrisisLearningEpisodeId)||1);
  company.failureOwner=company.failureOwner||null;
  company.failureCode=company.failureCode||null;
  if(typeof normalizeCrisisState==="function")normalizeCrisisState();
  company.learningEpisodes=Array.isArray(company.learningEpisodes)?company.learningEpisodes:[];
  company.learningEpisodes.forEach(episode=>{episode.ownerSystem=AI_SYSTEM_OWNERS.institutional;});
  company.nextLearningEpisodeId=Math.max(1,Number(company.nextLearningEpisodeId)||1);
  company.actionOutcomes=Array.isArray(company.actionOutcomes)?company.actionOutcomes:[];
  company.actionOutcomes.forEach(outcome=>{outcome.ownerSystem=outcome.ownerSystem||AI_SYSTEM_OWNERS.work;});
  ensureSocialAISystems?.();
  company.communicationOutcomes=Array.isArray(company.communicationOutcomes)?company.communicationOutcomes:[];
  company.investorRelationsForecasts=Array.isArray(company.investorRelationsForecasts)?company.investorRelationsForecasts:[];
  company.lastInvestorUpdateDay=Number.isFinite(company.lastInvestorUpdateDay)?company.lastInvestorUpdateDay:-999;
  company.delayedDecisionEffects=Array.isArray(company.delayedDecisionEffects)?company.delayedDecisionEffects:[];
  company.decisionHistory=Array.isArray(company.decisionHistory)?company.decisionHistory:[];
  company.decisionThreads=Array.isArray(company.decisionThreads)?company.decisionThreads:[];
  company.decisionThreads.forEach(t=>{t.audit={reaction:false,operational:false,major:false,legacy:false,...(t.audit||{})};t.phaseDueDays={reaction:(t.createdDay??company.day)+2,operational:(t.createdDay??company.day)+7,major:(t.createdDay??company.day)+21,legacy:(t.createdDay??company.day)+38,...(t.phaseDueDays||{})};t.followUps=Array.isArray(t.followUps)?t.followUps:[];t.state=t.state||"Pending";});
  company.nextDecisionThreadId=Math.max(1,Number(company.nextDecisionThreadId)||1);
  company.messageThreads=Array.isArray(company.messageThreads)?company.messageThreads:[];
  company.nextMessageThreadId=Math.max(1,Number(company.nextMessageThreadId)||1);
  company.messageFingerprints=company.messageFingerprints&&typeof company.messageFingerprints==="object"?company.messageFingerprints:{};
  company.messageQualityHistory=Array.isArray(company.messageQualityHistory)?company.messageQualityHistory:[];
  company.senderCredibilityHistory=Array.isArray(company.senderCredibilityHistory)?company.senderCredibilityHistory:[];
  company.executiveReputations=company.executiveReputations&&typeof company.executiveReputations==="object"?company.executiveReputations:{};
company.workItems=Array.isArray(company.workItems)?company.workItems:[];
company.issueRecords=Array.isArray(company.issueRecords)?company.issueRecords:[];
company.departmentObjectives=company.departmentObjectives&&typeof company.departmentObjectives==="object"?company.departmentObjectives:{};
company.informationSources=company.informationSources&&typeof company.informationSources==="object"?company.informationSources:{};
company.nextWorkItemId=Number(company.nextWorkItemId)||1;
company.nextIssueId=Number(company.nextIssueId)||1;
company.nextStoryId=Number(company.nextStoryId)||1;
company.storyChains=Array.isArray(company.storyChains)?company.storyChains:[];
company.playtest={sessions:0,notes:[],lastChecklistDay:-999,...(company.playtest||{})};
  company.culture={innovation:55,workLife:55,communication:55,riskTolerance:50,qualityDiscipline:58,politics:25,...(company.culture||{})};
  company.market={aiDemand:52,hardwareDemand:50,supplyPressure:32,capitalClimate:55,competitorHeat:45,lastSnapshot:"Offline baseline",...(company.market||{})};
  company.manufacturing={readiness:18,yield:52,capacity:20,supplyRisk:company.market.supplyPressure||32,...(company.manufacturing||{})};
  company.shareholders={confidence:Math.round(company.board||72),patience:65,pressure:28,...(company.shareholders||{})};
company.customerSentiment=typeof company.customerSentiment==="number"?company.customerSentiment:clamp((company.trust||65)-3,0,100);
ensureCustomerMarketSystems?.();
  company.riskPillars={financial:0,productDelivery:0,customerMarket:0,workforce:0,operations:0,governance:0,strategic:0,...(company.riskPillars||{})};
  company.departmentFriction=typeof normalizeDepartmentFriction==="function"?normalizeDepartmentFriction(company.departmentFriction):(company.departmentFriction||{});
  company.backgroundEvents=Array.isArray(company.backgroundEvents)?company.backgroundEvents:[];
  company.executiveObservations=Array.isArray(company.executiveObservations)?company.executiveObservations:[];
  company.nextBackgroundEventId=Math.max(1,Number(company.nextBackgroundEventId)||1);
  company.lastFrictionUpdateDay=Number.isFinite(company.lastFrictionUpdateDay)?company.lastFrictionUpdateDay:-999;
  company.lastRiskPillarUpdateDay=Number.isFinite(company.lastRiskPillarUpdateDay)?company.lastRiskPillarUpdateDay:-999;
  company.localFrictionResponses=Array.isArray(company.localFrictionResponses)?company.localFrictionResponses:[];
  company.managerDetections=Array.isArray(company.managerDetections)?company.managerDetections:[];
  company.inboxFlow={day:company.day||0,openedToday:0,lastOpenedDay:-999,...(company.inboxFlow||{})};
  company.teams={
    hardware:{cohesion:58,pressure:35,output:0},software:{cohesion:58,pressure:32,output:0},
    quality:{cohesion:58,pressure:34,output:0},product:{cohesion:56,pressure:30,output:0},finance:{cohesion:60,pressure:24,output:0},
    people:{cohesion:60,pressure:24,output:0},
    ...(company.teams||{})
  };
  for(const [k,v] of Object.entries(company.teams))company.teams[k]={cohesion:58,pressure:30,output:0,backlog:0,blockedWork:0,defectRisk:35,knowledgeCoverage:68,staffingGap:0,currentPriority:"delivery",...v};
  company.worldSnapshot=company.worldSnapshot||{mode:"offline",summary:"Offline fictional market model",day:company.day||0};
  ensureProjectPortfolio();
  ensureMarketValuationSystems();
  ensureInstitutionalLearning();
  ensureLeadershipSystems?.();
  ensureWorkforceEconomySystems?.();
}
function defaultDepartmentObjectives(){return{
  engineering:{quality:.35,technicalProgress:.30,workload:.20,innovation:.15},
  product:{customers:.30,schedule:.25,trust:.25,scope:.20},
  finance:{runway:.40,revenue:.25,valuation:.20,risk:.15},
  board:{valuation:.30,confidence:.25,growth:.25,reputation:.20}
};}
function defaultInformationSources(){return{
  personalTesting:{reliability:.9,delay:0,scope:"technical",bias:0},
  teamMeeting:{reliability:.72,delay:1,scope:"team",bias:.04},
  officeRumor:{reliability:.35,delay:0,scope:"social",bias:.18},
  financeReport:{reliability:.86,delay:1,scope:"finance",bias:.03},
  customerFeedback:{reliability:.68,delay:1,scope:"market",bias:.08},
  boardMemo:{reliability:.78,delay:1,scope:"strategy",bias:.12}
};}
function workItemTypeForTeam(team){return({hardware:"verification",software:"integration",quality:"quality",product:"customer",finance:"runway"})[team]||"coordination";}
const v23Content={
  workTitles:{
    hardware:{verification:["Run thermal verification pass","Validate board bring-up anomalies","Retest sensor noise under load"],architecture:["Resolve accelerator architecture tradeoff","Model next board revision","Reduce power-path uncertainty"],integration:["Clarify chip interface dependency","Align hardware signals with firmware","Stabilize lab handoff package"],quality:["Close hardware rework queue","Audit prototype quality drift"]},
    software:{integration:["Stabilize integration path","Connect firmware telemetry pipeline","Unblock release candidate merge"],firmware:["Harden memory controller workflow","Reduce firmware recovery failures","Tune device boot sequence"],quality:["Reduce software defect backlog","Add regression coverage for pilot build","Investigate intermittent field issue"],blockers:["Resolve cross-team API mismatch"]},
    quality:{quality:["Run verification pass","Audit defect trend","Close rework queue"],verification:["Validate release candidate","Reproduce pilot defect","Review test coverage"],integration:["Check integration readiness","Verify cross-team handoff","Confirm launch criteria"],blockers:["Clarify defect ownership","Request missing test evidence"]},
    product:{customer:["Translate customer feedback","Prepare pilot learning summary","Prioritize requested workflow"],positioning:["Clarify product positioning","Compare competitor claims","Draft customer proof points"],scope:["Control roadmap scope","Trim pilot feature bundle","Rank enterprise commitments"],quality:["Explain quality tradeoffs to customers"]},
    finance:{runway:["Update runway forecast","Model hiring runway impact","Prepare cash sensitivity plan"],supplier:["Analyze supplier exposure","Compare capacity contract options","Review component price risk"],board:["Prepare board operating view","Summarize valuation scenario","Draft investor confidence update"],quality:["Price quality recovery plan"]}
  },
  blockers:["missing specification","unclear owner","waiting on verification data","supplier answer pending","customer priority conflict","prototype instability","budget approval needed","integration environment down"],
  reportSubjects:{"runway-risk":["Runway risk needs a decision","Cash forecast is narrowing","Finance sees a runway squeeze"],"quality-risk":["Quality trend needs attention","Defect risk is rising","Verification confidence is slipping"],"burnout-risk":["Workload pressure is becoming visible","Team capacity is under stress","Burnout risk is climbing"],"supplier-risk":["Supplier exposure could hit delivery","Capacity risk needs review","Manufacturing dependency is tightening"],"market-opportunity":["Market opening may be time-sensitive","Customer demand is moving","Competitor shift creates an opening"],"deadline-risk":["Deadline risk is growing","Work queue may miss target"],"talent-risk":["Talent risk needs leadership visibility","A key employee may be drifting"]},
  opportunitySubjects:["Small experiment could improve delivery","Reusable technique found in current work","Customer learning suggests a new angle","A focused initiative could reduce rework","Team sees a credible product opening"],
  headlines:{risk:["A warning became a leadership decision","Company weighs risk after internal reports","Internal signals shape the week"],opportunity:["Employee initiative creates a new opening","Company finds opportunity inside daily work","Team proposal reaches leadership"],quality:["Quality work becomes the week central story"],people:["People systems shape company momentum"]}
};
function contentPick(list,seed=0){if(!Array.isArray(list)||!list.length)return "";return list[Math.abs(Math.floor((company.day||0)+seed+simulationRandom()*list.length))%list.length];}
function workItemTitle(team,type){
  const group=v23Content.workTitles[team]||{},list=group[type]||group[workItemTypeForTeam(team)]||[team+" "+type+" work"];
  return contentPick(list,team.length+String(type).length);
}
const v25Content={
  employeeThoughts:{
    break:["I need a clearer head before I make this worse.","A short reset is cheaper than a bad decision.","I can feel the pressure changing how I work."],
    socialize:["I want to know what people are not saying in meetings.","The informal channel may explain the real blocker.","A quick conversation might save a formal escalation."],
    collaborate:["This needs more than one specialty.","The fastest path is probably through shared context.","I need someone who sees the system differently."],
    meeting:["This needs alignment before it becomes noise.","If we do not name the tradeoff, it will name itself.","The team needs a decision boundary."],
    complain:["This pressure is starting to distort the work.","I am not sure leadership sees the cost yet.","The plan sounds clean from above and messy from here."],
    home:["I need distance before tomorrow.","The company will still be complicated in the morning.","I am carrying today into tonight."],
    work:["This task is where the real story is hiding.","If I close this cleanly, the team gets options.","The work is small, but the dependency is not."],
    lab:["The lab will tell us what optimism will not.","A failed pass now is better than a failed customer later.","I trust the measurement more than the meeting."]
  },
  rumors:["launch timing","cash runway","supplier confidence","quality risk","a possible customer ask","who is quietly overloaded"],
  newspaperLeads:["Inside the office, the week turned on a chain of small signals.","The company story this week began in ordinary work and ended in leadership attention.","Employees, reports, and tradeoffs shaped the operating rhythm."]
};
function thoughtFor(action,e,ctx){
  const key=action==="lab"?"lab":action==="work"?"work":action;
  const list=v25Content.employeeThoughts[key]||[];
  const picked=contentPick(list,(e.id||0)+(ctx?.deadlineRisk||0));
  if(action==="work"&&ctx?.work)return picked+" "+ctx.work.title+" matters now.";
  if(action==="lab"&&ctx?.work)return picked+" "+ctx.work.title+" needs evidence.";
  return picked||e.thought||roleThought(e);
}
function requiredSkillsForWork(team,type){
  const base={communication:35};
  if(team==="hardware")return {...base,hardware:62,verification:type==="verification"?65:45,architecture:50};
  if(team==="software")return {...base,software:62,firmware:type==="firmware"?65:42,verification:42};
  if(team==="product")return {...base,product:64,communication:68,leadership:42};
  return {...base,finance:66,communication:52,leadership:40};
}
function createStoryChain(kind,subject,source={}){
  ensureBibleSystems();
  company.nextStoryId=Number(company.nextStoryId)||1;
  const chain={id:"story-"+(company.nextStoryId++),kind,subject,startedDay:company.day,lastDay:company.day,status:"active",source,beats:[{day:company.day,text:subject,type:kind}]};
  company.storyChains=[chain,...(company.storyChains||[])].slice(0,80);
  return chain;
}
function addStoryBeat(storyId,text,type="update"){
  const chain=(company.storyChains||[]).find(c=>c.id===storyId);
  if(!chain)return;
  chain.lastDay=company.day;
  chain.beats=[...(chain.beats||[]),{day:company.day,text,type}].slice(-10);
}
function storyForWork(work){
  if(!work)return null;
  let chain=(company.storyChains||[]).find(c=>c.id===work.storyId);
  if(!chain){chain=createStoryChain("work",work.title,{workItemId:work.id,department:work.assignedTeam});work.storyId=chain.id;}
  return chain;
}
function createWorkItem(team,type,priority=50){
  company.nextWorkItemId=Number(company.nextWorkItemId)||1;
  const difficulty=clamp(priority+rand(-10,12),25,92),id="work-"+(company.nextWorkItemId++);
  const deadline=company.day+Math.round(clamp(8+(100-priority)/5+rand(-2,4),4,28));
  const title=workItemTitle(team,type),story=createStoryChain(type==="customer"?"opportunity":"work",title,{department:team,type});
  return {id,title,department:team,type,priority:Math.round(priority),difficulty:Math.round(difficulty),progress:0,qualityRisk:Math.round(clamp(priority*.55+rand(0,24),10,95)),blockedBy:[],requiredSkills:requiredSkillsForWork(team,type),assignedTeam:team,ownerId:null,collaborators:[],deadlineDay:deadline,visibleTo:[team,team==="hardware"?"software":team==="software"?"hardware":"product"],createdDay:company.day,status:"open",stage:"Investigation",storyId:story.id};
}
function desiredWorkPressure(team){
  if(team==="hardware")return Math.max(35,100-company.chip,company.manufacturing?.supplyRisk||0);
  if(team==="software")return Math.max(35,100-company.software,100-company.integration);
  if(team==="quality")return Math.max(35,100-company.quality,company.qualityMistakes||0);
  if(team==="product")return Math.max(30,100-company.customerSentiment,company.phase==="prototype"?45:60-company.customers*.25);
  return Math.max(30,100-company.shareholders?.confidence||45,company.cash<10?78:35);
}
function maintainWorkItems(){
  ensureBibleSystems();
  company.workItems=Array.isArray(company.workItems)?company.workItems:[];
  company.workItems=company.workItems.filter(w=>w.status!=="closed"||company.day-(w.closedDay||company.day)<5).slice(-36);
  activeProjects?.().forEach(project=>{
    for(const dept of project.requiredDepartments||[]){
      const open=company.workItems.filter(w=>w.status==="open"&&w.projectId===project.id&&w.assignedTeam===dept);
      const target=project.status==="pilot"||project.status==="prototype"?1:Math.min(2,Math.max(1,Math.ceil((project.scope||1))));
      while(open.length<target&&company.workItems.length<52){const item=createProjectWorkItem(project,dept);company.workItems.push(item);open.push(item);}
    }
  });
  for(const team of ["hardware","software","quality","product","finance"]){
    const open=company.workItems.filter(w=>w.status==="open"&&w.assignedTeam===team);
    const target=team==="product"?2:3;
    let attempts=0;
    while(open.length<target&&company.workItems.length<52&&attempts<target+2){attempts++;const pressure=desiredWorkPressure(team);const type=company.teams?.[team]?.currentPriority||workItemTypeForTeam(team);const item=createWorkItem(team,type,pressure);company.workItems.push(item);open.push(item);}
  }
  company.workItems.forEach(w=>{if(w.status!=="open")return;w.blockedBy=Array.isArray(w.blockedBy)?w.blockedBy:[];w.collaborators=Array.isArray(w.collaborators)?w.collaborators:[];assignWorkOwner(w);const deadlineSoon=w.deadlineDay-company.day<4;w.qualityRisk=clamp(w.qualityRisk+(deadlineSoon?1.5:.2)+(w.progress<35 ? .25 : 0)-(company.culture.qualityDiscipline-50)*.01,0,100);const stalled=company.day-(w.createdDay??company.day)>2&&w.progress<18;const blockerChance=(w.qualityRisk>72 ? .07 : 0)+(deadlineSoon ? .025 : 0)+(stalled ? .025 : 0);if(!w.blockedBy.length&&simulationRandom()<blockerChance){const blocker=contentPick(v23Content.blockers,w.priority);w.blockedBy.push(blocker);addStoryBeat(w.storyId,`${w.title} became blocked by ${blocker}.`,"blocker");recordWeeklyEvent(`${w.assignedTeam} work blocked: ${w.title}.`,"work",2);}w.stage=workStage(w);if(w.progress>=100){w.status="closed";w.closedDay=company.day;w.stage="Complete";addStoryBeat(w.storyId,`${w.title} was completed by the ${w.assignedTeam} team.`,"completed");recordWeeklyEvent(`${w.title} closed by the ${w.assignedTeam} team.`,"work",2);}});
}
function updateEmployeeWorkContribution(e,output){
  if(!company?.workItems)return;
  const item=activeWorkForEmployee(e);
  if(!item)return;
  const skill=e.skills||{};
  if(item.ownerId==null)item.ownerId=e.id;
  if(!item.collaborators.includes(e.id))item.collaborators.push(e.id);
  const skillFit=Object.entries(item.requiredSkills||{}).reduce((s,[k,v])=>s+Math.min(1,(skill[k]||35)/Math.max(1,v)),0)/Math.max(1,Object.keys(item.requiredSkills||{}).length);
  const blockers=Array.isArray(item.blockedBy)?item.blockedBy:[];
  const blockerPenalty=blockers.length ? .35 : 1;
  const beforeProgress=item.progress||0;
  const project=item.projectId?[...(company.projects||[]),...(company.projectArchive||[])].find(p=>p.id===item.projectId):null;
  const projectPace=project?projectPaceProfile(project).progressMultiplier*projectLateStageDrag(project,project.progress):1;
  const lateItemDrag=item.progress>=75?clamp(1-(item.progress-75)/25*.25,.70,1):1;
  item.progress=clamp(item.progress+output*(7+skillFit*8.5)*blockerPenalty*projectPace*lateItemDrag,0,100);
  if(item.projectId&&item.progress!==beforeProgress)recordProjectLedger(item.projectId,"employee-work","work-progress",item.progress-beforeProgress,`${e.name} worked on ${item.title}`);
  if(blockers.length){
    const resolveChance=clamp(output*(skillFit+.4)*.55+(e.activeCollaboration?.workItemId===item.id ? .08 : 0),.01,.32);
    if(simulationRandom()<resolveChance){
      const blocker=blockers.shift();
      item.blockedBy=blockers;
      item.qualityRisk=clamp(item.qualityRisk-4,0,100);
      addStoryBeat(item.storyId,`${e.name} helped resolve ${blocker} on ${item.title}.`,"unblocked");
      recordWeeklyEvent(`${item.title} was unblocked by ${e.name}.`,"work",1);
      if(item.projectId)recordProjectLedger(item.projectId,"employee-work","blocker",-1,`${e.name} resolved ${blocker}`);
    }
  }
  item.qualityRisk=clamp(item.qualityRisk-output*(skillFit>.8?3:1.2)+(e.stress>75 ? .05 : 0),0,100);
  item.stage=workStage(item);
}
function updateTeamOperationalState(){
  ensureBibleSystems();
  for(const team of Object.keys(company.teams)){
    const items=(company.workItems||[]).filter(w=>w.status==="open"&&w.assignedTeam===team);
    const t=company.teams[team];
    t.backlog=items.length;
    t.blockedWork=items.filter(w=>(w.blockedBy||[]).length).length;
    t.defectRisk=clamp(items.reduce((s,w)=>s+w.qualityRisk,0)/Math.max(1,items.length),0,100);
    t.staffingGap=employees.filter(e=>e.active&&employeeTeam(e)===team).length?0:1;
    t.knowledgeCoverage=clamp((t.cohesion||55)*.45+(t.output||50)*.35+(100-t.blockedWork*12)*.2,0,100);
    t.currentPriority=t.defectRisk>65?"quality":t.blockedWork>1?"blockers":team==="finance"?"runway":workItemTypeForTeam(team);
  }
}
function beliefAccessForRole(e,key){
  const team=employeeTeam(e);
  if(key==="cashRisk")return e.role==="Finance Analyst"?.9:team==="product"?.45:.25;
  const role=canonicalRole(e.role);
  if(key==="qualityRisk")return ["Software QA Engineer","Chip Architect"].includes(role)?.9:team==="software"?.65:.42;
  if(key==="launchReadiness")return ["Product Manager","Technical Lead","Chip Architect"].includes(role)?.78:.48;
  if(key==="customerDemand")return e.role==="Product Manager"?.88:e.role==="Finance Analyst"?.58:.38;
  return .5;
}
function updateBelief(e,key,trueValue,source){
  const access=beliefAccessForRole(e,key),prev=e.beliefs?.[key]||{estimate:trueValue,confidence:25,lastUpdatedDay:company.day,source};
  const noisy=clamp(trueValue+rand(-18,18)*(1-access),0,100);
  const confidence=clamp(prev.confidence*.55+access*100*.45,5,95);
  e.beliefs={...(e.beliefs||{}),[key]:{estimate:Math.round(prev.estimate*.45+noisy*.55),confidence:Math.round(confidence),lastUpdatedDay:company.day,source}};
}
function updateEmployeeBeliefsAndBriefing(e){
  if(!e.active)return;
  const team=employeeTeam(e),t=company.teams[team]||{};
  updateBelief(e,"launchReadiness",(company.chip+company.software+company.integration+company.quality)/4,"team meeting");
  updateBelief(e,"cashRisk",clamp(100-company.cash*7,0,100),e.role==="Finance Analyst"?"finance report":"office rumor");
  updateBelief(e,"qualityRisk",Math.max(t.defectRisk||0,100-company.quality),canonicalRole(e.role)==="Software QA Engineer"?"personal testing":"team meeting");
  updateBelief(e,"customerDemand",clamp(company.customerSentiment||company.trust,0,100),e.role==="Product Manager"?"customer feedback":"team meeting");
  const assigned=(company.workItems||[]).filter(w=>w.status==="open"&&(w.ownerId===e.id||w.visibleTo.includes(team))).sort((a,b)=>b.priority-a.priority).slice(0,3);
  e.dailyBriefing={day:company.day,assignedWork:assigned.map(w=>w.id),knownBlockers:assigned.flatMap(w=>w.blockedBy||[]).slice(0,4),teamPressure:Math.round(t.pressure||0),observedQualityRisk:Math.round(e.beliefs.qualityRisk?.estimate||0),customerPriorityKnown:beliefAccessForRole(e,"customerDemand")>.55,cashConcernKnown:beliefAccessForRole(e,"cashRisk")>.55,messages:assigned.slice(0,2).map(w=>({from:team,subject:w.title,reliability:.72,contentCode:w.type})),rumors:(company.cash<8?[{contentCode:"RUNWAY_CONCERN",reliability:.35}]:[])};
  e.currentIntention=assigned[0]?{goal:`advance ${assigned[0].type}`,workItemId:assigned[0].id,steps:["inspect","coordinate","execute","verify"],createdDay:company.day}:null;
}
function createIssueRecord(type,severity,urgency,confidence,strategicImpact,sourceDepartments,evidence,source={}){
  company.nextIssueId=Number(company.nextIssueId)||1;
  const novelty=100-Math.min(80,(company.issueRecords||[]).filter(i=>i.type===type).length*18);
  const escalationScore=severity*.30+urgency*.20+strategicImpact*.30+confidence*.10+novelty*.10;
  const route=escalationScore>=70?"ceo-decision":escalationScore>=55?"executive-info":escalationScore>=35?"company-log":"local";
  const relatedWork=source.workItem||null,story=relatedWork?storyForWork(relatedWork):createStoryChain(type,type.replace(/-/g," "),{issueType:type,departments:sourceDepartments});
  addStoryBeat(story.id,type.replace(/-/g," ")+" detected with "+Math.round(confidence)+"% confidence.","issue");
  return {id:"issue-"+(company.nextIssueId++),type,severity:Math.round(severity),urgency:Math.round(urgency),confidence:Math.round(confidence),novelty:Math.round(novelty),strategicImpact:Math.round(strategicImpact),sourceDepartments,evidence,createdDay:company.day,status:route,storyId:story.id,workItemId:relatedWork?.id||null};
}
function detectCompanyIssues(){
  const issues=[];
  if(company.cash<9)issues.push(createIssueRecord("runway-risk",clamp(100-company.cash*8,0,100),78,86,82,["finance"],[`Cash is $${company.cash.toFixed(1)}M`,"Runway is below the finance comfort threshold"]));
  if(company.quality<42||Object.values(company.teams||{}).some(t=>t.defectRisk>68))issues.push(createIssueRecord("quality-risk",Math.max(100-company.quality,70),62,78,76,["hardware","software"],[`Company quality is ${Math.round(company.quality)}`,"Team defect risk is elevated"]));
  if(avgStress()>72)issues.push(createIssueRecord("burnout-risk",avgStress(),66,72,64,["people"],[`Average stress is ${Math.round(avgStress())}`,"Sustained stress is affecting output"]));
  if(company.manufacturing?.supplyRisk>72)issues.push(createIssueRecord("supplier-risk",company.manufacturing.supplyRisk,64,76,72,["hardware","finance"],[`Supply risk is ${Math.round(company.manufacturing.supplyRisk)}`,"Manufacturing plans may slip"]));
  if(company.market?.competitorHeat>68)issues.push(createIssueRecord("market-opportunity",company.market.competitorHeat,48,62,66,["product"],["Competitor pressure is creating positioning urgency"]));
  const deadline=(company.workItems||[]).filter(w=>w.status==="open"&&company.day-(w.createdDay??company.day)>=2&&w.deadlineDay-company.day<=3&&w.progress<70).sort((a,b)=>b.priority-a.priority)[0];
  if(deadline)issues.push(createIssueRecord("deadline-risk",clamp(80-deadline.progress*.4+deadline.priority*.35,45,96),70,72,68,[deadline.assignedTeam],[`${deadline.title}: ${workStatusLabel(deadline)}`,`Deadline is day ${deadline.deadlineDay+1}`],{workItem:deadline}));
  const talent=employees.filter(e=>e.active&&(e.morale<42||e.stress>82)).sort((a,b)=>(b.stress-b.morale)-(a.stress-a.morale))[0];
  if(talent)issues.push(createIssueRecord("talent-risk",clamp(talent.stress+(55-talent.morale),35,94),58,66,61,[employeeTeam(talent)],[`${talent.name} morale ${Math.round(talent.morale)}`,`${talent.name} stress ${Math.round(talent.stress)}`]));
  return issues;
}
function updateIssueRecords(){
  company.issueRecords=Array.isArray(company.issueRecords)?company.issueRecords:[];
  const existing=new Set(company.issueRecords.filter(i=>company.day-i.createdDay<5).map(i=>i.type));
  detectCompanyIssues().forEach(issue=>{if(!existing.has(issue.type))company.issueRecords.unshift(issue);});
  company.issueRecords=company.issueRecords.slice(0,60);
}
function communicationState(e){
  e.communication={reportsMade:0,reportsSuppressed:0,helpRequests:0,lastReportDay:-999,lastHelpRequestDay:-999,rumorsShared:0,...(e.communication||{})};
  e.knownMessages=Array.isArray(e.knownMessages)?e.knownMessages:[];
  return e.communication;
}
function messageStatKey(type){return {"help-request":"helpRequests","status-report":"statusReports","risk-report":"riskReports","opportunity-proposal":"opportunityReports","suppressed-report":"suppressedReports",rumor:"rumors"}[type]||"statusReports";}
function rememberMessage(e,msg){
  if(!e)return;
  communicationState(e);
  const summary={id:msg.id,type:msg.type,subject:msg.subject,fromId:msg.fromId,day:msg.createdDay,reliability:msg.reliability,confidence:msg.confidence};
  e.knownMessages=[summary,...e.knownMessages.filter(m=>m.id!==msg.id)].slice(0,24);
  if(e.dailyBriefing){
    e.dailyBriefing.messages=[{from:msg.fromName||"employee",subject:msg.subject,reliability:msg.reliability,contentCode:msg.contentCode},...(e.dailyBriefing.messages||[])].slice(0,6);
  }
}
function createEmployeeMessage({type,from,toIds=[],department,subject,contentCode,severity=35,urgency=30,confidence=55,reliability=.65,workItem=null,issue=null,status="open",evidence=[]}){
  ensureBibleSystems();
  company.nextMessageId=Number(company.nextMessageId)||1;
  const sender=typeof from==="object"?from:employees.find(e=>e.id===from);
  const storyId=issue?.storyId||workItem?.storyId||null;
  const msg={id:`msg-${company.nextMessageId++}`,type,fromId:sender?.id??null,fromName:sender?.name||"System",toIds:[...new Set(toIds)],department:department||employeeTeam(sender||{}),subject,contentCode,severity:Math.round(severity),urgency:Math.round(urgency),confidence:Math.round(confidence),reliability,createdDay:company.day,workItemId:workItem?.id||null,issueId:issue?.id||null,storyId,status,evidence:evidence.slice(0,4)};
  if(storyId)addStoryBeat(storyId,`${sender?.name||"System"} created ${type.replace(/-/g," ")}: ${subject}.`,"message");
  company.employeeMessages=[msg,...(company.employeeMessages||[]).filter(m=>m.id!==msg.id)].slice(0,140);
  company.communicationStats={helpRequests:0,statusReports:0,riskReports:0,opportunityReports:0,suppressedReports:0,rumors:0,...(company.communicationStats||{})};
  const key=messageStatKey(type);company.communicationStats[key]=(company.communicationStats[key]||0)+1;
  if(status!=="suppressed"){
    rememberMessage(sender,msg);
    msg.toIds.forEach(id=>rememberMessage(employees.find(e=>e.id===id),msg));
  }
  return msg;
}
function communicationContextKey(e,msgOrIssue,type="report"){
  const code=msgOrIssue?.contentCode||msgOrIssue?.type||"general";
  const severity=(msgOrIssue?.severity||0)>70?"highSeverity":"normalSeverity";
  const confidence=(msgOrIssue?.confidence||0)>70?"highConfidence":"uncertain";
  return `${employeeTeam(e)}|${code}|${severity}|${confidence}|${type}`;
}
function updateCommunicationLearning(e,type,outcome,msgOrIssue){
  if(!e)return;
  const key=communicationContextKey(e,msgOrIssue,type);
  ensureBibleSystems();
  company.communicationOutcomes=Array.isArray(company.communicationOutcomes)?company.communicationOutcomes:[];
  const severity=Number(msgOrIssue?.severity||msgOrIssue?.issue?.severity||0),confidence=Number(msgOrIssue?.confidence||msgOrIssue?.issue?.confidence||50);
  const strategicImpact=Number(msgOrIssue?.issue?.strategicImpact||msgOrIssue?.strategicImpact||0);
  const predictedSeverity=clamp(severity*.72+strategicImpact*.28,0,100);
  const links={issueId:msgOrIssue?.issueId||msgOrIssue?.issue?.id||null,workItemId:msgOrIssue?.workItemId||((msgOrIssue?.id&&String(msgOrIssue.type||"").includes("work"))?msgOrIssue.id:null),projectId:msgOrIssue?.projectId||msgOrIssue?.issue?.projectId||null,customerExperienceId:msgOrIssue?.customerExperienceId||null,decisionThreadId:null,messageId:msgOrIssue?.id||null};
  const severityBand=predictedSeverity>=75?"high":predictedSeverity>=50?"medium":"low";
  company.communicationOutcomes.unshift({reportId:msgOrIssue?.id||nextSimulationId("communication-outcome"),day:company.day,employeeId:e.id,type,outcome,contextKey:key,messageId:msgOrIssue?.id||null,links,issueFingerprint:{issueType:msgOrIssue?.type||msgOrIssue?.contentCode||msgOrIssue?.issue?.type||"general",projectId:links.projectId,department:employeeTeam(e),workItemId:links.workItemId,customerSegment:msgOrIssue?.customerSegmentId||null,severityBand},issueType:msgOrIssue?.type||msgOrIssue?.contentCode||msgOrIssue?.issue?.type||"general",predictedSeverity,senderConfidence:confidence,observedMateriality:null,materiality:predictedSeverity,materialized:null,severityError:null,timingQuality:null,evidenceQuality:null,duplicate:null,independentConfirmation:null,usefulToDecision:null,reviewedDay:null,confidence});
  company.communicationOutcomes=company.communicationOutcomes.slice(0,260);
  if(type==="report"){
    createLearningEpisode({domain:"communication",sourceId:msgOrIssue?.id||key,messageId:msgOrIssue?.id||null,choiceTitle:`${type}: ${outcome}`,strategy:outcome,department:employeeTeam(e),employeeIds:[e.id],attributionSources:Object.values(links).filter(Boolean),attributionQuality:Object.values(links).some(Boolean)?62:42,reviewSchedule:[company.day+5,company.day+15,company.day+35],hypotheses:[{predictedSeverity,expected:"Report usefulness will be judged after impact is visible."}]});
  }else if(type==="suppress"){
    createLearningEpisode({domain:"communication",sourceId:msgOrIssue?.id||key,choiceTitle:`suppression: ${outcome}`,strategy:"suppress",department:employeeTeam(e),employeeIds:[e.id],attributionSources:Object.values(links).filter(Boolean),attributionQuality:Object.values(links).some(Boolean)?60:40,reviewSchedule:[company.day+5,company.day+15,company.day+35],hypotheses:[{predictedSeverity,expected:"Suppression will be judged by whether the issue mattered later."}]});
    if(outcome==="high-risk")adjustLearningTrait(e,"politicalSuppression",-.08,-5,10);
  }else if(type==="help"){
    adjustLearningTrait(e,"helpSeeking",outcome==="sent"?.06:-.04,-5,10);adjustContextualPreference(e,"collaborate",key,outcome==="sent"?.05:-.04);
  }else if(type==="initiative"){
    adjustLearningTrait(e,"initiative",outcome==="sent"?.08:-.03,-5,10);adjustContextualPreference(e,"meeting",key,outcome==="sent"?.05:-.03);
  }
}
function issueRoleFit(e,issue){
  const team=employeeTeam(e),sources=issue.sourceDepartments||[];
  if(sources.includes(team))return 24;
  if(issue.type==="runway-risk"&&e.role==="Finance Analyst")return 32;
  if(issue.type==="quality-risk"&&["Software QA Engineer","Chip Architect"].includes(canonicalRole(e.role)))return 28;
  if(issue.type==="market-opportunity"&&e.role==="Product Manager")return 26;
  if(issue.type==="supplier-risk"&&["Chip Architect","Finance Analyst"].includes(e.role))return 22;
  return 0;
}
function reportWillingness(e,severity,confidence){
  const ceo=e.opinionOfCEO||{},culture=company.culture||{};
  const traitBoost=(e.traits||[]).includes("loyal")?8:(e.traits||[]).includes("ambitious")?5:(e.traits||[]).includes("skeptical")?-3:0;
  const learning=learningState(e);
  return clamp(severity*.34+confidence*.28+(ceo.trust||58)*.16+(culture.communication||50)*.22+traitBoost+learning.reporting*2.2+learning.protectedEscalation*1.5-learning.politicalSuppression*2.6-learning.noiseFiltering*.8-(ceo.fear||0)*.26-(culture.politics||25)*.24,0,100);
}
function maybeSuppressReport(e,issue,severity,confidence){
  const willing=reportWillingness(e,severity,confidence);
  if(willing>52||severity>88)return false;
  const c=communicationState(e);
  c.reportsSuppressed++;
  updateCommunicationLearning(e,"suppress",severity>70?"high-risk":"low-risk",issue);
  createEmployeeMessage({type:"suppressed-report",from:e,toIds:[],department:employeeTeam(e),subject:`Unsent concern: ${issue.type.replace(/-/g," ")}`,contentCode:issue.type,severity,urgency:issue.urgency||45,confidence,reliability:.25,issue,status:"suppressed",evidence:issue.evidence||[]});
  addMemory(e,"SUPPRESSED_REPORT",`I kept quiet about ${issue.type.replace(/-/g," ")}.`,"negative",5);
  return true;
}
function maybeCreateHelpRequest(e,ctx){
  const c=communicationState(e);
  if(company.day-c.lastHelpRequestDay<2||!ctx.work)return;
  const blockers=Array.isArray(ctx.work.blockedBy)?ctx.work.blockedBy:[];
  const workAge=company.day-(ctx.work.createdDay??company.day);
  const reason=blockers.length?"blocker":ctx.skillFit<.62?"skill gap":ctx.deadlineRisk>72&&workAge>=2?"deadline risk":ctx.uncertainty>75&&workAge>=1?"unclear requirements":"";
  const helpOdds=clamp(.45+(learningState(e).helpSeeking||0)*.035,0.18,0.78);
  if(!reason||simulationRandom()>helpOdds)return;
  const target=availableCollaborator(e);
  if(!target)return;
  c.lastHelpRequestDay=company.day;c.helpRequests++;updateCommunicationLearning(e,"help","sent",ctx.work);
  const subject=blockers.length?`Help needed on ${ctx.work.title}`:`Peer review requested on ${ctx.work.title}`;
  const evidence=[workStatusLabel(ctx.work),`Reason: ${reason}`,`${Math.round(ctx.skillFit*100)} skill fit`];
  createEmployeeMessage({type:"help-request",from:e,toIds:[target.id],department:ctx.team,subject,contentCode:ctx.work.type,severity:Math.max(ctx.deadlineRisk,ctx.blockerRisk,45),urgency:Math.max(ctx.deadlineRisk,ctx.blockerRisk),confidence:Math.round(70-ctx.uncertainty*.25),reliability:.76,workItem:ctx.work,evidence});
  addMemory(e,"HELP_REQUEST",`I asked ${target.name} for help on ${ctx.work.title}.`,"positive",5,target.name);
  addMemory(target,"HELP_REQUEST",`${e.name} asked me for help on ${ctx.work.title}.`,"neutral",4,e.name);
}
function maybeCreateStatusReport(e,ctx){
  const c=communicationState(e);
  if(company.day-c.lastReportDay<3||!ctx.work)return;
  const notable=ctx.work.progress>65||ctx.deadlineRisk>70||(ctx.work.blockedBy||[]).length>0;
  if(!notable||simulationRandom()>.38)return;
  c.lastReportDay=company.day;c.reportsMade++;updateCommunicationLearning(e,"report","local",ctx.work);
  company.teamReports=[{day:company.day,employeeId:e.id,team:ctx.team,workItemId:ctx.work.id,progress:Math.round(ctx.work.progress),risk:Math.round(Math.max(ctx.deadlineRisk,ctx.work.qualityRisk||0))},...(company.teamReports||[])].slice(0,80);
  createEmployeeMessage({type:"status-report",from:e,toIds:employees.filter(x=>x.active&&employeeTeam(x)===ctx.team&&x.id!==e.id).map(x=>x.id),department:ctx.team,subject:`Status: ${ctx.work.title}`,contentCode:ctx.work.type,severity:Math.max(ctx.work.qualityRisk||0,ctx.deadlineRisk),urgency:ctx.deadlineRisk,confidence:76,reliability:.78,workItem:ctx.work,evidence:[workStatusLabel(ctx.work),`Deadline day ${ctx.work.deadlineDay+1}`]});
}
function maybeCreateRiskReport(e){
  const c=communicationState(e);
  if(company.day-c.lastReportDay<2)return;
  const issue=(company.issueRecords||[]).filter(i=>company.day-i.createdDay<4).map(i=>({issue:i,score:i.severity*.45+i.urgency*.25+i.confidence*.15+issueRoleFit(e,i)})).sort((a,b)=>b.score-a.score)[0]?.issue;
  if(!issue)return;
  const confidence=clamp((issue.confidence||50)+issueRoleFit(e,issue)*.6,0,98),severity=issue.severity||50;
  if(severity<55&&confidence<60)return;
  if(maybeSuppressReport(e,issue,severity,confidence))return;
  const l=learningState(e);
  const reportOdds=clamp(.5+(l.reporting||0)*.035+(l.protectedEscalation||0)*.02-(l.noiseFiltering||0)*.012-(l.politicalSuppression||0)*.03,.2,.82);
  if(simulationRandom()>reportOdds)return;
  c.lastReportDay=company.day;c.reportsMade++;updateCommunicationLearning(e,"report","local",issue);
  const recipients=employees.filter(x=>x.active&&x.id!==e.id&&(employeeTeam(x)===employeeTeam(e)||issue.sourceDepartments?.includes(employeeTeam(x)))).map(x=>x.id).slice(0,4);
  createEmployeeMessage({type:"risk-report",from:e,toIds:recipients,department:employeeTeam(e),subject:contentPick(v23Content.reportSubjects[issue.type]||[`Risk observed: ${issue.type.replace(/-/g," ")}`],severity),contentCode:issue.type,severity,urgency:issue.urgency||50,confidence,reliability:confidence/100,issue,evidence:issue.evidence||[]});
}
function maybeCreateOpportunityProposal(e,ctx){
  const c=communicationState(e);
  if(company.day-c.lastReportDay<4)return;
  const inventive=((e.traits||[]).includes("creative")?18:0)+((e.traits||[]).includes("ambitious")?12:0)+(e.goals?.recognition||0)*18+(company.culture?.innovation||50)*.35+(ctx.skillFit||.5)*18;
  const healthy=e.morale>58&&e.stress<78&&company.cash>4;
  const initiativeOdds=clamp(.28+(learningState(e).initiative||0)*.03,.1,.64);
  if(!healthy||inventive<66||simulationRandom()>initiativeOdds)return;
  c.lastReportDay=company.day;c.reportsMade++;updateCommunicationLearning(e,"initiative","sent",ctx.work||{contentCode:"initiative",severity:42,confidence:60});
  const subject=ctx.work?contentPick(v23Content.opportunitySubjects,ctx.work.priority):"Proposal for a focused company experiment";
  createEmployeeMessage({type:"opportunity-proposal",from:e,toIds:employees.filter(x=>x.active&&["Product Manager","Technical Lead","Chip Architect","Finance Analyst"].includes(canonicalRole(x.role))&&x.id!==e.id).map(x=>x.id).slice(0,3),department:ctx.team,subject,contentCode:ctx.work?.type||"initiative",severity:42,urgency:34,confidence:clamp(58+inventive*.25,45,88),reliability:.64,workItem:ctx.work,evidence:["Employee sees a useful opening",`Innovation culture ${Math.round(company.culture?.innovation||50)}`]});
  addMemory(e,"OPPORTUNITY_PROPOSAL",`I proposed a new initiative.`,"positive",6);
}
function maybeShareRumor(e){
  const c=communicationState(e);
  if(company.day-c.lastReportDay<1||company.day-c.rumorsShared<2)return;
  const cash=e.beliefs?.cashRisk,quality=e.beliefs?.qualityRisk;
  const concern=[cash&&{key:"cash-risk",belief:cash},quality&&{key:"quality-risk",belief:quality}].filter(Boolean).filter(x=>x.belief.estimate>58&&x.belief.confidence<58)[0];
  if(!concern||simulationRandom()>.32)return;
  const target=socialTarget(e);
  if(!target)return;
  c.rumorsShared=company.day;
  createEmployeeMessage({type:"rumor",from:e,toIds:[target.id],department:employeeTeam(e),subject:`Rumor about ${contentPick(v25Content.rumors,e.id).replace(/-/g," ")}`,contentCode:concern.key,severity:concern.belief.estimate,urgency:35,confidence:concern.belief.confidence,reliability:.35,evidence:[`Belief estimate ${Math.round(concern.belief.estimate)}`,`Confidence ${Math.round(concern.belief.confidence)}`]});
  addMemory(e,"RUMOR",`I compared notes with ${target.name}.`,"neutral",3,target.name);
  addMemory(target,"RUMOR",`${e.name} shared uncertain information with me.`,"neutral",3,e.name);
}
function generateEmployeeCommunications(){
  ensureBibleSystems();
  employees.filter(e=>e.active&&!e.offsite).forEach(e=>{
    const ctx=workContext(e);
    maybeCreateHelpRequest(e,ctx);
    maybeCreateRiskReport(e);
    maybeCreateOpportunityProposal(e,ctx);
    maybeCreateStatusReport(e,ctx);
    maybeShareRumor(e);
  });
  company.employeeMessages=(company.employeeMessages||[]).slice(0,140);
  company.teamReports=(company.teamReports||[]).slice(0,80);
}
function messageIssue(msg){return (company.issueRecords||[]).find(i=>i.id===msg.issueId)||null;}
function messageWorkItem(msg){const direct=(company.workItems||[]).find(w=>w.id===msg.workItemId);if(direct)return direct;const issue=messageIssue(msg);return issue?.workItemId?(company.workItems||[]).find(w=>w.id===issue.workItemId)||null:null;}
function messageStrategicImpact(msg){
  const issue=messageIssue(msg),work=messageWorkItem(msg);
  if(issue?.strategicImpact)return issue.strategicImpact;
  if(msg.type==="risk-report")return Math.max(62,msg.severity||0);
  if(msg.type==="opportunity-proposal")return 58+(company.market?.aiDemand||50)*.12+(company.culture?.innovation||50)*.12;
  if(msg.type==="help-request"&&work)return (work.priority||45)*.55+(msg.severity||0)*.35;
  if(msg.type==="status-report"&&work)return (work.priority||40)*.45+(work.qualityRisk||0)*.25;
  return 35;
}
function escalationScoreForMessage(msg){
  if(["rumor","suppressed-report"].includes(msg.type))return 0;
  if(msg.status&&!["open","manager-reviewed"].includes(msg.status))return 0;
  if(msg.protectedDirect)return 98;
  if(msg.type==="help-request"&&(msg.severity||0)<82)return 0;
  const novelty=100-Math.min(75,(company.employeeMessages||[]).filter(m=>m.id!==msg.id&&m.contentCode===msg.contentCode&&company.day-(m.createdDay||0)<7).length*18);
  return (msg.severity||0)*.28+(msg.urgency||0)*.20+(msg.confidence||0)*.12+((msg.reliability||.5)*100)*.10+messageStrategicImpact(msg)*.24+novelty*.06;
}
function routeForEscalationScore(score){return score>=78?"ceo-decision":score>=62?"executive-info":"local";}
function departmentRecommendationSet(msg){
  const code=msg.contentCode||"general",dept=msg.department||"general";
  if(code.includes("runway")||code.includes("cash"))return [["Finance","Protect runway before flexibility narrows",84],["Product","Avoid damaging customer delivery",64],["Board","Show a credible operating plan",76]];
  if(code.includes("quality")||code.includes("verification")||code.includes("supplier"))return [["Engineering","Stabilize quality before scaling",82],["Product","Limit exposure while preserving customer learning",68],["Finance","Spend only where risk is measurable",61]];
  if(msg.type==="opportunity-proposal"||code.includes("market")||code.includes("initiative"))return [[dept[0]?.toUpperCase()+dept.slice(1),"Sponsor a small validated experiment",76],["Finance","Cap the spend and require a short review",66],["Board","Favor visible learning without distraction",62]];
  return [[dept[0]?.toUpperCase()+dept.slice(1),"Address the issue at the right operating level",72],["Finance","Watch cash and workload impact",61],["Leadership","Clarify priority and ownership",68]];
}
function choicesForEscalatedMessage(msg){
  const code=msg.contentCode||"general";
  if(code.includes("runway")||code.includes("cash"))return [
    {title:"Tighten operating spend",detail:"Extend runway but raise internal pressure.",effect:{cash:1.8,board:2,trust:-1},directive:"cuts",days:7,people:{stress:4,morale:-3},opinion:{competence:2,support:-2,fear:2}},
    {title:"Open a funding plan",detail:"Signal confidence and reduce near-term fear.",effect:{cash:3.5,board:1,trust:1},directive:null,days:0,people:{stress:-1,morale:1},opinion:{competence:2,trust:1}},
    {title:"Push revenue experiments",detail:"Focus the company on customer conversion.",effect:{cash:.8,customers:4,board:2},directive:"revenue",days:7,people:{stress:3,morale:-1},opinion:{competence:1}}
  ];
  if(code.includes("quality")||code.includes("verification")||code.includes("supplier"))return [
    {title:"Authorize a quality pause",detail:"Give teams room to reduce risk.",effect:{quality:5,integration:-1,board:-1,trust:3},directive:"quality",days:8,people:{stress:-3,morale:3},opinion:{trust:2,support:2}},
    {title:"Approve targeted support",detail:"Spend cash on the narrow bottleneck.",effect:{cash:-.8,quality:3,integration:2,board:1},directive:"people",days:6,people:{stress:-2,morale:3},opinion:{competence:2,support:2}},
    {title:"Keep schedule discipline",detail:"Accept some risk to preserve momentum.",effect:{board:2,integration:3,quality:-1},directive:"speed",days:5,people:{stress:4,morale:-2},opinion:{fear:1,competence:1}}
  ];
  if(msg.type==="opportunity-proposal"||code.includes("market")||code.includes("initiative"))return [
    {title:"Sponsor a small experiment",detail:"Give the idea limited budget and visibility.",effect:{cash:-.5,quality:1,integration:2,valuation:1},directive:"people",days:6,people:{stress:-1,morale:4},culture:{innovation:3,communication:2},opinion:{support:3,competence:1}},
    {title:"Ask for a tighter case",detail:"Encourage initiative without disrupting delivery.",effect:{integration:1,board:1},directive:"quality",days:4,people:{morale:1},culture:{communication:2},opinion:{fairness:1}},
    {title:"Decline for focus",detail:"Protect the current plan and avoid distraction.",effect:{board:1},directive:"revenue",days:4,people:{stress:1,morale:-2},culture:{innovation:-1},opinion:{support:-2}}
  ];
  return [
    {title:"Clarify priority",detail:"Make the operating priority explicit.",effect:{integration:2,trust:1},directive:"quality",days:5,people:{stress:-1,morale:1},culture:{communication:2},opinion:{competence:1}},
    {title:"Assign local ownership",detail:"Keep the issue below CEO level after setting expectations.",effect:{quality:1},directive:"people",days:5,people:{morale:2},opinion:{support:1}},
    {title:"Hold the current course",detail:"Avoid disruption and continue monitoring.",effect:{board:1},directive:null,days:0,people:{stress:1},opinion:{competence:-1}}
  ];
}
function communicationForEscalatedMessage(msg,route){
  const origin=employees.find(e=>e.id===msg.fromId)||{name:msg.fromName||"Employee",role:msg.department||"Team"};
  const directText=String(`${msg.contentCode||""} ${msg.subject||""} ${msg.type||""}`).toLowerCase();
  const failedAttempts=(company.employeeMessages||[]).filter(m=>m.id!==msg.id&&m.fromId===msg.fromId&&m.contentCode===msg.contentCode&&["closed","suppressed"].includes(m.status)&&company.day-(m.createdDay||0)<=14).length;
  const directException=msg.protectedDirect===true||msg.severity>=96||/safety|legal|ethic|whistle|retaliation|protected|harassment|fraud/.test(directText)||failedAttempts>=2||((company.leadership?.transparency||0)>78&&(msg.severity||0)>88);
  const manager=directException?origin:reportManagerFor(msg.department||employeeTeam(origin));
  const sender={name:manager.name,role:manager.role};
  const issue=messageIssue(msg),work=messageWorkItem(msg),evidence=[...(msg.evidence||[])];
  if(issue?.evidence)evidence.push(...issue.evidence);
  if(work)evidence.push(`${work.title}: ${workStatusLabel(work)} with ${qualitativeBand(work.qualityRisk||0,{low:35,high:70,lowText:"contained",midText:"visible",highText:"high"})} quality risk`);
  const chain=(company.storyChains||[]).find(c=>c.id===msg.storyId);
  if(chain?.beats?.length)evidence.push(`Story so far: ${chain.beats.slice(-3).map(b=>b.text).join(" -> ")}`);
  const score=Math.round(escalationScoreForMessage(msg));
  const review=msg.managerReview||{};
  const routeText=route==="ceo-decision"?"The remaining options affect policy, budget, staffing, or company commitments, so the issue now needs CEO judgment.":"No CEO action is required right now; the issue has been logged for executive awareness.";
  const reviewText=review.action?`Manager review noted ${review.reason}. `:"";
  const message=`${directException?origin.name+" used a protected direct channel.":origin.name+" first raised this with "+sender.name+" before executive routing."} ${reviewText}${msg.managerInterpretation?`${msg.managerInterpretation} `:""}${routeText}`;
  return {type:route==="ceo-decision"?"Escalated Decision Memo":"Executive Information Memo",priority:route==="ceo-decision"?"Decision Needed":"FYI",sender,subject:msg.subject,message,originEmployeeIds:[origin.id].filter(x=>x!==undefined),chainOfCommand:[`${origin.name} created the original ${String(msg.type||"report").replace(/-/g," ")}.`,directException?"Protected channel allowed direct CEO visibility.":`${sender.name}, ${sender.role}, reviewed and reframed the concern.`,route==="ceo-decision"?"The remaining options require CEO authority.":"The issue was archived as executive information."],recs:departmentRecommendationSet(msg),impacts:evidence.slice(0,5),signature:`Regards,
${sender.name}
${sender.role}`};
}
function managerReviewMessage(msg,score){
  const origin=employees.find(e=>e.id===msg.fromId);
  const manager=reportManagerFor(msg.department||employeeTeam(origin||{}));
  const politics=company.culture?.politics||25,transparency=company.leadership?.transparency||55,leadership=manager.role&&employees.find(e=>e.name===manager.name)?.skills?.leadership||55;
  let action="validated",adjust=0,reason="evidence appears material enough to preserve";
  const duplicates=(company.employeeMessages||[]).filter(m=>m.id!==msg.id&&m.contentCode===msg.contentCode&&["open","manager-reviewed"].includes(m.status)&&company.day-(m.createdDay||0)<=4);
  if(duplicates.length){action="merged duplicate reports";adjust=4;reason=`${duplicates.length} similar report(s) described the same condition`;msg.mergedReportIds=duplicates.map(m=>m.id).slice(0,5);duplicates.forEach(m=>{m.status="closed";m.managerReview={day:company.day,managerName:manager.name,managerRole:manager.role,action:"merged into another report",reason:`Merged into ${msg.id}`};});}
  if(msg.confidence<42&&msg.severity<72){action="lowered urgency";adjust=-8;reason="evidence was weak or incomplete";}
  if(msg.severity>86||score>78){action="raised urgency";adjust=8;reason="risk appears strategically material";}
  if(politics>62&&transparency<45&&msg.severity<90){action="delayed";adjust=-12;reason="management is cautious about escalating incomplete bad news";}
  if(msg.type==="help-request"&&msg.severity<88){action="handled locally";adjust=-30;reason="ordinary workload help should remain below CEO level";}
  if(politics>72&&transparency<42&&msg.severity<84&&msg.confidence<76){action="suppressed";adjust=-40;reason="management chose not to elevate a politically sensitive weak signal";}
  msg.evidence=Array.isArray(msg.evidence)?msg.evidence:[];
  if(action==="raised urgency")msg.evidence.unshift(`Manager added evidence: ${manager.name} judged the issue strategically material.`);
  if(action==="lowered urgency")msg.evidence.unshift(`Manager challenged evidence: confidence remained low after review.`);
  if(action==="merged duplicate reports")msg.evidence.unshift(`Manager merged ${duplicates.length} similar report(s) into this escalation.`);
  if(action==="delayed")msg.evidence.unshift(`Manager delayed escalation pending clearer evidence.`);
  msg.managerInterpretation=`${manager.name} reframed the diagnosis as ${reason}.`;
  msg.managerReview={day:company.day,managerId:employees.find(e=>e.name===manager.name)?.id??null,managerName:manager.name,managerRole:manager.role,action,reason,leadership,transparency,politics};
  if(action==="suppressed"){
    company.suppressionRecords=Array.isArray(company.suppressionRecords)?company.suppressionRecords:[];
    const record={id:nextSimulationId("suppression"),day:company.day,sourceMessageId:msg.id,contentCode:msg.contentCode,department:msg.department,managerName:manager.name,managerRole:manager.role,reason,evidence:[...(msg.evidence||[])].slice(0,4),discoveredDay:null};
    company.suppressionRecords.unshift(record);
    company.suppressionRecords=company.suppressionRecords.slice(0,80);
    msg.status=msg.severity>=78||/ethic|legal|safety|whistle|retaliation/.test(String(msg.contentCode||"").toLowerCase())?"manager-reviewed":"suppressed";
    if(msg.status==="manager-reviewed"){msg.protectedDirect=true;msg.evidence.unshift("Suppression record preserved and routed through a protected channel.");}
  }else msg.status=action==="handled locally"?"closed":"manager-reviewed";
  msg.urgency=clamp((msg.urgency||0)+adjust,0,100);
  msg.confidence=clamp((msg.confidence||0)+(action==="validated"?4:action==="raised urgency"?3:0),0,100);
  return msg;
}
function makeEscalatedEvent(msg){
  company.nextEscalationId=Number(company.nextEscalationId)||1;
  const comm=communicationForEscalatedMessage(msg,"ceo-decision"),id=`internal-${company.nextEscalationId++}-${msg.id}`;
  addStoryBeat(msg.storyId,`CEO memo queued: ${comm.subject}.`,"memo");
  return {id,repeatable:false,category:"internal",sourceMessageId:msg.id,storyId:msg.storyId,title:comm.subject,copy:comm.message,generatedCommunication:comm,choices:choicesForEscalatedMessage(msg)};
}
function reviewSuppressionAccountability(msg){
  company.suppressionRecords=Array.isArray(company.suppressionRecords)?company.suppressionRecords:[];
  const matches=company.suppressionRecords.filter(r=>!r.discoveredDay&&r.contentCode===msg.contentCode&&company.day-(r.day||0)<=30);
  matches.forEach(r=>{
    r.discoveredDay=company.day;
    r.outcome=`A later report on ${msg.subject} reached executive review after earlier suppression.`;
    const cred=ensureSenderCredibility(r.managerName,r.department||"company");
    cred.estimateAccuracy=clamp((cred.estimateAccuracy||55)-2,0,100);
    cred.recommendationAccuracy=clamp((cred.recommendationAccuracy||55)-2,0,100);
    cred.evidenceQuality=clamp((cred.evidenceQuality||58)-1,0,100);
    cred.lastUpdatedDay=company.day;
    recordSenderCredibilityHistory(r.managerName,r.department||"company","suppressed report later resurfaced",cred);
    recordHistory(`A previously suppressed report resurfaced: ${msg.subject}.`,"communication",2);
  });
}
function updateInformationalSenderCredibility(msg,comm){
  const dept=msg.department||memoDepartmentFor({id:`info-${msg.id}`,category:"company"},comm);
  const cred=ensureSenderCredibility(comm.from,dept);
  const confidence=Number(msg.confidence)||50,severity=Number(msg.severity)||50,hasEvidence=(msg.evidence||comm.impacts||[]).length>=2;
  cred.evidenceQuality=clamp((cred.evidenceQuality||58)+(hasEvidence?1:-1)+(confidence>70?.6:confidence<40?-.8:0),0,100);
  cred.estimateAccuracy=clamp((cred.estimateAccuracy||55)+(severity>70&&confidence>60?.4:0),0,100);
  cred.lastUpdatedDay=company.day;
  recordSenderCredibilityHistory(comm.from,dept,"informational memo evidence quality",cred);
}
function archiveInformationalEscalation(msg){
  const comm=communicationForEscalatedMessage(msg,"executive-info");
  reviewSuppressionAccountability(msg);
  queueInformationalCommunication(comm,{id:`info-${msg.id}`,category:"internal",sourceMessageId:msg.id,storyId:msg.storyId,title:msg.subject,copy:comm.message});
  msg.status="queued-executive-info";
  updateInformationalSenderCredibility(msg,comm);
  updateCommunicationLearning(employees.find(e=>e.id===msg.fromId),"report","executive-info",msg);
  recordHistory(`Executive information queued: ${msg.subject}.`,"communication",2);
}
function repairQueuedEscalationState(){
  const queued=new Set((company.escalationQueue||[]).map(ev=>ev.sourceMessageId).filter(Boolean));
  const pending=company.pendingEvent?.sourceMessageId||null;
  (company.employeeMessages||[]).forEach(msg=>{
    if(msg.status==="queued-for-ceo"&&msg.id!==pending&&!queued.has(msg.id))msg.status="manager-reviewed";
  });
}
function processInternalEscalations(){
  ensureBibleSystems();
  repairQueuedEscalationState();
  const seen=new Set(company.escalatedMessageIds||[]),queued=new Set((company.escalationQueue||[]).map(ev=>ev.sourceMessageId));
  let infoCount=0,decisionCount=0;
  const candidates=(company.employeeMessages||[]).filter(msg=>["open","manager-reviewed"].includes(msg.status)&&!seen.has(msg.id)&&!queued.has(msg.id)&&company.day-(msg.createdDay||0)<=5).map(msg=>{const initial=escalationScoreForMessage(msg);if(!msg.managerReview)managerReviewMessage(msg,initial);return {msg,score:escalationScoreForMessage(msg)};}).sort((a,b)=>b.score-a.score);
  for(const item of candidates){
    const route=routeForEscalationScore(item.score);
    if(route==="local"){recordMetricEvent("localIssues");continue;}
    if(route==="executive-info"&&infoCount<1&&company.day>0){archiveInformationalEscalation(item.msg);seen.add(item.msg.id);infoCount++;}
    else if(route==="ceo-decision"&&decisionCount<1&&canQueueExecutiveDecision?.(item)){reviewSuppressionAccountability(item.msg);item.msg.status="queued-for-ceo";updateCommunicationLearning(employees.find(e=>e.id===item.msg.fromId),"report","ceo-decision",item.msg);recordMetricEvent("queuedEscalations");company.escalationQueue.push(makeEscalatedEvent(item.msg));seen.add(item.msg.id);decisionCount++;}
  }
  company.escalatedMessageIds=[...seen].slice(-160);
  company.escalationQueue=(company.escalationQueue||[]).slice(0,3);
}
function updateCompanyInformationSystem(){
  ensureBibleSystems();
  updateProjectPortfolioSystem();
  maintainWorkItems();
  updateTeamOperationalState();
  employees.forEach(updateEmployeeBeliefsAndBriefing);
  updateIssueRecords();
  generateEmployeeCommunications();
  processInternalEscalations();
}
function averageTeamCohesion(){ensureBibleSystems();const vals=Object.values(company.teams).map(t=>t.cohesion);return vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.length);}
function updateTeamsFromEmployees(){
  ensureBibleSystems();
  const groups=Object.fromEntries(Object.keys(company.teams).map(team=>[team,[]]));
  employees.filter(e=>e.active).forEach(e=>{
    const team=employeeTeam(e);
    if(!groups[team])groups[team]=[];
    groups[team].push(e);
  });
  for(const [team,list] of Object.entries(groups)){
    const t=company.teams[team]||(company.teams[team]={cohesion:58,pressure:30,output:0,backlog:0,blockedWork:0,defectRisk:35,knowledgeCoverage:68,staffingGap:0,currentPriority:"delivery"});
    const morale=list.reduce((s,e)=>s+e.morale,0)/Math.max(1,list.length);
    const stress=list.reduce((s,e)=>s+e.stress,0)/Math.max(1,list.length);
    const ceoTrust=list.reduce((s,e)=>s+(e.opinionOfCEO?.trust||58),0)/Math.max(1,list.length);
    t.pressure=clamp(stress+(company.directive==="speed"?8:0)+(company.directive==="cuts"?6:0),0,100);
    t.cohesion=clamp(t.cohesion+(morale-60)*.015+(ceoTrust-58)*.01+(company.culture.communication-50)*.012-(t.pressure-55)*.018,0,100);
    t.output=clamp((morale*.35+(100-stress)*.25+t.cohesion*.25+(company.culture.qualityDiscipline||50)*.15),0,100);
  }
}
function updateManufacturingAndStakeholders(){
  ensureBibleSystems();updateTeamsFromEmployees();
  const readiness=(company.chip+company.software+company.integration+company.quality)/4;
  const hardware=company.teams.hardware, finance=company.teams.finance;
  company.manufacturing.readiness=clamp(company.manufacturing.readiness+(readiness-45)*.012+hardware.output*.018-(company.market.supplyPressure-45)*.015,0,100);
  company.manufacturing.yield=clamp(company.manufacturing.yield+(company.quality-50)*.018+hardware.cohesion*.012-(company.market.supplyPressure-50)*.02,5,98);
  company.manufacturing.capacity=clamp(company.manufacturing.capacity+(company.phase==="launched" ? .32 : .08)+finance.output*.006-(company.market.supplyPressure>70 ? .12 : 0),0,100);
  company.manufacturing.supplyRisk=clamp(company.market.supplyPressure+(100-company.manufacturing.yield)*.25,0,100);
  if(company.manufacturing.supplyRisk>82)recordCustomerExperience?.("enterprise","delivery-delay",62,"Delivery reliability is becoming a customer concern.","manufacturing",false);
  // Investor reaction is updated once during the daily valuation stage.
}

class InstitutionalLearningSystem{
  ensure(){return ensureInstitutionalLearning();}
  review(){return reviewLearningEpisodes();}
  reviewPatterns(){return reviewInstitutionalPatterns();}
  validate(){return validateLearningCoverage();}
  html(){return institutionalLessonsHtml();}
}

class CompanyIntelligenceSystem{
  ensure(){return ensureBibleSystems();}
  updateInformation(){return updateCompanyInformationSystem();}
  updateTeams(){return updateTeamsFromEmployees();}
  updateManufacturing(){return updateManufacturingAndStakeholders();}
}
