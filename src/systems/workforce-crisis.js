// Workforce crisis, daily close, and failure lifecycle helpers.

function crisisDefinition(type){return CRISIS_DEFINITIONS[type]||CRISIS_DEFINITIONS.financial;}
function normalizeCrisisState(){
  if(!company)return null;
  company.crisisLearningEpisodes=Array.isArray(company.crisisLearningEpisodes)?company.crisisLearningEpisodes:[];
  company.nextCrisisId=Math.max(1,Number(company.nextCrisisId)||1);
  company.nextCrisisLearningEpisodeId=Math.max(1,Number(company.nextCrisisLearningEpisodeId)||1);
  company.failureOwner=company.failureOwner||null;
  company.failureCode=company.failureCode||null;
  if(company.crisis&&typeof company.crisis==="string"){
    const text=company.crisis;
    const type=company.crisisType||(/board|leadership/i.test(text)?"leadership":/burnout/i.test(text)?"burnout":/trust|reputation/i.test(text)?"reputation":/staff/i.test(text)?"staffing":/manufactur|supply/i.test(text)?"manufacturing":"financial");
    const def=crisisDefinition(type);
    company.crisis={id:`legacy-crisis-${company.day||0}`,type,failureOwner:def.owner,failureCode:def.code,startedDay:Math.max(0,(company.day||0)-Math.max(0,def.days-(company.crisisDays||def.days))),warningStartedDay:Math.max(0,(company.day||0)-5),deadlineDay:(company.day||0)+(company.crisisDays||def.days),durationDays:company.crisisDays||def.days,triggerEvidence:[text],visibleSignals:[text],recoveryCriteria:crisisRecoveryCriteria(type),currentProgress:0,escalationStage:"crisis",relatedProjectIds:[],relatedDepartmentIds:[],relatedEmployeeIds:[],relatedDecisionIds:[],status:"active"};
  }
  if(company.crisis&&typeof company.crisis==="object"){
    const existing=company.crisis;
    const def=crisisDefinition(existing.type);
    company.crisis={id:existing.id||`crisis-${company.nextCrisisId++}`,type:existing.type||"financial",failureOwner:existing.failureOwner||def.owner,failureCode:existing.failureCode||def.code,startedDay:Number.isFinite(existing.startedDay)?existing.startedDay:(company.day||0),warningStartedDay:Number.isFinite(existing.warningStartedDay)?existing.warningStartedDay:(company.day||0),deadlineDay:Number.isFinite(existing.deadlineDay)?existing.deadlineDay:(company.day||0)+def.days,durationDays:Number.isFinite(existing.durationDays)?existing.durationDays:def.days,triggerEvidence:Array.isArray(existing.triggerEvidence)?existing.triggerEvidence:[],visibleSignals:Array.isArray(existing.visibleSignals)?existing.visibleSignals:[def.title],recoveryCriteria:Array.isArray(existing.recoveryCriteria)?existing.recoveryCriteria:crisisRecoveryCriteria(existing.type),recoveryBaseline:existing.recoveryBaseline&&typeof existing.recoveryBaseline==="object"?existing.recoveryBaseline:null,currentProgress:Number.isFinite(existing.currentProgress)?existing.currentProgress:0,escalationStage:existing.escalationStage||"crisis",relatedProjectIds:Array.isArray(existing.relatedProjectIds)?existing.relatedProjectIds:[],relatedDepartmentIds:Array.isArray(existing.relatedDepartmentIds)?existing.relatedDepartmentIds:[],relatedEmployeeIds:Array.isArray(existing.relatedEmployeeIds)?existing.relatedEmployeeIds:[],relatedDecisionIds:Array.isArray(existing.relatedDecisionIds)?existing.relatedDecisionIds:[],status:existing.status||"active"};
    company.crisisType=company.crisis.type;
    company.crisisStage=company.crisis.escalationStage||"crisis";
    company.crisisDays=Math.max(0,company.crisis.deadlineDay-(company.day||0));
    company.crisis.recoveryBaseline=company.crisis.recoveryBaseline&&typeof company.crisis.recoveryBaseline==="object"
      ?company.crisis.recoveryBaseline
      :crisisRecoveryBaseline(company.crisis.type);
  }
  return company.crisis||null;
}
function crisisRecoveryCriteria(type){
  return ({
    financial:["Restore cash or runway materially","Reduce losses or secure enough operating flexibility","Clear payroll pressure"],
    leadership:["Raise board confidence above 38","Reduce investor pressure","Show stable execution"],
    burnout:["Lower average stress below 65","Clear active burnout watch cases","Reduce overload signals"],
    "investor-confidence":["Raise investor confidence above 35","Lower shareholder pressure","Stabilize valuation narrative"],
    reputation:["Restore customer trust above 48","Restore customer sentiment above 48","Stop visible reputation damage"],
    product:["Restore quality above 55","Improve integration and readiness","Reduce blocked delivery work"],
    staffing:["Restore at least six active employees","Keep technical coverage intact","Reduce open critical roles"],
    operational:["Reduce blocked work below two items","Restore execution momentum","Stabilize daily operations"],
    manufacturing:["Reduce supply risk below 72","Restore manufacturing readiness above 45","Improve yield or capacity"]
  })[type]||["Restore core company health"];
}
function crisisDisplayText(c=company.crisis){
  if(!c)return "";
  if(typeof c==="string")return c;
  const def=crisisDefinition(c.type);
  return def.title;
}
function crisisPlayerMessage(c=company.crisis){
  if(!c)return "";
  if(typeof c==="string")return c;
  const def=crisisDefinition(c.type),days=Math.max(0,c.deadlineDay-(company.day||0));
  const title=def.title;
  const persisted=Math.max(1,(company.day||0)-(c.warningStartedDay??c.startedDay??company.day));
  const signal=(c.visibleSignals||[]).find(s=>s&&String(s).trim()&&String(s).trim()!==title);
  const details={
    financial:{
      explanation:"The company no longer has enough financial flexibility to keep operating safely at the current pace. Finance has not been able to stabilize runway through normal controls.",
      impact:["Hiring and project investment may need to slow.","Payroll risk is increasing.","Recovery options are narrowing."],
      review:"Finance - Projects - Revenue"
    },
    leadership:{
      explanation:"The Board no longer believes current recovery efforts are sufficient. Confidence in executive leadership has remained below a safe level, and the company now needs a credible recovery plan.",
      impact:["Board scrutiny is increasing.","Strategic flexibility is shrinking.","CEO removal is possible if confidence does not recover."],
      review:"Board Confidence - Company Risk - Recent Decisions"
    },
    burnout:{
      explanation:"Employee workload and recovery conditions have remained unsustainable for several consecutive days. Department managers have not been able to reduce the pressure enough to protect delivery and retention.",
      impact:["Absence and turnover risk are rising.","Project execution is slowing.","Quality may begin to deteriorate."],
      review:"Workforce - Hiring - Department Briefings"
    },
    "investor-confidence":{
      explanation:"Investors have lost confidence in the company's near-term direction, and the Board is concerned that market pressure may limit strategic options.",
      impact:["Valuation pressure is increasing.","Fundraising may become more difficult.","Board oversight is intensifying."],
      review:"Investor Confidence - Valuation - Board"
    },
    reputation:{
      explanation:"Customer trust and sentiment have deteriorated beyond what local teams can recover on their own. The company is now at risk of losing important accounts and future growth.",
      impact:["Renewal risk is rising.","Customer expansion has slowed.","Public confidence may weaken further."],
      review:"Customers - Product Quality - Customer Success"
    },
    product:{
      explanation:"Critical product issues are preventing reliable delivery. Engineering and Quality have exhausted normal recovery options, and the remaining problems now threaten launch confidence and customer trust.",
      impact:["Delivery schedules are slipping.","Customer commitments are at risk.","Product confidence is weakening."],
      review:"Projects - Engineering - Quality"
    },
    staffing:{
      explanation:"Several active projects no longer have enough qualified people to maintain delivery. Recruiting and internal reassignment have not restored the required coverage.",
      impact:["Critical skill gaps remain.","Project execution is slowing.","Delivery commitments are becoming harder to maintain."],
      review:"Workforce - Hiring Pipeline - Project Portfolio"
    },
    operational:{
      explanation:"Operational friction is now affecting day-to-day execution across the company. Local teams have not been able to clear enough blocked work or restore normal momentum.",
      impact:["Blocked work is delaying execution.","Teams have less margin for mistakes.","Delivery confidence may weaken."],
      review:"Department Briefings - Internal Reports - Project Portfolio"
    },
    manufacturing:{
      explanation:"Supply and production conditions have become too unstable to support reliable delivery. Operations has not been able to restore normal readiness through local action.",
      impact:["Delivery reliability is falling.","Customer commitments are at risk.","Production costs may increase."],
      review:"Manufacturing - Supply Chain - Projects"
    }
  }[c.type]||{
    explanation:"A company-level issue has persisted long enough that local teams cannot resolve it without executive attention.",
    impact:["Execution risk is increasing.","Leadership attention is required.","Recovery options may narrow over time."],
    review:"Operating Health - CEO Inbox - Company Story"
  };
  const dayToken="day"+"(s)";
  const sustainedToken="has been"+" sustained";
  const cleanSignal=signal
    ? signal
        .replace(new RegExp(`\\s+${dayToken.replace(/[()]/g,"\\$&")}`,"gi")," days")
        .replace(new RegExp(`${sustainedToken}.*$`,"i"),"has persisted long enough to require executive review.")
    : "";
  const context=cleanSignal?`\n\nCurrent signal: ${cleanSignal}`:"";
  return `${title}\n\n${details.explanation}${context}\n\nRecovery deadline: ${days} ${days===1?"day":"days"} remaining\n\nCurrent impact:\n- ${details.impact.join("\n- ")}\n\nSuggested review:\n${details.review}`;
}
function crisisDebugHtml(){
  normalizeCrisisState();
  if(!company.crisis)return "No active typed crisis.";
  const c=company.crisis;
  const snapshot=typeof buildWorkforceAllocationSnapshot==="function"?buildWorkforceAllocationSnapshot():null;
  const progress=c.currentProgressDetail||staffingCrisisProgressDetail(snapshot);
  const hidden=[`Risk pillars ${Object.entries(company.riskPillars||{}).map(([k,v])=>`${k}:${Math.round(v)}`).join(", ")||"n/a"}`,`Crisis risk days ${Object.entries(company.crisisRiskDays||{}).map(([k,v])=>`${k}:${v}`).join(", ")||"n/a"}`];
  const allocation=snapshot?`<br><strong>Workforce Allocation Snapshot</strong><br>Missing assignments ${snapshot.totals.missingAssignments}; missing FTE ${snapshot.totals.missingProjectFte}; critical-role gaps ${snapshot.totals.criticalRoleGaps}<br>Actual blockers ${snapshot.totals.actualBlockedWork}; observed blockers ${snapshot.totals.observedBlockedWork}; unreported blockers ${snapshot.totals.unreportedBlockedWork}<br>${Object.entries(snapshot.departments).map(([dept,row])=>`${teamDisplayName(dept)}: headcount ${row.activeHeadcount}, project required ${row.projectRequiredFte}, allocated ${row.projectAllocatedFte}, missing ${row.missingAssignments}, actual/observed blockers ${row.actualBlockedWork}/${row.observedBlockedWork}`).join("<br>")}`:"";
  const progressHtml=c.type==="staffing"&&progress?`<br><strong>Crisis Progress</strong><br>Started with ${progress.initialMissingAssignments} uncovered assignment(s); currently ${progress.currentMissingAssignments}.<br>Missing FTE ${progress.currentMissingFte}; temporary coverage ${progress.temporaryCoverage}; qualified onboarding ${progress.onboardingCoverage}; days remaining ${progress.daysRemaining}`:"";
  return `Type ${c.type}<br>Owner ${c.failureOwner}<br>Failure code ${c.failureCode}<br>Stage ${c.escalationStage}<br>Started day ${c.startedDay}; deadline day ${c.deadlineDay}; days remaining ${company.crisisDays}<br>Progress ${Math.round(c.currentProgress||0)}%<br><strong>Visible signals</strong><br>${(c.visibleSignals||[]).join("<br>")||"None"}<br><strong>Hidden signals</strong><br>${hidden.join("<br>")}<br><strong>Recovery criteria</strong><br>${(c.recoveryCriteria||[]).join("<br>")||"None"}<br><strong>Evidence</strong><br>${(c.triggerEvidence||[]).join("<br>")||"None"}${progressHtml}${allocation}`;
}
function crisisRelatedProjectIds(type){
  if(!["product","operational","staffing","manufacturing"].includes(type))return [];
  return (company.projects||[]).filter(p=>p.status!=="completed").slice(0,3).map(p=>p.id);
}
function crisisRelatedDepartmentIds(type){
  return ({
    financial:["finance"],leadership:["board","finance"],burnout:["people"],"investor-confidence":["board","finance"],reputation:["product"],product:["hardware","software","quality"],staffing:["people"],operational:["hardware","software","quality"],manufacturing:["hardware","operations"]
  })[type]||[];
}
function criticalStaffingGapCount(){
  const snapshot=typeof buildWorkforceAllocationSnapshot==="function"?buildWorkforceAllocationSnapshot():null;
  return snapshot?.totals?.missingAssignments||0;
}
function staffingCrisisBreakdown(snapshot=buildWorkforceAllocationSnapshot()){
  const rows=Object.values(snapshot?.projects||{}).filter(p=>p.missingAssignments>0);
  return rows.map(p=>`${p.title}: ${p.missingAssignments} uncovered assignment${p.missingAssignments===1?"":"s"} (${(p.missingRoles||[]).map(g=>`${teamDisplayName(g.dept)} ${g.role} +${g.missingFte}`).join(", ")})`);
}
function staffingCrisisProgressDetail(snapshot=buildWorkforceAllocationSnapshot()){
  const crisis=company.crisis?.type==="staffing"?company.crisis:null;
  const currentMissingAssignments=snapshot?.totals?.missingAssignments||0;
  const currentMissingFte=snapshot?.totals?.missingProjectFte||0;
  const onboarding=(employees||[]).filter(e=>e.active&&e.performanceManagement?.stage==="onboarding").reduce((sum,e)=>sum+clamp(onboardingProductivity(e),0,1),0);
  const temporaryCoverage=(company.recruitingPipeline||[]).filter(r=>WORKFORCE_ADVANCING_RECRUITING_STATUSES.has(r.status)).length;
  const initialMissingAssignments=crisis?.currentProgressDetail?.initialMissingAssignments??currentMissingAssignments;
  const initialMissingFte=crisis?.currentProgressDetail?.initialMissingFte??currentMissingFte;
  return {initialMissingAssignments,initialMissingFte,currentMissingAssignments,currentMissingFte,criticalRoleGapsRemaining:snapshot?.totals?.criticalRoleGaps||0,temporaryCoverage,onboardingCoverage:Number(onboarding.toFixed(2)),daysRemaining:company.crisis?.deadlineDay?Math.max(0,company.crisis.deadlineDay-(company.day||0)):0};
}
function staffingCrisisSeverity(snapshot=buildWorkforceAllocationSnapshot()){
  const projects=Object.values(snapshot?.projects||{}).filter(p=>p.missingAssignments>0);
  const affectedProjects=projects.length;
  const affectedDepartments=new Set(projects.flatMap(p=>p.affectedDepartments||[])).size;
  const missing=snapshot?.totals?.missingAssignments||0;
  const missingFte=snapshot?.totals?.missingProjectFte||0;
  const openRoles=(company.openRoles||[]).length;
  const activeRecruiting=(company.recruitingPipeline||[]).filter(r=>WORKFORCE_ACTIVE_RECRUITING_STATUSES.has(r.status)).length;
  const failedRecruiting=(company.hiringRequestHistory||[]).filter(r=>company.day-(r.day||0)<=45&&/failed|rejected|delayed|paused|suppressed/i.test(String(r.status||""))).length;
  const deliveryImpact=projects.reduce((score,p)=>score+Math.max(0,70-(p.coverage||100))*.08+(p.actualBlockers||0)*1.5,0);
  const concentration=affectedProjects<=1&&missing<=2?-14:0;
  const score=missing*8+missingFte*5+affectedProjects*8+affectedDepartments*4+openRoles*3+activeRecruiting*2+failedRecruiting*4+Math.max(0,avgStress()-65)*.7+deliveryImpact+concentration;
  return {score,affectedProjects,affectedDepartments,missing,missingFte,openRoles,activeRecruiting,failedRecruiting,deliveryImpact};
}
function crisisRecoveryBaseline(type){
  const snapshot=typeof buildWorkforceAllocationSnapshot==="function"?buildWorkforceAllocationSnapshot():null;
  const blocked=(company.workItems||[]).filter(w=>w.progress<100&&(w.blockedBy||[]).length).length;
  const projectRisk=(company.projects||[]).filter(p=>p.status!=="completed").reduce((maximum,p)=>Math.max(maximum,p.performance?.riskTrend||p.visibleRisk||0),0);
  return {
    type,
    cash:Number(company.cash)||0,
    runway:runwayDaysOrUnknown(company.finance),
    netCashFlow:Number(company.finance?.netCashFlowDaily??0),
    board:Number(company.board)||0,
    investorPressure:Number(company.shareholders?.pressure??50),
    investorConfidence:Number(company.shareholders?.confidence??50),
    stress:avgStress(),
    trust:Number(company.trust)||0,
    customerSentiment:Number(company.customerSentiment)||0,
    blocked,
    projectRisk,
    missingAssignments:Number(snapshot?.totals?.missingAssignments)||0,
    executionMomentum:Number(company.organizationalMomentum?.execution)||0,
    supplyRisk:Number(company.manufacturing?.supplyRisk)||0
  };
}
function makeCrisisCandidate(type,triggerEvidence=[],severity=70){
  const def=crisisDefinition(type),duration=def.days||30;
  const signals=triggerEvidence.length?triggerEvidence:[def.title];
  const currentProgressDetail=type==="staffing"?staffingCrisisProgressDetail():null;
  return {id:`crisis-${company.nextCrisisId||1}`,type,failureOwner:def.owner,failureCode:def.code,startedDay:company.day||0,warningStartedDay:Math.max(0,(company.day||0)-Math.min(5,Math.floor(severity/18))),deadlineDay:(company.day||0)+duration,durationDays:duration,triggerEvidence,visibleSignals:signals,recoveryCriteria:crisisRecoveryCriteria(type),recoveryBaseline:crisisRecoveryBaseline(type),currentProgress:crisisRecoveryProgress(type),currentProgressDetail,escalationStage:"crisis",relatedProjectIds:crisisRelatedProjectIds(type),relatedDepartmentIds:crisisRelatedDepartmentIds(type),relatedEmployeeIds:employees.filter(e=>e.active&&e.daysAtRisk>=2).slice(0,4).map(e=>e.id),relatedDecisionIds:[],status:"active"};
}
function typedCrisisCandidate(){
  ensureLeadershipSystems();
  ensureWorkforceEconomySystems?.();
  const rules=OFFICE_AQUARIUM_CONSTANTS.crisisBalance;
  const active=employees.filter(e=>e.active),blockedItems=(company.workItems||[]).filter(w=>w.progress<100&&(w.blockedBy||[]).length),blocked=blockedItems.length;
  const affectedProjects=new Set(blockedItems.map(item=>item.projectId).filter(Boolean)).size;
  const affectedDepartments=new Set(blockedItems.map(item=>item.assignedTeam).filter(Boolean)).size;
  const technical=activeTechnicalEmployees();
  const netLoss=Math.max(0,-(company.finance?.netCashFlowDaily??0));
  const runway=runwayDaysOrUnknown(company.finance);
  const candidates=[];
  const add=(type,severity,evidence)=>candidates.push({type,severity,evidence:evidence.filter(Boolean)});
  if(company.cash<=0)add("financial",90,[`Cash is at $${company.cash.toFixed(1)}M`,`Runway is ${Number.isFinite(runway)?`${runway} ${runway===1?"day":"days"}`:"unknown"}`,`Net cash flow is $${(company.finance?.netCashFlowDaily??0).toFixed(3)}M/day`]);
  if(company.board<=12)add("leadership",88,[`Board confidence is ${Math.round(company.board)}`,`Board strikes ${(company.boardGovernance?.strikes||0)}/3`,`Investor pressure ${Math.round(company.shareholders?.pressure||0)}`]);
  if((company.shareholders?.confidence??50)<=10)add("investor-confidence",84,[`Investor confidence is ${Math.round(company.shareholders?.confidence??0)}`,`Shareholder pressure ${Math.round(company.shareholders?.pressure||0)}`]);
  if(company.trust<=12)add("reputation",82,[`Customer trust is ${Math.round(company.trust)}`,`Customer sentiment is ${Math.round(company.customerSentiment||0)}`]);
  const criticalGaps=criticalStaffingGapCount();
  if(active.length<4||technical<1)add("staffing",86,[`Active employees ${active.length}`,`Active technical employees ${technical}`,`${(company.openRoles||[]).length} open role(s)`]);
  else if(criticalGaps>=2&&avgStress()>65){
    const snapshot=buildWorkforceAllocationSnapshot();
    const staffingSeverity=staffingCrisisSeverity(snapshot);
    const projectCount=Object.values(snapshot.projects||{}).filter(p=>p.missingAssignments>0).length;
    if(staffingSeverity.score>=45&&(projectCount>=2||criticalGaps>=4||staffingSeverity.failedRecruiting>0||staffingSeverity.openRoles>=2))add("staffing",70,[`${criticalGaps} required project assignment(s) remain uncovered across ${projectCount} active project(s)`,`Average stress is ${Math.round(avgStress())}`,`${(company.openRoles||[]).length} open role(s)`,...staffingCrisisBreakdown(snapshot).slice(0,3)]);
  }
  if(avgStress()>82&&active.filter(e=>e.daysAtRisk>=2).length>=2)add("burnout",78,[`Average stress is ${Math.round(avgStress())}`,`${active.filter(e=>e.daysAtRisk>=2).length} employee(s) are on burnout watch`]);
  const severeProductRisk=(company.projects||[]).some(p=>
    Number(p.performance?.riskTrend??p.visibleRisk??0)>=rules.product.severeProjectRisk&&
    Number(p.performance?.scheduleVariance??0)>=rules.product.severeProjectScheduleVariance&&
    Number(p.performance?.blockerCount??0)>=rules.product.severeProjectBlockers
  );
  if(company.quality<rules.product.criticalQuality||(severeProductRisk&&(company.crisisRiskDays?.product||0)>=rules.sustainedRiskDays))add("product",76,[`Quality is ${Math.round(company.quality)}`,`Integration is ${Math.round(company.integration||0)}`,`At-risk projects ${(company.projects||[]).filter(p=>(p.performance?.riskTrend||p.visibleRisk||0)>70).length}`]);
  const immediateOperational=(blocked>=rules.operational.immediateBlockedItems&&affectedProjects>=rules.operational.minimumAffectedProjects&&affectedDepartments>=rules.operational.minimumAffectedDepartments)||(company.organizationalMomentum?.execution??0)<rules.operational.immediateExecutionMomentum;
  if(immediateOperational)add("operational",74,[`${blocked} blocked work item(s) across ${affectedProjects} active project(s)`,`Execution momentum ${Math.round(company.organizationalMomentum?.execution||0)}`]);
  if(company.phase==="launched"&&(company.manufacturing?.supplyRisk||0)>92)add("manufacturing",80,[`Supply risk is ${Math.round(company.manufacturing?.supplyRisk||0)}`,`Manufacturing readiness is ${Math.round(company.manufacturing?.readiness||0)}`]);
  const severeBurnWithLowReserves=netLoss>rules.financial.severeDailyLoss&&(company.cash<rules.financial.severeLossCash||runway<rules.financial.severeLossRunwayDays);
  if(company.unpaidPayrollDays>0||severeBurnWithLowReserves)add("financial",72,[`Unpaid payroll days ${company.unpaidPayrollDays||0}`,`Net daily loss $${netLoss.toFixed(3)}M`,`Runway is ${Number.isFinite(runway)?`${Math.round(runway)} days`:"unknown"}`]);
  const top=candidates.sort((a,b)=>b.severity-a.severity)[0];
  return top?makeCrisisCandidate(top.type,top.evidence,top.severity):null;
}
function updateCrisisRiskSystem(){
  ensureLeadershipSystems();
  normalizeCrisisState();
  if(company.crisis)return;
  const sig=crisisSignals();
  for(const k of Object.keys(sig))if(!(k in company.crisisRiskDays))company.crisisRiskDays[k]=0;
  Object.keys(company.crisisRiskDays).forEach(k=>{
    company.crisisRiskDays[k]=clamp((company.crisisRiskDays[k]||0)+(sig[k]?1:-1),0,OFFICE_AQUARIUM_CONSTANTS.crisisBalance.maximumTrackedRiskDays);
  });
  const ranked=Object.entries(company.crisisRiskDays).sort((a,b)=>b[1]-a[1]);
  const [type,days]=ranked[0];
  const rules=OFFICE_AQUARIUM_CONSTANTS.crisisBalance;
  company.crisisStage=days>=rules.sustainedRiskDays?"critical":days>=rules.atRiskDays?"at risk":days>=rules.warningRiskDays?"warning":null;
  company.crisisType=company.crisisStage?type:null;
  if(days>=rules.sustainedRiskDays){
    const candidate=typedCrisisCandidate();
    if(candidate)startCrisis(candidate);
  }
}
function crisisRecoveryProgress(type=company.crisis?.type||company.crisisType){
  const recovery=OFFICE_AQUARIUM_CONSTANTS.crisisBalance.recovery;
  const active=employees.filter(e=>e.active).length,technical=activeTechnicalEmployees();
  const blocked=(company.workItems||[]).filter(w=>w.progress<100&&(w.blockedBy||[]).length).length;
  const snapshot=typeof buildWorkforceAllocationSnapshot==="function"?buildWorkforceAllocationSnapshot():null;
  const criticalGaps=snapshot?.totals?.missingAssignments??criticalStaffingGapCount();
  const missingFte=snapshot?.totals?.missingProjectFte||0;
  const affectedCoverage=Object.values(snapshot?.projects||{}).filter(p=>p.missingAssignments>0).reduce((sum,p)=>sum+p.coverage,0)/Math.max(1,Object.values(snapshot?.projects||{}).filter(p=>p.missingAssignments>0).length);
  const projectRisk=(company.projects||[]).filter(p=>p.status!=="completed").reduce((m,p)=>Math.max(m,p.performance?.riskTrend||p.visibleRisk||0),0);
  const runway=runwayDaysOrUnknown(company.finance);
  const netCashFlow=Number(company.finance?.netCashFlowDaily??-.2);
  let score={
    financial:(
      company.cash>recovery.financial.healthyCash||runway>recovery.financial.healthyRunwayDays?45:
      company.cash>recovery.financial.warningCash||runway>recovery.financial.warningRunwayDays?25:0
    )+(netCashFlow>recovery.financial.healthyNetCashFlow?35:netCashFlow>recovery.financial.warningNetCashFlow?20:0)+((company.unpaidPayrollDays||0)===0?20:0),
    leadership:(company.board>recovery.leadership.healthyBoard?45:company.board>recovery.leadership.warningBoard?20:0)+((company.shareholders?.pressure??100)<recovery.leadership.maximumPressure?30:0)+((company.boardGovernance?.strikes||0)<=recovery.leadership.maximumStrikes?25:0),
    burnout:(avgStress()<recovery.burnout.healthyStress?50:avgStress()<recovery.burnout.warningStress?25:0)+(employees.filter(e=>e.active&&e.daysAtRisk>=2).length===0?35:0)+(avgStress()<recovery.burnout.maximumRiskStress?15:0),
    "investor-confidence":((company.shareholders?.confidence??0)>recovery.investor.healthyConfidence?45:0)+((company.shareholders?.pressure??100)<recovery.investor.maximumPressure?30:0)+(company.board>recovery.investor.minimumBoard?25:0),
    reputation:(company.trust>recovery.reputation.healthyTrust?45:company.trust>recovery.reputation.warningTrust?20:0)+((company.customerSentiment||0)>recovery.reputation.healthyCustomerSentiment?35:0)+((company.trust>recovery.reputation.healthyTrust&&(company.customerSentiment||0)>recovery.reputation.healthyCustomerSentiment)?20:0),
    product:(company.quality>recovery.product.healthyQuality?30:company.quality>recovery.product.warningQuality?15:company.quality>recovery.product.criticalQuality?10:0)+((company.integration||0)>recovery.product.healthyIntegration?25:(company.integration||0)>recovery.product.warningIntegration?20:0)+((company.manufacturing?.readiness||0)>recovery.product.healthyManufacturingReadiness?15:0)+(blocked===recovery.product.healthyBlockers?25:blocked<recovery.product.warningBlockers?20:0)+(projectRisk<recovery.product.healthyRisk?15:0)+(company.quality>recovery.product.criticalQuality&&blocked<2?15:0),
    staffing:(criticalGaps===0?42:criticalGaps<=2?30:criticalGaps<=4?12:0)+(missingFte<=recovery.staffing.healthyMissingFte?25:missingFte<=recovery.staffing.warningMissingFte?24:missingFte<=recovery.staffing.strainedMissingFte?20:missingFte<=recovery.staffing.criticalMissingFte?8:0)+(affectedCoverage>=recovery.staffing.healthyCoverage?18:affectedCoverage>=recovery.staffing.warningCoverage?12:0)+(active>=recovery.staffing.healthyActiveEmployees&&technical>=recovery.staffing.healthyTechnicalEmployees?18:active>=recovery.staffing.warningActiveEmployees&&technical>=recovery.staffing.warningTechnicalEmployees?10:0)+((company.openRoles||[]).length<=recovery.staffing.maximumOpenRoles?7:0)+(avgStress()<recovery.staffing.healthyStress?10:avgStress()<recovery.staffing.warningStress?5:0),
    operational:(blocked<recovery.operational.healthyBlockers?40:blocked<recovery.operational.warningBlockers?18:0)+((company.organizationalMomentum?.execution||0)>recovery.operational.healthyExecutionMomentum?35:0)+(avgStress()<recovery.operational.healthyStress?25:0),
    manufacturing:((company.manufacturing?.supplyRisk??100)<recovery.manufacturing.maximumSupplyRisk?35:0)+((company.manufacturing?.readiness||0)>recovery.manufacturing.minimumReadiness?30:0)+((company.manufacturing?.yield||0)>recovery.manufacturing.minimumYield?20:0)+((company.manufacturing?.capacity||0)>recovery.manufacturing.minimumCapacity?15:0)
  }[type];
  const baseline=company.crisis?.type===type?company.crisis.recoveryBaseline:null;
  const improvement=OFFICE_AQUARIUM_CONSTANTS.crisisBalance.recoveryImprovement;
  if(baseline){
    if(type==="financial"){
      if(company.cash-baseline.cash>=improvement.financialCashGain)score+=20;
      if(Number.isFinite(runway)&&Number.isFinite(baseline.runway)&&runway-baseline.runway>=improvement.financialRunwayGainDays)score+=15;
    }else if(type==="leadership"){
      if(company.board-baseline.board>=improvement.leadershipBoardGain)score+=20;
      if(baseline.investorPressure-(company.shareholders?.pressure??100)>=improvement.leadershipPressureRelief)score+=15;
    }else if(type==="burnout"&&baseline.stress-avgStress()>=improvement.burnoutStressRelief)score+=25;
    else if(type==="investor-confidence"&&(company.shareholders?.confidence??0)-baseline.investorConfidence>=improvement.investorConfidenceGain)score+=25;
    else if(type==="reputation"&&(company.trust-baseline.trust>=improvement.reputationGain||(company.customerSentiment||0)-baseline.customerSentiment>=improvement.reputationGain))score+=25;
    else if(type==="product"){
      if(baseline.blocked-blocked>=improvement.productBlockerRelief)score+=20;
      if(baseline.projectRisk-projectRisk>=improvement.projectRiskRelief)score+=15;
    }else if(type==="staffing"&&baseline.missingAssignments-criticalGaps>=improvement.staffingAssignmentRelief)score+=25;
    else if(type==="operational"){
      if(baseline.blocked-blocked>=improvement.productBlockerRelief)score+=25;
      if((company.organizationalMomentum?.execution||0)-baseline.executionMomentum>=improvement.operationalExecutionGain)score+=15;
    }else if(type==="manufacturing"&&baseline.supplyRisk-(company.manufacturing?.supplyRisk||0)>=improvement.manufacturingSupplyRelief)score+=25;
  }
  return clamp(score??0,0,100);
}
function crisisPriorityProject(){
  return activeProjects().slice().sort((a,b)=>{
    const aPressure=(a.performance?.riskTrend||a.visibleRisk||0)+(a.performance?.blockerCount||0)*12+(a.dailySpend||0)*20;
    const bPressure=(b.performance?.riskTrend||b.visibleRisk||0)+(b.performance?.blockerCount||0)*12+(b.dailySpend||0)*20;
    return bPressure-aPressure;
  })[0]||null;
}
function crisisCriticalHireRole(){
  return canonicalRole((company.openRoles||[])[0]||company.capabilityGaps?.[0]?.role||"Software Engineer");
}
function crisisRecoveryChoices(crisis){
  const type=crisis?.type||"financial",project=crisisPriorityProject(),projectName=project?.title||"the highest-risk project";
  const intervention=(mode,extra={})=>({type,mode,...extra});
  const choices={
    financial:[
      {title:"Raise bridge funding and reduce project spending",detail:"Add short-term runway while lowering active project burn.",fundraising:fundraisingOffer("bridge"),portfolioAction:"cut-burn",crisisIntervention:intervention("financial-controls"),strategy:"finance",benefits:["extends runway","reduces recurring project cost"],risks:["dilutes ownership","slows project scope"],uncertainty:"Material",estimatedConfidence:72},
      {title:`Pause ${projectName}`,detail:"Stop the costliest delivery commitment while Finance stabilizes cash flow.",projectDecision:project?{id:project.id,action:"pause"}:null,crisisIntervention:intervention("reduce-overload",{projectId:project?.id||null}),strategy:"cost-control",benefits:["reduces near-term burn","protects payroll"],risks:["delays customer and project value"],uncertainty:"Material",estimatedConfidence:64},
      {title:"Freeze ordinary hiring and reduce project scope",detail:"Protect cash without immediately closing the company or removing staff.",hiringPolicy:{mode:"frozen",reviewDays:30,reason:"CEO froze ordinary hiring during financial recovery"},portfolioAction:"cut-burn",crisisIntervention:intervention("financial-controls"),strategy:"conservative",benefits:["limits new commitments","preserves operating flexibility"],risks:["staffing gaps and schedules may worsen"],uncertainty:"High",estimatedConfidence:58}
    ],
    leadership:[
      {title:"Commit to a 30-day Board recovery plan",detail:"Publish measurable cash, delivery, and workforce milestones for Board review.",shareholders:{confidence:8,pressure:-10},crisisIntervention:intervention("investor-plan"),strategy:"balanced",benefits:["gives the Board a measurable plan","can restore leadership credibility"],risks:["missing the milestones will deepen scrutiny"],uncertainty:"Material",estimatedConfidence:70},
      {title:"Pause expansion and prove execution",detail:"Reduce simultaneous commitments until the company delivers a credible milestone.",portfolioAction:"cut-burn",crisisIntervention:intervention("reduce-overload",{projectId:project?.id||null}),strategy:"quality",benefits:["focuses leadership on delivery","reduces execution risk"],risks:["slows growth"],uncertainty:"Material",estimatedConfidence:66},
      {title:"Protect the workforce during recovery",detail:"Reduce overload and ask managers to stabilize retention before the next Board review.",crisisIntervention:intervention("workforce-recovery"),strategy:"people",benefits:["may restore employee trust","reduces turnover risk"],risks:["does not repair financial results by itself"],uncertainty:"High",estimatedConfidence:55}
    ],
    burnout:[
      {title:`Pause ${projectName} for workforce recovery`,detail:"Remove one major commitment so overloaded employees can recover.",projectDecision:project?{id:project.id,action:"pause"}:null,crisisIntervention:intervention("workforce-recovery"),strategy:"people",benefits:["reduces overload quickly","protects retention"],risks:["delays the project"],uncertainty:"Material",estimatedConfidence:76},
      {title:"Begin a company recovery period",detail:"Reduce overtime expectations and require managers to protect recovery time.",crisisIntervention:intervention("workforce-recovery"),directive:"people",days:10,strategy:"people",benefits:["lowers stress","may restore morale"],risks:["near-term output will fall"],uncertainty:"Material",estimatedConfidence:70},
      {title:"Open critical support hiring",detail:"Approve recruitment for the most urgent capability gap while teams reduce optional work.",hire:"specialist",hireRole:crisisCriticalHireRole(),crisisIntervention:intervention("reduce-overload"),strategy:"balanced",benefits:["creates a durable capacity path","signals support"],risks:["relief is delayed until recruiting succeeds"],uncertainty:"High",estimatedConfidence:56}
    ],
    "investor-confidence":[
      {title:"Commit to audited delivery milestones",detail:"Give investors specific operating evidence instead of broader promises.",shareholders:{confidence:10,pressure:-12},crisisIntervention:intervention("investor-plan"),strategy:"quality",benefits:["can restore credibility","aligns confidence with execution"],risks:["missed milestones will be visible"],uncertainty:"Material",estimatedConfidence:74},
      {title:"Reduce speculative commitments",detail:"Narrow the portfolio and protect the milestones the company can credibly deliver.",portfolioAction:"cut-burn",shareholders:{confidence:7,pressure:-8},crisisIntervention:intervention("investor-plan"),strategy:"conservative",benefits:["improves narrative discipline","reduces burn"],risks:["limits growth expectations"],uncertainty:"Material",estimatedConfidence:68},
      {title:"Raise bridge funding despite weak confidence",detail:"Protect runway now while accepting less favorable terms and more investor control.",fundraising:fundraisingOffer("bridge"),shareholders:{confidence:3,pressure:4},crisisIntervention:intervention("financial-controls"),strategy:"finance",benefits:["extends runway"],risks:["adds dilution and Board pressure"],uncertainty:"High",estimatedConfidence:46}
    ],
    reputation:[
      {title:"Launch a customer recovery plan",detail:"Resolve the most visible customer failures and report progress directly.",crisisIntervention:intervention("reputation-recovery"),strategy:"customer",benefits:["can rebuild trust and sentiment","focuses teams on customer evidence"],risks:["requires delivery attention"],uncertainty:"Material",estimatedConfidence:72},
      {title:"Fund a quality recovery sprint",detail:"Prioritize defect resolution before making new customer promises.",crisisIntervention:intervention("clear-blockers"),directive:"quality",days:8,strategy:"quality",benefits:["addresses the product cause of distrust","reduces repeat failures"],risks:["slows new feature work"],uncertainty:"Material",estimatedConfidence:68},
      {title:"Reduce near-term customer commitments",detail:"Narrow promises until reliability and support have recovered.",portfolioAction:"cut-burn",crisisIntervention:intervention("reputation-recovery"),strategy:"conservative",benefits:["prevents additional broken promises"],risks:["may lose near-term demand"],uncertainty:"High",estimatedConfidence:58}
    ],
    product:[
      {title:"Authorize a blocker-clearing sprint",detail:"Move experienced employees onto the most important blocked work before continuing expansion.",crisisIntervention:intervention("clear-blockers"),directive:"quality",days:8,strategy:"quality",benefits:["removes concrete delivery blockers","improves integration"],risks:["other work will slow"],uncertainty:"Material",estimatedConfidence:78},
      {title:`Reduce the scope of ${projectName}`,detail:"Preserve the project by removing lower-value work from the current delivery target.",projectDecision:project?{id:project.id,action:"reduce"}:null,crisisIntervention:intervention("reduce-overload",{projectId:project?.id||null}),strategy:"scope",benefits:["lowers delivery risk","protects quality"],risks:["reduces the original ambition"],uncertainty:"Material",estimatedConfidence:69},
      {title:`Pause ${projectName} and rebuild the plan`,detail:"Stop execution until quality, staffing, and dependencies support a credible restart.",projectDecision:project?{id:project.id,action:"pause"}:null,crisisIntervention:intervention("workforce-recovery"),strategy:"conservative",benefits:["prevents further quality damage","creates recovery time"],risks:["causes a visible delay"],uncertainty:"High",estimatedConfidence:60}
    ],
    staffing:[
      {title:`Approve recruitment for a ${crisisCriticalHireRole()}`,detail:"Open the most urgent role and let HR run the search.",hire:"specialist",hireRole:crisisCriticalHireRole(),crisisIntervention:intervention("reduce-overload"),strategy:"people",benefits:["creates durable capability","addresses a named staffing gap"],risks:["recruiting and onboarding take time","payroll will rise"],uncertainty:"Material",estimatedConfidence:70},
      {title:"Use temporary contractor coverage",detail:"Add short-term delivery capacity while permanent staffing catches up.",crisisIntervention:intervention("contractor-coverage"),strategy:"balanced",benefits:["provides faster temporary relief","keeps permanent options open"],risks:["adds a recurring contractor cost","does not build lasting capability"],uncertainty:"Material",estimatedConfidence:64},
      {title:`Pause ${projectName} and protect the core team`,detail:"Reduce project demand instead of asking the current workforce to absorb the shortage.",projectDecision:project?{id:project.id,action:"pause"}:null,crisisIntervention:intervention("workforce-recovery"),strategy:"conservative",benefits:["reduces overload immediately","protects retention"],risks:["delays project value"],uncertainty:"Material",estimatedConfidence:72}
    ],
    operational:[
      {title:"Authorize a blocker-clearing sprint",detail:"Give cross-functional experts temporary priority to resolve the most damaging dependencies.",crisisIntervention:intervention("clear-blockers"),directive:"quality",days:7,strategy:"quality",benefits:["removes concrete blockers","restores execution flow"],risks:["unblocked work may reveal additional defects"],uncertainty:"Material",estimatedConfidence:78},
      {title:`Pause ${projectName}`,detail:"Remove the highest-pressure commitment until shared dependencies recover.",projectDecision:project?{id:project.id,action:"pause"}:null,crisisIntervention:intervention("reduce-overload",{projectId:project?.id||null}),strategy:"conservative",benefits:["reduces portfolio contention","protects the remaining work"],risks:["creates a project delay"],uncertainty:"Material",estimatedConfidence:70},
      {title:"Reduce scope across active projects",detail:"Lower concurrent demand while keeping the portfolio operating.",portfolioAction:"cut-burn",crisisIntervention:intervention("reduce-overload"),strategy:"scope",benefits:["reduces coordination pressure","preserves more projects than a pause"],risks:["delivers less value per project"],uncertainty:"High",estimatedConfidence:61}
    ],
    manufacturing:[
      {title:"Fund supplier and yield recovery",detail:"Spend now to reduce supply exposure and stabilize manufacturing readiness.",crisisIntervention:intervention("manufacturing-investment"),strategy:"quality",benefits:["improves supply, yield, and readiness"],risks:["uses scarce cash"],uncertainty:"Material",estimatedConfidence:72},
      {title:"Limit customer rollout until supply stabilizes",detail:"Protect reliability by slowing expansion to match current capacity.",crisisIntervention:intervention("manufacturing-control"),strategy:"conservative",benefits:["reduces delivery failures","protects customer trust"],risks:["slows revenue growth"],uncertainty:"Material",estimatedConfidence:68},
      {title:"Accept higher supplier risk to maintain volume",detail:"Keep production moving while accepting more defects and volatility.",supply:{risk:8,readiness:3,yield:-2},crisisIntervention:intervention("manufacturing-volume"),strategy:"growth",benefits:["protects near-term shipment volume"],risks:["quality and supply risk may worsen"],uncertainty:"High",estimatedConfidence:43}
    ]
  };
  return choices[type]||choices.operational;
}
function makeCrisisRecoveryEvent(crisis){
  const def=crisisDefinition(crisis.type),days=Math.max(0,crisis.deadlineDay-company.day);
  return {
    id:`crisis-recovery-${crisis.id}`,
    repeatable:false,
    category:"crisis",
    protectedDirect:true,
    crisisRecovery:true,
    title:`${def.title} recovery decision`,
    copy:`The company has ${days} days to establish a credible recovery.`,
    generatedCommunication:{
      type:"Crisis Recovery Memo",
      priority:"Urgent",
      sender:{name:"Executive Recovery Committee",role:"Board and Executive Team"},
      subject:`Action required: ${def.title}`,
      message:`The ${def.title.toLowerCase()} has persisted beyond normal operating control. The company has ${days} days to show sustained recovery. Executive action is required now; choosing an option begins a recovery path but does not guarantee success.`,
      impacts:[...(crisis.visibleSignals||[]).slice(0,3),...(crisis.recoveryCriteria||[]).slice(0,3)],
      recs:[
        ["Board","Choose a measurable recovery path and hold management accountable for the result",84],
        ["Finance","Protect enough operating flexibility to complete the recovery",74],
        ["People","Avoid a response that transfers the entire cost to already strained employees",70]
      ]
    },
    choices:crisisRecoveryChoices(crisis)
  };
}
function applyCrisisIntervention(intervention){
  if(!intervention)return;
  const rules=OFFICE_AQUARIUM_CONSTANTS.crisisBalance.interventions;
  const mode=intervention.mode;
  if(mode==="clear-blockers"){
    const blocked=(company.workItems||[]).filter(w=>w.progress<100&&(w.blockedBy||[]).length).sort((a,b)=>(b.priority||0)-(a.priority||0)).slice(0,rules.blockerClearCount);
    blocked.forEach(w=>{w.blockedBy=[];w.status="open";w.lastUnblockedDay=company.day;});
    const projectIds=new Set(blocked.map(w=>w.projectId).filter(Boolean));
    (company.projects||[]).filter(p=>projectIds.has(p.id)).forEach(p=>{p.visibleRisk=clamp((p.visibleRisk||50)-rules.blockerRiskRelief,0,100);p.performance={...(p.performance||{}),riskTrend:clamp((p.performance?.riskTrend??p.visibleRisk)-rules.blockerRiskRelief,0,100)};});
    company.quality=clamp(company.quality+rules.qualityGain,0,100);
    company.integration=clamp(company.integration+rules.integrationGain,0,100);
    employees.filter(e=>e.active).forEach(e=>applyEmployeeEmotionDelta(e,{stressDelta:-rules.blockerStressRelief,reasonCode:"crisis-blocker-sprint",sourceEventId:company.crisis?.id||"crisis",ignoreCooldown:true}));
  }else if(mode==="reduce-overload"){
    const target=(company.projects||[]).find(p=>p.id===intervention.projectId);
    if(target&&target.status!=="paused")applyProjectDecision({id:target.id,action:"pause"});
    employees.filter(e=>e.active).forEach(e=>applyEmployeeEmotionDelta(e,{stressDelta:-Math.round(rules.employeeStressRelief*.5),moraleDelta:1,reasonCode:"crisis-overload-relief",sourceEventId:company.crisis?.id||"crisis",ignoreCooldown:true}));
  }else if(mode==="workforce-recovery"){
    employees.filter(e=>e.active).forEach(e=>applyEmployeeEmotionDelta(e,{stressDelta:-rules.employeeStressRelief,moraleDelta:rules.employeeMoraleGain,reasonCode:"crisis-workforce-recovery",sourceEventId:company.crisis?.id||"crisis",ignoreCooldown:true}));
  }else if(mode==="contractor-coverage"){
    company.crisisContractorCoverageUntil=company.day+rules.contractorCoverageDays;
    employees.filter(e=>e.active).forEach(e=>applyEmployeeEmotionDelta(e,{stressDelta:-Math.round(rules.employeeStressRelief*.6),moraleDelta:1,reasonCode:"crisis-contractor-coverage",sourceEventId:company.crisis?.id||"crisis",ignoreCooldown:true}));
  }else if(mode==="investor-plan"){
    applyInvestorEffect({confidence:rules.investorConfidenceGain,pressure:-rules.investorPressureRelief});
    company.board=clamp(company.board+rules.boardConfidenceGain,0,100);
  }else if(mode==="reputation-recovery"){
    company.trust=clamp(company.trust+rules.reputationTrustGain,0,100);
    company.customerSentiment=clamp((company.customerSentiment||50)+rules.customerSentimentGain,0,100);
  }else if(mode==="manufacturing-investment"){
    company.cash=clamp(company.cash-rules.manufacturingInvestmentCost,0,OFFICE_AQUARIUM_CONSTANTS.defaults.simulationValueCeiling);
    company.manufacturing.supplyRisk=clamp(company.manufacturing.supplyRisk-rules.manufacturingSupplyRelief,0,100);
    company.manufacturing.readiness=clamp(company.manufacturing.readiness+rules.manufacturingReadinessGain,0,100);
    company.manufacturing.yield=clamp(company.manufacturing.yield+rules.manufacturingYieldGain,0,100);
  }else if(mode==="manufacturing-control"){
    company.manufacturing.supplyRisk=clamp(company.manufacturing.supplyRisk-Math.round(rules.manufacturingSupplyRelief*.6),0,100);
    company.customerSentiment=clamp((company.customerSentiment||50)-1,0,100);
  }else if(mode==="manufacturing-volume"){
    company.manufacturing.capacity=clamp((company.manufacturing.capacity||0)+4,0,100);
  }
  if(company.crisis){
    company.crisis.relatedDecisionIds=[...(company.crisis.relatedDecisionIds||[]),`decision-${company.day}-${mode}`].slice(-12);
    company.crisis.currentProgress=crisisRecoveryProgress(company.crisis.type);
  }
  const episode=(company.crisisLearningEpisodes||[]).find(row=>row.crisisId===company.crisis?.id);
  if(episode)episode.interventions=[...(episode.interventions||[]),{day:company.day,mode}];
  recordHistory(`Executive recovery action began: ${String(mode).replace(/-/g," ")}.`,"crisis",5);
}
function crisisRecoveryForType(){
  normalizeCrisisState();
  const t=company.crisis?.type||company.crisisType;
  const progress=crisisRecoveryProgress(t);
  if(company.crisis){company.crisis.currentProgress=progress;if(t==="staffing")company.crisis.currentProgressDetail=staffingCrisisProgressDetail();}
  return progress>=100;
}
function renderOrganizationalDynamics(){
  const el=document.getElementById("organizationalDynamics");if(!el)return;
  ensureLeadershipSystems();
  const active=employees.filter(e=>e.active);
  const highRisk=active.filter(e=>(e.retentionRisk||0)>=60).length;
  const nextQ=Math.max(0,WORKFORCE_TIME_RULES.daysPerQuarter-(company.day-company.lastQuarterlyReviewDay));
  const momentum=company.organizationalMomentum;
  const stage=company.crisisStage?`${String(company.crisisType||"company").replace(/\b\w/g,c=>c.toUpperCase())} ${company.crisisStage}`:"No sustained crisis trajectory";
  el.innerHTML=`<strong>Organizational Dynamics</strong><br><small>
    Next quarterly review in ${nextQ} ${nextQ===1?"day":"days"} | ${highRisk} elevated retention risk | ${stage}<br>
    Leadership: quality ${Math.round(company.leadership.qualityFocus)}, people ${Math.round(company.leadership.employeeWellbeing)}, finance ${Math.round(company.leadership.financialDiscipline)}, transparency ${Math.round(company.leadership.transparency)}<br>
    Momentum: execution ${Math.round(momentum.execution)}, financial ${Math.round(momentum.financial)}, culture ${Math.round(momentum.culture)}, turnover ${Math.round(momentum.turnover)}
  </small>`;
}
function renderWorkforcePressure(){
  const el=document.getElementById("workforcePressure");if(!el)return;
  ensureWorkforceEconomySystems?.();
  const hasSignals=(company.staffingNeeds||[]).length||(company.recruitingPipeline||[]).length||(company.hiringRequests||[]).length||employees.some(e=>e.active&&((e.retentionRisk||0)>=55||e.performanceManagement?.stage!=="none"))||runwayDaysOrUnknown(company.finance)<180;
  el.innerHTML=hasSignals?workforceFinancialPressureHtml():"";
  toggleSectionVisibility(el,!!hasSignals);
}
function pruneLongRunCollections(){
  if(!company)return;
  company.log=Array.isArray(company.log)?company.log.slice(-80):[];
  company.weeklyEvents=Array.isArray(company.weeklyEvents)?company.weeklyEvents.slice(-40):[];
  company.employeeMessages=Array.isArray(company.employeeMessages)?company.employeeMessages.filter(m=>company.day-(m.createdDay??company.day)<=45||["queued-for-ceo","manager-reviewed"].includes(m.status)).slice(-160):[];
  company.issueRecords=Array.isArray(company.issueRecords)?company.issueRecords.filter(i=>company.day-(i.createdDay??company.day)<=45||["ceo-decision","open"].includes(i.status)).slice(-120):[];
  company.escalationQueue=Array.isArray(company.escalationQueue)?company.escalationQueue.slice(0,8):[];
  company.storyChains=Array.isArray(company.storyChains)?company.storyChains.filter(c=>company.day-(c.lastDay??c.startedDay??company.day)<=60||(c.beats||[]).length>=4).slice(0,80):[];
  company.workItems=typeof compactWorkItemHistory==="function"?compactWorkItemHistory(company.workItems):Array.isArray(company.workItems)?company.workItems:[];
  company.history=Array.isArray(company.history)?company.history.slice(0,260):[];
  company.communications=Array.isArray(company.communications)?company.communications.slice(0,60):[];
}
function recordSimulationError(error,phase="simulation"){
  if(!company)return null;
  const message=error?.message||String(error||"Unknown simulation error");
  const rec={day:company.day,minute:company.minute,phase,message,stack:String(error?.stack||"").slice(0,1200)};
  company.systemErrors=Array.isArray(company.systemErrors)?company.systemErrors:[];
  company.systemErrors.unshift(rec);
  company.systemErrors=company.systemErrors.slice(0,OFFICE_AQUARIUM_CONSTANTS.runtimeRecovery.maximumSystemErrors);
  company.lastSimulationError=rec;
  company.paused=true;
  company.runtimeFailure={day:company.day,minute:company.minute,phase,safeStage:playerSafeRuntimeStage?.(phase)||"the company simulation",saveStatus:"Emergency save pending"};
  if(Array.isArray(company.log))company.log.push(`Simulation paused after ${phase} error: ${message}`);
  const saveResult=validationMode?{ok:false,errorCode:"VALIDATION_MODE"}:saveGame?.({emergency:true});
  showRuntimeFailure?.(rec,saveResult);
  return rec;
}
function dailyClose(){
  ensureBibleSystems?.();
  company.lastDailyCloseStatus={day:company.day,minute:company.minute,status:"running",stage:"daily-close",hashBefore:stateHash?.(),startedAt:new Date().toISOString()};
  try{
    dailyCloseCoreOrdered();
    company.lastDailyCloseStatus={day:company.day,minute:company.minute,status:"ok",stage:"daily-close",hashAfter:stateHash?.(),completedAt:new Date().toISOString()};
  }catch(error){
    company.lastDailyCloseStatus={day:company.day,minute:company.minute,status:"error",stage:"daily-close",message:error?.message||String(error),hashAfter:stateHash?.(),completedAt:new Date().toISOString()};
    recordSimulationError(error,error?.dailyStage?`dailyClose:${error.dailyStage}`:"dailyClose");
  }
}

