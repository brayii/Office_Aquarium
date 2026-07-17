const LABOR_MARKET_DEPARTMENTS=["hardware","software","quality","product","finance","people","operations","customerSuccess","support"];
function defaultLaborMarketSegment(dept){
  const world=company?.worldState||{},base=world.talentMarket??50;
  const scarcity={hardware:12,software:8,quality:5,product:0,finance:-4,people:-2,operations:2,customerSuccess:0,support:-6}[dept]||0;
  return {candidateSupply:clamp(base-scarcity+rand(-6,6),15,95),salaryPressure:clamp(45+scarcity+rand(-5,9),15,95),competition:clamp((world.competitorAggression??50)+scarcity*.6+rand(-8,8),10,95),averageQuality:clamp(55+base*.12-scarcity*.15+rand(-5,7),25,95),timeToFill:clamp(18+scarcity*.7+(50-base)*.25+rand(-3,5),6,90),acceptanceRate:clamp(68-scarcity*.35+(base-50)*.18+rand(-6,6),12,95),contractorAvailability:clamp(55-scarcity*.2+rand(-8,8),10,95),remoteAvailability:clamp(58+rand(-10,10),10,95),lastUpdatedDay:company?.day||0};
}
function ensureLaborMarket(){
  company.laborMarket=company.laborMarket&&typeof company.laborMarket==="object"?company.laborMarket:{};
  LABOR_MARKET_DEPARTMENTS.forEach(dept=>{company.laborMarket[dept]={...defaultLaborMarketSegment(dept),...(company.laborMarket[dept]||{})};});
}
function updateLaborMarketDaily(){
  ensureLaborMarket();
  Object.entries(company.laborMarket).forEach(([dept,m])=>{
    const pressure=(company.worldState?.talentMarket??50)-50,competition=(company.worldState?.competitorAggression??50)-50;
    m.candidateSupply=clamp((m.candidateSupply??50)+pressure*.015-competition*.01+rand(-.45,.45),5,100);
    m.salaryPressure=clamp((m.salaryPressure??50)+competition*.018-pressure*.01+rand(-.35,.45),5,100);
    m.competition=clamp((m.competition??50)+competition*.018+rand(-.35,.35),5,100);
    m.averageQuality=clamp((m.averageQuality??55)+(m.candidateSupply-50)*.01+rand(-.25,.25),15,100);
    m.timeToFill=clamp((m.timeToFill??20)+(50-m.candidateSupply)*.025+(m.competition-50)*.018+rand(-.2,.35),5,120);
    m.acceptanceRate=clamp((m.acceptanceRate??65)+(m.candidateSupply-50)*.012-(m.salaryPressure-50)*.016+rand(-.3,.3),5,98);
    m.contractorAvailability=clamp((m.contractorAvailability??55)+(m.candidateSupply-50)*.012+rand(-.35,.35),5,100);
    m.remoteAvailability=clamp((m.remoteAvailability??58)+rand(-.25,.25),5,100);
    m.lastUpdatedDay=company.day;
  });
}
function laborMarketForDepartment(dept){ensureLaborMarket();return company.laborMarket?.[dept]||defaultLaborMarketSegment(dept);}
function repairRecruitingPipelineIntegrity(){
  if(!company||!Array.isArray(company.recruitingPipeline)||!Array.isArray(employees))return;
  company.recruitingPipeline.forEach(item=>{
    const role=canonicalRole(item.role);
    if(!roleDefinition(role))return;
    if(item.status==="contractor"){
      item.contractorCoverage=true;
      item.contractorCoverageUntil=Number(item.contractorCoverageUntil)||company.day+14;
      item.status="searching";item.stage="searching";item.stageStartedDay=company.day;item.dueDay=Math.max(company.day+3,Number(item.dueDay)||company.day+7);
      item.repairedFromContractorStatus=true;
      company.hiringRequestHistory.unshift({day:company.day,role:item.role,department:item.department,status:"repaired-contractor-search"});
    }
    if(item.status==="accepted"){
      const filledDay=Number.isFinite(item.filledDay)?item.filledDay:null;
      const matchingHire=filledDay!==null&&employees.some(e=>e&&e.active&&canonicalRole(e.role)===role&&Math.abs((Number(e.joinedDay)||0)-filledDay)<=1&&(e.careerHistory||[]).some(h=>/Hired as|Backfilled as|Selected by HR/i.test(String(h))));
      if(!matchingHire&&company.day-(filledDay??item.day??company.day)<60){
        item.status="searching";item.stage="searching";item.stageStartedDay=company.day;item.dueDay=company.day+stageDaysForRecruiting(item,"searching");item.repairedMissingHire=true;
        company.hiringRequestHistory.unshift({day:company.day,role:item.role,department:item.department,status:"repaired-missing-hire"});
      }
    }
  });
}
function ensureWorkforceEconomySystems(){
  if(!company||!Array.isArray(employees))return;
  company.finance={payrollDaily:0,facilitiesDaily:0,manufacturingDaily:0,supportDaily:0,contractorDaily:0,growthOverhead:0,debtOrFundingCost:0,crisisCost:0,totalDailyCost:.24,grossRevenueDaily:0,netCashFlowDaily:0,runwayDays:90,unpaidPayrollDays:0,...(company.finance||{})};
  company.unpaidPayrollDays=Number(company.unpaidPayrollDays)||Number(company.finance.unpaidPayrollDays)||0;
  company.staffingModel=company.staffingModel&&typeof company.staffingModel==="object"?company.staffingModel:{};
  company.boardGovernance={strikes:0,pipActive:false,pipStartDay:null,pipDeadlineDay:null,pipTargets:null,consecutivePoorQuarters:0,lastQuarterGrade:"new",lastStrikeDay:-999,...(company.boardGovernance||{})};
  company.layoffHistory=Array.isArray(company.layoffHistory)?company.layoffHistory:[];
  company.hiringRequests=Array.isArray(company.hiringRequests)?company.hiringRequests:[];
  company.hiringNeedHistory=company.hiringNeedHistory&&typeof company.hiringNeedHistory==="object"?company.hiringNeedHistory:{};
  company.hiringRequestHistory=Array.isArray(company.hiringRequestHistory)?company.hiringRequestHistory:[];
  company.managerActions=Array.isArray(company.managerActions)?company.managerActions:[];
  company.terminationNotifications=Array.isArray(company.terminationNotifications)?company.terminationNotifications:[];
  company.successionRisks=Array.isArray(company.successionRisks)?company.successionRisks:[];
  company.recruitingPipeline=Array.isArray(company.recruitingPipeline)?company.recruitingPipeline:[];
  repairRecruitingPipelineIntegrity();
  company.restructuringRequests=Array.isArray(company.restructuringRequests)?company.restructuringRequests:[];
  company.hiringExceptions=Array.isArray(company.hiringExceptions)?company.hiringExceptions:[];
  ensureLaborMarket();
  ensureCompanyCapabilityModel();
  company.internalTransfers=Array.isArray(company.internalTransfers)?company.internalTransfers:[];
  company.hiringPolicy={mode:"normal",setDay:0,reviewDay:0,reason:null,approvedRoleIds:[],suppressed:0,...(company.hiringPolicy||{})};
  if(!["normal","critical-only","frozen"].includes(company.hiringPolicy.mode))company.hiringPolicy.mode="normal";
  company.hiringPolicyHistory=Array.isArray(company.hiringPolicyHistory)?company.hiringPolicyHistory:[];
  const workforceDefaults={helpSeeking:{score:0,confidence:0,count:0,lastEvidence:""},burnoutRecovery:{score:0,confidence:0,count:0,lastEvidence:""},coaching:{score:0,confidence:0,count:0,lastEvidence:""},performanceManagement:{score:0,confidence:0,count:0,lastEvidence:""},hiringTiming:{score:0,confidence:0,count:0,lastEvidence:""},successionPlanning:{score:0,confidence:0,count:0,lastEvidence:""},retention:{score:0,confidence:0,count:0,lastEvidence:""},terminationTiming:{score:0,confidence:0,count:0,lastEvidence:""},layoffCaution:{score:0,confidence:0,count:0,lastEvidence:""},workloadBalancing:{score:0,confidence:0,count:0,lastEvidence:""}};
  company.workforceLessons=company.workforceLessons&&typeof company.workforceLessons==="object"?company.workforceLessons:{};
  Object.entries(workforceDefaults).forEach(([k,v])=>{company.workforceLessons[k]={...v,...(company.workforceLessons[k]||{})};});
  company.companyRiskComponents={financial:0,people:0,product:0,customer:0,operational:0,leadership:0,staffing:0,total:0,label:"Stable",...(company.companyRiskComponents||{})};
  employees.forEach(e=>{
    e.employment={...defaultEmploymentForRole(e.role),...(e.employment||{})};
    e.employment.salarySatisfaction=Number.isFinite(e.employment.salarySatisfaction)?e.employment.salarySatisfaction:(Number.isFinite(e.salarySatisfaction)?e.salarySatisfaction:65);
    e.salarySatisfaction=e.employment.salarySatisfaction;
    e.retention={stayScore:e.stayScore??72,riskLevel:"stable",searching:(e.jobSearchDays||0)>0,searchDays:e.jobSearchDays||0,lastReviewDay:e.quarterlyReview?.day??-999,salarySatisfaction:e.salarySatisfaction??65,careerSatisfaction:e.recognitionSatisfaction??60,leadershipFit:e.opinionOfCEO?.trust??55,cultureFit:e.morale??60,...(e.retention||{})};
    e.careerLifecycle={age:e.age??30,yearsAtCompany:Math.max(0,Math.floor(((company.day||0)-(e.joinedDay||0))/365)),retirementReadiness:e.retirementReadiness||0,earlyRetirementInterest:0,plannedRetirementDay:null,successionRisk:0,...(e.careerLifecycle||{})};
    e.burnoutResponse={helpAttempts:0,delegationAttempts:0,recoveryAttempts:0,managerEscalated:false,lastHelpDay:-999,lastRecoveryDay:-999,unresolvedDays:0,...(e.burnoutResponse||{})};
    e.performanceManagement={stage:"none",coachingAttempts:0,pipAttempts:0,pipStartDay:null,pipDueDay:null,lastActionDay:-999,documentedIssues:0,improvementScore:0,hrReviewed:false,terminationEligible:false,...(e.performanceManagement||{})};
    e.managerHistory=Array.isArray(e.managerHistory)?e.managerHistory:[];
    e.terminationHistory=Array.isArray(e.terminationHistory)?e.terminationHistory:[];
    e.helpSeekingHistory=Array.isArray(e.helpSeekingHistory)?e.helpSeekingHistory:[];
    e.compensationHistory=Array.isArray(e.compensationHistory)?e.compensationHistory:[];
    e.layoffSurvivorMemory=Number(e.layoffSurvivorMemory)||0;
  });
}
function ensureCompanyCapabilityModel(){
  if(!company)return;
  company.capabilityNeeds={...DEFAULT_COMPANY_CAPABILITY_NEEDS,...(company.capabilityNeeds||{})};
  company.capabilityCoverage=company.capabilityCoverage&&typeof company.capabilityCoverage==="object"?company.capabilityCoverage:{};
  company.capabilityGaps=Array.isArray(company.capabilityGaps)?company.capabilityGaps:[];
  company.capabilityConsequences=company.capabilityConsequences&&typeof company.capabilityConsequences==="object"?company.capabilityConsequences:{};
  company.capabilityPromotionCandidates=Array.isArray(company.capabilityPromotionCandidates)?company.capabilityPromotionCandidates:[];
  company.capabilityFulfillmentOptions=company.capabilityFulfillmentOptions&&typeof company.capabilityFulfillmentOptions==="object"?company.capabilityFulfillmentOptions:{};
  company.capabilityAudit=company.capabilityAudit&&typeof company.capabilityAudit==="object"?company.capabilityAudit:{day:company.day,kept:[],removed:[],revised:[]};
  employees?.forEach(e=>{
    e.actingCapabilityAssignments=Array.isArray(e.actingCapabilityAssignments)?e.actingCapabilityAssignments:[];
    e.companySupportHistory=Array.isArray(e.companySupportHistory)?e.companySupportHistory:[];
  });
}
function capabilityLearningBias(capability){
  const lessonMap={
    managementCapacity:["workloadBalancing","coaching","performanceManagement"],
    portfolioGovernance:["crossDepartmentCoordination","planning","scopeControl"],
    financialPlanning:["hiringTiming","estimateAccuracy","sunkCostDiscipline"],
    manufacturingReadiness:["supplierRisk","earlyQA"],
    customerSupportCapacity:["customerValidation","marketTiming"],
    technicalLeadership:["earlyQA","crossDepartmentCoordination"],
    mentoringCapacity:["mentoring","helpSeeking","burnoutRecovery"],
    successionCoverage:["successionPlanning","retention"],
    crossProjectCoordination:["crossDepartmentCoordination","planning"],
    executiveCommunication:["escalation","planning"]
  }[capability]||[];
  return lessonMap.reduce((sum,key)=>{
    const wl=company.workforceLessons?.[key],pl=company.projectLessons?.[key];
    return sum+clamp((wl?.score||0)*(wl?.confidence||0)/100+(pl?.score||0)*(pl?.confidence||0)/100,-8,8);
  },0);
}
function activeCapabilityProjects(){
  return typeof activeProjects==="function"?activeProjects():(company.projects||[]).filter(p=>!["completed","canceled","rejected","merged"].includes(p.status));
}
function updateCompanyCapabilityNeeds(){
  ensureCompanyCapabilityModel();
  const active=employees.filter(e=>e.active),projects=activeCapabilityProjects(),finance=company.finance||{},manufacturing=company.manufacturing||{},avgProjectRisk=projects.reduce((s,p)=>s+(p.performance?.riskTrend||p.visibleRisk||50),0)/Math.max(1,projects.length);
  const projectGaps=typeof buildWorkforceAllocationSnapshot==="function"?buildWorkforceAllocationSnapshot():null;
  const missingAssignments=projectGaps?.totals?.missingAssignments||0,blocked=projectGaps?.totals?.actualBlockedWork??(company.workItems||[]).filter(w=>w.status==="open"&&(w.blockedBy||[]).length).length;
  const onboarding=active.filter(e=>e.performanceManagement?.stage==="onboarding").length,retention=active.filter(e=>(e.retentionRisk||0)>55).length,retirement=active.filter(e=>(e.retirementReadiness||0)>55).length;
  const lessons=Object.keys(DEFAULT_COMPANY_CAPABILITY_NEEDS).reduce((out,k)=>(out[k]=capabilityLearningBias(k),out),{});
  company.capabilityNeeds={
    managementCapacity:clamp(18+active.length*3+avgStress()*.22+blocked*4+missingAssignments*5+Math.max(0,active.length-8)*5-lessons.managementCapacity,0,100),
    portfolioGovernance:clamp(8+projects.length*15+Math.max(0,projects.length-2)*10+Math.max(0,avgProjectRisk-55)*.35+missingAssignments*4-lessons.portfolioGovernance,0,100),
    financialPlanning:clamp(18+(finance.runwayDays<120?22:finance.runwayDays<220?10:0)+Math.max(0,-Number(finance.netCashFlowDaily||0))*180+projects.length*4+(company.hiringRequests||[]).length*2-lessons.financialPlanning,0,100),
    manufacturingReadiness:clamp((company.phase==="launched"||company.phase==="pilot"||company.customers>0?36:14)+Math.max(0,(manufacturing.supplyRisk||35)-45)*.55+Math.max(0,60-(manufacturing.readiness||55))*.45+projects.filter(p=>/hardware|chip|manufacturing|yield|processor|accelerator/i.test(`${p.family} ${p.title}`)).length*8-lessons.manufacturingReadiness,0,100),
    customerSupportCapacity:clamp(12+Math.min(44,(company.customers||0)*.35)+Math.max(0,65-(company.customerSentiment||company.trust||60))*.4+(company.phase==="launched"?16:0)-lessons.customerSupportCapacity,0,100),
    technicalLeadership:clamp(20+projects.filter(p=>["hardware","software"].includes(p.proposingDepartment)||(p.requiredDepartments||[]).some(d=>["hardware","software","quality"].includes(d))).length*8+Math.max(0,avgProjectRisk-50)*.35+Math.max(0,60-(company.integration||50))*.30+blocked*5-lessons.technicalLeadership,0,100),
    mentoringCapacity:clamp(10+onboarding*18+active.filter(e=>e.stress>70).length*7+Math.max(0,active.length-8)*4+retention*5-lessons.mentoringCapacity,0,100),
    successionCoverage:clamp(8+retirement*22+retention*8+(company.openRoles||[]).length*10+active.filter(e=>e.careerLifecycle?.successionRisk>45).length*14-lessons.successionCoverage,0,100),
    crossProjectCoordination:clamp(10+projects.length*11+missingAssignments*4+blocked*3+Math.max(0,(company.portfolioHealth?.concentrationRisk||0)-60)*.25-lessons.crossProjectCoordination,0,100),
    executiveCommunication:clamp(10+(company.boardGovernance?.strikes||0)*18+Math.max(0,55-(company.board||55))*.36+(company.escalationQueue||[]).length*3+(company.crisis?22:0)-lessons.executiveCommunication,0,100)
  };
  company.capabilityLearningSignals=lessons;
  return company.capabilityNeeds;
}
function employeeCapabilityContribution(e,capability){
  if(!e?.active)return 0;
  let value=roleCapabilityContribution(e.role,capability,e);
  (e.actingCapabilityAssignments||[]).filter(a=>a.capability===capability&&a.untilDay>=company.day).forEach(a=>value+=Number(a.coverage)||18);
  if(e.temporaryAssignment?.targetCapability===capability)value+=Number(e.temporaryAssignment.productivity||.45)*25;
  return clamp(value,0,100);
}
function updateCompanyCapabilityCoverage(){
  ensureCompanyCapabilityModel();
  const coverage={},contributors={};
  Object.keys(DEFAULT_COMPANY_CAPABILITY_NEEDS).forEach(cap=>{
    const rows=employees.filter(e=>e.active).map(e=>({id:e.id,name:e.name,role:e.role,value:employeeCapabilityContribution(e,cap)})).filter(r=>r.value>8).sort((a,b)=>b.value-a.value);
    contributors[cap]=rows.slice(0,4);
    coverage[cap]=clamp(rows.reduce((sum,row,i)=>sum+row.value*(i===0?.72:i===1?.42:i===2?.24:.12),0),0,100);
  });
  company.capabilityCoverage=coverage;
  company.capabilityContributors=contributors;
  return coverage;
}
function promotionCandidateForCapability(capability){
  const desired=COMPANY_CAPABILITY_TO_ROLES[capability]||[];
  return employees.filter(e=>e.active&&!desired.includes(canonicalRole(e.role))).map(e=>({
    employeeId:e.id,
    name:e.name,
    currentRole:e.role,
    targetRole:desired[0]||roleForCompanyCapability(capability),
    capability,
    readiness:clamp(roleCapabilityContribution(e.role,capability,e)*.55+(e.skills?.leadership||35)*.22+(e.skills?.communication||45)*.18+(e.careerLevel||1)*5-(e.stress||0)*.08,0,100)
  })).sort((a,b)=>b.readiness-a.readiness)[0]||null;
}
function maybeAssignActingCapabilityCoverage(capability,gap){
  const recent=(company.internalTransfers||[]).some(t=>t.targetCapability===capability&&t.status==="active");
  if(recent||gap<24)return false;
  const candidate=promotionCandidateForCapability(capability);
  if(!candidate||candidate.readiness<64)return false;
  const e=employees.find(x=>x.id===candidate.employeeId);
  if(!e)return false;
  const untilDay=company.day+21;
  e.actingCapabilityAssignments=[...(e.actingCapabilityAssignments||[]).filter(a=>a.untilDay>=company.day),{capability,startedDay:company.day,untilDay,coverage:Math.round(candidate.readiness*.34),source:"temporary acting role"}];
  e.companySupportHistory.unshift({day:company.day,type:"acting-capability",capability,targetRole:candidate.targetRole,readiness:Math.round(candidate.readiness)});
  company.internalTransfers.unshift({day:company.day,employeeId:e.id,name:e.name,fromDepartment:roleDepartment(e.role),toDepartment:COMPANY_CAPABILITY_DEPARTMENT[capability]||roleDepartment(e.role),targetRole:candidate.targetRole,targetCapability:capability,type:"temporary acting role",fit:Math.round(candidate.readiness),status:"active"});
  applyEmployeeEmotionDelta(e,{stressDelta:2.5,reasonCode:"acting-capability",sourceEventId:`acting-${capability}-${company.day}`,ignoreCooldown:true});
  recordHistory?.(`${e.name} took temporary acting responsibility for ${COMPANY_CAPABILITY_LABELS[capability]}.`,"people",3);
  return true;
}
function ensureCapabilitySupportWork(capability,gap){
  if(typeof createWorkItem!=="function"||gap<18)return;
  const spec=COMPANY_CAPABILITY_SUPPORT_WORK[capability];if(!spec)return;
  const recent=(company.workItems||[]).some(w=>w.companyCapability===capability&&w.status==="open");
  if(recent)return;
  const item=createWorkItem(spec.department,spec.type,clamp(42+gap*.45,35,88));
  item.title=spec.title;
  item.companyCapability=capability;
  item.projectId=null;
  item.visibleTo=[spec.department,"people","finance"];
  item.requiredSkills=typeof requiredSkillsForWork==="function"?requiredSkillsForWork(spec.department,spec.type):item.requiredSkills;
  company.workItems.push(item);
}
function updateCompanyCapabilityConsequences({createSupport=false}={}){
  ensureCompanyCapabilityModel();
  const consequences={},gaps=[];
  Object.keys(DEFAULT_COMPANY_CAPABILITY_NEEDS).forEach(cap=>{
    const need=Number(company.capabilityNeeds[cap])||0,coverage=Number(company.capabilityCoverage[cap])||0,gap=clamp(need-coverage,0,100);
    if(gap>10){
      const severity=gap>45?"severe":gap>25?"material":"watch";
      const label=COMPANY_CAPABILITY_LABELS[cap]||cap;
      gaps.push({capability:cap,label,need:Math.round(need),coverage:Math.round(coverage),gap:Math.round(gap),severity,role:roleForCompanyCapability(cap),department:COMPANY_CAPABILITY_DEPARTMENT[cap]||"people"});
      consequences[cap]={severity,gap:Math.round(gap),active:true,description:`${label} gap is ${severity}.`};
      if(createSupport){
        ensureCapabilitySupportWork(cap,gap);
        maybeAssignActingCapabilityCoverage(cap,gap);
      }
    }
  });
  company.capabilityGaps=gaps.sort((a,b)=>b.gap-a.gap);
  company.capabilityConsequences=consequences;
  company.capabilityPromotionCandidates=company.capabilityGaps.map(g=>promotionCandidateForCapability(g.capability)).filter(Boolean).slice(0,6);
  company.capabilityFulfillmentOptions=Object.fromEntries(company.capabilityGaps.map(g=>[g.capability,capabilityFulfillmentOptions(g.capability)]));
  applyCompanyCapabilityPressure();
  return company.capabilityGaps;
}
function applyCompanyCapabilityPressure(){
  const gap=cap=>company.capabilityGaps?.find(g=>g.capability===cap)?.gap||0;
  const management=gap("managementCapacity"),portfolio=gap("portfolioGovernance"),finance=gap("financialPlanning"),manufacturing=gap("manufacturingReadiness"),technical=gap("technicalLeadership"),mentoring=gap("mentoringCapacity"),support=gap("customerSupportCapacity"),exec=gap("executiveCommunication");
  if(management>18){employees.filter(e=>e.active).forEach(e=>applyEmployeeEmotionDelta(e,{stressDelta:management*.006,reasonCode:"management-capacity-gap",sourceEventId:`capability-${company.day}`,ignoreCooldown:true}));if(company.teams?.people)company.teams.people.pressure=clamp((company.teams.people.pressure||40)+management*.012,0,100);}
  if(portfolio>18)(company.projects||[]).filter(p=>!["completed","canceled","rejected","merged"].includes(p.status)).forEach(p=>{p.visibleRisk=clamp((p.visibleRisk||50)+portfolio*.006,0,100);});
  if(finance>18&&company.finance){company.finance.forecastConfidence=clamp((company.finance.forecastConfidence??68)-finance*.015,0,100);}
  if(manufacturing>18&&company.manufacturing){company.manufacturing.readiness=clamp((company.manufacturing.readiness||50)-manufacturing*.006,0,100);company.manufacturing.supplyRisk=clamp((company.manufacturing.supplyRisk||35)+manufacturing*.008,0,100);}
  if(technical>18){company.integration=clamp((company.integration||0)-technical*.004,0,100);}
  if(mentoring>18)employees.filter(e=>e.active&&e.performanceManagement?.stage==="onboarding").forEach(e=>applyEmployeeEmotionDelta(e,{stressDelta:mentoring*.01,reasonCode:"mentoring-capacity-gap",sourceEventId:`capability-${company.day}`,ignoreCooldown:true}));
  if(support>18&&company.phase==="launched")company.customerSentiment=clamp((company.customerSentiment||company.trust||60)-support*.006,0,100);
  if(exec>18)company.board=clamp((company.board||50)-exec*.004,0,100);
}
function capabilityHiringSignalForDepartment(dept){
  ensureCompanyCapabilityModel();
  const candidate=(company.capabilityGaps||[]).filter(g=>g.department===dept).sort((a,b)=>b.gap-a.gap)[0];
  if(!candidate)return null;
  return {...candidate,score:clamp(candidate.gap*1.35,0,92),role:candidate.role||roleForCompanyCapability(candidate.capability)};
}
function updateCompanyCapabilitySystem(options={}){
  const force=!!options.force||!!options.createSupport;
  if(!force&&company.capabilitySystemUpdatedDay===company.day&&company.capabilityNeeds&&Object.keys(company.capabilityNeeds).length)return company.capabilityGaps||[];
  updateCompanyCapabilityNeeds();
  updateCompanyCapabilityCoverage();
  updateCompanyCapabilityConsequences(options);
  company.capabilityAudit={day:company.day,kept:Object.keys(DEFAULT_COMPANY_CAPABILITY_NEEDS).map(cap=>({capability:cap,reason:"company-wide capability tracked separately from project staffing"})),removed:[],revised:(company.capabilityGaps||[]).map(g=>({capability:g.capability,reason:`gap ${g.gap} with fulfillment options, not direct score repair`}))};
  company.capabilitySystemUpdatedDay=company.day;
  return company.capabilityGaps;
}
function updateStaffingModel(){
  ensureWorkforceEconomySystems();
  updateCompanyCapabilitySystem();
  const departments=["hardware","software","quality","product","finance","people"],phase=company.phase;
  const phaseDemand={prototype:0,integration:1,"customer trial":1,pilot:2,launched:3}[phase]||0;
  const groups=Object.fromEntries(departments.map(d=>[d,employees.filter(e=>e.active&&roleDepartment(e.role)===d)]));
  const active=activeProjects?.()||[];
  computeProjectCapacityState(active);
  const projectDemand=Object.fromEntries(departments.map(d=>[d,active.reduce((s,p)=>s+(Number(p.requiredHeadcount?.[d])||((p.requiredDepartments||[]).includes(d)?1:0))*1.2,0)]));
  for(const dept of departments){
    const items=(company.workItems||[]).filter(w=>w.status==="open"&&(w.assignedTeam===dept||(dept==="quality"&&["hardware","software"].includes(w.assignedTeam)&&w.type==="quality")));
    const backlog=items.length,blockedWork=items.filter(w=>(w.blockedBy||[]).length).length;
    const customerLoad=dept==="product"||dept==="finance"?Math.floor((company.customers||0)/80):0;
    const manufacturingDemand=dept==="hardware"||dept==="quality"?Math.round((company.manufacturing?.supplyRisk||0)/45):0;
    const deptCapacity=groups[dept].reduce((s,e)=>s+(e.workload?.projectCapacity??employeeProjectCapacity(e)),0);
    const deptLoad=groups[dept].reduce((s,e)=>s+(e.workload?.projectLoad||0),0);
    const deptOverload=groups[dept].reduce((s,e)=>s+(e.workload?.projectOverload||0),0);
    const capacityGap=Math.max(0,(projectDemand[dept]||0)-deptCapacity);
    const workload=Math.round((company.teams?.[dept]?.pressure||avgStress())+backlog*7+blockedWork*12+customerLoad*5+(projectDemand[dept]||0)*9+capacityGap*22+deptOverload*18);
    const base={hardware:1,software:2,quality:1,product:1,finance:1,people:0}[dept]||1;
    const minimumHealthy=clamp(base+Math.floor(phaseDemand/2)+Math.min(2,Math.floor(workload/70))+Math.min(2,customerLoad)+Math.min(2,manufacturingDemand)+Math.min(3,Math.floor(projectDemand[dept]||0)),dept==="people"?0:1,8);
    const managementCapacity=Math.max(1,employees.filter(e=>e.active&&(e.skills?.leadership||0)>55).length);
    const maximumUseful=minimumHealthy+managementCapacity+1;
    const current=groups[dept]?.length||0;
    const skillCoverage=clamp(current?groups[dept].reduce((s,e)=>s+(Math.max(...Object.values(e.skills||{general:40}))),0)/current:0,0,100);
    const activeProjectCount=active.filter(p=>(p.requiredDepartments||[]).includes(dept)||(Number(p.requiredHeadcount?.[dept])||0)>0).length;
    const capSignal=capabilityHiringSignalForDepartment(dept);
    company.staffingModel[dept]={current,minimumHealthy,maximumUseful,workload,backlog,blockedWork,customerLoad,phaseDemand,activeProjectCount,projectDemand:Number((projectDemand[dept]||0).toFixed(1)),projectCapacity:Number(deptCapacity.toFixed(1)),projectLoad:Number(deptLoad.toFixed(1)),projectOverload:Number(deptOverload.toFixed(1)),capacityGap:Number(capacityGap.toFixed(1)),skillCoverage,managementCapacity,capabilityGap:capSignal?capSignal.gap:0,capabilityNeed:capSignal?.capability||null,capabilityRole:capSignal?.role||null,understaffed:current<minimumHealthy||capacityGap>.35||deptOverload>.25||!!(capSignal&&capSignal.gap>28),overstaffed:current>maximumUseful&&deptOverload<.1&&!capSignal};
  }
}
function calculateLivingFinance(){
  ensureWorkforceEconomySystems();updateStaffingModel();
  const active=employees.filter(e=>e.active),payrollDaily=active.reduce((s,e)=>s+dailyEmploymentCost(e),0);
  const facilitiesDaily=(.010+active.length*.0025)*company.costEfficiency;
  const softwareAndLabCost=(.012+((company.chip+company.software)/200)*.015+(company.phase==="prototype" ? .010 : .022))*company.costEfficiency;
  const postLaunch=company.phase==="launched"||company.phase==="pilot";
  const qualityBurden=Math.max(0,62-(company.quality||50))*.0008;
  const manufacturingDaily=postLaunch?(.026+(company.manufacturing?.capacity||0)*.0011+(company.customers||0)*.00055+(company.market?.supplyPressure||0)*.00038+qualityBurden):.004;
  const supportDaily=postLaunch?(company.customers||0)*(.00048+Math.max(0,55-(company.trust||55))*.000006):0;
  const contractorDaily=Number(company.finance.contractorDaily)||0;
  const growthOverhead=Math.max(0,active.length-8)*.012+(company.customers||0)*.00018+(company.phase==="launched" ? .035 : 0);
  const debtOrFundingCost=Number(company.finance.debtOrFundingCost)||0;
  const crisisCost=company.crisis ? .006 : 0;
  const totalDailyCost=payrollDaily+facilitiesDaily+softwareAndLabCost+manufacturingDaily+supportDaily+contractorDaily+growthOverhead+debtOrFundingCost+crisisCost;
  const grossRevenueDaily=Number(company.dailyRevenue)||0,netCashFlowDaily=grossRevenueDaily-totalDailyCost;
  const runwayDays=netCashFlowDaily<0?Math.max(0,Math.floor(company.cash/Math.abs(netCashFlowDaily))):999;
  const cannotMeetPayroll=company.cash+grossRevenueDaily<payrollDaily;
  company.unpaidPayrollDays=cannotMeetPayroll?(Number(company.unpaidPayrollDays)||0)+1:0;
  company.finance={...company.finance,payrollDaily,facilitiesDaily,softwareAndLabCost,manufacturingDaily,supportDaily,contractorDaily,growthOverhead,debtOrFundingCost,crisisCost,totalDailyCost,grossRevenueDaily,netCashFlowDaily,runwayDays,unpaidPayrollDays:company.unpaidPayrollDays};
  return totalDailyCost;
}
const RISK_PILLAR_WEIGHTS={financial:.20,productDelivery:.20,customerMarket:.15,workforce:.15,operations:.10,governance:.10,strategic:.10};
const RISK_PILLAR_LABELS={financial:"Financial",productDelivery:"Product & Delivery",customerMarket:"Customer & Market",workforce:"Workforce",operations:"Operations",governance:"Governance",strategic:"Strategic"};
const DEPARTMENT_FRICTION_DEFAULTS={
  hardware:{technicalDebt:34,architectureComplexity:42,reviewBottleneck:36,undocumentedKnowledge:38,toolFrustration:32,knowledgeConcentration:40,integrationUncertainty:36},
  software:{technicalDebt:36,architectureComplexity:38,reviewBottleneck:34,undocumentedKnowledge:36,toolFrustration:33,knowledgeConcentration:37,integrationUncertainty:39},
  quality:{technicalDebt:28,architectureComplexity:30,reviewBottleneck:38,undocumentedKnowledge:34,toolFrustration:30,knowledgeConcentration:35,integrationUncertainty:42},
  product:{roadmapClarity:66,priorityConflict:34,scopeCreep:32,stakeholderAlignment:62,requirementQuality:64},
  finance:{forecastConfidence:68,recurringCostUncertainty:33,vendorPaymentPressure:28,accountingCleanup:26,capitalPlanningQuality:64},
  people:{managerQuality:62,promotionFairness:58,mentoringCapacity:58,hiringReputation:60,burnoutClusters:28,successionRisk:32},
  operations:{supplierReliability:62,maintenanceDebt:34,deliveryFragility:36,inventoryAccuracy:60,processDiscipline:62},
  customerSuccess:{renewalConfidence:64,unresolvedPromises:30,supportFatigue:32,accountRelationshipStrength:62,expansionQuality:58}
};
const FRICTION_POSITIVE_KEYS=new Set(["roadmapClarity","stakeholderAlignment","requirementQuality","forecastConfidence","capitalPlanningQuality","managerQuality","promotionFairness","mentoringCapacity","hiringReputation","supplierReliability","inventoryAccuracy","processDiscipline","renewalConfidence","accountRelationshipStrength","expansionQuality"]);
function riskPillarName(key){return RISK_PILLAR_LABELS[key]||String(key||"Risk").replace(/([A-Z])/g," $1").replace(/\b\w/g,c=>c.toUpperCase());}
function normalizeDepartmentFriction(existing={}){
  const out={};
  Object.entries(DEPARTMENT_FRICTION_DEFAULTS).forEach(([dept,defaults])=>{
    out[dept]={};
    Object.entries(defaults).forEach(([key,value])=>{out[dept][key]=clamp(Number(existing?.[dept]?.[key]??value),0,100);});
  });
  return out;
}
function frictionRiskValue(dept,key){
  const value=Number(company.departmentFriction?.[dept]?.[key]??DEPARTMENT_FRICTION_DEFAULTS[dept]?.[key]??50);
  return FRICTION_POSITIVE_KEYS.has(key)?100-value:value;
}
function frictionAverage(dept,keys){
  const source=company.departmentFriction?.[dept]||{};
  const list=(keys||Object.keys(source)).map(k=>frictionRiskValue(dept,k)).filter(Number.isFinite);
  return list.reduce((a,b)=>a+b,0)/Math.max(1,list.length);
}
function recordLocalFrictionResponse(dept,signal,action,amount=3){
  company.localFrictionResponses=Array.isArray(company.localFrictionResponses)?company.localFrictionResponses:[];
  company.localFrictionResponses.unshift({day:company.day,dept,signal,action,amount});
  company.localFrictionResponses=company.localFrictionResponses.slice(0,40);
}
function applyFrictionRelief(dept,key,amount){
  const friction=company.departmentFriction?.[dept];
  if(!friction||!Number.isFinite(friction[key]))return;
  friction[key]=clamp(friction[key]+(FRICTION_POSITIVE_KEYS.has(key)?amount:-amount),0,100);
}
function updateDepartmentFrictionDaily(){
  ensureWorkforceEconomySystems();
  if(company.lastFrictionUpdateDay===company.day)return;
  company.departmentFriction=normalizeDepartmentFriction(company.departmentFriction);
  const stress=avgStress(),culture=company.culture||{},staff=company.staffingModel||{},portfolio=company.portfolioHealth||{};
  const overload=Number(company.projectCapacity?.totalOverload)||0,scopePressure=(portfolio.concentrationRisk||0)*.35+(activeProjects?.().length||0)*3;
  Object.entries(company.departmentFriction).forEach(([dept,values])=>{
    const st=staff[dept]||{},team=company.teams?.[dept]||{};
    const pressure=(Number(st.workload)||Number(team.pressure)||stress)-50,blocked=Number(st.blockedWork)||0,gap=Number(st.capacityGap)||0;
    Object.keys(values).forEach(key=>{
      let drift=rand(-.38,.38)+pressure*.010+blocked*.08+gap*.18+overload*.05;
      if(["technicalDebt","reviewBottleneck","toolFrustration","maintenanceDebt","deliveryFragility","supportFatigue","burnoutClusters"].includes(key))drift+=stress>66?.18:stress<42?-.10:0;
      if(key==="scopeCreep"||key==="priorityConflict")drift+=scopePressure*.015-(culture.communication||50)*.003;
      if(key==="roadmapClarity"||key==="stakeholderAlignment"||key==="requirementQuality")drift+=(culture.communication||50)*.004-scopePressure*.014;
      if(key==="forecastConfidence"||key==="capitalPlanningQuality")drift+=(company.finance?.runwayDays||90)<80?-.22:.05;
      if(key==="supplierReliability")drift-=((company.market?.supplyPressure||40)-50)*.010;
      if(key==="renewalConfidence"||key==="accountRelationshipStrength")drift+=((company.customerSentiment||company.trust||60)-55)*.006;
      values[key]=clamp(values[key]+drift,0,100);
    });
  });
  const localTargets=[
    ["hardware","reviewBottleneck","Engineering scheduled a local technical review to reduce reviewer bottlenecks."],
    ["software","technicalDebt","Software carved out maintenance time for accumulated technical debt."],
    ["product","priorityConflict","Product held a planning review to clarify current priorities."],
    ["finance","forecastConfidence","Finance revised assumptions after forecast confidence weakened."],
    ["people","mentoringCapacity","People Operations adjusted mentoring coverage for onboarding pressure."],
    ["operations","deliveryFragility","Operations tightened delivery handoffs after fragility increased."],
    ["customerSuccess","unresolvedPromises","Customer Success followed up on unresolved customer promises."],
    ["quality","reviewBottleneck","Quality added a peer review checkpoint before defects could spread."]
  ];
  localTargets.forEach(([dept,key,action])=>{
    if(frictionRiskValue(dept,key)>66&&simulationRandom()<.34){
      applyFrictionRelief(dept,key,rand(2.2,5.2));
      recordLocalFrictionResponse(dept,key,action);
    }
  });
  maybeDetectDepartmentFriction();
  maybeCreateBackgroundEvent();
  company.lastFrictionUpdateDay=company.day;
}
function maybeDetectDepartmentFriction(){
  company.managerDetections=Array.isArray(company.managerDetections)?company.managerDetections:[];
  if(company.day-(company.lastManagerDetectionDay??-999)<3)return;
  if(simulationRandom()>.42)return;
  const communication=company.culture?.communication||55,learning=(company.lessons||[]).filter(l=>(l.confidence||0)>60).length;
  const candidates=Object.keys(company.departmentFriction||{}).map(dept=>{
    const keys=Object.keys(company.departmentFriction[dept]||{}),top=keys.map(key=>({key,risk:frictionRiskValue(dept,key)})).sort((a,b)=>b.risk-a.risk)[0];
    const probability=clamp(.18+(top?.risk||0)/180+communication/500+learning*.006-(company.staffingModel?.[dept]?.workload||50)/900,0,.85);
    return {dept,key:top?.key||"operating friction",risk:top?.risk||0,probability};
  }).filter(x=>x.risk>48).sort((a,b)=>b.risk-a.risk);
  const detected=candidates.find(x=>simulationRandom()<x.probability);
  if(!detected)return;
  const misdiagnosed=simulationRandom()>.74;
  const text=`${teamDisplayName(detected.dept)} ${misdiagnosed?"may be misreading":"detected"} a ${String(detected.key).replace(/([A-Z])/g," $1").toLowerCase()} pattern before it became a formal crisis.`;
  company.managerDetections.unshift({day:company.day,dept:detected.dept,signal:detected.key,risk:Math.round(detected.risk),probability:Number(detected.probability.toFixed(2)),misdiagnosed,text});
  company.managerDetections=company.managerDetections.slice(0,40);
  company.lastManagerDetectionDay=company.day;
}
function recentCeoDecisionPressure(days=7){
  const archived=(company.communications||[]).filter(m=>company.day-(m.day??company.day)<=days&&m.decision&&m.decision!=="No action required").length;
  return archived+(company.pendingEvent?1:0)+(company.escalationQueue||[]).length;
}
function canQueueExecutiveDecision(item=null){
  const protectedDirect=!!(item?.msg?.protectedDirect||item?.protectedDirect);
  if(protectedDirect)return true;
  const queue=(company.escalationQueue||[]).length;
  return queue<3&&recentCeoDecisionPressure(7)<5;
}
function makeBackgroundExecutiveEvent(event){
  const title=`${event.title} needs executive direction`;
  return {id:`background-risk-${event.id}`,category:"company",repeatable:true,title,copy:event.description,sourceBackgroundEventId:event.id,generatedCommunication:{type:"Executive Memo",priority:event.severity>=82?"Urgent":"Decision Needed",sender:{name:event.department==="finance"?"Finance Lead":"Operations Review",role:teamDisplayName(event.department)},subject:title,message:`${event.description} The affected team tried to handle this locally, but the next step now requires a trade-off across schedule, cash, reliability, or scope.`,impacts:event.recoveryPaths||["Delay work to reduce execution risk","Spend cash to protect reliability","Accept some risk and keep moving"],recs:[[teamDisplayName(event.department),"Contain the issue before it spreads",72],["Finance","Protect runway while responding",64],["Board","Show a clear recovery path",68]]},choices:[
    {title:"Authorize a focused recovery sprint",detail:"Give the affected team temporary priority to resolve the friction.",strategy:"quality",directive:"quality",days:4,effect:{quality:1,integration:.5},people:{stress:-1,morale:1}},
    {title:"Keep the current plan and monitor",detail:"Ask managers to handle the issue locally unless it worsens.",strategy:"steady",directive:"people",days:2,effect:{trust:.2},people:{stress:.5,morale:0}},
    {title:"Reduce scope around the affected work",detail:"Lower near-term delivery pressure at the cost of schedule ambition.",strategy:"scope",directive:"quality",days:5,effect:{integration:-.4,quality:1.2},people:{stress:-2,morale:.5}}
  ]};
}
function maybeCreateBackgroundEvent(){
  company.backgroundEvents=Array.isArray(company.backgroundEvents)?company.backgroundEvents:[];
  if(company.day<5||company.day-(company.lastBackgroundEventDay??-999)<2||simulationRandom()>.16)return;
  const candidates=[
    {department:"operations",title:"Supplier quote changed",description:"A supplier changed pricing assumptions on a small but useful component.",severity:clamp((company.market?.supplyPressure||35)+rand(-12,18),25,76),strategic:company.market?.supplyPressure>72,recoveryPaths:["Negotiate a smaller order","Accept a short delay","Use a higher-cost fallback supplier"]},
    {department:"product",title:"Customer requirement shifted",description:"A customer contact asked whether the next release can support a different workflow.",severity:clamp((company.customerSentiment||60)-15+rand(-8,22),25,78),strategic:activeProjects?.().length>2,recoveryPaths:["Clarify the requirement","Defer the request","Trade off a lower-value feature"]},
    {department:"hardware",title:"Undocumented dependency surfaced",description:"Engineering found a dependency that had been living in informal knowledge instead of the project plan.",severity:clamp(frictionAverage("hardware",["undocumentedKnowledge","knowledgeConcentration"])+rand(-10,18),28,82),strategic:false,recoveryPaths:["Document the dependency","Pair senior and junior staff","Delay the affected milestone"]},
    {department:"people",title:"Mentor load increased",description:"People Operations noticed experienced employees spending more time helping newer staff than planned.",severity:clamp(frictionAverage("people",["mentoringCapacity","burnoutClusters"])+rand(-8,18),25,80),strategic:false,recoveryPaths:["Rebalance mentoring","Slow onboarding expectations","Protect senior focus time"]},
    {department:"finance",title:"Budget assumption needs review",description:"Finance found that one recurring cost is less predictable than expected.",severity:clamp(frictionAverage("finance",["forecastConfidence","recurringCostUncertainty"])+rand(-10,20),28,82),strategic:(company.finance?.runwayDays||999)<80,recoveryPaths:["Revise the forecast","Delay discretionary spending","Ask the board for guidance"]}
  ];
  const event={...candidates[Math.floor(simulationRandom()*candidates.length)]};
  event.id=company.nextBackgroundEventId=Math.max(1,Number(company.nextBackgroundEventId)||1);
  company.nextBackgroundEventId+=1;
  event.day=company.day;
  event.status=event.strategic&&event.severity>=72&&canQueueExecutiveDecision(event)?"queued-for-ceo":"handled-locally";
  company.backgroundEvents.unshift(event);
  company.backgroundEvents=company.backgroundEvents.slice(0,60);
  company.lastBackgroundEventDay=company.day;
  if(event.status==="queued-for-ceo")company.escalationQueue.push(makeBackgroundExecutiveEvent(event));
  else recordLocalFrictionResponse(event.department,"background-event",`${teamDisplayName(event.department)} handled locally: ${event.title}.`,2);
}
function riskOverallLabel(pillars,total){
  const values=Object.values(pillars),high=values.filter(v=>v>=70).length,critical=values.filter(v=>v>=85).length,elevated=values.filter(v=>v>=45).length;
  const existential=(company.unpaidPayrollDays||0)>0||company.cash<=0||company.failureType==="company-failure";
  if(existential||high>=3||critical>=2||(critical>=1&&elevated>=3))return "Critical";
  if(total>=68||high>=2)return "High";
  if(total>=45||high>=1||elevated>=3)return "Elevated";
  if(total>=25||elevated>=1)return "Watch";
  return "Low";
}
function updateCompanyRiskComponents(){
  ensureWorkforceEconomySystems();
  company.riskPillars=company.riskPillars&&typeof company.riskPillars==="object"?company.riskPillars:{};
  company.departmentFriction=normalizeDepartmentFriction(company.departmentFriction);
  const f=company.finance||{},s=company.staffingModel||{},active=employees.filter(e=>e.active),projects=activeProjects?.()||[];
  const below=Object.values(s).filter(x=>x.understaffed).length,above=Object.values(s).filter(x=>x.overstaffed).length,blocked=Object.values(s).reduce((a,x)=>a+(x.blockedWork||0),0);
  const portfolio=company.portfolioHealth||{},market=company.market||{},manufacturing=company.manufacturing||{},segments=company.customerSegments||{};
  const segmentChurn=Object.values(segments).reduce((a,seg)=>a+Math.max(0,Number(seg.churnRisk)||0),0)/Math.max(1,Object.keys(segments).length);
  const projectHealth=projects.length?projects.reduce((s,p)=>s+(Number(p.performance?.executionHealth)||Number(p.performance?.overallHealth)||Number(p.health)||65),0)/projects.length:72;
  const slippage=projects.reduce((m,p)=>Math.max(m,Math.max(0,Number(p.performance?.scheduleVariance)||0)),0);
  const financial=clamp((f.runwayDays<30?75:f.runwayDays<60?52:f.runwayDays<120?28:12)+(f.netCashFlowDaily<0?Math.min(30,Math.abs(f.netCashFlowDaily)*145):0)+(company.unpaidPayrollDays||0)*45+(company.shareholders?.pressure||0)*.12,0,100);
  const productDelivery=clamp((100-projectHealth)*.42+slippage*.25+blocked*7+(100-(company.quality||70))*.22+(100-(company.integration||70))*.16+frictionAverage("hardware",["reviewBottleneck","integrationUncertainty"])*.12+frictionAverage("software",["technicalDebt","integrationUncertainty"])*.10,0,100);
  const customerMarket=clamp((100-(company.customerSentiment||company.trust||60))*.36+(100-(company.trust||60))*.20+(market.competitorHeat||45)*.16+Math.max(0,50-(market.aiDemand||50))*.18+segmentChurn*.20+frictionAverage("customerSuccess")*.16,0,100);
  const workforce=clamp(avgStress()*.35+active.filter(e=>(e.retentionRisk||0)>60||e.retention?.searching).length*9+below*10+(company.organizationalMomentum?.turnover||0)*.25+frictionAverage("people")*.22+Math.max(0,active.length-10)*2,0,100);
  const operations=clamp((100-(manufacturing.readiness||60))*.20+(manufacturing.supplyRisk||0)*.28+(100-(manufacturing.yield||60))*.16+blocked*4+frictionAverage("operations")*.34,0,100);
  const governance=clamp((100-(company.board||70))*.36+(company.boardGovernance?.strikes||0)*18+(company.shareholders?.pressure||0)*.22+(100-(company.leadership?.transparency||55))*.10+(company.boardGovernance?.pipActive?22:0),0,100);
  const strategic=clamp((portfolio.concentrationRisk||0)*.42+(projects.length>3?18:projects.length===0?12:0)+(100-(company.culture?.innovation||55))*.12+Math.max(0,60-(market.aiDemand||55))*.10+above*4+frictionAverage("product",["roadmapClarity","priorityConflict","scopeCreep","stakeholderAlignment"])*.30,0,100);
  const pillars={financial,productDelivery,customerMarket,workforce,operations,governance,strategic};
  const total=Object.entries(RISK_PILLAR_WEIGHTS).reduce((sum,[key,weight])=>sum+(pillars[key]||0)*weight,0);
  const label=riskOverallLabel(pillars,total);
  const topContributors=Object.entries(pillars).map(([key,value])=>({key,label:riskPillarName(key),value:Math.round(value),band:value>=85?"Critical":value>=70?"High":value>=45?"Elevated":value>=25?"Watch":"Low"})).sort((a,b)=>b.value-a.value).slice(0,3);
  company.riskPillars=pillars;
  company.companyRiskComponents={financial,people:workforce,product:productDelivery,customer:customerMarket,operational:operations,leadership:governance,staffing:clamp(below*18+above*8+(8-active.length)*5,0,100),productDelivery,customerMarket,workforce,operations,governance,strategic,total,label,topContributors,narrative:`${topContributors[0]?.label||"Company"} is the main contributor to ${label.toLowerCase()} company risk.`};
  if(Array.isArray(company.executiveObservations)){
    company.executiveObservations=company.executiveObservations.map(o=>o?.type==="risk"&&o.day===company.day?{...o,severity:topContributors.find(t=>t.key===o.pillar)?.value??o.severity}:o);
  }
  company.lastRiskPillarUpdateDay=company.day;
}
function activeProjectListForAllocation(){
  if(typeof activeProjects==="function")return activeProjects();
  return (company.projects||[]).filter(p=>!["completed","canceled","rejected","merged"].includes(p.status));
}
function employeeAvailableProjectFte(e){
  if(!e||!e.active)return 0;
  return typeof employeeProjectCapacity==="function"?employeeProjectCapacity(e):clamp(onboardingProductivity(e),.15,1);
}
function roleForProjectGap(dept){
  return typeof roleForDepartmentHire==="function"?roleForDepartmentHire(dept):teamDisplayName(dept)+" Specialist";
}
function blockerDetectionProbability(work,dept){
  const team=company.teams?.[dept]||{};
  const members=employees.filter(e=>e.active&&roleDepartment(e.role)===dept);
  const management=members.reduce((sum,e)=>sum+(e.skills?.leadership||45)+(e.skills?.communication||45),0)/Math.max(1,members.length*2);
  const expertise=members.reduce((sum,e)=>sum+(e.skills?.verification||e.skills?.software||e.skills?.hardware||e.skills?.product||e.skills?.finance||45),0)/Math.max(1,members.length);
  const age=Math.max(0,(company.day||0)-(work.createdDay??company.day));
  const severity=clamp((work.qualityRisk||40)*.45+(work.priority||50)*.30+age*3,0,100);
  const communication=company.culture?.communication??50;
  const lesson=company.lessons?.find?.(l=>/blocker|communication|collaboration|quality/i.test(String(l.key||l.title||"")))||{};
  const lessonBoost=clamp((lesson.confidence||0)*.0015+(lesson.strength||lesson.score||0)*.01,0,.12);
  const workloadPenalty=Math.max(0,(team.pressure||50)-60)*.003+Math.max(0,avgStress()-68)*.002;
  return clamp(.10+management*.003+expertise*.002+severity*.003+communication*.002+lessonBoost-workloadPenalty,.05,.92);
}
function blockerAwarenessForWorkItem(work,{update=false}={}){
  const actual=(work.blockedBy||[]).length;
  const dept=work.assignedTeam||"company";
  const probability=blockerDetectionProbability(work,dept);
  const existingAwareness=work.blockerAwareness&&typeof work.blockerAwareness==="object"?work.blockerAwareness:null;
  if(actual<=0){
    if(existingAwareness&&Object.keys(existingAwareness).length){
      work.blockerAwareness=existingAwareness;
      work.blockerAwareness.observed=0;
      work.blockerAwareness.lastActualCount=0;
      work.blockerAwareness.detectionProbability=Number(probability.toFixed(2));
    }
    return {actual:0,observed:0,unreported:0,detectionProbability:probability};
  }
  work.blockerAwareness=existingAwareness||{};
  let observed=clamp(Number(work.blockerAwareness.observed)||0,0,actual);
  if(update&&observed<actual&&simulationRandom()<probability){
    observed=actual;
    work.blockerAwareness.lastObservedDay=company.day;
    work.blockerAwareness.observedBy="management";
  }
  work.blockerAwareness.observed=observed;
  work.blockerAwareness.lastActualCount=actual;
  work.blockerAwareness.detectionProbability=Number(probability.toFixed(2));
  return {actual,observed,unreported:Math.max(0,actual-observed),detectionProbability:probability};
}
function buildWorkforceAllocationSnapshot(options={}){
  ensureWorkforceEconomySystems?.();
  ensureProjectPortfolio?.();
  rebuildRuntimeIndexes?.();
  ensureProjectAllocations?.();
  const generatedDay=company.day||0,projects=activeProjectListForAllocation();
  const departments={};
  DEPARTMENTS.forEach(dept=>{
    const members=employees.filter(e=>e.active&&roleDepartment(e.role)===dept);
    departments[dept]={activeHeadcount:members.length,availableFte:Number(members.reduce((s,e)=>s+employeeAvailableProjectFte(e),0).toFixed(2)),departmentCoverage:100,departmentCapacityGap:0,projectRequiredFte:0,projectAllocatedFte:0,projectCoverage:100,missingProjectFte:0,missingAssignments:0,criticalRoleGaps:[],overloadedAssignments:0,actualBlockedWork:0,observedBlockedWork:0,unreportedBlockedWork:0,affectedProjectIds:[]};
  });
  const snapshot={generatedDay,departments,projects:{},totals:{missingProjectFte:0,missingAssignments:0,criticalRoleGaps:0,actualBlockedWork:0,observedBlockedWork:0,unreportedBlockedWork:0,overloadedAssignments:0}};
  projects.forEach(project=>{
    const requiredEntries=Object.entries(project.requiredHeadcount||{}).filter(([,n])=>Number(n)>0);
    const actualItems=(company.workItems||[]).filter(w=>w.status==="open"&&w.projectId===project.id);
    const awareness=actualItems.map(w=>blockerAwarenessForWorkItem(w,{update:!!options.updateAwareness}));
    const projectActual=awareness.reduce((s,a)=>s+a.actual,0),projectObserved=awareness.reduce((s,a)=>s+a.observed,0),projectUnreported=awareness.reduce((s,a)=>s+a.unreported,0);
    const projectRow={id:project.id,title:project.title,requiredFte:0,allocatedFte:0,qualifiedAllocatedFte:0,coverage:100,missingFte:0,missingAssignments:0,missingRoles:[],overloadedAssignments:0,actualBlockers:projectActual,observedBlockers:projectObserved,unreportedBlockers:projectUnreported,affectedDepartments:[],detectionProbability:awareness.length?Number((awareness.reduce((s,a)=>s+a.detectionProbability,0)/awareness.length).toFixed(2)):0};
    requiredEntries.forEach(([dept,needRaw])=>{
      const need=Number(needRaw)||0;
      const allocated=typeof projectAllocatedFte==="function"?projectAllocatedFte(project,dept):0;
      const qualified=typeof projectQualifiedAllocatedFte==="function"?projectQualifiedAllocatedFte(project,dept):allocated;
      const missingFte=Number(Math.max(0,need-qualified).toFixed(2));
      const missingAssignments=missingFte>.05?Math.ceil(missingFte):0;
      const role=roleForProjectGap(dept);
      const d=snapshot.departments[dept]||(snapshot.departments[dept]={activeHeadcount:0,availableFte:0,departmentCoverage:100,departmentCapacityGap:0,projectRequiredFte:0,projectAllocatedFte:0,projectCoverage:100,missingProjectFte:0,missingAssignments:0,criticalRoleGaps:[],overloadedAssignments:0,actualBlockedWork:0,observedBlockedWork:0,unreportedBlockedWork:0,affectedProjectIds:[]});
      d.projectRequiredFte=Number((d.projectRequiredFte+need).toFixed(2));
      d.projectAllocatedFte=Number((d.projectAllocatedFte+qualified).toFixed(2));
      projectRow.requiredFte=Number((projectRow.requiredFte+need).toFixed(2));
      projectRow.allocatedFte=Number((projectRow.allocatedFte+allocated).toFixed(2));
      projectRow.qualifiedAllocatedFte=Number((projectRow.qualifiedAllocatedFte+qualified).toFixed(2));
      if(missingAssignments>0){
        const status=coverageStatusForProjectGap(project,dept,role);
        const gap={projectId:project.id,projectTitle:project.title,dept,role,required:need,allocated:Number(allocated.toFixed(2)),qualifiedAllocated:Number(qualified.toFixed(2)),missingFte,missingAssignments,status};
        projectRow.missingRoles.push(gap);
        projectRow.missingFte=Number((projectRow.missingFte+missingFte).toFixed(2));
        projectRow.missingAssignments+=missingAssignments;
        projectRow.affectedDepartments.push(dept);
        d.missingProjectFte=Number((d.missingProjectFte+missingFte).toFixed(2));
        d.missingAssignments+=missingAssignments;
        d.criticalRoleGaps.push(gap);
        if(!d.affectedProjectIds.includes(project.id))d.affectedProjectIds.push(project.id);
        snapshot.totals.missingProjectFte=Number((snapshot.totals.missingProjectFte+missingFte).toFixed(2));
        snapshot.totals.missingAssignments+=missingAssignments;
        snapshot.totals.criticalRoleGaps+=missingAssignments;
      }
    });
    const overload=typeof projectOverloadPressure==="function"?projectOverloadPressure(project):0;
    projectRow.overloadedAssignments=Math.round(Math.max(0,overload)/25);
    projectRow.coverage=projectRow.requiredFte>0?Math.round(clamp(projectRow.qualifiedAllocatedFte/projectRow.requiredFte*100,0,100)):100;
    projectRow.affectedDepartments=[...new Set(projectRow.affectedDepartments)];
    snapshot.projects[project.id]=projectRow;
    snapshot.totals.actualBlockedWork+=projectActual;
    snapshot.totals.observedBlockedWork+=projectObserved;
    snapshot.totals.unreportedBlockedWork+=projectUnreported;
    snapshot.totals.overloadedAssignments+=projectRow.overloadedAssignments;
    projectRow.affectedDepartments.forEach(dept=>{const d=snapshot.departments[dept];if(d)d.overloadedAssignments+=projectRow.overloadedAssignments;});
  });
  (company.workItems||[]).filter(w=>w.status==="open").forEach(w=>{
    const dept=w.assignedTeam||"company",d=snapshot.departments[dept];if(!d)return;
    const a=blockerAwarenessForWorkItem(w,{update:!!options.updateAwareness});
    d.actualBlockedWork+=a.actual;d.observedBlockedWork+=a.observed;d.unreportedBlockedWork+=a.unreported;
  });
  Object.values(snapshot.departments).forEach(d=>{
    d.departmentCoverage=d.activeHeadcount>0?Math.round(clamp(d.availableFte/Math.max(.1,d.activeHeadcount)*100,0,100)):0;
    d.departmentCapacityGap=Number(Math.max(0,d.projectRequiredFte-d.availableFte).toFixed(2));
    d.projectCoverage=d.projectRequiredFte>0?Math.round(clamp(d.projectAllocatedFte/d.projectRequiredFte*100,0,100)):100;
  });
  company.workforceAllocationSnapshot=snapshot;
  return snapshot;
}
function coverageStatusForProjectGap(project,dept,role){
  const recruiting=(company.recruitingPipeline||[]).find(r=>r.department===dept&&r.role===role&&["requisition","searching","interviewing","offer","exception","paused-policy"].includes(r.status));
  const queued=(company.escalationQueue||[]).some(ev=>String(ev.id||"").includes("hiring-request")&&(String(ev.id||"").includes(dept)||String(ev.title||"").includes(role)))||String(company.pendingEvent?.id||"").includes(`hiring-request-${dept}`);
  const review=(company.hiringRequests||[]).find(r=>r.department===dept&&r.role===role&&company.day-(r.day||0)<35);
  if(recruiting)return `recruiting: ${recruiting.status}`;
  if(queued)return "CEO memo queued";
  if(review?.status==="suppressed-policy")return "suppressed by policy";
  if(review?.status==="delayed")return "delayed by CEO";
  if(review?.status==="rejected")return "rejected by CEO";
  return "uncovered";
}
function projectStaffingDetails(){
  const snapshot=buildWorkforceAllocationSnapshot();
  const rows=[];
  Object.values(snapshot.projects||{}).forEach(projectRow=>{
    (projectRow.missingRoles||[]).forEach(gap=>{
      const project=(company.projects||[]).find(p=>p.id===gap.projectId);
      if(project)rows.push({project,dept:gap.dept,required:gap.required,allocated:gap.qualifiedAllocated,missingFte:gap.missingFte,missing:gap.missingAssignments,role:gap.role,status:gap.status,reason:`${project.codename} ${teamDisplayName(gap.dept)} milestone`});
    });
  });
  return rows;
}
function isCriticalHiringNeed(dept,st={},role=roleForHiringNeed(dept)){
  ensureWorkforceEconomySystems();
  const hist=company.hiringNeedHistory?.[dept]||{};
  const vacancy=(company.openRoles||[]).includes(role);
  const severe=(hist.lastScore||0)>=92||(st.blockedWork||0)>=2||(st.workload||0)>=90||(st.skillCoverage||100)<45;
  const succession=employees.some(e=>e.active&&roleDepartment(e.role)===dept&&(e.retirementReadiness||e.careerLifecycle?.retirementReadiness||0)>60);
  const compliance=dept==="quality"&&company.phase==="launched"&&(company.quality||100)<58;
  const safety=dept==="hardware"&&((company.manufacturing?.supplyRisk||0)>80||(company.quality||100)<55);
  return !!(vacancy||severe||succession||compliance||safety);
}
function hiringPolicyAllows(dept,st={},role=roleForHiringNeed(dept)){
  ensureWorkforceEconomySystems();
  const mode=company.hiringPolicy?.mode||"normal";
  const critical=isCriticalHiringNeed(dept,st,role);
  if(mode==="normal")return {allowed:true,critical,reason:"normal hiring policy"};
  if(mode==="critical-only")return {allowed:critical,critical,reason:critical?"critical role exception":"suppressed by critical-roles-only policy"};
  if(mode==="frozen")return {allowed:critical,critical,reason:critical?"critical exception under hiring freeze":"suppressed by hiring freeze"};
  return {allowed:true,critical:false,reason:"normal hiring policy"};
}
function recordSuppressedHiringNeed(dept,role,reason,score=0,confidence=0){
  ensureWorkforceEconomySystems();
  const recent=(company.hiringRequests||[]).some(r=>r.department===dept&&r.role===role&&r.status==="suppressed-policy"&&company.day-(r.day||0)<10);
  if(recent)return;
  company.hiringPolicy.suppressed=(company.hiringPolicy.suppressed||0)+1;
  company.hiringRequests.unshift({day:company.day,department:dept,role,status:"suppressed-policy",score,confidence,policyMode:company.hiringPolicy.mode,reason});
  company.hiringRequestHistory.unshift({day:company.day,role,department:dept,status:"suppressed-policy",reason,confidence});
  recordHistory(`${teamDisplayName(dept)} hiring need for ${role} was ${reason}.`,"people",2);
}
function applyHiringPolicyToRecruiting(){
  ensureWorkforceEconomySystems();updateStaffingModel();
  (company.recruitingPipeline||[]).forEach(item=>{
    if(!["requisition","searching","interviewing","offer","paused-policy"].includes(item.status))return;
    const st=company.staffingModel?.[item.department]||{};
    const allowed=hiringPolicyAllows(item.department,st,item.role);
    if(["requisition","searching","interviewing","offer"].includes(item.status)&&!allowed.allowed){
      item.prePauseStatus=item.status;
      item.status="paused-policy";item.pausedByPolicyDay=company.day;item.policyReason=allowed.reason;
      company.hiringRequestHistory.unshift({day:company.day,role:item.role,department:item.department,status:"paused-policy",reason:allowed.reason});
      recordHistory(`Recruiting for ${item.role} paused: ${allowed.reason}.`,"people",3);
    }else if(item.status==="paused-policy"&&allowed.allowed){
      const pausedDays=Math.max(0,company.day-(item.pausedByPolicyDay||company.day));
      item.status=item.prePauseStatus||"searching";item.stage=item.status;item.dueDay=Math.max(company.day+3,(item.dueDay||company.day)+pausedDays);item.policyReason=null;
      company.hiringRequestHistory.unshift({day:company.day,role:item.role,department:item.department,status:"resumed-policy",reason:allowed.reason});
      recordHistory(`Recruiting for ${item.role} resumed under the current hiring policy.`,"people",3);
    }
  });
}
function hiringPolicyLabel(){
  const mode=company.hiringPolicy?.mode||"normal";
  return mode==="frozen"?"Frozen":mode==="critical-only"?"Critical roles only":"Normal";
}
function makeHiringPolicyReviewEvent(reason="CEO requested review"){
  ensureWorkforceEconomySystems();updateStaffingModel();
  const needs=hiringPipelineRows();
  const activeRecruiting=(company.recruitingPipeline||[]).filter(r=>r.status==="searching").length;
  const paused=(company.recruitingPipeline||[]).filter(r=>r.status==="paused-policy").length;
  const severeNeeds=Object.entries(company.staffingModel||{}).filter(([dept,st])=>hiringPolicyAllows(dept,st,roleForHiringNeed(dept)).critical).length;
  const runway=company.finance?.runwayDays||999;
  const runwayText=runway>=999?"positive":`${runway} ${runway===1?"day":"days"}`;
  const message=`People and Finance are asking you to set the hiring rule, not approve a specific candidate. Current policy is ${hiringPolicyLabel()}. Runway is ${runwayText}. There are ${needs.length} staffing item${needs.length===1?"":"s"} being watched, ${activeRecruiting} active search${activeRecruiting===1?"":"es"}, ${paused} paused search${paused===1?"":"es"}, and ${severeNeeds} critical pressure area${severeNeeds===1?"":"s"}. Reason for review: ${reason}.`;
  return {id:`hiring-policy-review-${company.day}-${Math.floor(simulationRandom()*9999)}`,repeatable:false,category:"people",title:"Hiring Policy Review",copy:message,hiringPolicyReview:true,generatedCommunication:{type:"Hiring Policy Review",priority:"Decision Needed",sender:{name:"People and Finance Review",role:"Operating Council"},subject:"Hiring Policy Review",message,recs:[["Finance",runway<90?"Pause ordinary headcount growth until runway improves":"Keep hiring tied to evidence instead of using a blanket freeze",runway<90?82:64],["People",paused>0?"Resolve paused roles before morale and delivery suffer":"Let HR execute approved roles without asking the CEO about every candidate",72],["Departments",severeNeeds>0?"Keep critical bottleneck roles eligible even if growth hiring is restricted":"Current staffing pressure can be handled under normal review",severeNeeds>0?78:58]],impacts:["This sets the company-wide rule for future hiring requests","It does not approve or reject a specific candidate","Unmet staffing needs remain visible and still affect workload","Active recruiting may continue, pause, or resume depending on policy"]},choices:[
    {title:"Freeze new headcount",detail:"Stop ordinary new roles and pause non-critical recruiting. Safety, compliance, vacancy, and severe bottleneck exceptions can still reach the CEO.",effect:{cash:.08,board:2,trust:-.5},directive:"cuts",days:30,people:{stress:2,morale:-2},hiringPolicy:{mode:"frozen",reviewDays:30,reason:"CEO froze new headcount after policy review"},opinion:{support:-1,fairness:-1,trust:-1},strategy:"finance",benefits:["protects runway","slows payroll growth","signals cash discipline"],risks:["unmet staffing needs keep building","project delays may worsen","retention risk can rise"],uncertainty:"Material",estimatedConfidence:runway<90?76:52},
    {title:"Allow only critical roles",detail:"Permit vacancy, succession, safety, compliance, and severe bottleneck roles while suppressing optional growth hiring.",effect:{board:1,trust:.2},directive:"quality",days:45,people:{stress:1,morale:0},hiringPolicy:{mode:"critical-only",reviewDays:45,reason:"CEO restricted hiring to critical roles"},opinion:{fairness:1},strategy:"balanced",benefits:["protects essential capacity","keeps payroll disciplined","reduces unnecessary interruptions"],risks:["optional growth work slows","departments may remain stretched"],uncertainty:"Moderate",estimatedConfidence:68},
    {title:"Keep normal hiring review",detail:"Keep evidence-based hiring active. Departments can request positions, and HR executes approved searches without CEO candidate review.",effect:{board:runway<75?-1:1,trust:1},directive:"people",days:45,people:{stress:-1,morale:2},hiringPolicy:{mode:"normal",reviewDays:60,reason:"CEO continued evidence-based hiring"},opinion:{support:1,trust:1},strategy:"people",benefits:["supports project execution","helps retention","keeps hiring pipeline moving"],risks:["payroll grows after hires join","runway may tighten"],uncertainty:"Material",estimatedConfidence:runway>90?72:49}
  ]};
}
function requestHiringPolicyReview(){
  ensureWorkforceEconomySystems();
  queueImmediateExecutiveMemo(makeHiringPolicyReviewEvent("CEO requested review"));
  renderDecisionEvent();render();
}
function hiringPipelineRows(){
  ensureWorkforceEconomySystems();updateStaffingModel();
  const rows=[];
  const pendingTexts=(company.escalationQueue||[]).map(ev=>String(ev.id||"")+" "+String(ev.title||""));
  if(company.pendingEvent)pendingTexts.push(String(company.pendingEvent.id||"")+" "+String(company.pendingEvent.title||""));
  const hasPendingMemo=(dept,role)=>pendingTexts.some(t=>t.includes("hiring-request")&&(t.includes(dept)||t.includes(role)));
  for(const [dept,st] of Object.entries(company.staffingModel||{})){
    const shortage=Math.max(0,(st.minimumHealthy||0)-(st.current||0));
    const hist=company.hiringNeedHistory?.[dept]||{};
    if(shortage>0||hist.lastScore>=60){
      const role=roleForHiringNeed(dept);
      const recent=(company.hiringRequests||[]).filter(r=>r.department===dept&&company.day-(r.day||0)<35).sort((a,b)=>(b.day||0)-(a.day||0))[0];
      const recruiting=(company.recruitingPipeline||[]).find(r=>r.department===dept&&["requisition","searching","interviewing","offer","exception","paused-policy"].includes(r.status));
      let status="Need Identified";
      if(hasPendingMemo(dept,role)||recent?.status==="queued")status="Memo Queued for CEO";
      else if(hist.lastScore>=85)status="Preparing CEO Memo";
      else if(hist.lastScore>=75)status="Finance/HR Review";
      else if(hist.lastScore>=60)status="Department Review";
      if(recent?.status==="delayed")status="Delayed by CEO";
      if(recent?.status==="rejected")status="Rejected and Reprioritizing";
      if(recent?.status==="suppressed-policy")status="Suppressed by Hiring Policy";
      if(recruiting){
        const elapsed=company.day-(recruiting.searchStartedDay||recruiting.day||company.day);
        status=recruiting.status==="paused-policy"?"Paused by Hiring Policy":recruiting.status==="exception"?"Exception Memo":recruiting.status==="requisition"?"Requisition Opened":recruiting.status==="interviewing"?"Interviewing":recruiting.status==="offer"?"Offer Outstanding":"Candidate Search";
      }
      const signalCount=shortage>0?shortage:1;
      const labelRole=shortage>0?role:"capacity signal";
      const narrative=hiringNeedNarrative(dept,st,role);
      const fillDays=Number(recruiting?.expectedFillDays)||0;
      rows.push({dept,role:labelRole,count:signalCount,status,reason:recruiting?`${recruiting.project?.title||"department need"}; expected fill ${fillDays||"?"} ${fillDays===1?"day":"days"}; target day ${recruiting.dueDay}`:narrative.reason,evidence:recruiting?[`Market condition: ${recruiting.market||"average"}`,`Target fill day ${recruiting.dueDay}`]:narrative.evidence,confidence:Math.round(hist.confidence||0),actualRole:role});
    }
  }
  (company.openRoles||[]).forEach(role=>{
    const dept=roleDepartment(role);
    if(!rows.some(r=>r.role===role&&["Memo Queued for CEO","Recruiting"].includes(r.status)))rows.push({dept,role,count:1,status:"Replacement Needed",reason:"vacancy/backfill after departure",confidence:70});
  });
  (company.recruitingPipeline||[]).filter(r=>["requisition","searching","interviewing","offer","exception","paused-policy"].includes(r.status)).forEach(r=>{
    const status=r.status==="paused-policy"?"Paused by Hiring Policy":r.status==="exception"?"Exception Memo":r.status==="requisition"?"Requisition Opened":r.status==="interviewing"?"Interviewing":r.status==="offer"?"Offer Outstanding":"Candidate Search";
    if(!rows.some(row=>row.role===r.role&&["Requisition Opened","Candidate Search","Interviewing","Offer Outstanding","Exception Memo","Paused by Hiring Policy"].includes(row.status))){const fillDays=Number(r.expectedFillDays)||0;rows.push({dept:r.department,role:r.role,count:1,status,reason:r.status==="paused-policy"?(r.policyReason||"suppressed by hiring policy"):`HR is actively recruiting for ${articleFor(r.role)} ${r.role}.`,evidence:r.status==="paused-policy"?[r.policyReason||"Suppressed by hiring policy"]:[`${r.project?.title||r.market||"average market"}`,`expected fill ${fillDays||"?"} ${fillDays===1?"day":"days"}`, `target day ${r.dueDay}`],confidence:70});}
  });
  employees.filter(e=>e.active&&e.performanceManagement?.stage==="onboarding"&&company.day-(e.joinedDay||0)<(e.onboarding?.duration||21)).forEach(e=>{
    rows.push({dept:roleDepartment(e.role),role:e.role,count:1,status:"Onboarding",reason:`${e.name} is ramping into the role.`,evidence:[`joined on day ${e.joinedDay}`,`productivity ${e.onboarding?.productivity||Math.round(onboardingProductivity(e)*100)}%`,`mentor ${employees.find(m=>m.id===e.onboarding?.mentorId)?.name||"none"}`],confidence:80});
  });
  employees.filter(e=>{
    if(!e.active||e.performanceManagement?.stage==="onboarding")return false;
    const recent=company.day-(e.joinedDay||0)<=45;
    const hired=(e.careerHistory||[]).some(h=>/Hired as|Selected by HR|Completed onboarding/i.test(String(h)));
    return recent&&hired;
  }).forEach(e=>{
    rows.push({dept:roleDepartment(e.role),role:e.role,count:1,status:"Onboarding Complete",reason:`${e.name} is now active as ${articleFor(e.role)} ${e.role}.`,evidence:[`joined on day ${e.joinedDay}`,`completed onboarding${e.onboarding?.duration?` after about ${e.onboarding.duration} days`:""}`,`current productivity ${Math.round(onboardingProductivity(e)*100)}%`],confidence:82});
  });
  return rows;
}
function hiringPipelineHtml(){
  const rows=hiringPipelineRows();
  if(!rows.length)return `<br><br><strong>Hiring Pipeline</strong><br><small>No active staffing requests. Departments may still be monitoring early signals.</small>`;
  const visible=rows.slice(0,8),extra=rows.slice(8);
  const card=r=>`<div class="briefing-card"><strong>${teamDisplayName(r.dept)} +${r.count} ${r.role}</strong><small>Status: ${r.status}<br>Situation: ${r.reason}${(r.evidence||[]).length?`<br>Evidence: ${(r.evidence||[]).slice(0,3).join("; ")}`:""}<br>Review confidence: ${qualitativeBand(r.confidence,{low:45,high:75,lowText:"early",midText:"credible",highText:"strong"})}</small></div>`;
  const cards=visible.map(card).join("");
  const more=extra.length?`<details class="pipeline-more"><summary>${extra.length} more staffing item(s)</summary><div class="briefing-grid" style="margin-top:8px">${extra.map(card).join("")}</div></details>`:"";
  return `<br><br><strong>Hiring Pipeline</strong><div class="briefing-grid" style="margin-top:8px">${cards}</div>${more}`;
}
function staffingShortageSummary(){
  ensureWorkforceEconomySystems();updateStaffingModel();
  const snapshot=buildWorkforceAllocationSnapshot();
  const rows=Object.entries(company.staffingModel||{}).map(([dept,st])=>{
    const alloc=snapshot.departments?.[dept]||{};
    const deptMissing=Math.max(0,Math.ceil((st.minimumHealthy||0)-(st.current||0)));
    const projectMissing=Number(alloc.missingAssignments)||0;
    const missing=deptMissing+projectMissing;
    const critical=(alloc.criticalRoleGaps||[]).length>0||(st.blockedWork||0)>=2||(st.workload||0)>=90||(st.skillCoverage||100)<45||projectMissing>=2;
    return {dept,missing,deptMissing,projectMissing,critical,monitoring:st.understaffed&&missing===0,workload:st.workload||0,projectCoverage:alloc.projectCoverage??100,departmentCoverage:alloc.departmentCoverage??100};
  });
  const critical=rows.filter(r=>r.missing>0&&r.critical).map(r=>`${teamDisplayName(r.dept)} +${r.missing} (${r.projectMissing} project, ${r.deptMissing} department)`);
  const moderate=rows.filter(r=>r.missing>0&&!r.critical).map(r=>`${teamDisplayName(r.dept)} +${r.missing}`);
  const monitoring=rows.filter(r=>r.monitoring).map(r=>teamDisplayName(r.dept));
  return `Department coverage and project allocation are tracked separately. ${critical.length?`Critical shortages: ${critical.join(", ")}`:"Critical shortages: none"} | ${moderate.length?`Moderate shortages: ${moderate.join(", ")}`:"Moderate shortages: none"}${monitoring.length?` | Monitoring capacity: ${monitoring.join(", ")}`:""}`;
}
function workforceFinancialPressureHtml(){
  ensureWorkforceEconomySystems();updateCompanyRiskComponents();
  const allocation=buildWorkforceAllocationSnapshot();
  const f=company.finance,s=company.staffingModel||{},below=Object.entries(s).filter(([,v])=>v.understaffed).map(([k])=>k),above=Object.entries(s).filter(([,v])=>v.overstaffed).map(([k])=>k),activeEmployees=employees.filter(e=>e.active).length,inOffice=employees.filter(e=>e.active&&!e.offsite).length;
  const searching=employees.filter(e=>e.active&&(e.retention?.searching||e.jobSearchDays>0)).length;
  const retiring=employees.filter(e=>e.active&&(e.retirementReadiness||0)>60).length;
  const requisitions=(company.recruitingPipeline||[]).filter(r=>r.status==="requisition").length,recruiting=(company.recruitingPipeline||[]).filter(r=>r.status==="searching").length,interviewing=(company.recruitingPipeline||[]).filter(r=>r.status==="interviewing").length,offers=(company.recruitingPipeline||[]).filter(r=>r.status==="offer").length,pausedRecruiting=(company.recruitingPipeline||[]).filter(r=>r.status==="paused-policy").length,recentHiringActions=(company.hiringRequests||[]).filter(r=>company.day-(r.day||0)<35&&["delayed","approved-recruiting","rejected"].includes(r.status)).length;
  const activeRecruitingItems=(company.recruitingPipeline||[]).filter(r=>["requisition","searching","interviewing","offer"].includes(r.status));
  const avgFill=activeRecruitingItems.length?Math.round(activeRecruitingItems.reduce((sum,r)=>sum+(r.expectedFillDays||expectedRecruitingDays(r)),0)/activeRecruitingItems.length):0;
  const pipeline=hiringPipelineRows();
  const identified=pipeline.filter(r=>["Need Identified","Department Review","Finance/HR Review"].includes(r.status)).reduce((s,r)=>s+r.count,0),preparing=pipeline.filter(r=>r.status==="Preparing CEO Memo").reduce((s,r)=>s+r.count,0),queuedMemos=pipeline.filter(r=>r.status==="Memo Queued for CEO").reduce((s,r)=>s+r.count,0);
  const suppressed=pipeline.filter(r=>r.status==="Suppressed by Hiring Policy").reduce((s,r)=>s+r.count,0);
  const coaching=employees.filter(e=>e.active&&["informal-coaching","formal-coaching"].includes(e.performanceManagement?.stage)).length,pips=employees.filter(e=>e.active&&e.performanceManagement?.stage==="pip").length,onboarding=employees.filter(e=>e.active&&e.performanceManagement?.stage==="onboarding"&&company.day-(e.joinedDay||0)<(e.onboarding?.duration||21)).length,recentHires=employees.filter(e=>e.active&&company.day-(e.joinedDay||0)<=45&&(e.careerHistory||[]).some(h=>/Hired as|Selected by HR|Completed onboarding/i.test(String(h)))).length;
  const burnout=employees.filter(e=>e.active&&e.stress>=75).length,terminations=(company.terminationNotifications||[]).filter(n=>company.day-(n.day||0)<45).length,layoffs=(company.layoffHistory||[]).filter(n=>company.day-(n.day||0)<60).reduce((s,n)=>s+(n.count||0),0);
  return `<strong>Workforce and Financial Pressure</strong><br><small>
    Employees ${activeEmployees} (${inOffice} in office); vacancies/backfills ${(company.openRoles||[]).length}; payroll $${f.payrollDaily.toFixed(3)}M/day; total cost $${f.totalDailyCost.toFixed(3)}M/day<br>
    Net cash flow $${f.netCashFlowDaily.toFixed(3)}M/day; runway ${f.runwayDays>=999?"positive":`${f.runwayDays} ${f.runwayDays===1?"day":"days"}`}; unpaid payroll ${company.unpaidPayrollDays||0} ${(company.unpaidPayrollDays||0)===1?"day":"days"}<br>
    Understaffed: ${below.length?below.join(", "):"none"} | Overstaffed: ${above.length?above.join(", "):"none"}<br>
    ${staffingShortageSummary()}<br>
    Project allocation gap ${allocation.totals.missingAssignments} assignment(s), ${allocation.totals.missingProjectFte} FTE; reported blockers ${allocation.totals.observedBlockedWork}<br>
    Hiring policy: ${hiringPolicyLabel()}${company.hiringPolicy?.reviewDay?`; review day ${company.hiringPolicy.reviewDay}`:""} <button class="small-btn" onclick="requestHiringPolicyReview()">Review Hiring Policy</button><br>
    Staffing signals ${identified}; preparing CEO memo ${preparing}; memo queued ${queuedMemos}; recent hiring decisions ${recentHiringActions}; requisitions ${requisitions}; searching ${recruiting}; interviewing ${interviewing}; offers ${offers}; paused ${pausedRecruiting}; suppressed ${suppressed}; onboarding ${onboarding}; recent hires ${recentHires}; coaching ${coaching}; PIP ${pips}; burnout watch ${burnout}<br>
    Average expected time to fill ${avgFill?`${avgFill} ${avgFill===1?"day":"days"}`:"n/a"}. Hiring flow: department signal -> finance/HR review -> CEO Inbox memo -> approve position -> HR recruits and hires.<br>
    Retention risk ${employees.filter(e=>e.active&&(e.retentionRisk||0)>=60).length}; searching ${searching}; retirement watch ${retiring}; terminations ${terminations}; layoffs ${layoffs}; board strikes ${company.boardGovernance?.strikes||0}; CEO PIP ${company.boardGovernance?.pipActive?"active":"none"}<br>
    Company risk: ${company.companyRiskComponents.label} (${Math.round(company.companyRiskComponents.total)})
  </small>${hiringPipelineHtml()}`;
}
function applyStaffingPressure(){
  ensureWorkforceEconomySystems();updateStaffingModel();
  for(const [dept,st] of Object.entries(company.staffingModel||{})){
    const members=employees.filter(e=>e.active&&roleDepartment(e.role)===dept);
    if(st.understaffed){
      const gapPressure=Math.max(0,st.minimumHealthy-st.current)*.6+(st.capacityGap||0)*.9+(st.projectOverload||0)*.65;
      members.forEach(e=>{applyEmployeeEmotionDelta(e,{stressDelta:1.1+gapPressure,reasonCode:"staffing-gap",sourceEventId:`staffing-${dept}-${company.day}`,ignoreCooldown:true});e.focus=clamp(e.focus-.35-gapPressure*.08,0,100);e.retentionRisk=clamp((e.retentionRisk||0)+.45+gapPressure*.18,0,100);});
      const teamKey=dept==="quality"?"software":dept;
      if(company.teams?.[teamKey])company.teams[teamKey].pressure=clamp((company.teams[teamKey].pressure||30)+1.2+gapPressure*.5,0,100);
    }
    if(st.overstaffed){
      members.forEach(e=>{applyEmployeeEmotionDelta(e,{moraleDelta:-.35,reasonCode:"staffing-policy-friction",sourceEventId:`staffing-${dept}-${company.day}`,ignoreCooldown:true});e.retentionRisk=clamp((e.retentionRisk||0)+.2,0,100);});
      company.culture.politics=clamp((company.culture.politics||25)+.08,0,100);
    }
  }
}
function workforceLearningVector(kind){
  const map={
    help:{collaboration:.8,mentoring:.45,recovery:.65,escalation:.2,planning:.25,helpSeeking:.9,burnoutRecovery:.8,workloadBalancing:.45},
    coaching:{mentoring:.9,recovery:.45,planning:.35,coaching:1,performanceManagement:.55},
    pipSuccess:{mentoring:.55,planning:.6,documentation:.45,coaching:.55,performanceManagement:.75,terminationTiming:-.2},
    pipFailure:{planning:.65,documentation:.75,performanceManagement:.8,terminationTiming:.45,coaching:-.15},
    termination:{documentation:.8,performanceManagement:.75,terminationTiming:.55,workloadBalancing:.25},
    hiring:{planning:.7,mentoring:.35,hiringTiming:.85,successionPlanning:.55,retention:.3},
    layoff:{planning:.65,documentation:.55,layoffCaution:1,retention:.45,riskTaking:-.3}
  };
  return map[kind]||{};
}
function reinforceWorkforceLesson(key,delta=1,evidence="",confidenceGain=6){
  ensureWorkforceEconomySystems();
  const current=company.workforceLessons[key]||{score:0,confidence:0,count:0,lastEvidence:""};
  const n=(current.count||0)+1, old=Number(current.effectEstimate)||Number(current.score)||0;
  current.effectEstimate=clamp(old+(delta-old)/n,-12,12);
  current.score=clamp((current.score||0)*.9+delta*.55,-12,12);
  current.successEvidence=(current.successEvidence||0)+(delta>0?1:0);
  current.failureEvidence=(current.failureEvidence||0)+(delta<0?1:0);
  current.variance=clamp(((current.variance||1)*(n-1)+Math.pow(delta-current.effectEstimate,2))/n,0,25);
  current.confidence=clamp((current.confidence||0)+confidenceGain/(1+Math.sqrt(current.variance||0)),0,100);
  current.count=(current.count||0)+1;
  current.lastDay=company.day;
  current.lastEvidence=evidence||current.lastEvidence||"Workforce event";
  company.workforceLessons[key]=current;
  recordLearningEvidence({domain:"workforce",eventType:key,action:key,outcome:delta>=0?"positive":"negative",magnitude:delta,confidence:current.confidence,department:"people",evidence,contributors:[{type:"workforceLesson",id:key,weight:1}]});
}
function processBurnoutResponseDaily(e){
  if(!e.active)return;
  ensureWorkforceEconomySystems();
  const b=e.burnoutResponse,team=employeeTeam(e),st=company.staffingModel?.[team]||{},trust=(e.opinionOfCEO?.trust||55),fear=(e.opinionOfCEO?.fear||12);
  if(e.stress<60){b.unresolvedDays=Math.max(0,(b.unresolvedDays||0)-1);return;}
  b.unresolvedDays=(b.unresolvedDays||0)+1;
  if(e.stress>=60){e.focus=clamp(e.focus+.6,0,100);e.energy=clamp(e.energy+1.2,0,100);}
  const shouldAsk=e.stress>=70&&(company.day-(b.lastHelpDay||-999)>5)&&((st.blockedWork||0)>0||st.workload>65||availableCollaborator(e));
  if(shouldAsk&&trust+company.culture.communication-fear>55){
    const helper=availableCollaborator(e);
    b.helpAttempts++;b.lastHelpDay=company.day;
    e.helpSeekingHistory.unshift({day:company.day,type:"help",helperId:helper?.id??null,stress:Math.round(e.stress)});
    if(helper){
      recordSharedExperience(e,helper,{type:"help_request",sourceEventId:`help-${e.id}-${company.day}`,emotionalWeight:1,outcome:"positive",importance:3,evidence:`${helper.name} helped ${e.name} respond to workload pressure.`});
      applyEmployeeEmotionDelta(helper,{moraleDelta:1.5,reasonCode:"help-given",sourceEventId:`help-${e.id}-${company.day}`,ignoreCooldown:true});
    }
    applyEmployeeEmotionDelta(e,{stressDelta:-5,moraleDelta:2,reasonCode:"help-received",sourceEventId:`help-${e.id}-${company.day}`,ignoreCooldown:true});
    createEmployeeMessage({type:"help-request",from:e,toIds:helper?[helper.id]:[],department:team,subject:`Help requested by ${e.name}`,contentCode:"WORKLOAD_HELP",severity:e.stress,urgency:45,confidence:68,status:"local",evidence:[`${e.name} tried to solve workload pressure before escalation.`]});
    reinforceWorkforceLesson("helpSeeking",1,`${e.name} asked for help before burnout`,5);
    reinforceWorkforceLesson("workloadBalancing",.5,`${teamDisplayName(team)} absorbed a local help request`,4);
    createOrReinforceLesson({key:"early-help-reduces-burnout",title:"Early help-seeking and workload redistribution can prevent burnout.",department:team,vector:workforceLearningVector("help"),outcome:"positive",confidence:63,evidence:`${e.name} asked for help before burnout`,importance:3});
  }
  if(e.stress>=80&&company.day-(b.lastRecoveryDay||-999)>6){
    b.recoveryAttempts++;b.lastRecoveryDay=company.day;b.managerEscalated=true;
    applyEmployeeEmotionDelta(e,{stressDelta:-9,reasonCode:"burnout-recovery-support",sourceEventId:`recovery-${e.id}-${company.day}`,ignoreCooldown:true});e.energy=clamp(e.energy+8,0,100);e.focus=clamp(e.focus+4,0,100);
    e.managerHistory.unshift({day:company.day,type:"burnout-recovery",stress:Math.round(e.stress)});
    company.managerActions.unshift({day:company.day,type:"burnout-recovery",employeeId:e.id,department:team});
    reinforceWorkforceLesson("burnoutRecovery",1,`${teamDisplayName(team)} started recovery support for ${e.name}`,6);
    reinforceWorkforceLesson("workloadBalancing",.7,`${teamDisplayName(team)} redistributed work for ${e.name}`,5);
    recordWeeklyEvent(`${teamDisplayName(team)} redistributed work to protect ${e.name} from burnout.`,"people",3);
    recordHistory(`${teamDisplayName(team)} redistributed work and started recovery support for ${e.name}.`,"people",3);
  }
  if(e.stress>=90&&b.unresolvedDays>=3&&simulationRandom()<.18){e.sickDays=Math.max(e.sickDays||0,2);recordMetricEvent("sickness");}
}
function performanceManagementRisk(e){
  const p={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
  return performanceScore(e)+(p.reviewRiskDays||0)*2+(p.qualityMistakes||0)*3;
}
function archiveWorkforceNotice(subject,message,recs=[],impacts=[]){
  const comm={type:"HR Notification",priority:"Information",from:"People Operations",role:"HR",date:`Day ${company.day+1}`,subject,message,recs:recs.length?recs:[["People","Handled operationally",74]],impacts:impacts.length?impacts:["No CEO approval was required"],signature:"Regards,\nPeople Operations\nHR"};
  queueInformationalCommunication(comm,{id:`hr-${company.day}-${company.terminationNotifications?.length||0}`,category:"people",title:subject,copy:message});
}
function operationalTerminate(e,reason="failed PIP"){
  if(!e.active)return;
  const team=employeeTeam(e);
  e.active=false;e.offsite=true;e.action="terminated";e.terminationHistory.unshift({day:company.day,reason});
  recordMetricEvent("firings");
  company.terminationNotifications.unshift({day:company.day,employeeId:e.id,name:e.name,role:e.role,department:team,reason});
  employees.filter(x=>x.active).forEach(x=>{if(employeeTeam(x)===team)applyEmployeeEmotionDelta(x,{moraleDelta:-2,stressDelta:1,reasonCode:"termination-impact",sourceEventId:`termination-${e.id}-${company.day}`,ignoreCooldown:true});adjustCEOOpinion(x,{fairness:-.5,fear:1});});
  archiveWorkforceNotice(`HR Notification - ${e.name}`,`Following documented coaching, a performance improvement plan, and HR review, employment for ${e.name} ended. Reason: ${reason}. The department will separately evaluate whether replacement is required.`,[["People","Termination followed documented process",78],["Operations","Replacement need will be evaluated separately",70]],["Team continuity may be affected","A hiring recommendation may follow if capacity remains constrained"]);
  recordWeeklyEvent(`${e.name} left after a documented performance process.`,"people",5);
  recordHistory(`${e.name} was terminated after failed coaching and PIP review.`,"people",5);
  reinforceWorkforceLesson("terminationTiming",1,`${e.name} termination after ${reason}`,7);
  reinforceWorkforceLesson("performanceManagement",.8,`${e.name} completed documented performance process`,6);
  createOrReinforceLesson({key:"documented-performance-process",title:"Documented coaching and PIP review should precede operational termination.",department:team,vector:workforceLearningVector("termination"),outcome:"mixed",confidence:70,evidence:`${e.name} termination after ${reason}`,importance:4});
  if(!validationMode)buildOffice();
}
function processManagerPerformanceDaily(){
  ensureWorkforceEconomySystems();
  employees.filter(e=>e.active).forEach(e=>{
    e.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
    e.performanceManagement={stage:"none",coachingAttempts:0,pipAttempts:0,pipStartDay:null,pipDueDay:null,lastActionDay:-999,documentedIssues:0,improvementScore:0,hrReviewed:false,terminationEligible:false,...(e.performanceManagement||{})};
    const pm=e.performanceManagement,score=performanceManagementRisk(e);
    if(score<24){pm.documentedIssues=Math.max(0,(pm.documentedIssues||0)-1);if(pm.stage!=="none")pm.improvementScore=(pm.improvementScore||0)+1;return;}
    pm.documentedIssues=clamp((pm.documentedIssues||0)+1,0,30);
    if(pm.stage==="none"&&pm.documentedIssues>=3&&company.day-(pm.lastActionDay||-999)>7){
      pm.stage="informal-coaching";pm.coachingAttempts++;pm.lastActionDay=company.day;e.performance.coachingDays=8;e.focus=clamp(e.focus+6,0,100);applyEmployeeEmotionDelta(e,{stressDelta:-4,reasonCode:"informal-coaching",sourceEventId:`coach-${e.id}-${company.day}`,ignoreCooldown:true});
      company.managerActions.unshift({day:company.day,type:"informal-coaching",employeeId:e.id,department:employeeTeam(e)});
      reinforceWorkforceLesson("coaching",.8,`${e.name} informal coaching`,5);
      reinforceWorkforceLesson("performanceManagement",.5,`${e.name} entered informal coaching`,4);
      recordMetricEvent("coaching");createOrReinforceLesson({key:"coaching-before-discipline",title:"Coaching is the first response to sustained performance risk.",department:employeeTeam(e),vector:workforceLearningVector("coaching"),outcome:"positive",confidence:62,evidence:`${e.name} informal coaching`,importance:3});
    }else if(pm.stage==="informal-coaching"&&pm.documentedIssues>=6&&company.day-(pm.lastActionDay||-999)>10){
      pm.stage="formal-coaching";pm.coachingAttempts++;pm.lastActionDay=company.day;e.performance.coachingDays=14;applyEmployeeEmotionDelta(e,{moraleDelta:4,reasonCode:"formal-coaching",sourceEventId:`coach-${e.id}-${company.day}`,ignoreCooldown:true});e.focus=clamp(e.focus+5,0,100);
      company.managerActions.unshift({day:company.day,type:"formal-coaching",employeeId:e.id,department:employeeTeam(e)});
      reinforceWorkforceLesson("coaching",1,`${e.name} formal coaching`,6);
    }else if(["informal-coaching","formal-coaching"].includes(pm.stage)&&pm.documentedIssues>=9&&company.day-(pm.lastActionDay||-999)>12){
      pm.stage="pip";pm.pipAttempts++;pm.pipStartDay=company.day;pm.pipDueDay=company.day+21;pm.lastActionDay=company.day;pm.hrReviewed=true;
      company.managerActions.unshift({day:company.day,type:"pip-start",employeeId:e.id,department:employeeTeam(e)});
      reinforceWorkforceLesson("performanceManagement",1,`${e.name} entered PIP`,6);
      archiveWorkforceNotice(`PIP started - ${e.name}`,`${e.name} entered a manager-led performance improvement plan after sustained documented performance risk. This is an operational process and does not require CEO approval.`,[["People","Review progress in 21 simulated days",76]],["The employee may recover or later leave after HR review"]);
    }
    if(pm.stage==="pip"&&company.day>=(pm.pipDueDay||999)){
      if(score<30||pm.improvementScore>=4){pm.stage="recovered";pm.documentedIssues=0;pm.terminationEligible=false;applyEmployeeEmotionDelta(e,{moraleDelta:7,reasonCode:"pip-recovered",sourceEventId:`pip-${e.id}-${company.day}`,exceptional:true});reinforceWorkforceLesson("performanceManagement",1,`${e.name} recovered from PIP`,7);reinforceWorkforceLesson("coaching",.5,`${e.name} recovered from PIP`,5);createOrReinforceLesson({key:"pip-can-recover-performance",title:"Some PIPs recover performance when coaching and expectations are clear.",department:employeeTeam(e),vector:workforceLearningVector("pipSuccess"),outcome:"positive",confidence:65,evidence:`${e.name} recovered from PIP`,importance:4});recordHistory(`${e.name} completed a performance improvement plan successfully.`,"people",4);}
      else{pm.terminationEligible=true;operationalTerminate(e,"failed performance improvement plan");}
    }
  });
}
function hiringNeedScore(dept,st){
  const members=employees.filter(e=>e.active&&roleDepartment(e.role)===dept),financeConstraint=company.finance?.runwayDays<60?28:company.finance?.netCashFlowDaily<-.08?18:0;
  const retirementRisk=members.filter(e=>(e.retirementReadiness||0)>55).length*12;
  const successionRisk=members.filter(e=>(e.careerLifecycle?.successionRisk||0)>45).length*10;
  const stressTrend=members.reduce((s,e)=>s+Math.max(0,e.stress-60),0)/Math.max(1,members.length);
  const skillGap=Math.max(0,62-(st.skillCoverage||50))*.65;
  const qualityBurden=dept==="quality"||dept==="hardware"?Math.max(0,100-company.quality)*.18:0;
  const customerDemand=(dept==="product"||dept==="finance")?Math.min(28,(company.customers||0)/6):0;
  const manufacturingDemand=(dept==="hardware"||dept==="quality")?Math.max(0,(company.manufacturing?.supplyRisk||0)-45)*.22:0;
  const capSignal=capabilityHiringSignalForDepartment(dept);
  return clamp((st.minimumHealthy-st.current)*24+(st.backlog||0)*3.8+(st.blockedWork||0)*8+stressTrend+qualityBurden+customerDemand+manufacturingDemand+retirementRisk+successionRisk+skillGap+(capSignal?.score||0)-financeConstraint-(st.overstaffed?30:0),0,100);
}
function roleForHiringNeed(dept){
  const capSignal=capabilityHiringSignalForDepartment(dept);
  return capSignal?.role||roleForDepartmentHire(dept);
}
function hiringNeedAssessment(dept,st={}){
  const members=employees.filter(e=>e.active&&roleDepartment(e.role)===dept),financeConstraint=company.finance?.runwayDays<60?28:company.finance?.netCashFlowDaily<-.08?18:0;
  const allocation=typeof buildWorkforceAllocationSnapshot==="function"?buildWorkforceAllocationSnapshot():null;
  const allocDept=allocation?.departments?.[dept]||{};
  const retirementCases=members.filter(e=>(e.retirementReadiness||0)>55).length;
  const successionCases=members.filter(e=>(e.careerLifecycle?.successionRisk||0)>45).length;
  const stressTrend=members.reduce((s,e)=>s+Math.max(0,e.stress-60),0)/Math.max(1,members.length);
  const staffingGap=Math.max(0,(st.minimumHealthy||0)-(st.current||0));
  const skillGap=(st.current||0)>0?Math.max(0,62-(st.skillCoverage||50))*.65:0;
  const qualityBurden=dept==="quality"||dept==="hardware"?Math.max(0,100-company.quality)*.18:0;
  const customerDemand=(dept==="product"||dept==="finance")?Math.min(28,(company.customers||0)/6):0;
  const manufacturingDemand=(dept==="hardware"||dept==="quality")?Math.max(0,(company.manufacturing?.supplyRisk||0)-45)*.22:0;
  const activeProjects=Number(st.activeProjectCount)||0;
  const projectDemand=Number(st.projectDemand)||0;
  const projectMissing=Number(allocDept.missingAssignments)||0;
  const projectMissingFte=Number(allocDept.missingProjectFte)||0;
  const capabilitySignal=capabilityHiringSignalForDepartment(dept);
  const roleGapEvidence=(allocDept.criticalRoleGaps||[]).slice(0,3).map(g=>`${g.projectTitle||"Project"} needs ${g.missingAssignments} ${g.role} assignment${g.missingAssignments===1?"":"s"}`).join("; ");
  const factors=[
    {key:"company-capability",score:capabilitySignal?.score||0,text:`the company has a ${String(capabilitySignal?.label||"capability").toLowerCase()} gap`,evidence:capabilitySignal?`${capabilitySignal.label} need ${capabilitySignal.need}, coverage ${capabilitySignal.coverage}; recommended role ${capabilitySignal.role}`:""},
    {key:"staffing-gap",score:staffingGap*24,text:dept==="people"?"People Operations has no dedicated coordination capacity":`${teamDisplayName(dept)} is below its healthy staffing range`,evidence:(st.current||0)>0?`${st.current} current vs ${st.minimumHealthy||0} healthy staffing target`:`no current ${teamDisplayName(dept)} staff assigned`},
    {key:"project-allocation-gap",score:projectMissing*18+projectMissingFte*10,text:`${teamDisplayName(dept)} has uncovered project assignments`,evidence:roleGapEvidence||`${projectMissing} project assignment${projectMissing===1?"":"s"} uncovered`},
    {key:"project-demand",score:projectDemand*9,text:`${teamDisplayName(dept)} is carrying project-driven coordination demand`,evidence:`${activeProjects} active project${activeProjects===1?"":"s"} ${activeProjects===1?"requires":"require"} ${teamDisplayName(dept)} support`},
    {key:"capacity-gap",score:(Number(st.capacityGap)||0)*22,text:"project assignments exceed available department capacity",evidence:`allocated project demand exceeds capacity by ${Number(st.capacityGap||0).toFixed(1)} FTE`},
    {key:"overload",score:(Number(st.projectOverload)||0)*18,text:"assigned employees are already above sustainable project load",evidence:`project overload is ${Number(st.projectOverload||0).toFixed(1)}`},
    {key:"backlog",score:(st.backlog||0)*3.8,text:"open work is building faster than the department can clear it",evidence:`${st.backlog||0} open work item${(st.backlog||0)===1?"":"s"}`},
    {key:"blocked",score:(st.blockedWork||0)*8,text:"blocked work needs more focused ownership",evidence:`${st.blockedWork||0} blocked work item${(st.blockedWork||0)===1?"":"s"}`},
    {key:"stress",score:stressTrend,text:"current staff are absorbing sustained workload pressure",evidence:`average excess stress contribution ${Math.round(stressTrend)}`},
    {key:"customer-growth",score:customerDemand,text:"customer growth is increasing coordination and planning work",evidence:`${Math.round(company.customers||0)} customer${Math.round(company.customers||0)===1?"":"s"} now require support`},
    {key:"manufacturing",score:manufacturingDemand,text:"manufacturing risk is increasing technical support demand",evidence:`supply risk ${Math.round(company.manufacturing?.supplyRisk||0)}`},
    {key:"quality",score:qualityBurden,text:"quality weakness is creating additional review demand",evidence:`company quality ${Math.round(company.quality||0)}`},
    {key:"retirement",score:retirementCases*12,text:"succession coverage is becoming thin",evidence:`${retirementCases} retirement watch case${retirementCases===1?"":"s"}`},
    {key:"succession",score:successionCases*10,text:"the department has key-person continuity risk",evidence:`${successionCases} succession risk case${successionCases===1?"":"s"}`},
    {key:"skill-gap",score:skillGap,text:"available skills are below the work the department is being asked to own",evidence:`skill coverage ${Math.round(st.skillCoverage||0)}`}
  ].filter(f=>f.score>1.5).sort((a,b)=>b.score-a.score);
  const score=clamp(factors.reduce((s,f)=>s+f.score,0)-financeConstraint-(st.overstaffed?30:0),0,100);
  return {score,factors,financeConstraint};
}
function hiringNeedNarrative(dept,st={},role=roleForHiringNeed(dept)){
  const assessment=hiringNeedAssessment(dept,st),factors=assessment.factors.slice(0,3);
  const top=factors[0];
  let reason;
  if(top)reason=`${teamDisplayName(dept)} recommends adding ${articleFor(role)} ${role} because ${top.text}.`;
  else reason=`${teamDisplayName(dept)} is monitoring staffing before operational failures appear. The request is preventive rather than a response to a blocked queue.`;
  const evidence=factors.map(f=>f.evidence).filter(Boolean);
  if(!evidence.length)evidence.push("No immediate blockers are visible; the signal is based on forward staffing risk.");
  if(assessment.financeConstraint>0)evidence.push("Finance is applying runway caution to the recommendation.");
  return {reason,evidence,assessment};
}
function articleFor(text){return /^[aeiou]/i.test(String(text||""))?"an":"a";}
function updateHiringNeedHistory(){
  ensureWorkforceEconomySystems();updateStaffingModel();
  for(const [dept,st] of Object.entries(company.staffingModel||{})){
    const assessment=hiringNeedAssessment(dept,st);
    const score=Math.round(assessment.score),hist=company.hiringNeedHistory[dept]||{days:0,lastScore:0,peak:0,confidence:0};
    hist.days=score>=60?(hist.days||0)+1:Math.max(0,(hist.days||0)-1);
    hist.lastScore=score;hist.peak=Math.max(score,hist.peak||0);
    const signals=[st.current<st.minimumHealthy,st.backlog>5,st.blockedWork>0,st.workload>70,st.skillCoverage<58,company.finance?.runwayDays>45].filter(Boolean).length;
    hist.confidence=clamp(hist.days*8+signals*9+(score-hist.days)*.12,0,100);
    hist.factors=assessment.factors.slice(0,4);
    company.hiringNeedHistory[dept]=hist;
  }
}
function recruitingProjectFor(department,role){
  const direct=projectStaffingDetails().find(x=>x.dept===department&&(x.role===role||roleDepartment(x.role)===department));
  if(direct)return {id:direct.project.id,title:direct.project.title,codename:direct.project.codename};
  const p=activeProjects().find(p=>(p.requiredDepartments||[]).includes(department));
  return p?{id:p.id,title:p.title,codename:p.codename}:null;
}
function recruitingHealthScore(item){
  const lesson=company.workforceLessons?.hiringTiming||{score:0,confidence:0};
  const policyPenalty=company.hiringPolicy?.mode==="frozen"?-18:company.hiringPolicy?.mode==="critical-only"?-7:0;
  const runway=company.finance?.runwayDays||999;
  const marketBoost=((company.marketConfidence??50)-50)*.16+((company.valuationQuality??50)-50)*.12+((company.worldState?.talentMarket??50)-50)*.14-((company.boardControlPressure??0)*.04);
  const labor=laborMarketForDepartment(item.department||roleDepartment(item.role));
  return clamp(50+(company.trust-55)*.28+(company.board-55)*.16+(company.culture?.communication-50)*.18+(company.culture?.workLife-50)*.12+(lesson.score||0)*1.8+(lesson.confidence||0)*.04+(runway<60?-12:runway<100?-5:3)+policyPenalty+marketBoost+(labor.candidateSupply-50)*.12+(labor.acceptanceRate-50)*.10-(labor.competition-50)*.09-(company.unpaidPayrollDays||0)*20,0,100);
}
function expectedRecruitingDays(item){
  const roleDiff=roleRecruitingDifficulty(item.role),marketPenalty={excellent:-8,healthy:-4,average:0,tight:8,"very tight":16}[item.market]||0;
  const labor=laborMarketForDepartment(item.department||roleDepartment(item.role));
  item.salaryCompetitiveness=Number.isFinite(item.salaryCompetitiveness)?item.salaryCompetitiveness:65;
  item.expectedFillDays=Number.isFinite(item.expectedFillDays)?item.expectedFillDays:null;
  const salaryHelp=clamp(item.salaryCompetitiveness-60,-25,25)*-.22;
  const reputationHelp=(recruitingHealthScore(item)-50)*-.18;
  const modeHelp=item.mode==="contractor"?-12:item.mode==="junior"?-4:0;
  return Math.round(clamp(8+(roleDiff-45)*.55+marketPenalty+(item.competition||45)*.12-(item.talentAvailability||50)*.08+(labor.timeToFill||20)*.35-(labor.candidateSupply-50)*.10+(labor.salaryPressure-50)*.08+salaryHelp+reputationHelp+modeHelp,6,90));
}
function stageDaysForRecruiting(item,stage){
  const expected=expectedRecruitingDays(item);
  if(stage==="requisition")return 1+Math.floor(simulationRandom()*2);
  if(stage==="searching")return Math.max(4,Math.round(expected*.46+rand(-2,3)));
  if(stage==="interviewing")return Math.max(3,Math.round(expected*.22+rand(-1,3)));
  if(stage==="offer")return Math.max(2,Math.round(expected*.12+rand(0,3)));
  return 7;
}
function advanceRecruitingStage(item,status){
  item.status=status;
  item.stage=status;
  item.stageStartedDay=company.day;
  item.dueDay=company.day+stageDaysForRecruiting(item,status);
  company.hiringRequestHistory.unshift({day:company.day,role:item.role,department:item.department,status,project:item.project?.title||null});
}
function onboardingProductivity(e){
  if(!e?.onboarding)return 1;
  const age=company.day-(e.onboarding.startDay??e.joinedDay??company.day),duration=e.onboarding.duration||28;
  const base=clamp(age/duration,0,1);
  const ramp=.2+base*.8;
  e.onboarding.productivity=clamp(Math.round(ramp*100),20,100);
  return clamp(ramp,0.2,1);
}
function completeDueOnboarding(){
  employees.filter(e=>e.active&&e.performanceManagement?.stage==="onboarding"&&e.onboarding&&company.day-(e.onboarding.startDay??e.joinedDay)>=e.onboarding.duration).forEach(e=>{
    e.performanceManagement.stage="none";
    e.onboarding.productivity=100;
    if(!e.careerHistory?.some(h=>String(h).includes("Completed onboarding")))e.careerHistory.unshift(`Completed onboarding on day ${company.day}`);
    recordHistory(`${e.name} completed onboarding as ${e.role}.`,"people",3);
  });
}
function onboardingQualityForHire(candidate,item){
  const dept=item.department,team=company.teams?.[dept]||{};
  const mentor=employees.filter(e=>e.active&&roleDepartment(e.role)===dept&&e.joinedDay!==company.day).sort((a,b)=>(b.skills?.leadership||0)+(b.learning?.mentor||0)-(a.skills?.leadership||0)-(a.learning?.mentor||0))[0];
  const lesson=company.workforceLessons?.hiringTiming||{score:0,confidence:0};
  const quality=clamp(48+(mentor?.skills?.leadership||45)*.18+(team.cohesion||55)*.18+(company.culture?.communication||50)*.16+(lesson.score||0)*1.4-(team.pressure||50)*.12+(candidate?.cultureFit||60)*.12,20,95);
  return {quality,mentor};
}
function startRecruiting(role,mode="specialist",department=null,options={}){
  ensureWorkforceEconomySystems();
  if(!role)role=(company.openRoles||[])[0]||roleForDepartmentHire(department||"software");
  role=canonicalRole(role);
  if(!roleDefinition(role))return null;
  department=department||roleDepartment(role);
  const markets=["excellent","healthy","average","tight","very tight"],market=markets[Math.floor(simulationRandom()*markets.length)];
  const labor=laborMarketForDepartment(department);
  const backfill=!!options.backfill;
  const item={id:nextSimulationId("recruit"),day:company.day,searchStartedDay:company.day,stageStartedDay:company.day,dueDay:company.day+1,role,department,mode,status:"requisition",stage:"requisition",source:options.source||(backfill?"vacancy-backfill":"approved-headcount"),backfill,costPaid:.18,attempts:0,market,competition:Math.round(clamp(labor.competition+rand(-9,9),5,100)),salaryInflation:Math.round(clamp((labor.salaryPressure-45)*.35+rand(0,8),0,35)),salaryCompetitiveness:Math.round(rand(48,82)),talentAvailability:Math.round(clamp(labor.candidateSupply+rand(-10,10),5,100)),laborMarketSnapshot:{...labor},exceptionQueued:false,candidate:null,project:recruitingProjectFor(department,role),expectedFillDays:null,declines:0};
  item.expectedFillDays=expectedRecruitingDays(item);
  item.dueDay=company.day+stageDaysForRecruiting(item,"requisition");
  company.recruitingPipeline.unshift(item);
  company.hiringRequestHistory.unshift({day:company.day,role,department,status:"approved-recruiting",confidence:company.hiringNeedHistory?.[department]?.confidence||60});
  (company.hiringRequests||[]).filter(r=>r.department===department&&r.role===role&&r.status==="queued"&&company.day-(r.day||0)<45).forEach(r=>{r.status="approved-recruiting";r.approvedDay=company.day;});
  company.cash=clamp(company.cash-.18,0,999);
  applyHiringPolicyToRecruiting();
  recordHistory(`Recruiting started for ${role}.`,"people",3);
  reinforceWorkforceLesson("hiringTiming",1,`Recruiting started for ${role}`,6);
  reinforceWorkforceLesson("successionPlanning",.5,`${department} added hiring depth`,4);
  createOrReinforceLesson({key:"hiring-starts-before-crisis",title:"Hiring works best when recruiting starts before capacity fully breaks.",department,vector:workforceLearningVector("hiring"),outcome:"positive",confidence:60,evidence:`Recruiting started for ${role}`,importance:3});
  return item;
}
function generateRecruitingCandidate(item){
  if(validationMode&&company.forceRecruitingCandidateForTest)return {role:item.role,skills:baseSkillsForRole(item.role),experience:company.forceRecruitingCandidateForTest.experience||40,salaryExpectation:defaultEmploymentForRole(item.role).annualSalary,personality:"test candidate",strengths:["controlled validation"],weaknesses:company.forceRecruitingCandidateForTest.mediocre?["weak fit"]:[],availability:"immediate",hiringDifficulty:roleRecruitingDifficulty(item.role),cultureFit:company.forceRecruitingCandidateForTest.cultureFit||50,growthPotential:company.forceRecruitingCandidateForTest.leadership||45,...company.forceRecruitingCandidateForTest};
  const marketBoost={excellent:16,healthy:9,average:0,tight:-8,"very tight":-15}[item.market]||0;
  const labor=laborMarketForDepartment(item.department||roleDepartment(item.role));
  const health=(recruitingHealthScore(item)-50)*.16;
  const valuationBoost=((company.marketConfidence??50)-50)*.06+((company.valuationQuality??50)-50)*.05;
  const skill=clamp(Math.round(rand(45,86)+marketBoost+(labor.averageQuality-55)*.20+(company.trust-55)*.08+health+valuationBoost),35,98);
  const cultureFit=clamp(Math.round(rand(42,88)+(company.culture?.workLife-55)*.1),25,96);
  const experience=clamp(Math.round(rand(35,88)+marketBoost*.4+(labor.candidateSupply-50)*.06),25,98);
  const leadership=clamp(Math.round(rand(25,75)+experience*.15),20,95);
  const salaryPremium=clamp(Math.round((item.salaryInflation||0)+(labor.salaryPressure-50)*.12+Math.max(0,skill-78)*.45+Math.max(0,50-(company.marketConfidence??50))*.08+rand(-4,8)),0,30);
  const strengths=[skill>78?"strong technical screen":null,cultureFit>72?"strong culture fit":null,experience>72?"relevant experience":null,leadership>68?"mentoring potential":null].filter(Boolean);
  const weaknesses=[skill<58?"needs technical ramp":null,cultureFit<48?"culture fit risk":null,salaryPremium>12?"above salary band":null,item.market==="very tight"?"high market competition":null].filter(Boolean);
  return {role:item.role,skills:baseSkillsForRole(item.role),experience,salaryExpectation:Number((defaultEmploymentForRole(item.role).annualSalary*(1+(salaryPremium||0)/100)).toFixed(3)),personality:["careful","ambitious","collaborative","independent"][Math.floor(simulationRandom()*4)],strengths,weaknesses,availability:item.market==="excellent"?"soon":item.market==="very tight"?"slow":"normal",hiringDifficulty:roleRecruitingDifficulty(item.role),cultureFit,growthPotential:leadership,skill,leadership,salaryPremium,exceptional:skill>=86&&cultureFit>=65,mediocre:skill<55||cultureFit<42};
}
function queueHiringExceptionEvent(item,type,candidate=null){
  ensureWorkforceEconomySystems();
  if(item.exceptionQueued||openRequestExists("hiring-exception",item.id))return;
  item.status="exception";item.exceptionType=type;item.exceptionQueued=true;if(candidate)item.candidate=candidate;
  const title=type==="salary"?"Hiring salary exception":type==="freeze"?"Hiring freeze review":"Recruiting search failed";
  const message=type==="salary"
    ?`HR found an exceptional ${item.role}, but the candidate exceeds the approved salary band by ${candidate.salaryPremium}%. This is an exception to the approved headcount plan.`
    :type==="freeze"
      ?`Finance warns that runway has narrowed while the approved ${item.role} search is still open. This is not a candidate approval. The CEO needs to decide whether this open role should keep moving, receive temporary coverage, or be closed.`
      :`HR has not found a suitable ${item.role} after ${company.day-(item.searchStartedDay||item.day)} simulated days and ${item.attempts||0} search attempt(s).`;
  const choices=type==="salary"?[
    {title:"Approve salary exception",detail:"Let HR close the exceptional candidate.",effect:{cash:-.35,board:-1,trust:1},directive:"people",days:5,hiringException:{id:item.id,action:"approve-salary"},strategy:"people",benefits:["adds unusually strong talent","supports project execution"],risks:["raises payroll expectations","uses cash"],uncertainty:"Material",estimatedConfidence:68},
    {title:"Offer equity instead",detail:"Use compensation creativity without fully breaking salary band.",effect:{cash:-.12,valuation:-.4,trust:1},directive:"people",days:5,hiringException:{id:item.id,action:"equity-offer"},strategy:"balanced",benefits:["may close candidate with less cash"],risks:["may still fail","dilutes valuation"],uncertainty:"High",estimatedConfidence:56},
    {title:"Stay within budget",detail:"Decline the exception and let HR keep searching.",effect:{board:1},directive:"quality",days:5,hiringException:{id:item.id,action:"continue-search"},strategy:"finance",benefits:["protects salary discipline"],risks:["search may take longer","team remains strained"],uncertainty:"Material",estimatedConfidence:52}
  ]:type==="freeze"?[
    {title:`Continue the ${item.role} search`,detail:"Keep this approved role open despite the tighter runway. HR continues recruiting without asking you to approve individual candidates.",effect:{board:company.finance?.runwayDays<45?-1:0,trust:1},directive:"people",days:6,hiringException:{id:item.id,action:"continue-search"},strategy:"people",benefits:["keeps the capacity plan alive","may relieve the affected team"],risks:["payroll will rise if the role fills","runway may tighten"],uncertainty:"Material",estimatedConfidence:company.finance?.runwayDays>60?64:48},
    {title:"Use temporary contractor coverage",detail:"Buy short-term help while HR keeps searching for the permanent role.",effect:{cash:-.9,board:1},directive:"people",days:8,hiringException:{id:item.id,action:"contractor"},strategy:"balanced",benefits:["relieves workload quickly","keeps the permanent search alive"],risks:["costly temporary solution","contractors do not build long-term capability"],uncertainty:"Material",estimatedConfidence:58},
    {title:`Close the ${item.role} search`,detail:"Cancel this open role and force the department to reprioritize with current staff.",effect:{cash:.05,board:1,quality:-1},directive:"cuts",days:8,hiringException:{id:item.id,action:"cancel-role"},strategy:"cost-control",benefits:["protects runway","prevents a new payroll commitment"],risks:["workload and quality may suffer","the staffing need can return later"],uncertainty:"High",estimatedConfidence:44}
  ]:[
    {title:"Increase salary band",detail:"Give HR more room to close the role.",effect:{cash:-.2,board:-1},directive:"people",days:6,hiringException:{id:item.id,action:"increase-band"},strategy:"people",benefits:["improves close odds"],risks:["raises payroll cost"],uncertainty:"Material",estimatedConfidence:62},
    {title:"Use contractor coverage",detail:"Approve temporary help while HR keeps looking.",effect:{cash:-.9,board:1},directive:"people",days:8,hiringException:{id:item.id,action:"contractor"},strategy:"balanced",benefits:["relieves workload quickly"],risks:["costly temporary solution"],uncertainty:"Material",estimatedConfidence:58},
    {title:"Cancel the open role",detail:"Close the search and force reprioritization.",effect:{cash:.05,board:1,quality:-1},directive:"cuts",days:8,hiringException:{id:item.id,action:"cancel-role"},strategy:"cost-control",benefits:["protects runway"],risks:["workload and quality may suffer"],uncertainty:"High",estimatedConfidence:44}
  ];
  choices.forEach(choice=>{
    if(choice.hiringException){
      choice.hiringException.role=item.role;
      choice.hiringException.department=item.department;
    }
  });
  company.hiringExceptions.unshift({day:company.day,id:item.id,role:item.role,department:item.department,type,status:"queued"});
  company.escalationQueue.push({id:`hiring-exception-${item.id}-${type}-${company.day}`,repeatable:false,category:"people",title,copy:message,generatedCommunication:{type:"HR Exception",priority:"Decision Needed",sender:{name:"People Operations",role:"HR"},subject:`${title} - ${item.role}`,message,recs:[["People",type==="salary"?"Approve only if the role is critical":"Resolve the exception without turning hiring into micromanagement",76],["Finance",company.finance?.runwayDays<75?"Protect runway and salary discipline":"Exception is fundable if strategically important",68],["Department",`The ${teamDisplayName(item.department)} need remains active`,72]],impacts:["CEO approves strategic exceptions only","HR still owns candidate selection","The role may fill, continue, convert, or close"]},choices});
}
function createRecruitingHireEmployee(item,candidate=null){
  const role=canonicalRole(item.role);
  if(!roleDefinition(role))return null;
  const backfill=!!item.backfill;
  const inactiveSlot=backfill?employees.find(e=>!e.active&&canonicalRole(e.role)===role):null;
  const slot=Number.isFinite(inactiveSlot?.id)?inactiveSlot.id:employees.length;
  const replacement=makeEmployee(Math.min(slot,names.length-1));
  replacement.id=slot;
  replacement.name=generateHireName(role);
  replacement.role=role;
  replacement.traits=[...traits[Math.floor(simulationRandom()*traits.length)]];
  replacement.morale=70+simulationRandom()*10;
  replacement.focus=68+simulationRandom()*12;
  replacement.stress=18+simulationRandom()*10;
  replacement.relationship={};replacement.social={};replacement.opinionOfCEO={trust:58,fairness:56,competence:60,support:55,fear:16};replacement.careerLevel=1;replacement.careerHistory=[`${backfill?"Backfilled":"Hired"} as ${role} on day ${company.day}`];replacement.beliefs={};replacement.dailyBriefing=null;replacement.currentIntention=null;replacement.skills=baseSkillsForRole(role);replacement.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999};replacement.learning={caution:0,mentor:0,risk:0,collaboration:0,helpSeeking:0,testing:0,focusWork:0,reporting:0,suppression:0,initiative:0,recovery:0,contextualPreferences:{}};replacement.communication={reportsMade:0,reportsSuppressed:0,helpRequests:0,lastReportDay:-999,lastHelpRequestDay:-999,rumorsShared:0};replacement.knownMessages=[];replacement.actionOutcomeContext=null;replacement.activeCollaboration=null;replacement.activeMeeting=null;replacement.learnedLessons=emptyLessonVector();replacement.lessonAcceptance=null;replacement.joinedDay=company.day;replacement.age=25+Math.floor(simulationRandom()*22);replacement.stayScore=72;replacement.retentionRisk=28;replacement.jobSearchDays=0;replacement.retirementReadiness=0;replacement.quarterlyReview=null;replacement.promotionExpectation=45;replacement.salarySatisfaction=68;replacement.recognitionSatisfaction=62;replacement.employment=defaultEmploymentForRole(role);replacement.retention={stayScore:72,riskLevel:"stable",searching:false,searchDays:0,lastReviewDay:-999,salarySatisfaction:68,careerSatisfaction:62,leadershipFit:58,cultureFit:62};replacement.careerLifecycle={age:replacement.age,yearsAtCompany:0,retirementReadiness:0,earlyRetirementInterest:0,plannedRetirementDay:null,successionRisk:0};replacement.active=true;replacement.offsite=false;replacement.sickDays=0;replacement.action="arriving";replacement.thought="Starting onboarding with the team.";replacement.actionMinutes=0;normalizeEmployeeRoleProfile(replacement);ensureEmployeePersonality(replacement,{force:true,salt:`hire-${company.day}-${role}-${slot}-${item.id||"manual"}`});inheritInstitutionalLearning(replacement);
  employees.forEach(other=>{
    if(other&&other.id!==replacement.id){
      recordSocialEncounter(replacement,other,{type:"onboarding_introduction",gain:1.2,sourceEventId:`onboarding-intro-${replacement.id}-${other.id}-${company.day}`,cooldownMinutes:1440});
    }
  });
  employees[slot]=replacement;
  if(backfill){
    const idx=company.openRoles.indexOf(role);
    if(idx>=0)company.openRoles.splice(idx,1);
  }
  company.log.push(`${replacement.name} joined as ${articleFor(role)} ${role}.`);
  if(!validationMode)buildOffice();
  return replacement;
}
function pruneRecruitingPipeline(){
  const activeStatuses=new Set(["requisition","searching","interviewing","offer","exception","paused-policy"]);
  const active=[],history=[];
  (company.recruitingPipeline||[]).forEach(item=>(activeStatuses.has(item.status)?active:history).push(item));
  company.recruitingPipeline=[...active.slice(0,48),...history.slice(0,16)];
}
function completeRecruitingHire(item,candidate=null){
  ensureWorkforceEconomySystems();
  const hire=createRecruitingHireEmployee(item,candidate);
  if(!hire){
    item.status="searching";item.stage="searching";item.stageStartedDay=company.day;item.dueDay=company.day+stageDaysForRecruiting(item,"searching");
    company.hiringRequestHistory.unshift({day:company.day,role:item.role,department:item.department,status:"hire-create-failed"});
    recordHistory(`HR could not complete the ${item.role||"unknown role"} hire because the role record was invalid; recruiting continued.`,"people",3);
    return;
  }
  if(hire){
    const onboard=onboardingQualityForHire(candidate,item),duration=Math.round(clamp(34-onboard.quality*.18+roleRecruitingDifficulty(item.role)*.05,18,36));
    hire.performanceManagement={stage:"onboarding",coachingAttempts:0,pipAttempts:0,pipStartDay:null,pipDueDay:null,lastActionDay:company.day,documentedIssues:0,improvementScore:0,hrReviewed:false,terminationEligible:false};
    hire.onboarding={startDay:company.day,duration,quality:Math.round(onboard.quality),mentorId:onboard.mentor?.id??null,productivity:20,projectId:item.project?.id||null};
    if(onboard.mentor){onboard.mentor.onboardingMentorUntil=company.day+Math.min(duration,18);addMemory(onboard.mentor,"MENTORING",`I am helping onboard ${hire.name}.`,"neutral",8,hire.name);}
    hire.focus=clamp((candidate?.skill??70)-8,42,92);applyEmployeeEmotionDelta(hire,{moraleDelta:clamp(66+(candidate?.cultureFit??60)*.18,55,88)-(hire.morale||60),reasonCode:"onboarding-start",sourceEventId:`onboarding-${hire.id}-${company.day}`,ignoreCooldown:true});
    hire.skills={...hire.skills};Object.keys(hire.skills).forEach(k=>hire.skills[k]=clamp((hire.skills[k]||50)+((candidate?.skill??65)-65)*.15,20,95));
    hire.careerHistory.unshift(`Selected by HR from a ${item.market} candidate market on day ${company.day}; onboarding quality ${Math.round(onboard.quality)}.`);
  }
  item.status="accepted";item.filledDay=company.day;item.candidate=candidate||item.candidate;
  recordWeeklyEvent(`HR hired a ${item.role} after recruiting.`,"people",4);
  recordHistory(`HR filled the approved ${item.role} role from a ${item.market} market.`,"people",4);
  pruneRecruitingPipeline();
}
function processRecruitingPipeline(){
  ensureWorkforceEconomySystems();
  for(const item of company.recruitingPipeline.filter(r=>["requisition","searching","interviewing","offer"].includes(r.status)&&company.day>=r.dueDay)){
    const elapsed=company.day-(item.searchStartedDay||item.day);
    if(item.status==="requisition"){
      advanceRecruitingStage(item,"searching");
      recordHistory(`HR opened the ${item.role} requisition${item.project?` for ${item.project.title}`:""}.`,"people",2);
      continue;
    }
    if(item.status==="searching"){
      item.attempts=(item.attempts||0)+1;
      const candidate=generateRecruitingCandidate(item);
      if(candidate.mediocre&&((validationMode&&candidate.forceRetry)||simulationRandom()<.55)){
        if(elapsed>=90||(item.attempts||0)>=5){company.hiringRequestHistory.unshift({day:company.day,role:item.role,department:item.department,status:"search-exception"});queueHiringExceptionEvent(item,"failed-search",candidate);}
        else{item.dueDay=company.day+stageDaysForRecruiting(item,"searching");company.hiringRequestHistory.unshift({day:company.day,role:item.role,department:item.department,status:"search-continued"});recordHistory(`HR kept searching for ${item.role} after a weak candidate screen.`,"people",2);}
        continue;
      }
      item.candidate=candidate;advanceRecruitingStage(item,"interviewing");recordHistory(`HR moved a ${item.role} candidate into interviews.`,"people",2);continue;
    }
    if(item.status==="interviewing"){
      const candidate=item.candidate||generateRecruitingCandidate(item);
      if(candidate.exceptional&&candidate.salaryPremium>=12&&company.cash>4){queueHiringExceptionEvent(item,"salary",candidate);continue;}
      if(candidate.mediocre&&simulationRandom()<.35){item.candidate=null;advanceRecruitingStage(item,"searching");recordHistory(`The ${item.role} interview loop did not produce a strong finalist.`,"people",2);continue;}
      advanceRecruitingStage(item,"offer");recordHistory(`HR prepared an offer for a ${item.role} finalist.`,"people",3);continue;
    }
    if(item.status==="offer"){
      const candidate=item.candidate||generateRecruitingCandidate(item);
      const acceptChance=clamp(.52+(recruitingHealthScore(item)-50)*.006+(candidate.skill-60)*.004+(candidate.cultureFit-55)*.003+((item.salaryCompetitiveness??65)-60)*.004-(company.unpaidPayrollDays||0)*.12-(item.competition||45)*.0015-(candidate.salaryPremium||0)*.006,0.16,.92);
      if(!candidate.mediocre&&simulationRandom()<acceptChance){completeRecruitingHire(item,candidate);}
      else if(elapsed>=90||(item.attempts||0)>=5){item.declines=(item.declines||0)+1;company.hiringRequestHistory.unshift({day:company.day,role:item.role,department:item.department,status:"offer-failed"});queueHiringExceptionEvent(item,"failed-search",candidate);}
      else{item.declines=(item.declines||0)+1;item.candidate=null;advanceRecruitingStage(item,"searching");recordHistory(`A ${item.role} candidate declined or stalled; HR restarted search.`,"people",3);}
    }
  }
  pruneRecruitingPipeline();
}
function maybeQueueHiringFreezeException(){
  ensureWorkforceEconomySystems();
  if(company.day<12||company.day%6!==0)return;
  if((company.finance?.runwayDays||999)>62&&company.cash>6)return;
  const item=(company.recruitingPipeline||[]).find(r=>r.status==="searching"&&!r.freezeReviewed&&company.day-(r.searchStartedDay||r.day)>4);
  if(!item)return;
  item.freezeReviewed=true;
  queueHiringExceptionEvent(item,"freeze",item.candidate||null);
}
function applyHiringExceptionDecision(x){
  if(!x)return;
  ensureWorkforceEconomySystems();
  const item=(company.recruitingPipeline||[]).find(r=>r.id===x.id);
  if(!item)return;
  item.exceptionQueued=false;
  const candidate=item.candidate||generateRecruitingCandidate(item);
  if(x.action==="approve-salary"){
    const premium=(candidate.salaryPremium||12)/100;
    completeRecruitingHire(item,candidate);
    const hire=employees.find(e=>e.active&&e.role===item.role&&e.joinedDay===company.day);
    if(hire){hire.employment.annualSalary=Number((hire.employment.annualSalary*(1+premium)).toFixed(3));hire.salarySatisfaction=clamp((hire.salarySatisfaction||65)+8,0,100);}
    reinforceWorkforceLesson("hiringTiming",.8,`CEO approved salary exception for ${item.role}`,6);
  }else if(x.action==="equity-offer"){
    if(simulationRandom()<.68){completeRecruitingHire(item,candidate);company.valuation=clamp(company.valuation-.4,0,999);}
    else{item.status="searching";item.stage="searching";item.stageStartedDay=company.day;item.dueDay=company.day+stageDaysForRecruiting(item,"searching");recordHistory(`The ${item.role} candidate declined an equity-heavy offer.`,"people",3);}
  }else if(x.action==="continue-search"){
    item.status="searching";item.stage="searching";item.stageStartedDay=company.day;item.dueDay=company.day+stageDaysForRecruiting(item,"searching");item.candidate=null;
    recordHistory(`HR continued the ${item.role} search within the approved budget.`,"people",3);
  }else if(x.action==="increase-band"){
    item.status="searching";item.stage="searching";item.stageStartedDay=company.day;item.salaryCompetitiveness=clamp((item.salaryCompetitiveness||60)+12,0,100);item.salaryInflation=clamp((item.salaryInflation||0)+8,0,35);item.dueDay=company.day+stageDaysForRecruiting(item,"searching");
    company.cash=clamp(company.cash-.12,0,999);recordHistory(`CEO increased the salary band for ${item.role}.`,"people",4);
  }else if(x.action==="contractor"){
    item.contractorCoverageUntil=company.day+30;item.contractorCoverage=true;item.status="searching";item.stage="searching";item.stageStartedDay=company.day;item.dueDay=company.day+stageDaysForRecruiting(item,"searching");company.finance.contractorDaily=Number(company.finance.contractorDaily||0)+.018;
    employees.filter(e=>e.active&&roleDepartment(e.role)===item.department).forEach(e=>applyEmployeeEmotionDelta(e,{stressDelta:-4,moraleDelta:1,reasonCode:"hiring-exception-approved",sourceEventId:item.id||`hire-${company.day}`,ignoreCooldown:true}));
    recordHistory(`Contractor coverage was approved while HR continued ${item.role} recruiting.`,"people",4);
  }else if(x.action==="cancel-role"){
    item.status="canceled";item.closedDay=company.day;
    company.hiringRequests=(company.hiringRequests||[]).filter(r=>!(r.role===item.role&&r.department===item.department&&company.day-(r.day||0)<45));
    employees.filter(e=>e.active&&roleDepartment(e.role)===item.department).forEach(e=>applyEmployeeEmotionDelta(e,{stressDelta:3,moraleDelta:-2,reasonCode:"hiring-exception-denied",sourceEventId:item.id||`hire-${company.day}`,ignoreCooldown:true}));
    recordHistory(`CEO canceled the open ${item.role} search and asked the department to reprioritize.`,"people",4);
  }
  const rec=(company.hiringExceptions||[]).find(e=>e.id===x.id&&e.status==="queued");
  if(rec)rec.status="resolved";
}
function applyHiringPolicyDecision(x){
  if(!x)return;
  ensureWorkforceEconomySystems();
  const previous=company.hiringPolicy?.mode||"normal";
  const mode=["normal","critical-only","frozen"].includes(x.mode)?x.mode:"normal";
  company.hiringPolicy={...company.hiringPolicy,mode,setDay:company.day,reviewDay:company.day+(x.reviewDays||45),reason:x.reason||"CEO hiring policy review",approvedRoleIds:Array.isArray(company.hiringPolicy?.approvedRoleIds)?company.hiringPolicy.approvedRoleIds:[]};
  company.hiringPolicyHistory.unshift({day:company.day,previous,mode,reason:company.hiringPolicy.reason,reviewDay:company.hiringPolicy.reviewDay});
  applyHiringPolicyToRecruiting();
  if(mode==="frozen"){
    employees.filter(e=>e.active).forEach(e=>{applyEmployeeEmotionDelta(e,{moraleDelta:-1.5,stressDelta:1.5,reasonCode:"hiring-freeze",sourceEventId:`hiring-policy-${company.day}`,ignoreCooldown:true});adjustCEOOpinion(e,{support:-1,trust:-.5});});
    reinforceWorkforceLesson("hiringTiming",-.4,"CEO froze ordinary hiring",5);
  }else if(mode==="critical-only"){
    reinforceWorkforceLesson("hiringTiming",.2,"CEO restricted hiring to critical roles",4);
  }else{
    employees.filter(e=>e.active).forEach(e=>applyEmployeeEmotionDelta(e,{moraleDelta:1,reasonCode:"hiring-policy-normal",sourceEventId:`hiring-policy-${company.day}`,ignoreCooldown:true}));
    reinforceWorkforceLesson("hiringTiming",.4,"CEO continued evidence-based hiring",4);
  }
  recordWeeklyEvent(`Hiring policy changed to ${hiringPolicyLabel()}.`,"people",4);
  recordHistory(`CEO set hiring policy to ${hiringPolicyLabel()}: ${company.hiringPolicy.reason}.`,"leadership",4);
}
function maybeQueueHiringPolicyReview(){
  ensureWorkforceEconomySystems();updateStaffingModel();
  const policy=company.hiringPolicy||{mode:"normal"};
  if(policy.mode==="normal")return;
  if(openRequestExists("hiring-policy-review",""))return;
  const overdue=policy.reviewDay&&company.day>=policy.reviewDay;
  const delayedProjects=(company.projects||[]).filter(p=>p.status==="active"&&(p.visibleRisk||p.performance?.risk||0)>72).length;
  const paused=(company.recruitingPipeline||[]).filter(r=>r.status==="paused-policy").length;
  const strain=policy.mode==="frozen"&&company.day-(policy.setDay||0)>12&&(delayedProjects>=2||paused>=2||avgStress()>72);
  if(overdue||strain)company.escalationQueue.push(makeHiringPolicyReviewEvent(overdue?"Scheduled policy review":"Board requested early hiring policy review"));
}
function openRequestExists(kind,key){
  return (company.escalationQueue||[]).some(ev=>ev.id&&String(ev.id).includes(kind)&&String(ev.id).includes(key))||company.pendingEvent?.id&&String(company.pendingEvent.id).includes(kind)&&String(company.pendingEvent.id).includes(key);
}
function makeHiringRequestEvent(dept,st){
  const role=roleForHiringNeed(dept),annualCost=defaultEmploymentForRole(role).annualSalary*1.34;
  const hist=company.hiringNeedHistory?.[dept]||{},confidence=Math.round(hist.confidence||62),needScore=Math.round(hist.lastScore||hiringNeedScore(dept,st));
  const narrative=hiringNeedNarrative(dept,st,role);
  const reasons=narrative.evidence;
  const runwayImpact=Math.max(1,Math.round(annualCost/365/Math.max(.001,Math.abs(company.finance?.netCashFlowDaily||-.01))));
  const confidenceLabel=qualitativeBand(confidence,{low:45,high:75,lowText:"early",midText:"credible",highText:"strong"});
  return {id:`hiring-request-${dept}-${company.day}`,repeatable:false,category:"people",title:`Hiring request: ${role}`,copy:`${narrative.reason} Estimated annual employment cost is about $${annualCost.toFixed(2)}M.`,hiringRequest:{department:dept,role,requestedCount:1,confidence,reasons,financeAssessment:`Runway impact is about ${runwayImpact} ${runwayImpact===1?"day":"days"} under current cash flow`,operationalImpact:`Staffing pressure is ${qualitativeBand(needScore,{low:55,high:82,lowText:"manageable",midText:"material",highText:"critical"})}; ${reasons.slice(0,2).join("; ")}`,successionImpact:"Improves coverage if current staff leave or retire"},generatedCommunication:{type:"Hiring Request",priority:"Decision Needed",sender:{name:"People and Finance Review",role:"Operating Council"},subject:`Hiring Request - ${role}`,message:`${narrative.reason} People and Finance reviewed the request against workload, staffing range, project demand, succession risk, skills, and runway. The staffing case is ${confidenceLabel}. Evidence: ${reasons.slice(0,3).join("; ")}.`,recs:[[teamDisplayName(dept),`Approve the position because ${reasons[0]||"capacity risk is rising"}`,confidence],["Finance",(company.finance?.runwayDays||999)<75?"Delay until runway improves":"Fundable if growth remains controlled",Math.max(45,80-Math.max(0,90-(company.finance?.runwayDays||999)))],["People","Candidate market and retention pressure support action",72],["Board",needScore>88?"Approve if cash discipline remains visible":"Monitor payroll impact",64]],impacts:["Recruiting starts after approval","Payroll increases only after a candidate joins","Onboarding temporarily slows output","Capability and retention may improve"]},choices:[
    {title:"Approve position",detail:"Authorize this role and let HR open recruiting.",effect:{board:1},directive:"people",days:8,people:{stress:-2,morale:2},hire:"specialist",hireRole:role,hireDept:dept,opinion:{support:2,trust:1},strategy:"people",benefits:["opens the role without CEO candidate review","may reduce workload pressure","improves succession depth"],risks:["raises payroll after joining","candidate may decline","runway shortens later"],uncertainty:"Material",estimatedConfidence:confidence},
    {title:"Delay position",detail:"Revisit the headcount request next quarter while the team manages workload.",effect:{board:1},directive:"quality",days:6,people:{stress:2,morale:-1},deferHiring:{dept,role},opinion:{fairness:-1},strategy:"finance",benefits:["protects runway","keeps flexibility"],risks:["backlog may grow","retention may worsen"],uncertainty:"Material",estimatedConfidence:54},
    {title:"Reject and reprioritize",detail:"Decline the position and ask the department to reduce scope instead.",effect:{cash:.05,board:2,quality:-1},directive:"cuts",days:8,people:{stress:4,morale:-3},rejectHiring:{dept,role},opinion:{support:-2,trust:-1},strategy:"cost-control",benefits:["protects cash","forces focus"],risks:["trust may decline","workload may rise","quality can suffer"],uncertainty:"High",estimatedConfidence:44}
  ]};
}
function internalTransferCandidate(targetDept){
  ensureWorkforceEconomySystems();updateStaffingModel();
  const overstaffed=Object.entries(company.staffingModel||{}).filter(([dept,st])=>dept!==targetDept&&st.overstaffed).map(([dept])=>dept);
  return employees.filter(e=>e.active&&overstaffed.includes(roleDepartment(e.role))&&!e.onboarding&&e.stress<72).map(e=>{
    const skills=Object.values(e.skills||{}),skill=Math.max(...skills,40),fit=clamp(skill*.45+(e.learning?.helpSeeking||0)*2+(e.morale||60)*.18-(e.stress||40)*.15,0,100);
    return {e,fit,from:roleDepartment(e.role)};
  }).sort((a,b)=>b.fit-a.fit)[0]||null;
}
function attemptInternalStaffingSolution(dept,st){
  const candidate=internalTransferCandidate(dept);
  if(!candidate||candidate.fit<54)return false;
  const e=candidate.e,from=candidate.from,role=roleForHiringNeed(dept);
  company.internalTransfers=Array.isArray(company.internalTransfers)?company.internalTransfers:[];
  company.internalTransfers.unshift({day:company.day,employeeId:e.id,name:e.name,fromDepartment:from,toDepartment:dept,targetRole:role,type:candidate.fit>68?"temporary assignment":"cross-training",fit:Math.round(candidate.fit),status:"active"});
  e.temporaryAssignment={fromDepartment:from,toDepartment:dept,targetRole:role,startDay:company.day,duration:candidate.fit>68?18:32,productivity:clamp(candidate.fit/100,.35,.85)};
  applyEmployeeEmotionDelta(e,{stressDelta:4,moraleDelta:candidate.fit>68?1:-1,reasonCode:"interview-load",sourceEventId:`interview-${item.id||company.day}`,ignoreCooldown:true});
  addMemory(e,"TRANSFER",`I was asked to help ${teamDisplayName(dept)} before the company opened a new role.`,"neutral",10,"People Operations");
  company.hiringRequestHistory.unshift({day:company.day,role,department:dept,status:"local-transfer",reason:`${e.name} temporarily assigned from ${teamDisplayName(from)}`,confidence:Math.round(candidate.fit)});
  recordHistory(`${teamDisplayName(dept)} tried a local staffing fix: ${e.name} was assigned from ${teamDisplayName(from)} before asking for external hiring.`,"people",3);
  reinforceWorkforceLesson("workloadBalancing",.4,`Internal transfer attempted for ${teamDisplayName(dept)}`,4);
  return true;
}
function processInternalTransfersDaily(){
  ensureWorkforceEconomySystems();
  (company.internalTransfers||[]).forEach(t=>{
    if(t.status!=="active")return;
    const e=employees.find(x=>x.id===t.employeeId);
    const age=company.day-(t.day||company.day);
    if(e?.active){
      e.focus=clamp(e.focus-.8,0,100);
      applyEmployeeEmotionDelta(e,{stressDelta:.35,reasonCode:"temporary-assignment",sourceEventId:`temp-${e.id}-${company.day}`,ignoreCooldown:true});
      if(e.temporaryAssignment)e.temporaryAssignment.productivity=clamp((e.temporaryAssignment.productivity||.45)+.015,.35,.90);
    }
    if(age>=(e?.temporaryAssignment?.duration||24)){
      t.status="completed";t.completedDay=company.day;
      if(e){e.temporaryAssignment=null;applyEmployeeEmotionDelta(e,{moraleDelta:1,reasonCode:"temporary-assignment-complete",sourceEventId:`temp-${e.id}-${company.day}`,ignoreCooldown:true});}
      recordHistory(`${t.name}'s ${t.type} support for ${teamDisplayName(t.toDepartment)} ended after ${age} ${age===1?"day":"days"}.`,"people",2);
    }
  });
}
function maybeQueueHiringRequests(){
  ensureWorkforceEconomySystems();
  updateHiringNeedHistory();
  if(company.day<6||company.day%5!==0)return;
  const candidate=Object.entries(company.staffingModel||{}).filter(([dept,st])=>{
    const h=company.hiringNeedHistory?.[dept]||{};
    return h.lastScore>=85&&h.days>=3&&h.confidence>=62&&!st.overstaffed;
  }).sort((a,b)=>(company.hiringNeedHistory?.[b[0]]?.lastScore||0)-(company.hiringNeedHistory?.[a[0]]?.lastScore||0))[0];
  if(!candidate)return;
  const [dept,st]=candidate;
  const role=roleForHiringNeed(dept),hist=company.hiringNeedHistory?.[dept]||{};
  const policy=hiringPolicyAllows(dept,st,role);
  if(!policy.allowed){
    recordSuppressedHiringNeed(dept,role,policy.reason,hist.lastScore||0,hist.confidence||0);
    return;
  }
  if(openRequestExists("hiring-request",dept))return;
  if((company.hiringRequests||[]).some(r=>r.department===dept&&company.day-(r.day||0)<28))return;
  if(attemptInternalStaffingSolution(dept,st))return;
  company.hiringRequests.unshift({day:company.day,department:dept,role,status:"queued",score:hist.lastScore||0,confidence:hist.confidence||0,critical:policy.critical});
  company.escalationQueue.push(makeHiringRequestEvent(dept,st));
}
function selectLayoffCandidates(targetCount=1){
  const active=employees.filter(e=>e.active);
  return active.map(e=>({e,score:(dailyEmploymentCost(e)*900)+(e.performance?.recentOutput||0)*-1+(e.retentionRisk||0)*.1+(roleDepartment(e.role)==="people"?3:0)})).sort((a,b)=>b.score-a.score).slice(0,targetCount).map(x=>x.e);
}
function executeLayoffPlan(count=1,voluntary=false){
  ensureWorkforceEconomySystems();
  const affected=selectLayoffCandidates(count);
  let severance=0;
  affected.forEach(e=>{
    const weekly=(e.employment?.annualSalary||.15)/52,weeks=clamp(2+Math.max(0,((company.day-(e.joinedDay||0))/365))*1.5,2,26);
    severance+=weekly*weeks+.018;
    e.active=false;e.offsite=true;e.action=voluntary?"voluntary separation":"laid off";
    e.careerHistory.push(`${voluntary?"Separated voluntarily":"Laid off"} on day ${company.day}`);
  });
  company.cash-=severance;
  company.layoffHistory.unshift({day:company.day,count:affected.length,severance:Number(severance.toFixed(3)),names:affected.map(e=>e.name)});
  employees.filter(e=>e.active).forEach(e=>{applyEmployeeEmotionDelta(e,{moraleDelta:-(voluntary?3:8),reasonCode:"layoff-survivor-effect",sourceEventId:`layoff-${company.day}`,ignoreCooldown:true});e.stayScore=clamp((e.stayScore||70)-(voluntary?2:6),0,100);e.layoffSurvivorMemory=(e.layoffSurvivorMemory||0)+(voluntary?1:3);adjustCEOOpinion(e,{trust:voluntary?-1:-5,fairness:voluntary?-1:-6,fear:voluntary?2:7,support:voluntary?-1:-5});addMemory(e,"LAYOFFS","The company reduced staff to protect runway.","negative",14,"company");});
  company.board=clamp(company.board+(voluntary?1:3),0,100);company.trust=clamp(company.trust-(voluntary?.5:1.5),0,100);company.organizationalMomentum.turnover=clamp((company.organizationalMomentum.turnover||0)+affected.length*10,-100,100);
  reinforceWorkforceLesson("layoffCaution",voluntary?.6:1,`${affected.length} employee(s) left through ${voluntary?"voluntary separation":"layoffs"}`,7);
  reinforceWorkforceLesson("retention",voluntary?-.3:-.8,`Survivors reacted to ${voluntary?"voluntary separation":"layoffs"}`,5);
  recordWeeklyEvent(`${affected.length} employee(s) left through ${voluntary?"a voluntary separation plan":"layoffs"}.`,"people",6);
  recordHistory(`${affected.length} employee(s) left through ${voluntary?"voluntary separation":"layoffs"} with $${severance.toFixed(2)}M severance cost.`,"people",6);
  if(!validationMode)buildOffice();
}
function makeRestructuringEvent(){
  const over=Object.entries(company.staffingModel||{}).filter(([,st])=>st.overstaffed).map(([d])=>d);
  const target=Math.max(1,Math.min(2,Math.ceil(employees.filter(e=>e.active).length*.12)));
  const runwayDays=company.finance.runwayDays;
  return {id:`restructuring-${company.day}`,repeatable:false,category:"board",title:"Board restructuring request",copy:`Finance and the board recommend reducing payroll pressure by ${target} ${target===1?"role":"roles"}.`,generatedCommunication:{type:"Board Request",priority:"Decision Needed",sender:{name:"Board Compensation Committee",role:"Board"},subject:"Workforce Restructuring Recommendation",message:`The Board is asking for a workforce cost decision because net cash flow is $${company.finance.netCashFlowDaily.toFixed(3)}M/day and runway is ${runwayDays} ${runwayDays===1?"day":"days"}. This is not a request to choose individual employees; it is a decision about whether to reduce payroll, offer voluntary separation, or reject cuts and absorb the financial pressure.`,recs:[["Board","Improve runway and show cost discipline",82],["Finance","Severance costs cash immediately but lowers daily payroll",76],["People","Use the least harmful path if cuts are unavoidable",70]],impacts:["Payroll can fall after severance","Morale and trust may decline","Retention risk can rise among survivors"]},choices:[
    {title:"Reduce payroll by cutting roles",detail:`Authorize the organization to select ${target} role(s) for reduction.`,effect:{board:3,trust:-1},directive:"cuts",days:10,layoff:{count:target,voluntary:false},people:{stress:5,morale:-7},strategy:"cost-control",benefits:["reduces payroll","improves runway after severance"],risks:["immediate severance cost","survivor morale damage","knowledge loss"],uncertainty:"High",estimatedConfidence:52},
    {title:"Offer voluntary separation",detail:"Spend more time and reduce harm, but savings are less certain.",effect:{board:1,trust:-.5},directive:"people",days:10,layoff:{count:1,voluntary:true},people:{stress:2,morale:-3},strategy:"people",benefits:["less cultural damage","can still lower payroll"],risks:["savings may be smaller","still costs severance"],uncertainty:"Material",estimatedConfidence:58},
    {title:"Reject workforce cuts for now",detail:"Accept board pressure and try to grow through the problem.",effect:{board:-5,trust:1},directive:"revenue",days:10,people:{stress:3,morale:1},rejectLayoff:true,strategy:"revenue",benefits:["protects knowledge","preserves morale"],risks:["board may issue a strike","cash pressure remains"],uncertainty:"High",estimatedConfidence:42}
  ],overstaffed:over};
}
function maybeQueueRestructuringRequest(){
  ensureWorkforceEconomySystems();
  if(company.day<20||company.day%7!==0)return;
  const badRunway=(company.finance?.runwayDays||999)<35&&company.finance?.netCashFlowDaily<-.04;
  const overstaffed=Object.values(company.staffingModel||{}).some(st=>st.overstaffed);
  if(!badRunway&&!overstaffed)return;
  if(openRequestExists("restructuring",String(company.day).slice(0,-1)))return;
  if((company.restructuringRequests||[]).some(r=>company.day-(r.day||0)<35))return;
  company.restructuringRequests.unshift({day:company.day,status:"queued",reason:badRunway?"runway":"overstaffing"});
  company.escalationQueue.push(makeRestructuringEvent());
}
function addBoardStrike(reason,failureCode=null){
  ensureWorkforceEconomySystems();
  if(company.day-(company.boardGovernance.lastStrikeDay||-999)<14)return;
  company.boardGovernance.strikes=clamp((company.boardGovernance.strikes||0)+1,0,3);
  company.boardGovernance.lastStrikeDay=company.day;
  if(failureCode)company.lastBoardStrikeFailureCode=failureCode;
  company.board=clamp(company.board-6,0,100);
  addValuationShock?.(-1.4,`Board strike: ${reason}`,"board-strike",35);
  recordHistory(`Board strike ${company.boardGovernance.strikes}: ${reason}`,"board",6);
  recordWeeklyEvent(`The board issued a strike: ${reason}.`,"board",6);
  company.log.push(`Board strike ${company.boardGovernance.strikes}: ${reason}`);
}
function maybeIssueOrEvaluatePip(){
  ensureWorkforceEconomySystems();
  const g=company.boardGovernance,f=company.finance||{};
  if(g.pipActive&&company.day>=g.pipDeadlineDay){
    const t=g.pipTargets||{},failed=(company.cash<(t.minimumCash??0))||company.board<(t.minimumBoard??0)||company.trust<(t.minimumTrust??0)||f.netCashFlowDaily<(t.maximumNetDailyLoss??-999);
    if(failed){addBoardStrike("CEO PIP targets were missed","CEO_PIP_FAILURE");g.pipActive=false;}
    else{g.pipActive=false;g.consecutivePoorQuarters=0;company.board=clamp(company.board+8,0,100);recordHistory("CEO PIP was completed successfully.","board",5);}
  }else if(!g.pipActive&&(g.strikes>=1||company.board<32)&&company.day-(g.lastPipOfferedDay||-999)>60){
    const snapshot=buildExecutiveIntelligenceSnapshot(),risk=snapshot.topRisks?.[0];
    g.pipActive=true;g.pipStartDay=company.day;g.pipDeadlineDay=company.day+91;g.lastPipOfferedDay=company.day;
    g.pipTargets={minimumCash:6,minimumBoard:36,minimumTrust:38,maximumNetDailyLoss:-.06};
    recordHistory(`The board issued a CEO performance improvement plan${risk?` after reviewing ${risk.title}`:""}.`,"board",6);
    company.escalationQueue.push({id:`board-pip-${company.day}`,repeatable:false,category:"board",title:"CEO Performance Improvement Plan",copy:"The board has issued a performance improvement plan for the next quarter.",generatedCommunication:{type:"Board Letter",priority:"Urgent",sender:{name:"Board of Directors",role:"Board"},subject:"CEO Performance Improvement Plan",message:`The board expects improved cash, confidence, trust, and net daily loss by the next quarterly review.${risk?` The Board is also concerned about ${risk.title}.`:""}`,recs:[["Board","Meet the PIP targets within one quarter",90],["Finance","Protect runway and reduce daily loss",78],["People","Avoid solving cash by destroying retention",70]],impacts:["Missing the PIP creates a board strike","Success restores board confidence","The CEO remains under review"].concat(risk?[risk.detail||risk.title]:[])},choices:[{title:"Accept the PIP",detail:"Commit to the board targets.",effect:{board:1},directive:"quality",days:8,strategy:"balanced"},{title:"Challenge the targets",detail:"Ask the board for flexibility and accept credibility risk.",effect:{board:-2,trust:1},directive:"people",days:6,strategy:"people"},{title:"Make a cost-first pledge",detail:"Prioritize runway even if morale suffers.",effect:{board:2},directive:"cuts",days:10,people:{stress:3,morale:-2},strategy:"cost-control"}]});
  }
}
function ensureLeadershipSystems(){
  if(!company)return;
  company.leadership={qualityFocus:55,speedFocus:50,innovation:55,employeeWellbeing:55,financialDiscipline:55,customerFocus:55,transparency:55,riskTolerance:50,accountability:55,longTermThinking:55,...(company.leadership||{})};
  company.organizationalMomentum={burnout:0,turnover:0,innovation:0,trust:0,execution:0,financial:0,culture:0,...(company.organizationalMomentum||{})};
  company.quarterlyReviews=Array.isArray(company.quarterlyReviews)?company.quarterlyReviews:[];
  company.annualReviews=Array.isArray(company.annualReviews)?company.annualReviews:[];
  company.crisisRiskDays={burnout:0,financial:0,product:0,reputation:0,leadership:0,staffing:0,operational:0,...(company.crisisRiskDays||{})};
  employees.forEach((e,i)=>{
    e.age=Number.isFinite(e.age)?e.age:28+i*4;
    e.stayScore=Number.isFinite(e.stayScore)?e.stayScore:72;
    e.retentionRisk=Number.isFinite(e.retentionRisk)?e.retentionRisk:28;
    e.jobSearchDays=Number(e.jobSearchDays)||0;
    e.retirementReadiness=Number(e.retirementReadiness)||0;
    e.promotionExpectation=Number.isFinite(e.promotionExpectation)?e.promotionExpectation:45;
    e.salarySatisfaction=Number.isFinite(e.salarySatisfaction)?e.salarySatisfaction:65;
    e.recognitionSatisfaction=Number.isFinite(e.recognitionSatisfaction)?e.recognitionSatisfaction:60;
  });
}
function adjustLeadership(delta={}){
  ensureLeadershipSystems();
  Object.entries(delta).forEach(([k,v])=>company.leadership[k]=clamp((company.leadership[k]||50)+v,0,100));
}
function leadershipDeltaForChoice(choice){
  const strategy=choice.strategy||inferDecisionStrategy(choice);
  const map={
    quality:{qualityFocus:2,longTermThinking:1,accountability:1,speedFocus:-1},
    pilot:{qualityFocus:1.5,longTermThinking:1.5,riskTolerance:-.5,customerFocus:1},
    speed:{speedFocus:2,riskTolerance:1,qualityFocus:-.7,employeeWellbeing:-.5},
    people:{employeeWellbeing:2,transparency:1,longTermThinking:.7},
    "cost-control":{financialDiscipline:2,employeeWellbeing:-1,transparency:-.3},
    finance:{financialDiscipline:2,longTermThinking:.8},
    revenue:{customerFocus:2,speedFocus:.7,financialDiscipline:.5},
    innovation:{innovation:2,riskTolerance:1,longTermThinking:1},
    balanced:{accountability:.6,transparency:.5}
  };
  const d={...(map[strategy]||map.balanced)};
  if(choice.performance==="fire"){d.accountability=(d.accountability||0)+1;d.employeeWellbeing=(d.employeeWellbeing||0)-2;d.transparency=(d.transparency||0)-.5;}
  if(choice.performance==="coach"){d.employeeWellbeing=(d.employeeWellbeing||0)+1.5;d.accountability=(d.accountability||0)+.5;}
  if(choice.launch==="full"){d.riskTolerance=(d.riskTolerance||0)+1;d.speedFocus=(d.speedFocus||0)+1;}
  return d;
}
function applyLeadershipFootprint(ev,choice){
  ensureLeadershipSystems();
  if(choice?.commercializeProject)applyProjectCommercializationDecision(choice.commercializeProject);
  const delta=leadershipDeltaForChoice(choice);
  adjustLeadership(delta);
  const strategy=choice.strategy||inferDecisionStrategy(choice);
  employees.filter(e=>e.active).forEach(e=>{
    const team=employeeTeam(e);
    let opinion={};
    if(strategy==="people")opinion={support:2.2,fairness:1.2,trust:1};
    if(strategy==="quality"||strategy==="pilot")opinion={competence:1.5,trust:team==="hardware"||team==="software"?1.2:.3};
    if(strategy==="speed")opinion={competence:.5,support:-1,trust:e.stress>65?-1.2:-.2,fear:.5};
    if(strategy==="cost-control")opinion={support:-1.5,fairness:-.8,fear:1.2,trust:-.5};
    if(strategy==="finance")opinion={competence:1,trust:.3};
    if(strategy==="innovation")opinion={competence:.8,support:.5};
    adjustCEOOpinion(e,opinion);
  });
  company.organizationalMomentum.culture=clamp(company.organizationalMomentum.culture+(delta.employeeWellbeing||0)*.08+(delta.transparency||0)*.06,-100,100);
  company.organizationalMomentum.innovation=clamp(company.organizationalMomentum.innovation+(delta.innovation||0)*.1,-100,100);
  company.organizationalMomentum.financial=clamp(company.organizationalMomentum.financial+(delta.financialDiscipline||0)*.1,-100,100);
}
function updateOrganizationalMomentum(){
  ensureLeadershipSystems();
  const active=employees.filter(e=>e.active);
  const morale=active.reduce((s,e)=>s+e.morale,0)/Math.max(1,active.length);
  const avgStay=active.reduce((s,e)=>s+(e.stayScore||70),0)/Math.max(1,active.length);
  const completed=(company.workItems||[]).filter(w=>w.progress>=100).length;
  const blocked=(company.workItems||[]).filter(w=>(w.blockedBy||[]).length>0&&w.progress<100).length;
  const target={
    burnout:clamp((avgStress()-55)*1.8+(company.leadership.employeeWellbeing<45?12:0),-40,80),
    turnover:clamp((55-avgStay)*1.5+(8-active.length)*8,-40,90),
    innovation:clamp((company.leadership.innovation-50)*1.1+(company.culture?.innovation-50)*.7,-60,80),
    trust:clamp((company.trust-55)*1.2+(company.leadership.transparency-50)*.5,-70,70),
    execution:clamp((company.integration-45)*.6+(company.quality-50)*.4+completed*2-blocked*4,-70,80),
    financial:clamp((company.cash-8)*2+(company.dailyRevenue-.24*company.costEfficiency)*40,-80,90),
    culture:clamp((morale-55)+(company.leadership.employeeWellbeing-50)*.5-(company.culture?.politics||25)*.25,-70,75)
  };
  Object.keys(target).forEach(k=>company.organizationalMomentum[k]=clamp(company.organizationalMomentum[k]*.88+target[k]*.12,-100,100));
}
function employeeStayScore(e){
  ensureLeadershipSystems();
  const ceo=e.opinionOfCEO||{};
  const team=company.teams?.[employeeTeam(e)]||{};
  const tenure=Math.max(0,company.day-(e.joinedDay||0));
  const growth=(e.careerLevel||1)*7+(e.achievements||0)*2+(e.recognitionSatisfaction||60)*.18;
  const pressure=e.stress*.34+(team.pressure||30)*.16+(company.organizationalMomentum.burnout||0)*.12;
  const leadership=(ceo.trust||55)*.18+(ceo.fairness||55)*.13+(ceo.support||55)*.13+(company.leadership.employeeWellbeing||50)*.12;
  const belonging=clamp(e.emotionalState?.belonging??e.morale??50,0,100)*.12+(team.cohesion||55)*.1;
  const security=(e.salarySatisfaction||65)*.08+(company.board||50)*.06+(company.organizationalMomentum.financial||0)*.05;
  const ambitionPenalty=(e.goals?.promotion||.5)*Math.max(0,(e.promotionExpectation||45)-growth)*.22;
  const ageFit=e.age>=60?-(e.age-59)*1.4:0;
  return clamp(28+leadership+belonging+security+growth*.08-pressure-ambitionPenalty+ageFit,0,100);
}
function removeEmployeeFromCompany(e,reason="resigned"){
  if(!e.active)return;
  e.active=false;e.offsite=true;e.action=reason;
  if(!company.openRoles.includes(e.role))company.openRoles.push(e.role);
  company.board=clamp(company.board-(reason==="retired"?1.5:3.5),0,100);
  if(reason==="retired"){
    company.log.push(`${e.name}, the ${e.role}, retired after ${Math.max(0,Math.floor((company.day-(e.joinedDay||0))/365))} year(s) with the company.`);
    recordWeeklyEvent(`${e.name}, the ${e.role}, retired from the company.`,"people",5);
    recordHistory(`${e.name} retired as ${e.role}.`,"people",5);
  }else{
    recordMetricEvent("resignations");
    company.log.push(`${e.name}, the ${e.role}, resigned after deciding the company no longer fit their goals.`);
    recordWeeklyEvent(`${e.name}, the ${e.role}, resigned voluntarily.`,"people",5);
    recordHistory(`${e.name} resigned voluntarily after retention risk accumulated.`,"people",5);
  }
  company.organizationalMomentum.turnover=clamp(company.organizationalMomentum.turnover+12,-100,100);
  employees.filter(x=>x.active).forEach(x=>{
    if((x.relationship?.[e.id]||0)>20){applyEmployeeEmotionDelta(x,{moraleDelta:-3,reasonCode:"coworker-departure",sourceEventId:`departure-${e.id}-${company.day}`,ignoreCooldown:true});x.stayScore=clamp((x.stayScore||70)-2,0,100);}
  });
}
function evaluateEmployeeRetentionDaily(){
  ensureLeadershipSystems();
  employees.filter(e=>e.active).forEach(e=>{
    const target=employeeStayScore(e);
    e.stayScore=clamp((e.stayScore||70)*.86+target*.14,0,100);
    e.retentionRisk=clamp(100-e.stayScore,0,100);
    if(e.stayScore<45)e.jobSearchDays=(e.jobSearchDays||0)+1;
    else e.jobSearchDays=Math.max(0,(e.jobSearchDays||0)-1);
    const agePressure=Math.max(0,e.age-57)*3;
    const cultureMismatch=Math.abs((company.leadership.qualityFocus||50)-(e.traits?.includes("perfectionist")?78:50))*.12;
    e.retirementReadiness=clamp(agePressure+(100-e.stayScore)*.35+cultureMismatch+(e.stress>70?8:0),0,100);
    if(e.age>=58&&e.retirementReadiness>68&&simulationRandom()<.004+(e.retirementReadiness-68)*.0007){
      removeEmployeeFromCompany(e,"retired");
    }else if(e.jobSearchDays>=12&&e.stayScore<38&&simulationRandom()<.018+(38-e.stayScore)*.002){
      removeEmployeeFromCompany(e,"resigned");
    }
  });
}
function quarterlyEmployeeReview(e){
  const output=e.performance?.recentOutput||0;
  const mistakes=e.performance?.qualityMistakes||0;
  const collaboration=e.learning?.collaboration||0;
  const growth=(e.achievements||0)+(e.careerLevel||1)*2;
  const performance=clamp(45+output*4-mistakes*8+e.focus*.15+collaboration,0,100);
  const promotionPotential=clamp(performance*.48+growth*5+(e.goals?.promotion||.5)*25-(e.stress*.12),0,100);
  const review={
    day:company.day,quarter:Math.floor(company.day/91),performance:Math.round(performance),
    promotionPotential:Math.round(promotionPotential),retentionRisk:Math.round(e.retentionRisk||0),
    stressTrend:e.stress>68?"rising":e.stress<35?"low":"stable",
    recommendation:promotionPotential>75?"promotion candidate":e.retentionRisk>65?"retention intervention":performance<40?"coaching required":"continue development"
  };
  e.quarterlyReview=review;
  e.promotionExpectation=clamp((e.promotionExpectation||45)+(performance>70?5:-1),0,100);
  e.recognitionSatisfaction=clamp((e.recognitionSatisfaction||60)+(promotionPotential>70&&e.careerLevel<3?-2:performance>55?1:-2),0,100);
  return review;
}
function createQuarterlyBoardReport(){
  ensureLeadershipSystems();
  const quarter=Math.floor(company.day/91);
  const active=employees.filter(e=>e.active);
  const reviews=active.map(quarterlyEmployeeReview);
  const avgRetention=reviews.reduce((s,r)=>s+r.retentionRisk,0)/Math.max(1,reviews.length);
  const highRisk=reviews.filter(r=>r.retentionRisk>=60).length;
  const companyReview={
    day:company.day,quarter,year:Math.floor(company.day/365)+1,cash:company.cash,board:company.board,
    trust:company.trust,quality:company.quality,customers:company.customers,stress:avgStress(),
    retentionRisk:Math.round(avgRetention),highRiskEmployees:highRisk,
    leadership:{...company.leadership},momentum:{...company.organizationalMomentum}
  };
  company.quarterlyReviews.unshift(companyReview);company.quarterlyReviews=company.quarterlyReviews.slice(0,20);
  const strengths=[],concerns=[];
  if(company.quality>=65)strengths.push("product quality is strengthening");
  if(company.cash>=10)strengths.push("cash reserves remain workable");
  if(company.organizationalMomentum.innovation>15)strengths.push("innovation momentum is positive");
  if(avgStress()>65)concerns.push("employee pressure is becoming structural");
  if(highRisk>0)concerns.push(`${highRisk} employee(s) show elevated retention risk`);
  if(company.cash<6)concerns.push("financial runway is weak");
  if(company.board<40)concerns.push("board confidence is fragile");
  if(company.organizationalMomentum.execution< -15)concerns.push("execution momentum is declining");
  const memo={
    id:`quarterly-board-${company.day}`,title:`Quarterly Board Review - Year ${companyReview.year}, Q${(quarter%4)+1}`,
    copy:"The board completed its quarterly review of company health, leadership, people, execution, and risk.",
    choices:[
      {title:"Prioritize organizational resilience",detail:"Protect retention, knowledge, and sustainable execution.",effect:{cash:-.25},directive:"people",days:12,people:{stress:-3,morale:3}},
      {title:"Prioritize delivery discipline",detail:"Tighten accountability and focus on execution.",effect:{board:1,integration:1},directive:"quality",days:10,people:{stress:2,morale:-1}},
      {title:"Prioritize financial resilience",detail:"Protect runway and limit optional commitments.",effect:{cash:.6,board:1},directive:"cuts",days:10,people:{stress:2,morale:-2}}
    ],
    generatedCommunication:{
      type:"Quarterly Board Letter",priority:concerns.length?"Decision Needed":"Review",
      sender:{name:"Board of Directors",role:"Corporate Governance"},
      subject:`Quarterly Organizational Review - Year ${companyReview.year}, Q${(quarter%4)+1}`,
      message:`The quarter closed with ${Math.round(company.board)} board confidence, $${company.cash.toFixed(1)}M cash, ${Math.round(company.quality)} quality, and ${Math.round(avgStress())} average stress. ${strengths.length?"Strengths: "+strengths.join("; ")+". ":""}${concerns.length?"Concerns: "+concerns.join("; ")+".":"No single risk currently dominates the organization."}`,
      recs:[["Board",concerns[0]||"Maintain strategic consistency",78],["People",highRisk?`Address ${highRisk} retention risk case(s)`:"Maintain employee development",72],["Finance",company.cash<8?"Protect runway":"Preserve flexibility",70]],
      impacts:["Quarterly priorities shape leadership policy","Employee retention and promotion expectations may change","Board confidence will respond to the next quarter's trajectory"]
    }
  };
  company.escalationQueue=Array.isArray(company.escalationQueue)?company.escalationQueue:[];
  company.escalationQueue.push(memo);
  company.log.push(`Quarterly review completed: ${highRisk} elevated retention risk case(s).`);
  recordHistory(`Quarterly review reported ${highRisk} elevated retention risks and ${concerns.length} major concern(s).`,"board",4);
}
function createAnnualReview(){
  ensureLeadershipSystems();
  const year=Math.floor(company.day/365);
  employees.filter(e=>e.active).forEach(e=>e.age=(e.age||30)+1);
  const review={day:company.day,year,cash:company.cash,revenue:company.dailyRevenue,customers:company.customers,board:company.board,trust:company.trust,activeEmployees:employees.filter(e=>e.active).length,resignations:company.simulationMetrics?.counters?.resignations||0,firings:company.simulationMetrics?.counters?.firings||0,leadership:{...company.leadership},momentum:{...company.organizationalMomentum}};
  company.annualReviews.unshift(review);company.annualReviews=company.annualReviews.slice(0,10);
  recordHistory(`Year ${year} closed with $${company.cash.toFixed(1)}M cash, ${Math.round(company.customers)} customers, and ${review.activeEmployees} active employees.`,"annual",6);
  recordWeeklyEvent(`The company completed its Year ${year} annual review.`,"board",5);
}
function processOrganizationalReviews(){
  ensureLeadershipSystems();
  if(company.day>0&&company.day-company.lastQuarterlyReviewDay>=91){company.lastQuarterlyReviewDay=company.day;createQuarterlyBoardReport();}
  if(company.day>0&&company.day-company.lastAnnualReviewDay>=365){company.lastAnnualReviewDay=company.day;createAnnualReview();}
}
function crisisSignals(){
  ensureLeadershipSystems();
  const active=employees.filter(e=>e.active);
  const blocked=(company.workItems||[]).filter(w=>w.progress<100&&(w.blockedBy||[]).length).length;
  const loss=.24*company.costEfficiency-company.dailyRevenue;
  return{
    burnout:avgStress()>74&&(company.organizationalMomentum.burnout>18||active.filter(e=>e.daysAtRisk>=2).length>=2),
    financial:company.cash<4.5&&loss>.08&&company.market?.capitalClimate<60,
    product:(company.quality<38&&company.integration>55)||(company.phase==="launched"&&company.manufacturing?.readiness<35&&company.trust<48),
    reputation:company.trust<34&&company.customerSentiment<40,
    leadership:company.board<28&&(company.shareholders?.pressure>68||company.organizationalMomentum.trust< -15),
    "investor-confidence":(company.shareholders?.confidence||company.board||50)<18&&(company.shareholders?.pressure||0)>68,
    staffing:active.length<=5&&((company.openRoles||[]).length>=2||avgStress()>65),
    operational:blocked>=3&&avgStress()>62&&(company.organizationalMomentum.execution< -10||company.manufacturing?.supplyRisk>72),
    manufacturing:company.phase==="launched"&&(company.manufacturing?.supplyRisk||0)>86&&(company.manufacturing?.readiness||100)<42
  };
}
const CRISIS_DEFINITIONS={
  financial:{owner:"company-failure",code:"COMPANY_CASH_CRISIS_TIMEOUT",days:30,title:"Financial Runway Crisis"},
  insolvency:{owner:"company-failure",code:"COMPANY_INSOLVENCY",days:0,title:"Insolvency Failure"},
  payroll:{owner:"company-failure",code:"COMPANY_PAYROLL_FAILURE",days:0,title:"Payroll Failure"},
  leadership:{owner:"ceo-fired",code:"CEO_LEADERSHIP_CRISIS_TIMEOUT",days:30,title:"Leadership Confidence Crisis"},
  burnout:{owner:"ceo-fired",code:"CEO_BURNOUT_CRISIS_TIMEOUT",days:24,title:"Burnout Leadership Crisis"},
  "investor-confidence":{owner:"ceo-fired",code:"CEO_INVESTOR_CRISIS_TIMEOUT",days:30,title:"Investor Confidence Crisis"},
  reputation:{owner:"company-failure",code:"COMPANY_REPUTATION_CRISIS_TIMEOUT",days:28,title:"Reputation Crisis"},
  product:{owner:"company-failure",code:"COMPANY_PRODUCT_CRISIS_TIMEOUT",days:30,title:"Product Delivery Crisis"},
  staffing:{owner:"company-failure",code:"COMPANY_STAFFING_CRISIS_TIMEOUT",days:32,title:"Staffing Continuity Crisis"},
  operational:{owner:"company-failure",code:"COMPANY_OPERATIONAL_CRISIS_TIMEOUT",days:28,title:"Operational Execution Crisis"},
  manufacturing:{owner:"company-failure",code:"COMPANY_MANUFACTURING_CRISIS_TIMEOUT",days:26,title:"Manufacturing Delivery Crisis"},
  governance:{owner:"ceo-fired",code:"CEO_THREE_BOARD_STRIKES",days:0,title:"Governance Failure"}
};
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
    const def=crisisDefinition(company.crisis.type);
    company.crisis={id:company.crisis.id||`crisis-${company.nextCrisisId++}`,type:company.crisis.type||"financial",failureOwner:company.crisis.failureOwner||def.owner,failureCode:company.crisis.failureCode||def.code,startedDay:Number.isFinite(company.crisis.startedDay)?company.crisis.startedDay:(company.day||0),warningStartedDay:Number.isFinite(company.crisis.warningStartedDay)?company.crisis.warningStartedDay:(company.day||0),deadlineDay:Number.isFinite(company.crisis.deadlineDay)?company.crisis.deadlineDay:(company.day||0)+def.days,durationDays:Number.isFinite(company.crisis.durationDays)?company.crisis.durationDays:def.days,triggerEvidence:Array.isArray(company.crisis.triggerEvidence)?company.crisis.triggerEvidence:[],visibleSignals:Array.isArray(company.crisis.visibleSignals)?company.crisis.visibleSignals:[def.title],recoveryCriteria:Array.isArray(company.crisis.recoveryCriteria)?company.crisis.recoveryCriteria:crisisRecoveryCriteria(company.crisis.type),currentProgress:Number.isFinite(company.crisis.currentProgress)?company.crisis.currentProgress:0,escalationStage:company.crisis.escalationStage||"crisis",relatedProjectIds:Array.isArray(company.crisis.relatedProjectIds)?company.crisis.relatedProjectIds:[],relatedDepartmentIds:Array.isArray(company.crisis.relatedDepartmentIds)?company.crisis.relatedDepartmentIds:[],relatedEmployeeIds:Array.isArray(company.crisis.relatedEmployeeIds)?company.crisis.relatedEmployeeIds:[],relatedDecisionIds:Array.isArray(company.crisis.relatedDecisionIds)?company.crisis.relatedDecisionIds:[],status:company.crisis.status||"active"};
    company.crisisType=company.crisis.type;
    company.crisisStage=company.crisis.escalationStage||"crisis";
    company.crisisDays=Math.max(0,company.crisis.deadlineDay-(company.day||0));
  }
  return company.crisis||null;
}
function crisisRecoveryCriteria(type){
  return ({
    financial:["Restore cash above $7M","Reduce net daily losses","Clear payroll pressure"],
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
  const temporaryCoverage=(company.recruitingPipeline||[]).filter(r=>["requisition","searching","interviewing","offer"].includes(r.status)).length;
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
  const activeRecruiting=(company.recruitingPipeline||[]).filter(r=>["requisition","searching","interviewing","offer","exception","paused-policy"].includes(r.status)).length;
  const failedRecruiting=(company.hiringRequestHistory||[]).filter(r=>company.day-(r.day||0)<=45&&/failed|rejected|delayed|paused|suppressed/i.test(String(r.status||""))).length;
  const deliveryImpact=projects.reduce((score,p)=>score+Math.max(0,70-(p.coverage||100))*.08+(p.actualBlockers||0)*1.5,0);
  const concentration=affectedProjects<=1&&missing<=2?-14:0;
  const score=missing*8+missingFte*5+affectedProjects*8+affectedDepartments*4+openRoles*3+activeRecruiting*2+failedRecruiting*4+Math.max(0,avgStress()-65)*.7+deliveryImpact+concentration;
  return {score,affectedProjects,affectedDepartments,missing,missingFte,openRoles,activeRecruiting,failedRecruiting,deliveryImpact};
}
function makeCrisisCandidate(type,triggerEvidence=[],severity=70){
  const def=crisisDefinition(type),duration=def.days||30;
  const signals=triggerEvidence.length?triggerEvidence:[def.title];
  const currentProgressDetail=type==="staffing"?staffingCrisisProgressDetail():null;
  return {id:`crisis-${company.nextCrisisId||1}`,type,failureOwner:def.owner,failureCode:def.code,startedDay:company.day||0,warningStartedDay:Math.max(0,(company.day||0)-Math.min(5,Math.floor(severity/18))),deadlineDay:(company.day||0)+duration,durationDays:duration,triggerEvidence,visibleSignals:signals,recoveryCriteria:crisisRecoveryCriteria(type),currentProgress:crisisRecoveryProgress(type),currentProgressDetail,escalationStage:"crisis",relatedProjectIds:crisisRelatedProjectIds(type),relatedDepartmentIds:crisisRelatedDepartmentIds(type),relatedEmployeeIds:employees.filter(e=>e.active&&e.daysAtRisk>=2).slice(0,4).map(e=>e.id),relatedDecisionIds:[],status:"active"};
}
function typedCrisisCandidate(){
  ensureLeadershipSystems();
  ensureWorkforceEconomySystems?.();
  const active=employees.filter(e=>e.active),blocked=(company.workItems||[]).filter(w=>w.progress<100&&(w.blockedBy||[]).length).length;
  const technical=activeTechnicalEmployees();
  const netLoss=Math.max(0,-(company.finance?.netCashFlowDaily??0));
  const candidates=[];
  const add=(type,severity,evidence)=>candidates.push({type,severity,evidence:evidence.filter(Boolean)});
  if(company.cash<=0){const runway=company.finance?.runwayDays;add("financial",90,[`Cash is at $${company.cash.toFixed(1)}M`,`Runway is ${Number.isFinite(runway)?`${runway} ${runway===1?"day":"days"}`:"unknown"}`,`Net cash flow is $${(company.finance?.netCashFlowDaily??0).toFixed(3)}M/day`]);}
  if(company.board<=12)add("leadership",88,[`Board confidence is ${Math.round(company.board)}`,`Board strikes ${(company.boardGovernance?.strikes||0)}/3`,`Investor pressure ${Math.round(company.shareholders?.pressure||0)}`]);
  if((company.shareholders?.confidence||50)<=10)add("investor-confidence",84,[`Investor confidence is ${Math.round(company.shareholders?.confidence||0)}`,`Shareholder pressure ${Math.round(company.shareholders?.pressure||0)}`]);
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
  const severeProductRisk=(company.projects||[]).some(p=>(p.performance?.riskTrend||p.visibleRisk||0)>82);
  if(company.quality<24||(company.quality<26&&blocked>=2)||severeProductRisk)add("product",76,[`Quality is ${Math.round(company.quality)}`,`Integration is ${Math.round(company.integration||0)}`,`At-risk projects ${(company.projects||[]).filter(p=>(p.performance?.riskTrend||p.visibleRisk||0)>70).length}`]);
  if(blocked>=5||company.organizationalMomentum?.execution< -25)add("operational",74,[`${blocked} blocked work item(s)`,`Execution momentum ${Math.round(company.organizationalMomentum?.execution||0)}`]);
  if(company.phase==="launched"&&(company.manufacturing?.supplyRisk||0)>92)add("manufacturing",80,[`Supply risk is ${Math.round(company.manufacturing?.supplyRisk||0)}`,`Manufacturing readiness is ${Math.round(company.manufacturing?.readiness||0)}`]);
  if(company.unpaidPayrollDays>0||netLoss>.25)add("financial",72,[`Unpaid payroll days ${company.unpaidPayrollDays||0}`,`Net daily loss $${netLoss.toFixed(3)}M`]);
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
    company.crisisRiskDays[k]=clamp((company.crisisRiskDays[k]||0)+(sig[k]?1:-1),0,12);
  });
  const ranked=Object.entries(company.crisisRiskDays).sort((a,b)=>b[1]-a[1]);
  const [type,days]=ranked[0];
  company.crisisStage=days>=5?"critical":days>=3?"at risk":days>=1?"warning":null;
  company.crisisType=company.crisisStage?type:null;
  if(days>=5){
    const candidate=typedCrisisCandidate()||makeCrisisCandidate(type,[`The issue has persisted for ${days} consecutive days.`],days*12);
    startCrisis(candidate);
  }
}
function crisisRecoveryProgress(type=company.crisis?.type||company.crisisType){
  const active=employees.filter(e=>e.active).length,technical=activeTechnicalEmployees();
  const blocked=(company.workItems||[]).filter(w=>w.progress<100&&(w.blockedBy||[]).length).length;
  const snapshot=typeof buildWorkforceAllocationSnapshot==="function"?buildWorkforceAllocationSnapshot():null;
  const criticalGaps=snapshot?.totals?.missingAssignments??criticalStaffingGapCount();
  const missingFte=snapshot?.totals?.missingProjectFte||0;
  const affectedCoverage=Object.values(snapshot?.projects||{}).filter(p=>p.missingAssignments>0).reduce((sum,p)=>sum+p.coverage,0)/Math.max(1,Object.values(snapshot?.projects||{}).filter(p=>p.missingAssignments>0).length);
  const projectRisk=(company.projects||[]).filter(p=>p.status!=="completed").reduce((m,p)=>Math.max(m,p.performance?.riskTrend||p.visibleRisk||0),0);
  const score={
    financial:(company.cash>7?38:company.cash>3?18:0)+((company.finance?.netCashFlowDaily??-.2)>-.06?34:0)+((company.unpaidPayrollDays||0)===0?28:0),
    leadership:(company.board>38?45:company.board>24?20:0)+((company.shareholders?.pressure||100)<65?30:0)+((company.boardGovernance?.strikes||0)<3?25:0),
    burnout:(avgStress()<65?50:avgStress()<74?25:0)+(employees.filter(e=>e.active&&e.daysAtRisk>=2).length===0?35:0)+(avgStress()<70?15:0),
    "investor-confidence":((company.shareholders?.confidence||0)>35?45:0)+((company.shareholders?.pressure||100)<65?30:0)+(company.board>32?25:0),
    reputation:(company.trust>48?45:company.trust>28?20:0)+((company.customerSentiment||0)>48?35:0)+((company.trust>48&&(company.customerSentiment||0)>48)?20:0),
    product:(company.quality>55?30:company.quality>38?15:company.quality>30?10:0)+((company.integration||0)>50?25:(company.integration||0)>45?20:0)+((company.manufacturing?.readiness||0)>45?15:0)+(blocked===0?25:blocked<3?20:0)+(projectRisk<70?15:0)+(company.quality>30&&blocked<2?15:0),
    staffing:(criticalGaps===0?42:criticalGaps<=2?30:criticalGaps<=4?12:0)+(missingFte<=.1?25:missingFte<=1?24:missingFte<=2.5?20:missingFte<=4?8:0)+(affectedCoverage>=85?18:affectedCoverage>=70?12:0)+(active>=8&&technical>=3?18:active>=6&&technical>=2?10:0)+((company.openRoles||[]).length<2?7:0)+(avgStress()<72?10:avgStress()<76?5:0),
    operational:(blocked<2?40:blocked<4?18:0)+((company.organizationalMomentum?.execution||0)>-5?35:0)+(avgStress()<74?25:0),
    manufacturing:((company.manufacturing?.supplyRisk||100)<72?35:0)+((company.manufacturing?.readiness||0)>45?30:0)+((company.manufacturing?.yield||0)>45?20:0)+((company.manufacturing?.capacity||0)>35?15:0)
  }[type];
  return clamp(score??0,0,100);
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
  const nextQ=Math.max(0,91-(company.day-company.lastQuarterlyReviewDay));
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
  const hasSignals=(company.staffingNeeds||[]).length||(company.recruitingPipeline||[]).length||(company.hiringRequests||[]).length||employees.some(e=>e.active&&((e.retentionRisk||0)>=55||e.performanceManagement?.stage!=="none"))||Number(company.finance?.runwayDays||999)<180;
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
  company.workItems=Array.isArray(company.workItems)?company.workItems.filter(w=>w.status==="open"||company.day-(w.closedDay||company.day)<=5).slice(-52):[];
  company.history=Array.isArray(company.history)?company.history.slice(0,260):[];
  company.communications=Array.isArray(company.communications)?company.communications.slice(0,60):[];
}
function recordSimulationError(error,phase="simulation"){
  if(!company)return null;
  const message=error?.message||String(error||"Unknown simulation error");
  const rec={day:company.day,minute:company.minute,phase,message,stack:String(error?.stack||"").slice(0,1200)};
  company.systemErrors=Array.isArray(company.systemErrors)?company.systemErrors:[];
  company.systemErrors.unshift(rec);
  company.systemErrors=company.systemErrors.slice(0,20);
  company.lastSimulationError=rec;
  company.paused=true;
  if(Array.isArray(company.log))company.log.push(`Simulation paused after ${phase} error: ${message}`);
  return rec;
}
function dailyClose(){
  ensureBibleSystems?.();
  company.lastDailyCloseStatus={day:company.day,minute:company.minute,status:"running",stage:"daily-close",hashBefore:stateHash?.(),startedAt:new Date().toISOString()};
  try{
    dailyCloseCore();
    company.lastDailyCloseStatus={day:company.day,minute:company.minute,status:"ok",stage:"daily-close",hashAfter:stateHash?.(),completedAt:new Date().toISOString()};
  }catch(error){
    company.lastDailyCloseStatus={day:company.day,minute:company.minute,status:"error",stage:"daily-close",message:error?.message||String(error),hashAfter:stateHash?.(),completedAt:new Date().toISOString()};
    recordSimulationError(error,error?.dailyStage?`dailyClose:${error.dailyStage}`:"dailyClose");
  }
}

