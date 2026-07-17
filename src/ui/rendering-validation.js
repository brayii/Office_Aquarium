function collectDailyMetrics(){
  ensureBibleSystems?.();
  company.simulationMetrics=normalizeSimulationMetrics(company.simulationMetrics);
  const active=employees.filter(e=>e.active),msgs=countRecentMessages(5),counters=company.simulationMetrics.counters;
  const morale=active.reduce((s,e)=>s+e.morale,0)/Math.max(1,active.length),stress=avgStress();
  const routes={local:msgs.filter(m=>m.status==="open").length,info:msgs.filter(m=>m.status==="executive-info").length,queued:msgs.filter(m=>m.status==="queued-for-ceo").length,resolved:msgs.filter(m=>m.status==="resolved-by-ceo").length,suppressed:msgs.filter(m=>m.status==="suppressed").length};
  const recentMemos=(company.communications||[]).filter(m=>company.day-(m.day??company.day)<=5);
  const categories=recentMemos.map(m=>m.eventId||m.type||"memo"),uniqueCategories=new Set(categories);
  const repeatedMemoRate=categories.length?Math.round((1-uniqueCategories.size/categories.length)*100):0;
  updateCompanyRiskComponents?.();
  const f=company.finance||{};
  const qualityTelemetry={mistakesCreated:0,mistakesResolved:0,defectsReopened:0,verificationFailures:0,rushedWorkMistakes:0,stressRelatedMistakes:0,lowFocusMistakes:0,weakCultureMistakes:0,manufacturingDefects:0,reworkActions:0,...(counters.qualityTelemetry||{})};
  const unresolvedQualityMistakes=active.reduce((s,e)=>s+(e.performance?.qualityMistakes||0),0);
  qualityTelemetry.averageDaysToResolve=Number((unresolvedQualityMistakes/Math.max(.1,qualityTelemetry.mistakesResolved||0)).toFixed(2));
  const derived=recordOperatingHealthSnapshot();
  const snapshot={day:company.day,cash:Number(company.cash.toFixed(2)),phase:company.phase,activeEmployees:active.length,morale:Math.round(derived.morale??morale),stress:Math.round(stress),quality:Math.round(company.quality),integration:Math.round(company.integration),customers:Math.round(company.customers),grossRevenueDaily:Number((f.grossRevenueDaily||company.dailyRevenue||0).toFixed(3)),payrollDaily:Number((f.payrollDaily||0).toFixed(3)),manufacturingDaily:Number((f.manufacturingDaily||0).toFixed(3)),supportDaily:Number((f.supportDaily||0).toFixed(3)),growthOverhead:Number((f.growthOverhead||0).toFixed(3)),totalDailyCost:Number((f.totalDailyCost||0).toFixed(3)),qualityMistakes:Math.round(unresolvedQualityMistakes),qualityTelemetry,messages5d:msgs.length,routes,actionDiversity:actionDiversityScore(counters.actions),learningSpread:learningSpread(),learningMagnitude:averageLearningMagnitude(),memoDiversity:uniqueCategories.size,repeatedMemoRate,survivalRisk:Math.round(clamp(company.companyRiskComponents?.total??35,0,100)),netCashFlow:Number((f.netCashFlowDaily||0).toFixed(3)),runwayDays:f.runwayDays||999,boardStrikes:company.boardGovernance?.strikes||0,unpaidPayrollDays:company.unpaidPayrollDays||0,investorConfidence:derived.investorConfidence,operatingHealth:{hardwareHealth:derived.hardwareHealth,softwareHealth:derived.softwareHealth,manufacturingHealth:derived.manufacturingHealth,customerSentiment:derived.customerSentiment,investorConfidence:derived.investorConfidence,shareholderConfidence:derived.shareholderConfidence,teamCohesion:derived.teamCohesion,trust:derived.trust,portfolioHealth:derived.portfolioHealth,financeHealth:derived.financeHealth},counters:{...counters,actions:{...counters.actions},qualityTelemetry:{...qualityTelemetry}}};
  const flags=[];
  if(snapshot.stress>70)flags.push("stress-high");
  if(snapshot.repeatedMemoRate>50&&recentMemos.length>=3)flags.push("memo-repetition");
  if(snapshot.learningMagnitude>7.5)flags.push("learning-drift");
  if(snapshot.routes.queued+snapshot.routes.resolved>8)flags.push("ceo-interruptions-high");
  if(company.day>30&&(snapshot.qualityMistakes>32||qualityTelemetry.mistakesCreated/Math.max(1,company.day)>1.8))flags.push("quality-rework-high");
  if(snapshot.actionDiversity<38&&company.day>10)flags.push("low-action-diversity");
  snapshot.flags=flags;
  company.simulationMetrics.daily=[...(company.simulationMetrics.daily||[]).filter(d=>d.day!==company.day),snapshot].slice(-320);
  company.simulationMetrics.lastBalance=snapshot;
  if(flags.length&&company.day%5===0)recordWeeklyEvent(`Simulation balance watch: ${flags.join(", ")}.`,"metrics",2);
}
function seededRandom(seedText){
  let h=2166136261>>>0;
  for(let i=0;i<String(seedText).length;i++){h^=String(seedText).charCodeAt(i);h=Math.imul(h,16777619);}
  return function(){h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
}
function seedToRandomState(seedText){
  let h=2166136261>>>0;
  for(let i=0;i<String(seedText).length;i++){h^=String(seedText).charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0||2463534242;
}
function summarizeProjection(seed,days,daily,finalCompany,finalEmployees){
  const last=daily[daily.length-1]||{},avg=key=>Math.round(daily.reduce((s,d)=>s+(d[key]||0),0)/Math.max(1,daily.length));
  const flags=[...new Set(daily.flatMap(d=>d.flags||[]))];
  const counters=last.counters||{};
  const qualityTelemetry={mistakesCreated:0,mistakesResolved:0,defectsReopened:0,verificationFailures:0,rushedWorkMistakes:0,stressRelatedMistakes:0,lowFocusMistakes:0,weakCultureMistakes:0,manufacturingDefects:0,reworkActions:0,averageDaysToResolve:0,...(last.qualityTelemetry||counters.qualityTelemetry||{})};
  const launched=daily.filter(d=>d.phase==="launched"||d.phase==="pilot");
  const avgNum=(list,key)=>Number((list.reduce((s,d)=>s+(Number(d[key])||0),0)/Math.max(1,list.length)).toFixed(3));
  return {seed,daysRun:daily.length,endedEarly:daily.length<days,finalDay:last.day??0,phase:finalCompany.phase,cash:Number(finalCompany.cash.toFixed(2)),activeEmployees:finalEmployees.filter(e=>e.active).length,avgStress:avg("stress"),avgMorale:avg("morale"),avgSurvivalRisk:avg("survivalRisk"),finalStress:last.stress||0,finalMorale:last.morale||0,finalSurvivalRisk:last.survivalRisk||0,actionDiversity:last.actionDiversity||0,learningSpread:last.learningSpread||0,learningMagnitude:last.learningMagnitude||0,messages5d:last.messages5d||0,memoRepeat:last.repeatedMemoRate||0,avgNetCashFlow:avgNum(daily,"netCashFlow"),postLaunchNetCashFlow:avgNum(launched,"netCashFlow"),finalRunwayDays:last.runwayDays||999,finalTotalDailyCost:last.totalDailyCost||0,finalGrossRevenueDaily:last.grossRevenueDaily||0,qualityMistakes:Math.round(counters.qualityMistakes||0),unresolvedQualityMistakes:last.qualityMistakes||0,qualityTelemetry,sickness:Math.round(counters.sickness||0),resignations:Math.round(counters.resignations||0),firings:Math.round(counters.firings||0),coaching:Math.round(counters.coaching||0),ceoDecisions:Math.round(counters.ceoDecisions||0),executiveMemos:Math.round(counters.executiveMemos||0),queuedEscalations:Math.round(counters.queuedEscalations||0),flags};
}
function createRuntimeIdService(start=1){
  let nextId=Math.max(1,Number(start)||1);
  return {next:()=>nextId++,peek:()=>nextId};
}
function createSeededRng(seed){return seededRandom(seed);}
function createIsolatedServices(){return {validation:true};}
function cloneForValidation(value){return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));}
function createFreshCompanyState(seed){
  const state=cloneForValidation(initialCompany);
  state.randomState=seedToRandomState(seed);
  state.nextRuntimeId=1;
  state.paused=false;
  state.speed=1;
  state.pendingEvent=null;
  state.pendingCommunication=null;
  state.simulationMetrics=normalizeSimulationMetrics(state.simulationMetrics);
  return state;
}
function withSimulationContext(context,fn){
  assertIsolatedValidationEnvironment(context);
  const live={company,employees,validationMode,currentSimulationContext,selectedEmployeeId,debugMode};
  try{
    company=context.company;
    employees=context.employees;
    validationMode=true;
    currentSimulationContext=context;
    return fn();
  }finally{
    context.company=company;
    context.employees=employees;
    company=live.company;
    employees=live.employees;
    validationMode=live.validationMode;
    currentSimulationContext=live.currentSimulationContext;
    selectedEmployeeId=live.selectedEmployeeId;
    debugMode=live.debugMode;
  }
}
function initializeIsolatedEmployees(){
  employees=names.map((_,i)=>makeEmployee(i));
  const shuffled=traits.map(x=>[...x]).sort(()=>simulationRandom()-.5);
  employees.forEach((e,i)=>{e.traits=shuffled[i];e.energy=clamp(e.energy+rand(-8,8),55,95);e.morale=clamp(e.morale+rand(-8,8),52,90);e.focus=clamp(e.focus+rand(-8,8),45,92);});
  employees.forEach(a=>employees.forEach(b=>{if(a!==b)a.relationship[b.id]=Math.round(simulationRandom()*55-18)}));
}
function createIsolatedValidationContext({seed,scenario="fresh-company",saveSnapshot=null}={}){
  const repository=new InMemorySaveRepository();
  const runtimeIds=createRuntimeIdService(1);
  const context=new SimulationContext({company:createFreshCompanyState(seed||"isolated-validation"),employees:[],rng:createSeededRng(seed||"isolated-validation"),runtimeIds,repository,timer:new ManualSimulationTimer(),eventBus:new IsolatedEventBus(),services:createIsolatedServices(),mode:"isolated-validation"});
  withSimulationContext(context,()=>{
    if(saveSnapshot?.company){
      company={...createFreshCompanyState(seed||"snapshot"),...cloneForValidation(saveSnapshot.company),randomState:seedToRandomState(seed||"snapshot"),nextRuntimeId:1};
      employees=Array.isArray(saveSnapshot.employees)?cloneForValidation(saveSnapshot.employees):[];
    }else{
      const climates=[{name:"Cautious market",cash:-1.5,board:4,trust:3},{name:"Investor optimism",cash:2,board:6,trust:-2},{name:"Competitive pressure",cash:0,board:-3,trust:1},{name:"Stable opening",cash:0,board:0,trust:0}];
      const climate=climates[Math.floor(simulationRandom()*climates.length)];
      company.cash=clamp(company.cash+climate.cash,14,21);
      company.board=clamp(company.board+climate.board,58,82);
      company.trust=clamp(company.trust+climate.trust,55,78);
      company.valuation=clamp(company.valuation+rand(-4,4),34,50);
      company.log=[`Isolated validation started during a ${climate.name.toLowerCase()}.`];
      initializeIsolatedEmployees();
    }
    company.weekStartSnapshot=captureWeekSnapshot();
    ensureBibleSystems?.();
    rebuildRuntimeIndexes?.();
    ensureProjectAllocations?.();
    updateManufacturingAndStakeholders?.();
    updateCompanyInformationSystem?.();
    collectDailyMetrics?.();
  });
  return context;
}
function simulateMinutesInContext(context,minutes=5){
  assertIsolatedValidationEnvironment(context);
  return withSimulationContext(context,()=>{
    const ticks=Math.max(1,Math.floor(minutes/5));
    for(let i=0;i<ticks&&!company.gameOver&&!company.lastSimulationError;i++)simulateMinute(false);
    return {day:company.day,minute:company.minute,gameOver:company.gameOver,error:company.lastSimulationError||null};
  });
}
function runProjectionInContext(context,{days=120,seed="isolated-validation",failureHook=null}={}){
  assertIsolatedValidationEnvironment(context);
  return withSimulationContext(context,()=>{
    const targetDays=company.day+days;
    while(company.day<targetDays&&!company.gameOver&&!company.lastSimulationError){
      if(typeof failureHook==="function")failureHook({day:company.day,minute:company.minute,company,employees});
      simulateMinute(false);
    }
    collectDailyMetrics();
    const report=summarizeProjection(seed,days,company.simulationMetrics?.daily||[],company,employees);
    report.survival=!report.endedEarly&&!company.gameOver&&company.cash>0;
    report.ceoRemoval=company.failureType==="ceo-fired";
    report.companyFailure=company.failureType==="company-failure";
    report.crisisCount=(company.history||[]).filter(h=>String(h.type||"").includes("crisis")||String(h.text||"").toLowerCase().includes("crisis")).length;
    report.projectCompletion=(company.projectArchive||[]).length;
    report.customerChurn=company.customerTelemetry?.churned||0;
    report.investorConfidence=derivedOperatingHealth?.().investorConfidence??company.shareholders?.confidence??0;
    report.companyRisk=company.companyRiskComponents?.total??0;
    report.deterministicHash=typeof hashAuthoritativeState==="function"?hashAuthoritativeState(company,employees):stateHash();
    report.storageWrites=context.repository.writeCount;
    context.report=report;
    lastValidationReport=report;
    return report;
  });
}
function runBalanceProjection(contextOrDays=120,options={}){
  if(typeof options==="string")options={seed:options};
  const hasContext=contextOrDays instanceof SimulationContext;
  const days=hasContext?(options.days||120):contextOrDays;
  const seed=options.seed||`isolated-seed-${days}`;
  const context=hasContext?contextOrDays:createIsolatedValidationContext({seed});
  assertIsolatedValidationEnvironment(context);
  return runProjectionInContext(context,{days,seed,failureHook:options.failureHook});
}
function runDeterministicContinuationCheck(seed="determinism-isolated",midDays=50,totalDays=100){
  const context=createIsolatedValidationContext({seed});
  assertIsolatedValidationEnvironment(context);
  return withSimulationContext(context,()=>{
    const midTarget=company.day+midDays;
    while(company.day<midTarget&&!company.gameOver&&!company.lastSimulationError)simulateMinute(false);
    const midCompany=cloneForValidation(company),midEmployees=cloneForValidation(employees);
    while(company.day<totalDays&&!company.gameOver&&!company.lastSimulationError)simulateMinute(false);
    const hashA=typeof hashAuthoritativeState==="function"?hashAuthoritativeState(company,employees):stateHash();
    company=cloneForValidation(midCompany);employees=cloneForValidation(midEmployees);
    while(company.day<totalDays&&!company.gameOver&&!company.lastSimulationError)simulateMinute(false);
    const hashB=typeof hashAuthoritativeState==="function"?hashAuthoritativeState(company,employees):stateHash();
    return {seed,midDays,totalDays,hashA,hashB,passed:hashA===hashB,isolated:true};
  });
}
function summarizeProjectionMatrix(reports){
  const avg=key=>Math.round(reports.reduce((s,r)=>s+(Number(r[key])||0),0)/Math.max(1,reports.length));
  const percentile=(values,p)=>{const list=values.map(Number).filter(Number.isFinite).sort((a,b)=>a-b);if(!list.length)return 0;return Number(list[Math.min(list.length-1,Math.max(0,Math.floor((list.length-1)*p)))].toFixed(2));};
  const median=values=>percentile(values,.5);
  const survival=reports.filter(r=>!r.endedEarly&&r.cash>0&&r.activeEmployees>=4).length;
  const flags=[...new Set(reports.flatMap(r=>r.flags||[]))];
  const minCash=Math.min(...reports.map(r=>Number(r.cash)||0));
  const maxStress=Math.max(...reports.map(r=>Number(r.finalStress)||0));
  const endedEarly=reports.filter(r=>r.endedEarly).length;
  const avgQ=key=>Number((reports.reduce((s,r)=>s+(Number(r.qualityTelemetry?.[key])||0),0)/Math.max(1,reports.length)).toFixed(1));
  const qualityTelemetry={mistakesCreated:avgQ("mistakesCreated"),mistakesResolved:avgQ("mistakesResolved"),defectsReopened:avgQ("defectsReopened"),verificationFailures:avgQ("verificationFailures"),rushedWorkMistakes:avgQ("rushedWorkMistakes"),stressRelatedMistakes:avgQ("stressRelatedMistakes"),lowFocusMistakes:avgQ("lowFocusMistakes"),weakCultureMistakes:avgQ("weakCultureMistakes"),manufacturingDefects:avgQ("manufacturingDefects"),reworkActions:avgQ("reworkActions"),averageDaysToResolve:avgQ("averageDaysToResolve")};
  return {runs:reports.length,survivalRate:Math.round(survival/Math.max(1,reports.length)*100),endedEarly,minCash,maxStress,medianFinalCash:median(reports.map(r=>r.cash)),cashP10:percentile(reports.map(r=>r.cash),.1),cashP90:percentile(reports.map(r=>r.cash),.9),medianNetCashFlow:median(reports.map(r=>r.avgNetCashFlow)),medianPostLaunchNetCashFlow:median(reports.map(r=>r.postLaunchNetCashFlow)),avgStress:avg("avgStress"),avgMorale:avg("avgMorale"),avgSurvivalRisk:avg("avgSurvivalRisk"),avgActionDiversity:avg("actionDiversity"),avgLearningSpread:avg("learningSpread"),avgMemoRepeat:avg("memoRepeat"),avgCeoDecisions:avg("ceoDecisions"),avgEscalations:avg("queuedEscalations"),avgMistakes:avg("qualityMistakes"),avgUnresolvedMistakes:avg("unresolvedQualityMistakes"),qualityTelemetry,avgSickness:avg("sickness"),avgTurnover:Math.round(reports.reduce((s,r)=>s+(r.resignations||0)+(r.firings||0),0)/Math.max(1,reports.length)),flags};
}
function runBalanceMatrix(seedCount=8,days=120){
  const baseSeed=`isolated-matrix-${seedCount}-${days}`;
  const reports=[];
  for(let i=0;i<seedCount;i++){
    const seed=`${baseSeed}-${i+1}`;
    const context=createIsolatedValidationContext({seed});
    reports.push(runBalanceProjection(context,{days,seed}));
  }
  lastValidationReport={...summarizeProjectionMatrix(reports),matrix:true,seed:baseSeed,daysRun:days,reports};
  return lastValidationReport;
}
function runBalanceMatrixFromUi(){
  const btn=document.getElementById("balanceMatrixBtn");
  if(btn){btn.disabled=true;btn.textContent="Running...";}
  setTimeout(()=>{
    runBalanceMatrix(8,120);
    if(btn){btn.disabled=false;btn.textContent="Run Isolated 8-Seed Balance Matrix";}
    renderDeveloperTools?.();
  },20);
}
function validationReportHtml(){
  const r=lastValidationReport;
  if(!r)return "No balance projection has been run this session.";
  const q=r.qualityTelemetry||{};
  const qualityLine=`Quality: created ${Number(q.mistakesCreated||0).toFixed(1)}, resolved ${Number(q.mistakesResolved||0).toFixed(1)}, verification ${Number(q.verificationFailures||0).toFixed(1)}, rushed ${Number(q.rushedWorkMistakes||0).toFixed(1)}, stress ${Number(q.stressRelatedMistakes||0).toFixed(1)}, low focus ${Number(q.lowFocusMistakes||0).toFixed(1)}, manufacturing ${Number(q.manufacturingDefects||0).toFixed(1)}`;
  if(r.matrix)return `Matrix ${r.runs} runs - ${r.daysRun} days<br>Survival ${r.survivalRate}%<br>Median cash $${r.medianFinalCash}M (p10 $${r.cashP10}M / p90 $${r.cashP90}M), median net flow $${Number(r.medianNetCashFlow||0).toFixed(3)}M/day<br>Median post-launch net flow $${Number(r.medianPostLaunchNetCashFlow||0).toFixed(3)}M/day<br>Avg stress ${r.avgStress}, morale ${r.avgMorale}, survival risk ${r.avgSurvivalRisk}<br>Action diversity ${r.avgActionDiversity}, learning spread ${r.avgLearningSpread}<br>CEO decisions ${r.avgCeoDecisions}, escalations ${r.avgEscalations}, memo repeat ${r.avgMemoRepeat}%<br>Min cash ${r.minCash}M, max final stress ${r.maxStress}, early ends ${r.endedEarly}<br>Mistakes created ${r.avgMistakes}, unresolved ${r.avgUnresolvedMistakes}, sickness ${r.avgSickness}, turnover ${r.avgTurnover}<br>${qualityLine}${r.flags.length?`<br>Flags: ${r.flags.join(", ")}`:""}`;
  return `Seed ${r.seed}<br>${r.daysRun} projected days${r.endedEarly?"; ended early":""}<br>Final: ${r.phase}, $${r.cash}M, ${r.activeEmployees} active employees<br>Avg net flow $${Number(r.avgNetCashFlow||0).toFixed(3)}M/day, post-launch $${Number(r.postLaunchNetCashFlow||0).toFixed(3)}M/day, runway ${r.finalRunwayDays>=999?"positive":r.finalRunwayDays+" days"}<br>Final revenue $${Number(r.finalGrossRevenueDaily||0).toFixed(3)}M/day, cost $${Number(r.finalTotalDailyCost||0).toFixed(3)}M/day<br>Avg stress ${r.avgStress}, avg morale ${r.avgMorale}, avg survival risk ${r.avgSurvivalRisk}<br>Action diversity ${r.actionDiversity}, learning spread ${r.learningSpread}, learning magnitude ${r.learningMagnitude}<br>Memos ${r.executiveMemos}, CEO decisions ${r.ceoDecisions}, escalations ${r.queuedEscalations}, repeat ${r.memoRepeat}%<br>Quality created ${r.qualityMistakes}, unresolved ${r.unresolvedQualityMistakes}, sickness ${r.sickness}, resignations ${r.resignations}, firings ${r.firings}, coaching ${r.coaching}<br>${qualityLine}${r.flags.length?`<br>Flags: ${r.flags.join(", ")}`:""}`;
}
function runBalanceProjectionFromUi(){
  const btn=document.getElementById("balanceProjectionBtn");
  if(btn){btn.disabled=true;btn.textContent="Running...";}
  setTimeout(()=>{
    runBalanceProjection(120,{seed:"office-aquarium-isolated-ui"});
    if(btn){btn.disabled=false;btn.textContent="Run Isolated 120-Day Projection";}
    renderDeveloperTools?.();
  },20);
}
function isDeveloperModeEnabled(){
  try{
    return new URLSearchParams(window.location.search).get("dev")==="1"||localStorage.getItem("officeAquariumDeveloperMode")==="true";
  }catch(e){return false;}
}
function renderDeveloperTools(){
  const panel=document.getElementById("developerToolsPanel"),report=document.getElementById("developerValidationReport");
  if(panel)panel.classList.toggle("hidden",!isDeveloperModeEnabled());
  if(report)report.innerHTML=validationReportHtml();
}
function playtestChecklistHtml(){
  const latest=company.simulationMetrics?.lastBalance||{};
  const notes=[];
  notes.push(`Save/load ready: version ${SAVE_VERSION}`);
  if(!company.deterministicContinuationCheck)company.deterministicContinuationCheck={passed:null};
  notes.push(`Deterministic continuation: ${company.deterministicContinuationCheck.passed===true?"passed":company.deterministicContinuationCheck.passed===false?"check failed":"not run"}`);
  notes.push(`12x speed watch: stress ${latest.stress??"n/a"}, memo repeat ${latest.repeatedMemoRate??"n/a"}%`);
  notes.push(`Mobile decision layout: ${company.pendingEvent?"active memo available":"no active memo"}`);
  notes.push(`Archives: ${(company.communications||[]).length} memo(s), ${(company.newspapers||[]).length} newspaper(s)`);
  notes.push(`Vacancies: ${(company.openRoles||[]).length}, story threads: ${(company.storyChains||[]).length}`);
  return `<div class="playtest-note">${notes.join("<br>")}</div>`;
}
function metricsSummaryHtml(){
  const m=company.simulationMetrics?.lastBalance;
  if(!m)return "No metrics collected yet.";
  const h=derivedOperatingHealth(),trace=Object.entries(h.trace||{}).map(([k,v])=>`${k}: ${fmtHealth(v.value)} from ${(v.contributors||[]).map(c=>`${c.name} ${c.value}w${c.weight}`).join("; ")||"no contributors"}`).join("<br>");
  const snapshot=buildExecutiveIntelligenceSnapshot(),snap=`Executive Intelligence Snapshot<br>Top risks: ${(snapshot.topRisks||[]).slice(0,2).map(x=>x.title).join("; ")||"none"}<br>Top opportunities: ${(snapshot.topOpportunities||[]).slice(0,2).map(x=>x.title).join("; ")||"none"}<br>Department beliefs: ${(snapshot.departmentBeliefs||[]).slice(0,2).map(x=>x.title).join("; ")||"none"}<br>Suppression findings: ${(snapshot.suppressedReportFindings||[]).map(x=>`${x.count} filtered / ${x.severeCount} severe`).join("; ")||"none"}<br>Trend priorities: ${(snapshot.majorTrends||[]).slice(0,2).map(x=>x.title).join("; ")||"none"}<br>Source IDs: ${(snapshot.sourceIds||[]).slice(0,8).join(", ")||"none"}`;
  const runwayLabel=m.runwayDays>=999?"positive":`${m.runwayDays} ${m.runwayDays===1?"day":"days"}`;
  return `Day ${m.day}<br>Stress ${m.stress}, morale ${m.morale}, survival risk ${m.survivalRisk}<br>Net cash flow $${Number(m.netCashFlow||0).toFixed(3)}M/day, runway ${runwayLabel}<br>Revenue $${Number(m.grossRevenueDaily||0).toFixed(3)}M, cost $${Number(m.totalDailyCost||0).toFixed(3)}M, payroll $${Number(m.payrollDaily||0).toFixed(3)}M<br>Operating health: portfolio ${fmtHealth(h.portfolioHealth)}, finance ${fmtHealth(h.financeHealth)}, manufacturing ${fmtHealth(h.manufacturingHealth)}, customer ${fmtHealth(h.customerSentiment)}<br>Trace<br>${trace}<br>${snap}<br>Messages 5d ${m.messages5d}: local ${m.routes.local}, info ${m.routes.info}, CEO ${m.routes.queued+m.routes.resolved}, suppressed ${m.routes.suppressed}<br>Action diversity ${m.actionDiversity}, learning spread ${m.learningSpread}, learning magnitude ${m.learningMagnitude}<br>Memo repeat ${m.repeatedMemoRate}%${m.flags?.length?`<br>Flags: ${m.flags.join(", ")}`:""}`;
}
function avgStress(){
  const active=employees.filter(e=>e.active);
  return active.reduce((sum,e)=>sum+e.stress,0)/Math.max(1,active.length);
}
function lowestMorale(){
  return Math.min(...employees.filter(e=>e.active).map(e=>e.morale),100);
}
function averageRelationship(e){
  const others=employees.filter(x=>x.id!==e.id);
  return others.length?others.reduce((sum,o)=>sum+socialScore(e,o.id),0)/others.length:0;
}
function lowestRelationship(){
  return Math.min(...employees.map(averageRelationship),0);
}
function developerValidationHtml(e,scoreLines,cooldowns,strongestMemory,ceo){
  const release=releaseReadinessHtml();
  const learning=learningValidationHtml();
  const snapshot=buildExecutiveIntelligenceSnapshot();
  const memoAudit=(company.communications||[]).find(m=>m.memoAudit)?.memoAudit;
  const pt=company.policyTransition;
  const policyDebug=company.directive?`Policy ${policyLabel(company.directive)}<br>Affected departments ${(pt?.affectedDepartments||policyAffectedDepartments(company.directive)).map(teamDisplayName).join(", ")}<br>Adoption progress ${pt?.totalDays?Math.round((1-(company.directiveDays||0)/pt.totalDays)*100):"n/a"}%<br>Days remaining ${company.directiveDays||0}<br>Temporary modifiers ${pt?.temporaryModifiers||policyTemporaryModifiers(company.directive)}`:"No active policy transition.";
  const crisisDebug=typeof crisisDebugHtml==="function"?crisisDebugHtml():"Crisis debug unavailable.";
  const observationDebug=`Authoritative State Hash ${typeof hashAuthoritativeState==="function"?hashAuthoritativeState():"n/a"}<br>CEO observation ${typeof buildCEOObservation==="function"?"available":"missing"}<br>Employee observation ${typeof buildEmployeeObservation==="function"?"available":"missing"}<br>Manager observation ${typeof buildManagerObservation==="function"?"available":"missing"}<br>Customer Success observation ${typeof buildCustomerSuccessObservation==="function"?"available":"missing"}<br>IR observation ${typeof buildInvestorRelationsObservation==="function"?"available":"missing"}<br>Board observation ${typeof buildBoardObservation==="function"?"available":"missing"}`;
  const capabilityRows=Object.keys(DEFAULT_COMPANY_CAPABILITY_NEEDS||{}).map(cap=>{
    const gap=(company.capabilityGaps||[]).find(g=>g.capability===cap);
    const contributors=(company.capabilityContributors?.[cap]||[]).map(c=>`${c.name} ${c.role} ${c.value}`).join(", ")||"none";
    const options=(company.capabilityFulfillmentOptions?.[cap]||[]).slice(0,3).join("; ")||"none";
    return `${COMPANY_CAPABILITY_LABELS[cap]||cap}: need ${Math.round(company.capabilityNeeds?.[cap]||0)}, coverage ${Math.round(company.capabilityCoverage?.[cap]||0)}, gap ${gap?.gap||0}<br>Roles contributing ${contributors}<br>Fulfillment options ${options}`;
  }).join("<br><br>");
  const capabilityDebug=`Company Capability Needs<br>${capabilityRows||"No capability model available."}<br><br>Missing Capabilities ${(company.capabilityGaps||[]).map(g=>`${g.label} ${g.gap}`).join(", ")||"none"}<br>Consequences Active ${Object.keys(company.capabilityConsequences||{}).join(", ")||"none"}<br>Promotion Candidates ${(company.capabilityPromotionCandidates||[]).map(c=>`${c.name} -> ${c.targetRole} (${Math.round(c.readiness)})`).join(", ")||"none"}<br>Project Requirement Re-Audit Result ${company.lastProjectRequirementAuditDay??"not run"}<br>Kept/Removed/Revised Reason ${JSON.stringify(company.capabilityAudit||{}).slice(0,700)}`;
  const roleDef=roleDefinition(e.role),roomEffect=e.roomEffect||roomEffectFor(e,e.lastAction||"work",e.currentRoom||rolePrimaryRoom(e.role)),caps=roleProjectCapabilities(e.role);
  const roleRoomDebug=`Role Definition ${canonicalRole(e.role)}<br>Department ${roleDepartment(e.role)}<br>Primary Room ${rolePrimaryRoom(e.role)}<br>Secondary Rooms ${roleSecondaryRooms(e.role).join(", ")||"none"}<br>Current Room ${e.currentRoom||roomForZone(e.zone)||"offsite"}<br>Room Selection Reason ${e.roomSelectionReason||"No room decision yet"}<br>Current Activity ${e.lastAction||e.action||"none"}<br>Room Capacity ${roomEffect?.capacity??"n/a"}; occupancy ${roomEffect?.occupancy??"n/a"}; congestion ${Number(roomEffect?.congestion||0).toFixed(2)}<br>Room Effect productivity ${Number(roomEffect?.productivity||1).toFixed(2)}, focus cost ${Number(roomEffect?.focus||0).toFixed(2)}, stress ${Number(roomEffect?.stress||0).toFixed(2)}<br>Project Capability ${Object.entries(caps).map(([k,v])=>`${k} ${Math.round(v*100)}%`).join(", ")||"none"}<br>Hiring Need Source ${company.hiringNeedHistory?.[roleDepartment(e.role)]?.factors?.[0]?.label||"none"}<br>Institutional Lesson Used ${Object.entries(e.learnedLessons||{}).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0]?.[0]||"none"}<br>Allowed Activities ${(roleDef?.allowedActivities||[]).join(", ")}`;
  const personalityDebug=employeePersonalityDebugHtml(e);
  return `<div class="debug-panel"><h3>AI Debug</h3>
    <details class="debug-section"><summary>Employee AI</summary><div class="debug-section-content"><strong>Utility Scores</strong><br><code>${scoreLines||"No scores yet"}</code><br><br><strong>Cooldowns</strong><br>${cooldowns}<br><br><strong>Memory Bias</strong><br>${strongestMemory?`${strongestMemory.type}: ${Math.round(strongestMemory.strength)}`:"None"}<br><br><strong>Collaborator Candidate</strong><br>${availableCollaborator(e)?.name||"None"}<br><br><strong>Repetition</strong><br>${e.lastAction||"None"} x ${e.repeatCount||0}<br><br><strong>Duration</strong><br>${Math.round(e.actionMinutes||0)} minutes<br><br><strong>CEO Opinion</strong><br>Trust ${Math.round(ceo.trust||0)}, Fairness ${Math.round(ceo.fairness||0)}, Competence ${Math.round(ceo.competence||0)}, Support ${Math.round(ceo.support||0)}, Fear ${Math.round(ceo.fear||0)}</div></details>
    <details class="debug-section"><summary>Roles and Rooms</summary><div class="debug-section-content">${roleRoomDebug}</div></details>
    <details class="debug-section"><summary>Personality and Emotional Reactions</summary><div class="debug-section-content">${personalityDebug}</div></details>
    <details class="debug-section"><summary>Policy Transition</summary><div class="debug-section-content">${policyDebug}</div></details>
    <details class="debug-section"><summary>Company Capabilities</summary><div class="debug-section-content">${capabilityDebug}</div></details>
    <details class="debug-section"><summary>Institutional Learning</summary><div class="debug-section-content">${learning}</div></details>
    <details class="debug-section"><summary>Executive Communications</summary><div class="debug-section-content">Decision threads ${(company.decisionThreads||[]).length}; message threads ${(company.messageThreads||[]).length}; archived memos ${(company.communications||[]).length}; queued escalations ${(company.escalationQueue||[]).length}.<br>${memoAudit?`Latest memo audit: relevance ${memoAudit.relevanceScore??"n/a"}%, evidence ${memoAudit.evidenceCoverage??"n/a"}, chain ${memoAudit.chainOfCommandValid?"valid":"review"}.`:"No memo audit available yet."}<br>Fingerprints ${Object.keys(company.messageFingerprints||{}).length}; quality history ${(company.messageQualityHistory||[]).length}.</div></details>
    <details class="debug-section"><summary>Customer Market Intelligence</summary><div class="debug-section-content">${customerMarketDebugHtml()}</div></details>
    <details class="debug-section"><summary>Loss Paths and Crisis</summary><div class="debug-section-content">${crisisDebug}</div></details>
    <details class="debug-section"><summary>Hidden-State Observations</summary><div class="debug-section-content">${observationDebug}</div></details>
    <details class="debug-section"><summary>Market, Board, and Valuation</summary><div class="debug-section-content">${marketValuationDebugHtml()}</div></details>
    <details class="debug-section"><summary>Operating Health Trace</summary><div class="debug-section-content">${metricsSummaryHtml()}</div></details>
    <details class="debug-section"><summary>Release Validation</summary><div class="debug-section-content">${release}</div></details>
    <details class="debug-section"><summary>Balance Testing</summary><div class="debug-section-content">${validationReportHtml()}<br><br>${playtestChecklistHtml()}</div></details>
    <details class="debug-section"><summary>Executive Intelligence Snapshot</summary><div class="debug-section-content">Risks ${(snapshot.topRisks||[]).length}; opportunities ${(snapshot.topOpportunities||[]).length}; department beliefs ${(snapshot.departmentBeliefs||[]).length}; strategic signals ${(snapshot.strategicSignals||[]).length}.</div></details>
  </div>`;
}
function employeePersonalityDebugHtml(e){
  ensureEmployeePersonality?.(e);
  const dimensions=Object.entries(e.personality||{}).map(([k,v])=>`${k}: ${Number(v).toFixed(3)}`).join("<br>");
  const drivers=Object.entries(e.emotionalState||{}).map(([k,v])=>`${k}: ${Math.round(Number(v)||0)}`).join("<br>");
  const cooldowns=Object.entries(e.emotionalCooldowns||{}).map(([k,v])=>`${k}: ${v}`).join("<br>")||"None";
  const totals=e.emotionalDailyTotals||{},limits=e.emotionalLimits||{},last=e.lastEmotionalReaction||{};
  const events=(e.recentEmotionalEvents||[]).slice(0,6).map(ev=>`Day ${ev.day}: ${ev.reasonCode} morale ${Number(ev.moraleDelta||0).toFixed(2)}, stress ${Number(ev.stressDelta||0).toFixed(2)}`).join("<br>")||"No emotional events yet";
  return `Personality Seed ${e.personalitySeed}<br>Archetypes ${(e.personalityArchetypes||[]).join(", ")||"none"}<br><br><strong>Personality Dimensions</strong><br>${dimensions}<br><br><strong>Emotional Drivers</strong><br>${drivers}<br><br><strong>Last Reaction</strong><br>Morale Delta ${Number(last.moraleDelta||0).toFixed(2)}; Stress Delta ${Number(last.stressDelta||0).toFixed(2)}; Reason Code ${last.reasonCode||"none"}<br><br><strong>Daily Caps</strong><br>Morale +${Number(totals.moraleGain||0).toFixed(2)}/${limits.maxDailyMoraleGain}, Morale -${Number(totals.moraleLoss||0).toFixed(2)}/${limits.maxDailyMoraleLoss}<br>Stress +${Number(totals.stressGain||0).toFixed(2)}/${limits.maxDailyStressGain}, Stress -${Number(totals.stressLoss||0).toFixed(2)}/${limits.maxDailyStressLoss}<br><br><strong>Cooldowns</strong><br>${cooldowns}<br><br><strong>Recent Emotional Events</strong><br>${events}`;
}
function showEmployee(id){
  const e=employees.find(x=>x.id===id);
  ensureEmployeePersonality?.(e);
  document.getElementById("aiDebugToggle")?.classList.toggle("active",debugMode);
  document.getElementById("detailName").textContent=e.name;
  document.getElementById("detailRole").textContent=`${e.role} - ${(e.personalityArchetypes||[]).slice(0,2).join(" - ")||e.traits.join(" - ")}`;
  const best=employees.filter(x=>x.id!==e.id).sort((a,b)=>socialScore(e,b.id)-socialScore(e,a.id))[0];
  const topGoals=Object.entries(e.goals||{}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}: ${Math.round(v*100)}`).join("<br>");
  const scoreLines=Object.entries(e.decisionTrace?.scores||{}).slice(0,5).map(([k,v])=>`${k}: ${Math.round(v)}`).join("<br>");
  const memories=(e.memories||[]).slice(0,4).map(m=>`<li>${m.text} <small>(strength ${Math.round(m.strength)})</small></li>`).join("")||"<li>No strong memories yet.</li>";
  const social=best?getSocial(e,best.id):null;selectedEmployeeId=id;const ceo=e.opinionOfCEO||{},cooldowns=Object.entries(e.cooldowns||{}).filter(([,v])=>v>0).map(([k,v])=>`${k}: ${Math.round(v)}`).join("<br>")||"None";const strongestMemory=(e.memories||[]).slice().sort((a,b)=>b.strength-a.strength)[0];const debugHtml=debugMode?developerValidationHtml(e,scoreLines,cooldowns,strongestMemory,ceo):"";
  document.getElementById("detailBody").innerHTML=`
    <div class="detail-grid">
      <div><strong>Status</strong><br>${e.active?e.action:"Resigned"}</div>
      <div><strong>Current thought</strong><br>${e.thought}</div>
      <div><strong>Energy</strong><br>${Math.round(e.energy)}</div>
      <div><strong>Focus</strong><br>${Math.round(e.focus)}</div>
      <div><strong>Morale</strong><br>${Math.round(e.morale)}</div>
      <div><strong>Stress</strong><br>${Math.round(e.stress)}</div>
      <div><strong>Personality</strong><br>${personalityDescription?.(e)||"Balanced worker"}<br><small>${(e.personalityArchetypes||[]).slice(0,3).join(" - ")}</small></div>
      <div><strong>Top goals</strong><br>${topGoals}</div>
      <div><strong>Closest coworker</strong><br>${best?.name||"None"}${social?`<br>Trust ${Math.round(social.trust)}, Respect ${Math.round(social.respect)}, Friendship ${Math.round(social.friendship)}`:""}</div>
      <div><strong>Why this action?</strong><br>${e.thought||`Currently ${e.action}.`}</div>
      <div><strong>Milestones</strong><br>${e.achievements}</div>
      <div><strong>CEO Opinion</strong><br>Trust ${Math.round(ceo.trust||0)}, Fairness ${Math.round(ceo.fairness||0)}, Support ${Math.round(ceo.support||0)}, Fear ${Math.round(ceo.fear||0)}</div>
      <div><strong>Current Work</strong><br>${activeWorkForEmployee(e)?.title||"No assigned work"}</div>
      <div><strong>Beliefs</strong><br>${Object.entries(e.beliefs||{}).slice(0,3).map(([k,v])=>`${k}: ${v.estimate}% / ${v.confidence}%`).join("<br>")||"No strong beliefs yet"}</div>
      <div><strong>Recent Messages</strong><br>${(e.knownMessages||[]).slice(0,3).map(m=>m.subject).join("<br>")||"No recent messages"}</div>
    </div>
    <h3>Recent memories</h3>
    <ul>${memories}</ul>${debugHtml}`;
  document.getElementById("employeeModal").classList.remove("hidden");
}
function normalizeCompanyView(view){
  return ["overview","projects","workforce","story","all"].includes(view)?view:"all";
}
function applyCompanyView(){
  const view=normalizeCompanyView(company?.companyView);
  document.querySelectorAll("[data-company-view]").forEach(el=>{
    const groups=String(el.dataset.companyView||"").split(/\s+/).filter(Boolean);
    el.classList.toggle("view-hidden",view!=="all"&&!groups.includes(view));
  });
  const select=document.getElementById("companyViewSelect");
  if(select&&select.value!==view)select.value=view;
}
function setCompanyView(view){
  if(!company)return;
  company.companyView=normalizeCompanyView(view);
  applyCompanyView();
  if(!validationMode)saveGame();
}
function render(){
  ensureBibleSystems?.();restoreCompactSections?.();
  updatePauseButton?.();
  const days=["Mon","Tue","Wed","Thu","Fri"],hour=Math.floor(company.minute/60),mins=company.minute%60,h12=((hour+11)%12)+1;
  document.getElementById("timeLabel").textContent=`Day ${company.day+1} - ${days[company.day%5]} ${h12}:${String(mins).padStart(2,"0")} ${hour>=12?"PM":"AM"}`;
  document.getElementById("cashLabel").textContent=`$${company.cash.toFixed(1)}M`;
  document.getElementById("boardLabel").textContent=Math.round(company.board);
  updateCompanyRiskComponents?.();
  const r=document.getElementById("riskLabel"),riskLabel=company.companyRiskComponents?.label||"Watch",riskTotal=company.companyRiskComponents?.total||0;
  r.textContent=company.crisis?`CRISIS - ${company.crisisDays} days`:riskLabel;
  r.className=(company.crisis||riskLabel==="Critical"||riskTotal>=85)?"danger":"";
  document.getElementById("valuationLabel").textContent=`$${company.valuation.toFixed(1)}M valuation - ${valuationTrendLabel()}`;
  document.getElementById("phaseLabel").textContent=companyIdentityLabel();
  renderValuationChart();
  const health=derivedOperatingHealth();
  const setTrack=(id,label,value,suffix="")=>{
    const text=document.getElementById(id+"Text"),barEl=document.getElementById(id+"Bar"),labelEl=text?.parentElement?.querySelector("span");
    if(labelEl)labelEl.textContent=label;
    if(text)text.textContent=fmtHealth(value,suffix);
    if(barEl)barEl.style.width=value===null||value===undefined?"0%":clamp(value,0,100)+"%";
  };
  setTrack("chip",health.labels.hardware,health.hardwareHealth,"%");
  setTrack("software",health.labels.software,health.softwareHealth,"%");
  setTrack("morale","Morale",health.morale);
  setTrack("trust","Trust",health.trust);
  document.getElementById("customersText").textContent=Math.round(company.customers);
  const customerGoal=company.phase==="launched"?200:company.phase==="pilot"?80:50;
  document.getElementById("customersBar").style.width=clamp(company.customers/customerGoal*100,0,100)+"%";
  document.getElementById("revenueText").textContent=`$${company.dailyRevenue.toFixed(2)}M`;
  document.getElementById("revenueBar").style.width=clamp(company.dailyRevenue*250,0,100)+"%";
  document.getElementById("officeHeadline").textContent="The company is running.";
  document.getElementById("log").innerHTML=company.log.slice(-10).reverse().map(x=>`<li>${x}</li>`).join("");
  const cb=document.getElementById("crisisBox");
  if(company.crisis){
    cb.classList.remove("hidden");
    document.getElementById("crisisText").textContent=typeof crisisPlayerMessage==="function"?crisisPlayerMessage(company.crisis):String(company.crisis);
  }else cb.classList.add("hidden");
  document.getElementById("employeeList").innerHTML=[...employees.filter(e=>e.active),...employees.filter(e=>!e.active)].map(e=>`<div class="employee-card clickable" onclick="showEmployee(${e.id})"><div class="employee-head"><strong>${e.name} - ${e.role}</strong><span>${e.active?e.action:"Resigned"}</span></div><div class="mini-bars"><div class="mini">Morale ${Math.round(e.morale)}<div class="bar"><span style="width:${e.morale}%"></span></div></div><div class="mini">Stress ${Math.round(e.stress)}<div class="bar stress"><span style="width:${e.stress}%"></span></div></div></div></div>`).join("");
  employees.forEach(e=>{
    const n=document.getElementById(`agent-${e.id}`);
    if(!e.active){if(n)n.remove();return;}
    if(!n){buildOffice(true);return;}
    n.classList.toggle("offsite",e.offsite);
    n.classList.remove("resigned");
    n.classList.toggle("busy",e.action==="working"||e.action==="testing hardware"||e.action==="leading a meeting");
    n.querySelector(".thought").textContent=e.thought;
    n.querySelector("small").textContent=`${e.name}: ${e.action}`;
  });
  document.getElementById("applyDecision").disabled=company.cash<=0;
  setTrack("manufacturing",health.labels.manufacturing,health.manufacturingHealth,"%");
  setTrack("shareholder","Investor Confidence",health.investorConfidence??health.shareholderConfidence);
  setTrack("cohesion","Team Cohesion",health.teamCohesion);
  setTrack("sentiment",health.labels.customer,health.customerSentiment);
  const dept=document.getElementById("departmentBriefing");if(dept)dept.innerHTML=departmentBriefingHtml();
  const portfolio=document.getElementById("projectPortfolio");if(portfolio)portfolio.innerHTML=projectPortfolioHtml();
  const threads=document.getElementById("storyThreads");if(threads){const html=storyThreadsHtml();threads.innerHTML=html;setContentSectionVisibility("storyThreadsWrap",!!html);}
  const lessons=document.getElementById("institutionalLessons");if(lessons){const html=institutionalLessonsHtml();lessons.innerHTML=html;toggleSectionVisibility(lessons,!!html);}
  const hist=document.getElementById("companyHistory");if(hist){const html=companyHistoryHtml();hist.innerHTML=html;setContentSectionVisibility("companyHistoryWrap",!!html);}
  const dash=document.getElementById("operationalDashboard");if(dash)dash.innerHTML=operationalDashboardHtml();
  const reports=document.getElementById("internalReports");if(reports){const html=internalReportsHtml();reports.innerHTML=html;setContentSectionVisibility("internalReportsWrap",!!html);}
  renderDeveloperTools();
  renderOrganizationalDynamics();renderWorkforcePressure();renderNewspapers();
  applyCompanyView();
}
function switchMobileTab(tab,scroll=true){
  const target=document.querySelector(`.mobile-tabs button[data-tab="${tab}"]`);
  if(!target)return;
  document.querySelectorAll(".mobile-tabs button").forEach(x=>x.classList.toggle("active",x===target));
  document.querySelectorAll(".tab-section").forEach(s=>s.classList.toggle("active",s.dataset.section===tab));
  const workspace=document.querySelector(".workspace-tabs");
  if(workspace){
    workspace.classList.toggle("active",tab==="company"||tab==="newspaper");
    if(tab==="company"&&typeof setWorkspaceTab==="function")setWorkspaceTab("reports");
    if(tab==="newspaper"&&typeof setWorkspaceTab==="function")setWorkspaceTab("news");
  }
  if(tab==="inbox"&&company)setCommunicationView("inbox");
  if(scroll&&window.matchMedia("(max-width:720px)").matches)window.scrollTo({top:0,behavior:"smooth"});
}
function toggleCompactSection(button){
  const id=button?.dataset?.collapseTarget,target=id?document.getElementById(id):null;
  if(!target)return;
  const collapsed=!target.classList.contains("collapsed");
  target.classList.toggle("collapsed",collapsed);
  button.classList.toggle("collapsed",collapsed);
  company.uiCollapsed={...(company.uiCollapsed||{}),[id]:collapsed};
  if(!validationMode)saveGame();
}
function toggleSectionVisibility(element,hasContent){
  if(!element)return;
  element.classList.toggle("hidden",!hasContent);
}
function setContentSectionVisibility(targetId,hasContent){
  const target=document.getElementById(targetId),button=document.querySelector(`.section-toggle[data-collapse-target="${targetId}"]`);
  toggleSectionVisibility(target,hasContent);
  toggleSectionVisibility(button,hasContent);
}
function restoreCompactSections(){
  document.querySelectorAll(".section-toggle[data-collapse-target]").forEach(button=>{
    const id=button.dataset.collapseTarget,target=document.getElementById(id);
    if(!target)return;
    const collapsed=company?.uiCollapsed?.[id]??button.classList.contains("collapsed");
    target.classList.toggle("collapsed",!!collapsed);
    button.classList.toggle("collapsed",!!collapsed);
  });
}
function restartTimer(){
  simulationTimer.start(()=>{
    if(company&&!company.paused&&!company.gameOver){
      for(let i=0;i<company.speed;i++){
        officeSystems.runtime.minute(false);
        if(company.paused||company.gameOver||company.lastSimulationError)break;
      }
      if(!validationMode){renderDecisionEvent();render();}
    }
  },850);
}

class UserInterfaceSystem{
  render(){return render();}
  renderDecision(){return renderDecisionEvent();}
  startup(){return updateStartupScreen();}
  switchTab(tab,scroll=true){return switchMobileTab(tab,scroll);}
  showEmployee(id){return showEmployee(id);}
  restartTimer(){return restartTimer();}
}

class ValidationToolsSystem{
  balanceRun(days=120,seed=`isolated-balance-${days}`){return runBalanceProjection(days,{seed});}
  balanceMatrix(seedCount=8,days=120){return runBalanceMatrix(seedCount,days);}
  deterministicContinuation(seed="determinism-isolated",midDays=50,totalDays=100){return runDeterministicContinuationCheck(seed,midDays,totalDays);}
  reportHtml(){return validationReportHtml();}
}