function runDailyStage(name,fn){
  ensureBibleSystems?.();
  const captureHashes=!DAILY_PIPELINE_RULES.captureStageHashesInDebugOnly||debugMode;
  const rec={day:company.day,minute:company.minute,stage:name,status:"running",startedAt:new Date().toISOString()};
  if(captureHashes)rec.hashBefore=stateHash?.();
  company.dailyStageStatus=[rec,...(company.dailyStageStatus||[])].slice(0,80);
  try{
    const result=fn?.();
    rec.status="ok";if(captureHashes)rec.hashAfter=stateHash?.();rec.completedAt=new Date().toISOString();
    return result;
  }catch(error){
    rec.status="error";rec.message=error?.message||String(error);if(captureHashes)rec.hashAfter=stateHash?.();rec.completedAt=new Date().toISOString();
    company.lastDailyCloseStatus=rec;
    error.dailyStage=name;
    throw error;
  }
}
function recordDailyStageCheckpoint(name,status="ok",detail=""){
  ensureBibleSystems?.();
  const rec={day:company.day,minute:company.minute,stage:name,status,detail,hashAfter:stateHash?.(),completedAt:new Date().toISOString()};
  company.dailyStageStatus=[rec,...(company.dailyStageStatus||[])].slice(0,80);
  return rec;
}

