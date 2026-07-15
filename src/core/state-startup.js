const SAVE_KEY="office-aquarium-living-office-v3";
const SAVE_VERSION=38;
const zones={dev:{x:[9,41],y:[14,40]},lab:{x:[58,91],y:[14,40]},meet:{x:[9,29],y:[64,88]},break:{x:[42,58],y:[64,88]},exec:{x:[72,91],y:[64,88]}};
const names=["Maya","Leo","Aisha","Noah","Priya","Ethan","Sofia","Marcus"];
const roles=["Chip Architect","Firmware Engineer","Software Lead","Verification Engineer","Product Manager","QA Engineer","Industrial Designer","Finance Analyst"];
const colors=["#4a78c2","#ef6f6c","#2ab7a9","#d9972b","#7a5af8","#5f9f64","#d65b9e","#52606d"];
const traits=[["perfectionist","ambitious"],["social","creative"],["focused","introverted"],["cautious","loyal"],["ambitious","social"],["skeptical","focused"],["creative","independent"],["cautious","analytical"]];
const initialCompany={day:0,minute:480,randomState:2463534242,nextRuntimeId:1,cash:18,board:72,trust:68,chip:22,software:31,quality:38,integration:15,customers:0,dailyRevenue:0,valuation:42,phase:"prototype",marketSentiment:50,marketConfidence:50,leadershipReputation:50,valuationQuality:50,investorAppetite:50,marketNoiseState:0,valuationHistory:[],valuationShocks:[],boardMarketLessons:{},lastValuationReviewDay:-999,lastValuationMemoDay:-999,lastFundraisingMemoDay:-999,lastValuationStoryDay:-999,lastBoardValuationState:null,valuationDrivers:{},boardProfile:null,founderOwnership:100,investorOwnership:0,boardControlPressure:0,worldState:{capitalClimate:50,sectorEnthusiasm:50,interestRatePressure:50,supplyReliability:50,talentMarket:50,competitorAggression:50,customerBudgetClimate:50},marketRangeView:"1m",directive:null,directiveDays:0,policyTransition:null,selected:0,paused:false,speed:1,soundMode:"muted",soundEnabled:false,pendingEvent:null,eventCooldown:0,eventHistory:{},recentEventCategories:[],cashEventArmed:true,completedEvents:[],crisis:null,crisisDays:0,gameOver:false,costEfficiency:1,pilotDays:0,openRoles:[],newspapers:[],weekStartSnapshot:null,weeklyEvents:[],communications:[],communicationView:"inbox",history:[],lessons:[],nextLessonId:1,departmentLearning:{},lastLessonReviewDay:-999,delayedDecisionEffects:[],decisionHistory:[],decisionThreads:[],nextDecisionThreadId:1,executiveReputations:{},leadership:{qualityFocus:55,speedFocus:50,innovation:55,employeeWellbeing:55,financialDiscipline:55,customerFocus:55,transparency:55,riskTolerance:50,accountability:55,longTermThinking:55},organizationalMomentum:{burnout:0,turnover:0,innovation:0,trust:0,execution:0,financial:0,culture:0},quarterlyReviews:[],annualReviews:[],lastQuarterlyReviewDay:0,lastAnnualReviewDay:0,crisisRiskDays:{burnout:0,financial:0,product:0,reputation:0,leadership:0,staffing:0,operational:0},crisisType:null,crisisStage:null,workItems:[],issueRecords:[],departmentObjectives:{},informationSources:{},nextWorkItemId:1,nextIssueId:1,nextMessageId:1,nextEscalationId:1,employeeMessages:[],teamReports:[],suppressionRecords:[],escalationQueue:[],escalatedMessageIds:[],communicationStats:{helpRequests:0,statusReports:0,riskReports:0,opportunityReports:0,suppressedReports:0,rumors:0},storyChains:[],nextStoryId:1,playtest:{sessions:0,notes:[],lastChecklistDay:-999},operatingHealthHistory:[],executiveBriefing:null,executiveBriefingArchive:[],simulationMetrics:{daily:[],counters:{actions:{},qualityMistakes:0,sickness:0,resignations:0,firings:0,coaching:0,ceoDecisions:0,executiveMemos:0,queuedEscalations:0,localIssues:0,collaborations:0},lastBalance:null},workforceLessons:{},culture:{innovation:55,workLife:55,communication:55,riskTolerance:50,qualityDiscipline:58,politics:25},market:{aiDemand:52,hardwareDemand:50,supplyPressure:32,capitalClimate:55,competitorHeat:45},log:["You became CEO. The office is now running without direct employee control."]};
let company,employees,timer=null,debugMode=false,selectedEmployeeId=null,validationMode=false,lastValidationReport=null,lastInboxSoundCount=null,musicUnavailable=false,alertsUnavailable=false;
const saveRepository=new SaveRepository(SAVE_KEY,SAVE_VERSION);
const soundController=new SoundController({musicSrc:"assets/audio/game_music_loop.mp3",alertSrc:"assets/audio/new_message_alert.mp3"});
const simulationTimer=new SimulationTimer();
const validationSession=new ValidationSession(saveRepository,simulationTimer);
const musicAudio=soundController.music,messageAudio=soundController.alert;
function createSafeAudio(src,options={}){return soundController.create(src,options);}
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
function baseSkillsForRole(role){
  const common={architecture:35,verification:35,firmware:35,software:35,hardware:35,leadership:35,communication:45,finance:25,product:30};
  const byRole={
    "Chip Architect":{architecture:82,hardware:78,verification:48,leadership:48},
    "Firmware Engineer":{firmware:82,software:58,hardware:64,verification:46},
    "Software Lead":{software:84,firmware:56,leadership:62,communication:58},
    "Verification Engineer":{verification:86,hardware:58,software:42,communication:44},
    "Product Manager":{product:84,communication:78,leadership:62,software:38},
    "QA Engineer":{verification:78,software:56,communication:48,product:35},
    "Industrial Designer":{hardware:64,product:58,communication:55,architecture:46},
    "Finance Analyst":{finance:86,communication:54,leadership:42,product:36}
  };
  return {...common,...(byRole[role]||{})};
}
function makeEmployee(i){
  const base=i===7?"exec":i<4?(i===0||i===3?"lab":"dev"):(i===4?"meet":i===5?"dev":i===6?"lab":"exec");
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
  const role=roles[i]||"Product Manager",traitSet=traits[i%traits.length]||traits[0],goalProfile=goalProfiles[i%goalProfiles.length]||goalProfiles[0];
  return{
    id:i,name:names[i]||`Employee ${i+1}`,role,traits:[...traitSet],zone:base,homeZone:base,x:50,y:50,
    energy:72+simulationRandom()*18,stress:18+simulationRandom()*22,morale:65+simulationRandom()*20,
    focus:55+simulationRandom()*30,relationship:{},social:{},goals:{...goalProfile},
    memories:[],action:"arriving",thought:"Getting ready for the day.",taskProgress:0,
    actionMinutes:0,active:true,offsite:false,sickDays:0,daysAtRisk:0,achievements:0,
    lastAction:null,repeatCount:0,cooldowns:{break:0,meeting:0,socialize:0,collaborate:0,complain:0},
    decisionTrace:{chosen:"arriving",scores:{},reasons:[]},opinionOfCEO:{trust:62,fairness:58,competence:64,support:56,fear:12},careerLevel:1,careerHistory:["Founding team"],beliefs:{},dailyBriefing:null,currentIntention:null,skills:baseSkillsForRole(role),performance:{recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999},learning:{caution:0,mentor:0,risk:0,collaboration:0,helpSeeking:0,testing:0,focusWork:0,reporting:0,suppression:0,initiative:0,recovery:0,contextualPreferences:{}},communication:{reportsMade:0,reportsSuppressed:0,helpRequests:0,lastReportDay:-999,lastHelpRequestDay:-999,rumorsShared:0},knownMessages:[],actionOutcomeContext:null,activeCollaboration:null,activeMeeting:null,learnedLessons:{testing:0,collaboration:0,documentation:0,escalation:0,innovation:0,riskTaking:0,planning:0,mentoring:0,recovery:0},lessonAcceptance:null,joinedDay:company?.day||0,age:28+i*4+Math.floor(simulationRandom()*4),stayScore:72,retentionRisk:28,jobSearchDays:0,retirementReadiness:0,quarterlyReview:null,promotionExpectation:45,salarySatisfaction:65,recognitionSatisfaction:60
  };
}
function reset(skipSave=false,randomize=false,seedState=null){document.getElementById("gameOverOverlay")?.classList.add("hidden");company=typeof structuredClone==="function"?structuredClone(initialCompany):JSON.parse(JSON.stringify(initialCompany));if(Number.isFinite(seedState))company.randomState=seedState>>>0;if(randomize){const climates=[{name:"Cautious market",cash:-1.5,board:4,trust:3},{name:"Investor optimism",cash:2,board:6,trust:-2},{name:"Competitive pressure",cash:0,board:-3,trust:1},{name:"Stable opening",cash:0,board:0,trust:0}];const climate=climates[Math.floor(simulationRandom()*climates.length)];company.cash=clamp(company.cash+climate.cash,14,21);company.board=clamp(company.board+climate.board,58,82);company.trust=clamp(company.trust+climate.trust,55,78);company.valuation=clamp(company.valuation+rand(-4,4),34,50);company.log=[`You became CEO during a ${climate.name.toLowerCase()}. The office is running without direct employee control.`];}employees=names.map((_,i)=>makeEmployee(i));if(randomize){const shuffled=traits.map(x=>[...x]).sort(()=>simulationRandom()-.5);employees.forEach((e,i)=>{e.traits=shuffled[i];e.energy=clamp(e.energy+rand(-8,8),55,95);e.morale=clamp(e.morale+rand(-8,8),52,90);e.focus=clamp(e.focus+rand(-8,8),45,92);});}employees.forEach(a=>employees.forEach(b=>{if(a!==b)a.relationship[b.id]=Math.round(simulationRandom()*55-18)}));company.weekStartSnapshot=captureWeekSnapshot();ensureBibleSystems?.();updateManufacturingAndStakeholders?.();updateCompanyInformationSystem?.();collectDailyMetrics?.();buildOffice();renderDecisionEvent();render();if(!validationMode)restartTimer();if(!skipSave&&!validationMode)saveGame();}
function saveGame(){try{saveRepository.write(company,employees);document.getElementById("saveNote").textContent="Saved on this device";}catch(e){document.getElementById("saveNote").textContent="Autosave unavailable";}}
function loadGame(){try{const data=saveRepository.read();if(!data)return false;company={...saveRepository.clone(initialCompany),...(data.company||{})};const loadedRandomState=Number.isFinite(company.randomState)?(company.randomState>>>0):2463534242;const loadedNextRuntimeId=Math.max(1,Number(company.nextRuntimeId)||1);const savedEmployees=Array.isArray(data.employees)?data.employees:[];const employeeSlots=Math.max(names.length,...savedEmployees.map(e=>Number(e.id)).filter(Number.isFinite).map(id=>id+1));employees=Array.from({length:employeeSlots},(_,i)=>{const fresh=makeEmployee(i),saved=savedEmployees.find(e=>e.id===i)||{};return{
      ...fresh,...saved,
      relationship:{...fresh.relationship,...(saved.relationship||{})},
      social:{...fresh.social,...(saved.social||{})},
      goals:{...fresh.goals,...(saved.goals||{})},
      memories:Array.isArray(saved.memories)?saved.memories:[],
      cooldowns:{...fresh.cooldowns,...(saved.cooldowns||{})},
      decisionTrace:saved.decisionTrace||fresh.decisionTrace,opinionOfCEO:{...fresh.opinionOfCEO,...(saved.opinionOfCEO||{})},careerLevel:Number(saved.careerLevel)||fresh.careerLevel,careerHistory:Array.isArray(saved.careerHistory)?saved.careerHistory:fresh.careerHistory,beliefs:{...fresh.beliefs,...(saved.beliefs||{})},dailyBriefing:saved.dailyBriefing||fresh.dailyBriefing,currentIntention:saved.currentIntention||fresh.currentIntention,skills:{...fresh.skills,...(saved.skills||{})},performance:{...fresh.performance,...(saved.performance||{})},learning:{...fresh.learning,...(saved.learning||{}),contextualPreferences:{...(fresh.learning?.contextualPreferences||{}),...(saved.learning?.contextualPreferences||{})}},communication:{...fresh.communication,...(saved.communication||{})},knownMessages:Array.isArray(saved.knownMessages)?saved.knownMessages:[],actionOutcomeContext:saved.actionOutcomeContext||null,activeCollaboration:saved.activeCollaboration||null,activeMeeting:saved.activeMeeting||null,
      learnedLessons:{...fresh.learnedLessons,...(saved.learnedLessons||{})},
      lessonAcceptance:saved.lessonAcceptance??fresh.lessonAcceptance,
      joinedDay:Number.isFinite(saved.joinedDay)?saved.joinedDay:(fresh.joinedDay||0),age:Number.isFinite(saved.age)?saved.age:fresh.age,stayScore:Number.isFinite(saved.stayScore)?saved.stayScore:72,retentionRisk:Number.isFinite(saved.retentionRisk)?saved.retentionRisk:28,jobSearchDays:Number(saved.jobSearchDays)||0,retirementReadiness:Number(saved.retirementReadiness)||0,quarterlyReview:saved.quarterlyReview||null,promotionExpectation:Number.isFinite(saved.promotionExpectation)?saved.promotionExpectation:45,salarySatisfaction:Number.isFinite(saved.salarySatisfaction)?saved.salarySatisfaction:65,recognitionSatisfaction:Number.isFinite(saved.recognitionSatisfaction)?saved.recognitionSatisfaction:60
    };});company.randomState=loadedRandomState;employees.forEach(a=>employees.forEach(b=>{if(a!==b&&typeof a.relationship[b.id]!=="number")a.relationship[b.id]=0;}));company.completedEvents=Array.isArray(company.completedEvents)?company.completedEvents:[];company.costEfficiency=clamp(Number(company.costEfficiency)||1,.72,1.08);company.pilotDays=Number(company.pilotDays)||0;
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
company.workItems=Array.isArray(company.workItems)?company.workItems:[];
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
ensureBibleSystems?.();rebuildRuntimeIndexes?.();ensureProjectAllocations?.();buildOffice(true);renderDecisionEvent();render();restartTimer();company.randomState=loadedRandomState;company.nextRuntimeId=loadedNextRuntimeId;return true;}catch(e){console.warn("Save migration failed",e);return false;}}

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
function requestReset(){company.paused=true;document.getElementById("pauseBtn").textContent="Resume";document.getElementById("confirmResetOverlay").classList.remove("hidden");}

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
  if(company.integration<55&&["Firmware Engineer","Software Lead","Product Manager"].includes(e.role))return "integration";
  if(company.quality<58&&["Verification Engineer","QA Engineer","Industrial Designer"].includes(e.role))return "quality";
  if(company.chip<company.software&&["Chip Architect","Firmware Engineer","Verification Engineer"].includes(e.role))return "hardware";
  if(company.software<=company.chip&&["Software Lead","Firmware Engineer","QA Engineer"].includes(e.role))return "software";
  if(company.cash<10||company.shareholders?.pressure>65)return "finance";
  return "general";
}
function roleCompatibility(a,b,need=projectNeedFor(a)){
  const pair=[a.role,b.role].sort().join("|");
  const strong={
    "Chip Architect|Firmware Engineer":24,"Firmware Engineer|Software Lead":26,"Product Manager|Software Lead":22,
    "QA Engineer|Software Lead":22,"QA Engineer|Verification Engineer":24,"Chip Architect|Verification Engineer":24,
    "Finance Analyst|Product Manager":18,"Industrial Designer|Product Manager":18,"Firmware Engineer|Verification Engineer":18
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
function recordWeeklyEvent(text,type="general",importance=1){
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
  company.weeklyEvents.push({text,type,importance,day:company.day});
  company.weeklyEvents=company.weeklyEvents.slice(-40);
}
function signed(value,digits=0){const n=Number(value)||0;return `${n>=0?"+":""}${n.toFixed(digits)}`;}
function chooseHeadline(events,delta,current){
  const snapshot=buildExecutiveIntelligenceSnapshot();
  const topRisk=snapshot.topRisks?.[0],topOpportunity=snapshot.topOpportunities?.[0];
  const major=[...(events||[])].sort((a,b)=>(b.importance||0)-(a.importance||0))[0];
  if(major)return major.text;
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
  const events=[...(company.weeklyEvents||[])];
  const intelligence=buildExecutiveIntelligenceSnapshot();
  const headline=chooseHeadline(events,delta,now);
  const people=employees.filter(e=>e.active)
    .sort((a,b)=>(b.achievements+b.taskProgress)-(a.achievements+a.taskProgress))
    .slice(0,2).map(e=>`${e.name}, ${e.role}: ${e.action}.`);
  const summary=[];
  if(Math.abs(delta.cash)>=.05)summary.push(`Cash changed ${signed(delta.cash,1)}M.`);
  if(Math.abs(delta.customers)>=1)summary.push(`Customers changed ${signed(delta.customers,0)}.`);
  if(Math.abs(delta.board)>=1)summary.push(`Board confidence moved ${signed(delta.board,0)} points.`);
  if(Math.abs(delta.morale)>=1)summary.push(`Morale moved ${signed(delta.morale,0)} points.`);
  if(now.phase!==before.phase)summary.push(`The product entered the ${now.phase} phase.`);
  if(!summary.length)summary.push("The company completed a relatively stable week.");
  const storyLead=contentPick(v25Content?.newspaperLeads||["The company completed another week."],events.length);
  const sourceSet=new Set(intelligence.sourceIds||[]);
  const storyThread=(company.storyChains||[]).slice().sort((a,b)=>{
    const aMatch=(a.beats||[]).some(beat=>[...sourceSet].some(id=>String(beat.text||"").includes(String(id).split(":").pop()))),bMatch=(b.beats||[]).some(beat=>[...sourceSet].some(id=>String(beat.text||"").includes(String(id).split(":").pop())));
    return (bMatch?20:0)+(b.lastDay||0)-((aMatch?20:0)+(a.lastDay||0));
  })[0];
  const issue={
    week:Math.floor(company.day/5),publishedAt:`Day ${company.day+1}`,storyLead,storyThread:storyThread?{subject:storyThread.subject,beats:(storyThread.beats||[]).slice(-3)}:null,
    title:"Office Aquarium Weekly",headline,summary:summary.join(" "),
    metrics:{cash:now.cash,board:now.board,trust:now.trust,customers:now.customers,revenue:now.revenue,morale:now.morale,stress:now.stress,phase:now.phase},
    events:events.sort((a,b)=>(b.importance||0)-(a.importance||0)).slice(0,6),
    people,
    intelligence:{risk:intelligence.topRisks?.[0]?.title||null,opportunity:intelligence.topOpportunities?.[0]?.title||null,tension:intelligence.departmentBeliefs?.[0]?.title||null,trend:intelligence.majorTrends?.[0]?.title||null}
  };
  company.newspapers=Array.isArray(company.newspapers)?company.newspapers:[];
  company.newspapers.unshift(issue);
  company.newspapers=company.newspapers.slice(0,24);
  company.weeklyEvents=[];
  company.weekStartSnapshot=captureWeekSnapshot();
  company.log.push(`Office Aquarium Weekly published: ${headline}`);
  saveGame();
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
  archive.innerHTML=`
    <article class="paper-issue">
      <div class="paper-masthead">
        <div><div class="paper-date">Week ${issue.week} - ${issue.publishedAt}</div><h3>${issue.title}</h3></div>
        <div class="phase-badge">${String(issue.metrics.phase).replace(/\b\w/g,c=>c.toUpperCase())}</div>
      </div>
      <h3 class="paper-headline">${issue.headline}</h3>
      <p class="paper-summary">${issue.storyLead||""} ${issue.summary}</p>
      <div class="paper-columns">
        <section class="paper-section"><h4>This Week</h4><ul>${issue.events.length?issue.events.map(e=>`<li>${e.text}</li>`).join(""):"<li>No major incidents were recorded.</li>"}</ul></section>
        <section class="paper-section"><h4>Company at a Glance</h4><ul>
          <li>Cash: $${Number(issue.metrics.cash).toFixed(1)}M</li>
          <li>Customers: ${Math.round(issue.metrics.customers)}</li>
          <li>Daily revenue: $${Number(issue.metrics.revenue).toFixed(2)}M</li>
          <li>Board confidence: ${Math.round(issue.metrics.board)}</li>
          <li>Morale: ${Math.round(issue.metrics.morale)}</li>
        </ul></section>
        <section class="paper-section"><h4>People to Watch</h4><ul>${issue.people.length?issue.people.map(p=>`<li>${p}</li>`).join(""):"<li>No standout employee this week.</li>"}</ul></section>
        <section class="paper-section"><h4>Story Chain</h4><ul>${issue.storyThread?`<li>${issue.storyThread.subject}</li>${issue.storyThread.beats.map(b=>`<li>Day ${(b.day??0)+1}: ${b.text}</li>`).join("")}`:"<li>No connected chain dominated the week.</li>"}</ul></section>
        <section class="paper-section"><h4>Risk Desk</h4><ul>
          <li>Trust: ${Math.round(issue.metrics.trust)}</li>
          ${issue.intelligence?.risk?`<li>${issue.intelligence.risk}</li>`:""}
          ${issue.intelligence?.trend?`<li>${issue.intelligence.trend}</li>`:""}
          ${issue.intelligence?.opportunity?`<li>Opportunity: ${issue.intelligence.opportunity}</li>`:""}
          <li>Stress: ${Math.round(issue.metrics.stress)}</li>
          <li>Current phase: ${issue.metrics.phase}</li>
        </ul></section>
      </div>
    </article>`;
}

function buildOffice(preservePositions=false){const office=document.getElementById("office");office.querySelectorAll(".agent").forEach(n=>n.remove());employees.forEach(e=>{const n=document.createElement("div");n.className="agent";n.id=`agent-${e.id}`;const color=colors[e.id%colors.length]||"#2ab7a9";n.innerHTML=`<div class="thought"></div><div class="avatar" style="background:${color}">${(e.name||"?")[0]}<span class="activity-dot"></span></div><small>${e.name}</small>`;n.onclick=()=>showEmployee(e.id);office.appendChild(n);if(preservePositions&&Number.isFinite(e.x)&&Number.isFinite(e.y)){n.style.transition="none";n.style.left=e.x+"%";n.style.top=e.y+"%";setTimeout(()=>n.style.transition="",20);}else moveToZone(e,e.zone,true);});}
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
