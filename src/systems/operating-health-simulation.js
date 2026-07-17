function updatePortfolioHealth(){
  ensureProjectPortfolio();
  const active=activeProjects(),proposed=company.projectProposals.filter(p=>p.status==="proposal"),paused=company.projects.filter(p=>p.status==="paused"),atRisk=active.filter(p=>(p.performance?.riskTrend||0)>70||p.status==="at risk"),spend=active.reduce((s,p)=>s+p.estimatedCost/Math.max(30,p.estimatedDuration)*(p.scope||1),0);
  ensureProjectAllocations();
  if(typeof updateStaffingModel==="function")updateStaffingModel();
  const demand=Math.round(active.reduce((s,p)=>s+Object.values(p.requiredHeadcount||{}).reduce((a,b)=>a+b,0)*projectExecutionModifiers(p).staffingDemand,0)),primaryCounts={};
  const missingFte=active.reduce((s,p)=>s+Object.entries(p.requiredHeadcount||{}).reduce((a,[dept,need])=>a+Math.max(0,(Number(need)||0)-projectAllocatedFte(p,dept)),0),0)+(company.projectCapacity?.totalOverload||0);
  active.forEach(p=>primaryCounts[p.proposingDepartment]=(primaryCounts[p.proposingDepartment]||0)+1);
  const maxConcentration=Math.max(0,...Object.values(primaryCounts));
  company.portfolioHealth={activeProjects:active.length,proposedProjects:proposed.length,atRiskProjects:atRisk.length,pausedProjects:paused.length,totalProjectSpendDaily:Number(spend.toFixed(3)),committedProjectBudget:Number(active.reduce((s,p)=>s+(p.budgetApproved||0),0).toFixed(2)),staffingDemand:demand,projectDrivenOpenRoles:Math.ceil(missingFte),averageScheduleVariance:Math.round(active.reduce((s,p)=>s+(p.performance?.scheduleVariance||0),0)/Math.max(1,active.length)),averageBudgetVariance:Math.round(active.reduce((s,p)=>s+(p.performance?.budgetVariance||0),0)/Math.max(1,active.length)),concentrationRisk:Math.round(maxConcentration/Math.max(1,active.length)*100),nextProjectReview:Math.min(999,...active.map(p=>Math.max(0,(p.nextReviewDay||company.day+30)-company.day)))};
}
function derivedStaffingCoverage(project){
  const req=Object.entries(project.requiredHeadcount||{}).filter(([,n])=>Number(n)>0);
  if(!req.length)return 100;
  const ratios=req.map(([dept,need])=>{
    const allocated=typeof projectQualifiedAllocatedFte==="function"?projectQualifiedAllocatedFte(project,dept):projectAllocatedFte(project,dept);
    return clamp(allocated/Math.max(.1,need)*100,0,100);
  });
  return ratios.reduce((s,v)=>s+v,0)/Math.max(1,ratios.length);
}
function projectScheduleHealth(project){return clamp(100-Math.abs(project.performance?.scheduleVariance??project.scheduleVariance??0),0,100);}
function projectIntrinsicHealth(project){
  const progressScore=clamp(Number(project.progress)||0,0,100);
  const qualityScore=clamp(Number(project.performance?.quality??project.quality??company.quality)||0,0,100);
  const scheduleScore=projectScheduleHealth(project);
  const staffingScore=clamp(Number(derivedStaffingCoverage(project)),0,100);
  const riskScore=clamp(100-Number(project.performance?.riskTrend??project.visibleRisk??50),0,100);
  const confidenceScore=clamp(Number(project.performance?.strategicConfidence??project.visibleConfidence??50),0,100);
  return Math.round(progressScore*.30+qualityScore*.20+scheduleScore*.15+staffingScore*.15+riskScore*.10+confidenceScore*.10);
}
function projectDependencyProfile(project){
  const text=String(`${project.family||""} ${project.title||""} ${project.proposingDepartment||""} ${(project.requiredDepartments||[]).join(" ")}`).toLowerCase();
  const profile={hardware:0,software:0,manufacturing:0,quality:0,customer:0,people:0,finance:0,trust:0,innovation:0};
  if(/university|research|partnership|talent|training/.test(text))Object.assign(profile,{people:.28,trust:.22,innovation:.22,finance:.10,software:.06,hardware:.04,customer:.08});
  else if(/firmware|telemetry|integration|driver|embedded/.test(text))Object.assign(profile,{hardware:.24,software:.28,manufacturing:.08,people:.14,trust:.10,innovation:.08,finance:.08});
  else if(/hardware|chip|accelerator|sensor|processor|memory|architecture/.test(text)||project.requiredDepartments?.includes("hardware"))Object.assign(profile,{hardware:.34,manufacturing:.18,people:.14,software:.10,trust:.10,innovation:.08,finance:.06});
  else if(/software|sdk|portal|cloud|data|security|platform/.test(text)||project.requiredDepartments?.includes("software"))Object.assign(profile,{software:.36,people:.16,customer:.14,trust:.12,innovation:.10,finance:.08,hardware:.04});
  else if(/manufacturing|supplier|yield|capacity|factory/.test(text))Object.assign(profile,{manufacturing:.38,hardware:.18,quality:.18,finance:.12,trust:.08,people:.06});
  else if(/customer|market|sales|support|launch|commercial/.test(text))Object.assign(profile,{customer:.32,trust:.22,software:.12,hardware:.08,people:.10,finance:.10,innovation:.06});
  else Object.assign(profile,{people:.18,finance:.16,trust:.16,software:.14,hardware:.12,customer:.10,innovation:.08,manufacturing:.06});
  if(project.requiredHeadcount?.quality)profile.quality=(profile.quality||0)+.08;
  return profile;
}
function projectCompanyConditionScore(project){
  const morale=typeof weightedEmployeeMorale==="function"?(weightedEmployeeMorale()??50):50;
  const cohesion=typeof derivedCohesion==="function"?(derivedCohesion()??55):(typeof averageTeamCohesion==="function"?(averageTeamCohesion()??55):55);
  const customerSentiment=typeof derivedCustomerSentiment==="function"?derivedCustomerSentiment():null;
  const financeHealth=typeof derivedFinanceHealth==="function"?derivedFinanceHealth():50;
  const p=projectDependencyProfile(project);
  const signals={
    hardware:clamp((company.chip||0)*.35+(company.quality||0)*.28+(company.integration||0)*.20+(100-(company.manufacturing?.supplyRisk||35))*.17,0,100),
    software:clamp((company.software||0)*.38+(company.integration||0)*.28+(company.quality||0)*.18+(company.culture?.communication||50)*.16,0,100),
    manufacturing:clamp((company.manufacturing?.readiness||0)*.30+(company.manufacturing?.yield||50)*.25+(100-(company.manufacturing?.supplyRisk||35))*.25+(company.quality||0)*.20,0,100),
    quality:clamp((company.quality||50)*.55+(100-(company.simulationMetrics?.counters?.qualityMistakes||0)*2)*.20+(company.culture?.qualityDiscipline||50)*.15+(100-(company.manufacturing?.supplyRisk||35))*.10,0,100),
    customer:clamp((company.customerSentiment??customerSentiment??company.trust??50)*.50+(company.trust||50)*.25+(company.market?.hardwareDemand||50)*.12+(company.market?.aiDemand||50)*.13,0,100),
    people:clamp(morale*.35+cohesion*.25+(100-avgStress())*.25+(company.culture?.workLife||50)*.15,0,100),
    finance:financeHealth,
    trust:clamp((company.trust||50)*.65+(company.board||50)*.20+(company.leadership?.transparency||55)*.15,0,100),
    innovation:clamp((company.culture?.innovation||50)*.55+(company.market?.aiDemand||50)*.18+(company.market?.hardwareDemand||50)*.12+(company.leadership?.longTermThinking||55)*.15,0,100)
  };
  const entries=Object.entries(p).filter(([,w])=>Number(w)>0),total=entries.reduce((s,[,w])=>s+w,0)||1;
  const score=entries.reduce((s,[k,w])=>s+(signals[k]??50)*w,0)/total;
  return {score:Math.round(clamp(score,0,100)),profile:p,signals};
}
function projectExecutionHealthBreakdown(project){
  const overloadValue=typeof projectOverloadPressure==="function"?projectOverloadPressure(project):0;
  const base=projectIntrinsicHealth(project),condition=projectCompanyConditionScore(project),staffing=clamp(Number(derivedStaffingCoverage(project)),0,100),overload=clamp(Number(project.performance?.workloadOverload??overloadValue),0,100),blockers=Number(project.performance?.blockerCount??0),risk=Number(project.performance?.riskTrend??project.visibleRisk??50);
  const companyModifier=Math.round((condition.score-60)*.35);
  const staffingModifier=Math.round((staffing-75)*.11-overload*.06);
  const riskModifier=Math.round(-Math.max(0,risk-65)*.08-blockers*1.6);
  const current=Math.round(clamp(base+companyModifier+staffingModifier+riskModifier,0,100));
  return {base,companyCondition:condition.score,companyModifier,staffingModifier,riskModifier,current,profile:condition.profile,signals:condition.signals};
}
function projectVisibleHealth(project){
  return projectExecutionHealthBreakdown(project).current;
}
function projectTimingForecast(project){
  if(!project)return {summary:"Timing estimate unavailable.",short:"timing unknown",range:"unknown",target:"unknown"};
  if(project.status==="completed"||Number(project.progress)>=100){
    const day=Number(project.completedDay??project.closedDay);
    const dayText=Number.isFinite(day)?`day ${day+1}`:"a previous review";
    const commercial=project.commercialStatus==="launched"?"Commercial path active":project.commercialStatus==="pilot"?"Commercial pilot active":project.commercialStatus==="ready"||project.commercialStatus==="review queued"?"Commercial review underway":"Development complete";
    return {summary:`Development completed on ${dayText}. ${commercial}.`,short:`Completed on ${dayText}`,range:"complete",target:dayText,status:"complete",confidenceLabel:"high",low:0,high:0,midpoint:0,targetDay:day,deadlineDelta:0};
  }
  const progress=clamp(Number(project.progress)||0,0,99.5),elapsed=Math.max(1,company.day-(project.createdDay??company.day));
  const baseDuration=Math.max(10,Number(project.estimatedDuration)||90),confidence=clamp(Number(project.performance?.strategicConfidence??project.visibleConfidence??55),15,95);
  const risk=clamp(Number(project.performance?.riskTrend??project.visibleRisk??50),0,100),blockers=Number(project.performance?.blockerCount??0),staffing=clamp(Number(derivedStaffingCoverage(project)),0,120),schedulePressure=Number(project.performance?.scheduleVariance??0);
  let midpoint=progress>5?Math.round((100-progress)/Math.max(.35,progress/elapsed)):Math.round(baseDuration*Math.max(.25,(100-progress)/100));
  midpoint=Math.round(midpoint*(1+Math.max(0,risk-55)*.006+Math.max(0,70-staffing)*.008+blockers*.08+Math.max(0,schedulePressure)*.004));
  midpoint=clamp(midpoint,3,420);
  const uncertainty=Math.round(clamp(8+(100-confidence)*.18+risk*.10+blockers*3+Math.max(0,70-staffing)*.08,5,60));
  const low=Math.max(1,Math.round(midpoint*(1-uncertainty/140))),high=Math.max(low+1,Math.round(midpoint*(1+uncertainty/95))),targetDay=company.day+midpoint,deadline=Number(project.deadlineDay)||targetDay,deadlineDelta=targetDay-deadline;
  const status=deadlineDelta>7?"likely late":deadlineDelta<-7?"ahead of plan":"near plan",confidenceLabel=confidence>=75?"high":confidence>=55?"medium":"low";
  const rangeText=low===high?`${low} ${low===1?"day":"days"}`:`${low}-${high} days`;
  return {summary:`Estimated completion: ${rangeText}, target day ${targetDay+1}; ${status}, ${confidenceLabel} confidence.`,short:`${rangeText}, target day ${targetDay+1}`,range:rangeText,target:`day ${targetDay+1}`,status,confidenceLabel,low,high,midpoint,targetDay,deadlineDelta};
}
function projectStrategicImportance(project){return clamp(Number(project.priority??project.estimatedBenefit??project.visibleConfidence??50),0,100);}
function projectStatusWeight(status){
  return ({proposal:.15,planning:.55,approved:.65,prototype:.75,execution:1,verification:1,pilot:1.1,scaling:1.15,"at risk":.9,blocked:.75,paused:.35,completed:.2,canceled:0,failed:0,rejected:0,merged:0}[status]??.75);
}
function normalizedCommittedBudget(project){const max=Math.max(1,...[...(company.projects||[]),...(company.projectProposals||[])].map(p=>Number(p.budgetApproved||p.estimatedCost||0)));return clamp(Number(project.budgetApproved||project.estimatedCost||0)/max,0,1);}
function normalizedRequiredHeadcount(project){const total=Object.values(project.requiredHeadcount||{}).reduce((s,v)=>s+(Number(v)||0),0);return clamp(total/8,0,1);}
function normalizedCustomerImpact(project){return clamp(Number(project.customerImpact??project.customerInterest??project.performance?.customerInterest??project.estimatedBenefit??0)/100,0,1);}
function normalizedBoardPriority(project){return clamp((Number(project.boardPriority??project.priority??project.visibleConfidence??50))/100,0,1);}
function projectWeight(project){
  const weight=(.5+projectStrategicImportance(project)/100)*projectStatusWeight(project.status)*(.5+normalizedCommittedBudget(project))*(.5+normalizedRequiredHeadcount(project))*(.5+normalizedCustomerImpact(project))*(.5+normalizedBoardPriority(project));
  return clamp(weight,0,4);
}
function projectMatchesCategory(project,category){
  const text=String(`${project.family||""} ${project.title||""} ${project.proposingDepartment||""} ${(project.requiredDepartments||[]).join(" ")}`).toLowerCase();
  if(category==="hardware")return /hardware|chip|accelerator|sensor|edge|verification/.test(text)||(project.requiredDepartments||[]).includes("hardware");
  if(category==="software")return /software|firmware|sdk|portal|telemetry|integration/.test(text)||(project.requiredDepartments||[]).includes("software");
  if(category==="manufacturing")return /manufactur|supplier|yield|capacity|quality/.test(text)||(project.requiredDepartments||[]).includes("quality");
  return true;
}
function weightedProjectMetric(projects,metric){
  const rows=projects.map(p=>({value:metric(p),weight:projectWeight(p)})).filter(x=>Number.isFinite(x.value)&&x.weight>0);
  const total=rows.reduce((s,x)=>s+x.weight,0);
  return total?rows.reduce((s,x)=>s+x.value*x.weight,0)/total:null;
}
function relevantProjects(category,{includePaused=false}={}){
  ensureProjectPortfolio();
  const statuses=includePaused?["approved","planning","prototype","execution","verification","pilot","scaling","at risk","blocked","paused"]:["approved","planning","prototype","execution","verification","pilot","scaling","at risk","blocked"];
  const active=(company.projects||[]).filter(p=>statuses.includes(p.status)&&projectMatchesCategory(p,category));
  const completed=(company.projectArchive||[]).filter(p=>p.status==="completed"&&projectMatchesCategory(p,category)).slice(0,6);
  return [...active,...completed];
}
function derivedFinanceHealth(){
  const f=company.finance||{},runway=f.runwayDays>=999?100:clamp((f.runwayDays||0)/180*100,0,100),flow=clamp(50+(Number(f.netCashFlowDaily||0)*420),0,100),cash=clamp(company.cash/20*100,0,100);
  return Math.round(runway*.45+flow*.35+cash*.20);
}
function weightedEmployeeMorale(){
  const active=employees.filter(e=>e.active);
  const rows=active.map(e=>({value:e.morale,weight:1+(e.skills?.leadership||35)/120}));
  const total=rows.reduce((s,x)=>s+x.weight,0);
  return total?rows.reduce((s,x)=>s+x.value*x.weight,0)/total:null;
}
function derivedCompanyMorale(){
  const base=weightedEmployeeMorale()??50;
  const customerPressure=clamp((company.customers||0)/90,0,4);
  const manufacturingPressure=clamp(((company.manufacturing?.supplyRisk||0)-55)*.08,0,4);
  const investorPressure=clamp((55-(company.shareholders?.confidence??derivedInvestorConfidence?.()??55))*.08,0,5);
  const growthPressure=(company.phase==="launched"||company.customers>40)?clamp((company.dailyRevenue||0)*2.4+(company.customers||0)/150,0,3):0;
  const uncertaintyPressure=clamp((company.companyRiskComponents?.total||0)-35,0,45)*.035;
  const cultureLift=(company.organizationalMomentum?.culture||0)*.05+(company.culture?.workLife-55)*.04+(company.culture?.communication-55)*.035;
  const raw=base+cultureLift-Math.max(0,avgStress()-70)*.2-customerPressure-manufacturingPressure-investorPressure-growthPressure-uncertaintyPressure;
  return Math.round(clamp(raw,0,98));
}
function derivedCohesion(){
  const active=employees.filter(e=>e.active),relationships=active.length?active.reduce((s,e)=>s+averageRelationship(e),0)/active.length:0;
  const relScore=clamp(50+relationships,0,100),collab=clamp((company.simulationMetrics?.counters?.collaborations||0)/Math.max(1,company.day+1)*12+45,0,100);
  const layoffPenalty=(company.layoffHistory||[]).filter(x=>company.day-(x.day||0)<45).length*8,resignPenalty=(company.history||[]).filter(h=>/resigned|retired|terminated|layoff/i.test(h.text||"")&&company.day-(h.day||0)<45).length*3;
  return Math.round(clamp(relScore*.25+collab*.20+company.trust*.15+averageTeamCohesion()*.15+(company.culture?.communication||50)*.10+(100-avgStress())*.15-layoffPenalty-resignPenalty,0,100));
}
function derivedTrust(){
  const active=employees.filter(e=>e.active),ceo=active.reduce((s,e)=>s+(e.opinionOfCEO?.trust??company.trust),0)/Math.max(1,active.length),fair=active.reduce((s,e)=>s+(e.opinionOfCEO?.fairness??55),0)/Math.max(1,active.length);
  return Math.round(clamp(ceo*.55+(company.leadership?.transparency||55)*.15+fair*.15+(company.leadership?.accountability||55)*.15,0,100));
}
function derivedCustomerSentiment(){
  ensureCustomerMarketSystems?.();
  if((company.customers||0)>0&&company.customerSegments)return Math.round(company.customerSentiment??50);
  if((company.customers||0)<=0&&company.phase!=="pilot"&&company.phase!=="customer trial")return null;
  const support=clamp(100-avgStress()*.35+(company.culture?.communication||50)*.35,0,100),delivery=clamp((company.manufacturing?.readiness||0)*.45+(company.manufacturing?.yield||50)*.35+(100-(company.manufacturing?.supplyRisk||0))*.20,0,100),feature=clamp((company.market?.aiDemand||50)*.45+(company.integration||0)*.35+(company.software||0)*.20,0,100),reputation=clamp((company.trust||0)*.55+(company.board||0)*.25+(company.quality||0)*.20,0,100),marketFit=clamp((company.market?.hardwareDemand||50)*.45+(company.market?.aiDemand||50)*.45-(company.market?.competitorHeat||50)*.15,0,100);
  const complaintPenalty=Math.max(0,60-company.quality)*.35+Math.max(0,(company.manufacturing?.supplyRisk||0)-65)*.25;
  return Math.round(clamp(company.quality*.25+support*.20+delivery*.15+company.trust*.10+feature*.10+reputation*.10+marketFit*.10-complaintPenalty,0,100));
}
function derivedManufacturingHealth(){
  const post=company.phase==="launched";
  const mfgProjects=relevantProjects("manufacturing",{includePaused:true}),weightedHealth=weightedProjectMetric(mfgProjects,projectVisibleHealth);
  if(!post){
    if(!mfgProjects.length&&company.phase==="prototype"&&(company.manufacturing?.readiness||0)<5)return null;
    return Math.round(clamp((100-(company.manufacturing?.supplyRisk||35))*.20+(company.manufacturing?.readiness||0)*.25+(weightedHealth??company.quality)*.25+company.quality*.15+company.integration*.15,0,100));
  }
  const yieldScore=company.manufacturing?.yield??50,supplier=100-(company.manufacturing?.supplyRisk||0),fulfillment=clamp((company.manufacturing?.capacity||0)-(company.customers||0)*.08+70,0,100),defect=clamp(100-(company.simulationMetrics?.counters?.qualityMistakes||0)*2,0,100),capacity=clamp(company.manufacturing?.capacity||0,0,100),staffing=company.staffingModel?.quality?.skillCoverage??derivedStaffingCoverage({requiredHeadcount:{quality:1},assignedEmployees:[]});
  return Math.round(clamp(yieldScore*.25+supplier*.20+fulfillment*.20+defect*.15+capacity*.10+staffing*.10,0,100));
}
function investorTrendScore(days=30){
  const move=valuationChange?.(days)||0;
  return clamp(50+move*1.35,0,100);
}
function derivedInvestorConfidence(portfolioHealth){
  ensureMarketValuationSystems?.();
  const trendScore=investorTrendScore(30),volatility=valuationVolatility?.(60)||0,boardStability=clamp(company.board-(company.boardGovernance?.strikes||0)*12-(company.boardControlPressure||0)*.15,0,100);
  const dilutionPenalty=clamp((company.investorOwnership||0)*.10+(company.boardControlPressure||0)*.08,0,18);
  const missedGuidancePenalty=clamp((company.portfolioHealth?.averageScheduleVariance||0)*.25+(company.portfolioHealth?.atRiskProjects||0)*2.5,0,18);
  const publicFailurePenalty=clamp((company.boardGovernance?.strikes||0)*4+(company.crisis?8:0)+(company.companyRiskComponents?.total>75?6:0),0,20);
  const customerLift=clamp((company.customers||0)*.08+(company.dailyRevenue||0)*24,0,10);
  const score=(company.marketConfidence||50)*.30+trendScore*.20+(company.valuationQuality||50)*.15+(company.investorAppetite||50)*.15+(company.leadershipReputation||50)*.10+boardStability*.10+customerLift-volatility*.65-dilutionPenalty-missedGuidancePenalty-publicFailurePenalty;
  return Math.round(clamp(score,0,100));
}
function boardConfidenceTarget(morale=null,stress=null){
  const finance=company.finance||{},portfolio=company.portfolioHealth||{},risk=company.companyRiskComponents||{};
  const runway=Number(finance.runwayDays??999),net=Number(finance.netCashFlowDaily||0),avgMorale=morale??weightedEmployeeMorale?.()??60,avgStressValue=stress??avgStress();
  const runwayScore=runway>=999?82:clamp(runway*.62,0,92);
  const cashScore=clamp((company.cash||0)*5.2,0,92);
  const executionScore=clamp(72-(portfolio.atRiskProjects||0)*8-Math.max(0,portfolio.averageScheduleVariance||0)*.55-Math.max(0,portfolio.averageBudgetVariance||0)*.35+(portfolio.activeProjects?6:0),0,96);
  const peopleScore=clamp(avgMorale*.55+(100-avgStressValue)*.35+(employees.filter(e=>e.active).length>=6?8:0),0,96);
  const marketScore=clamp((derivedInvestorConfidence?.()??50)*.45+(company.trust||50)*.25+(company.customerSentiment||50)*.20+(company.leadershipReputation||50)*.10,0,96);
  const governancePenalty=(company.boardGovernance?.strikes||0)*13+(company.boardControlPressure||0)*.10+(company.crisis?8:0)+Math.max(0,(risk.total||0)-55)*.22;
  const target=runwayScore*.22+cashScore*.12+executionScore*.22+peopleScore*.16+marketScore*.20+(company.leadership?.accountability||55)*.08-governancePenalty;
  return clamp(target,5,98);
}
function updateBoardConfidenceDaily(morale,stress){
  const target=boardConfidenceTarget(morale,stress);
  let next=(company.board||50)*.985+target*.015;
  if((company.board||0)>92&&target<(company.board||0))next-=.12+((company.board||0)-92)*.03;
  if(next>98&&target<97)next=98;
  company.board=clamp(next,0,100);
}
function applyDailyOrganizationalPressure(morale,stress){
  const finance=company.finance||{},portfolio=company.portfolioHealth||{},risk=company.companyRiskComponents||{};
  const runway=Number(finance.runwayDays??999),net=Number(finance.netCashFlowDaily||0);
  const runwayPressure=runway>=999?0:clamp((140-runway)/140,0,1);
  const burnPressure=clamp(Math.abs(Math.min(0,net))/.18,0,1);
  const capacityPressure=clamp((company.projectCapacity?.totalOverload||0)/Math.max(1,company.projectCapacity?.totalCapacity||1),0,1);
  const projectPressure=clamp((portfolio.atRiskProjects||0)*.18+Math.max(0,portfolio.averageScheduleVariance||0)*.012+Math.max(0,portfolio.projectDrivenOpenRoles||0)*.08+capacityPressure*.32,0,1);
  const boardPressure=clamp((100-(company.board||50))/100+(company.boardGovernance?.strikes||0)*.18+(company.boardControlPressure||0)*.004,0,1);
  const systemicPressure=clamp((risk.total||0)/100,0,1);
  const startupPressure=company.phase==="launched"?.04:.12;
  const pressure=clamp(startupPressure+runwayPressure*.28+burnPressure*.18+projectPressure*.24+boardPressure*.12+systemicPressure*.18,0,1);
  if(pressure<=.05)return;
  const active=employees.filter(e=>e.active);
  active.forEach(e=>{
    const resilience=clamp((e.opinionOfCEO?.trust||55)*.004+(e.learning?.recovery||0)*.01+(e.learnedLessons?.planning||0)*.006,0,.45);
    const personal=pressure*(1-resilience);
    e.stress=clamp(e.stress+personal*2.6,0,100);
    e.morale=clamp(e.morale-personal*2.2-(e.morale>88?Math.min(.45,(e.morale-88)*.035):0),0,100);
    if(personal>.45)adjustCEOOpinionSafe(e,{support:-.25,trust:-.12,fear:.08});
  });
}
function adjustCEOOpinionSafe(e,delta){if(typeof adjustCEOOpinion==="function")adjustCEOOpinion(e,delta);}
function derivedShareholderConfidence(portfolioHealth){return derivedInvestorConfidence(portfolioHealth);}
function healthTrend(key,current){
  if(current===null||current===undefined)return "";
  const rows=(company.operatingHealthHistory||[]).filter(r=>company.day-(r.day??company.day)<=14&&Number.isFinite(r[key]));
  if(rows.length<3)return "Stable";
  const avg=rows.reduce((s,r)=>s+Number(r[key]||0),0)/rows.length,delta=current-avg;
  return delta>3?"Up":delta<-3?"Down":"Stable";
}
function fmtHealth(value,suffix=""){return value===null||value===undefined?"N/A":`${Math.round(value)}${suffix}`;}
function derivedOperatingHealth(){
  ensureProjectPortfolio();updatePortfolioHealth();
  const hardwareProjects=relevantProjects("hardware",{includePaused:true}),softwareProjects=relevantProjects("software",{includePaused:true}),allProjects=relevantProjects("all",{includePaused:true});
  const hwHealth=weightedProjectMetric(hardwareProjects,projectVisibleHealth),hwProgress=weightedProjectMetric(hardwareProjects,p=>p.progress||0),hwQuality=weightedProjectMetric(hardwareProjects,p=>p.performance?.quality??p.quality??company.quality),hwStaffing=weightedProjectMetric(hardwareProjects,p=>p.performance?.staffingCoverage??derivedStaffingCoverage(p));
  const swHealth=weightedProjectMetric(softwareProjects,projectVisibleHealth),swProgress=weightedProjectMetric(softwareProjects,p=>p.progress||0),swQuality=weightedProjectMetric(softwareProjects,p=>p.performance?.quality??p.quality??company.quality),swStaffing=weightedProjectMetric(softwareProjects,p=>p.performance?.staffingCoverage??derivedStaffingCoverage(p));
  const portfolioHealth=weightedProjectMetric(allProjects,projectVisibleHealth),portfolioProgress=weightedProjectMetric(allProjects,p=>p.progress||0),portfolioQuality=weightedProjectMetric(allProjects,p=>p.performance?.quality??p.quality??company.quality),portfolioRisk=weightedProjectMetric(allProjects,p=>p.performance?.riskTrend??p.visibleRisk??50);
  const hardwareHealth=hwHealth===null?null:Math.round(clamp(hwHealth*.55+(hwProgress??0)*.20+(hwQuality??company.quality)*.10+(hwStaffing??50)*.10+company.integration*.05,0,100));
  const softwareHealth=swHealth===null?null:Math.round(clamp(swHealth*.50+(swProgress??0)*.20+(swQuality??company.quality)*.15+(swStaffing??50)*.10+company.integration*.05,0,100));
  const manufacturingHealth=derivedManufacturingHealth(),customerSentiment=derivedCustomerSentiment(),morale=derivedCompanyMorale(),trust=derivedTrust(),teamCohesion=derivedCohesion(),financeHealth=derivedFinanceHealth(),investorConfidence=derivedInvestorConfidence(portfolioHealth),shareholderConfidence=investorConfidence;
  const data={hardwareHealth,softwareHealth,manufacturingHealth,customerSentiment,investorConfidence,shareholderConfidence,teamCohesion,morale,trust,portfolioHealth:portfolioHealth===null?null:Math.round(portfolioHealth),portfolioProgress:portfolioProgress===null?null:Math.round(portfolioProgress),portfolioQuality:portfolioQuality===null?null:Math.round(portfolioQuality),portfolioRisk:portfolioRisk===null?null:Math.round(portfolioRisk),financeHealth,labels:{hardware:company.phase==="launched"?"Hardware Product Health":"Hardware Development",software:company.phase==="launched"?"Software Product Health":"Software Development",manufacturing:company.phase==="launched"?"Manufacturing Health":"Manufacturing Readiness",customer:(company.customers||0)>0||company.phase==="pilot"||company.phase==="customer trial"?"Customer Sentiment":"Customer Validation"},trace:{}};
  data.trace={hardwareHealth:{value:hardwareHealth,contributors:hardwareProjects.slice(0,4).map(p=>({name:p.title,value:projectVisibleHealth(p),weight:Number(projectWeight(p).toFixed(2))}))},softwareHealth:{value:softwareHealth,contributors:softwareProjects.slice(0,4).map(p=>({name:p.title,value:projectVisibleHealth(p),weight:Number(projectWeight(p).toFixed(2))}))},portfolioHealth:{value:data.portfolioHealth,contributors:allProjects.slice(0,6).map(p=>({name:p.title,value:projectVisibleHealth(p),weight:Number(projectWeight(p).toFixed(2))}))}};
  ["hardwareHealth","softwareHealth","manufacturingHealth","customerSentiment","investorConfidence","shareholderConfidence","teamCohesion","morale","trust","portfolioHealth","financeHealth"].forEach(k=>data[k+"Trend"]=healthTrend(k,data[k]));
  return data;
}
function recordOperatingHealthSnapshot(){
  company.operatingHealthHistory=Array.isArray(company.operatingHealthHistory)?company.operatingHealthHistory:[];
  const h=derivedOperatingHealth();
  const snapshot={day:company.day,hardwareHealth:h.hardwareHealth,softwareHealth:h.softwareHealth,manufacturingHealth:h.manufacturingHealth,customerSentiment:h.customerSentiment,investorConfidence:h.investorConfidence,shareholderConfidence:h.shareholderConfidence,teamCohesion:h.teamCohesion,morale:h.morale,trust:h.trust,portfolioHealth:h.portfolioHealth,financeHealth:h.financeHealth};
  company.operatingHealthHistory=[...company.operatingHealthHistory.filter(x=>x.day!==company.day),snapshot].slice(-120);
  return h;
}
function maybeQueueBoardPortfolioConcern(){
  ensureProjectPortfolio();updatePortfolioHealth();
  if(company.day<30||company.day%17!==0||openRequestExists("portfolio-board","review"))return;
  const h=company.portfolioHealth,concerns=[];
  if(h.activeProjects>5)concerns.push("too many active projects");
  if(h.activeProjects<1&&company.phase!=="prototype")concerns.push("weak project pipeline");
  if(h.atRiskProjects>=2)concerns.push("multiple projects at risk");
  if(h.concentrationRisk>70&&h.activeProjects>=3)concerns.push("portfolio concentration risk");
  if(h.averageBudgetVariance>35)concerns.push("repeated budget overrun");
  const snapshot=buildExecutiveIntelligenceSnapshot();
  if((snapshot.topRisks||[]).some(r=>/project|portfolio|deadline|staffing|quality/i.test(`${r.title} ${r.detail}`)))concerns.push("recent operating reports point to project execution risk");
  if((snapshot.suppressedReportFindings||[]).some(s=>s.severeCount>0))concerns.push("serious filtered reports may be obscuring portfolio risk");
  if(!concerns.length)return;
  company.escalationQueue.push({id:`portfolio-board-review-${company.day}`,repeatable:false,category:"project",title:"Board portfolio review",copy:`The board flagged ${concerns.join(", ")}.`,generatedCommunication:{type:"Board Portfolio Letter",priority:"Decision Needed",sender:{name:"Board Strategy Committee",role:"Board"},subject:"Portfolio Discipline Review",message:`The board reviewed the project portfolio and flagged: ${concerns.join(", ")}. The CEO should set a portfolio direction without micromanaging project execution.`,recs:[["Board","Restore portfolio discipline",82],["Finance",h.totalProjectSpendDaily>.12?"Reduce project burn":"Keep spending tied to milestones",72],["Portfolio","Use gated reviews and cancellation discipline",76]],impacts:["Board confidence may change","Project reviews may be accelerated","Hiring and restructuring pressure may follow"]},choices:[{title:"Order portfolio triage",detail:"Queue reviews for the riskiest projects.",effect:{board:1},directive:"quality",days:7,portfolioAction:"triage",strategy:"risk-control",benefits:["forces evidence review"],risks:["slows momentum"],uncertainty:"Material",estimatedConfidence:68},{title:"Protect growth bets",detail:"Accept risk to preserve upside.",effect:{board:-2,trust:1},directive:"speed",days:8,portfolioAction:"protect-growth",strategy:"growth",benefits:["preserves upside"],risks:["board patience falls"],uncertainty:"High",estimatedConfidence:48},{title:"Cut project burn",detail:"Reduce scope across the active portfolio.",effect:{board:3},directive:"cuts",days:8,portfolioAction:"cut-burn",strategy:"cost-control",benefits:["improves runway"],risks:["morale and opportunity loss"],uncertainty:"Material",estimatedConfidence:58}]});
}
function generateProjectProposal(){
  ensureProjectPortfolio();
  if(company.day<8||company.projectProposals.length>4)return;
  const recent=[...company.projectProposals,...company.projects].filter(p=>company.day-(p.createdDay||0)<22).length;
  const chance=.025+(company.culture.innovation-50)*.0008+(company.market.aiDemand-50)*.0006-recent*.015;
  if(simulationRandom()>chance)return;
  const dormant=dormantProjectRevivalCandidate();
  if(dormant&&simulationRandom()<.35){
    const proposal=makeRevivalProjectProposal(dormant);
    company.projectProposals.unshift(proposal);
    recordWeeklyEvent(`${proposal.title} revived a dormant project idea with new evidence.`,"project",4);
    recordHistory(`${proposal.title} entered portfolio review as a successor to ${dormant.title}.`,"project",4);
    employees.filter(e=>e.active&&roleDepartment(e.role)===proposal.proposingDepartment).forEach(e=>{
      e.projectAffinity[proposal.id]={interest:62,identity:44,pride:38,frustration:0,ownership:36,fatigue:0};
      addMemory(e,"PROJECT_REVIVAL",`${dormant.title} may have a second chance under changed conditions.`,"neutral",8,proposal.title);
    });
    return;
  }
  const originTypes=["employee","department","customer","market","board"],originType=originTypes[Math.floor(simulationRandom()*originTypes.length)];
  const originator=originType==="employee"?employees.filter(e=>e.active).sort((a,b)=>(b.skills?.communication||0)+(b.skills?.leadership||0)-(a.skills?.communication||0)-(a.skills?.leadership||0))[0]:null;
  const families=projectFamilies(),bucket=originType==="customer"||originType==="market"?["hardware","software","business"]:originType==="board"?["business","internal"]:Object.keys(families);
  const list=bucket.flatMap(k=>families[k]||[]),family=list[Math.floor(simulationRandom()*list.length)];
  const proposal=makeProject({family,originType,originatorId:originator?.id??null,status:"proposal",scope:1});
  company.projectProposals.unshift(proposal);
  if(originator){originator.proposalHistory.unshift({day:company.day,projectId:proposal.id,status:"proposed"});originator.projectAffinity[proposal.id]={interest:70,identity:55,pride:45,frustration:0,ownership:50,fatigue:0};}
  recordWeeklyEvent(`${proposal.title} was proposed by ${originType}.`,"project",4);
  recordHistory(`${proposal.title} entered portfolio review from ${originType}.`,"project",4);
}
function makeProjectProposalEvent(p){
  const canFund=company.cash>Math.max(2,p.estimatedCost*.18),hasCapacity=p.requiredDepartments.some(d=>(company.staffingModel?.[d]?.current||0)>0);
  const timing=projectTimingForecast(p);
  const successorNote=p.sourceProjectId?` This is a successor to ${p.predecessorTitle||"a dormant project"}; changed-condition evidence: ${(p.revivalReasons||[]).slice(0,3).join("; ")||"department reassessment"}.`:"";
  const choices=[
    {title:"Approve pilot",detail:"Fund a smaller first phase with milestone gates.",effect:{cash:-Math.min(.8,p.estimatedCost*.12),board:1},directive:"quality",days:8,projectDecision:{id:p.id,action:"pilot"},strategy:"balanced",benefits:["learns before full commitment","creates project work","limits initial risk"],risks:["slower benefit","still consumes staffing"],uncertainty:"Material",estimatedConfidence:clamp(p.visibleConfidence+projectLessonBias("pilotValue")*1.5,35,92)},
    canFund&&hasCapacity?{title:"Approve full project",detail:"Commit the company to the proposed project.",effect:{cash:-Math.min(1.8,p.estimatedCost*.25),board:p.visibleRisk<65?2:-1},directive:"speed",days:10,projectDecision:{id:p.id,action:"approve"},strategy:"growth",benefits:["creates growth option","signals ambition","supports project identity"],risks:["large staffing demand","budget overrun risk"],uncertainty:"High",estimatedConfidence:Math.max(35,p.visibleConfidence-8)}:null,
    {title:"Delay one quarter",detail:"Keep the proposal alive while protecting focus.",effect:{board:0},directive:"quality",days:5,projectDecision:{id:p.id,action:"delay"},strategy:"finance",benefits:["protects runway","waits for more evidence"],risks:["timing window may close","originators may lose trust"],uncertainty:"Material",estimatedConfidence:55},
    {title:"Reject proposal",detail:"Decline the project and keep the current portfolio focused.",effect:{board:1},directive:null,days:0,projectDecision:{id:p.id,action:"reject"},strategy:"focus",benefits:["avoids distraction","protects cash"],risks:["missed opportunity","innovation morale may fall"],uncertainty:"Material",estimatedConfidence:50}
  ].filter(Boolean);
  const riskLabel=typeof qualitativeBand==="function"?qualitativeBand(p.visibleRisk,{low:35,high:70,lowText:"contained",midText:"visible",highText:"elevated"}):p.visibleRisk;
  const confidenceLabel=typeof qualitativeBand==="function"?qualitativeBand(p.visibleConfidence,{low:40,high:70,lowText:"early",midText:"credible",highText:"strong"}):p.visibleConfidence;
  return {id:`project-proposal-${p.id}`,repeatable:false,category:"project",title:`${p.sourceProjectId?"Successor project proposal":"Project proposal"}: ${p.codename}`,copy:`${p.title}. Estimated cost $${p.estimatedCost}M, working estimate ${timing.range}, ${riskLabel} visible risk, and ${confidenceLabel} evidence.${successorNote}`,generatedCommunication:{type:"Portfolio Memo",priority:"Decision Needed",sender:{name:"Portfolio Council",role:"Strategy"},subject:`${p.sourceProjectId?"Successor Project Proposal":"Project Proposal"} - ${p.title}`,message:`Origin: ${p.originType}. Purpose: ${p.strategicNarrative} ${successorNote} ${timing.summary} Estimated staffing demand: ${p.requiredDepartments.map(teamDisplayName).join(", ")}. Unknowns include supplier timing, customer adoption, competitor response, and technical validation.`,recs:[[teamDisplayName(p.proposingDepartment),`${p.sourceProjectId?"Approve only as a gated successor if the evidence is credible":"Approve a gated pilot if capacity is available"}; timing estimate ${timing.range}`,p.visibleConfidence],["Finance",company.cash<p.estimatedCost*.4?"Protect runway and phase spending":"Fundable with milestone discipline",Math.round(clamp(80-p.estimatedCost*5,35,82))],["Board",p.estimatedBenefit>65?"Portfolio needs growth options":"Require evidence before scaling",65]],impacts:[`Portfolio estimate: ${timing.summary}`,p.sourceProjectId?"The old project remains archived; this is a new successor proposal":"Project work items will be generated","Staffing demand may create hiring requests","Future reviews may recommend pause, expansion, or cancellation"]},choices:choices.slice(0,3)};
}
function compatibleProjectFor(project){
  return activeProjects().find(p=>p.id!==project.id&&(p.proposingDepartment===project.proposingDepartment||p.family===project.family||p.requiredDepartments.some(d=>(project.requiredDepartments||[]).includes(d))))||null;
}
function choicesForProjectControl(p,requested="review"){
  const risk=p.performance?.riskTrend||p.visibleRisk||50,merge=compatibleProjectFor(p),cashRoom=company.cash>Math.max(3,p.estimatedCost*.15),canExpand=cashRoom&&(p.performance?.staffingCoverage||0)>55&&p.status!=="paused";
  const pilotConfidence=clamp(64+projectLessonBias("pilotValue")*2+projectLessonBias("customerValidation"),35,88),cancelConfidence=clamp(45+projectLessonBias("cancellationTiming")*2+projectLessonBias("sunkCostDiscipline")*1.4,30,86),scopeConfidence=clamp(63+projectLessonBias("scopeControl")*1.8,35,88);
  const base={
    continue:{title:"Continue unchanged",detail:"Keep the current project plan.",effect:{board:risk<70?1:-1},projectDecision:{id:p.id,action:"continue"},strategy:"balanced",benefits:["preserves momentum"],risks:["current risks remain"],uncertainty:"Material",estimatedConfidence:62},
    resume:{title:"Resume project",detail:"Restart paused work and return the project to active execution.",effect:{cash:-Math.min(.45,(p.estimatedCost||1)*.06),board:risk<65?1:-1},directive:"speed",days:5,projectDecision:{id:p.id,action:"resume"},strategy:"restart",benefits:["restores project momentum","keeps prior investment useful"],risks:["spending and staffing pressure resume","pause may have cost market timing"],uncertainty:"Material",estimatedConfidence:clamp(62+(p.performance?.staffingCoverage||60)*.15-risk*.12,38,82)},
    pause:{title:"Pause and reduce risk",detail:"Stop most spending and let departments stabilize.",effect:{cash:.1,board:risk>70?1:-1},directive:"quality",days:6,projectDecision:{id:p.id,action:"pause"},strategy:"risk-control",benefits:["reduces pressure","protects runway"],risks:["timing window may narrow"],uncertainty:"Material",estimatedConfidence:58},
    cancel:{title:"Cancel project",detail:"Close the project and absorb the sunk cost.",effect:{board:risk>80?2:-3,trust:-1},directive:"cuts",days:5,projectDecision:{id:p.id,action:"cancel"},strategy:"focus",benefits:["releases capacity","stops future spend"],risks:["morale and opportunity loss","possible later regret"],uncertainty:"High",estimatedConfidence:cancelConfidence},
    reduce:{title:"Reduce scope",detail:"Keep the project but narrow the next milestone.",effect:{cash:.05,board:1},directive:"quality",days:6,projectDecision:{id:p.id,action:"reduce"},strategy:"scope-control",benefits:["reduces cost and risk","preserves knowledge"],risks:["smaller benefit","possible team frustration"],uncertainty:"Material",estimatedConfidence:scopeConfidence},
    expand:canExpand?{title:"Increase budget",detail:"Fund a larger push while the window is open.",effect:{cash:-Math.min(1.2,p.estimatedCost*.18),board:2},directive:"speed",days:8,projectDecision:{id:p.id,action:"expand"},strategy:"growth",benefits:["raises upside","accelerates learning"],risks:["budget and staffing pressure rise"],uncertainty:"High",estimatedConfidence:52}:null,
    split:{title:"Split into phases",detail:"Create a smaller phase plan with clearer gates.",effect:{board:1},directive:"quality",days:7,projectDecision:{id:p.id,action:"split"},strategy:"gated",benefits:["improves control","keeps option value"],risks:["slower payoff"],uncertainty:"Material",estimatedConfidence:66},
    merge:merge?{title:"Merge with compatible work",detail:`Combine with ${merge.codename} to reduce duplicate effort.`,effect:{board:1},directive:"quality",days:7,projectDecision:{id:p.id,action:"merge",mergeWith:merge.id},strategy:"coordination",benefits:["reduces overlap","improves coordination"],risks:["integration complexity","identity loss"],uncertainty:"High",estimatedConfidence:49}:null,
    validate:{title:"Require customer validation",detail:"Continue only after stronger customer evidence.",effect:{cash:-.25,trust:1},directive:"quality",days:5,projectDecision:{id:p.id,action:"validate"},strategy:"market-validation",benefits:["reduces market uncertainty"],risks:["delays execution"],uncertainty:"Material",estimatedConfidence:pilotConfidence}
  };
  const pools={cancel:["cancel","reduce","continue"],pause:["pause","reduce","continue"],resume:["resume","reduce","cancel"],expand:["expand","split","continue"],reduce:["reduce","split","continue"],review:p.status==="paused"?["resume","reduce","cancel"]:["continue","reduce","pause","cancel","expand","merge","validate","split"],continue:["continue","expand","validate"]};
  const picked=[];
  for(const key of pools[requested]||pools.review){if(base[key]&&!picked.some(c=>c.title===base[key].title))picked.push(base[key]);if(picked.length===3)break;}
  for(const key of ["continue","pause","cancel"])if(picked.length<3&&base[key]&&!picked.some(c=>c.title===base[key].title))picked.push(base[key]);
  return picked.slice(0,3);
}
function makeProjectControlEvent(p,requested="review"){
  const risk=p.performance?.riskTrend||p.visibleRisk||50;
  const timing=projectTimingForecast(p);
  return {id:`project-control-${requested}-${p.id}-${company.day}`,repeatable:false,category:"project",title:`Portfolio action: ${p.codename}`,copy:`CEO requested a ${requested} memo for ${p.title}. ${timing.summary}`,generatedCommunication:{type:"Portfolio Review",priority:requested==="cancel"||risk>75?"Urgent":"Decision Needed",sender:{name:"Portfolio Council",role:"Strategy"},subject:`Portfolio Action - ${p.title}`,message:`Requested action: ${requested}. Current phase: ${projectStatusLabel(p)}. Progress ${Math.round(p.progress||0)}%, risk ${Math.round(risk)}, spend $${Number(p.budgetSpent||0).toFixed(2)}M, approved budget $${Number(p.budgetApproved||0).toFixed(2)}M, staffing coverage ${p.performance?.staffingCoverage||0}%. ${timing.summary}`,recs:[["Portfolio",risk>75?`Reduce exposure or reset scope; current forecast is ${timing.status}`:`Keep decision tied to milestone evidence; current forecast is ${timing.short}`,74],["Finance",(p.performance?.budgetVariance||0)>25?"Control budget before expanding":"Budget can support a gated decision",68],["Product",(p.customerInterest||0)>60?"Preserve customer learning":"Validate demand before scaling",64]],impacts:[`Timing forecast: ${timing.summary}`,"Decision will route through the normal CEO archive","Project staffing demand and work items may change","Cancellation may create delayed morale, customer, and board effects"]},choices:choicesForProjectControl(p,requested)};
}
function projectMemoKey(ev){
  if(!ev||ev.category!=="project")return null;
  const projectId=ev.projectDecision?.id||ev.commercialProjectId||(ev.choices||[]).map(c=>c.projectDecision?.id||c.commercializeProject?.id).find(Boolean);
  if(!projectId)return null;
  if(String(ev.id||"").startsWith("project-proposal-"))return `project-proposal:${projectId}`;
  if(String(ev.id||"").startsWith("project-control-"))return `project-control:${projectId}`;
  if(String(ev.id||"").startsWith("commercialize-"))return `project-commercial:${projectId}`;
  return `project:${projectId}`;
}
function openProjectMemoExists(ev){
  const key=projectMemoKey(ev);
  if(!key)return false;
  const same=other=>other&&projectMemoKey(other)===key;
  return same(company.pendingEvent)||(company.escalationQueue||[]).some(same);
}
function queuePortfolioMemoOnce(ev,{front=false}={}){
  if(!ev)return false;
  ensureProjectPortfolio();
  if(openProjectMemoExists(ev))return false;
  if(company.pendingEvent){
    front?company.escalationQueue.unshift(ev):company.escalationQueue.push(ev);
    return true;
  }
  if(!front){
    company.escalationQueue.push(ev);
    company.escalationQueue=company.escalationQueue.slice(0,3);
    return true;
  }
  ev.forceImmediate=true;
  company.escalationQueue.unshift(ev);
  company.escalationQueue=company.escalationQueue.slice(0,4);
  if(validationMode){openNextQueuedMemo();return true;}
  company.log.push(`CEO memo queued: ${ev.title}.`);
  return true;
}
function queueImmediatePortfolioMemo(ev){
  return queuePortfolioMemoOnce(ev,{front:true});
}
function queueImmediateExecutiveMemo(ev){
  if(!ev)return;
  ev.forceImmediate=true;
  if(company.pendingEvent){
    company.escalationQueue.unshift(ev);
    return;
  }
  company.escalationQueue.unshift(ev);
  company.escalationQueue=company.escalationQueue.slice(0,4);
  if(validationMode){openNextQueuedMemo();return;}
  company.log.push(`CEO memo queued: ${ev.title}.`);
}
function requestProjectDecision(id,action="review"){
  ensureProjectPortfolio();
  const p=[...company.projects,...company.projectProposals].find(x=>x.id===id);
  if(!p||company.pendingEvent)return;
  const ev=p.status==="proposal"?makeProjectProposalEvent(p):makeProjectControlEvent(p,action);
  if(queueImmediatePortfolioMemo(ev))company.log.push(`Portfolio memo requested for ${p.title}.`);
  if(!validationMode){renderDecisionEvent();render();}
}
function requestProjectCommercialReview(id){
  ensureProjectPortfolio();
  const p=[...(company.projectArchive||[]),...(company.projects||[])].find(x=>x.id===id);
  if(!p||company.pendingEvent)return;
  updateProjectCommercialStats(p);
  if(queueImmediatePortfolioMemo(makeProjectCommercializationEvent(p))){
    p.commercialMemoQueued=true;
    p.commercialStatus=p.commercialStatus==="launched"||p.commercialStatus==="pilot"?p.commercialStatus:"review queued";
    company.log.push(`Commercial review requested for ${p.title}.`);
  }
  if(!validationMode){renderDecisionEvent();render();}
}
function requestStrategicProjectProposal(bucket="hardware"){
  ensureProjectPortfolio();
  const families=projectFamilies()[bucket]||projectFamilies().hardware;
  const proposal=makeProject({family:families[Math.floor(simulationRandom()*families.length)],originType:"CEO strategic initiative",status:"proposal",scope:1});
  company.projectProposals.unshift(proposal);
  if(queueImmediatePortfolioMemo(makeProjectProposalEvent(proposal)))proposal.lastMemoDay=company.day;
  recordHistory(`CEO requested a constrained ${bucket} project proposal: ${proposal.title}.`,"project",4);
  if(!validationMode){renderDecisionEvent();render();}
}
function applyPortfolioAction(action){
  ensureProjectPortfolio();
  const active=activeProjects();
  if(action==="triage"){
    active.sort((a,b)=>(b.performance?.riskTrend||0)-(a.performance?.riskTrend||0)).slice(0,2).forEach(p=>{p.nextReviewDay=company.day;});
    recordHistory("Board portfolio triage accelerated reviews for the riskiest projects.","project",4);
  }else if(action==="protect-growth"){
    active.forEach(p=>{p.priority=clamp((p.priority||50)+4,0,100);p.visibleRisk=clamp((p.visibleRisk||50)+2,0,100);});
    company.culture.riskTolerance=clamp((company.culture.riskTolerance||50)+3,0,100);
    recordHistory("CEO protected growth projects despite board concern.","project",4);
  }else if(action==="cut-burn"){
    active.forEach(p=>{p.scope=clamp((p.scope||1)*.9,.35,4);p.budgetApproved=Number(((p.budgetApproved||p.estimatedCost)*.92).toFixed(2));});
    company.culture.innovation=clamp((company.culture.innovation||55)-2,0,100);
    recordHistory("CEO reduced project burn across the portfolio.","project",4);
  }
}
function applyProjectDecision(decision){
  if(!decision)return;
  ensureProjectPortfolio();
  let p=company.projectProposals.find(x=>x.id===decision.id)||company.projects.find(x=>x.id===decision.id);
  if(!p)return;
  if(decision.action==="approve"||decision.action==="pilot"){
    company.projectProposals=company.projectProposals.filter(x=>x.id!==p.id);p.status=decision.action==="pilot"?"prototype":"planning";p.marketVisibility=decision.action==="pilot"?"rumored":"announced";p.budgetApproved=Math.max(p.budgetApproved||0,decision.action==="pilot"?p.estimatedCost*.35:p.estimatedCost*.75);p.scope=decision.action==="pilot"?Math.max(.55,p.scope*.65):p.scope;p.nextReviewDay=company.day+30;company.projects.unshift(p);
    reinforceProjectLesson(decision.action==="pilot"?"pilotValue":"projectSize",decision.action==="pilot"?.45:.2,p.title,5,"positive");
    recordMajorHistory(`${p.title} was ${decision.action==="pilot"?"approved as a pilot":"approved as a full project"}.`,"project",5);recordWeeklyEvent(`${p.title} entered the active portfolio.`,"project",5);
  }else if(decision.action==="delay"){p.status="delayed";p.nextReviewDay=company.day+45;p.visibleConfidence=clamp(p.visibleConfidence-4,0,100);recordHistory(`${p.title} was delayed for more evidence.`,"project",3);}
  else if(decision.action==="reject"){p.status="rejected";p.closedDay=company.day;archiveProjectOnce(p,"rejected");employees.filter(e=>e.active&&e.projectAffinity?.[p.id]).forEach(e=>{e.morale=clamp(e.morale-3,0,100);adjustCEOOpinion(e,{support:-2,trust:-1});});recordHistory(`${p.title} was rejected during portfolio review.`,"project",4);}
  else if(decision.action==="continue"){p.nextReviewDay=company.day+30;p.status=p.status==="at risk"?"execution":p.status;recordHistory(`${p.title} continued after portfolio review.`,"project",3);}
  else if(decision.action==="resume"){p.status=(p.progress||0)<18?"planning":(p.progress||0)<45?"prototype":"execution";p.nextReviewDay=company.day+21;p.pausedUntil=null;p.visibleRisk=clamp((p.visibleRisk||50)+3,0,100);p.performance={...(p.performance||{}),riskTrend:clamp((p.performance?.riskTrend||p.visibleRisk||50)+3,0,100)};recordHistory(`${p.title} was resumed after a portfolio restart review.`,"project",4);recordWeeklyEvent(`${p.title} resumed after being paused.`,"project",4);}
  else if(decision.action==="pause"){p.status="paused";p.nextReviewDay=company.day+30;p.budgetApproved=Number((p.budgetApproved*.92).toFixed(2));recordHistory(`${p.title} was paused to protect capacity.`,"project",4);}
  else if(decision.action==="reduce"){p.scope=clamp((p.scope||1)*.72,.35,3);p.budgetApproved=Number(Math.max(p.budgetSpent||0,(p.budgetApproved||p.estimatedCost)*.82).toFixed(2));p.visibleRisk=clamp(p.visibleRisk-8,0,100);p.nextReviewDay=company.day+25;reinforceProjectLesson("scopeControl",.85,p.title,7,"positive");reinforceProjectLesson("sunkCostDiscipline",.35,p.title,4,"positive");recordHistory(`${p.title} scope was reduced with milestone gates.`,"project",4);createOrReinforceLesson({key:"project-scope-control",title:"Scope control can preserve project value while reducing execution risk.",department:p.proposingDepartment,vector:{planning:.7,documentation:.45,scopeControl:.8,sunkCostDiscipline:.35},outcome:"positive",confidence:66,evidence:p.title,importance:4});}
  else if(decision.action==="expand"){p.scope=clamp((p.scope||1)*1.28,.5,4);p.marketVisibility=p.marketVisibility==="private"?"rumored":p.marketVisibility;p.budgetApproved=Number(((p.budgetApproved||p.estimatedCost)+Math.min(2.5,p.estimatedCost*.28)).toFixed(2));p.visibleRisk=clamp(p.visibleRisk+7,0,100);p.priority=clamp((p.priority||55)+8,0,100);p.nextReviewDay=company.day+25;reinforceProjectLesson("projectSize",(p.performance?.riskTrend||0)>70?-.35:.35,p.title,5,(p.performance?.riskTrend||0)>70?"contradiction":"positive");recordHistory(`${p.title} received expanded budget and scope.`,"project",4);}
  else if(decision.action==="split"){p.scope=clamp((p.scope||1)*.62,.35,2);p.status="prototype";p.budgetApproved=Number(Math.max(p.budgetSpent||0,(p.budgetApproved||p.estimatedCost)*.72).toFixed(2));p.visibleConfidence=clamp(p.visibleConfidence+5,0,100);p.nextReviewDay=company.day+20;reinforceProjectLesson("pilotValue",.55,p.title,6,"positive");reinforceProjectLesson("estimateAccuracy",.5,p.title,6,"positive");reinforceProjectLesson("scopeControl",.45,p.title,5,"positive");recordHistory(`${p.title} was split into phased milestones.`,"project",4);createOrReinforceLesson({key:"phased-project-control",title:"Phased project gates improve estimate accuracy and cancellation timing.",department:p.proposingDepartment,vector:{planning:.8,documentation:.5,pilotValue:.55,estimateAccuracy:.5},outcome:"positive",confidence:68,evidence:p.title,importance:4});}
  else if(decision.action==="validate"){p.status="pilot";p.customerInterest=clamp((p.customerInterest||45)+6,0,100);p.visibleConfidence=clamp((p.visibleConfidence||50)+7,0,100);p.nextReviewDay=company.day+18;reinforceProjectLesson("customerValidation",.75,p.title,7,"positive");reinforceProjectLesson("marketTiming",.45,p.title,5,"positive");recordHistory(`${p.title} shifted toward customer validation before scaling.`,"project",4);}
  else if(decision.action==="merge"){const other=company.projects.find(x=>x.id===decision.mergeWith);if(other){p.scope=clamp((p.scope||1)+(other.scope||1)*.55,.5,4);p.budgetApproved=Number(((p.budgetApproved||0)+(other.budgetApproved||0)*.65).toFixed(2));p.workItemIds=[...new Set([...(p.workItemIds||[]),...(other.workItemIds||[])])];(company.workItems||[]).filter(w=>w.projectId===other.id).forEach(w=>w.projectId=p.id);p.requiredDepartments=[...new Set([...(p.requiredDepartments||[]),...(other.requiredDepartments||[])])];p.visibleRisk=clamp((p.visibleRisk||50)+5,0,100);other.status="merged";other.closedDay=company.day;archiveProjectOnce(other,"merged");recordHistory(`${other.title} was merged into ${p.title}.`,"project",5);}}
  else if(decision.action==="cancel"){p.status="canceled";p.closedDay=company.day;archiveProjectOnce(p,"canceled");if(p.marketVisibility!=="private")addValuationShock(-1.2,`${p.title} cancellation changed outside expectations`,p.id,30);(company.workItems||[]).filter(w=>w.projectId===p.id).forEach(w=>{w.status="closed";w.closedDay=company.day;});employees.filter(e=>e.active&&e.projectAffinity?.[p.id]).forEach(e=>{e.morale=clamp(e.morale-5+(e.projectAffinity[p.id].fatigue||0)*.05,0,100);e.stress=clamp(e.stress-3,0,100);e.projectHistory.unshift({day:company.day,projectId:p.id,outcome:"canceled"});});company.delayedDecisionEffects.push({dueDay:company.day+10,type:"project-cancel",projectTitle:p.title,projectId:p.id,effect:{board:p.hiddenReality.trueStrategicValue>70?-3:1,trust:p.customerInterest>65?-2:0},people:{morale:p.hiddenReality.trueTalentRetentionValue>65?-3:0,stress:-1},message:`The organization absorbed the cancellation of ${p.title}.`});reinforceProjectLesson("cancellationTiming",p.hiddenReality.trueStrategicValue>70?-.5:.8,p.title,8,p.hiddenReality.trueStrategicValue>70?"contradiction":"positive");reinforceProjectLesson("sunkCostDiscipline",.75,p.title,7,"positive");createOrReinforceLesson({key:"project-cancellation-discipline",title:"Project cancellations must weigh sunk cost, hidden strategic value, market timing, and team identity.",department:p.proposingDepartment,vector:{planning:.65,documentation:.55,cancellationTiming:.8,sunkCostDiscipline:.75,marketTiming:.35},outcome:"mixed",confidence:68,evidence:p.title,importance:5});recordMajorHistory(`${p.title} was canceled and its work was closed or transferred.`,"project",6);}
  company.projectDecisionHistory.unshift({day:company.day,projectId:p.id,title:p.title,action:decision.action});
}
function queueProjectProposalIfNeeded(){
  ensureProjectPortfolio();
  if(company.eventCooldown>0||company.pendingEvent)return;
  const p=company.projectProposals.find(x=>x.status==="proposal"&&company.day-(x.lastMemoDay||-999)>18);
  if(p){
    const ev=makeProjectProposalEvent(p);
    if(!openRequestExists("project-proposal",p.id)&&queuePortfolioMemoOnce(ev)){p.lastMemoDay=company.day;}
  }
}
function maybeQueueProjectReview(){
  ensureProjectPortfolio();
  if(company.day%7!==0)return;
  const p=activeProjects().find(x=>company.day>=(x.nextReviewDay||999)&&!openRequestExists("project-review",x.id));
  if(!p)return;
  p.nextReviewDay=company.day+30;
  const risk=p.performance?.riskTrend||p.visibleRisk||50;
  queuePortfolioMemoOnce(makeProjectControlEvent(p,risk>75?"reduce":"review"));
}
function updateProjectPortfolioSystem(){
  ensureProjectPortfolio();
  generateProjectProposal();
  projectPerformanceUpdate();
  updatePortfolioHealth();
  maybeQueueProjectCommercialization();
  queueProjectProposalIfNeeded();
  maybeQueueProjectReview();
  maybeQueueBoardPortfolioConcern();
}
function assignWorkOwner(work){
  if(!work||work.status!=="open")return;
  const current=employees.find(e=>e.active&&e.id===work.ownerId);
  if(current){if(!work.collaborators.includes(current.id))work.collaborators.push(current.id);return;}
  const candidates=employees.filter(e=>e.active&&employeeTeam(e)===work.assignedTeam);
  const best=candidates.map(e=>({e,score:workSkillFit(e,work)*100+(e.focus||50)*.45+(e.morale||50)*.18-(e.stress||0)*.3})).sort((a,b)=>b.score-a.score)[0]?.e;
  if(best){work.ownerId=best.id;if(!work.collaborators.includes(best.id))work.collaborators.push(best.id);}
}
function activeWorkForEmployee(e){
  const team=employeeTeam(e),brief=e.dailyBriefing||{};
  const ids=Array.isArray(brief.assignedWork)?brief.assignedWork:[];
  return (company.workItems||[]).filter(w=>{
    if(w.status!=="open")return false;
    const project=(company.projects||[]).find(p=>p.id===w.projectId);
    const allocated=project?Number(project.staffAllocations?.[e.id]||0):0;
    const helping=e.activeCollaboration?.workItemId===w.id;
    return ids.includes(w.id)||w.ownerId===e.id||helping||allocated>.05||(!w.projectId&&w.visibleTo.includes(team));
  }).sort((a,b)=>{
    const aProject=(company.projects||[]).find(p=>p.id===a.projectId),bProject=(company.projects||[]).find(p=>p.id===b.projectId);
    const ownerBoost=(b.ownerId===e.id?15:0)-(a.ownerId===e.id?15:0);
    const allocationBoost=(Number(bProject?.staffAllocations?.[e.id]||0)-Number(aProject?.staffAllocations?.[e.id]||0))*30;
    return ownerBoost+allocationBoost+(b.priority-a.priority)+(a.deadlineDay-b.deadlineDay);
  })[0]||null;
}
function workSkillFit(e,work){
  if(!work)return .5;
  const skill=e.skills||{},req=work.requiredSkills||{};
  return Object.entries(req).reduce((s,[k,v])=>s+Math.min(1.25,(skill[k]||35)/Math.max(1,v)),0)/Math.max(1,Object.keys(req).length);
}
function workContext(e){
  const work=activeWorkForEmployee(e),team=employeeTeam(e),t=company.teams?.[team]||{},beliefs=e.beliefs||{},brief=e.dailyBriefing||{};
  const deadlineRisk=work?clamp((7-(work.deadlineDay-company.day))*12+work.priority*.25,0,100):0;
  const blockerRisk=work?.blockedBy?.length?70:Math.max(0,(t.blockedWork||0)*22);
  const qualityConcern=Math.max(work?.qualityRisk||0,beliefs.qualityRisk?.estimate||0,t.defectRisk||0);
  const uncertainty=100-Math.max(beliefs.qualityRisk?.confidence||0,beliefs.launchReadiness?.confidence||0);
  return {work,team,t,brief,deadlineRisk,blockerRisk,qualityConcern,uncertainty,skillFit:workSkillFit(e,work)};
}
function intentionBias(e,ctx){
  const intention=e.currentIntention;
  if(!intention||!ctx.work||intention.workItemId!==ctx.work.id)return {work:0,lab:0,collaborate:0,meeting:0,break:0};
  const step=intention.steps?.[0]||"execute";
  return {
    work:step==="execute"?12:step==="inspect"?7:4,
    lab:step==="verify"||ctx.qualityConcern>62?12:0,
    collaborate:step==="coordinate"||ctx.blockerRisk>35?14:0,
    meeting:step==="coordinate"&&ctx.uncertainty>45?8:0,
    break:0
  };
}
function advanceIntention(e,action,ctx){
  if(!e.currentIntention||!ctx.work||e.currentIntention.workItemId!==ctx.work.id)return;
  const steps=e.currentIntention.steps||[];
  const completes=(action==="work"&&["execute","inspect"].includes(steps[0]))||(action==="lab"&&steps[0]==="verify")||(action==="collaborate"&&steps[0]==="coordinate")||(action==="meeting"&&steps[0]==="coordinate");
  if(completes)steps.shift();
  if(!steps.length)e.currentIntention={goal:`advance ${ctx.work.type}`,workItemId:ctx.work.id,steps:[ctx.work.blockedBy?.length?"coordinate":"execute",ctx.work.qualityRisk>58?"verify":"execute"].filter(Boolean),createdDay:company.day};
}
function workThought(e,ctx){
  if(!ctx.work)return roleThought(e);
  if(ctx.blockerRisk>40)return `I need to unblock ${ctx.work.title}.`;
  if(ctx.deadlineRisk>60)return `${ctx.work.title} is getting close to the deadline.`;
  return `I am moving ${ctx.work.title} forward.`;
}
function labThought(e,ctx){
  if(ctx.work&&ctx.qualityConcern>55)return `I need evidence before I trust ${ctx.work.title}.`;
  return "One more test before I trust this result.";
}
function utility(e){
  const hour=company.minute/60;
  const g=e.goals||{mastery:.5,promotion:.5,friendship:.5,stability:.5,recognition:.5};
  const ctx=workContext(e),intent=intentionBias(e,ctx);
  const ceo={trust:62,fairness:58,competence:64,support:56,fear:12,...(e.opinionOfCEO||{})},culture={...initialCompany.culture,...(company.culture||{})};
  const scores={
    work:e.focus*.46+e.morale*.22-e.stress*.32+g.mastery*24+g.promotion*12+g.recognition*10+intent.work,
    lab:(rolePrimaryRoom(e.role)==="hardware-lab"||roleProjectCapabilities(e.role).quality>.6?42:12)+e.focus*.3+g.mastery*20+intent.lab,
    break:(100-e.energy)*.78+e.stress*.55+g.stability*18+memoryBias(e,"OVERTIME")*.5,
    socialize:(e.traits.includes("social")?44:16)+g.friendship*32+(averageRelationship(e)<0?16:0),
    collaborate:24+g.mastery*16+g.friendship*18+g.recognition*8+intent.collaborate,
    meeting:(e.role==="Product Manager"?50:18)+intent.meeting,
    complain:e.stress*.66+(company.directive==="cuts"?20:0)+memoryBias(e,"CEO_CUTS")*.55,
    home:hour>=17?88+(hour-17)*24+g.stability*16:0
  };

  if(ctx.work){scores.work+=ctx.work.priority*.16+ctx.deadlineRisk*.18+ctx.skillFit*12;scores.lab+=ctx.qualityConcern*.18;scores.collaborate+=ctx.blockerRisk*.22+ctx.uncertainty*.08;scores.meeting+=ctx.uncertainty*.08+(ctx.t.pressure||0)*.05;scores.break-=Math.min(10,ctx.deadlineRisk*.08);}else{scores.socialize+=4;scores.meeting+=2;}
  if(ctx.brief?.knownBlockers?.length)scores.collaborate+=12;
  if((ctx.t.pressure||0)>70){scores.break+=8;scores.complain+=5;}
  if(ctx.qualityConcern>70&&(roleProjectCapabilities(e.role).quality>.5||e.role==="Chip Architect"))scores.lab+=14;
  if(ctx.skillFit<.62&&ctx.work)scores.collaborate+=10;
  if(company.directive==="speed"){scores.work+=22;scores.lab+=10;scores.break-=8;}
  if(company.directive==="revenue"&&["Product Manager","Finance Analyst"].includes(e.role))scores.work+=26;
  if(company.directive==="quality"){scores.lab+=13;scores.collaborate+=8;}
  if(company.directive==="people"){scores.socialize+=10;scores.collaborate+=8;}
  scores.work+=(ceo.competence-55)*.12+(culture.qualityDiscipline-50)*.08;
  scores.complain+=(55-ceo.trust)*.25+(55-ceo.fairness)*.18+(culture.politics-30)*.16;
  scores.break+=(50-culture.workLife)*.08;
  scores.collaborate+=(culture.communication-50)*.1;
  const institutional=institutionalUtilityBias(e);
  for(const [action,bias] of Object.entries(institutional))if(scores[action]!==undefined)scores[action]+=bias;
  const learning=learningState(e);
  scores.break+=learning.caution*2+learning.recovery*1.5;
  scores.collaborate+=learning.mentor*2+learning.collaboration*1.4+learning.helpSeeking*1.2;
  scores.lab+=learning.testing*1.6;
  scores.work+=learning.focusWork*.9;
  scores.meeting+=learning.reporting*.65+learning.initiative*.8;
  if(company.directive==="speed")scores.work+=learning.risk*1.5;
  if(e.traits.includes("introverted"))scores.socialize-=15;
  if(e.traits.includes("ambitious")){scores.work+=12;scores.meeting+=6;}
  if(e.traits.includes("perfectionist"))scores.lab+=11;
  if(e.energy<24)scores.break+=34;
  if(e.stress>=60){scores.break+=12+learning.recovery*1.2;scores.collaborate+=6+learning.helpSeeking*1.5;scores.work-=6;scores.lab-=3;}
  if(e.stress>=70){scores.break+=18;scores.collaborate+=16;scores.meeting+=6;scores.complain+=5;scores.work-=14;}
  if(e.stress>=80){scores.break+=28;scores.work-=24;scores.lab-=12;if((e.opinionOfCEO?.fear||0)>35||ctx.deadlineRisk>75||company.directive==="speed")scores.work+=12;}
  if(e.stress>72){scores.break+=20;scores.complain+=12;}
  const actionCtxKey=learningContextKey(e,ctx);
  for(const action of ["work","lab","break","socialize","collaborate","meeting","complain","home"]){
    if(scores[action]!==undefined)scores[action]+=contextualPreference(e,action,ctx)*4;
  }
  if(!availableCollaborator(e))scores.collaborate=-999;

  for(const [action,time] of Object.entries(e.cooldowns||{})){
    if(time>0&&scores[action]!==undefined)scores[action]-=35;
  }

  if(e.lastAction&&scores[e.lastAction]!==undefined){
    scores[e.lastAction]-=Math.min(42,(e.repeatCount||0)*14);
  }

  const chosen=weightedChoice(scores);
  const reasons=[
    `Energy ${Math.round(e.energy)}`,
    `Stress ${Math.round(e.stress)}`,
    `Morale ${Math.round(e.morale)}`,
    ctx.work?`Work ${ctx.work.title}`:"No assigned work",
    `Team pressure ${Math.round(ctx.t.pressure||0)}`,
    `Quality belief ${Math.round(e.beliefs?.qualityRisk?.estimate||0)} / ${Math.round(e.beliefs?.qualityRisk?.confidence||0)}%`,
    `Top goal ${Object.entries(g).sort((a,b)=>b[1]-a[1])[0][0]}`,`CEO trust ${Math.round(ceo.trust)}`,`Culture communication ${Math.round(culture.communication)}`,
    `Institutional bias ${Object.entries(e.learnedLessons||{}).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0]?.[0]||"none"}`
  ];
  e.decisionTrace={chosen,scores:Object.fromEntries(Object.entries(scores).sort((a,b)=>b[1]-a[1])),reasons};
  return chosen;
}
function learningState(e){
  const oldSuppression=Number(e.learning?.suppression)||0;
  e.learning={caution:0,mentor:0,risk:0,collaboration:0,helpSeeking:0,testing:0,focusWork:0,reporting:0,suppression:0,noiseFiltering:oldSuppression>0?oldSuppression*.45:0,politicalSuppression:oldSuppression>0?oldSuppression*.12:0,protectedEscalation:0,initiative:0,recovery:0,contextualPreferences:{},...(e.learning||{})};
  e.learning.noiseFiltering=Number.isFinite(e.learning.noiseFiltering)?e.learning.noiseFiltering:(oldSuppression>0?oldSuppression*.45:0);
  e.learning.politicalSuppression=Number.isFinite(e.learning.politicalSuppression)?e.learning.politicalSuppression:(oldSuppression>0?oldSuppression*.12:0);
  e.learning.protectedEscalation=Number.isFinite(e.learning.protectedEscalation)?e.learning.protectedEscalation:0;
  e.learning.contextualPreferences=e.learning.contextualPreferences&&typeof e.learning.contextualPreferences==="object"?e.learning.contextualPreferences:{};
  return e.learning;
}
function learningContextKey(e,ctx=workContext(e)){
  const stress=e.stress>72?"highStress":e.stress>48?"mediumStress":"lowStress";
  const work=ctx.work?.type||"noWork";
  const pressure=(ctx.t?.pressure||0)>68?"highPressure":"normalPressure";
  const risk=ctx.qualityConcern>68?"qualityRisk":ctx.deadlineRisk>65?"deadlineRisk":ctx.blockerRisk>45?"blocked":"steady";
  return `${employeeTeam(e)}|${work}|${stress}|${pressure}|${risk}`;
}
function contextualPreference(e,action,ctx=workContext(e)){
  const learning=learningState(e),key=`${learningContextKey(e,ctx)}|${action}`;
  return learning.contextualPreferences[key]||0;
}
function adjustContextualPreference(e,action,ctxKey,delta){
  const learning=learningState(e),key=`${ctxKey}|${action}`;
  learning.contextualPreferences[key]=clamp((learning.contextualPreferences[key]||0)+delta,-5,5);
  const entries=Object.entries(learning.contextualPreferences).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,80);
  learning.contextualPreferences=Object.fromEntries(entries);
}
function adjustLearningTrait(e,key,delta,min=-5,max=10){
  const learning=learningState(e);
  learning[key]=clamp((learning[key]||0)+delta,min,max);
}
function actionSnapshot(e,action){
  const p={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
  const ctx=workContext(e);
  return {action,contextKey:learningContextKey(e,ctx),workItemId:ctx.work?.id||null,workType:ctx.work?.type||null,workProgress:ctx.work?.progress??null,blockers:ctx.work?.blockedBy?.length??0,startedDay:company.day,startedMinute:company.minute,stress:e.stress,trust:company.trust,integration:company.integration,quality:company.quality,taskProgress:e.taskProgress??0,qualityMistakes:p.qualityMistakes??0};
}
function updateActionLearning(e,context){
  if(!context)return;
  const learning=learningState(e);
  e.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
  const action=context.action,ctxKey=context.contextKey||learningContextKey(e);
  const outputGain=(e.taskProgress??0)-(context.taskProgress??0);
  const integrationGain=company.integration-(context.integration??company.integration);
  const qualityGain=company.quality-(context.quality??company.quality);
  const trustGain=company.trust-(context.trust??company.trust);
  const stressDelta=e.stress-(context.stress??e.stress);
  const mistakeDelta=(e.performance.qualityMistakes??0)-(context.qualityMistakes??0);
  const workItem=context.workItemId?(company.workItems||[]).find(w=>w.id===context.workItemId):null;
  const workProgressGain=workItem&&Number.isFinite(context.workProgress)?(workItem.progress||0)-context.workProgress:0;
  const blockersResolved=workItem&&Number.isFinite(context.blockers)?Math.max(0,context.blockers-(workItem.blockedBy?.length||0)):0;
  const ownedProgress=outputGain>.018||workProgressGain>.8||blockersResolved>0;
  const weakGlobalSignal=(integrationGain+qualityGain+trustGain)*.10;
  const supportingProgress=weakGlobalSignal>.04&&outputGain>.012;
  const productive=ownedProgress||supportingProgress;
  const harmful=mistakeDelta>0||stressDelta>8||(qualityGain<-.3&&ownedProgress)||(trustGain<-.3&&ownedProgress);
  ensureBibleSystems();
  company.actionOutcomes=Array.isArray(company.actionOutcomes)?company.actionOutcomes:[];
  company.actionOutcomes.unshift({actionId:nextSimulationId("action-outcome"),day:company.day,employeeId:e.id,action,contextKey:ctxKey,outputProduced:Number(outputGain.toFixed(4)),workProgress:Number(workProgressGain.toFixed(3)),blockersResolved,defectsIntroduced:Math.max(0,Number(mistakeDelta.toFixed(2))),defectsPrevented:Math.max(0,Number((-mistakeDelta).toFixed(2))),stressChange:Number(stressDelta.toFixed(2)),coordinationChange:Number(integrationGain.toFixed(3)),trustChangeOwned:Number(trustGain.toFixed(3)),integrationGain:Number(integrationGain.toFixed(3)),qualityGain:Number(qualityGain.toFixed(3)),ownedProgress,productive,harmful,workItemId:context.workItemId||null,projectId:workItem?.projectId||null,partnerIds:e.activeCollaboration?[e.activeCollaboration.partnerId].filter(Number.isFinite):[],startedDay:context.startedDay,completedDay:company.day});
  company.actionOutcomes=company.actionOutcomes.slice(0,260);
  if(action==="collaborate"){
    if(productive){adjustLearningTrait(e,"collaboration",.12,0,10);adjustLearningTrait(e,"mentor",.07,0,10);adjustLearningTrait(e,"helpSeeking",.06,-5,10);adjustContextualPreference(e,"collaborate",ctxKey,.09);recordLearningEvidence({domain:"workforce",eventType:"collaboration",action:"owned-collaboration",outcome:"positive",magnitude:1,confidence:62,department:employeeTeam(e),employeeIds:[e.id],projectId:workItem?.projectId||null,evidence:`${e.name} completed useful collaboration`,contributors:[{type:"employee",id:e.id,weight:.65},{type:"workItem",id:context.workItemId||null,weight:.25},{type:"global",id:"company",weight:.10}]});}
    if(stressDelta>4&&!productive){adjustLearningTrait(e,"collaboration",-.08,0,10);adjustContextualPreference(e,"collaborate",ctxKey,-.08);}
  }
  if(action==="work"){
    if(productive&&!harmful){adjustLearningTrait(e,"focusWork",.07,-5,10);adjustContextualPreference(e,"work",ctxKey,.08);}
    if(company.directive==="speed"&&mistakeDelta<=0&&ownedProgress&&trustGain>=-.05)adjustLearningTrait(e,"risk",.08,0,10);
    if(harmful){adjustLearningTrait(e,"caution",.16,0,10);adjustContextualPreference(e,"work",ctxKey,-.08);}
  }
  if(action==="lab"){
    if(mistakeDelta<=0&&(ownedProgress||qualityGain>.05)){adjustLearningTrait(e,"testing",.08,-5,10);adjustContextualPreference(e,"lab",ctxKey,.08);}
    if(harmful){adjustLearningTrait(e,"caution",.16,0,10);adjustContextualPreference(e,"lab",ctxKey,-.06);}
  }
  if(action==="break"&&stressDelta<-2){adjustLearningTrait(e,"caution",.08,0,10);adjustLearningTrait(e,"recovery",.1,-5,10);adjustContextualPreference(e,"break",ctxKey,.08);}
  if(action==="break"&&stressDelta>=0){adjustLearningTrait(e,"caution",-.04,0,10);adjustLearningTrait(e,"recovery",-.05,-5,10);adjustContextualPreference(e,"break",ctxKey,-.04);}
  if(action==="meeting"&&(outputGain>.006||workProgressGain>.25||blockersResolved>0)){adjustLearningTrait(e,"reporting",.04,-5,10);adjustContextualPreference(e,"meeting",ctxKey,.04);}
}
function finishAction(e){
  if(e.actionOutcomeContext){updateActionLearning(e,e.actionOutcomeContext);e.actionOutcomeContext=null;}
  e.activeCollaboration=null;
  e.activeMeeting=null;
}
function recordQualityMistake(e,reason,severity=1){
  e.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
  e.performance.qualityMistakes=clamp((e.performance.qualityMistakes||0)+severity,0,10);
  recordMetricEvent("qualityMistakes","count",severity);
  recordQualityTelemetry(reason,severity);
  recordLearningEvidence({domain:"quality",eventType:"quality-mistake",action:reason,outcome:"negative",magnitude:severity,confidence:70,department:employeeTeam(e),employeeIds:[e.id],evidence:reason,contributors:[{type:"employee",id:e.id,weight:.35},{type:"qualityCulture",id:"company",weight:.25},{type:"directive",id:company.directive||"none",weight:.2},{type:"project",id:activeWorkForEmployee(e)?.projectId||null,weight:.2}]});
  company.quality=clamp(company.quality-.18*severity,0,100);
  if(company.phase==="pilot"||company.phase==="launched")company.trust=clamp(company.trust-.08*severity,0,100);
  if(simulationRandom()<.18)recordWeeklyEvent(`${e.name} created rework from ${reason}.`,"quality",3);
  if(severity>=1)recordLearningEvidence({domain:"quality",eventType:"verification-need",action:"quality-mistake",outcome:"negative",magnitude:severity,confidence:60,department:employeeTeam(e),employeeIds:[e.id],projectId:activeWorkForEmployee(e)?.projectId||null,evidence:`Verification evidence from ${reason}`,contributors:[{type:"employee",id:e.id,weight:.55},{type:"workItem",id:activeWorkForEmployee(e)?.id||null,weight:.30},{type:"global",id:"company",weight:.10}]});
}
function startCollaborationSession(e,target,ctx){
  const work=ctx.work||activeWorkForEmployee(e);
  if(!target||!work)return null;
  const session={partnerId:target.id,workItemId:work.id,startedDay:company.day,startedMinute:company.minute,purpose:(work.blockedBy||[]).length?"blocker":"coordination"};
  e.activeCollaboration=session;
  target.activeCollaboration={...session,partnerId:e.id};
  if(!work.collaborators.includes(e.id))work.collaborators.push(e.id);
  if(!work.collaborators.includes(target.id))work.collaborators.push(target.id);
  return session;
}
function applyCollaborationOutcome(e){
  const session=e.activeCollaboration;
  if(!session||session.applied)return;
  session.applied=true;
  const partner=employees.find(x=>x.active&&x.id===session.partnerId);
  const item=(company.workItems||[]).find(w=>w.id===session.workItemId&&w.status==="open");
  if(!partner||!item)return;
  const fit=(workSkillFit(e,item)+workSkillFit(partner,item))/2;
  const social=clamp((socialScore(e,partner.id)+socialScore(partner,e.id))/200,0,1);
  const gain=clamp(1.2+fit*2.8+social*1.3+(company.culture?.communication||50)/80,1,7);
  const before=item.progress||0;
  item.progress=clamp((item.progress||0)+gain,0,100);
  if(item.projectId)recordProjectLedger(item.projectId,"collaboration","work-progress",item.progress-before,`${e.name} and ${partner.name} collaborated on ${item.title}`);
  item.qualityRisk=clamp((item.qualityRisk||35)-gain*.45,0,100);
  e.taskProgress=(e.taskProgress||0)+gain*.012;
  partner.taskProgress=(partner.taskProgress||0)+gain*.008;
  company.integration=clamp(company.integration+gain*.035,0,100);
  company.quality=clamp(company.quality+gain*.018,0,100);
  if(item.blockedBy?.length){
    const chance=clamp(.12+fit*.22+social*.08,0,.55);
    if(simulationRandom()<chance){
      const blocker=item.blockedBy.shift();
      addStoryBeat(item.storyId,`${e.name} and ${partner.name} resolved ${blocker} through collaboration.`,"unblocked");
      recordWeeklyEvent(`${e.name} and ${partner.name} unblocked ${item.title}.`,"work",2);
      if(item.projectId)recordProjectLedger(item.projectId,"collaboration","blocker",-1,`Resolved ${blocker}`);
      recordLearningEvidence({domain:"workforce",eventType:"collaboration",action:"resolve-blocker",outcome:"positive",magnitude:gain,confidence:76,department:item.assignedTeam,employeeIds:[e.id,partner.id],evidence:`Collaboration resolved ${blocker}`,contributors:[{type:"employee",id:e.id,weight:.45},{type:"employee",id:partner.id,weight:.45},{type:"workItem",id:item.id,weight:.1}]});
    }
  }
  adjustSocial(e,partner,{respect:2,trust:1});
  addMemory(partner,"COLLABORATION",`${e.name} collaborated on ${item.title}.`,"positive",6,e.name);
}
function meetingPurposeFor(e,ctx){
  if(ctx.blockerRisk>50)return "blocker review";
  if(ctx.uncertainty>55)return "planning";
  if(ctx.qualityConcern>65)return "risk review";
  if(e.role==="Product Manager")return "customer alignment";
  return "coordination";
}
function applyMeetingOutcome(e){
  const meeting=e.activeMeeting;
  if(!meeting||meeting.applied)return;
  meeting.applied=true;
  const item=(company.workItems||[]).find(w=>w.id===meeting.workItemId&&w.status==="open");
  const team=employeeTeam(e),t=company.teams?.[team];
  const skill=((e.skills?.communication||50)+(e.skills?.leadership||45))/2;
  const clarity=clamp((skill-40)/60+(company.culture?.communication||50)/160,0,1.6);
  if(t){t.cohesion=clamp((t.cohesion||55)+clarity*1.4,0,100);t.pressure=clamp((t.pressure||35)-clarity*.9,0,100);}
  company.integration=clamp(company.integration+clarity*.08,0,100);
  company.trust=clamp(company.trust+clarity*.025,0,100);
  if(item){
    item.qualityRisk=clamp((item.qualityRisk||35)-clarity*1.2,0,100);
    if(meeting.purpose==="blocker review"&&item.blockedBy?.length&&simulationRandom()<clamp(.08+clarity*.16,0,.34)){
      const blocker=item.blockedBy.shift();
      addStoryBeat(item.storyId,`${e.name} clarified ${blocker} in a meeting.`,"unblocked");
      recordWeeklyEvent(`${teamDisplayName(team)} clarified a blocker on ${item.title}.`,"work",1);
      if(item.projectId)recordProjectLedger(item.projectId,"meeting","blocker",-1,`${e.name} clarified ${blocker}`);
    }else{
      const before=item.progress||0;
      item.progress=clamp((item.progress||0)+clarity*.9,0,100);
      if(item.projectId)recordProjectLedger(item.projectId,"meeting","work-progress",item.progress-before,`${e.name} led ${meeting.purpose}`);
    }
  }
}
function chooseAction(e){
  if(!e.active||e.sickDays>0)return;
  const ctx=workContext(e);
  const a=utility(e);
  let target=null;
  advanceIntention(e,a,ctx);
  e.offsite=false;
  recordMetricEvent("action",a);
  if(a==="collaborate")recordMetricEvent("collaborations");
  e.repeatCount=e.lastAction===a?(e.repeatCount||0)+1:0;
  e.lastAction=a;

  if(a==="work"){
    const room=roomForAction(e,a,ctx);moveToZone(e,zoneForRoom(room));
    e.action="working";e.thought=thoughtFor("work",e,ctx)||workThought(e,ctx);e.actionMinutes=rand(45,105);
  }else if(a==="lab"){
    const room=roomForAction(e,a,ctx);moveToZone(e,zoneForRoom(room));e.action="testing hardware";e.thought=thoughtFor("lab",e,ctx)||labThought(e,ctx);e.actionMinutes=rand(40,90);
  }else if(a==="break"){
    const room=roomForAction(e,a,ctx);moveToZone(e,zoneForRoom(room));e.action="taking a break";e.thought=thoughtFor("break",e,ctx);e.actionMinutes=rand(20,40);e.cooldowns.break=75;
  }else if(a==="socialize"){
    target=socialTarget(e);const room=roomForAction(e,a,{...ctx,collaborator:target});moveToZone(e,zoneForRoom(room));e.action=`talking with ${target?.name||"coworkers"}`;e.thought=thoughtFor("socialize",e,ctx);e.actionMinutes=rand(25,50);e.cooldowns.socialize=70;
    if(target){adjustSocial(e,target,{friendship:3,trust:1});addMemory(e,"SOCIAL_HELP",`I had a good conversation with ${target.name}.`,"positive",6,target.name);}
  }else if(a==="collaborate"){
    target=availableCollaborator(e);const room=roomForAction(e,a,{...ctx,collaborator:target});moveToZone(e,zoneForRoom(room));e.action=`collaborating with ${target?.name||"a teammate"}`;e.thought=thoughtFor("collaborate",e,ctx);e.actionMinutes=rand(35,70);e.cooldowns.collaborate=90;
    if(target){startCollaborationSession(e,target,ctx);adjustSocial(e,target,{respect:3,trust:2});addMemory(e,"COLLABORATION",`${target.name} helped move the work forward.`,"positive",8,target.name);}
  }else if(a==="meeting"){
    const room=roomForAction(e,a,ctx);moveToZone(e,zoneForRoom(room));e.action="leading a meeting";e.thought=thoughtFor("meeting",e,ctx);e.actionMinutes=rand(35,65);e.cooldowns.meeting=110;e.activeMeeting={workItemId:ctx.work?.id||null,purpose:meetingPurposeFor(e,ctx),startedDay:company.day,startedMinute:company.minute};
  }else if(a==="complain"){
    const room=roomForAction(e,a,ctx);moveToZone(e,zoneForRoom(room));e.action="venting";e.thought=thoughtFor("complain",e,ctx);e.actionMinutes=rand(20,45);e.cooldowns.complain=100;
  }else{
    e.offsite=true;e.action="at home";e.thought=thoughtFor("home",e,ctx);e.actionMinutes=999;
  }
  const chosenRoom=roomForZone(e.zone);
  if(chosenRoom){e.currentRoom=chosenRoom;e.roomSelectionReason=`${a} selected ${chosenRoom} from role, work, and activity context.`;e.roomEffect=roomEffectFor(e,a,chosenRoom);}
  e.actionOutcomeContext=actionSnapshot(e,a);
}
function roleThought(e){return({
  "Software Engineer":"I need to keep the software path clean enough to build on.",
  "Firmware Engineer":"Hardware and software need to agree.",
  "Hardware Engineer":"The prototype has to survive real constraints.",
  "Chip Architect":"The architecture must survive the next revision.",
  "Software QA Engineer":"Every defect found now saves trust later.",
  "Technical Lead":"I need a clean integration path.",
  "Software Architect":"The architecture should reduce future rework.",
  "Electrical Engineer":"The board needs evidence before it is trusted.",
  "Industrial Designer":"The prototype should feel intentional.",
  "Manufacturing Engineer":"A design is not ready until it can be built reliably.",
  "Product Manager":"Customers need a product, not just progress.",
  "Finance Analyst":"Runway is a design constraint too.",
  "Manager":"I need to keep people aligned without creating more meetings.",
  "Director":"The operating plan needs enough structure to hold.",
  "Vice President":"The company needs strategic clarity before it scales."
})[canonicalRole(e.role)];}
function roleOutput(e,output){
  e.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
  const team=company.teams?.[employeeTeam?.(e)]||{cohesion:55};
  const skill=e.skills||baseSkillsForRole(e.role);
  const skillBoost=(Math.max(...Object.values(skill))-55)*.003;
  const onboard=onboardingProductivity(e);
  if(e.onboardingMentorUntil&&company.day<=e.onboardingMentorUntil)output*=.92;
  output*=onboard;
  output=output*(.85+(team.cohesion||55)/360+skillBoost);
  e.performance.recentOutput=clamp(e.performance.recentOutput*.92+output*16,0,30);
  switch(canonicalRole(e.role)){
    case "Software QA Engineer":company.trust+=output*.025;break;
    case "Software Engineer":company.software=clamp(company.software+output*.018,0,100);break;
    case "Firmware Engineer":company.integration=clamp(company.integration+output*.012,0,100);break;
    case "Hardware Engineer":company.chip=clamp(company.chip+output*.016,0,100);break;
    case "Technical Lead":company.integration=clamp(company.integration+output*.012,0,100);break;
    case "Software Architect":company.quality=clamp(company.quality+output*.012,0,100);break;
    case "Electrical Engineer":company.chip=clamp(company.chip+output*.012,0,100);break;
    case "Manufacturing Engineer":company.manufacturing.readiness=clamp((company.manufacturing.readiness||0)+output*.02,0,100);break;
    case "Product Manager":ensureCustomerMarketSystems?.();Object.values(company.customerSegments||{}).forEach(seg=>{seg.roadmapConfidence=clamp((seg.roadmapConfidence||50)+output*.035,0,100);seg.supportSatisfaction=clamp((seg.supportSatisfaction||50)+output*.015,0,100);});syncCustomerSummaryFromSegments?.();company.trust+=output*.05;break;
    case "Industrial Designer":company.trust+=output*.025;break;
    case "Finance Analyst":company.board=clamp(company.board+output*.004*(company.board<92?1:.25),0,100);applyInvestorEffect({confidence:output*.01});const efficiencyGain=output*.00012*Math.max(0.25,(company.costEfficiency-.78)/.30);company.costEfficiency=clamp(company.costEfficiency-efficiencyGain,.78,1.08);break;
    case "Manager":case "Director":case "Vice President":company.trust=clamp(company.trust+output*.012,0,100);break;
  }
  updateEmployeeWorkContribution(e,output);
}
function simulateMinute(renderNow=true){
  try{return simulateMinuteCore(renderNow);}
  catch(error){recordSimulationError(error,"simulateMinute");if(renderNow&&!validationMode){renderDecisionEvent();render();}}
}
function simulateMinuteCore(renderNow=true){if(company.gameOver)return;company.minute+=5;if(company.minute>=1200){company.day++;company.minute=480;dailyClose();if(company.paused||company.gameOver)return;}employees.forEach(e=>{if(company.paused||company.gameOver)return;if(!e.active)return;tickCooldowns(e,5);if(e.sickDays>0){finishAction(e);e.offsite=true;e.action="out sick";e.thought="I need time to recover before returning.";return;}if(e.offsite&&company.minute<1020){finishAction(e);e.offsite=false;moveToZone(e,e.homeZone);e.actionMinutes=0;}e.actionMinutes-=5;if(e.actionMinutes<=0){finishAction(e);chooseAction(e);}const roomEffect=e.offsite?{productivity:1,stress:0,focus:0,congestion:0}:applyRoomTickEffects(e);const working=e.action==="working"||e.action==="testing hardware";if(working){e.energy-=.37;e.stress+=company.directive==="speed" ? .44 : .23;e.focus-=.09;const output=(e.focus/100)*(e.morale/100)*.075*(company.directive==="speed"?1.20:1)*(roomEffect.productivity||1);roleOutput(e,output);e.taskProgress+=output;const mistakeRisk=(company.directive==="speed"?.0032:.0011)+(e.focus<36?.004:0)+(e.stress>78?.003:0)+((100-(company.culture?.qualityDiscipline||50))*.00004)+(Math.max(0,(roomEffect.congestion||0)-1)*.0012);if(simulationRandom()<mistakeRisk)recordQualityMistake(e,e.action==="testing hardware"?"a failed verification pass":"rushed technical work",e.action==="testing hardware"?.45:.55);}else if(e.action.includes("break")){const recovery=roomEffect.room==="break-area"?clamp(1.05-Math.max(0,(roomEffect.congestion||0)-1)*.22,.65,1.12):.75;e.energy+=.45*recovery;e.stress-=.35*recovery;e.focus+=.18*recovery;}else if(e.action.includes("talking")){e.morale+=.06;e.stress-=.12;}else if(e.action.includes("collaborating")){e.morale+=.04;e.stress+=.04;applyCollaborationOutcome(e);}else if(e.action==="leading a meeting"){const penalty=Math.max(0,(roomEffect.congestion||0)-1);e.stress+=.025+penalty*.05;e.focus-=.035+penalty*.05;applyMeetingOutcome(e);}else if(e.action==="venting"){e.morale-=.08;e.stress-=.08;}if(company.directive==="people")e.morale+=.014;if(company.directive==="cuts"){e.stress+=.055;e.morale-=.035;}if(company.directive==="quality"){e.stress-=.012;company.quality+=.003;}e.energy=clamp(e.energy,0,100);e.stress=clamp(e.stress,0,100);e.morale=clamp(e.morale,0,100);e.focus=clamp(e.focus,0,100);});if(company.paused||company.gameOver)return;clampCompany();maybePhaseAdvance();if(company.eventCooldown>0)company.eventCooldown--;const periodic=company.minute%30===0;if(periodic)maybeCreateDecisionEvent();if(company.minute%60===0)maybeEmergentEvent();if(periodic||company.cash<=0||company.board<20)evaluateFailure();if(renderNow&&!validationMode){renderDecisionEvent();render();}}
function clampCompany(){["chip","software","quality","integration","board","trust"].forEach(k=>company[k]=clamp(company[k],0,100));company.customers=Math.max(0,company.customers);company.valuation=Math.max(0,company.valuation);}
function maybePhaseAdvance(){let next=company.phase;if(company.phase==="prototype"&&company.chip>=45&&company.software>=45)next="integration";if(company.phase==="integration"&&company.integration>=48&&company.quality>=50)next="customer trial";if(next!==company.phase){company.phase=next;company.log.push(`Product phase advanced to ${next}.`);recordWeeklyEvent(`Product phase advanced to ${next}.`,"product",4);}}

function defaultEmploymentForRole(role){
  const band=salaryBandForRole(role),annualSalary=rand(band[0],band[1]);
  return {
    annualSalary:Number(annualSalary.toFixed(3)),benefitsRate:.24,payrollTaxRate:.08,
    equipmentAnnual:.018,trainingAnnual:.012,officeAnnual:.016,insuranceAnnual:.009,
    severanceWeeks:clamp(2+simulationRandom()*3,2,8),salarySatisfaction:65
  };
}
function dailyEmploymentCost(e){
  const emp=e.employment||defaultEmploymentForRole(e.role),salary=Number(emp.annualSalary)||.15;
  return salary/365+salary*(emp.benefitsRate??.24)/365+salary*(emp.payrollTaxRate??.08)/365+(emp.equipmentAnnual??.018)/365+(emp.trainingAnnual??.012)/365+(emp.officeAnnual??.016)/365+(emp.insuranceAnnual??.009)/365;
}
function activeTechnicalEmployees(){
  return employees.filter(e=>e.active&&["hardware","software","quality"].includes(roleDepartment(e.role))).length;
}

class SimulationRuntimeSystem{
  minute(renderNow=true){return simulateMinute(renderNow);}
  minuteCore(renderNow=true){return simulateMinuteCore(renderNow);}
  phaseAdvance(){return maybePhaseAdvance();}
  clampCompany(){return clampCompany();}
  activeTechnicalEmployees(){return activeTechnicalEmployees();}
}