function maybeEmergentEvent(){if(simulationRandom()>.025)return;const active=employees.filter(e=>e.active);if(!active.length)return;const e=active[Math.floor(simulationRandom()*active.length)];if(e.stress>78){applyEmployeeEmotionDelta(e,{moraleDelta:-8,stressDelta:1,reasonCode:"workload-warning",sourceEventId:`workload-warning-${e.id}-${company.day}-${company.minute}`,exceptional:true});company.board-=2;company.log.push(`${e.name} warned that the workload is unsustainable.`);}else if(e.taskProgress>18){e.taskProgress=0;e.achievements++;company.trust+=2;company.valuation+=.8;company.log.push(`${e.name} completed a difficult ${e.role.toLowerCase()} milestone.`);recordWeeklyEvent(`${e.name} completed a major ${e.role.toLowerCase()} milestone.`,"people",3);}else{const other=socialTarget(e);if(other){recordSharedExperience(e,other,{type:"direct_help",sourceEventId:`emergent-help-${e.id}-${other.id}-${company.day}-${company.minute}`,tone:"positive",intensity:2});addMemory(e,"SOCIAL_HELP",`${other.name} helped me with difficult work.`,"positive",9,other.name);addMemory(other,"SOCIAL_HELP",`I helped ${e.name} with difficult work.`,"positive",7,e.name);company.log.push(`${e.name} helped ${other.name}, strengthening cooperation.`);recordWeeklyEvent(`${e.name} helped ${other.name}, strengthening cooperation.`,"people",2);}}}
function endGame(message,type="ceo-fired",failureCode=null){
  company.gameOver=true;company.paused=true;company.failureType=type;company.failureOwner=type;company.failureCode=failureCode||(type==="company-failure"?"COMPANY_FAILURE":"CEO_REMOVED");
  if(company.crisis&&company.crisisLearningEpisodes?.[0]?.crisisId===company.crisis.id){
    company.crisisLearningEpisodes[0].status="complete";
    company.crisisLearningEpisodes[0].outcome="failed";
    company.crisisLearningEpisodes[0].outcomes=[...(company.crisisLearningEpisodes[0].outcomes||[]),"failed"];
    company.crisisLearningEpisodes[0].attributionQuality=Math.max(company.crisisLearningEpisodes[0].attributionQuality||0,70);
    company.crisisLearningEpisodes[0].completedDay=company.day;
  }
  const copy=type==="company-failure"?"Office Aquarium Technologies has ceased operations.":"The Board of Directors has appointed a new CEO.";
  const el=document.getElementById("gameOverCopy");if(el)el.textContent=`${copy} ${message}`;
  document.getElementById("gameOverOverlay")?.classList.remove("hidden");
  recordHistory(`${type==="company-failure"?"Company failure":"CEO removed"} (${company.failureCode}): ${message}`,"failure",8);
}
function immediateFailure(){
  ensureWorkforceEconomySystems?.();
  const active=employees.filter(e=>e.active).length,technical=activeTechnicalEmployees();
  if(company.cash<=-2)return {type:"company-failure",code:"COMPANY_INSOLVENCY",message:"The company became insolvent."};
  if(company.board<=0)return {type:"ceo-fired",code:"CEO_BOARD_CONFIDENCE_ZERO",message:"Board confidence reached zero."};
  if(active===0)return {type:"company-failure",code:"COMPANY_NO_EMPLOYEES",message:"No active employees remain."};
  if(technical===0)return {type:"company-failure",code:"COMPANY_NO_TECHNICAL_EMPLOYEES",message:"No active technical employees remain to build or support the product."};
  if(company.phase==="launched"&&company.trust<=0)return {type:"company-failure",code:"COMPANY_TRUST_COLLAPSE",message:"Customers lost all trust after launch."};
  if((company.unpaidPayrollDays||0)>=2)return {type:"company-failure",code:"COMPANY_PAYROLL_FAILURE",message:"The company failed to meet payroll for two consecutive days."};
  if((company.boardGovernance?.strikes||0)>=3)return {type:"ceo-fired",code:company.lastBoardStrikeFailureCode||"CEO_THREE_BOARD_STRIKES",message:"The board recorded three governance strikes."};
  return null;
}
function currentFailureReason(){ensureBibleSystems?.();return typedCrisisCandidate()?.visibleSignals?.[0]||null;}
function crisisRecovered(){return company.cash>3&&company.board>20&&avgStress()<75&&company.trust>20&&employees.filter(e=>e.active).length>=4}
function startCrisis(r){
  normalizeCrisisState();
  const candidate=typeof r==="object"?r:makeCrisisCandidate(company.crisisType||"financial",[String(r||"The company has entered a systemic crisis.")],70);
  const def=crisisDefinition(candidate.type);
  company.crisis={...candidate,id:`crisis-${company.nextCrisisId++}`,failureOwner:candidate.failureOwner||def.owner,failureCode:candidate.failureCode||def.code,status:"active",escalationStage:"crisis",currentProgress:crisisRecoveryProgress(candidate.type)};
  company.crisisType=company.crisis.type;company.crisisStage="crisis";company.crisisDays=Math.max(0,company.crisis.deadlineDay-company.day);
  company.crisisLearningEpisodes.unshift({
    ownerSystem:AI_SYSTEM_OWNERS.institutional,
    id:`crisis-learning-${company.nextCrisisLearningEpisodeId++}`,
    crisisId:company.crisis.id,
    type:company.crisis.type,
    startedDay:company.day,
    warningSignals:[...(company.crisis.visibleSignals||[])],
    managerInterpretations:[`${crisisDefinition(company.crisis.type).title} requires executive recovery tracking.`],
    interventions:[],
    affectedEntities:[...(company.crisis.relatedProjectIds||[]),...(company.crisis.relatedDepartmentIds||[]),...(company.crisis.relatedEmployeeIds||[])],
    reviewDays:[company.day+7,company.day+21,company.day+45],
    outcomes:[],
    attributionQuality:0,
    evidence:[...(company.crisis.visibleSignals||[])],
    status:"observing",
    outcome:null
  });
  company.crisisLearningEpisodes=company.crisisLearningEpisodes.slice(0,40);
  const recoveryEvent=makeCrisisRecoveryEvent(company.crisis);
  const alreadyQueued=(company.escalationQueue||[]).some(ev=>ev.id===recoveryEvent.id)||company.pendingEvent?.id===recoveryEvent.id;
  if(!alreadyQueued){
    company.escalationQueue.unshift(recoveryEvent);
    recordMetricEvent("queuedEscalations");
  }
  company.log.push(`Crisis opened: ${crisisDisplayText(company.crisis)} Recovery deadline day ${company.crisis.deadlineDay}.`);
  recordHistory(`${crisisDefinition(company.crisis.type).title} opened with visible evidence: ${(company.crisis.visibleSignals||[]).join("; ")}`,"crisis",6);
}
function crisisDeadlineFailureType(){normalizeCrisisState();return company.crisis?.failureOwner||crisisDefinition(company.crisisType).owner;}
function clearCrisis(reason="resolved"){
  if(company.crisisLearningEpisodes?.[0]?.crisisId===company.crisis?.id){company.crisisLearningEpisodes[0].status="complete";company.crisisLearningEpisodes[0].outcome=reason;company.crisisLearningEpisodes[0].outcomes=[...(company.crisisLearningEpisodes[0].outcomes||[]),reason];company.crisisLearningEpisodes[0].attributionQuality=Math.max(company.crisisLearningEpisodes[0].attributionQuality||0,60);company.crisisLearningEpisodes[0].completedDay=company.day;}
  company.log.push(reason==="resolved"?"The crisis has been resolved through sustained recovery.":"The crisis record has been closed.");
  company.crisis=null;company.crisisDays=0;company.crisisType=null;company.crisisStage=null;
}
function evaluateFailure(){
  if(company.gameOver)return;
  normalizeCrisisState();
  const immediate=immediateFailure();
  if(immediate){endGame(immediate.message,immediate.type,immediate.code);return;}
  if(company.crisis&&crisisRecoveryForType()){clearCrisis("resolved");return;}
  if(!company.crisis){
    const candidate=typedCrisisCandidate();
    if(candidate)startCrisis(candidate);
  }
}
function advanceCrisisDay(){
  normalizeCrisisState();
  if(!company.crisis||company.gameOver)return;
  company.crisis.currentProgress=crisisRecoveryProgress(company.crisis.type);
  if(crisisRecoveryForType()){clearCrisis("resolved");return;}
  company.crisisDays=Math.max(0,company.crisis.deadlineDay-company.day);
  if([14,7,3].includes(company.crisisDays))company.log.push(`Crisis deadline warning: ${company.crisisDays} days remain for ${crisisDefinition(company.crisis.type).title}.`);
  if(company.crisisDays<=0){endGame(`${crisisDisplayText(company.crisis)} The recovery deadline expired.`,company.crisis.failureOwner,company.crisis.failureCode);}
}
