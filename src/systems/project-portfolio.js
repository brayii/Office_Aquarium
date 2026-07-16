const DEPARTMENTS=["hardware","software","quality","product","finance","people","company"];
const PROJECT_LESSON_KEYS=["estimateAccuracy","scopeControl","pilotValue","earlyQA","staffingTiming","cancellationTiming","sunkCostDiscipline","marketTiming","supplierRisk","projectSize","crossDepartmentCoordination","customerValidation","knowledgeValue"];
const LEARNING_COVERAGE={
  testing:{producers:["quality mistakes","project QA","CEO quality decisions"],consumers:["employee lab utility","project early QA"],ui:["Lessons Learned"]},
  collaboration:{producers:["successful collaboration","project coordination"],consumers:["employee collaborate utility","project coordination"],ui:["Lessons Learned"]},
  documentation:{producers:["quality rework","project gates"],consumers:["meeting utility","project estimates"],ui:["Lessons Learned"]},
  escalation:{producers:["employee reports","CEO decisions"],consumers:["meeting utility","reporting behavior"],ui:["Lessons Learned"]},
  innovation:{producers:["projects","opportunities"],consumers:["work utility","project proposals"],ui:["Lessons Learned"]},
  riskTaking:{producers:["launch/project choices"],consumers:["work utility","portfolio decisions"],ui:["Lessons Learned"]},
  planning:{producers:["CEO policy","project gates"],consumers:["work and meeting utility","project estimates"],ui:["Lessons Learned"]},
  mentoring:{producers:["collaboration","onboarding"],consumers:["collaboration utility","onboarding quality"],ui:["Lessons Learned"]},
  recovery:{producers:["breaks","burnout recovery"],consumers:["break utility","burnout ladder"],ui:["Lessons Learned"]},
  helpSeeking:{producers:["help requests"],consumers:["employee help utility","burnout ladder"],ui:["Workforce panel"]},
  workloadBalancing:{producers:["manager redistribution"],consumers:["department pressure","staffing model"],ui:["Workforce panel"]},
  coaching:{producers:["coaching outcomes"],consumers:["manager coaching threshold"],ui:["Workforce panel"]},
  performanceManagement:{producers:["PIP outcomes"],consumers:["PIP timing"],ui:["Workforce panel"]},
  successionPlanning:{producers:["hiring and departures"],consumers:["hiring need score"],ui:["Workforce panel"]},
  hiringTiming:{producers:["recruiting outcomes"],consumers:["recruiting fill time","hiring request threshold"],ui:["Hiring Pipeline"]},
  retention:{producers:["resignation and morale"],consumers:["stay score"],ui:["Workforce panel"]},
  burnoutRecovery:{producers:["burnout recovery ladder"],consumers:["recovery intervention"],ui:["Workforce panel"]},
  terminationTiming:{producers:["termination outcomes"],consumers:["termination eligibility"],ui:["Workforce panel"]},
  layoffCaution:{producers:["layoff outcomes"],consumers:["restructuring recommendation"],ui:["Workforce panel"]},
  estimateAccuracy:{producers:["project completion and overruns"],consumers:["proposal cost/duration estimates"],ui:["Project Portfolio"]},
  scopeControl:{producers:["scope reductions and overruns"],consumers:["portfolio recommendations"],ui:["Project Portfolio"]},
  pilotValue:{producers:["pilot approvals and validation"],consumers:["proposal and review recommendations"],ui:["Project Portfolio"]},
  earlyQA:{producers:["defects and verification"],consumers:["project risk and QA staffing"],ui:["Project Portfolio"]},
  staffingTiming:{producers:["project staffing outcomes"],consumers:["project staffing demand"],ui:["Project Portfolio"]},
  cancellationTiming:{producers:["canceled projects"],consumers:["cancel recommendations"],ui:["Project Portfolio"]},
  sunkCostDiscipline:{producers:["cancel/reduce decisions"],consumers:["cancel recommendations"],ui:["Project Portfolio"]},
  marketTiming:{producers:["market validation and launch timing"],consumers:["customer validation recommendations"],ui:["Project Portfolio"]},
  supplierRisk:{producers:["supply and manufacturing events"],consumers:["project risk"],ui:["Project Portfolio"]},
  projectSize:{producers:["portfolio expansion/splitting"],consumers:["scope recommendations"],ui:["Project Portfolio"]},
  crossDepartmentCoordination:{producers:["merged and completed projects"],consumers:["project progress and risk"],ui:["Project Portfolio"]},
  customerValidation:{producers:["validation decisions"],consumers:["portfolio recommendations"],ui:["Project Portfolio"]},
  knowledgeValue:{producers:["completed research/projects"],consumers:["proposal benefit estimates"],ui:["Project Portfolio"]}
};
function emptyProjectLessons(){return Object.fromEntries(PROJECT_LESSON_KEYS.map(k=>[k,{score:0,confidence:0,successEvidence:0,failureEvidence:0,sampleCount:0,lastObservedDay:-999,effectEstimate:0,variance:1,evidence:[]}]));}
function normalizeProjectLessons(){
  const defaults=emptyProjectLessons(), current=company.projectLessons&&typeof company.projectLessons==="object"?company.projectLessons:{};
  for(const key of PROJECT_LESSON_KEYS){
    const old=current[key];
    if(old&&typeof old==="object")defaults[key]={...defaults[key],...old,score:clamp(Number(old.score)||0,-10,10),confidence:clamp(Number(old.confidence)||0,0,100)};
    else defaults[key]={...defaults[key],score:clamp(Number(old)||0,-10,10),effectEstimate:clamp(Number(old)||0,-10,10),confidence:Math.abs(Number(old)||0)>0?35:0,sampleCount:Math.abs(Number(old)||0)>0?1:0};
  }
  company.projectLessons=defaults;
}
function reinforceProjectLesson(key,delta,evidence="",confidenceGain=8,outcome="mixed"){
  ensureProjectPortfolio();normalizeProjectLessons();
  if(!PROJECT_LESSON_KEYS.includes(key))return null;
  const l=company.projectLessons[key], sample=(Number(delta)||0), n=(l.sampleCount||0)+1, oldMean=Number(l.effectEstimate)||0;
  l.sampleCount=n;l.lastObservedDay=company.day;l.successEvidence+=(sample>0?1:0);l.failureEvidence+=(sample<0?1:0);
  l.effectEstimate=clamp(oldMean+(sample-oldMean)/n,-10,10);
  l.variance=clamp(((l.variance||1)*(n-1)+Math.pow(sample-l.effectEstimate,2))/n,0,25);
  l.score=clamp((l.score||0)*.88+sample*.42,-10,10);
  l.confidence=clamp((l.confidence||0)+confidenceGain*(1/(1+Math.sqrt(l.variance||0)))-(outcome==="contradiction"?confidenceGain*.7:0),0,100);
  l.evidence=Array.isArray(l.evidence)?l.evidence:[];if(evidence&&!l.evidence.includes(evidence))l.evidence.unshift(evidence);l.evidence=l.evidence.slice(0,5);
  recordLearningEvidence({domain:"project",eventType:key,action:key,outcome,magnitude:sample,confidence:l.confidence,evidence,contributors:[{type:"projectLesson",id:key,weight:1}]});
  return l;
}
function projectLessonBias(key){
  if(!company)return 0;
  company.projectLessons=company.projectLessons&&typeof company.projectLessons==="object"?company.projectLessons:{};
  normalizeProjectLessons();
  const l=company.projectLessons[key]||{};
  const age=Math.max(0,company.day-(l.lastObservedDay??company.day));
  const decay=clamp(1-age/720,.35,1);
  return clamp((l.score||0)*(l.confidence||0)/100*decay,-10,10);
}
function projectExecutionModifiers(project,state={}){
  const coordination=projectLessonBias("crossDepartmentCoordination"),earlyQA=projectLessonBias("earlyQA"),staffing=projectLessonBias("staffingTiming"),supplier=projectLessonBias("supplierRisk");
  const reality=project.hiddenReality||{};
  return {
    progress:clamp(1+coordination*.018+staffing*.012-(reality.trueTechnicalDifficulty||50)*.0015,.72,1.22),
    defectRisk:clamp(1-earlyQA*.025+(reality.trueTechnicalDifficulty||50)*.002+(reality.trueManufacturingComplexity||30)*.0015,.65,1.45),
    budget:clamp(1-projectLessonBias("estimateAccuracy")*.018+Math.max(0,(reality.trueTechnicalDifficulty||50)-60)*.004,.75,1.35),
    schedule:clamp(1-projectLessonBias("scopeControl")*.018-projectLessonBias("estimateAccuracy")*.012,.72,1.28),
    customer:clamp(1+projectLessonBias("customerValidation")*.02+projectLessonBias("marketTiming")*.012, .75,1.3),
    staffingDemand:clamp(1-staffing*.015, .78,1.18),
    supplierRisk:clamp(1-supplier*.018, .75,1.28)
  };
}
function projectPaceProfile(project){
  const family=String(project?.family||"").toLowerCase(),dept=project?.proposingDepartment||projectDepartmentForFamily(project?.family||"");
  const major=/ai accelerator|next-generation|processor|memory controller|chip|manufacturing|yield|platform|cloud|data platform|security|firmware-hardware/.test(family)||["hardware","software"].includes(dept)&&Number(project?.scope||1)>1.1;
  const internal=/training|knowledge|process|culture|compliance|internal/.test(family)||dept==="finance";
  const difficulty=Number(project?.hiddenReality?.trueTechnicalDifficulty||project?.visibleRisk||55);
  const scope=Number(project?.scope||1);
  const complexity=clamp((difficulty-45)*.006+(scope-1)*.10+(major ? .16 : 0)-(internal ? .10 : 0),-.12,.34);
  return {major,internal,complexity,progressMultiplier:clamp(1-complexity,.62,1.08),closeoutDays:major?5:internal?3:4};
}
function projectLateStageDrag(project,progress=null){
  const p=Number(progress??project?.progress??0);
  if(p<70)return 1;
  const profile=projectPaceProfile(project),late=(p-70)/30;
  return clamp(1-late*(profile.major ? .42 : .30),.48,1);
}
function projectIdNumber(id){
  const match=String(id||"").match(/^project-(\d+)$/);
  return match?Number(match[1]):0;
}
function allProjectIds(){
  return new Set([...(company?.projects||[]),...(company?.projectProposals||[]),...(company?.projectArchive||[])].map(p=>p?.id).filter(Boolean));
}
function syncNextProjectId(){
  if(!company)return 1;
  const maxSeen=Math.max(0,...[...(company.projects||[]),...(company.projectProposals||[]),...(company.projectArchive||[])].map(p=>projectIdNumber(p?.id)));
  company.nextProjectId=Math.max(Number(company.nextProjectId)||1,maxSeen+1);
  return company.nextProjectId;
}
function allocateProjectId(){
  syncNextProjectId();
  const ids=allProjectIds();
  let id=`project-${company.nextProjectId++}`;
  while(ids.has(id))id=`project-${company.nextProjectId++}`;
  return id;
}
function rekeyLiveProject(project){
  if(!project||!company)return null;
  const oldId=project.id,newId=allocateProjectId();
  project.id=newId;
  (company.workItems||[]).forEach(w=>{if(w.projectId===oldId)w.projectId=newId;});
  employees?.forEach(e=>{
    if(e.projectAffinity&&Object.prototype.hasOwnProperty.call(e.projectAffinity,oldId)){e.projectAffinity[newId]=e.projectAffinity[oldId];delete e.projectAffinity[oldId];}
    (e.projectHistory||[]).forEach(h=>{if(h.projectId===oldId)h.projectId=newId;});
    (e.proposalHistory||[]).forEach(h=>{if(h.projectId===oldId)h.projectId=newId;});
  });
  (company.projectDecisionHistory||[]).forEach(h=>{if(h.projectId===oldId)h.projectId=newId;});
  recordHistory?.(`${project.title||"A live project"} received a corrected internal tracking ID to preserve archive integrity.`,"project",2);
  return newId;
}
function makeProject({family,originType="department",originatorId=null,status="proposal",scope=1,seed=null}={}){
  const all=Object.values(projectFamilies()).flat(),chosen=family||all[Math.floor(simulationRandom()*all.length)],primary=projectDepartmentForFamily(chosen);
  const id=allocateProjectId(),s=seed||`${id}-${chosen}-${company.day}`,rnd=projectSeededRandom(s),reality=createProjectReality(s,chosen);
  const code=["Phoenix","Atlas","Helix","Signal","Northstar","Forge","Lumen","Catalyst","Keystone","Vector"][Math.floor(rnd()*10)];
  const evidence=(employees.filter(e=>e.active&&employeeTeam(e)===primary).reduce((a,e)=>a+(e.skills?.communication||45)+(e.skills?.leadership||35),0)/Math.max(1,employees.filter(e=>e.active&&employeeTeam(e)===primary).length))/2;
  const estimateBias=projectLessonBias("estimateAccuracy"),sizeBias=projectLessonBias("projectSize"),knowledgeBias=projectLessonBias("knowledgeValue"),validationBias=projectLessonBias("customerValidation");
  const confidence=clamp(42+evidence*.35+(company.culture.communication-50)*.2+estimateBias*1.4+rnd()*-18,28,92);
  const estimateNoise=(100-confidence)/100;
  const estimatedCost=Number(((1.2+scope*(reality.trueTechnicalDifficulty/24)+(rnd()*1.5))*(1-estimateBias*.012+Math.max(0,-sizeBias)*.01)).toFixed(2));
  const familyText=String(chosen).toLowerCase(),major=/ai accelerator|next-generation|processor|memory controller|chip|manufacturing|yield|platform|cloud|data platform|security|firmware-hardware/.test(familyText)||["hardware","software"].includes(primary)&&scope>1.1,internal=projectDepartmentForFamily(chosen)==="finance";
  const durationMultiplier=major ? 1.45 : internal ? .85 : 1.15;
  const estimatedDuration=Math.round((45+reality.trueTechnicalDifficulty*1.4+rnd()*45)*(1-estimateBias*.008)*durationMultiplier);
  const visibility=status==="proposal"?"private":(originType==="legacy"?"announced":(rnd()>.72?"announced":rnd()>.42?"rumored":"private"));
  const p={id,family:chosen,codename:code,title:`Project ${code}: ${chosen.replace(/\b\w/g,c=>c.toUpperCase())}`,originType,originatorId,proposingDepartment:primary,createdDay:company.day,status,priority:Math.round(50+rnd()*45),scope,budgetApproved:status==="proposal"?0:estimatedCost*.45,budgetSpent:0,estimatedDuration,estimatedCost,estimatedBenefit:Math.round(reality.trueStrategicValue*(1-estimateNoise*.25)+rnd()*10+knowledgeBias*1.5),visibleRisk:Math.round(clamp(reality.trueTechnicalDifficulty*(.75+rnd()*estimateNoise)-confidence*.12-projectLessonBias("scopeControl")*.8,15,95)),visibleConfidence:Math.round(confidence),marketVisibility:visibility,requiredDepartments:projectRequiredDepartments(chosen,primary),requiredSkills:requiredSkillsForWork(primary,workItemTypeForTeam(primary)),requiredHeadcount:{[primary]:scope>1?2:1,quality:["hardware","software"].includes(primary)?1:0},assignedEmployees:[],workItemIds:[],milestones:[],deadlineDay:company.day+Math.round((45+reality.trueTechnicalDifficulty*1.8)*durationMultiplier),progress:0,quality:55,integration:35,customerInterest:Math.round(reality.trueCustomerExcitement*(.75+rnd()*.35)+validationBias),teamMoraleImpact:0,strategicNarrative:`${teamDisplayName(primary)} believes ${chosen} could strengthen the company portfolio.`,reviewHistory:[],hiddenReality:reality,seed:s,performance:{progress:0,scheduleVariance:0,budgetVariance:0,quality:55,integration:35,teamHealth:70,staffingCoverage:60,blockerCount:0,customerInterest:Math.round(reality.trueCustomerExcitement),strategicConfidence:Math.round(confidence),riskTrend:0,benefitRealization:0,forecastAtCompletion:Math.round(50+rnd()*35)},nextReviewDay:company.day+30};
  return p;
}
function changedConditionsForDormantProject(project){
  const reasons=[];
  const age=company.day-(project.closedDay??project.completedDay??project.createdDay??company.day);
  if(age>=60)reasons.push(`${age} days have passed since the original decision`);
  if((company.cash||0)>12)reasons.push("runway is stronger than during the original review");
  if((company.market?.aiDemand||50)>62||(company.market?.hardwareDemand||50)>62)reasons.push("market demand has improved");
  if((company.customerSentiment||company.trust||50)>68||(project.customerInterest||0)>70)reasons.push("customer signal is stronger");
  if((company.portfolioHealth?.projectDrivenOpenRoles||0)===0&&avgStress()<62)reasons.push("staffing pressure is more manageable");
  if(projectLessonBias("cancellationTiming")>1.2||projectLessonBias("marketTiming")>1.2)reasons.push("institutional learning suggests timing should be reconsidered");
  return reasons;
}
function dormantProjectRevivalCandidate(){
  ensureProjectPortfolio();
  const existingSourceIds=new Set([...(company.projects||[]),...(company.projectProposals||[]),...(company.projectArchive||[])].map(p=>p?.sourceProjectId).filter(Boolean));
  const candidates=(company.projectArchive||[]).filter(p=>{
    if(!["canceled","rejected"].includes(p.status)||existingSourceIds.has(p.id))return false;
    const age=company.day-(p.closedDay??p.completedDay??p.createdDay??company.day);
    if(age<45||company.day-(p.lastRevivalConsideredDay||-999)<45)return false;
    return changedConditionsForDormantProject(p).length>=2;
  }).sort((a,b)=>{
    const score=p=>changedConditionsForDormantProject(p).length*20+(p.hiddenReality?.trueStrategicValue||p.estimatedBenefit||50)+(p.customerInterest||0)*.25-(p.visibleRisk||50)*.2;
    return score(b)-score(a);
  })[0];
  if(candidates)candidates.lastRevivalConsideredDay=company.day;
  return candidates||null;
}
function makeRevivalProjectProposal(source){
  const proposal=makeProject({family:source.family,originType:"successor proposal",originatorId:null,status:"proposal",scope:clamp((source.scope||1)*.72,.45,1.8),seed:`revival-${source.id}-${company.day}`});
  const reasons=changedConditionsForDormantProject(source);
  proposal.sourceProjectId=source.id;
  proposal.predecessorTitle=source.title;
  proposal.revivalReasons=reasons;
  proposal.title=`Successor to ${source.codename||source.title}: ${proposal.family.replace(/\b\w/g,c=>c.toUpperCase())}`;
  proposal.strategicNarrative=`A department is revisiting ${source.title} as a smaller successor because ${reasons.slice(0,2).join(" and ")}.`;
  proposal.visibleRisk=clamp(Math.round((proposal.visibleRisk||50)-6+Math.max(0,(source.performance?.riskTrend||source.visibleRisk||50)-70)*.08),10,95);
  proposal.visibleConfidence=clamp(Math.round((proposal.visibleConfidence||50)+8+reasons.length*2),25,96);
  proposal.estimatedCost=Number(Math.max(.25,(proposal.estimatedCost||1)*(proposal.scope||1)).toFixed(2));
  proposal.estimatedDuration=Math.round((proposal.estimatedDuration||60)*.88);
  proposal.deadlineDay=company.day+proposal.estimatedDuration;
  return proposal;
}
function ensureProjectPortfolio(){
  if(!company)return;
  company.projects=Array.isArray(company.projects)?company.projects:[];
  company.projectProposals=Array.isArray(company.projectProposals)?company.projectProposals:[];
  company.projectArchive=Array.isArray(company.projectArchive)?company.projectArchive:[];
  company.projectFamilies=company.projectFamilies&&typeof company.projectFamilies==="object"?company.projectFamilies:projectFamilies();
  syncNextProjectId();
  company.portfolioHealth={activeProjects:0,proposedProjects:0,atRiskProjects:0,pausedProjects:0,totalProjectSpendDaily:0,committedProjectBudget:0,staffingDemand:0,projectDrivenOpenRoles:0,averageScheduleVariance:0,averageBudgetVariance:0,concentrationRisk:0,nextProjectReview:30,...(company.portfolioHealth||{})};
  company.projectReviewQueue=Array.isArray(company.projectReviewQueue)?company.projectReviewQueue:[];
  company.projectDecisionHistory=Array.isArray(company.projectDecisionHistory)?company.projectDecisionHistory:[];
  company.projectLessons=company.projectLessons&&typeof company.projectLessons==="object"?company.projectLessons:{};
  normalizeProjectLessons();
  company.projectSeedState=company.projectSeedState&&typeof company.projectSeedState==="object"?company.projectSeedState:{created:0};
  company.projectArchiveOpen=!!company.projectArchiveOpen;
  repairProjectPortfolioIntegrity();
  if(!company.projects.length&&!company.projectArchive.length&&!company.projectProposals.length){
    const legacy=makeProject({family:"AI accelerator",originType:"legacy",status:"execution",scope:1.2,seed:"legacy-flagship"});
    legacy.title="Legacy Flagship Chip Platform";legacy.progress=Math.round((company.chip+company.software+company.integration+company.quality)/4);legacy.quality=company.quality;legacy.integration=company.integration;legacy.budgetApproved=legacy.estimatedCost*.65;legacy.strategicNarrative="Migrated from the existing chip and software program.";company.projects.push(legacy);
    recordHistory?.("Legacy flagship project created from existing company progress.","project",4);
  }
  [...company.projects,...company.projectProposals,...company.projectArchive].forEach(p=>{
    p.assignedEmployees=Array.isArray(p.assignedEmployees)?p.assignedEmployees:[];
    p.staffAllocations=p.staffAllocations&&typeof p.staffAllocations==="object"?p.staffAllocations:{};
    p.causalLedger=Array.isArray(p.causalLedger)?p.causalLedger:[];
    p.closeoutReadyDays=Number(p.closeoutReadyDays)||0;
    p.commercialStatus=p.commercialStatus||((p.status==="completed"&&(p.customerInterest||0)>=65)?"ready":p.status==="completed"?"completed":"not ready");
    p.convertedCustomers=Number(p.convertedCustomers)||0;
    p.projectedDailyRevenue=Number(p.projectedDailyRevenue)||0;
    p.commercialReadiness=Number(p.commercialReadiness)||0;
    p.commercialPotential=Number(p.commercialPotential)||0;
  });
  employees?.forEach(e=>{e.projectAffinity=e.projectAffinity&&typeof e.projectAffinity==="object"?e.projectAffinity:{};e.projectHistory=Array.isArray(e.projectHistory)?e.projectHistory:[];e.proposalHistory=Array.isArray(e.proposalHistory)?e.proposalHistory:[];e.projectSkills=e.projectSkills&&typeof e.projectSkills==="object"?e.projectSkills:{estimateAccuracy:45,scopeControl:45,coordination:45};});
}
function terminalProjectStatus(status){return ["completed","canceled","rejected","merged"].includes(status);}
function archiveProjectOnce(project,status=null){
  if(!project||!company)return null;
  company.projects=Array.isArray(company.projects)?company.projects:[];
  company.projectProposals=Array.isArray(company.projectProposals)?company.projectProposals:[];
  company.projectArchive=Array.isArray(company.projectArchive)?company.projectArchive:[];
  if(status)project.status=status;
  if(terminalProjectStatus(project.status)&&!Number.isFinite(project.closedDay)&&!Number.isFinite(project.completedDay))project.closedDay=company.day;
  company.projects=company.projects.filter(p=>p&&p.id!==project.id);
  company.projectProposals=company.projectProposals.filter(p=>p&&p.id!==project.id);
  const existingIndex=company.projectArchive.findIndex(p=>p&&p.id===project.id);
  if(existingIndex>=0)company.projectArchive[existingIndex]={...company.projectArchive[existingIndex],...project};
  else company.projectArchive.unshift(project);
  return project;
}
function repairProjectPortfolioIntegrity(){
  if(!company||company._repairingProjectPortfolio)return;
  company._repairingProjectPortfolio=true;
  try{
    const terminalIds=new Set();
    company.projects=(company.projects||[]).filter(Boolean);
    company.projectProposals=(company.projectProposals||[]).filter(Boolean);
    company.projectArchive=(company.projectArchive||[]).filter(Boolean);
    [...company.projects,...company.projectProposals].forEach(p=>{
      if(terminalProjectStatus(p.status)){archiveProjectOnce(p);terminalIds.add(p.id);}
    });
    company.projectArchive.forEach(p=>{if(p&&p.id!==undefined)terminalIds.add(p.id);});
    [...company.projects,...company.projectProposals].forEach(p=>{
      if(p&&p.id!==undefined&&terminalIds.has(p.id)&&!terminalProjectStatus(p.status)){
        terminalIds.delete(p.id);
        rekeyLiveProject(p);
      }
    });
    company.projects=company.projects.filter(p=>p&&!terminalIds.has(p.id)&&!terminalProjectStatus(p.status));
    company.projectProposals=company.projectProposals.filter(p=>p&&!terminalIds.has(p.id)&&!terminalProjectStatus(p.status));
    const archiveById=new Map();
    company.projectArchive.forEach(p=>{
      if(!p||p.id===undefined)return;
      const prev=archiveById.get(p.id);
      archiveById.set(p.id,prev?{...prev,...p}:p);
    });
    company.projectArchive=[...archiveById.values()].sort((a,b)=>(b.completedDay??b.closedDay??b.createdDay??0)-(a.completedDay??a.closedDay??a.createdDay??0));
    const activeById=new Map();
    company.projects.forEach(p=>{
      if(!p||p.id===undefined)return;
      if(activeById.has(p.id))rekeyLiveProject(p);
      activeById.set(p.id,p);
    });
    company.projects=[...activeById.values()];
    const proposalById=new Map();
    company.projectProposals.forEach(p=>{
      if(!p||p.id===undefined)return;
      if(activeById.has(p.id)||proposalById.has(p.id))rekeyLiveProject(p);
      proposalById.set(p.id,p);
    });
    company.projectProposals=[...proposalById.values()];
  }finally{
    delete company._repairingProjectPortfolio;
  }
}
function activeProjects(){ensureProjectPortfolio();return company.projects.filter(p=>["approved","planning","prototype","execution","verification","pilot","scaling","at risk","blocked"].includes(p.status));}
function setProjectArchiveOpen(open){if(company)company.projectArchiveOpen=!!open;}
function employeeProjectCapacity(e){
  const onboarding=clamp(onboardingProductivity(e),.15,1);
  const focusFactor=clamp(.70+(e.focus||50)*.003, .72, .98);
  const stressPenalty=Math.max(0,(e.stress||0)-68)*.0045;
  const meetingTax=e.activeMeeting?.minutesLeft ? .5 : 0;
  return clamp(onboarding*focusFactor-stressPenalty-meetingTax,.12,.92);
}
function computeProjectCapacityState(active=activeProjects()){
  const loads=Object.fromEntries(employees.filter(e=>e.active).map(e=>[e.id,{load:0,projects:0,capacity:employeeProjectCapacity(e),overload:0}]));
  active.forEach(p=>Object.entries(p.staffAllocations||{}).forEach(([id,v])=>{
    const row=loads[Number(id)];
    if(!row)return;
    row.load+=Number(v)||0;
    if((Number(v)||0)>.03)row.projects++;
  }));
  Object.entries(loads).forEach(([id,row])=>{
    row.load=Number(row.load.toFixed(2));
    row.overload=clamp(row.load-row.capacity,0,2);
    const e=employees.find(x=>x.id===Number(id));
    if(e)e.workload={projectLoad:row.load,projectCapacity:Number(row.capacity.toFixed(2)),projectOverload:Number(row.overload.toFixed(2)),projectCount:row.projects};
  });
  const totalLoad=Object.values(loads).reduce((s,r)=>s+r.load,0),totalCapacity=Object.values(loads).reduce((s,r)=>s+r.capacity,0),totalOverload=Object.values(loads).reduce((s,r)=>s+r.overload,0);
  company.projectCapacity={totalLoad:Number(totalLoad.toFixed(2)),totalCapacity:Number(totalCapacity.toFixed(2)),totalOverload:Number(totalOverload.toFixed(2)),overloadedEmployees:Object.values(loads).filter(r=>r.overload>.05).length};
  return loads;
}
function normalizeProjectAllocations(active=activeProjects()){
  const loads=computeProjectCapacityState(active);
  for(const [id,row] of Object.entries(loads)){
    if(row.load<=row.capacity+.02)continue;
    const scale=clamp(row.capacity/Math.max(.01,row.load),.25,1);
    active.forEach(p=>{if(p.staffAllocations?.[id])p.staffAllocations[id]=Number((p.staffAllocations[id]*scale).toFixed(2));});
  }
  return computeProjectCapacityState(active);
}
function projectOverloadPressure(project){
  const ids=Object.keys(project?.staffAllocations||{}).map(Number),rows=ids.map(id=>employees.find(e=>e.id===id)?.workload).filter(Boolean);
  if(!rows.length)return 0;
  return clamp(rows.reduce((s,r)=>s+(Number(r.projectOverload)||0),0)/rows.length*100,0,100);
}
function projectAffinityScore(e,projectId){
  const value=e?.projectAffinity?.[projectId];
  if(typeof value==="number")return value;
  if(value&&typeof value==="object")return clamp((value.interest||0)*.35+(value.identity||0)*.25+(value.ownership||0)*.25+(value.pride||0)*.15-(value.frustration||0)*.20-(value.fatigue||0)*.18,0,100);
  return 0;
}
function rebuildRuntimeIndexes(){
  if(!company)return;
  const byDept=Object.fromEntries(DEPARTMENTS.map(d=>[d,[]]));
  (employees||[]).forEach(e=>{if(e.active)(byDept[roleDepartment(e.role)]||byDept.company).push(e);});
  const workByProject={},projectsByDept=Object.fromEntries(DEPARTMENTS.map(d=>[d,[]]));
  (company.workItems||[]).forEach(w=>{if(w.projectId){if(!workByProject[w.projectId])workByProject[w.projectId]=[];workByProject[w.projectId].push(w);}});
  (company.projects||[]).forEach(p=>(p.requiredDepartments||[]).forEach(d=>{if(projectsByDept[d])projectsByDept[d].push(p);}));
  company.runtime={departmentMembers:byDept,workItemsByProjectId:workByProject,activeProjectsByDepartment:projectsByDept,indexDay:company.day};
}
function departmentMembers(dept){
  if(!company.runtime||company.runtime.indexDay!==company.day)rebuildRuntimeIndexes();
  return company.runtime?.departmentMembers?.[dept]||[];
}
function projectWorkType(project,dept){
  if(dept==="quality")return "verification";
  if(dept==="hardware")return project.family.includes("manufacturing")||project.family.includes("yield")?"quality":"architecture";
  if(dept==="software")return project.family.includes("portal")||project.family.includes("SDK")?"software":"integration";
  if(dept==="product")return "customer";
  return "runway";
}
function createProjectWorkItem(project,dept){
  const item=createWorkItem(dept,projectWorkType(project,dept),clamp(project.priority+(project.hiddenReality.trueTechnicalDifficulty-50)*.25,35,95));
  item.projectId=project.id;item.title=`${project.codename}: ${item.title}`;item.deadlineDay=Math.min(item.deadlineDay,project.deadlineDay);item.qualityRisk=clamp(item.qualityRisk+project.visibleRisk*.15,0,100);
  project.workItemIds=[...new Set([...(project.workItemIds||[]),item.id])];
  return item;
}
function ensureProjectAllocations(){
  ensureProjectPortfolio();
  const active=activeProjects();
  active.forEach(p=>{
    p.staffAllocations=p.staffAllocations&&typeof p.staffAllocations==="object"?p.staffAllocations:{};
    const validIds=new Set(employees.filter(e=>e.active).map(e=>String(e.id)));
    for(const id of Object.keys(p.staffAllocations))if(!validIds.has(String(id)))delete p.staffAllocations[id];
    p.assignedEmployees=Object.keys(p.staffAllocations).map(Number).filter(Number.isFinite);
  });
  let loads=normalizeProjectAllocations(active);
  const remaining={};
  employees.filter(e=>e.active).forEach(e=>remaining[e.id]=Math.max(0,(loads[e.id]?.capacity??employeeProjectCapacity(e))-(loads[e.id]?.load||0)));
  active
    .slice()
    .sort((a,b)=>(b.priority||0)-(a.priority||0))
    .forEach(p=>{
      p.staffAllocations=p.staffAllocations&&typeof p.staffAllocations==="object"?p.staffAllocations:{};
      for(const [dept,needRaw] of Object.entries(p.requiredHeadcount||{})){
        let need=Math.max(0,Number(needRaw)||0);
        const assigned=Object.entries(p.staffAllocations)
          .filter(([id])=>employees.find(e=>e.active&&e.id===Number(id)&&roleDepartment(e.role)===dept))
          .reduce((s,[,v])=>s+(Number(v)||0),0);
        need=Math.max(0,need-assigned);
        if(need<=.05)continue;
        const candidates=employees
          .filter(e=>e.active&&roleDepartment(e.role)===dept&&(remaining[e.id]||0)>.05)
          .map(e=>({e,score:projectAffinityScore(e,p.id)*1.5+(e.focus||50)*.4+(e.morale||50)*.16-(e.stress||0)*.18+workSkillFit(e,{requiredSkills:p.requiredSkills||{}})*40}))
          .sort((a,b)=>b.score-a.score);
        for(const row of candidates){
          if(need<=.05)break;
          const allocation=clamp(Math.min(remaining[row.e.id]||0,need,.75),0,.75);
          if(allocation<=.05)continue;
          p.staffAllocations[row.e.id]=Number(((Number(p.staffAllocations[row.e.id])||0)+allocation).toFixed(2));
          row.e.projectAffinity={...(row.e.projectAffinity||{}),[p.id]:clamp(projectAffinityScore(row.e,p.id)+allocation*3,0,100)};
          remaining[row.e.id]=Math.max(0,(remaining[row.e.id]||0)-allocation);
          if(row.e.workload){row.e.workload.projectLoad=Number(((row.e.workload.projectLoad||0)+allocation).toFixed(2));row.e.workload.projectOverload=Number(Math.max(0,(row.e.workload.projectLoad||0)-(row.e.workload.projectCapacity||0)).toFixed(2));row.e.workload.projectCount=(row.e.workload.projectCount||0)+1;}
          need-=allocation;
        }
      }
      p.assignedEmployees=Object.keys(p.staffAllocations).map(Number).filter(Number.isFinite);
    });
  computeProjectCapacityState(active);
}
function projectAllocatedFte(project,dept){
  const allocations=project?.staffAllocations||{};
  return Object.entries(allocations).reduce((s,[id,v])=>{
    const e=employees.find(x=>x.active&&x.id===Number(id));
    return e&&roleDepartment(e.role)===dept?s+(Number(v)||0):s;
  },0);
}
function recordProjectLedger(projectId,source,metric,delta,reason){
  const p=(company.projects||[]).find(x=>x.id===projectId);
  if(!p)return;
  p.causalLedger=Array.isArray(p.causalLedger)?p.causalLedger:[];
  p.causalLedger.push({day:company.day,minute:company.minute,source,metric,delta:Number(delta)||0,reason});
  if(p.causalLedger.length>80)p.causalLedger=p.causalLedger.slice(-80);
}
function projectBacklogTarget(project,pace=projectPaceProfile(project)){
  const deptCount=Math.max(1,(project.requiredDepartments||[]).length);
  const scope=Number(project.scope)||1;
  const difficulty=Number(project.hiddenReality?.trueTechnicalDifficulty||project.visibleRisk||55);
  return clamp(Math.round(deptCount*(pace.major?1.45:1.05)+Math.max(0,scope-1)*deptCount+Math.max(0,difficulty-58)/18),deptCount,deptCount+5);
}
function createProjectBacklogItem(project,reason="development pressure"){
  const departments=(project.requiredDepartments||[]).filter(Boolean);
  if(!departments.length)return null;
  const dept=departments[Math.abs(Math.floor((company.day||0)+simulationRandom()*departments.length))%departments.length];
  const item=createProjectWorkItem(project,dept);
  item.priority=clamp((item.priority||50)+(reason==="schedule pressure"?8:reason==="quality risk"?6:3),20,100);
  item.qualityRisk=clamp((item.qualityRisk||40)+(reason==="quality risk"?10:4),0,100);
  company.workItems.push(item);
  rebuildRuntimeIndexes();
  recordProjectLedger(project.id,"development-friction","backlog",1,`New ${dept} work opened from ${reason}`);
  return item;
}
function maybeAddProjectBlocker(project,items,{coverage=100,overload=0,scheduleVariance=0,budgetVariance=0,riskTrend=50,conditionDelta=0}={}){
  if(!items.length)return false;
  const openWithoutBlocker=items.filter(w=>!(w.blockedBy||[]).length&&w.progress<96);
  if(!openWithoutBlocker.length)return false;
  const deadlinePressure=Math.max(0,company.day-(project.deadlineDay||9999)+7);
  const qualityPressure=Math.max(0,(riskTrend||0)-58)+Math.max(0,62-(project.quality||55));
  const staffingPressure=Math.max(0,72-(coverage||100))*0.42+Math.max(0,overload||0)*0.75;
  const schedulePressure=Math.max(0,scheduleVariance||0)*0.38+Math.max(0,budgetVariance||0)*0.14+deadlinePressure*1.6;
  const complexityPressure=Math.max(0,(project.hiddenReality?.trueTechnicalDifficulty||55)-55)*0.32;
  const companyPressure=Math.max(0,-conditionDelta)*0.35+Math.max(0,avgStress()-62)*0.22;
  const chance=clamp((qualityPressure+staffingPressure+schedulePressure+complexityPressure+companyPressure)/1400,0.006,0.13);
  if(simulationRandom()>=chance)return false;
  const target=openWithoutBlocker.slice().sort((a,b)=>(b.qualityRisk||0)+(b.priority||0)*.35-((a.qualityRisk||0)+(a.priority||0)*.35))[0];
  const blocker=contentPick(v23Content.blockers,(target.priority||0)+(riskTrend||0));
  target.blockedBy=[...(target.blockedBy||[]),blocker];
  target.qualityRisk=clamp((target.qualityRisk||40)+6,0,100);
  addStoryBeat(target.storyId,`${target.title} became blocked by ${blocker}.`,"blocker");
  recordProjectLedger(project.id,"development-friction","blocker",1,`Development friction created blocker: ${blocker}`);
  recordWeeklyEvent(`${project.title} hit a development blocker: ${blocker}.`,"project",3);
  return true;
}
function maybeResolveProjectBlocker(project,items,{coverage=100,overload=0,conditionDelta=0}={}){
  const blocked=items.filter(w=>(w.blockedBy||[]).length);
  if(!blocked.length)return false;
  const communication=Math.max(0,(company.culture?.communication??50)-50);
  const support=Math.max(0,(coverage||0)-55)*0.002+Math.max(0,conditionDelta)*0.0015+communication*0.001;
  const drag=Math.max(0,overload||0)*0.0015+Math.max(0,avgStress()-70)*0.001;
  const chance=clamp(0.025+support-drag,0.006,0.14);
  if(simulationRandom()>=chance)return false;
  const target=blocked.slice().sort((a,b)=>(b.progress||0)-(a.progress||0))[0];
  const blocker=target.blockedBy.shift();
  target.qualityRisk=clamp((target.qualityRisk||40)-5,0,100);
  addStoryBeat(target.storyId,`${target.title} cleared ${blocker}.`,"unblocked");
  recordProjectLedger(project.id,"development-friction","blocker",-1,`Team cleared blocker: ${blocker}`);
  return true;
}
function applyProjectDevelopmentFriction(project,allItems,items,metrics){
  if(project.status==="paused")return {items,blockers:items.reduce((s,w)=>s+(w.blockedBy?.length||0),0),backlog:items.length};
  const pace=projectPaceProfile(project);
  const target=projectBacklogTarget(project,pace);
  const isLate=company.day>(project.deadlineDay||9999)&&project.progress<96;
  const schedulePressure=(metrics.scheduleVariance||0)>18||isLate;
  const qualityPressure=(metrics.riskTrend||0)>68||(project.quality||55)<50;
  const staffingPressure=(metrics.coverage||100)<72||(metrics.overload||0)>12;
  let currentOpen=items.length;
  const maxItems=Math.min(96,52+(company.projects||[]).length*8);
  if(currentOpen<target&&company.workItems.length<maxItems){
    const reason=schedulePressure?"schedule pressure":qualityPressure?"quality risk":staffingPressure?"staffing pressure":"development pressure";
    const added=createProjectBacklogItem(project,reason);
    if(added){allItems.push(added);items.push(added);currentOpen++;}
  }
  if((schedulePressure||qualityPressure||staffingPressure||pace.major)&&items.length)maybeAddProjectBlocker(project,items,metrics);
  maybeResolveProjectBlocker(project,items,metrics);
  const blockers=items.reduce((s,w)=>s+(w.blockedBy?.length||0),0);
  return {items,blockers,backlog:items.length};
}
function projectPerformanceUpdate(){
  ensureProjectPortfolio();
  rebuildRuntimeIndexes();
  ensureProjectAllocations();
  const active=activeProjects();
  active.forEach(p=>{
    const allItems=(company.runtime?.workItemsByProjectId?.[p.id])||(company.workItems||[]).filter(w=>w.projectId===p.id);
    let items=allItems.filter(w=>w.status==="open"),done=allItems.filter(w=>w.status==="closed");
    const mod=projectExecutionModifiers(p),pace=projectPaceProfile(p),lateDrag=projectLateStageDrag(p,p.progress);
    const avgProgress=items.length?items.reduce((s,w)=>s+(w.progress||0),0)/items.length:(done.length?100:p.progress||0);
    const coverage=derivedStaffingCoverage(p),overload=projectOverloadPressure(p);
    const condition=typeof projectCompanyConditionScore==="function"?projectCompanyConditionScore(p):{score:60};
    const conditionDelta=(condition.score-60);
    const spendDaily=(p.estimatedCost/Math.max(30,p.estimatedDuration))*(p.status==="paused" ? .12 : 1)*(p.scope||1)*mod.budget;
    p.budgetSpent=Number(((p.budgetSpent||0)+spendDaily).toFixed(3));
    p.closeoutReadyDays=Number(p.closeoutReadyDays)||0;
    const beforeProgress=p.progress||0;
    const staffingContribution=(coverage-50)*.012*pace.progressMultiplier-overload*.006;
    const conditionProgress=conditionDelta*.006*pace.progressMultiplier;
    p.progress=clamp((p.progress||0)*.86+avgProgress*.14*mod.progress*pace.progressMultiplier*lateDrag*(1-overload*.003)+staffingContribution+conditionProgress,0,100);
    if(Math.abs(p.progress-beforeProgress)>.25)recordProjectLedger(p.id,"project-performance","progress",p.progress-beforeProgress,"Aggregated paced work-item progress and staffing coverage");
    let blockers=items.reduce((s,w)=>s+(w.blockedBy?.length||0),0);
    p.quality=clamp((p.quality||55)+(company.quality-55)*.015+conditionDelta*.018-blockers*.08*mod.defectRisk+(coverage-50)*.01-overload*.018,0,100);
    p.integration=clamp((p.integration||35)+(company.integration-45)*.012+done.length*.08,0,100);
    p.customerInterest=clamp((p.customerInterest||45)+((company.market.aiDemand-50)*.01+(company.trust-55)*.01-p.hiddenReality.hiddenObsolescenceRate*.002)*mod.customer,0,100);
    const scheduleVariance=Math.round(((company.day-(p.createdDay||company.day))/(p.estimatedDuration||90)*100-(p.progress||0))*mod.schedule);
    const budgetVariance=Math.round(((p.budgetSpent||0)/Math.max(.1,p.estimatedCost)-((p.progress||1)/100))*100);
    let riskTrend=clamp((p.visibleRisk||50)+blockers*5+Math.max(0,scheduleVariance)*.25+Math.max(0,budgetVariance)*.3+overload*.22-coverage*.08-Math.max(-18,conditionDelta)*.10,0,100);
    const friction=applyProjectDevelopmentFriction(p,allItems,items,{coverage,overload,scheduleVariance,budgetVariance,riskTrend,conditionDelta});
    items=friction.items;blockers=friction.blockers;
    riskTrend=clamp((p.visibleRisk||50)+blockers*5+Math.max(0,scheduleVariance)*.25+Math.max(0,budgetVariance)*.3+overload*.22-coverage*.08-Math.max(-18,conditionDelta)*.10,0,100);
    const fallbackProjectHealth=typeof projectVisibleHealth==="function"?projectVisibleHealth(p):50;
    const executionHealth=typeof projectExecutionHealthBreakdown==="function"?projectExecutionHealthBreakdown(p):{current:fallbackProjectHealth,base:50,companyCondition:condition.score,companyModifier:0,staffingModifier:0,riskModifier:0,profile:condition.profile};
    p.performance={progress:Math.round(p.progress),scheduleVariance,budgetVariance,quality:Math.round(p.quality),integration:Math.round(p.integration),teamHealth:Math.round(clamp(100-avgStress()+coverage*.2-overload*.25+conditionDelta*.05,0,100)),staffingCoverage:Math.round(coverage),workloadOverload:Math.round(overload),blockerCount:blockers,backlogCount:friction.backlog,customerInterest:Math.round(p.customerInterest),strategicConfidence:Math.round(clamp((p.visibleConfidence||55)+(p.quality-55)*.08+(p.customerInterest-50)*.1-overload*.04+conditionDelta*.08,0,100)),riskTrend:Math.round(riskTrend),benefitRealization:Math.round(clamp((p.progress||0)*p.hiddenReality.trueStrategicValue/100,0,100)),forecastAtCompletion:Math.round(clamp(100-riskTrend*.45+(p.customerInterest||50)*.25,0,100)),executionHealth:executionHealth.current,baseHealth:executionHealth.base,companyCondition:executionHealth.companyCondition,companyModifier:executionHealth.companyModifier,staffingModifier:executionHealth.staffingModifier,riskModifier:executionHealth.riskModifier,dependencyProfile:executionHealth.profile};
    if(Math.abs(conditionDelta)>18&&company.day%7===0)recordProjectLedger(p.id,"company-conditions","executionHealth",conditionDelta*.08,`Relevant company conditions ${conditionDelta>0?"supported":"weighed on"} execution`);
    if(overload>20&&items.length&&simulationRandom()<clamp((overload-15)*.0015,0,.08)){
      const target=items.slice().sort((a,b)=>(b.qualityRisk||0)-(a.qualityRisk||0))[0];
      if(target&&!target.blockedBy?.length){target.blockedBy=[...(target.blockedBy||[]),contentPick(v23Content.blockers,overload)];target.qualityRisk=clamp((target.qualityRisk||40)+6,0,100);recordProjectLedger(p.id,"capacity","blocker",1,"Overloaded project staffing created a blocker");}
    }
    const doneRatio=allItems.length?done.length/Math.max(1,allItems.length):0;
    const closeoutReady=(p.progress>=99.5)||(avgProgress>=(pace.major?99.8:99.5)&&blockers===0)||(allItems.length>0&&doneRatio>=(pace.major ? .98 : .95)&&blockers===0)||(company.day>=(p.deadlineDay||9999)&&p.progress>=(pace.major?97:96)&&blockers===0&&(p.quality||0)>=(pace.major?64:60));
    const closeoutNeeded=pace.closeoutDays;
    p.closeoutReadyDays=closeoutReady?Math.min(closeoutNeeded+1,(p.closeoutReadyDays||0)+1):0;
    if(p.closeoutReadyDays>=closeoutNeeded&&p.progress<100){p.progress=100;p.performance.progress=100;recordProjectLedger(p.id,"project-closeout","progress",100-beforeProgress,`Near-complete project accepted after ${closeoutNeeded} readiness checks`);}
    if(riskTrend>72&&p.status!=="blocked")p.status="at risk";
    if(p.progress>=100){p.status="completed";p.completedDay=company.day;archiveProjectOnce(p,"completed");updateProjectCommercialStats(p);recordWeeklyEvent(`${p.title} completed.`,"project",6);recordMajorHistory(`${p.title} completed and shaped the company portfolio.`,"project",6);if(p.commercialStatus==="ready")recordHistory(`${p.title} is ready for commercial review after completion.`,"product",4);reinforceProjectLesson("estimateAccuracy",budgetVariance<20?.8:-.5,p.title,8,budgetVariance<20?"positive":"contradiction");reinforceProjectLesson("crossDepartmentCoordination",blockers<2?.7:-.4,p.title,7,blockers<2?"positive":"mixed");reinforceProjectLesson("knowledgeValue",(p.hiddenReality?.trueKnowledgeValue||50)>60?.6:.2,p.title,5,"positive");createOrReinforceLesson({key:"project-completion-learning",title:"Completed projects improve future project estimation and coordination.",department:p.proposingDepartment,vector:{planning:.8,documentation:.5,collaboration:.5,estimateAccuracy:.5,crossDepartmentCoordination:.6},outcome:"positive",confidence:70,evidence:p.title,importance:5});}
  });
  deriveLegacyProgressFromProjects();
}
function deriveLegacyProgressFromProjects(){
  const projects=activeProjects().concat((company.projectArchive||[]).filter(p=>p.status==="completed").slice(0,3));
  if(!projects.length)return;
  const metric=(filter,reader,fallback)=> {
    const list=projects.filter(filter);
    const value=weightedProjectMetric(list.length?list:projects,reader);
    return value==null?fallback:value;
  };
  company.chip=clamp(metric(p=>projectMatchesCategory(p,"hardware"),p=>Number(p.progress)||0,company.chip),0,100);
  company.software=clamp(metric(p=>projectMatchesCategory(p,"software"),p=>Number(p.progress)||0,company.software),0,100);
  company.integration=clamp(metric(p=>true,p=>Number(p.integration??p.performance?.integration??company.integration),company.integration),0,100);
  company.quality=clamp(metric(p=>true,p=>Number(p.quality??p.performance?.quality??company.quality),company.quality),0,100);
}
function projectCommercialReadiness(project){
  const quality=Number(project.performance?.quality??project.quality??company.quality)||0;
  const integration=Number(project.performance?.integration??project.integration??company.integration)||0;
  const risk=Number(project.performance?.riskTrend??project.visibleRisk??50)||0;
  const confidence=Number(project.performance?.strategicConfidence??project.visibleConfidence??50)||0;
  return Math.round(clamp(quality*.30+integration*.25+(100-risk)*.20+confidence*.15+(company.trust||50)*.10,0,100));
}
function projectCommercialPotential(project){
  const interest=Number(project.performance?.customerInterest??project.customerInterest??0)||0;
  const benefit=Number(project.estimatedBenefit??50)||50;
  const market=Number(project.hiddenReality?.trueMarketDemand??interest)||interest;
  const value=Number(project.hiddenReality?.trueStrategicValue??benefit)||benefit;
  const readiness=projectCommercialReadiness(project);
  return Math.round(clamp(interest*.36+benefit*.20+market*.18+value*.16+readiness*.10,0,100));
}
function updateProjectCommercialStats(project){
  if(!project)return project;
  project.commercialReadiness=projectCommercialReadiness(project);
  project.commercialPotential=projectCommercialPotential(project);
  const raw=(project.commercialPotential/100)*(project.commercialReadiness/100)*Math.max(.6,Number(project.scope||1))*0.18;
  project.projectedDailyRevenue=Number(clamp(raw,0,.35).toFixed(3));
  if(project.status==="completed"&&!["ready","review queued","pilot","launched","shelved"].includes(project.commercialStatus)){
    project.commercialStatus=project.commercialPotential>=62&&project.commercialReadiness>=52?"ready":"completed";
  }
  return project;
}
function projectCommercialStatusLabel(project){
  updateProjectCommercialStats(project);
  return {
    "not ready":"Not commercial yet",
    completed:"Completed; no commercial plan",
    ready:"Ready for commercial review",
    "review queued":"Commercial review queued",
    pilot:"Commercial pilot",
    launched:"Generating revenue",
    shelved:"Shelved"
  }[project.commercialStatus]||projectStatusLabel(project);
}
function commercialProjectRevenueDaily(){
  ensureProjectPortfolio();
  return Number((company.projectArchive||[]).reduce((sum,p)=>{
    updateProjectCommercialStats(p);
    if(p.commercialStatus==="launched")return sum+(Number(p.projectedDailyRevenue)||0)*.15;
    if(p.commercialStatus==="pilot")return sum+(Number(p.projectedDailyRevenue)||0)*.06;
    return sum;
  },0).toFixed(3));
}

class ProjectPortfolioSystem{
  ensure(){return ensureProjectPortfolio();}
  update(){return updateProjectPortfolioSystem();}
  active(){return activeProjects();}
  archive(project,status=null){return archiveProjectOnce(project,status);}
  health(){return updatePortfolioHealth();}
  requestDecision(id,action="review"){return requestProjectDecision(id,action);}
  requestCommercialReview(id){return requestProjectCommercialReview(id);}
  dailyRevenue(){return commercialProjectRevenueDaily();}
}