function runDailyStage(name,fn){
  ensureBibleSystems?.();
  const rec={day:company.day,minute:company.minute,stage:name,status:"running",hashBefore:stateHash?.(),startedAt:new Date().toISOString()};
  company.dailyStageStatus=[rec,...(company.dailyStageStatus||[])].slice(0,80);
  try{
    const result=fn?.();
    rec.status="ok";rec.hashAfter=stateHash?.();rec.completedAt=new Date().toISOString();
    return result;
  }catch(error){
    rec.status="error";rec.message=error?.message||String(error);rec.hashAfter=stateHash?.();rec.completedAt=new Date().toISOString();
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

function dailyCloseCore(){runDailyStage("crisis",()=>advanceCrisisDay());runDailyStage("market",()=>{updateMarket();updateHiddenWorldState();updateLaborMarketDaily();});runDailyStage("learning",()=>{processDelayedDecisionEffects();processDecisionThreads();reviewLearningEpisodes();reviewInstitutionalPatterns();});runDailyStage("workforce",()=>{ensureLeadershipSystems();ensureWorkforceEconomySystems();processInternalTransfersDaily();updateCompanyCapabilitySystem({createSupport:true});updateOrganizationalMomentum();evaluateEmployeeRetentionDaily();processOrganizationalReviews();updateCrisisRiskSystem();});const active=employees.filter(e=>e.active),morale=active.reduce((s,e)=>s+e.morale,0)/Math.max(1,active.length),stress=avgStress();runDailyStage("customers",()=>updateCustomerMarketDaily());company.dailyRevenue=Number((calculateCustomerRevenueDaily()+commercialProjectRevenueDaily()).toFixed(4));const portfolioSpend=company.portfolioHealth?.totalProjectSpendDaily||0;const dailyCost=calculateLivingFinance()+portfolioSpend;applyHiringPolicyToRecruiting();processRecruitingPipeline();completeDueOnboarding();maybeQueueHiringFreezeException();maybeQueueHiringPolicyReview();applyStaffingPressure();employees.filter(e=>e.active).forEach(processBurnoutResponseDaily);processManagerPerformanceDaily();maybeQueueHiringRequests();maybeQueueRestructuringRequest();maybeIssueOrEvaluatePip();updateDepartmentFrictionDaily();updateCompanyRiskComponents();updateExecutiveObservations?.();company.finance.totalDailyCost+=portfolioSpend;company.finance.netCashFlowDaily-=portfolioSpend;company.finance.runwayDays=company.finance.netCashFlowDaily<0?Math.max(0,Math.floor(company.cash/Math.abs(company.finance.netCashFlowDaily))):999;company.cash+=company.finance.netCashFlowDaily;recordDailyStageCheckpoint("finance","ok",`cash ${company.cash.toFixed(2)}, runway ${company.finance.runwayDays}`);if(company.unpaidPayrollDays>0){employees.filter(e=>e.active).forEach(e=>{applyEmployeeEmotionDelta(e,{moraleDelta:-4,stressDelta:5,reasonCode:"unpaid-payroll",sourceEventId:`payroll-${company.day}`,ignoreCooldown:true});adjustCEOOpinion(e,{trust:-3,fairness:-4,support:-3,fear:3});});recordWeeklyEvent("Payroll could not be fully covered.","finance",6);}if(company.phase==="pilot")company.pilotDays++;runDailyStage("projects",()=>updateCompanyInformationSystem?.());recordDailyStageCheckpoint("communications","ok",`${(company.employeeMessages||[]).length} message(s)`);runDailyStage("investors",()=>updateDailyValuation());maybeRecordValuationStory();reviewBoardMarketLessons();maybeQueueBoardValuationMemo();updateBoardConfidenceDaily(morale,stress);applyDailyOrganizationalPressure(morale,stress);if(company.directiveDays>0){company.directiveDays--;if(company.directiveDays===0)completePolicyTransition();}employees.forEach(e=>{if(!e.active)return;decayMemories(e);if(e.stress>72){addMemory(e,"OVERTIME","The workload felt excessive today.","negative",7,"leadership");adjustCEOOpinion(e,{support:-.7,trust:-.4,fear:.3});}e.energy=clamp(e.energy+30,0,100);e.focus=clamp(e.focus+16,0,100);applyEmployeeEmotionDelta(e,{stressDelta:-10.5,reasonCode:"overnight-recovery",sourceEventId:`daily-close-${company.day}`,ignoreCooldown:true});const rel=averageRelationship(e);applyEmployeeEmotionDelta(e,{moraleDelta:rel>20?.6:rel<-20?-1.2:0,reasonCode:"relationship-climate",sourceEventId:`daily-close-${company.day}`,ignoreCooldown:true});if(e.stress>88){e.daysAtRisk++;if(simulationRandom()<.08){e.sickDays=1+Math.floor(simulationRandom()*3);recordMetricEvent("sickness");company.log.push(`${e.name} called in sick after sustained stress.`);}}else e.daysAtRisk=Math.max(0,e.daysAtRisk-1);if(e.sickDays>0){e.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};e.performance.absenceDays++;e.sickDays--;if(e.sickDays===0){e.action="recovering";e.thought="I should be ready to return tomorrow.";}}if(e.achievements>=3&&e.careerLevel<3){e.careerLevel++;e.achievements=0;applyEmployeeEmotionDelta(e,{moraleDelta:8,reasonCode:"promotion",sourceEventId:`promotion-${e.id}-${company.day}`,exceptional:true});e.careerHistory.push(`Promoted to level ${e.careerLevel} on day ${company.day}`);company.log.push(`${e.name} earned a promotion through sustained contribution.`);recordWeeklyEvent(`${e.name} earned a promotion.`,"people",4);recordHistory(`${e.name} was promoted to career level ${e.careerLevel}.`,"people",4);}
applyDailyPersonalityEmotion?.(e);
if(e.performance){e.performance.recentOutput*=.96;const beforeMistakes=e.performance.qualityMistakes||0;e.performance.qualityMistakes*=.94;recordQualityResolution(Math.max(0,beforeMistakes-(e.performance.qualityMistakes||0)));if(e.performance.coachingDays>0)e.performance.coachingDays--;updatePerformanceReviewRisk(e);}
if(e.daysAtRisk>=4&&e.morale<30&&simulationRandom()<(.10+(55-(e.opinionOfCEO?.trust||55))*.002)){e.active=false;e.offsite=true;e.action="resigned";if(!company.openRoles.includes(e.role))company.openRoles.push(e.role);company.board-=4;recordMetricEvent("resignations");company.log.push(`${e.name}, the ${e.role}, resigned after prolonged burnout.`);recordWeeklyEvent(`${e.name}, the ${e.role}, resigned after prolonged burnout.`,"people",5);recordLearningEvidence({domain:"workforce",eventType:"burnout-resignation",action:"resignation",outcome:"negative",magnitude:1,confidence:82,department:employeeTeam(e),employeeIds:[e.id],evidence:`${e.name} resigned after burnout`,contributors:[{type:"stress",id:"burnout",weight:.45},{type:"leadershipTrust",id:"ceo",weight:.25},{type:"workload",id:employeeTeam(e),weight:.3}]});createOrReinforceLesson({key:"burnout-costs-talent",title:"Sustained overload can erase skills, trust, and work continuity through resignation.",department:employeeTeam(e),vector:{recovery:1,planning:.45,escalation:.5,riskTaking:-.35},outcome:"negative",confidence:76,evidence:`${e.name} resigned after burnout`,importance:5});recordHistory(`${e.name} resigned after prolonged burnout.`,"people",5);}});if(company.finance?.runwayDays<75)recordLearningEvidence({domain:"finance",eventType:"runway-pressure",action:"daily-runway",outcome:"negative",magnitude:clamp((75-company.finance.runwayDays)/75,0,1),confidence:65,department:"finance",evidence:`Runway ${company.finance.runwayDays} ${company.finance.runwayDays===1?"day":"days"}`,contributors:[{type:"cash",id:"company",weight:.5},{type:"cost",id:"operations",weight:.5}]});company.log.push(`Day ${company.day}: revenue $${company.dailyRevenue.toFixed(2)}M, operating cost $${dailyCost.toFixed(2)}M, morale ${Math.round(morale)}, stress ${Math.round(stress)}.`);
recordHistory(`Day ${company.day} closed with ${company.cash.toFixed(1)}M cash, ${Math.round(company.customers)} customers, and ${Math.round(stress)} average stress.`,"daily",1);
if(company.cash>25&&company.day>20&&!company.history.some(h=>h.type==="finance"&&String(h.text).includes("cash reserve")))recordMajorHistory("The company built a meaningful cash reserve.","finance",4);
if(company.dailyRevenue>dailyCost&&company.phase==="launched"&&!company.history.some(h=>h.type==="finance"&&String(h.text).includes("Revenue became positive")))recordMajorHistory("Revenue became positive after launch.","finance",5);
if(company.customers>=100&&!company.history.some(h=>h.type==="customer"&&String(h.text).includes("100 customers")))recordMajorHistory("The company reached 100 customers.","customer",5);
if(company.cash>12)company.cashEventArmed=true;if(company.day>0&&company.day%5===0)publishWeeklyNewspaper();recordDailyStageCheckpoint("narrative","ok",`${(company.history||[]).length} history item(s)`);
updateManufacturingAndStakeholders?.();runDailyStage("telemetry",()=>collectDailyMetrics?.());
applyExecutiveIntelligenceLearning?.();
if(company.manufacturing?.supplyRisk>82&&simulationRandom()<.18)recordMajorHistory("Supply pressure disrupted manufacturing planning.","manufacturing",4);
if(company.shareholders?.pressure>78&&simulationRandom()<.16)recordMajorHistory("Investor pressure increased on the board.","board",4);
if(company.phase==="launched"&&company.manufacturing){const fulfillment=(company.manufacturing.readiness+company.manufacturing.yield+company.manufacturing.capacity)/300;if(fulfillment<.62){const penalty=company.dailyRevenue*(.62-fulfillment)*.45;company.cash=clamp(company.cash-penalty,0,999);company.trust=clamp(company.trust-(.62-fulfillment)*2.4,0,100);recordCustomerExperience?.("enterprise","delivery-delay",Math.round(58+(1-fulfillment)*24),"Manufacturing fulfillment delays affected customer delivery.","manufacturing",true);Object.values(company.customerSegments||{}).forEach(seg=>{seg.sentiment=clamp((seg.sentiment||50)-(0.62-fulfillment)*3,0,100);seg.trust=clamp((seg.trust||50)-(0.62-fulfillment)*2,0,100);});syncCustomerSummaryFromSegments?.();const owner=employees.filter(e=>e.active).find(e=>canonicalRole(e.role)==="Software QA Engineer")||employees.find(e=>e.active);if(owner)recordQualityMistake(owner,"launched-product fulfillment defects",.6);recordHistory(`Manufacturing fulfillment dragged revenue by $${penalty.toFixed(2)}M.`,"manufacturing",3);}}
pruneLongRunCollections();
runDailyStage("save",()=>{if(!validationMode)saveGame();});}
function maybeEmergentEvent(){if(simulationRandom()>.025)return;const active=employees.filter(e=>e.active);if(!active.length)return;const e=active[Math.floor(simulationRandom()*active.length)];if(e.stress>78){e.morale-=8;company.board-=2;company.log.push(`${e.name} warned that the workload is unsustainable.`);}else if(e.taskProgress>18){e.taskProgress=0;e.achievements++;company.trust+=2;company.valuation+=.8;company.log.push(`${e.name} completed a difficult ${e.role.toLowerCase()} milestone.`);recordWeeklyEvent(`${e.name} completed a major ${e.role.toLowerCase()} milestone.`,"people",3);}else{const other=socialTarget(e);if(other){recordSharedExperience(e,other,{type:"direct_help",sourceEventId:`emergent-help-${e.id}-${other.id}-${company.day}-${company.minute}`,emotionalWeight:1,outcome:"positive",importance:3,evidence:`${e.name} and ${other.name} handled difficult work together.`});addMemory(e,"SOCIAL_HELP",`${other.name} helped me with difficult work.`,"positive",9,other.name);addMemory(other,"SOCIAL_HELP",`I helped ${e.name} with difficult work.`,"positive",7,e.name);company.log.push(`${e.name} helped ${other.name}, strengthening cooperation.`);recordWeeklyEvent(`${e.name} helped ${other.name}, strengthening cooperation.`,"people",2);}}}
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

class WorkforceSystem{
  ensure(){return ensureWorkforceEconomySystems();}
  updateStaffing(){return updateStaffingModel();}
  updateFinance(){return calculateLivingFinance();}
  pipeline(){return hiringPipelineRows();}
  reviewHiringPolicy(){return requestHiringPolicyReview();}
  evaluateFailure(){return evaluateFailure();}
  dailyClose(){return dailyClose();}
}
