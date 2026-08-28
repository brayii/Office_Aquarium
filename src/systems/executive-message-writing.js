// Executive message writing, evidence, and rendering helpers.

function qualitativeBand(value,{low=35,high=70,lowText="low",midText="moderate",highText="high"}={}){
  const n=Number(value)||0;
  if(n>=high)return highText;
  if(n<=low)return lowText;
  return midText;
}
function reportEvidencePhrase(msg){
  const severity=qualitativeBand(msg?.severity,{low:45,high:78,lowText:"limited",midText:"material",highText:"serious"});
  const urgency=qualitativeBand(msg?.urgency,{low:40,high:76,lowText:"not immediate",midText:"time-sensitive",highText:"urgent"});
  const confidence=qualitativeBand(msg?.confidence,{low:45,high:75,lowText:"uncertain",midText:"credible",highText:"well-supported"});
  return `${msg?.fromName||"An employee"} raised a ${severity}, ${urgency} ${String(msg?.type||"report").replace(/-/g," ")} that appears ${confidence}.`;
}
function issueEvidencePhrase(issue){
  const severity=qualitativeBand(issue?.severity,{low:45,high:78,lowText:"limited",midText:"material",highText:"serious"});
  const urgency=qualitativeBand(issue?.urgency,{low:40,high:76,lowText:"not immediate",midText:"time-sensitive",highText:"urgent"});
  const impact=qualitativeBand(issue?.strategicImpact,{low:40,high:75,lowText:"mostly local",midText:"cross-functional",highText:"strategic"});
  return `The underlying issue is ${severity}, ${urgency}, and ${impact} in scope.`;
}
function concreteMemoEvidence(ev,comm,dept,msg=null){
  const ctx=ev.decisionContext||decisionContextSnapshot();
  const lines=[];
  const issue=msg?.issueId?(company.issueRecords||[]).find(i=>i.id===msg.issueId):null;
  const work=msg?.workItemId?(company.workItems||[]).find(w=>w.id===msg.workItemId):null;
  if(msg)lines.push(reportEvidencePhrase(msg));
  if(issue){lines.push(issueEvidencePhrase(issue));(issue.evidence||[]).slice(0,2).map(evidenceSentence).filter(Boolean).forEach(x=>lines.push(x));}
  if(work){const blockers=work.blockedBy?.length||0;lines.push(`${work.title} is in ${workStatusLabel(work).toLowerCase()} at about ${Math.round(work.progress||0)}% complete${blockers?`, with ${blockers} blocker${blockers===1?"":"s"}`:", with no formal blockers"}.`);}
  if(ev.hiringRequest){lines.push(`${teamDisplayName(ev.hiringRequest.department||dept)} is asking for ${ev.hiringRequest.role} because the staffing case is ${qualitativeBand(ev.hiringRequest.confidence,{low:45,high:75,lowText:"still developing",midText:"credible",highText:"strong"})}.`);(ev.hiringRequest.reasons||[]).slice(0,2).map(evidenceSentence).filter(Boolean).forEach(x=>lines.push(x));}
  if(ev.projectDecision){const p=[...(company.projects||[]),...(company.projectProposals||[])].find(p=>p.id===ev.projectDecision.id);if(p)lines.push(`${p.title} is about ${Math.round(p.progress||0)}% complete, with ${qualitativeBand(p.performance?.riskTrend||p.visibleRisk,{low:40,high:70,lowText:"limited",midText:"visible",highText:"elevated"})} risk and $${Number(p.budgetSpent||0).toFixed(2)}M already spent.`);}
  if(ev.customerSegmentId){const seg=company.customerSegments?.[ev.customerSegmentId],label=CUSTOMER_SEGMENT_DEFS[ev.customerSegmentId]?.label||"Customer";if(seg)lines.push(`${label} has ${Math.round(seg.activeCustomers||0)} active customer${Math.round(seg.activeCustomers||0)===1?"":"s"}, ${qualitativeBand(seg.sentiment,{low:45,high:72,lowText:"weak",midText:"mixed",highText:"healthy"})} sentiment, and ${qualitativeBand(seg.churnRisk,{low:35,high:68,lowText:"limited",midText:"material",highText:"high"})} churn risk.`);const issue=(seg?.currentIssues||[]).find(i=>!i.resolved);if(issue)lines.push(`${label} issue: ${issue.description}`);}
  if(String(ev.id||"").includes("project")){const h=company.portfolioHealth||{};lines.push(`Portfolio load includes ${h.activeProjects||0} active project${(h.activeProjects||0)===1?"":"s"}, with ${h.atRiskProjects||0} currently at risk and daily project spend near $${Number(h.totalProjectSpendDaily||0).toFixed(3)}M.`);}
  const text=String(ev.id+" "+ev.title+" "+ev.copy+" "+(ev.choices||[]).map(c=>c.title+" "+c.detail).join(" ")).toLowerCase();
  if(dept==="finance"||eventCategory(ev)==="finance"||/cash|runway|fund|salary|hire|layoff|budget|spend|cost/.test(text))lines.push(company.finance?.runwayDays>=OFFICE_AQUARIUM_CONSTANTS.time.unknownFutureDay?`Finance sees current cash flow as positive, but the decision can still change future flexibility.`:`Runway is around ${company.finance?.runwayDays||0} days and daily cash flow is near $${Number(company.finance?.netCashFlowDaily||0).toFixed(3)}M.`);
  if(dept==="people"||eventCategory(ev)==="people"||/hire|staff|burnout|morale|retention|layoff|performance|coach/.test(text))lines.push(`${employees.filter(e=>e.active).length} employees are active, with ${qualitativeBand(avgStress(),{low:45,high:70,lowText:"manageable",midText:"elevated",highText:"high"})} workload pressure and ${employees.filter(e=>e.active&&(e.retentionRisk||0)>60).length} elevated retention case(s).`);
  if(dept==="quality"||eventCategory(ev)==="operations"||/quality|verify|defect|supplier|manufactur|launch|pilot/.test(text))lines.push(`Quality is ${qualitativeBand(company.quality,{low:50,high:75,lowText:"below target",midText:"mixed",highText:"healthy"})}, with ${Math.round(company.simulationMetrics?.counters?.qualityMistakes||0)} unresolved mistake(s) and ${qualitativeBand(company.manufacturing?.supplyRisk,{low:35,high:68,lowText:"limited",midText:"material",highText:"high"})} manufacturing risk.`);
  if(eventCategory(ev)==="customer"||dept==="customer success"||/customer|renewal|churn|support|segment/.test(text))lines.push(`The company has ${Math.round(company.customers||0)} customer${Math.round(company.customers||0)===1?"":"s"}, ${qualitativeBand(company.customerSentiment,{low:45,high:72,lowText:"weak",midText:"mixed",highText:"healthy"})} customer sentiment, and about $${calculateCustomerRevenueDaily().toFixed(3)}M in daily segment revenue.`);
  if(eventCategory(ev)==="board"||/board|shareholder|pip|crisis|strategy/.test(text)){updateCompanyRiskComponents?.();lines.push(`The board sees ${qualitativeBand(ctx.board,{low:45,high:72,lowText:"weak",midText:"mixed",highText:"strong"})} confidence, ${qualitativeBand(ctx.trust,{low:45,high:72,lowText:"fragile",midText:"mixed",highText:"healthy"})} trust, and ${String(company.companyRiskComponents?.label||"Watch").toLowerCase()} company risk.`);}
  const snapshot=buildExecutiveIntelligenceSnapshot();
  const risk=(snapshot.topRisks||[]).find(r=>evidenceSignalIds(`${r.title} ${r.detail}`).some(id=>evidenceSignalIds(text).includes(id)))||snapshot.topRisks?.[0];
  const opportunity=(snapshot.topOpportunities||[]).find(o=>evidenceSignalIds(`${o.title} ${o.detail}`).some(id=>evidenceSignalIds(text).includes(id)));
  if(risk&&lines.length<6)lines.push(`Company intelligence is also watching ${risk.title.toLowerCase()}${risk.detail?`: ${risk.detail}`:""}`.trim());
  if(opportunity&&lines.length<6)lines.push(`A related opportunity is emerging: ${opportunity.title}${opportunity.detail?`; ${opportunity.detail}`:""}`.trim());
  return [...new Set(lines)].filter(Boolean).slice(0,6);
}
function departmentEvidenceIds(dept){
  const map={
    engineering:["quality","project","people"],
    hardware:["quality","project","people"],
    software:["quality","project","people"],
    quality:["quality","project"],
    product:["market","customer","project","quality"],
    finance:["finance","project","governance"],
    people:["people","project"],
    operations:["quality","customer","project"],
    "customer success":["customer","market","quality"],
    board:["governance","finance","project","market"]
  };
  return map[String(dept||"").toLowerCase()]||["finance","people","quality","project","market","customer","governance"];
}
function filterEvidenceForDepartment(evidence,dept,choice=null){
  const allowed=departmentEvidenceIds(dept),choiceIds=choice?choiceEvidenceIds(choice):[];
  return (evidence||[]).filter(line=>{
    const ids=evidenceSignalIds(line);
    return ids.some(id=>allowed.includes(id)||choiceIds.includes(id));
  }).slice(0,3);
}
function recommendationScoreRules(){
  return OFFICE_AQUARIUM_CONSTANTS?.recommendations||{minScore:5,maxScore:95,supportScore:66,opposeScore:42};
}
function clampRecommendationScore(score){
  const rules=recommendationScoreRules();
  return clamp(score,rules.minScore,rules.maxScore);
}
function recommendationPosition(score){
  const rules=recommendationScoreRules();
  return score>=rules.supportScore?"support":score<=rules.opposeScore?"oppose":"cautious";
}
function hiringRequestRecommendationAdjustment(choice,ev,department="company"){
  const request=ev?.hiringRequest;
  if(!request)return 0;
  const text=[request.operationalImpact,request.financeAssessment,...(request.reasons||[]),ev.copy,ev.generatedCommunication?.message].join(" ").toLowerCase();
  const confidence=Number(request.confidence)||55,runway=runwayDaysOrUnknown(company.finance),netFlow=Number(company.finance?.netCashFlowDaily)||0;
  let need=0;
  if(/critical|severe|uncovered|missing|no current|blocked|overload|succession|retention|burnout/.test(text))need+=18;
  if(/material|project|backlog|stress|capacity|skill coverage|healthy staffing/.test(text))need+=10;
  if(/manageable|preventive|monitoring/.test(text))need-=8;
  need+=clamp((confidence-55)*.45,-10,16);
  const cashPressure=(runway<60?22:runway<90?14:runway<120?7:0)+(netFlow<-.12?8:0);
  const isApprove=!!(choice.hire||choice.hireRole),isDelay=!!choice.deferHiring,isReject=!!choice.rejectHiring;
  let adjustment=0;
  if(isApprove)adjustment+=need-cashPressure*.75;
  if(isDelay)adjustment+=cashPressure*.55-need*.35+(confidence<50?8:0);
  if(isReject)adjustment+=cashPressure*.35-need*.65+(confidence<45?10:0);
  const dept=String(department||"").toLowerCase();
  if(isApprove&&dept===request.department)adjustment+=6;
  if(isApprove&&dept==="people")adjustment+=5;
  if(isDelay&&dept==="finance")adjustment+=4;
  if(isReject&&confidence>=62)adjustment-=8;
  return clamp(adjustment,-24,28);
}
function customerStrategyRecommendationAdjustment(choice,ev,department="company"){
  const strategy=choice?.customerStrategy;
  if(!strategy)return 0;
  const segmentId=strategy.segmentId||ev?.customerSegmentId||"enterprise";
  const seg=company.customerSegments?.[segmentId];
  if(!seg)return 0;
  const churn=Number(seg.churnRisk)||0,sentiment=Number(seg.sentiment??company.customerSentiment??50),support=Number(seg.supportSatisfaction??50);
  const issues=(seg.currentIssues||[]).filter(i=>!i.resolved).length,runway=runwayDaysOrUnknown(company.finance);
  const pressure=Math.max(0,churn-45)*.35+Math.max(0,55-sentiment)*.3+Math.max(0,55-support)*.25+issues*4;
  let adjustment=0;
  if(strategy.mode==="recovery")adjustment+=pressure*.85+(churn>65?8:0)-Math.max(0,75-runway)*.08;
  else if(strategy.mode==="support")adjustment+=pressure*.7+Math.max(0,55-support)*.25-Math.max(0,90-runway)*.1;
  else if(strategy.mode==="hold")adjustment+=Math.max(0,runway<75?10:0)+Math.max(0,25-pressure)*.35-pressure*.55;
  const dept=String(department||"").toLowerCase();
  if((strategy.mode==="recovery"||strategy.mode==="support")&&(dept==="customer success"||dept==="product"))adjustment+=4;
  if(strategy.mode==="hold"&&dept==="finance"&&runway<90)adjustment+=5;
  return clamp(adjustment,-24,28);
}
function commercialProjectRecommendationAdjustment(choice,ev,department="company"){
  const decision=choice?.commercializeProject;
  if(!decision)return 0;
  const project=decisionProjectSubject(ev,choice);
  if(!project)return 0;
  const readiness=Number(project.commercialReadiness)||0,potential=Number(project.commercialPotential)||0,revenue=Number(project.projectedDailyRevenue)||0;
  const interest=Number(project.performance?.customerInterest??project.customerInterest??50),risk=Number(project.performance?.riskTrend??project.visibleRisk??50);
  const supportPressure=Math.max(0,avgStress()-65),runway=runwayDaysOrUnknown(company.finance);
  let adjustment=0;
  if(decision.mode==="launch"){
    adjustment+=Math.max(0,readiness-58)*.35+Math.max(0,potential-60)*.25+Math.max(0,interest-55)*.18+Math.min(16,revenue*120);
    adjustment-=Math.max(0,risk-65)*.3+Math.max(0,60-readiness)*.45+supportPressure*.18;
  }else if(decision.mode==="pilot"){
    adjustment+=Math.max(0,potential-48)*.22+Math.max(0,interest-45)*.16+Math.max(0,risk-50)*.18+Math.max(0,72-readiness)*.12;
    adjustment-=Math.max(0,readiness-85)*.12+Math.max(0,45-potential)*.18;
  }else if(decision.mode==="shelve"){
    adjustment+=Math.max(0,52-readiness)*.32+Math.max(0,45-potential)*.28+Math.max(0,risk-76)*.18+Math.max(0,55-runway)*.08;
    adjustment-=Math.max(0,potential-70)*.32+Math.max(0,readiness-70)*.26+Math.min(14,revenue*100);
  }
  const dept=String(department||"").toLowerCase();
  if(decision.mode==="launch"&&(dept==="product"||dept==="finance"))adjustment+=3;
  if(decision.mode==="pilot"&&(dept==="quality"||dept==="engineering"||dept==="hardware"||dept==="software"))adjustment+=4;
  if(decision.mode==="shelve"&&dept==="finance"&&runway<75)adjustment+=4;
  return clamp(adjustment,-26,30);
}
function hiringPolicyRecommendationAdjustment(choice,ev,department="company"){
  const policy=choice?.hiringPolicy;
  if(!policy)return 0;
  const runway=runwayDaysOrUnknown(company.finance),netFlow=Number(company.finance?.netCashFlowDaily)||0;
  const needs=Object.values(company.hiringNeedHistory||{}).filter(h=>(h.lastScore||0)>=75).length;
  const suppressed=(company.hiringRequestHistory||[]).filter(h=>h.status==="suppressed-policy"&&company.day-(h.day||0)<=30).length;
  const missing=Number(company.portfolioHealth?.currentlyMissingStaff??company.projectCapacity?.missingAssignments??0)||0;
  const staffingPressure=needs*6+suppressed*4+missing*8+Math.max(0,avgStress()-62)*.25;
  const financePressure=(runway<60?22:runway<90?14:runway<120?7:0)+(netFlow<-.12?8:0);
  let adjustment=0;
  if(policy.mode==="frozen")adjustment+=financePressure-staffingPressure*.45;
  else if(policy.mode==="critical-only")adjustment+=financePressure*.45+staffingPressure*.35+Math.max(0,needs-1)*2;
  else if(policy.mode==="normal")adjustment+=staffingPressure*.55-financePressure*.55+(runway>120?6:0);
  const dept=String(department||"").toLowerCase();
  if(policy.mode==="frozen"&&dept==="finance")adjustment+=4;
  if(policy.mode==="normal"&&(dept==="people"||dept==="product"))adjustment+=4;
  if(policy.mode==="critical-only"&&dept==="board")adjustment+=3;
  return clamp(adjustment,-24,28);
}
function workforceReductionRecommendationAdjustment(choice,ev,department="company"){
  if(!choice?.layoff&&!choice?.rejectLayoff)return 0;
  const active=employees.filter(e=>e.active);
  const runway=runwayDaysOrUnknown(company.finance),netFlow=Number(company.finance?.netCashFlowDaily)||0;
  const morale=active.reduce((s,e)=>s+(e.morale||50),0)/Math.max(1,active.length);
  const financialPressure=(runway<45?24:runway<75?16:runway<110?8:0)+(netFlow<-.15?10:0);
  const peopleFragility=Math.max(0,55-morale)*.28+Math.max(0,55-(company.trust||50))*.24+Math.max(0,avgStress()-68)*.25;
  let adjustment=0;
  if(choice.layoff?.voluntary)adjustment+=financialPressure*.65-peopleFragility*.35+4;
  else if(choice.layoff)adjustment+=financialPressure-peopleFragility-8;
  else if(choice.rejectLayoff)adjustment+=peopleFragility+Math.max(0,runway-90)*.08-financialPressure;
  const dept=String(department||"").toLowerCase();
  if(choice.layoff&&dept==="finance")adjustment+=5;
  if(choice.rejectLayoff&&dept==="people")adjustment+=5;
  if(choice.layoff?.voluntary&&dept==="people")adjustment+=4;
  return clamp(adjustment,-26,28);
}
function fundraisingRecommendationAdjustment(choice,ev,department="company"){
  if(!choice?.fundraising)return 0;
  const offer=choice.fundraising,mode=String(offer.mode||choice.strategy||"").toLowerCase();
  const runway=runwayDaysOrUnknown(company.finance),confidence=Number(company.marketConfidence??50),appetite=Number(company.investorAppetite??50),quality=Number(company.valuationQuality??50);
  const dilution=Number(offer.dilutionPercent)||0,amount=Number(offer.amount)||0;
  let adjustment=Math.max(0,120-runway)*.12+Math.max(0,appetite-52)*.2+Math.max(0,confidence-50)*.12+Math.max(0,quality-50)*.1;
  adjustment-=Math.max(0,dilution-14)*.45;
  if(mode==="aggressive")adjustment+=Math.max(0,90-runway)*.12+Math.max(0,appetite-65)*.24-Math.max(0,55-quality)*.2-Math.max(0,dilution-20)*.4;
  if(mode==="bridge")adjustment+=Math.max(0,65-runway)*.2-Math.max(0,quality-55)*.12;
  if(mode==="modest")adjustment+=Math.min(8,amount*.8)+Math.max(0,appetite-50)*.1;
  const dept=String(department||"").toLowerCase();
  if(dept==="finance"||dept==="board")adjustment+=4;
  return clamp(adjustment,-20,26);
}
function eventSpecificRecommendationAdjustment(choice,ev,department="company"){
  return customerStrategyRecommendationAdjustment(choice,ev,department)
    +commercialProjectRecommendationAdjustment(choice,ev,department)
    +hiringPolicyRecommendationAdjustment(choice,ev,department)
    +workforceReductionRecommendationAdjustment(choice,ev,department)
    +fundraisingRecommendationAdjustment(choice,ev,department);
}
function institutionalLessonsForChoice(choice,dept){
  const text=String(`${choice?.title||""} ${choice?.detail||""} ${choice?.strategy||""} ${choice?.directive||""}`).toLowerCase();
  const signals=[];
  if(/quality|verify|test|pilot|defect|scope|delay/.test(text))signals.push("testing","earlyQA","documentation","planning");
  if(/hire|staff|people|coach|mentor|support|contractor/.test(text))signals.push("hiringTiming","mentoring","collaboration","retention","workloadBalancing");
  if(/cash|budget|freeze|cut|spend|runway|fund/.test(text))signals.push("planning","hiringTiming","riskTaking","escalation");
  if(/customer|market|launch|growth|revenue|feature|renewal|churn|support/.test(text))signals.push("marketTiming","riskTaking","planning","quality","retention");
  if(/report|escalat|memo|board|disclose|transparency/.test(text))signals.push("escalation","documentation","planning");
  if(!signals.length)return [];
  const stateWeightFor=l=>{
    if(typeof lessonStateWeight==="function")return lessonStateWeight(l);
    const state=l?.state||"prior";
    if(state==="validated")return 1;
    if(state==="provisional")return .20;
    if(state==="prior")return .08;
    if(state==="contradicted")return -.10;
    if(state==="obsolete")return 0;
    return .04;
  };
  return (company.lessons||[]).map(l=>{
    const lessonDept=String(l.department||"company").toLowerCase(),deptKey=String(dept||"company").toLowerCase();
    const vectorScore=Object.entries(l.vector||{}).reduce((s,[k,v])=>s+(signals.includes(k)?Math.abs(Number(v)||0):0),0);
    const deptScore=lessonDept==="company"?1.5:lessonDept===deptKey?3:0;
    const confidenceScore=(Number(l.confidence)||0)/30;
    const recencyScore=clamp(2-((company.day||0)-(l.lastDay||l.createdDay||0))/180,0,2);
    const evidenceScore=Math.min(2,(l.episodeKeys?.length||0)*.35+(l.sampleCount||0)*.25);
    const contradictionPenalty=l.state==="contradicted"?4:l.state==="obsolete"?99:0;
    const relevance=vectorScore*2+deptScore+confidenceScore+recencyScore+evidenceScore-contradictionPenalty;
    return {lesson:l,relevance,vectorScore,stateWeight:stateWeightFor(l)};
  }).filter(x=>x.relevance>=4.5&&x.vectorScore>.25&&x.stateWeight!==0).sort((a,b)=>b.relevance-a.relevance).slice(0,3).map(({lesson:l,stateWeight})=>{
    const vectorScore=Object.entries(l.vector||{}).reduce((s,[k,v])=>s+(signals.includes(k)?Number(v)||0:0),0);
    const influence=clamp(vectorScore*stateWeight*(Number(l.confidence)||50)/100,-8,8);
    return {key:l.key,title:l.title,state:l.state||"prior",confidence:Math.round(l.confidence||0),influence:Number(influence.toFixed(2))};
  });
}
function evaluateChoiceForDepartment(choice,department,context={}){
  const evidence=Array.isArray(context.evidence)?context.evidence:[],ev=context.event||{},ctx=context.snapshot||decisionContextSnapshot();
  const dept=department||"company";
  const deptEvidence=filterEvidenceForDepartment(evidence,dept,choice);
  const strategyScore=decisionFitScore(ev,choice,ctx,dept)
    +hiringRequestRecommendationAdjustment(choice,ev,dept)
    +eventSpecificRecommendationAdjustment(choice,ev,dept);
  const lessonsUsed=institutionalLessonsForChoice(choice,dept);
  const lessonAdjustment=lessonsUsed.reduce((s,l)=>s+l.influence,0);
  const evidenceAdjustment=deptEvidence.reduce((s,line)=>{
    const ids=evidenceSignalIds(line),choiceIds=choiceEvidenceIds(choice);
    return s+(ids.some(id=>choiceIds.includes(id))?3:1);
  },0);
  const score=clampRecommendationScore(strategyScore+lessonAdjustment+Math.min(8,evidenceAdjustment));
  const evidenceText=deptEvidence.join(" ");
  const selectedEvidence=deptEvidence.filter(line=>evidenceSignalIds(line).some(id=>choiceEvidenceIds(choice).includes(id))).slice(0,2);
  const reasons=[departmentViewpointReason(dept,ev,choice)];
  if(!selectedEvidence.length&&evidenceText)selectedEvidence.push(deptEvidence[0]);
  const confidence=clamp((Number(choice.estimatedConfidence)||55)*.45+score*.35+(selectedEvidence.length?12:0),20,95);
  const uncertainty=confidence>72?"Low":confidence>55?"Material":"High";
  return {score,position:recommendationPosition(score),reasons,selectedEvidence,lessonsUsed,confidence,uncertainty};
}
function memoRecommendedChoice(ev,dept,evidence=[]){
  const choices=Array.isArray(ev.choices)?ev.choices:[];
  if(!choices.length)return null;
  return choices.map(c=>{const evaluation=evaluateChoiceForDepartment(c,dept,{event:ev,evidence});return {choice:c,score:evaluation.score,evaluation};}).sort((a,b)=>b.score-a.score)[0];
}
function evidenceSignalIds(text){
  const t=String(text||"").toLowerCase(),ids=[];
  if(/runway|cash|flow|fund|budget|spend|cost|payroll|salary/.test(t))ids.push("finance");
  if(/hire|staff|role|employee|stress|morale|retention|burnout|coach|layoff|people/.test(t))ids.push("people");
  if(/quality|defect|mistake|verify|verification|supplier|manufactur|rework|risk|blocker/.test(t))ids.push("quality");
  if(/project|portfolio|milestone|progress|deadline|scope|pause|cancel|merge|split/.test(t))ids.push("project");
  if(/customer|renewal|churn|support|account/.test(t))ids.push("customer");
  if(/customer|market|launch|pilot|revenue|growth|demand|product/.test(t))ids.push("market");
  if(/board|trust|crisis|shareholder|pip|strategy|confidence/.test(t))ids.push("governance");
  return [...new Set(ids)];
}
function choiceEvidenceIds(choice){
  const ids=evidenceSignalIds(`${choice.title||""} ${choice.detail||""} ${(choice.benefits||[]).join(" ")} ${(choice.risks||[]).join(" ")} ${choice.strategy||""} ${choice.directive||""}`);
  if(choice.effect?.cash!==undefined||choice.effect?.valuation!==undefined)ids.push("finance");
  if(choice.people||choice.hire||choice.hireRole||choice.deferHiring||choice.rejectHiring)ids.push("people");
  if(choice.effect?.quality!==undefined||choice.effect?.integration!==undefined)ids.push("quality");
  if(choice.launch||choice.projectAction||choice.commercializeProject)ids.push("project","market");
  if(choice.customerStrategy||choice.effect?.customers!==undefined)ids.push("customer","market");
  if(choice.effect?.board!==undefined||choice.effect?.trust!==undefined)ids.push("governance");
  return [...new Set([...(Array.isArray(choice.evidenceIds)?choice.evidenceIds:[]),...ids])];
}
function memoInterpretationFor(ev,dept,evidence,cred,recommended=null){
  const bias=departmentBiasProfile(dept);
  const title=recommended?.choice?.title||"the recommended option";
  return `${teamDisplayName(dept)} reads the evidence through ${bias.focus}. Based on its own priorities, the sender currently favors "${title}", but the advice may be shaped by ${bias.caution>65?"caution":bias.overconfidence>22?"optimism":"department priorities"} and incomplete information.`;
}
function operatingSignalPhrase(value,{low=45,high=70,lowText="weak",midText="mixed",highText="strong"}={}){
  const n=Number(value)||0;
  if(n>=high)return highText;
  if(n<low)return lowText;
  return midText;
}
function runwayPhrase(days){
  const n=Number(days)||0;
  if(n>=OFFICE_AQUARIUM_CONSTANTS.time.unknownFutureDay)return "cash-positive";
  if(n<60)return "very tight";
  if(n<120)return "tight";
  if(n<240)return "workable";
  return "comfortable";
}
function memoNoActionForecast(ev,dept,evidence){
  const cat=eventCategory(ev), blocked=(company.workItems||[]).filter(w=>w.status==="open"&&(w.blockedBy||[]).length).length, atRisk=company.portfolioHealth?.atRiskProjects||0, runway=runwayDaysOrUnknown(company.finance), stress=Math.round(avgStress()), gaps=Object.values(company.staffingModel||{}).filter(s=>s.understaffed).length;
  if(cat==="people"||dept==="people")return `If no action is taken, ${gaps} understaffed area(s) and ${operatingSignalPhrase(stress,{low:55,high:75,lowText:"manageable",midText:"elevated",highText:"high"})} stress may keep pushing morale, retention, and execution risk.`;
  if(cat==="finance"||dept==="finance")return `If no action is taken, runway remains ${runwayPhrase(runway)} and cash flow stays ${Number(company.finance?.netCashFlowDaily||0)<0?"negative":"positive"}.`;
  if(cat==="project"||String(ev.id||"").includes("project"))return `If no action is taken, ${atRisk} at-risk project(s), ${blocked} blocked work item(s), and current portfolio spend may continue without a strategic reset.`;
  if(cat==="customer"||ev.customerSegmentId){const seg=company.customerSegments?.[ev.customerSegmentId],label=CUSTOMER_SEGMENT_DEFS[ev.customerSegmentId]?.label||"Customer";return `If no action is taken, ${label} churn risk remains ${operatingSignalPhrase(seg?.churnRisk,{low:35,high:65,lowText:"contained",midText:"visible",highText:"elevated"})} while sentiment looks ${operatingSignalPhrase(seg?.sentiment||company.customerSentiment,{low:45,high:70,lowText:"weak",midText:"mixed",highText:"healthy"})}.`;}
  if(cat==="product"||dept==="product")return `If no action is taken, customer timing continues to compete with ${operatingSignalPhrase(company.quality,{low:55,high:72,lowText:"thin",midText:"acceptable",highText:"strong"})} quality and ${operatingSignalPhrase(company.trust,{low:50,high:72,lowText:"fragile",midText:"mixed",highText:"strong"})} trust.`;
  if(cat==="operations"||dept==="quality")return `If no action is taken, quality remains ${operatingSignalPhrase(company.quality,{low:55,high:72,lowText:"fragile",midText:"mixed",highText:"healthy"})} while rework and manufacturing reliability continue to shape delivery risk.`;
  if(cat==="board"||dept==="board")return `If no action is taken, board confidence remains ${operatingSignalPhrase(company.board,{low:50,high:72,lowText:"fragile",midText:"watchful",highText:"supportive"})} while crisis and capital-pressure signals continue to accumulate.`;
  return `If no action is taken, the underlying condition is likely to keep developing without CEO direction.`;
}
function memoEscalationReason(ev,comm,dept,msg=null){
  if(comm.reasonForEscalation)return comm.reasonForEscalation;
  const cat=eventCategory(ev);
  if(ev.sourceMessageId)return "A manager reviewed an internal report and judged that local authority was no longer enough.";
  if(ev.customerSegmentId)return "Customer Success can handle account recovery, but this trade-off would affect product priorities, support capacity, or revenue risk.";
  if(ev.hiringRequest)return "The department has a staffing need that affects budget, workload, and project commitments.";
  if(ev.projectDecision||cat==="project"||String(ev.id||"").includes("project"))return "The project has reached a point where continuing, pausing, changing scope, or canceling it requires executive judgment.";
  if(cat==="finance")return "The decision changes runway, fixed spending, fundraising pressure, or operating flexibility.";
  if(cat==="people")return "The issue affects retention, fairness, workload, or leadership credibility beyond one manager's authority.";
  if(cat==="board")return "The Board is asking for a leadership decision because the issue affects governance, valuation, or company risk.";
  if(cat==="product"||cat==="market")return "Product and market signals now require a strategic trade-off rather than a local roadmap adjustment.";
  if(cat==="operations"||dept==="quality")return "The operating risk could affect reliability, delivery, or customer trust.";
  return "The issue has moved beyond routine operating work and now requires a CEO-level trade-off.";
}
function memoUncertaintyFor(ev,dept,cred){
  const hidden=ev.projectDecision||String(ev.id||"").includes("project")?" Hidden project reality and market timing are not fully known.":"";
  return `${teamDisplayName(dept)} may be missing suppressed reports, delayed employee information, or future market changes.${hidden} Sender evidence quality is ${cred.evidenceQuality>=70?"strong":cred.evidenceQuality<45?"thin":"moderate"}, but not perfect.`;
}
function memoAlternativeViewpoints(ev,comm,dept){
  const recs=Array.isArray(comm.recs)?comm.recs:[];
  return recs.map(r=>{
    const name=String(r[0]||"Department"), lower=name.toLowerCase();
    const d=lower.includes("finance")?"finance":lower.includes("people")||lower.includes("hr")?"people":lower.includes("board")?"board":lower.includes("product")?"product":lower.includes("quality")?"quality":lower.includes("engineering")||lower.includes("hardware")?"hardware":"company";
    const recommended=memoRecommendedChoice(ev,d,concreteMemoEvidence(ev,comm,d,null));
    return {department:name,recommendation:recommended?.choice?.title||r[1]||"Review the evidence",confidence:Math.round(r[2]||55),reason:departmentViewpointReason(d,ev,recommended?.choice||null)};
  }).slice(0,4);
}
function departmentViewpointReason(dept,ev,choice=null){
  const p=decisionProjectSubject(ev,choice),cat=eventCategory(ev),text=String(`${ev.title||""} ${ev.copy||""} ${choice?.title||""} ${choice?.detail||""}`).toLowerCase();
  if(dept==="finance"){
    if(company.finance?.runwayDays<120)return `Finance is focused on runway because this choice could reduce flexibility before revenue is dependable.`;
    if(/hire|salary|budget|fund|spend/.test(text))return `Finance sees the option as affordable only if the commitment stays tied to evidence and milestones.`;
    return `Finance is less concerned with the headline decision than with whether the cost creates a recurring obligation.`;
  }
  if(dept==="people")return avgStress()>68?`People is worried that the team is already absorbing too much work and may turn execution pressure into retention risk.`:`People sees this mainly through workload, fairness, and whether managers can explain the decision to the team.`;
  if(dept==="quality")return `Quality is focused on whether the company is preventing defects before customers experience them, not only whether the schedule still looks achievable.`;
  if(dept==="product")return company.customers>0?`Product is weighing customer trust and timing; a faster move helps only if the promise can be kept.`:`Product is weighing whether this creates useful market learning or simply adds scope before the company has evidence.`;
  if(dept==="customer success")return `Customer Success is focused on whether the decision protects renewals, support capacity, and account trust after the sale.`;
  if(dept==="board")return `The Board is judging whether this decision makes management look disciplined, credible, and capable of protecting long-term value.`;
  if(dept==="hardware"||dept==="software"||dept==="engineering")return p?`Engineering believes ${p.title} still contains execution uncertainty that should be resolved before the company treats the plan as safe.`:`Engineering is focused on feasibility, integration risk, and whether the team has enough margin to do the work well.`;
  return `This group is looking at the operating consequences from its own responsibilities rather than treating the decision as a simple yes-or-no item.`;
}
function buildMemoIntelligence(ev,comm){
  const msg=ev.sourceMessageId?(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId):null;
  const dept=memoDepartmentFor(ev,comm),cred=ensureSenderCredibility(comm.from,dept),evidence=concreteMemoEvidence(ev,comm,dept,msg);
  const recommended=memoRecommendedChoice(ev,dept,evidence);
  (ev.choices||[]).forEach(choiceEvidenceIds);
  const recommendation=recommended?.choice?.title?`${teamDisplayName(dept)} recommends ${String(recommended.choice.title).replace(/\.$/,"").toLowerCase()}.`:(comm.recs?.[0]?.[1])||"Review the available choices";
  const originIds=Array.isArray(comm.originEmployeeIds)?comm.originEmployeeIds:(msg?.fromId!==undefined?[msg.fromId]:[]);
  const intel={why:memoEscalationReason(ev,comm,dept,msg),department:dept,chainOfCommand:memoChainOfCommand(ev,comm,dept,msg),originEmployeeIds:originIds,evidence,evidenceIds:[...new Set(evidence.flatMap(evidenceSignalIds))],interpretation:memoInterpretationFor(ev,dept,evidence,cred,recommended),recommendation,recommendationScore:recommended?Math.round(recommended.score):null,noActionForecast:memoNoActionForecast(ev,dept,evidence),uncertainty:memoUncertaintyFor(ev,dept,cred),alternativeRecommendations:memoAlternativeViewpoints(ev,comm,dept),recommendedChoice:recommended?.choice?.title||null,credibilityHint:cred.estimateAccuracy>68?"Usually accurate on operating estimates":cred.caution>70?"Often conservative in recommendations":cred.overconfidence>24?"Sometimes optimistic about upside":"Mixed historical reliability"};
  intel.audit=memoQualityAudit(ev,comm,intel);
  return intel;
}
function confidenceBand(value){
  const n=Number(value)||50;
  return n>=72?"High":n>=48?"Moderate":"Low";
}
function senderVoiceProfile(dept,role=""){
  const r=String(role||"").toLowerCase();
  if(dept==="board"||r.includes("board"))return {tone:"formal and strategic",open:["The Board is asking for your judgment because","We are writing because","The Board wants to flag"],focus:"valuation, capital discipline, execution risk, and CEO credibility"};
  if(dept==="finance"||r.includes("finance"))return {tone:"measured and skeptical",open:["Based on current spending","I want to flag a developing financial issue","The current plan is affordable, but"],focus:"runway, affordability, downside protection, and trade-offs"};
  if(dept==="people"||r.includes("people")||r.includes("hr"))return {tone:"careful and employee-focused",open:["I am concerned about the effect this is having on the team","Several employees are showing signs that","The immediate issue is not only performance"],focus:"morale, retention, fairness, workload, and sustainability"};
  if(dept==="quality"||r.includes("qa")||r.includes("verification"))return {tone:"precise and risk-aware",open:["The quality signal is becoming clearer","I am writing because verification work is showing pressure","The current reliability risk is"],focus:"defects, verification, rework, and customer exposure"};
  if(dept==="customer success"||r.includes("customer success")||r.includes("support"))return {tone:"account-focused and pragmatic",open:["Customers are starting to show us where the promise is holding and where it is not","I am writing because account health is becoming a leadership issue","The customer signal is not just about growth"],focus:"renewals, churn, customer trust, support load, and expansion quality"};
  if(dept==="product"||r.includes("product"))return {tone:"customer-focused and practical",open:["The customer signal is moving","I am writing because the product decision window is narrowing","The market opportunity is not fully proven, but"],focus:"customer demand, scope, timing, and product value"};
  if(dept==="hardware"||dept==="software"||r.includes("engineer")||r.includes("architect")||r.includes("software"))return {tone:"technical and evidence-driven",open:["I am writing because","The engineering team is seeing","The current technical risk is"],focus:"delivery, technical quality, integration, and schedule realism"};
  return {tone:"balanced and operational",open:["I am writing because","I want to flag","The team is beginning to see"],focus:"operating balance and leadership attention"};
}
function senderPersonalityFor(comm,dept){
  const e=employees.find(x=>x.name===comm.from),traits=e?.traits||[],cred=ensureSenderCredibility(comm.from,dept);
  if(traits.includes("skeptical")||cred.caution>70)return "conservative";
  if(traits.includes("creative")||traits.includes("ambitious")||cred.overconfidence>24)return "optimistic";
  if(traits.includes("social"))return "diplomatic";
  if(traits.includes("focused")||traits.includes("analytical"))return "evidence-heavy";
  return "direct";
}
function naturalizeObservation(text){
  const t=String(text||"").replace(/\s+/g," ").trim();
  if(!t)return "";
  if(/^Internal intelligence/i.test(t))return naturalizeObservation(t.replace(/^Internal intelligence[^:]*:\s*/i,""));
  let cm=t.match(/Customer base\s+(\d+),\s+weighted sentiment\s+(\d+),\s+daily segment revenue\s+\$?([\d.]+)M/i);if(cm)return `The customer base is ${Number(cm[1])>=100?"broad":Number(cm[1])>=25?"growing":"still developing"}, sentiment looks ${operatingSignalPhrase(cm[2],{low:45,high:70,lowText:"weak",midText:"mixed",highText:"healthy"})}, and segment revenue is ${Number(cm[3])>=.08?"material":Number(cm[3])>.02?"emerging":"early"}.`;
  cm=t.match(/(.+):\s+(\d+)\s+active customer\(s\), sentiment\s+(\d+), churn risk\s+(\d+)/i);if(cm)return `${cm[1]} has a ${Number(cm[2])>=50?"meaningful":Number(cm[2])>=10?"developing":"small"} active customer base, ${operatingSignalPhrase(cm[3],{low:45,high:70,lowText:"weak",midText:"mixed",highText:"healthy"})} sentiment, and ${operatingSignalPhrase(cm[4],{low:35,high:65,lowText:"contained",midText:"visible",highText:"elevated"})} churn risk.`;
  cm=t.match(/Market context:\s+competitor pressure\s+(\d+), demand\s+(\d+)/i);if(cm)return `Market pressure is visible: competition is ${operatingSignalPhrase(cm[1],{low:40,high:70,lowText:"quiet",midText:"active",highText:"intense"})} and demand looks ${operatingSignalPhrase(cm[2],{low:40,high:70,lowText:"soft",midText:"mixed",highText:"strong"})}.`;
  let m=t.match(/Runway\s+(\d+)\s+day/i);if(m)return `Cash runway looks ${runwayPhrase(Number(m[1]))}.`;
  m=t.match(/net cash flow\s+\$?(-?[\d.]+)M\/day/i);if(m)return Number(m[1])<0?`The company is still burning cash each day.`:`Daily cash flow is positive.`;
  m=t.match(/Average stress\s+(\d+)/i);if(m)return Number(m[1])>=80?"The team is showing sustained burnout risk.":Number(m[1])>=65?"Workload pressure is elevated across the team.":"Average workload pressure is manageable.";
  m=t.match(/Need score\s+(\d+)/i);if(m)return Number(m[1])>=80?"The department is describing this as a sustained staffing need, not a one-day spike.":"The department sees a staffing need, but the case is still developing.";
  m=t.match(/workload\s+(\d+)/i);if(m)return Number(m[1])>=85?"Current workload is above what the department can comfortably absorb.":Number(m[1])>=65?"Department workload is elevated enough to affect planning.":"Department workload is not the main reason for the memo.";
  m=t.match(/blocked work\s+(\d+)/i);if(m)return Number(m[1])>0?`${m[1]} ${Number(m[1])===1?"piece of work is":"pieces of work are"} blocked or waiting on another team.`:"The work is not formally blocked, but capacity or timing is still a concern.";
  m=t.match(/^(.+) is below healthy staffing$/i);if(m)return `${m[1]} is operating below its healthy staffing level.`;
  m=t.match(/^(\d+) blocked work item\(s\)$/i);if(m)return Number(m[1])>0?`${m[1]} ${Number(m[1])===1?"work item is":"work items are"} blocked or waiting on another team.`:"No work items are formally blocked.";
  m=t.match(/active employees\s+(\d+)/i);if(m)return `The company currently has ${m[1]} active employee${Number(m[1])===1?"":"s"}.`;
  m=t.match(/retention cases\s+(\d+)/i);if(m)return Number(m[1])>0?`${m[1]} employee${Number(m[1])===1?" is":"s are"} now showing elevated retention risk.`:"No major retention case is visible yet.";
  m=t.match(/Quality\s+(\d+)/i);if(m)return Number(m[1])<55?`Product quality is below the level the team would like before broad exposure.`:`Product quality is ${operatingSignalPhrase(m[1],{low:55,high:72,lowText:"fragile",midText:"acceptable",highText:"healthy"})}, but related execution risks still matter.`;
  m=t.match(/unresolved mistakes\s+(\d+)/i);if(m)return Number(m[1])>0?`Rework and verification issues remain visible in the operating record.`:"Recent quality mistakes are not the main pressure point.";
  m=t.match(/manufacturing risk\s+(\d+)/i);if(m)return Number(m[1])>65?"Manufacturing and supply reliability are becoming a delivery risk.":"Manufacturing risk is present but not yet the dominant concern.";
  m=t.match(/progress\s+(\d+)%/i);if(m)return `The related work is about ${m[1]}% complete.`;
  m=t.match(/(\d+)\s+blocker\(s\)/i);if(m)return Number(m[1])>0?`${m[1]} blocker${Number(m[1])===1?" is":"s are"} still slowing the work.`:"No formal blocker is recorded, so the concern is more about capacity or timing.";
  m=t.match(/Hiring need confidence\s+(\d+)% for (.+)\./i);if(m)return `The staffing request is for ${m[2]}, and the department believes the need is credible.`;
  m=t.match(/Portfolio:\s+(\d+)\s+active,\s+(\d+)\s+at risk/i);if(m)return `${m[1]} project${Number(m[1])===1?" is":"s are"} active, with ${m[2]} currently at risk.`;
  if(/severity|urgency|routing score|confidence \d+/i.test(t))return "";
  return t.replace(/risk (\d+)/i,"risk is visible").replace(/confidence (\d+)/i,"confidence is moderate");
}
function evidenceSentence(raw){
  const text=naturalizeObservation(raw);
  if(!text)return "";
  return text.replace(/\.$/,".");
}
function selectMemoObservations(intel,ev,comm){
  const seen=new Set(),items=[];
  for(const raw of [...(intel.evidence||[]),...(comm.impacts||[])]){
    const obs=naturalizeObservation(raw);
    if(obs&&!seen.has(obs)){seen.add(obs);items.push(obs);}
    if(items.length>=4)break;
  }
  if(items.length<2){
    const cat=eventCategory(ev),dept=intel.department;
    if(dept==="finance"||cat==="finance")items.push(company.finance?.runwayDays<120?"Cash runway is now close enough to require judgment.":"The financial impact is manageable, but it still affects future flexibility.");
    else if(dept==="people"||cat==="people")items.push(avgStress()>65?"The people risk is building through workload pressure.":"The people impact is mostly about fairness, workload, and follow-through.");
    else if(dept==="quality"||cat==="operations")items.push("The visible risk is tied to reliability, verification, or delivery confidence.");
    else items.push("The issue affects company direction more than day-to-day task assignment.");
  }
  return items.slice(0,4);
}
function memoOpeningSentence(model,ev){
  const voice=senderVoiceProfile(model.department,model.senderRole),pick=voice.open[Math.abs((company.day||0)+(model.senderName||"").length)%voice.open.length];
  if(model.department==="board")return `${pick} outside expectations and company fundamentals are moving in different ways.`;
  if(eventCategory(ev)==="finance"||model.department==="finance")return `${pick} the decision could change runway, fixed costs, or investor confidence.`;
  if(eventCategory(ev)==="people"||model.department==="people")return pick.endsWith("seeing")?`${pick} signs that the current pace is becoming harder to sustain.`:`${pick} this issue is starting to affect how sustainable the current operating pace feels.`;
  if(eventCategory(ev)==="project"){
    const p=decisionProjectSubject(ev);
    if(p)return `I am writing because ${p.title} needs a leadership call before the team changes scope, pace, staffing, or budget.`;
    return "I am writing because the portfolio needs a leadership call before the team commits more time and budget.";
  }
  if(eventCategory(ev)==="customer"||model.department==="customer success")return "I am writing because customer evidence is now strong enough that waiting is also a decision.";
  return pick.endsWith("seeing")?`${pick} signs that this has crossed from ordinary operating work into a decision that needs executive judgment.`:`${pick} this has crossed from ordinary operating work into a decision that needs executive judgment.`;
}
function memoDecisionAskSentence(model,ev){
  const context=model.decisionContext||decisionContextSubject(ev);
  const name=context?.name||model.relatedProjectName||"this issue";
  if(model.contextKind==="hiring"||ev.hiringRequest){
    const role=hiringDecisionRole(ev)||name;
    return `I need a decision on whether to add, delay, or decline the ${role} capacity request.`;
  }
  if(context?.kind==="hiring-policy")return "I need a decision on the hiring rule managers should use before they send more staffing requests.";
  if(model.contextKind==="project"||context?.kind==="project")return `I need a decision on what we are authorizing next for ${name}.`;
  if(model.contextKind==="customer"||context?.kind==="customer")return `I need a decision on whether we protect the current plan, add support, or change the customer promise for ${name}.`;
  if(model.department==="finance")return "I need a decision on whether we protect runway, spend into the opportunity, or wait for stronger evidence.";
  if(model.department==="board")return "The Board needs to know which signal you want the company to send next.";
  if(model.department==="quality")return "I need a decision on whether we slow down for verification or accept the current level of delivery risk.";
  if(model.department==="people")return "I need a decision on whether we absorb the pressure locally or change the workload plan.";
  return "I need a decision on which trade-off the company should make next.";
}
function memoAssessmentSentence(model){
  const dept=model.department,obs=model.observations.join(" ").toLowerCase(),personality=model.senderPersonality;
  if(model.contextKind==="hiring")return "The question is not whether the team would like more help. The question is whether this role now protects more delivery capacity than it costs.";
  if(model.contextKind==="project")return "The project may still be worth doing, but the current plan needs a clearer executive trade-off than ordinary project management can provide.";
  if(model.contextKind==="customer")return "The customer issue is no longer just feedback. It is becoming a choice about what promise the company is willing to support.";
  if(dept==="finance")return personality==="optimistic"?"The company may be able to absorb this, but the timing still matters because cash flexibility can disappear quickly.":"My concern is not the single cost. It is the fixed commitment and the way it narrows future options if revenue or funding arrives later than expected.";
  if(dept==="people")return "The immediate issue is not only output. The risk is that the company keeps meeting commitments by borrowing from morale, recovery time, or trust.";
  if(dept==="quality")return "I do not think this means the product has failed. It means the current evidence is asking us to decide whether to protect reliability before the risk becomes customer-facing.";
  if(dept==="product")return "The opportunity is real enough to consider, but the cost of being wrong is mostly scope creep, timing pressure, and customer trust.";
  if(dept==="board")return "The Board does not treat this as proof that the strategy is right or wrong. It does mean the next decision will influence how much patience the company receives.";
  if(/blocker|quality|verification|technical/.test(obs))return "The team can probably keep moving, but it is doing so with less margin for mistakes than I would like.";
  return "The company has options, but each one sends a different signal to employees, customers, and the Board.";
}
function localActionsSentence(model,ev){
  const dept=model.department,p=decisionProjectSubject(ev);
  if(model.contextKind==="hiring"||ev.hiringRequest)return "People and Finance have reviewed the staffing case first. The request is coming to you because approving headcount changes the company's cost structure and project capacity.";
  if(p)return `The team can continue making local adjustments on ${p.title}, but changing scope, pace, staffing, or cancellation would affect more than one department.`;
  if(dept==="quality")return "The team has already been trying to manage the issue through verification and rework. The next response would affect schedule, staffing, or customer exposure.";
  if(dept==="finance")return "Finance can tighten ordinary spending, but the larger choices now affect strategy, morale, or investor expectations.";
  if(dept==="people")return "Managers can coach and rebalance work locally, but this decision now affects fairness, retention, or company-wide expectations.";
  if(dept==="product")return "Product and Customer Success can handle ordinary customer issues, but this decision would change priorities or commitments.";
  return "The operating team has handled what it can locally. The remaining trade-off is now broad enough to require CEO judgment.";
}
function renderExecutiveEmailBody(model,ev){
  const facts=(model.observations||[]).map(evidenceSentence).filter(Boolean).slice(0,4);
  const factText=facts.length?`<h4>What we have observed</h4><ul class="evidence-list">${facts.map(f=>`<li>${f}</li>`).join("")}</ul>`:"";
  const context=decisionContextBlockHtml(model,ev);
  return `<p>${model.reasonForWriting}</p><p>${memoDecisionAskSentence(model,ev)}</p>${context}<p>${model.assessment}</p>${factText}<p>${localActionsSentence(model,ev)}</p><p><strong>Recommendation:</strong> ${model.recommendation}</p><p><strong>What we do not know:</strong> ${model.uncertaintyNote}</p>`;
}
function recommendationPhrase(title){
  const rec=String(title||"").replace(/\.$/,"").trim();
  if(!rec)return "";
  const lower=rec.charAt(0).toLowerCase()+rec.slice(1);
  const swaps=[
    ["approve","approving"],["authorize","authorizing"],["delay","delaying"],["reject","rejecting"],["freeze","freezing"],["continue","continuing"],
    ["raise","raising"],["reduce","reducing"],["sponsor","sponsoring"],["ask","asking"],["open","opening"],["create","creating"],
    ["commit","committing"],["protect","protecting"],["pursue","pursuing"],["stay","staying"],["improve","improving"],["wait","waiting"],
    ["accelerate","accelerating"],["fund","funding"],["publish","publishing"],["prioritize","prioritizing"],["defend","defending"],
    ["run","running"],["use","using"],["decline","declining"],["file","filing"],["document","documenting"],["pass","passing"],["order","ordering"],["cut","cutting"],["tighten","tightening"]
  ];
  for(const [from,to] of swaps){
    const re=new RegExp(`^${from}\\b`,"i");
    if(re.test(rec)){
      const phrase=lower.replace(re,to);
      return phrase.replace(/\b(approving|delaying|rejecting|opening|funding|canceling) position\b/,"$1 the position").replace(/\b(approving|canceling) project\b/,"$1 the project");
    }
  }
  return lower;
}
function shortProjectName(p){
  return p?.codename||p?.title||"the project";
}
function displayChoiceTitle(choice,ev={}){
  const raw=String(choice?.title||"").trim();
  if(!raw)return "Make a decision";
  const lower=raw.toLowerCase();
  const p=decisionProjectSubject(ev,choice);
  const project=shortProjectName(p);
  if(choice.hireRole)return `Approve a ${choice.hireRole} position`;
  if(choice.hire||choice.hiringException){
    const role=choice.role||ev.hiringRequest?.role||ev.hiringException?.role||hiringExceptionRole(choice)||"new role";
    if(choice.hiringException?.action==="continue-search")return `Continue the ${role} search`;
    if(choice.hiringException?.action==="contractor")return `Use temporary contractor coverage`;
    if(choice.hiringException?.action==="cancel-role")return `Close the ${role} search`;
    return `Approve the ${role} exception`;
  }
  if(choice.deferHiring){
    const role=choice.deferHiring.role||ev.hiringRequest?.role||"role";
    return `Delay the ${role} position`;
  }
  if(choice.rejectHiring){
    const role=choice.rejectHiring.role||ev.hiringRequest?.role||"role";
    return `Decline the ${role} request`;
  }
  if(choice.hiringPolicy?.mode==="frozen")return "Freeze new headcount";
  if(choice.hiringPolicy?.mode==="critical-only")return "Allow only critical roles";
  if(choice.hiringPolicy?.mode==="normal")return "Keep normal hiring review";
  if(choice.projectDecision){
    const action=choice.projectDecision.action;
    if(action==="continue")return `Stay on the ${project} plan`;
    if(action==="resume")return `Resume ${project}`;
    if(action==="pause")return `Pause ${project}`;
    if(action==="cancel")return `Cancel ${project}`;
    if(action==="reduce")return `Reduce ${project} scope`;
    if(action==="expand")return `Increase ${project} budget`;
    if(action==="split")return `Split ${project} into phases`;
    if(action==="merge")return `Merge ${project} with related work`;
    if(action==="validate")return `Require customer validation for ${project}`;
    if(action==="approve")return `Approve ${project}`;
    if(action==="pilot")return `Approve a ${project} pilot`;
    if(action==="delay")return `Delay ${project} one quarter`;
    if(action==="reject")return `Reject ${project}`;
  }
  if(choice.commercializeProject?.mode==="launch")return `Launch ${project} commercially`;
  if(choice.commercializeProject?.mode==="pilot")return `Run a limited ${project} pilot`;
  if(choice.commercializeProject?.mode==="shelve")return `Shelve ${project} for now`;
  if(choice.customerStrategy?.mode==="recovery")return "Approve a customer recovery plan";
  if(choice.customerStrategy?.mode==="support")return "Fund temporary support capacity";
  if(choice.customerStrategy?.mode==="hold")return "Hold the current roadmap line";
  if(lower.includes("restructure around the strongest team"))return p?`Reassign experienced staff to ${project}`:"Reassign experienced staff to the priority work";
  if(lower.includes("protect a minimum cash reserve"))return "Delay non-essential spending";
  if(lower.includes("narrow the promise"))return "Reduce the first-release scope";
  if(lower.includes("protect growth bets"))return "Protect the highest-upside projects";
  if(lower.includes("cut project burn"))return "Reduce active project spending";
  if(lower.includes("order portfolio triage"))return "Review the highest-risk projects";
  if(lower.includes("stay the course"))return p?`Stay on the ${project} plan`:"Stay on the current plan";
  if(lower.includes("continue current strategy"))return "Continue the current strategy";
  return raw;
}
function displayChoiceTitleFromRecommendation(title,ev={}){
  const choice=(ev.choices||[]).find(c=>c.title===title)||null;
  return choice?displayChoiceTitle(choice,ev):String(title||"").replace(/\.$/,"").trim();
}
function naturalRecommendationSentence(intel,model,ev={}){
  const recRaw=intel.recommendedChoice||String(intel.recommendation||"").replace(/^.*recommends\s+/i,"").replace(/\.$/,"");
  const rec=displayChoiceTitleFromRecommendation(recRaw,ev);
  if(!rec)return "I recommend making a narrow decision now and reviewing the outcome after the next operating signal.";
  return `I recommend ${recommendationPhrase(rec)}.`;
}
function uncertaintySentence(model,intel){
  const band=model.confidenceBand,dept=model.department,cred=model.senderCredibility||{};
  if(dept==="board")return `${band} confidence. The Board may be over-weighting recent market signals, so this should be treated as judgment rather than certainty.`;
  if(dept==="finance")return `${band} confidence. The cash estimate is clearer than the operating effect, especially if hiring, launch timing, or customer demand changes.`;
  if(dept==="people")return `${band} confidence. I may be underestimating how much the team can absorb, but the retention and morale signals are worth taking seriously.`;
  if(dept==="quality")return `${band} confidence. I am more confident about the technical risk than the exact customer impact.`;
  if((cred.overconfidence||0)>24)return `${band} confidence. The sender has historically been optimistic about upside, so the downside case still deserves attention.`;
  if((cred.caution||0)>70)return `${band} confidence. The sender is usually cautious, so the memo may lean toward avoiding downside.`;
  return `${band} confidence. The available evidence is useful, but it does not remove execution or market uncertainty.`;
}
function lessonRelevanceScore(lesson,model){
  const text=String(`${model.subject||""} ${model.contextKind||""} ${model.department||""} ${(model.observations||[]).join(" ")} ${lesson.key||""} ${lesson.title||""}`).toLowerCase();
  let score=0;
  if(!lesson||lesson.state==="obsolete")return 0;
  if(lesson.department==="company"||lesson.department===model.department)score+=18;
  if(model.contextKind&&String(lesson.key||"").includes(model.contextKind))score+=24;
  if(/project|portfolio|milestone|scope/.test(text)&&/project|portfolio|scope|validation/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  if(/customer|renewal|churn|support/.test(text)&&/customer|retention|churn|support/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  if(/cash|runway|spend|budget|finance/.test(text)&&/cash|runway|finance|spending/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  if(/hire|staff|burnout|retention|people/.test(text)&&/hire|burnout|retention|people|workforce/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  if(/quality|defect|verification|rework/.test(text)&&/quality|verification|rework|defect/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  score+=lessonStateWeight(lesson)*18;
  score+=clamp((lesson.confidence||0)-55,0,35)*.45;
  score+=clamp((lesson.episodeKeys||[]).length,0,4)*5;
  score-=clamp((company.day-(lesson.lastDay??company.day))/180,0,1)*12;
  score-=lesson.outcome==="mixed"?8:lesson.outcome==="negative"?4:0;
  return score;
}
function institutionalLearningLine(model){
  const lessons=(company.lessons||[]).filter(l=>(!model.department||l.department===model.department||l.department==="company")&&(l.confidence||0)>50&&l.state!=="prior").map(l=>({lesson:l,score:lessonRelevanceScore(l,model)})).filter(x=>x.score>=42).sort((a,b)=>b.score-a.score)[0]?.lesson;
  if(!lessons)return "";
  const evidenceCount=(lessons.episodeKeys?.length||0)+(lessons.sampleCount||0);
  const subject=model.relatedProjectName||model.subject||teamDisplayName(model.department||"company");
  const state=lessons.state==="validated"?"has validated":lessons.state==="provisional"?"is cautiously applying":"is testing";
  const title=String(lessons.title||lessons.key||"a prior lesson").replace(/^Decision learning:\s*/i,"").replace(/^Communication learning:\s*/i,"");
  if(/verification|quality|rework|defect/i.test(`${lessons.key} ${lessons.title}`))return `${teamDisplayName(lessons.department||model.department||"company")} ${state} a quality lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience is being applied to ${subject}.`;
  if(/burnout|overload|resignation|retention/i.test(`${lessons.key} ${lessons.title}`))return `${teamDisplayName(lessons.department||model.department||"company")} ${state} a people-risk lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience affects how this memo weighs workload and retention.`;
  if(/runway|cash|finance|spending/i.test(`${lessons.key} ${lessons.title}`))return `${teamDisplayName(lessons.department||"finance")} ${state} a finance lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience shapes the runway recommendation here.`;
  if(/project|portfolio|scope|validation/i.test(`${lessons.key} ${lessons.title}`))return `${teamDisplayName(lessons.department||model.department||"company")} ${state} a portfolio lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience is being applied to ${subject}.`;
  if(/customer|retention|churn|support/i.test(`${lessons.key} ${lessons.title}`))return `Customer Success ${state} a customer lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience shapes how this memo weighs renewals, churn, and promises.`;
  return `${teamDisplayName(lessons.department||model.department||"company")} ${state} a relevant company lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}.`;
}
function allPortfolioSubjects(){
  return [...(company.projects||[]),...(company.projectProposals||[]),...(company.projectArchive||[])];
}
function hiringExceptionRole(choice={}){
  const id=choice.hiringException?.id||choice.id;
  if(!id)return null;
  return (company.recruitingPipeline||[]).find(r=>r.id===id)?.role||null;
}
function projectFromWorkSubject(work){
  if(!work?.projectId)return null;
  return allPortfolioSubjects().find(p=>p.id===work.projectId)||null;
}
function hiringDecisionRole(ev,choice={}){
  return choice.hire?.role||choice.hireRole||choice.hiringException?.role||hiringExceptionRole(choice)||choice.deferHiring?.role||choice.rejectHiring?.role||ev.hiringRequest?.role||ev.hireRole||ev.deferHiring?.role||ev.rejectHiring?.role||null;
}
function decisionContextSubject(ev,choice={}){
  const work=decisionWorkSubject(ev);
  const project=decisionProjectSubject(ev,choice)||projectFromWorkSubject(work);
  if(project)return {kind:"project",label:"Project",name:project.title||project.codename||project.id,id:project.id,detail:work?.title?`Related work: ${work.title}`:project.status?`Status: ${project.status}`:""};
  if(work)return {kind:"work",label:"Work item",name:work.title||work.id,id:work.id,detail:work.assignedTeam?`Team: ${teamDisplayName(work.assignedTeam)}`:""};
  if(ev.hiringPolicyReview||choice.hiringPolicy)return {kind:"hiring-policy",label:"Hiring policy",name:hiringPolicyLabel?.()||"Current policy",id:ev.id||null,detail:"Company-wide hiring rule"};
  const role=hiringDecisionRole(ev,choice);
  if(role)return {kind:"hiring",label:"Hiring request",name:role,id:ev.hiringRequest?.id||null,detail:ev.hiringRequest?.department?`Team: ${teamDisplayName(ev.hiringRequest.department)}`:ev.hiringRequest?.team?`Team: ${teamDisplayName(ev.hiringRequest.team)}`:""};
  if(ev.customerSegmentId)return {kind:"customer",label:"Customer segment",name:CUSTOMER_SEGMENT_DEFS[ev.customerSegmentId]?.label||ev.customerSegmentId,id:ev.customerSegmentId,detail:"Customer-facing decision"};
  const department=ev.memoIntelligence?.department||eventCategory(ev);
  if(department)return {kind:"department",label:"Department",name:teamDisplayName(department),id:department,detail:"Company-level operating decision"};
  return null;
}
function decisionContextSummary(ev,choice={}){
  const ctx=decisionContextSubject(ev,choice);
  return ctx?`${ctx.label}: ${ctx.name}`:"";
}
function decisionContextBlockHtml(model,ev={}){
  const ctx=model.decisionContext||decisionContextSubject(ev);
  const work=model.relatedWorkItemTitle?`Related work: ${model.relatedWorkItemTitle}`:ctx?.detail;
  const items=[ctx?`Decision context: ${ctx.label}: ${ctx.name}`:null,work||null,model.relatedDepartmentIds?.length?`Responsible area: ${model.relatedDepartmentIds.map(teamDisplayName).join(", ")}`:null].filter(Boolean);
  if(!items.length)return "";
  return `<div class="memo-block memo-context"><h4>Decision context</h4><ul class="evidence-list">${items.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
}
function buildStructuredExecutiveMessage(ev,comm,intel){
  const dept=intel.department||memoDepartmentFor(ev,comm),cred=ensureSenderCredibility(comm.from,dept),observations=selectMemoObservations(intel,ev,comm),sourceMsg=(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId),senderEmployee=employees.find(e=>e.name===comm.from),work=decisionWorkSubject(ev),project=decisionProjectSubject(ev)||projectFromWorkSubject(work),sourceIds=[ev.id,ev.sourceMessageId,sourceMsg?.issueId,sourceMsg?.workItemId].filter(Boolean);
  const role=hiringDecisionRole(ev);
  const model={senderId:senderEmployee?.id??null,senderName:comm.from||"Executive Office",senderRole:comm.role||"Leadership Team",department:dept,subject:comm.subject||ev.title,sentDay:company.day,sentMinute:company.minute||0,reasonForWriting:"",observations,assessment:"",recommendation:"",confidenceBand:confidenceBand((cred.evidenceQuality||58)*.45+(cred.estimateAccuracy||55)*.35+(100-(cred.overconfidence||0))*.2),uncertaintyNote:"",sourceIds,decisionContext:decisionContextSubject(ev),relatedProjectId:project?.id||null,relatedProjectName:project?.title||project?.codename||null,relatedWorkItemId:work?.id||sourceMsg?.workItemId||null,relatedWorkItemTitle:work?.title||null,relatedRoleIds:role?[role]:[],relatedEmployeeIds:intel.originEmployeeIds||[],relatedDecisionId:ev.id,senderPersonality:senderPersonalityFor(comm,dept),senderCredibility:{...cred},debug:{senderBias:departmentBiasProfile(dept),recommendationScores:(ev.choices||[]).map(c=>({choice:c.title,score:Math.round(evaluateChoiceForDepartment(c,dept,{event:ev,evidence:intel.evidence||[]}).score)})),observationsRaw:intel.evidence||[],institutionalLearning:[]}};
  model.contextKind=ev.hiringRequest?"hiring":ev.customerSegmentId?"customer":ev.projectDecision||project?"project":eventCategory(ev);
  model.reasonForWriting=memoOpeningSentence(model,ev);
  model.assessment=memoAssessmentSentence(model);
  const learning=institutionalLearningLine(model);
  if(learning){model.debug.institutionalLearning=[learning];model.assessment+=` ${learning}`;}
  model.recommendation=naturalRecommendationSentence(intel,model,ev);
  model.uncertaintyNote=uncertaintySentence(model,intel);
  return model;
}
function renderStructuredExecutiveMessage(model,ev={}){
  const related=[model.relatedCustomerSegment?`Affected Customer Segment: ${model.relatedCustomerSegment}`:null,model.relatedRoleIds?.length?`Affected Role: ${model.relatedRoleIds.join(", ")}`:null,model.decisionDeadlineDay!==undefined?`Decision Needed By: Day ${model.decisionDeadlineDay+1}`:null,model.reasonForEscalation?`Why You Are Receiving This: ${model.reasonForEscalation}`:null].filter(Boolean).map(x=>`<li>${x}</li>`).join("");
  return `${renderExecutiveEmailBody(model,ev)}${related?`<h4>Decision details</h4><ul class="evidence-list">${related}</ul>`:""}`;
}
