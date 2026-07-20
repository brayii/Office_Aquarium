const SOCIAL_ORGANIZATION_RULES=OFFICE_AQUARIUM_CONSTANTS.social;
const SOCIAL_ORGANIZATION_VIEWS=SOCIAL_ORGANIZATION_RULES.organizationViews;
const SOCIAL_MEMORY_RULES=SOCIAL_ORGANIZATION_RULES.memory;
const SOCIAL_CONVERSATION_RULES=SOCIAL_ORGANIZATION_RULES.conversations;
const SOCIAL_CULTURE_RULES=SOCIAL_ORGANIZATION_RULES.culture;
const SOCIAL_GROUP_RULES=SOCIAL_ORGANIZATION_RULES.groups;
const SOCIAL_LEADERSHIP_RULES=SOCIAL_ORGANIZATION_RULES.leadership;
let socialOrganizationValidatedCompany=null;
let socialOrganizationEnsuring=false;
let socialConversationUiState={company:null,hoveredId:null};

function socialClone(value){
  if(value===undefined)return undefined;
  return JSON.parse(JSON.stringify(value));
}
function socialHasFiniteNumber(value){
  return value!==null&&value!==undefined&&value!==""&&Number.isFinite(Number(value));
}
function socialNumberOr(value,fallback=0){
  return socialHasFiniteNumber(value)?Number(value):fallback;
}
function socialEmployee(employeeOrId){
  const id=Number(employeeOrId?.id??employeeOrId);
  return (employees||[]).find(employee=>employee.id===id)||null;
}
function socialProjectTitle(projectId){
  if(!projectId)return null;
  const all=[...(company?.projects||[]),...(company?.projectProposals||[]),...(company?.projectArchive||[])];
  return all.find(project=>project.id===projectId)?.title||null;
}
function socialWorkItem(workItemId){
  return (company?.workItems||[]).find(item=>item.id===workItemId)||null;
}
function socialStableId(prefix,...parts){
  return `${prefix}-${hashText32(parts.map(part=>String(part??"none")).join("|")).toString(16)}`;
}
function socialTimestampValue(timestamp){
  if(socialHasFiniteNumber(timestamp?.absoluteMinute))return Number(timestamp.absoluteMinute);
  if(socialHasFiniteNumber(timestamp))return Number(timestamp);
  return simulationTimestamp().absoluteMinute;
}
function socialPrivacy(value){
  return ["ordinary","private","confidential","public"].includes(value)?value:"ordinary";
}
function defaultSocialCultureDimension(name){
  const legacy=company?.culture||{};
  const seed={
    collaboration:legacy.communication??52,
    competitiveness:50,
    formality:50,
    psychologicalSafety:Math.round(((legacy.communication??50)+(legacy.workLife??50))/2),
    learningOrientation:legacy.innovation??52,
    recognitionFairness:50,
    conflictTolerance:45,
    riskTolerance:legacy.riskTolerance??50,
    socialWarmth:legacy.communication??52,
    accountability:legacy.qualityDiscipline??54,
    adaptability:legacy.innovation??52,
    inclusiveness:50
  }[name]??50;
  return {
    value:clamp(Number(seed)||50,0,100),
    confidence:0,
    evidenceCount:0,
    trend:0,
    lastUpdatedDay:null,
    evidenceTypes:[]
  };
}
function ensureEmployeeSocialOrganizationState(employee){
  if(!employee)return employee;
  ensureEmployeePersonality(employee);
  employee.motion=employee.motion&&typeof employee.motion==="object"?employee.motion:null;
  employee.conversationPresence=employee.conversationPresence&&typeof employee.conversationPresence==="object"?employee.conversationPresence:null;
  employee.officeFlow=employee.officeFlow&&typeof employee.officeFlow==="object"?employee.officeFlow:null;
  const hadCultureAdaptation=employee.cultureAdaptation&&typeof employee.cultureAdaptation==="object";
  employee.cultureAdaptation=hadCultureAdaptation?employee.cultureAdaptation:{};
  SOCIAL_CULTURE_RULES.dimensions.forEach(name=>{
    if(!Number.isFinite(Number(employee.cultureAdaptation[name]))){
      const companyNorm=Number(company?.socialCulture?.dimensions?.[name]?.value)||50;
      employee.cultureAdaptation[name]=hadCultureAdaptation?50:Number((50+(companyNorm-50)*.3).toFixed(3));
    }
    employee.cultureAdaptation[name]=clamp(Number(employee.cultureAdaptation[name]),0,100);
  });
  return employee;
}
function ensureSocialOrganizationContainers(){
  if(!company)return false;
  company.socialSourceEvents=Array.isArray(company.socialSourceEvents)?company.socialSourceEvents:[];
  company.socialMemoryStore=company.socialMemoryStore&&typeof company.socialMemoryStore==="object"
    ?company.socialMemoryStore
    :{schemaVersion:SOCIAL_MEMORY_RULES.schemaVersion,records:[],summaries:{},compressedCount:0};
  company.socialMemoryStore.schemaVersion=SOCIAL_MEMORY_RULES.schemaVersion;
  company.socialMemoryStore.records=Array.isArray(company.socialMemoryStore.records)?company.socialMemoryStore.records:[];
  company.socialMemoryStore.summaries=company.socialMemoryStore.summaries&&typeof company.socialMemoryStore.summaries==="object"?company.socialMemoryStore.summaries:{};
  company.socialMemoryStore.compressedCount=Math.max(0,Number(company.socialMemoryStore.compressedCount)||0);
  company.socialMemoryStore.emotionalRecallCooldowns=company.socialMemoryStore.emotionalRecallCooldowns&&typeof company.socialMemoryStore.emotionalRecallCooldowns==="object"?company.socialMemoryStore.emotionalRecallCooldowns:{};
  company.socialMemoryDebug=Array.isArray(company.socialMemoryDebug)?company.socialMemoryDebug:[];
  company.socialConflicts=Array.isArray(company.socialConflicts)?company.socialConflicts:[];
  company.socialConflictDebug=Array.isArray(company.socialConflictDebug)?company.socialConflictDebug:[];
  company.socialTemporaryStates=company.socialTemporaryStates&&typeof company.socialTemporaryStates==="object"?company.socialTemporaryStates:{};
  company.socialConversationState=company.socialConversationState&&typeof company.socialConversationState==="object"
    ?company.socialConversationState
    :{schemaVersion:SOCIAL_CONVERSATION_RULES.schemaVersion,history:[],templateUsage:{},recentCategoryHistory:{},knowledge:{},lastConversationByPair:{},pairHistory:{},recentPartnersByEmployee:{}};
  company.socialConversationState.schemaVersion=SOCIAL_CONVERSATION_RULES.schemaVersion;
  company.socialConversationState.history=Array.isArray(company.socialConversationState.history)
    ?company.socialConversationState.history.map(conversation=>{
      const normalized=normalizeStoredConversation(conversation);
      if(!normalized)return null;
      Object.assign(conversation,normalized);
      return conversation;
    }).filter(Boolean).slice(0,SOCIAL_CONVERSATION_RULES.maxStored)
    :[];
  company.socialConversationState.templateUsage=company.socialConversationState.templateUsage&&typeof company.socialConversationState.templateUsage==="object"?company.socialConversationState.templateUsage:{};
  company.socialConversationState.recentCategoryHistory=company.socialConversationState.recentCategoryHistory&&typeof company.socialConversationState.recentCategoryHistory==="object"?company.socialConversationState.recentCategoryHistory:{};
  company.socialConversationState.knowledge=company.socialConversationState.knowledge&&typeof company.socialConversationState.knowledge==="object"?company.socialConversationState.knowledge:{};
  Object.keys(company.socialConversationState.knowledge).forEach(employeeId=>{
    const knowledge=company.socialConversationState.knowledge[employeeId];
    company.socialConversationState.knowledge[employeeId]=Array.isArray(knowledge)
      ?knowledge.slice(0,SOCIAL_CONVERSATION_RULES.maxKnowledgePerEmployee)
      :[];
  });
  company.socialConversationState.lastConversationByPair=company.socialConversationState.lastConversationByPair&&typeof company.socialConversationState.lastConversationByPair==="object"?company.socialConversationState.lastConversationByPair:{};
  company.socialConversationState.pairHistory=company.socialConversationState.pairHistory&&typeof company.socialConversationState.pairHistory==="object"?company.socialConversationState.pairHistory:{};
  Object.entries(company.socialConversationState.pairHistory).forEach(([key,value])=>{
    const history=value&&typeof value==="object"?value:{};
    company.socialConversationState.pairHistory[key]={
      recentTemplateIds:Array.isArray(history.recentTemplateIds)?history.recentTemplateIds.slice(0,SOCIAL_CONVERSATION_RULES.maxRecentPairTemplates):[],
      recentTopics:Array.isArray(history.recentTopics)?history.recentTopics.slice(0,SOCIAL_CONVERSATION_RULES.maxRecentPairTopics):[],
      recentCategories:Array.isArray(history.recentCategories)?history.recentCategories.slice(0,SOCIAL_CONVERSATION_RULES.maxRecentCategories):[],
      lastConversationAt:socialHasFiniteNumber(history.lastConversationAt)?Number(history.lastConversationAt):null
    };
  });
  company.socialConversationState.recentPartnersByEmployee=company.socialConversationState.recentPartnersByEmployee&&typeof company.socialConversationState.recentPartnersByEmployee==="object"?company.socialConversationState.recentPartnersByEmployee:{};
  Object.keys(company.socialConversationState.recentPartnersByEmployee).forEach(employeeId=>{
    const partners=company.socialConversationState.recentPartnersByEmployee[employeeId];
    company.socialConversationState.recentPartnersByEmployee[employeeId]=Array.isArray(partners)
      ?partners.map(Number).filter(Number.isFinite).slice(0,SOCIAL_CONVERSATION_RULES.maxRecentPartnersPerEmployee)
      :[];
  });
  company.socialCulture=company.socialCulture&&typeof company.socialCulture==="object"
    ?company.socialCulture
    :{schemaVersion:SOCIAL_CULTURE_RULES.schemaVersion,dimensions:{},evidence:[],lastUpdatedDay:null};
  company.socialCulture.schemaVersion=SOCIAL_CULTURE_RULES.schemaVersion;
  company.socialCulture.dimensions=company.socialCulture.dimensions&&typeof company.socialCulture.dimensions==="object"?company.socialCulture.dimensions:{};
  SOCIAL_CULTURE_RULES.dimensions.forEach(name=>{
    const existing=company.socialCulture.dimensions[name]||{};
    company.socialCulture.dimensions[name]={...defaultSocialCultureDimension(name),...existing};
    company.socialCulture.dimensions[name].value=clamp(socialNumberOr(company.socialCulture.dimensions[name].value,50),0,100);
    company.socialCulture.dimensions[name].confidence=clamp(Number(company.socialCulture.dimensions[name].confidence)||0,0,100);
    company.socialCulture.dimensions[name].evidenceTypes=Array.isArray(company.socialCulture.dimensions[name].evidenceTypes)?company.socialCulture.dimensions[name].evidenceTypes.slice(0,12):[];
  });
  company.socialCulture.evidence=Array.isArray(company.socialCulture.evidence)?company.socialCulture.evidence:[];
  company.informalGroups=(Array.isArray(company.informalGroups)?company.informalGroups:[]).map(group=>({
    ownerSystem:AI_SYSTEM_OWNERS.groups,
    type:"department",
    cohesion:50,
    stability:SOCIAL_GROUP_RULES.initialStability,
    sharedHistoryScore:0,
    conflictScore:0,
    knowledgeFlowScore:50,
    confidence:SOCIAL_GROUP_RULES.minimumConfidence,
    sourceEvidenceIds:[],
    ...group,
    formedAt:group.formedAt||simulationTimestamp(group.formedDay??company.day,TIME_RULES.workdayStartMinute),
    memberIds:Array.isArray(group.memberIds)?group.memberIds.map(Number).filter(Number.isFinite):[],
    sourceEvidenceIds:Array.isArray(group.sourceEvidenceIds)?group.sourceEvidenceIds.map(String):[]
  }));
  company.informalGroupHistory=Array.isArray(company.informalGroupHistory)?company.informalGroupHistory:[];
  company.teamChemistry=company.teamChemistry&&typeof company.teamChemistry==="object"?company.teamChemistry:{};
  company.projectTeamChemistry=company.projectTeamChemistry&&typeof company.projectTeamChemistry==="object"?company.projectTeamChemistry:{};
  company.socialBridges=Array.isArray(company.socialBridges)?company.socialBridges:[];
  company.socialLeadership=company.socialLeadership&&typeof company.socialLeadership==="object"?company.socialLeadership:{};
  company.socialLeadershipDebug=Array.isArray(company.socialLeadershipDebug)?company.socialLeadershipDebug:[];
  company.socialOrganizationView=SOCIAL_ORGANIZATION_VIEWS.includes(company.socialOrganizationView)
    ?company.socialOrganizationView
    :SOCIAL_ORGANIZATION_RULES.defaultOrganizationView;
  (employees||[]).forEach(ensureEmployeeSocialOrganizationState);
  return true;
}

function normalizeSocialSourceEvent(event){
  if(!event?.id)return null;
  const timestamp=event.timestamp&&typeof event.timestamp==="object"?event.timestamp:simulationTimestamp(event.day??company.day,event.minute??company.minute);
  return {
    ownerSystem:AI_SYSTEM_OWNERS.social,
    id:String(event.id),
    type:String(event.type||"social-event"),
    category:String(event.category||event.type||"social-event"),
    actorId:socialHasFiniteNumber(event.actorId)?Number(event.actorId):null,
    subjectId:socialHasFiniteNumber(event.subjectId)?Number(event.subjectId):null,
    participantIds:[...new Set((event.participantIds||event.participants||[]).map(Number).filter(Number.isFinite))],
    roomId:event.roomId||null,
    projectId:event.projectId||null,
    workItemId:event.workItemId||event.context?.workItemId||null,
    privacy:socialPrivacy(event.privacy),
    volume:socialHasFiniteNumber(event.volume)?clamp(Number(event.volume),0,1):null,
    confidence:clamp(socialNumberOr(event.confidence,80),0,100),
    intensity:clamp(Number(event.intensity)||1,1,5),
    tone:["positive","negative","neutral","mixed"].includes(event.tone)?event.tone:"neutral",
    timestamp,
    context:event.context&&typeof event.context==="object"?socialClone(event.context):{}
  };
}
function pruneSocialSourceEvents(){
  const referenced=new Set([
    ...(company.socialMemoryStore?.records||[]).map(memory=>memory.sourceEventId),
    ...(company.socialConversationState?.history||[]).map(conversation=>conversation.sourceEventId),
    ...(company.socialConflicts||[]).filter(conflict=>conflict.status!=="resolved").map(conflict=>conflict.sourceEventId)
  ].filter(Boolean));
  const sorted=(company.socialSourceEvents||[]).slice().sort((a,b)=>socialTimestampValue(b.timestamp)-socialTimestampValue(a.timestamp)||String(a.id).localeCompare(String(b.id)));
  const kept=[],seen=new Set();
  for(const event of sorted){
    if(seen.has(event.id))continue;
    const withinCap=kept.length<SOCIAL_MEMORY_RULES.maxSourceEvents;
    if(withinCap||referenced.has(event.id)){kept.push(event);seen.add(event.id);}
  }
  company.socialSourceEvents=kept;
}
function registerSocialSourceEvent(event){
  if(!ensureSocialOrganizationContainers())return null;
  const normalized=normalizeSocialSourceEvent(event);
  if(!normalized)return null;
  const existing=company.socialSourceEvents.find(item=>item.id===normalized.id);
  if(existing){
    Object.assign(existing,{...normalized,timestamp:existing.timestamp||normalized.timestamp});
    return existing;
  }
  company.socialSourceEvents.unshift(normalized);
  pruneSocialSourceEvents();
  return normalized;
}
function createGroundedConversationOpportunity({
  id,
  type,
  category,
  actorId,
  subjectId,
  roomId=null,
  projectId=null,
  workItemId=null,
  confidence=80,
  intensity=1,
  tone="neutral",
  privacy="ordinary",
  context={}
}={}){
  if(!id||!type||!socialHasFiniteNumber(actorId)||!socialHasFiniteNumber(subjectId)||Number(actorId)===Number(subjectId))return null;
  const event=registerSocialSourceEvent({
    id,
    type,
    category,
    actorId:Number(actorId),
    subjectId:Number(subjectId),
    participantIds:[Number(actorId),Number(subjectId)],
    roomId,
    projectId,
    workItemId,
    confidence,
    intensity,
    tone,
    privacy,
    context:{...context,presentationOnly:true}
  });
  if(!event)return null;
  const experience={
    type:event.type,
    category:event.category,
    sourceEventId:event.id,
    timestamp:event.timestamp,
    roomId:event.roomId,
    projectId:event.projectId,
    participants:event.participantIds,
    actorId:event.actorId,
    subjectId:event.subjectId,
    privacy:event.privacy,
    confidence:event.confidence,
    intensity:event.intensity,
    emotionalTone:event.tone,
    context:socialClone(event.context)
  };
  const conversation=createGroundedConversationFromExperience(experience,event);
  if(!conversation){
    company.socialSourceEvents=company.socialSourceEvents.filter(item=>item.id!==event.id);
    return null;
  }
  return conversation;
}
function socialSourceEventById(sourceEventId){
  return (company?.socialSourceEvents||[]).find(event=>event.id===sourceEventId)||null;
}

function socialMemoryValence(tone){
  return tone==="positive"?1:tone==="negative"?-1:tone==="mixed"?-.2:0;
}
function socialMemoryValenceLabel(score){
  const value=clamp(Number(score)||0,-1,1);
  if(value>=.35)return "positive";
  if(value<=-.35)return "negative";
  if(Math.abs(value)<=.15)return "neutral";
  return "mixed";
}
function socialMemoryValenceScore(memoryOrValue){
  if(memoryOrValue&&typeof memoryOrValue==="object"){
    if(socialHasFiniteNumber(memoryOrValue.valenceScore))return clamp(Number(memoryOrValue.valenceScore),-1,1);
    return socialMemoryValenceScore(memoryOrValue.valence);
  }
  if(socialHasFiniteNumber(memoryOrValue))return clamp(Number(memoryOrValue),-1,1);
  return {positive:1,negative:-1,neutral:0,mixed:-.2}[String(memoryOrValue||"neutral")]??0;
}
function socialMemoryTypeForExperience(experienceType,tone="neutral"){
  const normalized=SOCIAL_ORGANIZATION_RULES.experienceAliases?.[experienceType]||experienceType;
  const mapped=SOCIAL_MEMORY_RULES.typeByExperience?.[normalized];
  if(mapped)return mapped;
  if(tone==="positive")return "supportive_conversation";
  if(tone==="negative")return "repeated_friction";
  return "mixed_outcome";
}
function socialMemoryTags(event,experience){
  const tags=new Set([
    String(event?.type||experience?.type||"social"),
    String(event?.category||experience?.category||"social")
  ]);
  if(event?.projectId||experience?.projectId)tags.add("project");
  if(event?.workItemId||experience?.context?.workItemId)tags.add("work");
  if(SOCIAL_ORGANIZATION_RULES.conflictExperienceTypes.includes(experience?.type))tags.add("conflict");
  if(["successful_repair","apology_accepted"].includes(experience?.type))tags.add("repair");
  if(["direct_help","help_request","blocker_resolved_together"].includes(experience?.type))tags.add("help");
  if(["recognition","recognition_shared","milestone_success_together","shared_success"].includes(experience?.type))tags.add("recognition");
  return [...tags].filter(Boolean).slice(0,12);
}
function socialMemoryContext(event,experience){
  const workItem=socialWorkItem(event?.workItemId||experience?.context?.workItemId);
  return {
    roomId:event?.roomId||experience?.roomId||null,
    projectId:event?.projectId||experience?.projectId||null,
    projectTitle:socialProjectTitle(event?.projectId||experience?.projectId)||null,
    workItemId:event?.workItemId||experience?.context?.workItemId||null,
    workTitle:workItem?.title||experience?.context?.workTitle||null,
    blocker:experience?.context?.blocker||event?.context?.blocker||null,
    purpose:experience?.context?.purpose||event?.context?.purpose||null,
    outcome:experience?.context?.outcome||event?.context?.outcome||null
  };
}
function encodeSocialMemory(owner,subject,event,experience){
  const personality=owner?.personality||{},baseIntensity=clamp(Number(experience?.intensity||event?.intensity)||1,1,5);
  const baseValence=socialMemoryValence(experience?.emotionalTone||event?.tone);
  const valenceSensitivity=baseValence<0
    ?1-(personality.empathy||0)*.07-(personality.forgivenessRate||0)*.1+(personality.structureNeed||0)*.05
    :1+(personality.sociability||0)*.06+(personality.empathy||0)*.05;
  const valence=clamp(baseValence*valenceSensitivity,-1,1);
  const sensitivity=1+(personality.empathy||0)*.08+(valence<0?(personality.structureNeed||0)*.06:0)-(personality.resilience||0)*.05;
  const intensity=Number(clamp(baseIntensity*sensitivity,1,5).toFixed(3));
  const confidence=clamp((Number(event?.confidence)||80)+(personality.detailOrientation||0)*5-(personality.riskTolerance||0)*2,20,100);
  const experienceType=String(experience?.type||event?.type||"social-event");
  const type=socialMemoryTypeForExperience(experienceType,experience?.emotionalTone||event?.tone);
  return {
    ownerSystem:AI_SYSTEM_OWNERS.social,
    id:socialStableId("social-memory",event?.id,owner.id,subject?.id,experienceType),
    ownerId:owner.id,
    subjectId:subject?.id??null,
    sourceEventId:event?.id||experience?.sourceEventId,
    type,
    valence:socialMemoryValenceLabel(valence),
    intensity,
    timestamp:experience?.timestamp||event?.timestamp||simulationTimestamp(),
    tags:socialMemoryTags(event,experience),
    context:socialMemoryContext(event,experience),
    confidence:Number(confidence.toFixed(2)),
    resolved:!SOCIAL_ORGANIZATION_RULES.conflictExperienceTypes.includes(experienceType),
    relatedMemoryIds:[],
    lastAgedDay:Number(experience?.timestamp?.day??event?.timestamp?.day??company.day),
    staleness:0
  };
}
function relationshipMemorySummaryKey(ownerId,subjectId){
  return `${Number(ownerId)}:${Number(subjectId)}`;
}
function compressSocialMemory(memory){
  if(!memory)return;
  const key=relationshipMemorySummaryKey(memory.ownerId,memory.subjectId),summaries=company.socialMemoryStore.summaries;
  const summary=summaries[key]||{ownerId:memory.ownerId,subjectId:memory.subjectId,count:0,positive:0,negative:0,neutral:0,unresolved:0,repaired:0,types:{},firstAt:null,lastAt:null,compressedIntensity:0,averageIntensity:0};
  summary.count++;
  const valence=socialMemoryValenceScore(memory);
  if(valence>0)summary.positive++;else if(valence<0)summary.negative++;else summary.neutral++;
  summary.types[memory.type]=(summary.types[memory.type]||0)+1;
  if(!memory.resolved)summary.unresolved=(summary.unresolved||0)+1;
  if((memory.tags||[]).includes("repair"))summary.repaired=(summary.repaired||0)+1;
  const memoryAt=socialTimestampValue(memory.timestamp);
  summary.firstAt=summary.firstAt===null?memoryAt:Math.min(Number(summary.firstAt)||memoryAt,memoryAt);
  summary.lastAt=Math.max(Number(summary.lastAt)||0,memoryAt);
  summary.compressedIntensity=Number((summary.compressedIntensity+(memory.intensity||1)).toFixed(3));
  summary.averageIntensity=Number((summary.compressedIntensity/summary.count).toFixed(3));
  summaries[key]=summary;
  company.socialMemoryStore.compressedCount++;
}
function socialMemoryRemovalPriority(memory){
  const ageDays=Math.max(0,(simulationTimestamp().absoluteMinute-socialTimestampValue(memory.timestamp))/TIME_RULES.minutesPerDay);
  return (memory.resolved?0:100)+(memory.intensity||1)*12+(memory.confidence||0)*.08-Math.min(80,ageDays*.5);
}
function socialMemoryDecayHorizon(memory){
  const owner=socialEmployee(memory.ownerId),personality=owner?.personality||{};
  let base;
  if(!memory.resolved)base=SOCIAL_MEMORY_RULES.unresolvedDecayDays;
  else if((memory.tags||[]).includes("repair"))base=SOCIAL_MEMORY_RULES.repairedDecayDays;
  else if((memory.intensity||1)<=1.5&&Math.abs(socialMemoryValenceScore(memory))<.5)base=SOCIAL_MEMORY_RULES.routineDecayDays;
  else base=SOCIAL_MEMORY_RULES.ordinaryDecayDays;
  const valence=socialMemoryValenceScore(memory);
  const forgivenessEffect=valence<0?1-(personality.forgivenessRate||0)*.18:1;
  const socialEffect=valence>0?1+(personality.sociability||0)*.08:1;
  const patternCount=company.socialMemoryStore?.summaries?.[relationshipMemorySummaryKey(memory.ownerId,memory.subjectId)]?.types?.[memory.type]||0;
  const repetitionEffect=1+Math.min(.35,patternCount*.025);
  return Math.max(1,base*clamp(forgivenessEffect*socialEffect*repetitionEffect,.65,1.5));
}
function ageAndCompressSocialMemories(){
  const nowDay=company.day,store=company.socialMemoryStore;
  const retained=[];
  (store.records||[]).forEach(memory=>{
    const ageDays=Math.max(0,nowDay-(memory.timestamp?.day??0));
    const lastAgedDay=Number.isFinite(Number(memory.lastAgedDay))?Number(memory.lastAgedDay):(memory.timestamp?.day??nowDay);
    const elapsedDays=Math.max(0,nowDay-lastAgedDay);
    const confidenceDecay=!memory.resolved?.025:(memory.intensity||1)<=1.5?.22:.07;
    if(elapsedDays>0)memory.confidence=Number(clamp((memory.confidence||50)-elapsedDays*confidenceDecay,5,100).toFixed(2));
    memory.lastAgedDay=nowDay;
    memory.staleness=Number(clamp(ageDays/Math.max(1,socialMemoryDecayHorizon(memory)),0,2).toFixed(3));
    const horizon=socialMemoryDecayHorizon(memory);
    const preserveUnresolved=!memory.resolved&&(memory.intensity||1)>=SOCIAL_MEMORY_RULES.unresolvedPreserveIntensity;
    if(ageDays>=horizon&&!preserveUnresolved)compressSocialMemory(memory);
    else retained.push(memory);
  });
  store.records=retained;
  enforceSocialMemoryBounds();
  return retained.length;
}
function logSocialMemoryDebug(entry){
  company.socialMemoryDebug=[
    {ownerSystem:AI_SYSTEM_OWNERS.social,timestamp:simulationTimestamp(),...socialClone(entry)},
    ...(company.socialMemoryDebug||[])
  ].slice(0,SOCIAL_MEMORY_RULES.maxDebugRecords);
  return entry;
}
function enforceSocialMemoryBounds(){
  const store=company.socialMemoryStore;
  let records=(store.records||[]).filter(memory=>memory?.id&&Number.isFinite(Number(memory.ownerId)));
  const removeRecord=memory=>{
    compressSocialMemory(memory);
    records=records.filter(item=>item!==memory);
  };
  const pairGroups=new Map();
  records.forEach(memory=>{
    const key=relationshipMemorySummaryKey(memory.ownerId,memory.subjectId);
    if(!pairGroups.has(key))pairGroups.set(key,[]);
    pairGroups.get(key).push(memory);
  });
  pairGroups.forEach(group=>{
    group.sort((a,b)=>socialMemoryRemovalPriority(b)-socialMemoryRemovalPriority(a)||socialTimestampValue(b.timestamp)-socialTimestampValue(a.timestamp));
    group.slice(SOCIAL_MEMORY_RULES.perRelationshipCap).forEach(removeRecord);
  });
  const employeeGroups=new Map();
  records.forEach(memory=>{
    if(!employeeGroups.has(memory.ownerId))employeeGroups.set(memory.ownerId,[]);
    employeeGroups.get(memory.ownerId).push(memory);
  });
  employeeGroups.forEach(group=>{
    group.sort((a,b)=>socialMemoryRemovalPriority(b)-socialMemoryRemovalPriority(a)||socialTimestampValue(b.timestamp)-socialTimestampValue(a.timestamp));
    group.slice(SOCIAL_MEMORY_RULES.perEmployeeCap).forEach(removeRecord);
  });
  records.sort((a,b)=>socialMemoryRemovalPriority(b)-socialMemoryRemovalPriority(a)||socialTimestampValue(b.timestamp)-socialTimestampValue(a.timestamp));
  records.slice(SOCIAL_MEMORY_RULES.globalCap).forEach(removeRecord);
  store.records=records.sort((a,b)=>socialTimestampValue(b.timestamp)-socialTimestampValue(a.timestamp)||String(a.id).localeCompare(String(b.id)));
  const summaryEntries=Object.entries(store.summaries).sort((a,b)=>(Number(b[1]?.lastAt)||0)-(Number(a[1]?.lastAt)||0));
  store.summaries=Object.fromEntries(summaryEntries.slice(0,SOCIAL_MEMORY_RULES.maxSummaries));
}
function storeSocialMemory(memory){
  if(!memory?.id||!memory.sourceEventId)return null;
  const existing=company.socialMemoryStore.records.find(item=>item.id===memory.id);
  if(existing)return existing;
  company.socialMemoryStore.records.unshift(memory);
  enforceSocialMemoryBounds();
  return memory;
}
function recordFirstMeetingMemory(a,b,{sourceEventId,roomId=null,showConversation=true}={}){
  if(!a?.active||!b?.active||!sourceEventId)return null;
  const event=registerSocialSourceEvent({id:sourceEventId,type:"first_met",category:"greeting",actorId:a.id,subjectId:b.id,participantIds:[a.id,b.id],roomId,confidence:95,intensity:2,tone:"neutral",context:{}});
  const experience={type:"first_met",category:"greeting",sourceEventId,timestamp:event.timestamp,roomId,participants:[a.id,b.id],actorId:a.id,subjectId:b.id,privacy:"ordinary",confidence:95,intensity:2,emotionalTone:"neutral",context:{}};
  const memories=[storeSocialMemory(encodeSocialMemory(a,b,event,experience)),storeSocialMemory(encodeSocialMemory(b,a,event,experience))];
  if(showConversation)createGroundedConversationFromExperience(experience,event);
  return memories;
}
function normalizeSocialMemoryRecord(memory){
  const ownerId=Number(memory?.ownerId??memory?.ownerEmployeeId);
  const subjectId=memory?.subjectId??memory?.subjectEmployeeId;
  if(!memory?.id||!memory.sourceEventId||!Number.isFinite(ownerId))return null;
  const experienceType=String(memory.experienceType||memory.type||"social-event");
  const existingType=String(memory.type||"");
  const type=SOCIAL_MEMORY_RULES.types.includes(existingType)
    ?existingType
    :socialMemoryTypeForExperience(experienceType,memory.valence);
  const valenceScore=socialMemoryValenceScore(memory);
  return {
    ownerSystem:AI_SYSTEM_OWNERS.social,
    id:String(memory.id),
    ownerId,
    subjectId:socialHasFiniteNumber(subjectId)?Number(subjectId):null,
    sourceEventId:String(memory.sourceEventId),
    type,
    valence:socialMemoryValenceLabel(valenceScore),
    intensity:clamp(Number(memory.intensity)||1,1,5),
    timestamp:memory.timestamp&&typeof memory.timestamp==="object"?memory.timestamp:simulationTimestamp(memory.day??0,memory.minute??0),
    tags:Array.isArray(memory.tags)?[...new Set(memory.tags.map(String))].slice(0,12):[],
    context:memory.context&&typeof memory.context==="object"?socialClone(memory.context):{},
    confidence:clamp(socialNumberOr(memory.confidence,50),0,100),
    resolved:memory.resolved!==false,
    relatedMemoryIds:Array.isArray(memory.relatedMemoryIds)?[...new Set(memory.relatedMemoryIds.map(String))].slice(0,12):[],
    lastAgedDay:Number.isFinite(Number(memory.lastAgedDay))?Number(memory.lastAgedDay):(memory.timestamp?.day??0),
    staleness:clamp(Number(memory.staleness)||0,0,2)
  };
}
function migrateLegacySocialMemories(){
  if(company.socialMemoryMigrationComplete)return;
  const legacy=Array.isArray(company.socialMemories)?company.socialMemories:[];
  legacy.forEach(memory=>{
    const ids=(memory.employeeIds||[]).map(Number).filter(Number.isFinite);
    if(memory.type!=="first_met"||ids.length<2||!memory.sourceEventId)return;
    const a=socialEmployee(ids[0]),b=socialEmployee(ids[1]);
    if(a&&b)recordFirstMeetingMemory(a,b,{sourceEventId:memory.sourceEventId,roomId:memory.roomId||null});
  });
  company.socialMemories=[];
  company.socialMemoryMigrationComplete=true;
}
function socialMemoryRecords(ownerId,{subjectId=null,tags=[],type=null}={}){
  const wantedTags=new Set((Array.isArray(tags)?tags:[tags]).filter(Boolean).map(String));
  return (company?.socialMemoryStore?.records||[]).filter(memory=>{
    if(memory.ownerId!==Number(ownerId))return false;
    if(subjectId!==null&&memory.subjectId!==Number(subjectId))return false;
    if(type&&memory.type!==type)return false;
    if(wantedTags.size&&![...wantedTags].every(tag=>(memory.tags||[]).includes(tag)))return false;
    return true;
  });
}
function socialMemoryReadCopy(records,limit=SOCIAL_MEMORY_RULES.recallLimit){
  return records.slice(0,Math.max(0,Number(limit)||SOCIAL_MEMORY_RULES.recallLimit)).map(socialClone);
}
function recallRecentMemories(ownerId,subjectId=null,limit=SOCIAL_MEMORY_RULES.recallLimit){
  ensureSocialOrganizationalSystems();
  const records=socialMemoryRecords(ownerId,{subjectId}).slice().sort((a,b)=>socialTimestampValue(b.timestamp)-socialTimestampValue(a.timestamp)||String(a.id).localeCompare(String(b.id)));
  return socialMemoryReadCopy(records,limit);
}
function recallByTag(ownerId,subjectOrTag,tagsOrLimit=SOCIAL_MEMORY_RULES.recallLimit,maybeLimit=SOCIAL_MEMORY_RULES.recallLimit){
  ensureSocialOrganizationalSystems();
  const hasSubject=Number.isFinite(Number(subjectOrTag))&&(Array.isArray(tagsOrLimit)||typeof tagsOrLimit==="string");
  const subjectId=hasSubject?Number(subjectOrTag):null;
  const tags=hasSubject?(Array.isArray(tagsOrLimit)?tagsOrLimit:[tagsOrLimit]):[subjectOrTag];
  const limit=hasSubject?maybeLimit:tagsOrLimit;
  const records=socialMemoryRecords(ownerId,{subjectId,tags}).slice().sort((a,b)=>socialTimestampValue(b.timestamp)-socialTimestampValue(a.timestamp)||b.intensity-a.intensity||String(a.id).localeCompare(String(b.id)));
  return socialMemoryReadCopy(records,limit);
}
function socialMemoryRelevance(memory,{tags=[],context={}}={}){
  const now=simulationTimestamp().absoluteMinute,wanted=new Set((tags||[]).map(String));
  const ageDays=Math.max(0,(now-socialTimestampValue(memory.timestamp))/TIME_RULES.minutesPerDay);
  const tagMatches=(memory.tags||[]).filter(tag=>wanted.has(tag)).length;
  const contextMatches=["projectId","workItemId","roomId"].filter(key=>context?.[key]&&memory.context?.[key]===context[key]).length;
  return (memory.resolved?0:18)+(memory.intensity||1)*10+(memory.confidence||0)*.08+tagMatches*9+contextMatches*12-Math.min(35,ageDays*.35);
}
function recallMostRelevant(ownerId,subjectOrOptions={},contextOrLimit={},maybeLimit=SOCIAL_MEMORY_RULES.recallLimit){
  ensureSocialOrganizationalSystems();
  const options=subjectOrOptions&&typeof subjectOrOptions==="object"&&!Array.isArray(subjectOrOptions)
    ?subjectOrOptions
    :{
      subjectId:socialHasFiniteNumber(subjectOrOptions)?Number(subjectOrOptions):null,
      context:contextOrLimit&&typeof contextOrLimit==="object"?contextOrLimit:{},
      limit:Number.isFinite(Number(maybeLimit))?Number(maybeLimit):SOCIAL_MEMORY_RULES.recallLimit
    };
  const {subjectId=null,tags=[],context={},limit=SOCIAL_MEMORY_RULES.recallLimit}=options;
  const records=socialMemoryRecords(ownerId,{subjectId}).map(memory=>{
    const score=socialMemoryRelevance(memory,{tags,context});
    return {memory,score};
  }).sort((a,b)=>b.score-a.score||socialTimestampValue(b.memory.timestamp)-socialTimestampValue(a.memory.timestamp)||String(a.memory.id).localeCompare(String(b.memory.id)));
  return socialMemoryReadCopy(records.map(item=>item.memory),limit);
}
function getRelationshipMemorySummary(ownerId,subjectId){
  ensureSocialOrganizationalSystems();
  const records=socialMemoryRecords(ownerId,{subjectId}),compressed=company.socialMemoryStore.summaries[relationshipMemorySummaryKey(ownerId,subjectId)]||null;
  const unresolved=records.filter(memory=>!memory.resolved).length+(compressed?.unresolved||0),repaired=records.filter(memory=>(memory.tags||[]).includes("repair")).length+(compressed?.repaired||0);
  const positive=records.filter(memory=>socialMemoryValenceScore(memory)>0).length+(compressed?.positive||0);
  const negative=records.filter(memory=>socialMemoryValenceScore(memory)<0).length+(compressed?.negative||0);
  return socialClone({
    ownerId:Number(ownerId),
    subjectId:Number(subjectId),
    activeCount:records.length,
    compressedCount:compressed?.count||0,
    positive,
    negative,
    neutral:records.length-records.filter(memory=>socialMemoryValenceScore(memory)!==0).length+(compressed?.neutral||0),
    unresolved,
    repaired,
    strongest:records.slice().sort((a,b)=>b.intensity-a.intensity||socialTimestampValue(b.timestamp)-socialTimestampValue(a.timestamp))[0]||null,
    latestAt:Math.max(compressed?.lastAt||0,...records.map(memory=>socialTimestampValue(memory.timestamp)),0)||null
  });
}
function buildSocialConversationContext(owner,subject,event,category){
  const relationship=getRelationshipView(owner,subject);
  const recent=recallRecentMemories(owner.id,subject.id,4);
  const relevant=recallMostRelevant(owner.id,{
    subjectId:subject.id,
    tags:[category,event.type].filter(Boolean),
    context:{projectId:event.projectId,workItemId:event.workItemId,roomId:event.roomId},
    limit:4
  });
  const unresolved=relevant.filter(memory=>!memory.resolved);
  const positivePatterns=getRelationshipMemorySummary(owner.id,subject.id);
  return {
    ownerId:owner.id,
    subjectId:subject.id,
    relationship:socialClone(relationship.interpretation),
    recentMemoryIds:recent.map(memory=>memory.id),
    relevantMemoryIds:relevant.map(memory=>memory.id),
    unresolvedMemoryIds:unresolved.map(memory=>memory.id),
    positivePatternCount:positivePatterns.positive,
    negativePatternCount:positivePatterns.negative,
    emotionalState:{
      owner:{stress:owner.stress,morale:owner.morale,frustration:owner.emotionalState?.frustration||0},
      subject:{stress:subject.stress,morale:subject.morale,frustration:subject.emotionalState?.frustration||0}
    },
    interactionType:event.type,
    roomId:event.roomId,
    projectId:event.projectId||null,
    workItemId:event.workItemId||null,
    timestamp:socialClone(event.timestamp)
  };
}
function socialMemoryEmotionalRecommendation(owner,subject,event,category){
  const ranked=socialMemoryRecords(owner.id,{subjectId:subject.id})
    .filter(memory=>memory.sourceEventId!==event.id)
    .map(memory=>({memory,score:socialMemoryRelevance(memory,{
      tags:[category,event.type].filter(Boolean),
      context:{projectId:event.projectId,workItemId:event.workItemId,roomId:event.roomId}
    })}))
    .sort((a,b)=>b.score-a.score||socialTimestampValue(b.memory.timestamp)-socialTimestampValue(a.memory.timestamp)||String(a.memory.id).localeCompare(String(b.memory.id)));
  const best=ranked[0];
  if(!best||best.memory.intensity<SOCIAL_MEMORY_RULES.emotionalRecallMinimumIntensity)return null;
  const valence=socialMemoryValenceScore(best.memory);
  const unresolvedMultiplier=best.memory.resolved?1:1.3;
  const clarity=clamp((best.memory.confidence||50)/100,.2,1);
  return {
    employeeId:owner.id,
    subjectId:subject.id,
    memoryId:best.memory.id,
    sourceEventId:best.memory.sourceEventId,
    relevanceScore:Number(best.score.toFixed(2)),
    stressDelta:Number(clamp(-valence*(best.memory.intensity||1)*.32*clarity*unresolvedMultiplier,-SOCIAL_MEMORY_RULES.emotionalRecallStressMaximum,SOCIAL_MEMORY_RULES.emotionalRecallStressMaximum).toFixed(3)),
    moraleDelta:Number(clamp(valence*(best.memory.intensity||1)*.22*clarity,-SOCIAL_MEMORY_RULES.emotionalRecallMoraleMaximum,SOCIAL_MEMORY_RULES.emotionalRecallMoraleMaximum).toFixed(3)),
    reasonCode:`memory_recall_${best.memory.type}`
  };
}
function applySocialMemoryRecallRecommendation(owner,subject,event,category){
  const recommendation=socialMemoryEmotionalRecommendation(owner,subject,event,category);
  if(!recommendation)return null;
  const cooldowns=company.socialMemoryStore.emotionalRecallCooldowns;
  const cooldownKey=`${owner.id}:${subject.id}`;
  const now=simulationTimestamp().absoluteMinute,last=Number(cooldowns[cooldownKey])||OFFICE_AQUARIUM_CONSTANTS.time.neverAbsoluteMinute;
  const cooldownRemaining=Math.max(0,SOCIAL_MEMORY_RULES.emotionalRecallCooldownMinutes-(now-last));
  if(cooldownRemaining>0){
    logSocialMemoryDebug({type:"emotional-recall",status:"cooldown",cooldownKey,cooldownRemaining,...recommendation});
    return {...recommendation,status:"cooldown",cooldownRemaining};
  }
  const trace=emotionalSystem.applyRecommendation({
    employeeId:owner.id,
    stressDelta:recommendation.stressDelta,
    moraleDelta:recommendation.moraleDelta,
    reasonCode:recommendation.reasonCode,
    sourceEventId:recommendation.sourceEventId,
    relatedEmployeeIds:[subject.id],
    timestamp:simulationTimestamp()
  });
  cooldowns[cooldownKey]=now;
  logSocialMemoryDebug({
    type:"emotional-recall",
    status:trace?.status||"evaluated",
    cooldownKey,
    cooldownUntilAbsoluteMinute:now+SOCIAL_MEMORY_RULES.emotionalRecallCooldownMinutes,
    ...recommendation,
    appliedStressDelta:trace?.stressDeltaApplied||0,
    appliedMoraleDelta:trace?.moraleDeltaApplied||0
  });
  return {...recommendation,trace};
}

function socialConflictRecordFromExperience(experience,memoryIds=[]){
  const id=socialStableId("social-conflict",experience.sourceEventId,experience.actorId,experience.subjectId,experience.type);
  const existing=company.socialConflicts.find(conflict=>conflict.id===id);
  if(existing)return existing;
  const conflict={
    ownerSystem:AI_SYSTEM_OWNERS.social,
    id,
    sourceEventId:experience.sourceEventId,
    actorId:experience.actorId,
    subjectId:experience.subjectId,
    participantIds:[...new Set(experience.participants||[experience.actorId,experience.subjectId])],
    type:experience.type,
    projectId:experience.projectId||null,
    roomId:experience.roomId||null,
    intensity:experience.intensity,
    createdAt:experience.timestamp,
    status:"unresolved",
    repairAttempts:[],
    resolvedAt:null,
    resolutionSourceEventId:null,
    memoryIds:[...memoryIds],
    relationshipBefore:socialClone(experience.relationshipBefore||null),
    relationshipAfter:socialClone(experience.relationshipAfter||null),
    personalityModifiers:{
      actorForgiveness:Number(socialEmployee(experience.actorId)?.personality?.forgivenessRate)||0,
      subjectForgiveness:Number(socialEmployee(experience.subjectId)?.personality?.forgivenessRate)||0,
      actorResilience:Number(socialEmployee(experience.actorId)?.personality?.resilience)||0,
      subjectResilience:Number(socialEmployee(experience.subjectId)?.personality?.resilience)||0
    },
    emotionalRecommendations:socialClone(experience.employeeReactions||{}),
    cooldownMinutes:SOCIAL_ORGANIZATION_RULES.conflict.duplicateCooldownMinutes
  };
  company.socialConflicts.unshift(conflict);
  company.socialConflicts=company.socialConflicts.slice(0,SOCIAL_ORGANIZATION_RULES.conflict.maxActiveRecords);
  const frustration=1.5+conflict.intensity*1.25;
  [conflict.actorId,conflict.subjectId].forEach(employeeId=>{
    emotionalSystem.applyDrivers({employeeId,frustrationDelta:frustration,conflictFatigueDelta:.6+conflict.intensity*.45,reasonCode:`conflict_${conflict.type}`,sourceEventId:conflict.sourceEventId});
    company.socialTemporaryStates[employeeId]={lastConflictId:conflict.id,lastConflictAt:socialTimestampValue(conflict.createdAt),sourceEventId:conflict.sourceEventId};
  });
  company.socialConflictDebug=[
    {
      ownerSystem:AI_SYSTEM_OWNERS.social,
      type:"conflict-created",
      conflictId:conflict.id,
      sourceEventId:conflict.sourceEventId,
      conflictType:conflict.type,
      relationshipBefore:socialClone(conflict.relationshipBefore),
      relationshipAfter:socialClone(conflict.relationshipAfter),
      personalityModifiers:socialClone(conflict.personalityModifiers),
      emotionalRecommendations:socialClone(conflict.emotionalRecommendations),
      cooldownMinutes:conflict.cooldownMinutes,
      timestamp:simulationTimestamp()
    },
    ...(company.socialConflictDebug||[])
  ].slice(0,SOCIAL_ORGANIZATION_RULES.conflict.maxDebugRecords);
  return conflict;
}
function latestUnresolvedConflictBetween(aId,bId){
  const key=makeRelationshipKey(aId,bId);
  return (company.socialConflicts||[]).filter(conflict=>conflict.status!=="resolved"&&makeRelationshipKey(conflict.actorId,conflict.subjectId)===key)
    .sort((a,b)=>socialTimestampValue(b.createdAt)-socialTimestampValue(a.createdAt))[0]||null;
}
function maybeCreateAutomaticConflictRepair(a,b,roomId){
  if(!a?.active||!b?.active||a.offsite||b.offsite||a.id===b.id||!roomId)return null;
  const conflict=latestUnresolvedConflictBetween(a.id,b.id);
  if(!conflict)return null;
  const rules=SOCIAL_ORGANIZATION_RULES.conflict.automaticRepair;
  const now=simulationTimestamp().absoluteMinute;
  const age=now-socialTimestampValue(conflict.createdAt);
  if(age<rules.ageMinutes||now-(Number(conflict.lastAutomaticRepairCheckAt)||OFFICE_AQUARIUM_CONSTANTS.time.neverAbsoluteMinute)<rules.checkMinutes)return null;
  conflict.lastAutomaticRepairCheckAt=now;
  const actor=socialEmployee(conflict.actorId),subject=socialEmployee(conflict.subjectId);
  if(!actor?.active||!subject?.active||actor.offsite||subject.offsite)return null;
  if(conversationParticipantRoom(actor)!==roomId||conversationParticipantRoom(subject)!==roomId)return null;
  refreshEmployeeConversationPresence(actor);
  refreshEmployeeConversationPresence(subject);
  if(actor.conversationPresence||subject.conversationPresence)return null;
  if(employeeHasCriticalConversationConflict(actor,"repair")||employeeHasCriticalConversationConflict(subject,"repair"))return null;
  const forgiveness=((actor.personality?.forgivenessRate||0)+(subject.personality?.forgivenessRate||0))/2;
  const empathy=((actor.personality?.empathy||0)+(subject.personality?.empathy||0))/2;
  const relationship=getRelationshipView(actor,subject).interpretation;
  const safety=(company.socialCulture?.dimensions?.psychologicalSafety?.value??50)-50;
  const attempts=(conflict.repairAttempts||[]).length;
  const readiness=
    rules.baseReadiness+
    forgiveness*rules.forgivenessWeight+
    empathy*rules.empathyWeight+
    ((relationship.trust??50)-50)*rules.trustWeight+
    safety*rules.psychologicalSafetyWeight-
    (conflict.intensity||1)*rules.intensityPenalty-
    attempts*rules.previousAttemptPenalty;
  const windows=Math.floor(Math.max(0,age-rules.ageMinutes)/rules.checkMinutes);
  const threshold=Math.max(rules.minimumThreshold,rules.initialThreshold-windows*rules.thresholdDecayPerWindow);
  if(readiness<threshold)return null;
  const source=typeof socialSourceEventById==="function"?socialSourceEventById(conflict.sourceEventId):null;
  const projectTitle=socialProjectTitle(conflict.projectId);
  const repairType=(actor.personality?.empathy||0)+(actor.personality?.forgivenessRate||0)>=0?"apology":"clarification";
  const sourceEventId=`conflict-repair-${conflict.id}-${now}`;
  recordSharedExperience(actor,subject,{
    type:repairType,
    sourceEventId,
    roomId,
    projectId:conflict.projectId||null,
    tone:"positive",
    intensity:readiness>=threshold+10?3:2,
    actorId:actor.id,
    subjectId:subject.id,
    category:"repair",
    confidence:clamp(Math.round(55+readiness*.35),55,90),
    context:{
      workItemId:source?.context?.workItemId||null,
      workTitle:source?.context?.workTitle||projectTitle||null,
      purpose:"repair the earlier disagreement",
      outcome:"The coworkers chose to address an unresolved conflict after taking time to cool down."
    }
  });
  return conflict.repairAttempts?.at(-1)||null;
}
function linkConflictAndRepairMemories(conflict,repairMemoryIds){
  const records=company.socialMemoryStore.records||[];
  const allIds=[...(conflict.memoryIds||[]),...(repairMemoryIds||[])];
  records.filter(memory=>allIds.includes(memory.id)).forEach(memory=>{
    memory.relatedMemoryIds=[...new Set([...(memory.relatedMemoryIds||[]),...allIds.filter(id=>id!==memory.id)])].slice(0,12);
    if((conflict.memoryIds||[]).includes(memory.id))memory.resolved=conflict.status==="resolved";
    if(conflict.status==="resolved"&&(repairMemoryIds||[]).includes(memory.id)){
      memory.tags=[...new Set([...(memory.tags||[]),"repair"])].slice(0,12);
      memory.resolved=true;
    }
  });
}
function socialRepairFromExperience(experience,memoryIds=[]){
  const conflict=latestUnresolvedConflictBetween(experience.actorId,experience.subjectId);
  if(!conflict)return null;
  const age=socialTimestampValue(experience.timestamp)-socialTimestampValue(conflict.createdAt);
  if(age<SOCIAL_ORGANIZATION_RULES.conflict.minimumRepairAgeMinutes&&experience.type!=="apology_accepted")return null;
  const actor=socialEmployee(experience.actorId),subject=socialEmployee(experience.subjectId);
  const forgiveness=((actor?.personality?.forgivenessRate||0)+(subject?.personality?.forgivenessRate||0))/2;
  const relationship=getRelationshipView(actor||experience.actorId,subject||experience.subjectId).interpretation;
  const relationshipRecord=company.socialRelationships?.[makeRelationshipKey(conflict.actorId,conflict.subjectId)]||null;
  const leadership=actor?socialLeadershipState(actor,{create:false}):null;
  const leadershipBonus=leadership&&leadership.confidence>=20
    ?clamp((leadership.credibility-50)*.08+(leadership.conflictHandling-50)*.08,-8,8)
    :0;
  const acceptance=clamp(52+forgiveness*20+(relationship.trust-50)*.2+(experience.intensity||1)*5-(conflict.intensity||1)*4+leadershipBonus,0,100);
  const accepted=experience.type==="apology_accepted"||acceptance>=SOCIAL_ORGANIZATION_RULES.conflict.repairAcceptanceThreshold;
  const attempt={
    sourceEventId:experience.sourceEventId,
    type:experience.type,
    timestamp:experience.timestamp,
    accepted,
    acceptance:Math.round(acceptance),
    leadershipBonus:Number(leadershipBonus.toFixed(2)),
    relationshipBefore:socialClone(experience.relationshipBefore||relationship),
    relationshipAfter:socialClone(experience.relationshipAfter||relationship),
    memoryIds:[...memoryIds],
    emotionalRecommendations:socialClone(experience.employeeReactions||{})
  };
  conflict.repairAttempts.push(attempt);
  if(accepted){
    conflict.status="resolved";
    conflict.resolvedAt=experience.timestamp;
    conflict.resolutionSourceEventId=experience.sourceEventId;
    const relief=1.2+(experience.intensity||1)*.8;
    if(relationshipRecord)relationshipRecord.resolvedConflictCount=(Number(relationshipRecord.resolvedConflictCount)||0)+1;
    [conflict.actorId,conflict.subjectId].forEach(employeeId=>emotionalSystem.applyDrivers({employeeId,frustrationDelta:-relief,conflictFatigueDelta:-relief*.7,reasonCode:`repair_${experience.type}`,sourceEventId:experience.sourceEventId}));
  }else conflict.status="repair_attempted";
  linkConflictAndRepairMemories(conflict,memoryIds);
  if(relationshipRecord)evaluateRelationshipInterpretation(relationshipRecord);
  attempt.relationshipAfter=socialClone(getRelationshipView(actor||experience.actorId,subject||experience.subjectId).interpretation);
  conflict.relationshipAfter=socialClone(attempt.relationshipAfter);
  company.socialConflictDebug=[
    {
      ownerSystem:AI_SYSTEM_OWNERS.social,
      type:"repair-evaluated",
      conflictId:conflict.id,
      sourceEventId:experience.sourceEventId,
      repairType:experience.type,
      accepted,
      acceptance:Math.round(acceptance),
      leadershipBonus:Number(leadershipBonus.toFixed(2)),
      evidenceMemoryIds:[...memoryIds],
      emotionalRecommendations:socialClone(attempt.emotionalRecommendations),
      relationshipBefore:socialClone(attempt.relationshipBefore),
      relationshipAfter:socialClone(attempt.relationshipAfter),
      timestamp:simulationTimestamp()
    },
    ...(company.socialConflictDebug||[])
  ].slice(0,SOCIAL_ORGANIZATION_RULES.conflict.maxDebugRecords);
  return conflict;
}
function socialRelationshipMemoryAdjustment(record,a,b){
  if(!company?.socialMemoryStore)return {trust:0,respect:0,comfort:0,friction:0,unresolved:0,repaired:0};
  const aSummary=getRelationshipMemorySummary(a.id,b.id),bSummary=getRelationshipMemorySummary(b.id,a.id);
  const unresolved=aSummary.unresolved+bSummary.unresolved,repaired=aSummary.repaired+bSummary.repaired;
  const net=(aSummary.positive+bSummary.positive)-(aSummary.negative+bSummary.negative);
  return {
    trust:Number(clamp(net*.22-unresolved*.8+repaired*.35,-8,8).toFixed(2)),
    respect:Number(clamp(net*.18-unresolved*.4+repaired*.3,-6,6).toFixed(2)),
    comfort:Number(clamp(net*.2-unresolved*.9+repaired*.45,-8,8).toFixed(2)),
    friction:Number(clamp(unresolved*1.2-repaired*.55-net*.12,-8,10).toFixed(2)),
    unresolved,
    repaired
  };
}

function cultureEvidenceVectorForExperience(experience){
  const type=experience.type,positive=experience.emotionalTone==="positive",negative=experience.emotionalTone==="negative";
  const vector={};
  const add=(key,value)=>{vector[key]=(vector[key]||0)+value;};
  if(["direct_help","help_request","successful_collaboration","blocker_resolved_together","routine_collaboration"].includes(type)){add("collaboration",positive?1:.25);add("socialWarmth",positive?.5:.2);add("psychologicalSafety",positive?.35:.2);}
  if(["mentoring_interaction","constructive_feedback","onboarding_support"].includes(type)){add("learningOrientation",1);add("inclusiveness",.6);add("socialWarmth",.4);}
  if(["recognition","recognition_shared"].includes(type)){add("recognitionFairness",positive?1:-.8);add("socialWarmth",.4);}
  if(SOCIAL_ORGANIZATION_RULES.conflictExperienceTypes.includes(type)){add("conflictTolerance",negative?-.7:.2);add("psychologicalSafety",-1);add("collaboration",-.4);add("competitiveness",.35);}
  if(SOCIAL_ORGANIZATION_RULES.repairExperienceTypes.includes(type)){add("conflictTolerance",.75);add("psychologicalSafety",.65);add("accountability",.55);add("adaptability",.35);}
  if(["shared_meeting","same_meeting"].includes(type)){add("formality",.3);add("accountability",positive?.4:-.2);}
  if(["shared_break","same_break","casual_conversation","conversation"].includes(type)){add("socialWarmth",positive?.55:.15);add("inclusiveness",.25);}
  if(["deadline_pressure_together","meeting_conflict","deadline_blame"].includes(type)){add("competitiveness",.45);add("riskTolerance",.2);add("psychologicalSafety",- .35);}
  return vector;
}
function recordSocialCultureEvidence(experience){
  const vector=cultureEvidenceVectorForExperience(experience);
  if(!Object.keys(vector).length)return null;
  const participantRoleWeight=(experience.participants||[]).map(socialEmployee).filter(Boolean)
    .reduce((highest,employee)=>Math.max(highest,1+Math.min(.4,roleLeadershipLevel(employee.role)*.08)),1);
  const evidence={
    id:socialStableId("culture-evidence",experience.sourceEventId,experience.type),
    ownerSystem:AI_SYSTEM_OWNERS.culture,
    sourceEventId:experience.sourceEventId,
    type:experience.type,
    dimensions:vector,
    confidence:clamp(Number(experience.confidence)||75,0,100),
    intensity:clamp(Number(experience.intensity)||1,1,5),
    roleWeight:Number(participantRoleWeight.toFixed(2)),
    day:experience.timestamp?.day??company.day,
    participantIds:[...(experience.participants||[])]
  };
  if(company.socialCulture.evidence.some(item=>item.id===evidence.id))return evidence;
  company.socialCulture.evidence.unshift(evidence);
  company.socialCulture.evidence=company.socialCulture.evidence.slice(0,SOCIAL_CULTURE_RULES.maxEvidence);
  return evidence;
}
function recordOrganizationalCultureEvidence({sourceEventId,type,dimensions,confidence=70,intensity=2,participantIds=[]}={}){
  if(!sourceEventId||!dimensions||!Object.keys(dimensions).length)return null;
  ensureSocialOrganizationContainers();
  const evidence={
    id:socialStableId("culture-evidence",sourceEventId,type),
    ownerSystem:AI_SYSTEM_OWNERS.culture,
    sourceEventId:String(sourceEventId),
    type:String(type||"organizational-event"),
    dimensions:Object.fromEntries(Object.entries(dimensions)
      .filter(([name,value])=>SOCIAL_CULTURE_RULES.dimensions.includes(name)&&Number.isFinite(Number(value)))
      .map(([name,value])=>[name,clamp(Number(value),-1,1)])),
    confidence:clamp(Number(confidence)||70,0,100),
    intensity:clamp(Number(intensity)||2,1,5),
    roleWeight:1,
    day:company.day,
    participantIds:[...new Set(participantIds.map(Number).filter(Number.isFinite))]
  };
  if(!Object.keys(evidence.dimensions).length)return null;
  if(company.socialCulture.evidence.some(item=>item.id===evidence.id))return company.socialCulture.evidence.find(item=>item.id===evidence.id);
  company.socialCulture.evidence.unshift(evidence);
  company.socialCulture.evidence=company.socialCulture.evidence.slice(0,SOCIAL_CULTURE_RULES.maxEvidence);
  return evidence;
}
function updateSocialCulture(){
  ensureSocialOrganizationalSystems();
  if(company.socialCulture.lastUpdatedDay===company.day)return company.socialCulture;
  const recent=company.socialCulture.evidence.filter(evidence=>company.day-evidence.day<=SOCIAL_CULTURE_RULES.recentEvidenceDays&&evidence.confidence>=SOCIAL_CULTURE_RULES.minimumEvidenceConfidence);
  SOCIAL_CULTURE_RULES.dimensions.forEach(name=>{
    const dimension=company.socialCulture.dimensions[name],relevant=recent.filter(evidence=>Number.isFinite(Number(evidence.dimensions?.[name])));
    if(!relevant.length){dimension.trend=0;return;}
    const evidenceWeight=evidence=>{
      const age=Math.max(0,company.day-evidence.day);
      const recency=clamp(1-(age/SOCIAL_CULTURE_RULES.recentEvidenceDays)*.65,.35,1);
      return (evidence.confidence/100)*evidence.intensity*(evidence.roleWeight||1)*recency;
    };
    const weighted=relevant.reduce((sum,evidence)=>sum+evidence.dimensions[name]*evidenceWeight(evidence),0);
    const weight=relevant.reduce((sum,evidence)=>sum+evidenceWeight(evidence),0);
    const target=clamp(50+(weighted/Math.max(1,weight))*18,20,80);
    const requested=(target-dimension.value)*SOCIAL_CULTURE_RULES.evidenceStrengthScale;
    const drift=clamp(requested,-SOCIAL_CULTURE_RULES.dailyMaxDrift,SOCIAL_CULTURE_RULES.dailyMaxDrift);
    dimension.value=Number(clamp(dimension.value+drift,0,100).toFixed(3));
    dimension.trend=Number(drift.toFixed(3));
    const diversity=new Set(relevant.map(evidence=>evidence.type)).size;
    const evidenceConfidence=clamp(relevant.length*4+diversity*5,0,100);
    dimension.confidence=Number(clamp(dimension.confidence*.985+evidenceConfidence*.015,0,100).toFixed(2));
    dimension.evidenceCount=relevant.length;
    dimension.lastUpdatedDay=company.day;
    dimension.evidenceTypes=[...new Set(relevant.map(evidence=>evidence.type))].slice(0,12);
  });
  (employees||[]).filter(employee=>employee.active).forEach(employee=>{
    ensureEmployeeSocialOrganizationState(employee);
    const adaptability=clamp(1+(employee.personality?.adaptability||0)*.35,.65,1.35);
    const directExposure=recent.filter(evidence=>(evidence.participantIds||[]).includes(employee.id)).length;
    const exposureScale=directExposure?1:.35;
    SOCIAL_CULTURE_RULES.dimensions.forEach(name=>{
      const target=company.socialCulture.dimensions[name].value,current=socialNumberOr(employee.cultureAdaptation[name],50);
      employee.cultureAdaptation[name]=Number(clamp(current+(target-current)*SOCIAL_CULTURE_RULES.adaptationRate*adaptability*exposureScale,0,100).toFixed(3));
    });
    employee.cultureAdaptationUpdatedDay=company.day;
  });
  company.socialCulture.lastUpdatedDay=company.day;
  return company.socialCulture;
}
function socialCultureReportingModifier(employee){
  if(!company?.socialCulture)return 0;
  const safety=(company.socialCulture.dimensions?.psychologicalSafety?.value||50)-50;
  const inclusiveness=(company.socialCulture.dimensions?.inclusiveness?.value||50)-50;
  const adaptation=employee?.cultureAdaptation?.psychologicalSafety??50;
  return Number(clamp(safety*.1+inclusiveness*.04+(adaptation-50)*.025,-7,7).toFixed(3));
}
function socialCultureExperienceRecommendation(employee,type,tone){
  const dimensions=company?.socialCulture?.dimensions||{};
  const centered=name=>((dimensions[name]?.value??50)-50)/50;
  let stressDelta=0,moraleDelta=0;
  if(["mentoring_interaction","constructive_feedback","onboarding_support"].includes(type))moraleDelta+=centered("learningOrientation")*.45;
  if(["recognition","recognition_shared","credit_dispute"].includes(type)){
    const sensitivity=1+Math.max(0,centered("competitiveness"))*.35;
    moraleDelta+=(tone==="negative"?-.35:.25)*sensitivity;
  }
  if(["ignored_request","failed_collaboration","deadline_blame"].includes(type))stressDelta+=Math.max(0,centered("accountability"))*.45;
  if(SOCIAL_ORGANIZATION_RULES.conflictExperienceTypes.includes(type))stressDelta-=Math.max(0,centered("psychologicalSafety"))*.25;
  return {
    stressDelta:Number(clamp(stressDelta,-.6,.6).toFixed(3)),
    moraleDelta:Number(clamp(moraleDelta,-.6,.6).toFixed(3))
  };
}
function socialCulturePreferenceModifier(employee,coworker,opportunity={}){
  if(!company?.socialCulture)return 0;
  const dimensions=company.socialCulture.dimensions||{},adapt=employee?.cultureAdaptation||{};
  const collaboration=socialNumberOr(dimensions.collaboration?.value,50)-50;
  const warmth=socialNumberOr(dimensions.socialWarmth?.value,50)-50;
  const safety=socialNumberOr(dimensions.psychologicalSafety?.value,50)-50;
  const employeeFit=(socialNumberOr(adapt.collaboration,50)-50)*.04+(socialNumberOr(adapt.socialWarmth,50)-50)*.03;
  const modifier=collaboration*.08+warmth*.06+safety*.04+employeeFit;
  return Number(clamp(modifier,-12,12).toFixed(3));
}
function socialGroupPreferenceModifier(employee,coworker,opportunity={}){
  const shared=(company?.informalGroups||[]).filter(group=>group.memberIds.includes(employee?.id)&&group.memberIds.includes(coworker?.id));
  if(!shared.length)return 0;
  const strongest=shared.sort((a,b)=>(b.confidence||0)-(a.confidence||0)||(b.strength||0)-(a.strength||0))[0];
  const statusScale=strongest.status==="active"?1:.45;
  return Number(clamp(((strongest.confidence||0)/100)*((strongest.strength||50)-35)*.08*statusScale,0,5).toFixed(3));
}

function processSocialExperience({experience,sourceEvent,a,b}={}){
  if(!experience?.sourceEventId||!a||!b)return null;
  ensureSocialOrganizationContainers();
  const event=sourceEvent||registerSocialSourceEvent({
    id:experience.sourceEventId,
    type:experience.type,
    category:experience.category,
    actorId:experience.actorId,
    subjectId:experience.subjectId,
    participantIds:experience.participants,
    roomId:experience.roomId,
    projectId:experience.projectId,
    privacy:experience.privacy,
    volume:experience.volume,
    confidence:experience.confidence,
    intensity:experience.intensity,
    tone:experience.emotionalTone,
    context:experience.context
  });
  if(!event)return null;
  const memories=[
    storeSocialMemory(encodeSocialMemory(a,b,event,experience)),
    storeSocialMemory(encodeSocialMemory(b,a,event,experience))
  ].filter(Boolean);
  if(SOCIAL_ORGANIZATION_RULES.conflictExperienceTypes.includes(experience.type))socialConflictRecordFromExperience(experience,memories.map(memory=>memory.id));
  if(SOCIAL_ORGANIZATION_RULES.repairExperienceTypes.includes(experience.type))socialRepairFromExperience(experience,memories.map(memory=>memory.id));
  recordSocialCultureEvidence(experience);
  if(typeof recordLeadershipEvidenceFromSocialExperience==="function")recordLeadershipEvidenceFromSocialExperience(experience);
  const conversation=typeof createGroundedConversationFromExperience==="function"?createGroundedConversationFromExperience(experience,event):null;
  if(!conversation){
    applySocialMemoryRecallRecommendation(a,b,event,experience.category||conversationCategoryForEvent(event));
    applySocialMemoryRecallRecommendation(b,a,event,experience.category||conversationCategoryForEvent(event));
  }
  return {event,memories};
}

function compactSocialRelationshipEvidenceWindows(){
  const activeCount=(employees||[]).filter(employee=>employee.active).length;
  const detailedLimit=Math.max(
    SOCIAL_ORGANIZATION_RULES.minimumDetailedRelationships,
    Math.ceil(activeCount*SOCIAL_ORGANIZATION_RULES.detailedRelationshipsPerEmployee/2)
  );
  const unresolvedPairs=new Set((company.socialConflicts||[])
    .filter(conflict=>conflict.status!=="resolved")
    .map(conflict=>makeRelationshipKey(conflict.actorId,conflict.subjectId)));
  const ranked=Object.entries(company.socialRelationships||{}).sort((a,b)=>{
    const aUnresolved=unresolvedPairs.has(a[0])?1:0,bUnresolved=unresolvedPairs.has(b[0])?1:0;
    if(aUnresolved!==bUnresolved)return bUnresolved-aUnresolved;
    const aTime=socialTimestampValue(a[1].lastInteractionAt||a[1].lastSeenAt||0);
    const bTime=socialTimestampValue(b[1].lastInteractionAt||b[1].lastSeenAt||0);
    if(aTime!==bTime)return bTime-aTime;
    if((a[1].interactionCount||0)!==(b[1].interactionCount||0))return (b[1].interactionCount||0)-(a[1].interactionCount||0);
    return a[0].localeCompare(b[0]);
  });
  const detailedKeys=new Set(ranked
    .filter(([key],index)=>index<detailedLimit||unresolvedPairs.has(key))
    .map(([key])=>key));
  ranked.forEach(([key,record])=>{
    if(detailedKeys.has(key))return;
    record.recentExperiences=[];
    record.recentInteractionTypes=[];
    record.reputationObservations=[];
    record.cooldowns={};
    record.relationshipInputs={};
  });
  return {detailedLimit,detailedCount:detailedKeys.size,compactedCount:Math.max(0,ranked.length-detailedKeys.size)};
}

function ensureSocialOrganizationalSystems({forceNormalize=false}={}){
  if(!company||socialOrganizationEnsuring)return;
  const needs=forceNormalize||socialOrganizationValidatedCompany!==company;
  if(!needs)return;
  socialOrganizationEnsuring=true;
  try{
    ensureSocialOrganizationContainers();
    company.socialSourceEvents=company.socialSourceEvents.map(normalizeSocialSourceEvent).filter(Boolean);
    company.socialMemoryStore.records=company.socialMemoryStore.records.map(normalizeSocialMemoryRecord).filter(Boolean);
    migrateLegacySocialMemories();
    enforceSocialMemoryBounds();
    pruneSocialSourceEvents();
    company.socialConflicts=company.socialConflicts.filter(conflict=>conflict?.id&&conflict.sourceEventId).map(conflict=>({
      ownerSystem:AI_SYSTEM_OWNERS.social,
      repairAttempts:[],
      memoryIds:[],
      status:"unresolved",
      ...conflict,
      participantIds:[...new Set((conflict.participantIds||[conflict.actorId,conflict.subjectId]).map(Number).filter(Number.isFinite))],
      repairAttempts:Array.isArray(conflict.repairAttempts)?conflict.repairAttempts:[],
      memoryIds:Array.isArray(conflict.memoryIds)?conflict.memoryIds:[]
    })).slice(0,SOCIAL_ORGANIZATION_RULES.conflict.maxActiveRecords);
    compactSocialRelationshipEvidenceWindows();
    pruneSocialSourceEvents();
    socialOrganizationValidatedCompany=company;
    if(socialConversationUiState.company!==company)socialConversationUiState={company,hoveredId:null};
  }finally{
    socialOrganizationEnsuring=false;
  }
}

function meaningfulSocialInteractionCount(record){
  const excluded=new Set(["same_room_presence","room_presence","co_presence"]);
  return Object.entries(record?.experienceSummary||{}).reduce((sum,[type,item])=>sum+(excluded.has(type)?0:Math.max(0,Number(item?.count)||0)),0);
}
function socialRelationshipGraphEdge(a,b){
  const record=company.socialRelationships?.[makeRelationshipKey(a.id,b.id)];
  const meaningful=meaningfulSocialInteractionCount(record);
  if(!record||meaningful<SOCIAL_GROUP_RULES.minimumMeaningfulInteractions)return null;
  const rel=record.interpretation||{},memoryA=getRelationshipMemorySummary(a.id,b.id),memoryB=getRelationshipMemorySummary(b.id,a.id);
  const score=clamp(
    (record.familiarity||0)*.18+
    (rel.trust||50)*.22+
    (rel.respect||50)*.18+
    (rel.comfort||50)*.2-
    (rel.professionalFriction||0)*.18+
    Math.min(18,meaningful*1.8)+
    Math.min(8,(memoryA.positive+memoryB.positive)*.5)-
    Math.min(10,(memoryA.unresolved+memoryB.unresolved)*1.5),
    0,
    100
  );
  return {
    aId:a.id,
    bId:b.id,
    score:Number(score.toFixed(2)),
    meaningfulInteractions:meaningful,
    trust:Math.round(rel.trust||50),
    respect:Math.round(rel.respect||50),
    comfort:Math.round(rel.comfort||50),
    friction:Math.round(rel.professionalFriction||0),
    mentoring:(record.experienceSummary?.mentoring_interaction?.count||0)+(record.experienceSummary?.onboarding_support?.count||0),
    unresolvedConflicts:memoryA.unresolved+memoryB.unresolved,
    sourceEvidenceIds:(record.recentExperiences||[]).filter(experience=>experience.sourceEventId).slice(0,8).map(experience=>experience.sourceEventId)
  };
}
function buildSocialRelationshipGraph(){
  ensureSocialOrganizationalSystems();
  const active=(employees||[]).filter(employee=>employee.active).slice().sort((a,b)=>a.id-b.id),edges=[];
  for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
    const edge=socialRelationshipGraphEdge(active[i],active[j]);
    if(edge)edges.push(edge);
  }
  edges.sort((a,b)=>b.score-a.score||a.aId-b.aId||a.bId-b.bId);
  return {
    nodes:active.map(employee=>({id:employee.id,name:employee.name,role:employee.role,department:employeeTeam(employee)})),
    edges
  };
}
function socialGroupIdentity(memberIds,graph){
  const members=memberIds.map(socialEmployee).filter(Boolean);
  const departments=[...new Set(members.map(employeeTeam))];
  const memberEdges=graph.edges.filter(edge=>memberIds.includes(edge.aId)&&memberIds.includes(edge.bId));
  const cooperation=memberEdges.reduce((sum,edge)=>sum+edge.trust+edge.comfort-edge.friction,0)/Math.max(1,memberEdges.length);
  const mentoring=members.reduce((sum,employee)=>sum+(employee.personality?.empathy||0)+(employee.skills?.leadership||35)/100,0)/Math.max(1,members.length);
  if(departments.length>=3)return "Cross-company connectors";
  if(mentoring>1.05)return "Mentoring circle";
  if(cooperation>105)return "Trusted delivery circle";
  if(departments.length===2)return "Cross-team working group";
  return `${teamDisplayName(departments[0]||"people")} peer group`;
}
function socialGroupType(memberIds,graph){
  const members=memberIds.map(socialEmployee).filter(Boolean);
  const departments=[...new Set(members.map(employeeTeam))];
  const edges=graph.edges.filter(edge=>memberIds.includes(edge.aId)&&memberIds.includes(edge.bId));
  if(edges.reduce((sum,edge)=>sum+edge.mentoring,0)>0)return "mentoring";
  if(departments.length>=3)return "cross-functional";
  if(departments.length===2)return "cross-team";
  return "department";
}
function deriveInformalGroups(){
  ensureSocialOrganizationalSystems();
  const graph=buildSocialRelationshipGraph(),eligibleEdges=graph.edges.filter(edge=>edge.score>=SOCIAL_GROUP_RULES.edgeThreshold);
  const joinEdges=eligibleEdges.filter(edge=>
    edge.score>=SOCIAL_GROUP_RULES.memberJoinThreshold||
    edge.meaningfulInteractions>=SOCIAL_GROUP_RULES.sustainedInteractionJoinCount
  );
  const previousGroups=(company.informalGroups||[]).map(socialClone),unassigned=new Set(graph.nodes.map(node=>node.id)),groups=[];
  for(const seed of graph.nodes){
    if(!unassigned.has(seed.id))continue;
    const memberIds=[seed.id],queued=new Set(memberIds);
    for(let cursor=0;cursor<memberIds.length&&memberIds.length<SOCIAL_GROUP_RULES.maxGroupSize;cursor++){
      const currentId=memberIds[cursor];
      const connected=joinEdges.filter(edge=>edge.aId===currentId||edge.bId===currentId)
        .map(edge=>({id:edge.aId===currentId?edge.bId:edge.aId,score:edge.score}))
        .filter(candidate=>unassigned.has(candidate.id)&&!queued.has(candidate.id))
        .sort((a,b)=>b.score-a.score||a.id-b.id);
      connected.forEach(candidate=>{
        if(memberIds.length>=SOCIAL_GROUP_RULES.maxGroupSize)return;
        memberIds.push(candidate.id);
        queued.add(candidate.id);
      });
    }
    if(memberIds.length<2)continue;
    memberIds.forEach(id=>unassigned.delete(id));
    memberIds.sort((a,b)=>a-b);
    const memberEdges=eligibleEdges.filter(edge=>memberIds.includes(edge.aId)&&memberIds.includes(edge.bId));
    const strength=memberEdges.reduce((sum,edge)=>sum+edge.score,0)/Math.max(1,memberEdges.length);
    const id=socialStableId("informal-group",...memberIds);
    const previous=previousGroups.find(group=>group.id===id);
    const sharedHistoryScore=memberEdges.reduce((sum,edge)=>sum+edge.meaningfulInteractions,0);
    const conflictScore=memberEdges.reduce((sum,edge)=>sum+edge.friction,0)/Math.max(1,memberEdges.length);
    const cohesion=memberEdges.reduce((sum,edge)=>sum+(edge.trust+edge.comfort)/2,0)/Math.max(1,memberEdges.length);
    const knowledgeFlowScore=memberEdges.reduce((sum,edge)=>sum+Math.min(100,edge.score+edge.mentoring*8),0)/Math.max(1,memberEdges.length);
    const confidence=clamp(memberEdges.length*12+sharedHistoryScore*2,0,100);
    const alreadyConfirmedToday=previous?.lastConfirmedAt?.day===company.day;
    const stability=previous
      ?alreadyConfirmedToday
        ?previous.stability??SOCIAL_GROUP_RULES.initialStability
        :clamp((previous.stability??SOCIAL_GROUP_RULES.initialStability)*SOCIAL_GROUP_RULES.persistenceWeight+strength*(1-SOCIAL_GROUP_RULES.persistenceWeight)+3,0,100)
      :SOCIAL_GROUP_RULES.initialStability;
    groups.push({
      ownerSystem:AI_SYSTEM_OWNERS.groups,
      id,
      memberIds,
      identity:socialGroupIdentity(memberIds,graph),
      type:socialGroupType(memberIds,graph),
      strength:Number(strength.toFixed(2)),
      cohesion:Number(cohesion.toFixed(2)),
      stability:Number(stability.toFixed(2)),
      sharedHistoryScore,
      conflictScore:Number(conflictScore.toFixed(2)),
      knowledgeFlowScore:Number(knowledgeFlowScore.toFixed(2)),
      confidence:Number(confidence.toFixed(2)),
      formedDay:previous?.formedDay??company.day,
      formedAt:previous?.formedAt||simulationTimestamp(),
      lastActiveDay:company.day,
      lastConfirmedAt:simulationTimestamp(),
      status:"active",
      evidenceEdges:memberEdges.slice(0,12),
      sourceEvidenceIds:[...new Set(memberEdges.flatMap(edge=>edge.sourceEvidenceIds||[]))].slice(0,24)
    });
  }
  const nextIds=new Set(groups.map(group=>group.id));
  previousGroups.filter(group=>!nextIds.has(group.id)).forEach(group=>{
    const inactiveDays=Math.max(SOCIAL_GROUP_RULES.updateIntervalDays,company.day-(group.lastActiveDay??company.day));
    const weakened=clamp((group.stability??SOCIAL_GROUP_RULES.initialStability)-inactiveDays*(100/SOCIAL_GROUP_RULES.inactivityDays),0,100);
    const membersRemain=(group.memberIds||[]).every(id=>socialEmployee(id)?.active);
    if(membersRemain&&inactiveDays<SOCIAL_GROUP_RULES.inactivityDays&&weakened>SOCIAL_GROUP_RULES.dissolutionStabilityThreshold){
      groups.push({
        ...group,
        status:"weakening",
        stability:Number(weakened.toFixed(2)),
        confidence:Number(clamp((group.confidence||0)-inactiveDays*.8,SOCIAL_GROUP_RULES.minimumConfidence,100).toFixed(2))
      });
    }else{
      company.informalGroupHistory.unshift({...group,status:"dissolved",dissolvedDay:company.day,stability:Number(weakened.toFixed(2))});
    }
  });
  groups.filter(group=>!previousGroups.some(previous=>previous.id===group.id)).forEach(group=>{
    company.informalGroupHistory.unshift({...group,status:"formed",recordedDay:company.day});
  });
  company.informalGroups=groups.slice(0,SOCIAL_GROUP_RULES.maxGroups);
  company.informalGroupHistory=company.informalGroupHistory.slice(0,SOCIAL_GROUP_RULES.maxHistory);
  deriveTeamChemistryAndBridges(graph);
  return company.informalGroups;
}
function deriveTeamChemistryAndBridges(graph=buildSocialRelationshipGraph()){
  const departments=[...new Set(graph.nodes.map(node=>node.department))];
  const chemistry={};
  departments.forEach(department=>{
    const ids=graph.nodes.filter(node=>node.department===department).map(node=>node.id);
    const edges=graph.edges.filter(edge=>ids.includes(edge.aId)&&ids.includes(edge.bId));
    const cohesion=edges.length?edges.reduce((sum,edge)=>sum+edge.score,0)/edges.length:50;
    const friction=edges.length?edges.reduce((sum,edge)=>sum+edge.friction,0)/edges.length:0;
    const coordination=edges.length?edges.reduce((sum,edge)=>sum+(edge.score+edge.respect)/2,0)/edges.length:50;
    const trust=edges.length?edges.reduce((sum,edge)=>sum+edge.trust,0)/edges.length:50;
    const communication=edges.length?edges.reduce((sum,edge)=>sum+(edge.comfort+edge.respect)/2,0)/edges.length:50;
    const resilience=clamp(cohesion-friction*.25+10,0,100);
    const knowledgeCoverage=clamp(45+edges.reduce((sum,edge)=>sum+edge.mentoring*5,0)+Math.min(25,edges.length*3),0,100);
    const leadershipClarity=clamp(45+ids.reduce((sum,id)=>sum+((socialLeadershipState(id,{create:false})?.informalInfluence||50)-50),0)/Math.max(1,ids.length),0,100);
    chemistry[department]={
      ownerSystem:AI_SYSTEM_OWNERS.groups,
      department,
      cohesion:Math.round(clamp(cohesion,0,100)),
      friction:Math.round(clamp(friction,0,100)),
      coordination:Math.round(coordination),
      trust:Math.round(trust),
      communication:Math.round(communication),
      resilience:Math.round(resilience),
      conflictLoad:Math.round(friction),
      knowledgeCoverage:Math.round(knowledgeCoverage),
      leadershipClarity:Math.round(leadershipClarity),
      evidenceEdges:edges.length,
      label:cohesion>=70?"strong working chemistry":cohesion>=52?"developing chemistry":friction>=55?"strained chemistry":"limited shared experience"
    };
  });
  const projectChemistry={};
  (company.projects||[]).filter(project=>["active","paused","at-risk"].includes(project.status)).forEach(project=>{
    const ids=Object.entries(project.staffAllocations||{}).filter(([,fte])=>(Number(fte)||0)>.05).map(([id])=>Number(id)).filter(id=>graph.nodes.some(node=>node.id===id));
    const edges=graph.edges.filter(edge=>ids.includes(edge.aId)&&ids.includes(edge.bId));
    const average=(selector,fallback=50)=>edges.length?edges.reduce((sum,edge)=>sum+selector(edge),0)/edges.length:fallback;
    const coordination=average(edge=>(edge.score+edge.respect)/2);
    const trust=average(edge=>edge.trust);
    const communication=average(edge=>(edge.comfort+edge.respect)/2);
    const conflictLoad=average(edge=>edge.friction,0);
    projectChemistry[project.id]={
      ownerSystem:AI_SYSTEM_OWNERS.groups,
      projectId:project.id,
      memberIds:ids,
      coordination:Math.round(coordination),
      trust:Math.round(trust),
      communication:Math.round(communication),
      resilience:Math.round(clamp(coordination-conflictLoad*.25+10,0,100)),
      conflictLoad:Math.round(conflictLoad),
      knowledgeCoverage:Math.round(clamp(45+edges.reduce((sum,edge)=>sum+edge.mentoring*5,0)+Math.min(25,edges.length*3),0,100)),
      leadershipClarity:Math.round(clamp(45+ids.reduce((sum,id)=>sum+((socialLeadershipState(id,{create:false})?.informalInfluence||50)-50),0)/Math.max(1,ids.length),0,100)),
      confidence:Math.round(clamp(edges.length*14+edges.reduce((sum,edge)=>sum+edge.meaningfulInteractions,0)*2,0,100)),
      sourceEvidenceIds:[...new Set(edges.flatMap(edge=>edge.sourceEvidenceIds||[]))].slice(0,24)
    };
  });
  const bridges=[];
  graph.nodes.forEach(node=>{
    const edges=graph.edges.filter(edge=>(edge.aId===node.id||edge.bId===node.id)&&edge.score>=SOCIAL_GROUP_RULES.bridgeThreshold);
    const connectedDepartments=[...new Set(edges.map(edge=>{
      const otherId=edge.aId===node.id?edge.bId:edge.aId;
      return graph.nodes.find(candidate=>candidate.id===otherId)?.department;
    }).filter(Boolean))];
    const groupCount=(company.informalGroups||[]).filter(group=>group.memberIds.includes(node.id)).length;
    if(connectedDepartments.length>=2||groupCount>=2){
      bridges.push({
        ownerSystem:AI_SYSTEM_OWNERS.groups,
        employeeId:node.id,
        name:node.name,
        departments:connectedDepartments,
        groupCount,
        bridgeScore:Math.round(clamp(edges.reduce((sum,edge)=>sum+edge.score,0)/Math.max(1,edges.length),0,100))
      });
    }
  });
  company.teamChemistry=chemistry;
  company.projectTeamChemistry=projectChemistry;
  company.socialBridges=bridges.sort((a,b)=>b.bridgeScore-a.bridgeScore||a.employeeId-b.employeeId);
  return {chemistry,bridges};
}

function defaultSocialLeadershipState(employee){
  return {
    ownerSystem:AI_SYSTEM_OWNERS.leadership,
    employeeId:employee.id,
    formalAuthority:0,
    credibility:50,
    consistency:50,
    coachingReputation:50,
    recognitionFairness:50,
    conflictHandling:50,
    communicationClarity:50,
    confidence:0,
    informalInfluence:0,
    evidence:[],
    lastUpdatedDay:null
  };
}
function socialLeadershipState(employeeOrId,{create=true}={}){
  ensureSocialOrganizationContainers();
  const employee=socialEmployee(employeeOrId);
  if(!employee)return null;
  const key=String(employee.id);
  if(!company.socialLeadership[key]&&create)company.socialLeadership[key]=defaultSocialLeadershipState(employee);
  const state=company.socialLeadership[key];
  if(!state)return null;
  state.evidence=Array.isArray(state.evidence)?state.evidence:[];
  return state;
}
function recordSocialLeadershipEvidence({actorId,sourceEventId,type,outcome=0,confidence=70,context={}}={}){
  const actor=socialEmployee(actorId);
  if(!actor||!sourceEventId)return null;
  const state=socialLeadershipState(actor),id=socialStableId("leadership-evidence",actor.id,sourceEventId,type);
  if(state.evidence.some(evidence=>evidence.id===id))return state.evidence.find(evidence=>evidence.id===id);
  const evidence={
    id,
    ownerSystem:AI_SYSTEM_OWNERS.leadership,
    actorId:actor.id,
    sourceEventId,
    type:String(type||"leadership"),
    outcome:clamp(Number(outcome)||0,-1,1),
    confidence:clamp(Number(confidence)||70,0,100),
    context:socialClone(context||{}),
    timestamp:simulationTimestamp()
  };
  state.evidence.unshift(evidence);
  state.evidence=state.evidence.slice(0,SOCIAL_LEADERSHIP_RULES.maxEvidencePerEmployee);
  deriveSocialLeadershipState(actor);
  return evidence;
}
function recordLeadershipEvidenceFromSocialExperience(experience){
  const actor=socialEmployee(experience?.actorId);
  if(!actor||roleLeadershipLevel(actor.role)<=0&&!["mentoring_interaction","constructive_feedback","recognition","successful_repair"].includes(experience.type))return null;
  let outcome=socialMemoryValence(experience.emotionalTone);
  if(SOCIAL_ORGANIZATION_RULES.conflictExperienceTypes.includes(experience.type))outcome=-1;
  if(SOCIAL_ORGANIZATION_RULES.repairExperienceTypes.includes(experience.type))outcome=1;
  return recordSocialLeadershipEvidence({
    actorId:actor.id,
    sourceEventId:experience.sourceEventId,
    type:experience.type,
    outcome,
    confidence:experience.confidence,
    context:{projectId:experience.projectId,subjectId:experience.subjectId,roomId:experience.roomId}
  });
}
function leadershipEvidenceAverage(evidence,predicate,fallback=50){
  const matching=evidence.filter(predicate);
  if(!matching.length)return fallback;
  const weight=matching.reduce((sum,item)=>sum+item.confidence/100,0);
  const average=matching.reduce((sum,item)=>sum+item.outcome*(item.confidence/100),0)/Math.max(.1,weight);
  return clamp(50+average*35,0,100);
}
function deriveSocialLeadershipState(employeeOrId){
  const employee=socialEmployee(employeeOrId),state=employee?socialLeadershipState(employee):null;
  if(!state)return null;
  const incoming=(employees||[]).filter(other=>other.active&&other.id!==employee.id).map(other=>getRelationshipView(other,employee).interpretation).filter(rel=>(rel.confidence||0)>10);
  const incomingRespect=incoming.reduce((sum,rel)=>sum+(rel.respect||50),0)/Math.max(1,incoming.length);
  const incomingTrust=incoming.reduce((sum,rel)=>sum+(rel.trust||50),0)/Math.max(1,incoming.length);
  const reputation=workplaceReputationFor(employee,{create:false}),dimensions=reputation?.dimensions||{};
  const evidence=state.evidence||[],positive=evidence.filter(item=>item.outcome>0).length,negative=evidence.filter(item=>item.outcome<0).length;
  const evidenceBalance=(positive-negative)/Math.max(1,evidence.length);
  const signChanges=evidence.slice(0,12).reduce((count,item,index,array)=>index&&Math.sign(item.outcome)!==Math.sign(array[index-1].outcome)?count+1:count,0);
  const formalLevel=roleLeadershipLevel(employee.role);
  state.formalAuthority=formalLevel>0?clamp(formalLevel*20+(employee.skills?.leadership||35)*.22,0,100):0;
  state.credibility=Number(clamp(incomingTrust*.32+incomingRespect*.25+(dimensions.reliability??50)*.23+(dimensions.professionalism??50)*.2,0,100).toFixed(2));
  state.consistency=Number(clamp(55+evidenceBalance*18-signChanges*2+((dimensions.reliability??50)-50)*.18,0,100).toFixed(2));
  state.coachingReputation=Number(leadershipEvidenceAverage(evidence,item=>["mentoring_interaction","direct_help","onboarding_support","constructive_feedback"].includes(item.type),50).toFixed(2));
  state.recognitionFairness=Number(leadershipEvidenceAverage(evidence,item=>["recognition","recognition_shared"].includes(item.type),50).toFixed(2));
  state.conflictHandling=Number(leadershipEvidenceAverage(evidence,item=>SOCIAL_ORGANIZATION_RULES.conflictExperienceTypes.includes(item.type)||SOCIAL_ORGANIZATION_RULES.repairExperienceTypes.includes(item.type),50).toFixed(2));
  state.communicationClarity=Number(leadershipEvidenceAverage(evidence,item=>["shared_meeting","same_meeting","constructive_feedback","meeting_conflict"].includes(item.type),50).toFixed(2));
  state.confidence=clamp(evidence.length*7+(reputation?.confidence||0)*.35+incoming.length*3,0,100);
  state.informalInfluence=Number(clamp(
    state.credibility*.28+
    state.consistency*.16+
    state.coachingReputation*.14+
    state.recognitionFairness*.1+
    state.conflictHandling*.12+
    state.communicationClarity*.12+
    state.formalAuthority*.08,
    0,
    100
  ).toFixed(2));
  state.lastUpdatedDay=company.day;
  return state;
}
function updateSocialLeadership(){
  ensureSocialOrganizationalSystems();
  (employees||[]).filter(employee=>employee.active).forEach(deriveSocialLeadershipState);
  Object.keys(company.socialLeadership).forEach(id=>{
    if(id==="ceo")return;
    if(!(employees||[]).some(employee=>employee.id===Number(id)))delete company.socialLeadership[id];
  });
  return company.socialLeadership;
}
function leadershipRecommendationMultiplier(actorId,observerId,context={}){
  const actor=socialEmployee(actorId),observer=socialEmployee(observerId);
  if(!actor||!observer||actor.id===observer.id)return 1;
  const state=deriveSocialLeadershipState(actor),relationship=getRelationshipView(observer,actor).interpretation;
  const evidenceConfidence=(state.confidence||0)/100;
  const authority=(state.formalAuthority-50)/100,credibility=(state.credibility-50)/100,trust=((relationship.trust||50)-50)/100;
  const cultureContext=(((company.socialCulture?.dimensions?.accountability?.value??50)-50)+((company.socialCulture?.dimensions?.psychologicalSafety?.value??50)-50))/200;
  const raw=1+evidenceConfidence*(authority*.12+credibility*.22+trust*.18+cultureContext*.08);
  return Number(clamp(raw,SOCIAL_LEADERSHIP_RULES.emotionalMultiplierMin,SOCIAL_LEADERSHIP_RULES.emotionalMultiplierMax).toFixed(3));
}
function recordLeadershipCompanyEvent({sourceEventId,type="ceo-decision",outcome=0,confidence=70,context={}}={}){
  if(!sourceEventId)return null;
  ensureSocialOrganizationContainers();
  const state=company.socialLeadership.ceo&&typeof company.socialLeadership.ceo==="object"
    ?company.socialLeadership.ceo
    :{ownerSystem:AI_SYSTEM_OWNERS.leadership,employeeId:null,formalAuthority:100,credibility:50,consistency:50,communicationClarity:50,confidence:0,evidence:[]};
  state.evidence=Array.isArray(state.evidence)?state.evidence:[];
  const id=socialStableId("ceo-leadership-evidence",sourceEventId,type);
  if(!state.evidence.some(evidence=>evidence.id===id)){
    state.evidence.unshift({id,ownerSystem:AI_SYSTEM_OWNERS.leadership,sourceEventId,type,outcome:clamp(Number(outcome)||0,-1,1),confidence:clamp(Number(confidence)||70,0,100),context:socialClone(context),timestamp:simulationTimestamp()});
    state.evidence=state.evidence.slice(0,SOCIAL_LEADERSHIP_RULES.maxEvidencePerEmployee);
  }
  const evidence=state.evidence,leadership=company.leadership||{};
  state.credibility=clamp((company.trust||50)*.34+(company.board||50)*.22+(leadership.accountability||50)*.22+(leadership.transparency||50)*.22,0,100);
  const last=evidence.slice(0,12),balance=last.reduce((sum,item)=>sum+item.outcome*(item.confidence/100),0)/Math.max(1,last.reduce((sum,item)=>sum+item.confidence/100,0));
  state.consistency=clamp(50+balance*25,0,100);
  state.communicationClarity=clamp((leadership.transparency||50)*.6+(leadership.accountability||50)*.4,0,100);
  state.confidence=clamp(evidence.length*8,0,100);
  state.lastUpdatedDay=company.day;
  company.socialLeadership.ceo=state;
  return state;
}

const SOCIAL_DIALOGUE_WRAPPERS=[
  {id:"reserved",voiceStyle:"reserved"},
  {id:"professional",voiceStyle:"professional"},
  {id:"extrovert",voiceStyle:"extrovert"},
  {id:"humorous",voiceStyle:"humorous"}
];
const SOCIAL_DIALOGUE_STATEMENTS={
  greeting:[
    {intent:"acknowledge",text:"{timeGreeting}, {subjectName}."},
    {intent:"acknowledge",text:"Hi, {subjectName}."},
    {intent:"check-in",text:"How is your day going, {subjectName}?"},
    {intent:"acknowledge",text:"It is good to see you, {subjectName}."},
    {intent:"request-attention",text:"Do you have a minute, {subjectName}?"},
    {intent:"request-attention",text:"I was hoping to catch you, {subjectName}."},
    {intent:"acknowledge",text:"Nice timing, {subjectName}."},
    {intent:"acknowledge",text:"I am glad we crossed paths, {subjectName}."},
    {intent:"check-in",text:"How are things on your side, {subjectName}?"},
    {intent:"acknowledge",text:"Before we get back to work, hello, {subjectName}."}
  ],
  current_work:[
    {intent:"share-status",text:"I am working through {workTitle}."},
    {intent:"share-status",text:"{workTitle} is my main focus right now."},
    {intent:"share-status",text:"I am still making progress on {workTitle}."},
    {intent:"share-next-step",text:"The next step for me is on {workTitle}."},
    {intent:"share-focus",text:"I am keeping my attention on {workTitle}."},
    {intent:"share-status",text:"The work is moving, but I am checking the details before I call it done."},
    {intent:"share-focus",text:"I am trying to keep the current task from creating rework later."},
    {intent:"share-next-step",text:"I have a clear next step and I am working through it now."},
    {intent:"shared-history",text:"{memoryReference}"},
    {intent:"group-identity",text:"{groupStatement}"}
  ],
  help_request:[
    {intent:"request-help",text:"Could you help me with {workTitle}?"},
    {intent:"request-review",text:"I could use another set of eyes on {workTitle}."},
    {intent:"request-review",text:"Can we review {workTitle} together?"},
    {intent:"request-perspective",text:"I need your perspective on {workTitle}."},
    {intent:"request-help",text:"Would you have time to help with {workTitle}?"},
    {intent:"request-help",text:"I have reached the point where another perspective would help."},
    {intent:"request-review",text:"Could you sanity-check the approach before I go further?"},
    {intent:"request-perspective",text:"I am not fully confident in the next step and would value your view."},
    {intent:"request-help",text:"Can we spend a few minutes working through this together?"},
    {intent:"shared-history",text:"{memoryReference}"}
  ],
  giving_help:[
    {intent:"offer-help",text:"I can help you with {workTitle}."},
    {intent:"offer-collaboration",text:"Let us work through {workTitle} together."},
    {intent:"offer-review",text:"I have time to review {workTitle}."},
    {intent:"offer-review",text:"I can take a closer look at {workTitle}."},
    {intent:"offer-help",text:"Let me help clear the next step on {workTitle}."},
    {intent:"offer-help",text:"Show me where you are stuck and we can work from there."},
    {intent:"offer-review",text:"I can give you a quick second opinion before you commit to the approach."},
    {intent:"offer-collaboration",text:"We can divide the problem and compare what we find."},
    {intent:"shared-history",text:"{memoryReference}"},
    {intent:"culture",text:"{cultureStatement}"}
  ],
  blockers:[
    {intent:"identify-blocker",text:"{workTitle} is blocked by {blocker}."},
    {intent:"identify-blocker",text:"The main issue on {workTitle} is {blocker}."},
    {intent:"explain-dependency",text:"We cannot move {workTitle} forward until we address {blocker}."},
    {intent:"identify-blocker",text:"{blocker} is holding up {workTitle}."},
    {intent:"request-resolution",text:"I need help clearing {blocker} from {workTitle}."},
    {intent:"confirm-resolution",text:"We cleared {blocker} from {workTitle}."},
    {intent:"confirm-resolution",text:"{blockerResolution}."},
    {intent:"recognize-resolution",text:"Clearing {blocker} lets {workTitle} move again."},
    {intent:"confirm-resolution",text:"The work can continue now that {blocker} is resolved."},
    {intent:"reflect-on-resolution",text:"We should remember how we cleared {blocker} if this dependency returns."}
  ],
  meetings:[
    {intent:"state-purpose",text:"The meeting is about {purpose}."},
    {intent:"seek-decision",text:"We need a clear decision on {purpose}."},
    {intent:"seek-decision",text:"I want the meeting to settle {purpose}."},
    {intent:"seek-alignment",text:"The team needs alignment on {purpose}."},
    {intent:"focus-discussion",text:"Let us keep the discussion focused on {purpose}."},
    {intent:"seek-alignment",text:"I think the meeting helped us understand where the teams disagree."},
    {intent:"focus-discussion",text:"We should leave the room with an owner and a next step."},
    {intent:"seek-decision",text:"The discussion is useful, but the team still needs a decision."},
    {intent:"state-purpose",text:"I want to make sure the right people hear the same version of the plan."},
    {intent:"shared-history",text:"{memoryReference}"}
  ],
  deadlines:[
    {intent:"state-deadline",text:"{workTitle} is due on day {deadlineDay}."},
    {intent:"flag-pressure",text:"The deadline on {workTitle} is getting close."},
    {intent:"protect-schedule",text:"We need to protect the schedule for {workTitle}."},
    {intent:"flag-pressure",text:"I am concerned about the timing on {workTitle}."},
    {intent:"request-plan",text:"The remaining work on {workTitle} needs a realistic plan."},
    {intent:"flag-pressure",text:"The schedule has less room for error than it did earlier."},
    {intent:"request-plan",text:"We should be honest about what can still fit before the deadline."},
    {intent:"protect-schedule",text:"A clear trade-off now would be better than a surprise later."},
    {intent:"request-plan",text:"I need to know which work is essential and which work can wait."},
    {intent:"shared-history",text:"{memoryReference}"}
  ],
  appreciation:[
    {intent:"thank-help",text:"Thank you for helping with {workTitle}."},
    {intent:"recognize-impact",text:"Your help on {workTitle} made a difference."},
    {intent:"thank-time",text:"I appreciate the time you gave to {workTitle}."},
    {intent:"recognize-impact",text:"That support on {workTitle} was useful."},
    {intent:"thank-help",text:"Thanks for stepping in on {workTitle}."},
    {intent:"thank-help",text:"I noticed that you made time to help when the team needed it."},
    {intent:"recognize-impact",text:"The work moved more cleanly because you were involved."},
    {intent:"thank-time",text:"I appreciate you following through instead of leaving the problem half-solved."},
    {intent:"recognize-impact",text:"Your support reduced the pressure on the rest of the team."},
    {intent:"shared-history",text:"{memoryReference}"}
  ],
  mentoring:[
    {intent:"offer-guidance",text:"I can walk you through {workTitle}."},
    {intent:"reflect",text:"Let us review what we learned from {workTitle}."},
    {intent:"share-approach",text:"I can share how I would approach {workTitle}."},
    {intent:"teach",text:"We can use {workTitle} as a learning opportunity."},
    {intent:"build-confidence",text:"I will help you build confidence with {workTitle}."},
    {intent:"offer-guidance",text:"I can explain the reasoning, then you can decide how to apply it."},
    {intent:"teach",text:"The important part is understanding why the approach works."},
    {intent:"build-confidence",text:"Try the next step yourself and I will stay close if you need a review."},
    {intent:"shared-history",text:"{memoryReference}"},
    {intent:"leadership",text:"{leadershipStatement}"}
  ],
  recognition:[
    {intent:"recognize-contribution",text:"Your contribution to {workTitle} deserves recognition."},
    {intent:"recognize-execution",text:"You handled {workTitle} well."},
    {intent:"share-team-recognition",text:"The team noticed your work on {workTitle}."},
    {intent:"recognize-contribution",text:"You made an important contribution to {workTitle}."},
    {intent:"recognize-follow-through",text:"Your follow-through on {workTitle} helped the team."},
    {intent:"recognize-judgment",text:"You made a good call when the work became uncertain."},
    {intent:"share-team-recognition",text:"People noticed that you stayed with the problem until it was resolved."},
    {intent:"recognize-follow-through",text:"The result was better because you checked the details."},
    {intent:"recognize-contribution",text:"That was the kind of quiet contribution that keeps a team moving."},
    {intent:"shared-history",text:"{memoryReference}"}
  ],
  conflict:[
    {intent:"state-disagreement",text:"I disagree with how we are handling {workTitle}."},
    {intent:"seek-resolution",text:"We need to resolve our disagreement about {workTitle}."},
    {intent:"challenge-approach",text:"I do not think the current approach to {workTitle} is working."},
    {intent:"state-disagreement",text:"We are seeing {workTitle} differently."},
    {intent:"state-concern",text:"I want to be clear about my concern with {workTitle}."},
    {intent:"state-concern",text:"I do not think we are working from the same assumptions."},
    {intent:"seek-resolution",text:"We should address the disagreement directly before it affects the work."},
    {intent:"challenge-approach",text:"I need stronger evidence before I can support this approach."},
    {intent:"state-disagreement",text:"I understand your position, but I do not agree with the conclusion."},
    {intent:"seek-resolution",text:"Let us separate the facts from the frustration and work through this."}
  ],
  repair:[
    {intent:"clarify",text:"I want to clear up what happened around {workTitle}."},
    {intent:"apologize",text:"I am sorry for how I handled the discussion about {workTitle}."},
    {intent:"reset",text:"Can we reset and work through {workTitle} constructively?"},
    {intent:"follow-up",text:"I want to follow up on our disagreement about {workTitle}."},
    {intent:"seek-way-forward",text:"Let us find a better way forward on {workTitle}."},
    {intent:"apologize",text:"I could have handled that conversation better."},
    {intent:"clarify",text:"I want to make sure the disagreement does not become the relationship."},
    {intent:"reset",text:"I think we can disagree and still work together well."},
    {intent:"seek-way-forward",text:"Can we agree on the next step even if we still see part of this differently?"},
    {intent:"shared-history",text:"{memoryReference}"}
  ],
  casual:[
    {intent:"small-talk",text:"It has been a busy day."},
    {intent:"break",text:"I am taking a minute before the next task."},
    {intent:"observe-office",text:"The office feels active today."},
    {intent:"break",text:"I needed a short break from the screen."},
    {intent:"small-talk",text:"It is good to have a quiet moment."},
    {intent:"check-in",text:"How are you holding up today?"},
    {intent:"observe-office",text:"Everyone seems to be moving between three things at once."},
    {intent:"break",text:"I am trying to take a real pause instead of carrying work into the break."},
    {intent:"small-talk",text:"It is nice to talk without an agenda for a minute."},
    {intent:"shared-history",text:"{memoryReference}"}
  ],
  company_news:[
    {intent:"share-news",text:"The team is talking about {newsTopic}."},
    {intent:"acknowledge-news",text:"I saw the update about {newsTopic}."},
    {intent:"interpret-news",text:"The news about {newsTopic} will affect how people plan."},
    {intent:"interpret-news",text:"I am still thinking through the update on {newsTopic}."},
    {intent:"watch-impact",text:"We should keep an eye on what {newsTopic} means for the team."},
    {intent:"acknowledge-news",text:"The company update reached people quickly."},
    {intent:"interpret-news",text:"Different teams are going to read the announcement differently."},
    {intent:"watch-impact",text:"I want to see what changes in the work after the announcement."},
    {intent:"share-news",text:"People are comparing the official update with what they see day to day."},
    {intent:"watch-impact",text:"The next few days will tell us whether the update changes behavior."}
  ],
  celebration:[
    {intent:"celebrate-progress",text:"We should celebrate the progress on {workTitle}."},
    {intent:"recognize-result",text:"The result on {workTitle} is worth recognizing."},
    {intent:"recognize-team",text:"The team earned this moment on {workTitle}."},
    {intent:"celebrate-progress",text:"It is good to see {workTitle} reach this point."},
    {intent:"recognize-result",text:"We made meaningful progress on {workTitle}."},
    {intent:"celebrate-progress",text:"It is worth stopping for a minute to recognize what just happened."},
    {intent:"recognize-team",text:"A lot of quiet work went into this result."},
    {intent:"recognize-result",text:"The milestone gives the team something real to build on."},
    {intent:"recognize-team",text:"People kept showing up for the hard parts, and it paid off."},
    {intent:"shared-history",text:"{memoryReference}"}
  ]
};
const SOCIAL_DIALOGUE_CLOSINGS=[
  {intent:"goodbye",text:"Thanks. I will let you get back to it."},
  {intent:"goodbye",text:"That helps. I understand the next step."},
  {intent:"goodbye",text:"All right. Let us pick this up again if the situation changes."},
  {intent:"goodbye",text:"I appreciate the conversation. I am heading back to work."},
  {intent:"goodbye",text:"Good talk. I have what I need for now."},
  {intent:"goodbye",text:"Thanks. I understand where you stand."},
  {intent:"goodbye",text:"Thanks. I have enough to continue."},
  {intent:"goodbye",text:"Thanks for the time. I will see you later."}
];
function lowerDialogueStart(text){
  if(!text||/^I(?:\s|'|am\b)/.test(text))return text;
  return text.charAt(0).toLowerCase()+text.slice(1);
}
function applySocialDialogueWording(statement,voiceStyle,category){
  if(voiceStyle==="reserved")return statement;
  if(category==="greeting"){
    if(voiceStyle==="professional")return `${statement} I hope things are going well.`;
    if(voiceStyle==="extrovert")return `Hey! ${statement}`;
    return `${statement} We made it to another office day.`;
  }
  if(voiceStyle==="professional")return `I want to be clear: ${lowerDialogueStart(statement)}`;
  if(voiceStyle==="extrovert")return `Hey, ${lowerDialogueStart(statement)}`;
  if(SOCIAL_CONVERSATION_RULES.humorSafeCategories.includes(category))return `Small office update: ${lowerDialogueStart(statement)}`;
  return `No easy way to say it: ${lowerDialogueStart(statement)}`;
}
function buildSocialDialogueTemplateLibrary(){
  const library={};
  SOCIAL_CONVERSATION_RULES.categories.forEach(category=>{
    const statements=SOCIAL_DIALOGUE_STATEMENTS[category]||SOCIAL_DIALOGUE_STATEMENTS.casual;
    library[category]=[];
    statements.forEach((statementRecord,statementIndex)=>{
      const statement=typeof statementRecord==="string"?{intent:category,text:statementRecord}:statementRecord;
      SOCIAL_DIALOGUE_WRAPPERS.forEach((wrapper,wrapperIndex)=>{
        const text=applySocialDialogueWording(statement.text,wrapper.voiceStyle,category);
        library[category].push({
          id:`${category}-${statementIndex}-${wrapperIndex}`,
          category,
          intent:statement.intent||category,
          voiceStyle:wrapper.voiceStyle,
          text,
          required:[...text.matchAll(/\{(\w+)\}/g)].map(match=>match[1])
        });
      });
    });
  });
  return library;
}
const SOCIAL_DIALOGUE_TEMPLATES=buildSocialDialogueTemplateLibrary();

function socialEventRepairsConflict(event){
  const sourceEventId=event?.id||event?.sourceEventId;
  if(!sourceEventId)return false;
  return (company?.socialConflicts||[]).some(conflict=>
    conflict.resolutionSourceEventId===sourceEventId||
    (conflict.repairAttempts||[]).some(attempt=>attempt.sourceEventId===sourceEventId)
  );
}
function conversationCategoryForEvent(event){
  const type=String(event?.type||"");
  if(SOCIAL_CONVERSATION_RULES.categories.includes(event?.category))return event.category;
  if(type==="first_met")return "greeting";
  if(type==="task_completed")return "celebration";
  if(type==="department_return")return "current_work";
  if(type==="help_request")return "help_request";
  if(type==="direct_help")return "giving_help";
  if(type==="blocker_resolved_together")return "blockers";
  if(type==="onboarding_support"||type==="mentoring_interaction")return "mentoring";
  if(["recognition","recognition_shared"].includes(type))return "recognition";
  if(["milestone_success_together","shared_success"].includes(type))return "celebration";
  if(SOCIAL_ORGANIZATION_RULES.conflictExperienceTypes.includes(type))return "conflict";
  if(SOCIAL_CONVERSATION_RULES.explicitRepairTriggerTypes.includes(type)||socialEventRepairsConflict(event))return "repair";
  if(["constructive_feedback","successful_collaboration"].includes(type))return "appreciation";
  if(type==="deadline_pressure_together")return "deadlines";
  if(["shared_meeting","same_meeting"].includes(type))return "meetings";
  if(["shared_break","same_break","conversation","casual_conversation"].includes(type))return "casual";
  if(type.includes("blocker"))return "blockers";
  if(type.includes("news")||type.includes("announcement"))return "company_news";
  return event?.workItemId||event?.context?.workItemId?"current_work":"casual";
}
function groundedConversationTriggerForEvent(event,experience=null){
  const explicit=String(event?.context?.triggerType||experience?.context?.triggerType||"");
  if(SOCIAL_CONVERSATION_RULES.groundedTriggerTypes.includes(explicit))return explicit;
  const type=String(event?.type||experience?.type||"");
  if(SOCIAL_CONVERSATION_RULES.explicitRepairTriggerTypes.includes(type)||socialEventRepairsConflict(event))return "repair";
  if(type==="first_met")return "first-meeting";
  if(type==="task_completed")return "task-finished";
  if(type==="department_return")return "department-return";
  if(["help_request","direct_help"].includes(type))return "help-request";
  if(type==="blocker_resolved_together")return "blocker-resolved";
  if(["milestone_success_together","milestone_failure_together","shared_success","recognition","recognition_shared"].includes(type))return "milestone";
  if(SOCIAL_ORGANIZATION_RULES.conflictExperienceTypes.includes(type))return "conflict";
  if(["mentoring_interaction","onboarding_support"].includes(type))return "mentoring";
  if(["shared_break","same_break","casual_conversation","conversation"].includes(type))return event?.roomId==="break-area"?"break":"passing-coworker";
  if(["shared_meeting","same_meeting"].includes(type))return "meeting-transition";
  if(type==="deadline_pressure_together")return "deadline";
  if(["shared_work_activity","successful_collaboration","failed_collaboration"].includes(type))return "work-coordination";
  if(type.includes("news")||type.includes("announcement"))return "company-news";
  return null;
}
function employeeHasCriticalConversationConflict(employee,triggerType){
  if(!employee?.active||employee.offsite)return true;
  if(!["passing-coworker","break","company-news","first-meeting","department-return","repair","mentoring","milestone","task-finished"].includes(triggerType))return false;
  if(!["working","testing hardware"].includes(employee.action))return false;
  const work=typeof activeWorkForEmployee==="function"?activeWorkForEmployee(employee):null;
  if(!work)return employee.stress>=SOCIAL_CONVERSATION_RULES.criticalStressThreshold;
  const deadlineNear=Number.isFinite(Number(work.deadlineDay))&&Number(work.deadlineDay)-company.day<=SOCIAL_CONVERSATION_RULES.criticalDeadlineWindowDays;
  const blocked=Array.isArray(work.blockedBy)&&work.blockedBy.length>0;
  const priority=Number(work.priority)||0;
  return deadlineNear||blocked||priority>=SOCIAL_CONVERSATION_RULES.criticalPriorityThreshold||employee.stress>=SOCIAL_CONVERSATION_RULES.criticalStressThreshold;
}
function priorConversationMemory(owner,subject,event,category){
  return socialMemoryRecords(owner.id,{subjectId:subject.id})
    .filter(memory=>memory.sourceEventId!==event.id)
    .map(memory=>({memory,score:socialMemoryRelevance(memory,{
      tags:[category,event.type].filter(Boolean),
      context:{projectId:event.projectId,workItemId:event.workItemId,roomId:event.roomId}
    })}))
    .sort((a,b)=>b.score-a.score||socialTimestampValue(b.memory.timestamp)-socialTimestampValue(a.memory.timestamp)||String(a.memory.id).localeCompare(String(b.memory.id)))[0]?.memory||null;
}
function groundedMemoryReference(owner,subject,event,category){
  const memory=priorConversationMemory(owner,subject,event,category);
  if(!memory)return null;
  const workTitle=memory.context?.workTitle||memory.context?.projectTitle||null;
  const ageDays=Math.max(0,company.day-(memory.timestamp?.day??company.day));
  const when=ageDays===0?"earlier":ageDays===1?"yesterday":"before";
  if(["helped_with_blocker","supportive_conversation"].includes(memory.type))return workTitle?`Thanks again for helping with ${workTitle} ${when}.`:`Thanks again for helping when I was stuck ${when}.`;
  if(["reliable_collaboration","routine_collaboration"].includes(memory.type))return workTitle?`Our last pass on ${workTitle} worked well.`:"Our last collaboration gave us a useful starting point.";
  if(memory.type==="shared_success")return workTitle?`The result on ${workTitle} still gives us something to build on.`:"The last result we shared still gives us something to build on.";
  if(memory.type==="constructive_feedback")return workTitle?`Your earlier feedback on ${workTitle} helped.`:"Your earlier feedback helped me see the problem differently.";
  if(memory.type==="fair_recognition")return "I appreciated that you recognized the contribution before.";
  if(["apology_received","conflict_repaired"].includes(memory.type))return workTitle?`I am glad we sorted out the issue around ${workTitle}.`:"I am glad we sorted out the issue between us.";
  if(memory.type==="onboarding_support")return "I still appreciate the support you gave me when I was getting started.";
  if(socialMemoryValenceScore(memory)>0&&memory.intensity>=3)return "Our last conversation made the next step easier.";
  return null;
}
function groundedCultureStatement(event){
  const evidence=(company.socialCulture?.evidence||[]).find(item=>item.sourceEventId===event.id);
  if(!evidence)return null;
  if((evidence.dimensions?.collaboration||0)>0)return "This is another example of coworkers helping one another.";
  if((evidence.dimensions?.learningOrientation||0)>0)return "There is something useful for the team to learn from this.";
  if((evidence.dimensions?.recognitionFairness||0)>0)return "It is good that the contribution was recognized.";
  if((evidence.dimensions?.psychologicalSafety||0)<0)return "This made it harder to speak openly.";
  return null;
}
function groundedGroupStatement(actor,subject){
  const group=(company.informalGroups||[]).find(item=>item.status==="active"&&item.memberIds.includes(actor?.id)&&item.memberIds.includes(subject?.id));
  if(!group||group.confidence<SOCIAL_GROUP_RULES.minimumConfidence)return null;
  return group.type==="mentoring"
    ?"We have built a useful habit of learning from one another."
    :"We have worked together enough to know how the other approaches this.";
}
function groundedLeadershipStatement(event){
  const evidence=Object.values(company.socialLeadership||{}).flatMap(state=>state?.evidence||[]).find(item=>item.sourceEventId===event.id);
  if(!evidence)return null;
  if(["mentoring_interaction","direct_help","onboarding_support"].includes(evidence.type))return "I want to make sure you have the support to handle this confidently.";
  if(["constructive_feedback","successful_repair"].includes(evidence.type))return "I want us to address this clearly and leave the working relationship stronger.";
  return null;
}
function groundedConversationFacts(event,experience){
  const context={...(event?.context||{}),...(experience?.context||{})};
  const work=socialWorkItem(event?.workItemId||context.workItemId);
  const projectTitle=socialProjectTitle(event?.projectId||context.projectId);
  const actor=socialEmployee(event?.actorId||experience?.actorId),subject=socialEmployee(event?.subjectId||experience?.subjectId);
  return {
    actorName:actor?.name||"A coworker",
    subjectName:subject?.name||"a coworker",
    workTitle:work?.title||context.workTitle||projectTitle||null,
    projectTitle:projectTitle||context.projectTitle||null,
    blocker:context.blocker||(work?.blockedBy||[])[0]||null,
    blockerResolution:event?.type==="blocker_resolved_together"
      ?context.outcome||(context.blocker?`${context.blocker} was resolved`:null)
      :null,
    purpose:context.purpose||null,
    deadlineDay:socialHasFiniteNumber(context.deadlineDay)?Number(context.deadlineDay)+1:socialHasFiniteNumber(work?.deadlineDay)?Number(work.deadlineDay)+1:null,
    newsTopic:context.newsTopic||context.topic||projectTitle||null,
    timeGreeting:(company.minute||0)<720?"Good morning":(company.minute||0)<1020?"Hello":"Good afternoon",
    cultureStatement:groundedCultureStatement(event),
    groupStatement:groundedGroupStatement(actor,subject),
    leadershipStatement:groundedLeadershipStatement(event),
    memoryReference:null
  };
}
function socialTemplateAvailable(template,facts){
  return (template.required||[]).every(key=>facts[key]!==null&&facts[key]!==undefined&&String(facts[key]).trim()!=="");
}
function dialogueVoiceStyleForEmployee(employee,category){
  const personality=employee?.personality||{};
  const formality=company?.socialCulture?.dimensions?.formality?.value??50;
  if((personality.sociability||0)<-.28)return "reserved";
  if(SOCIAL_CONVERSATION_RULES.humorSafeCategories.includes(category)&&(personality.sociability||0)>.25&&(personality.riskTolerance||0)>.15&&(employee?.morale||50)>=62)return "humorous";
  if((personality.sociability||0)>.38)return "extrovert";
  if((personality.structureNeed||0)>.25||(personality.detailOrientation||0)>.35||formality>=62)return "professional";
  return "reserved";
}
function personalityDialogueStyle(employee,text,voiceStyle=null){
  const personality=employee?.personality||{};
  if((personality.riskTolerance||0)<-.62&&!/^I may|^Could|^Would|^How|^Do you/.test(text))return `I may be missing something, but ${lowerDialogueStart(text)}`;
  if(voiceStyle==="reserved"&&(personality.sociability||0)<-.6)return text.replace(/^Hey[!,]\s*/,"");
  return text;
}
function socialDialogueSelectionSignals(speaker,category,conversationContext={}){
  const relationship=conversationContext.relationship||SOCIAL_ORGANIZATION_RULES.neutralInterpretation;
  const emotion=conversationContext.emotionalState?.owner||{
    stress:speaker?.stress??50,
    morale:speaker?.morale??50,
    frustration:speaker?.emotionalState?.frustration??0
  };
  const recentCategories=company.socialConversationState?.recentCategoryHistory?.[speaker.id]||[];
  return {
    relationship:{
      trust:clamp(socialNumberOr(relationship.trust,50),0,100),
      comfort:clamp(socialNumberOr(relationship.comfort,50),0,100),
      professionalFriction:clamp(socialNumberOr(relationship.professionalFriction,0),0,100)
    },
    emotion:{
      stress:clamp(Number(emotion.stress)||0,0,100),
      morale:clamp(Number(emotion.morale)||0,0,100),
      frustration:clamp(Number(emotion.frustration)||0,0,100)
    },
    recentCategories:recentCategories.slice(0,SOCIAL_CONVERSATION_RULES.maxRecentCategories),
    recentCategoryCount:recentCategories.filter(item=>item===category).length
  };
}
function dialogueTemplateWeight(template,speaker,listener,category,event,lineIndex,conversationContext={}){
  const signals=socialDialogueSelectionSignals(speaker,category,conversationContext);
  const personality=speaker?.personality||{},wrapperIndex=Number(String(template.id).split("-").pop())||0;
  const isDirect=wrapperIndex===0,isContextual=wrapperIndex===2||wrapperIndex===3;
  const textLength=template.text.length,relationship=signals.relationship,emotion=signals.emotion;
  let score=(hashText32(`${event.id}|${speaker.id}|${listener?.id??"none"}|${category}|${lineIndex}|${template.id}|${signals.recentCategoryCount}`)%10000)/1000;
  const preferredVoice=dialogueVoiceStyleForEmployee(speaker,category);
  score+=template.voiceStyle===preferredVoice?9:-Math.abs(SOCIAL_DIALOGUE_WRAPPERS.findIndex(item=>item.voiceStyle===template.voiceStyle)-SOCIAL_DIALOGUE_WRAPPERS.findIndex(item=>item.voiceStyle===preferredVoice))*.75;
  if(template.voiceStyle==="humorous"&&!SOCIAL_CONVERSATION_RULES.humorSafeCategories.includes(category))score-=20;
  if((template.required||[]).includes("memoryReference")&&conversationContext.memoryReference)score+=12;
  score+=isDirect*((personality.sociability||0)*1.2+(relationship.comfort-50)*.025+(emotion.frustration-20)*.018);
  score+=isContextual*((personality.structureNeed||0)*1.1+(relationship.professionalFriction)*.018+(50-relationship.trust)*.012);
  score+=(personality.detailOrientation||0)*(textLength-55)*.018;
  score-=(emotion.stress-50)*Math.max(0,textLength-60)*.0015;
  score+=(emotion.morale-50)*(["appreciation","recognition","celebration"].includes(category)?.012:.003);
  score+=signals.recentCategoryCount*(wrapperIndex%2===0?-.09:.09);
  return Number(score.toFixed(4));
}
function fillGroundedDialogueTemplate(template,facts){
  return template.text.replace(/\{(\w+)\}/g,(match,key)=>facts[key]??match);
}
function socialConversationPairHistory(aId,bId){
  const state=company.socialConversationState,key=makeRelationshipKey(aId,bId);
  const existing=state.pairHistory[key]&&typeof state.pairHistory[key]==="object"?state.pairHistory[key]:{};
  state.pairHistory[key]={
    recentTemplateIds:Array.isArray(existing.recentTemplateIds)?existing.recentTemplateIds.slice(0,SOCIAL_CONVERSATION_RULES.maxRecentPairTemplates):[],
    recentTopics:Array.isArray(existing.recentTopics)?existing.recentTopics.slice(0,SOCIAL_CONVERSATION_RULES.maxRecentPairTopics):[],
    recentCategories:Array.isArray(existing.recentCategories)?existing.recentCategories.slice(0,SOCIAL_CONVERSATION_RULES.maxRecentCategories):[],
    lastConversationAt:socialHasFiniteNumber(existing.lastConversationAt)?Number(existing.lastConversationAt):null
  };
  return state.pairHistory[key];
}
function conversationPartnerRecencyPenalty(employeeId,candidateId){
  const recent=company?.socialConversationState?.recentPartnersByEmployee?.[employeeId]||[];
  const index=recent.indexOf(Number(candidateId));
  return index<0?0:Math.max(1,8-index);
}
function selectGroundedDialogueTemplate(category,speaker,listener,event,lineIndex,facts,conversationContext={}){
  let templates=(SOCIAL_DIALOGUE_TEMPLATES[category]||SOCIAL_DIALOGUE_TEMPLATES.casual).filter(template=>socialTemplateAvailable(template,facts));
  if(category==="blockers"&&event?.type==="blocker_resolved_together"){
    const resolvedTemplates=templates.filter(template=>template.required.includes("blockerResolution")||["confirm-resolution","recognize-resolution","reflect-on-resolution"].includes(template.intent));
    if(resolvedTemplates.length)templates=resolvedTemplates;
  }
  if(!templates.length)return null;
  const state=company.socialConversationState,usage=state.templateUsage[speaker.id]||[];
  const pairHistory=socialConversationPairHistory(speaker.id,listener.id);
  const excluded=new Set(conversationContext.usedTemplateIds||[]);
  const available=templates.filter(template=>!excluded.has(template.id));
  const freshPair=available.filter(template=>!pairHistory.recentTemplateIds.includes(template.id));
  const freshSpeaker=available.filter(template=>!usage.includes(template.id));
  const pool=freshPair.length?freshPair:freshSpeaker.length?freshSpeaker:available.length?available:templates;
  const template=pool
    .map(candidate=>({candidate,weight:dialogueTemplateWeight(candidate,speaker,listener,category,event,lineIndex,{...conversationContext,memoryReference:facts.memoryReference})}))
    .sort((a,b)=>b.weight-a.weight||String(a.candidate.id).localeCompare(String(b.candidate.id)))[0].candidate;
  state.templateUsage[speaker.id]=[template.id,...usage.filter(id=>id!==template.id)].slice(0,SOCIAL_CONVERSATION_RULES.maxRecentTemplateIds);
  return template;
}
function selectGroundedClosingTemplate(speaker,listener,event,lineIndex,conversationContext={}){
  const category=conversationContext.category||"casual",pairHistory=socialConversationPairHistory(speaker.id,listener.id);
  const candidates=SOCIAL_DIALOGUE_CLOSINGS.flatMap((statement,statementIndex)=>SOCIAL_DIALOGUE_WRAPPERS.map((wrapper,wrapperIndex)=>({
    id:`closing-${statementIndex}-${wrapperIndex}`,
    category,
    intent:"goodbye",
    voiceStyle:wrapper.voiceStyle,
    text:applySocialDialogueWording(statement.text,wrapper.voiceStyle,category),
    required:[]
  })));
  const unused=candidates.filter(candidate=>!pairHistory.recentTemplateIds.includes(candidate.id)&&!(conversationContext.usedTemplateIds||[]).includes(candidate.id));
  const pool=unused.length?unused:candidates;
  return pool.map(candidate=>({candidate,weight:dialogueTemplateWeight(candidate,speaker,listener,category,event,lineIndex,conversationContext)}))
    .sort((a,b)=>b.weight-a.weight||String(a.candidate.id).localeCompare(String(b.candidate.id)))[0].candidate;
}
function conversationExchangeCount(sourceEventId){
  const span=SOCIAL_CONVERSATION_RULES.maximumExchanges-SOCIAL_CONVERSATION_RULES.minimumExchanges+1;
  return SOCIAL_CONVERSATION_RULES.minimumExchanges+(hashText32(`${sourceEventId}|exchange-count`)%Math.max(1,span));
}
function conversationTurnPlan(count){
  const plan=[
    {speaker:"actor",category:"greeting",intent:"greeting"},
    {speaker:"actor",category:"topic",intent:"topic"},
    {speaker:"subject",category:"topic",intent:"reply"}
  ];
  if(count>=5)plan.push({speaker:"actor",category:"topic",intent:"follow_up"});
  plan.push({speaker:"subject",category:"closing",intent:"goodbye"});
  return plan;
}
function conversationLineDurationMinutes(text,intent="topic"){
  if(intent==="goodbye")return SOCIAL_CONVERSATION_RULES.goodbyeDurationMinutes;
  const words=String(text||"").trim().split(/\s+/).filter(Boolean).length;
  const raw=SOCIAL_CONVERSATION_RULES.baseLineDurationMinutes+words*SOCIAL_CONVERSATION_RULES.wordsPerDurationMinute;
  const step=SOCIAL_CONVERSATION_RULES.lineDurationStepMinutes;
  const rounded=Math.ceil(raw/step)*step;
  return clamp(rounded,SOCIAL_CONVERSATION_RULES.minimumLineDurationMinutes,SOCIAL_CONVERSATION_RULES.maximumLineDurationMinutes);
}
function conversationScheduleForExchanges(exchanges,startedAt){
  const start=socialTimestampValue(startedAt);
  let cursor=SOCIAL_CONVERSATION_RULES.approachDurationMinutes;
  const exchangeSchedule=exchanges.map((exchange,index)=>{
    const durationMinutes=conversationLineDurationMinutes(exchange.text,exchange.intent);
    const pauseAfterMinutes=index===exchanges.length-1?0:SOCIAL_CONVERSATION_RULES.pauseBetweenExchangesMinutes;
    const item={exchangeIndex:index,startOffsetMinutes:cursor,durationMinutes,pauseAfterMinutes};
    cursor+=durationMinutes+pauseAfterMinutes;
    return item;
  });
  const conversationStartAt=start+SOCIAL_CONVERSATION_RULES.approachDurationMinutes;
  const endAtAbsoluteMinute=start+cursor;
  const resumeAt=endAtAbsoluteMinute+SOCIAL_CONVERSATION_RULES.resumeDurationMinutes;
  return {exchangeSchedule,conversationStartAt,endAtAbsoluteMinute,resumeAt,visibleUntilAbsoluteMinute:resumeAt};
}
function normalizeStoredConversation(conversation){
  if(!conversation?.sourceEventId||!Array.isArray(conversation.participantIds)||conversation.participantIds.length<2)return null;
  let exchanges=Array.isArray(conversation.exchanges)?conversation.exchanges.filter(exchange=>exchange?.text):[];
  if(!exchanges.length)return null;
  const [actorId,subjectId]=conversation.participantIds.map(Number);
  const existingGoodbye=exchanges.findLast?.(exchange=>exchange.intent==="goodbye")||[...exchanges].reverse().find(exchange=>exchange.intent==="goodbye");
  let body=exchanges.filter(exchange=>exchange!==existingGoodbye&&exchange.intent!=="goodbye");
  if(!body.some(exchange=>exchange.intent==="greeting")){
    body=[{speakerId:actorId,listenerId:subjectId,templateId:"migration-greeting",intent:"greeting",voiceStyle:"reserved",text:"Hello. Do you have a minute?"},...body];
  }
  body=body.slice(0,SOCIAL_CONVERSATION_RULES.maximumExchanges-1).map((exchange,index)=>({
    intent:exchange.intent||(index===0?"greeting":index===1?"topic":"reply"),
    voiceStyle:exchange.voiceStyle||"reserved",
    ...exchange
  }));
  const goodbye=existingGoodbye
    ?{speakerId:subjectId,listenerId:actorId,templateId:"migration-goodbye",intent:"goodbye",voiceStyle:"reserved",...existingGoodbye}
    :{speakerId:subjectId,listenerId:actorId,templateId:"migration-goodbye",intent:"goodbye",voiceStyle:"reserved",text:"Thanks. I will let you get back to it."};
  exchanges=[...body,goodbye];
  while(exchanges.length<SOCIAL_CONVERSATION_RULES.minimumExchanges){
    exchanges.splice(exchanges.length-1,0,{speakerId:subjectId,listenerId:actorId,templateId:`migration-reply-${exchanges.length}`,intent:"reply",voiceStyle:"reserved",text:"I understand. Let us keep each other updated."});
  }
  const rebuiltSchedule=conversationScheduleForExchanges(exchanges,conversation.startedAt);
  const schedule=Array.isArray(conversation.exchangeSchedule)&&conversation.exchangeSchedule.length===exchanges.length
    ?{
      exchangeSchedule:conversation.exchangeSchedule,
      conversationStartAt:socialHasFiniteNumber(conversation.conversationStartAt)?Number(conversation.conversationStartAt):rebuiltSchedule.conversationStartAt,
      endAtAbsoluteMinute:socialHasFiniteNumber(conversation.endAtAbsoluteMinute)?Number(conversation.endAtAbsoluteMinute):socialHasFiniteNumber(conversation.visibleUntilAbsoluteMinute)?Number(conversation.visibleUntilAbsoluteMinute):rebuiltSchedule.endAtAbsoluteMinute,
      resumeAt:socialHasFiniteNumber(conversation.resumeAt)?Number(conversation.resumeAt):socialHasFiniteNumber(conversation.visibleUntilAbsoluteMinute)?Number(conversation.visibleUntilAbsoluteMinute):rebuiltSchedule.resumeAt,
      visibleUntilAbsoluteMinute:socialHasFiniteNumber(conversation.visibleUntilAbsoluteMinute)?Number(conversation.visibleUntilAbsoluteMinute):socialHasFiniteNumber(conversation.resumeAt)?Number(conversation.resumeAt):rebuiltSchedule.visibleUntilAbsoluteMinute
    }
    :rebuiltSchedule;
  const source=(company?.socialSourceEvents||[]).find(event=>event.id===conversation.sourceEventId);
  return {
    ...conversation,
    exchanges,
    triggerType:conversation.triggerType||groundedConversationTriggerForEvent(source)||null,
    triggerEvidenceId:conversation.triggerEvidenceId||conversation.sourceEventId,
    phase:conversation.phase||"completed",
    phaseStartedAt:socialHasFiniteNumber(conversation.phaseStartedAt)?Number(conversation.phaseStartedAt):socialTimestampValue(conversation.startedAt),
    currentExchangeIndex:Number.isInteger(conversation.currentExchangeIndex)?conversation.currentExchangeIndex:null,
    presence:conversation.presence&&typeof conversation.presence==="object"?conversation.presence:null,
    ...schedule
  };
}
function conversationPairCooldownReady(aId,bId,timestamp){
  const key=makeRelationshipKey(aId,bId),stored=company.socialConversationState.lastConversationByPair[key];
  const last=socialHasFiniteNumber(stored)?Number(stored):OFFICE_AQUARIUM_CONSTANTS.time.neverAbsoluteMinute;
  return socialTimestampValue(timestamp)-last>=SOCIAL_CONVERSATION_RULES.conversationCooldownMinutes;
}
function conversationParticipantRoom(employee){
  return employee?.currentRoom||roomForZone?.(employee?.zone)||null;
}
function conversationTopicKey(category,facts,event){
  return [
    category,
    event?.projectId||facts.projectTitle||"",
    event?.workItemId||facts.workTitle||"",
    facts.blocker||facts.newsTopic||facts.purpose||""
  ].map(value=>String(value).trim().toLowerCase()).join("|");
}
function noteConversationPairHistory(conversation){
  const [aId,bId]=conversation.participantIds,pairHistory=socialConversationPairHistory(aId,bId);
  const templateIds=conversation.exchanges.map(exchange=>exchange.templateId).filter(Boolean);
  pairHistory.recentTemplateIds=[...templateIds,...pairHistory.recentTemplateIds.filter(id=>!templateIds.includes(id))].slice(0,SOCIAL_CONVERSATION_RULES.maxRecentPairTemplates);
  pairHistory.recentTopics=[conversation.topicKey,...pairHistory.recentTopics.filter(topic=>topic!==conversation.topicKey)].filter(Boolean).slice(0,SOCIAL_CONVERSATION_RULES.maxRecentPairTopics);
  pairHistory.recentCategories=[conversation.category,...pairHistory.recentCategories.filter(category=>category!==conversation.category)].slice(0,SOCIAL_CONVERSATION_RULES.maxRecentCategories);
  pairHistory.lastConversationAt=socialTimestampValue(conversation.startedAt);
  [[aId,bId],[bId,aId]].forEach(([employeeId,partnerId])=>{
    const recent=company.socialConversationState.recentPartnersByEmployee[employeeId]||[];
    company.socialConversationState.recentPartnersByEmployee[employeeId]=[partnerId,...recent.filter(id=>id!==partnerId)].slice(0,SOCIAL_CONVERSATION_RULES.maxRecentPartnersPerEmployee);
  });
}
function conversationZoneBounds(roomId){
  const zoneId=typeof zoneForRoom==="function"?zoneForRoom(roomId):null;
  const bounds=typeof zones!=="undefined"&&zoneId?zones[zoneId]:null;
  return {zoneId,bounds:bounds||{x:[10,90],y:[10,90]}};
}
function conversationApproachTargets(actor,subject,roomId,sourceEventId){
  const {zoneId,bounds}=conversationZoneBounds(roomId),space=SOCIAL_CONVERSATION_RULES.personalSpacePercent;
  const xCenter=clamp(((Number(actor.x)||50)+(Number(subject.x)||50))/2,bounds.x[0]+space+1,bounds.x[1]-space-1);
  const yCenter=clamp(((Number(actor.y)||50)+(Number(subject.y)||50))/2,bounds.y[0]+2,bounds.y[1]-2);
  const verticalDirection=(hashText32(`${sourceEventId}|presence-offset`)%2)?1:-1;
  const yOffset=SOCIAL_CONVERSATION_RULES.naturalOffsetPercent*verticalDirection;
  return {
    zoneId,
    actor:{x:xCenter-space/2,y:clamp(yCenter-yOffset/2,bounds.y[0]+1,bounds.y[1]-1),facing:"right"},
    subject:{x:xCenter+space/2,y:clamp(yCenter+yOffset/2,bounds.y[0]+1,bounds.y[1]-1),facing:"left"}
  };
}
function setEmployeeConversationPresence(employee,conversation,partner,target){
  if(!employee)return;
  employee.conversationPresence={
    conversationId:conversation.id,
    partnerId:partner.id,
    phase:"approach",
    facing:target.facing,
    gesture:"shift-weight",
    roomId:conversation.roomId
  };
  if(target.zoneId)employee.zone=target.zoneId;
  if(typeof moveEmployeeToPosition==="function")moveEmployeeToPosition(employee,target.x,target.y,{reason:"conversation-approach",flowCue:"approach-coworker"});
}
function stageConversationPresence(conversation,actor,subject){
  const targets=conversationApproachTargets(actor,subject,conversation.roomId,conversation.sourceEventId);
  conversation.presence={
    phase:"approach",
    previousPositions:{
      [actor.id]:{x:actor.x,y:actor.y,zone:actor.zone,roomId:conversationParticipantRoom(actor)},
      [subject.id]:{x:subject.x,y:subject.y,zone:subject.zone,roomId:conversationParticipantRoom(subject)}
    },
    targets:{[actor.id]:targets.actor,[subject.id]:targets.subject}
  };
  setEmployeeConversationPresence(actor,conversation,subject,{...targets.actor,zoneId:targets.zoneId});
  setEmployeeConversationPresence(subject,conversation,actor,{...targets.subject,zoneId:targets.zoneId});
}
function conversationPhaseAt(conversation,now){
  if(now<conversation.conversationStartAt)return {phase:"approach",exchangeIndex:null};
  for(const item of conversation.exchangeSchedule||[]){
    const starts=socialTimestampValue(conversation.startedAt)+item.startOffsetMinutes;
    if(now>=starts&&now<starts+item.durationMinutes)return {phase:"speaking",exchangeIndex:item.exchangeIndex};
    if(now>=starts+item.durationMinutes&&now<starts+item.durationMinutes+item.pauseAfterMinutes)return {phase:"pause",exchangeIndex:null};
  }
  if(now<conversation.resumeAt)return {phase:"resume",exchangeIndex:null};
  return {phase:"completed",exchangeIndex:null};
}
function clearConversationPresence(conversation){
  conversation.participantIds.forEach(employeeId=>{
    const employee=socialEmployee(employeeId);
    if(employee?.conversationPresence?.conversationId===conversation.id)employee.conversationPresence=null;
  });
}
function refreshEmployeeConversationPresence(employee){
  const presence=employee?.conversationPresence;
  if(!presence)return;
  const conversation=company.socialConversationState.history.find(item=>item.id===presence.conversationId);
  if(!conversation){employee.conversationPresence=null;return;}
  advanceConversationPresence(conversation,simulationTimestamp().absoluteMinute);
}
function advanceConversationPresence(conversation,now){
  const snapshot=conversationPhaseAt(conversation,now);
  if(snapshot.phase===conversation.phase&&snapshot.exchangeIndex===conversation.currentExchangeIndex)return snapshot;
  const previousPhase=conversation.phase;
  conversation.phase=snapshot.phase;
  conversation.phaseStartedAt=now;
  conversation.currentExchangeIndex=snapshot.exchangeIndex;
  conversation.participantIds.forEach(employeeId=>{
    const employee=socialEmployee(employeeId);
    if(!employee?.active||employee.offsite)return;
    const partnerId=conversation.participantIds.find(id=>id!==employeeId);
    const presence=employee.conversationPresence?.conversationId===conversation.id?employee.conversationPresence:{
      conversationId:conversation.id,
      partnerId,
      facing:conversation.presence?.targets?.[employeeId]?.facing||"right",
      roomId:conversation.roomId
    };
    presence.phase=snapshot.phase;
    presence.gesture="shift-weight";
    if(snapshot.phase==="speaking"){
      const exchange=conversation.exchanges[snapshot.exchangeIndex];
      const gestureIndex=hashText32(`${conversation.id}|${snapshot.exchangeIndex}|${employeeId}`)%SOCIAL_CONVERSATION_RULES.gestures.length;
      presence.gesture=exchange?.speakerId===employeeId?SOCIAL_CONVERSATION_RULES.gestures[gestureIndex]:"nod";
      presence.role=exchange?.speakerId===employeeId?"speaker":"listener";
    }else presence.role="participant";
    employee.conversationPresence=presence;
  });
  if(snapshot.phase==="resume"&&previousPhase!=="resume"){
    Object.entries(conversation.presence?.previousPositions||{}).forEach(([employeeId,position])=>{
      const employee=socialEmployee(employeeId);
      if(!employee?.active||employee.offsite||employee.conversationPresence?.conversationId!==conversation.id)return;
      const pending=employee.officeFlow?.pendingPosition;
      const destination=pending||position;
      if(destination.zone)employee.zone=destination.zone;
      if(destination.currentRoom)employee.currentRoom=destination.currentRoom;
      if(employee.officeFlow?.pendingPosition)delete employee.officeFlow.pendingPosition;
      if(typeof moveEmployeeToPosition==="function")moveEmployeeToPosition(employee,destination.x,destination.y,{reason:"conversation-resume",flowCue:"resume-activity"});
    });
  }
  if(snapshot.phase==="completed"){
    conversation.completedAt=now;
    clearConversationPresence(conversation);
  }
  return snapshot;
}
function createGroundedConversationFromExperience(experience,event){
  ensureSocialOrganizationContainers();
  if(!experience||!event||event.privacy==="confidential")return null;
  if(company.socialConversationState.history.some(conversation=>conversation.sourceEventId===event.id))return null;
  const eventAge=simulationTimestamp().absoluteMinute-socialTimestampValue(event.timestamp);
  if(eventAge<0||eventAge>SOCIAL_CONVERSATION_RULES.sourceEventMaxAgeMinutes)return null;
  const actor=socialEmployee(event.actorId),subject=socialEmployee(event.subjectId);
  if(!actor?.active||!subject?.active||actor.offsite||subject.offsite)return null;
  refreshEmployeeConversationPresence(actor);
  refreshEmployeeConversationPresence(subject);
  const triggerType=groundedConversationTriggerForEvent(event,experience);
  if(!triggerType||!SOCIAL_CONVERSATION_RULES.groundedTriggerTypes.includes(triggerType))return null;
  if(employeeHasCriticalConversationConflict(actor,triggerType)||employeeHasCriticalConversationConflict(subject,triggerType))return null;
  if(actor.conversationPresence||subject.conversationPresence)return null;
  const room=event.roomId||conversationParticipantRoom(actor);
  if(!room||conversationParticipantRoom(actor)!==room||conversationParticipantRoom(subject)!==room)return null;
  if(!conversationPairCooldownReady(actor.id,subject.id,event.timestamp))return null;
  const category=conversationCategoryForEvent(event),facts=groundedConversationFacts(event,experience),count=conversationExchangeCount(event.id),exchanges=[],usedTemplateIds=[];
  const contexts={
    [actor.id]:buildSocialConversationContext(actor,subject,event,category),
    [subject.id]:buildSocialConversationContext(subject,actor,event,category)
  };
  const memoryReferences={
    [actor.id]:groundedMemoryReference(actor,subject,event,category),
    [subject.id]:groundedMemoryReference(subject,actor,event,category)
  };
  const turnPlan=conversationTurnPlan(count);
  for(let index=0;index<turnPlan.length;index++){
    const turn=turnPlan[index],speaker=turn.speaker==="actor"?actor:subject,listener=speaker.id===actor.id?subject:actor;
    const turnCategory=turn.category==="topic"?category:turn.category;
    const lineFacts={...facts,subjectName:listener.name,memoryReference:memoryReferences[speaker.id]};
    const selectionContext={...contexts[speaker.id],category,usedTemplateIds,memoryReference:lineFacts.memoryReference};
    const template=turnCategory==="closing"
      ?selectGroundedClosingTemplate(speaker,listener,event,index,selectionContext)
      :selectGroundedDialogueTemplate(turnCategory,speaker,listener,event,index,lineFacts,selectionContext);
    if(!template)continue;
    let text=fillGroundedDialogueTemplate(template,lineFacts);
    if(/\{\w+\}/.test(text))continue;
    if(event.privacy==="private"){
      const privateLines=[
        "Can we talk privately for a moment?",
        "I would rather discuss the details away from the room.",
        "Of course. Let us step somewhere quieter.",
        "Thank you. I will keep this between us.",
        "I will meet you there."
      ];
      text=privateLines[Math.min(index,privateLines.length-1)];
    }
    usedTemplateIds.push(template.id);
    exchanges.push({speakerId:speaker.id,listenerId:listener.id,templateId:template.id,intent:turn.intent,voiceStyle:template.voiceStyle,text:personalityDialogueStyle(speaker,text,template.voiceStyle)});
  }
  if(exchanges.length<SOCIAL_CONVERSATION_RULES.minimumExchanges)return null;
  const start=socialTimestampValue(event.timestamp),conversation={
    id:socialStableId("conversation",event.id,actor.id,subject.id),
    ownerSystem:AI_SYSTEM_OWNERS.social,
    sourceEventId:event.id,
    triggerType,
    triggerEvidenceId:event.id,
    category,
    participantIds:[actor.id,subject.id],
    roomId:room,
    projectId:event.projectId||null,
    privacy:event.privacy,
    confidence:event.confidence,
    facts,
    memoryReferences,
    topicKey:conversationTopicKey(category,facts,event),
    contexts,
    exchanges,
    startedAt:event.timestamp,
    phase:"approach",
    phaseStartedAt:start,
    currentExchangeIndex:null,
    ...conversationScheduleForExchanges(exchanges,event.timestamp)
  };
  stageConversationPresence(conversation,actor,subject);
  company.socialConversationState.history.unshift(conversation);
  company.socialConversationState.history=company.socialConversationState.history.slice(0,SOCIAL_CONVERSATION_RULES.maxStored);
  company.socialConversationState.lastConversationByPair[makeRelationshipKey(actor.id,subject.id)]=start;
  noteConversationPairHistory(conversation);
  conversation.participantIds.forEach(employeeId=>{
    const history=company.socialConversationState.recentCategoryHistory[employeeId]||[];
    company.socialConversationState.recentCategoryHistory[employeeId]=[category,...history].slice(0,SOCIAL_CONVERSATION_RULES.maxRecentCategories);
  });
  [actor,subject].forEach(owner=>{
    const context=contexts[owner.id];
    logSocialMemoryDebug({
      type:"conversation-context",
      status:"selected",
      ownerId:owner.id,
      subjectId:owner.id===actor.id?subject.id:actor.id,
      sourceEventId:event.id,
      recalledMemoryIds:context.relevantMemoryIds,
      relevanceScores:context.relevantMemoryIds.map(memoryId=>{
        const memory=company.socialMemoryStore.records.find(item=>item.id===memoryId);
        return {memoryId,score:memory?Number(socialMemoryRelevance(memory,{tags:[category,event.type],context:{projectId:event.projectId,workItemId:event.workItemId,roomId:event.roomId}}).toFixed(2)):null};
      }),
      relationshipBefore:socialClone(context.relationship),
      relationshipAfter:socialClone(context.relationship),
      selectedSocialBehavior:category,
      cooldownRemaining:0
    });
  });
  processConversationOverhearing(conversation,event);
  if(!event.context?.presentationOnly){
    applySocialMemoryRecallRecommendation(actor,subject,event,category);
    applySocialMemoryRecallRecommendation(subject,actor,event,category);
  }
  return conversation;
}
function employeeDistance(a,b){
  const ax=Number(a?.x),ay=Number(a?.y),bx=Number(b?.x),by=Number(b?.y);
  if(![ax,ay,bx,by].every(Number.isFinite))return 0;
  return Math.hypot(ax-bx,ay-by);
}
function conversationVolume(event){
  if(socialHasFiniteNumber(event.volume))return clamp(Number(event.volume),0,1);
  if(event.privacy==="confidential")return SOCIAL_CONVERSATION_RULES.confidentialVolume;
  if(event.privacy==="private")return SOCIAL_CONVERSATION_RULES.privateVolume;
  return SOCIAL_CONVERSATION_RULES.ordinaryVolume;
}
function processConversationOverhearing(conversation,event){
  if(event.privacy==="confidential")return [];
  const speakers=conversation.participantIds.map(socialEmployee).filter(Boolean),volume=conversationVolume(event),results=[];
  (employees||[]).filter(employee=>employee.active&&!employee.offsite&&!conversation.participantIds.includes(employee.id)&&conversationParticipantRoom(employee)===conversation.roomId).forEach(observer=>{
    const distance=Math.min(...speakers.map(speaker=>employeeDistance(observer,speaker)));
    if(distance>SOCIAL_CONVERSATION_RULES.overhearingRange)return;
    const attention=clamp(.62+(observer.personality?.sociability||0)*.14-(observer.focus||50)*.0025,0.2,.9);
    const audibility=volume*(1-distance/Math.max(1,SOCIAL_CONVERSATION_RULES.overhearingRange))*attention;
    if(audibility<.18)return;
    const confidence=clamp(event.confidence*SOCIAL_CONVERSATION_RULES.overhearingConfidenceScale*audibility,5,65);
    const knowledge={
      id:socialStableId("overheard",observer.id,event.id),
      ownerSystem:AI_SYSTEM_OWNERS.social,
      employeeId:observer.id,
      sourceEventId:event.id,
      type:event.type,
      category:conversation.category,
      confidence:Number(confidence.toFixed(2)),
      heardAt:simulationTimestamp(),
      roomId:conversation.roomId,
      projectId:event.projectId||null,
      privacy:event.privacy,
      summaryCode:`overheard_${conversation.category}`
    };
    const list=company.socialConversationState.knowledge[observer.id]||[];
    if(!list.some(item=>item.id===knowledge.id))company.socialConversationState.knowledge[observer.id]=[knowledge,...list].slice(0,SOCIAL_CONVERSATION_RULES.maxKnowledgePerEmployee);
    results.push(knowledge);
  });
  return results;
}
function processVisibleConversationsMinute(){
  if(!company)return;
  ensureSocialOrganizationalSystems();
  const now=simulationTimestamp().absoluteMinute;
  company.socialConversationState.history.forEach(conversation=>{
    if(conversation.phase!=="completed"&&conversation.participantIds.some(employeeId=>!socialEmployee(employeeId)?.active||socialEmployee(employeeId)?.offsite)){
      conversation.phase="completed";
      conversation.completedAt=now;
      clearConversationPresence(conversation);
      return;
    }
    advanceConversationPresence(conversation,now);
  });
  company.socialConversationState.history=company.socialConversationState.history.filter(conversation=>now-socialTimestampValue(conversation.startedAt)<=TIME_RULES.minutesPerDay*7).slice(0,SOCIAL_CONVERSATION_RULES.maxStored);
}

function socialEscapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function visibleSocialConversations(){
  if(!company?.socialConversationState)return [];
  return company.socialConversationState.history
    .filter(conversation=>conversation.phase==="speaking"&&Number.isInteger(conversation.currentExchangeIndex))
    .slice(0,SOCIAL_CONVERSATION_RULES.maxVisibleBubbles);
}
function renderVisibleConversations(){
  if(typeof document==="undefined")return;
  const now=simulationTimestamp().absoluteMinute;
  document.querySelectorAll(".agent").forEach(agent=>{
    agent.classList.remove("conversation-approaching","conversation-speaking","conversation-listening","conversation-paused","conversation-resuming","facing-left","facing-right","gesture-nod","gesture-glance","gesture-shift-weight","gesture-fold-arms","gesture-sip-coffee","gesture-hand-gesture");
  });
  (company.socialConversationState?.history||[]).filter(conversation=>conversation.phase!=="completed").forEach(conversation=>{
    conversation.participantIds.forEach(employeeId=>{
      const employee=socialEmployee(employeeId),agent=document.getElementById(`agent-${employeeId}`),presence=employee?.conversationPresence;
      if(!agent||presence?.conversationId!==conversation.id)return;
      const phaseClass={approach:"conversation-approaching",speaking:presence.role==="speaker"?"conversation-speaking":"conversation-listening",pause:"conversation-paused",resume:"conversation-resuming"}[presence.phase];
      if(phaseClass)agent.classList.add(phaseClass);
      if(presence.facing)agent.classList.add(`facing-${presence.facing}`);
      if(presence.gesture)agent.classList.add(`gesture-${presence.gesture}`);
    });
  });
  const visible=visibleSocialConversations(),visibleIds=new Set(visible.map(conversation=>conversation.id));
  document.querySelectorAll(".speech-bubble").forEach(node=>{
    if(!visibleIds.has(node.dataset.conversationId))node.remove();
  });
  const stackBySpeaker={};
  visible.forEach(conversation=>{
    const index=conversation.currentExchangeIndex,exchange=conversation.exchanges[index];
    if(!exchange)return;
    const agent=document.getElementById(`agent-${exchange.speakerId}`);
    if(!agent)return;
    let bubble=document.querySelector(`.speech-bubble[data-conversation-id="${conversation.id}"]`);
    if(!bubble){
      bubble=document.createElement("button");
      bubble.type="button";
      bubble.dataset.conversationId=conversation.id;
      bubble.onclick=event=>{event.stopPropagation();showSocialConversationDetails(conversation.id);};
      bubble.onmouseenter=()=>{socialConversationUiState.hoveredId=conversation.id;bubble.style.opacity="1";};
      bubble.onmouseleave=()=>{if(socialConversationUiState.hoveredId===conversation.id)socialConversationUiState.hoveredId=null;renderVisibleConversations();};
    }
    bubble.className=`speech-bubble speech-${conversation.category}`;
    bubble.dataset.exchangeIndex=String(index);
    bubble.setAttribute("aria-label",`Conversation: ${exchange.text}`);
    if(bubble.textContent!==exchange.text)bubble.textContent=exchange.text;
    const stackIndex=stackBySpeaker[exchange.speakerId]||0;
    stackBySpeaker[exchange.speakerId]=stackIndex+1;
    bubble.style.setProperty("--bubble-stack",String(stackIndex));
    const schedule=(conversation.exchangeSchedule||[]).find(item=>item.exchangeIndex===index);
    const starts=socialTimestampValue(conversation.startedAt)+(schedule?.startOffsetMinutes||0);
    const remaining=Math.max(0,(schedule?.durationMinutes||SOCIAL_CONVERSATION_RULES.minimumLineDurationMinutes)-(now-starts));
    bubble.style.opacity=socialConversationUiState.hoveredId===conversation.id?"1":String(clamp(remaining/5,.22,1));
    if(bubble.parentElement!==agent)agent.appendChild(bubble);
  });
}
function showSocialConversationDetails(conversationId){
  if(typeof document==="undefined")return;
  const conversation=company.socialConversationState?.history.find(item=>item.id===conversationId);
  if(!conversation)return;
  const source=socialSourceEventById(conversation.sourceEventId),participants=conversation.participantIds.map(socialEmployee).filter(Boolean);
  const relationship=participants.length>=2?getRelationshipView(participants[0],participants[1]):null;
  const memories=[...new Map(participants.flatMap(employee=>recallMostRelevant(employee.id,{subjectId:participants.find(other=>other.id!==employee.id)?.id,tags:[conversation.category],limit:2})).map(memory=>[memory.id,memory])).values()].slice(0,4);
  const project=conversation.projectId?socialProjectTitle(conversation.projectId):null;
  const memorySummary=memories.length
    ?memories.map(memory=>{
      const type=String(memory.type||"shared interaction").replace(/_/g," ");
      const context=memory.context?.workTitle||memory.context?.projectTitle||"";
      return `${type}${context?` on ${context}`:""}${memory.resolved?" (resolved)":""}`;
    }).join("; ")
    :"A newer working relationship without a strong remembered pattern";
  const triggerLabel={
    "passing-coworker":"They crossed paths during a natural pause.",
    "meeting-transition":"They were beginning or wrapping up a meeting.",
    "help-request":"One coworker asked for help.",
    "task-finished":"A task had just finished.",
    "blocker-resolved":"They had just cleared a blocker together.",
    milestone:"The team had reached an important milestone.",
    conflict:"A real work disagreement needed to be addressed.",
    repair:"They were following up after a disagreement.",
    mentoring:"A mentoring opportunity brought them together.",
    break:"They chose to talk during a break.",
    "department-return":"One employee had just returned from another department.",
    "work-coordination":"Their current work required coordination.",
    deadline:"Schedule pressure prompted the conversation.",
    "company-news":"A real company update gave them something to discuss.",
    "first-meeting":"This was their first meaningful introduction."
  }[conversation.triggerType]||"A real workplace event brought them together.";
  const detail=document.getElementById("conversationDetailBody");
  if(detail)detail.innerHTML=`
    <p>${socialEscapeHtml(participants.map(employee=>employee.name).join(" and "))} spoke in ${socialEscapeHtml(teamDisplayName(conversation.roomId)||conversation.roomId)}.</p>
    <div class="conversation-transcript">${conversation.exchanges.map(exchange=>`<p><strong>${socialEscapeHtml(socialEmployee(exchange.speakerId)?.name||"Employee")}</strong><br>${socialEscapeHtml(exchange.text)}</p>`).join("")}</div>
    <div class="detail-grid">
      <div><strong>Why it happened</strong><br>${socialEscapeHtml(triggerLabel)}</div>
      <div><strong>Conversation</strong><br>${socialEscapeHtml(String(conversation.category||source?.type||"workplace conversation").replace(/_/g," "))}</div>
      <div><strong>Related work</strong><br>${socialEscapeHtml(project||conversation.facts?.workTitle||"General company life")}</div>
      <div><strong>Relevant memories</strong><br>${socialEscapeHtml(memorySummary)}</div>
      <div><strong>Relationship</strong><br>${relationship?relationshipSummaryLabel(relationship):"Still developing"}</div>
    </div>`;
  if(typeof openAccessibleDialog==="function")openAccessibleDialog("conversationModal","conversationTitle");
  else document.getElementById("conversationModal")?.classList.remove("hidden");
}
function closeSocialConversationDetails(){
  if(typeof document==="undefined")return;
  if(typeof closeAccessibleDialog==="function")closeAccessibleDialog("conversationModal");
  else document.getElementById("conversationModal")?.classList.add("hidden");
}
function relationshipSummaryLabel(view){
  const rel=view?.interpretation||{};
  const bands=SOCIAL_ORGANIZATION_RULES.relationshipBands;
  if((rel.professionalFriction||0)>=bands.severeFriction)return "Working through professional friction";
  if((rel.trust||0)>=bands.trusted&&(rel.respect||0)>=bands.respected)return "Trusted professional relationship";
  if((rel.comfort||0)>=bands.comfortable)return "Comfortable working relationship";
  if((view?.familiarity||0)>=SOCIAL_ORGANIZATION_RULES.familiarityKnownThreshold)return "Established working familiarity";
  return "Developing working familiarity";
}

function socialCulturePlayerHtml(){
  ensureSocialOrganizationalSystems();
  const dimensions=Object.entries(company.socialCulture.dimensions).sort((a,b)=>b[1].confidence-a[1].confidence||a[0].localeCompare(b[0]));
  const strongest=dimensions.slice(0,6),recentEvidence=(company.socialCulture.evidence||[]).slice(0,4);
  return `<div class="social-summary-grid">${strongest.map(([name,dimension])=>`
    <div class="social-summary-row">
      <div><strong>${socialEscapeHtml(name.replace(/([A-Z])/g," $1").replace(/^./,char=>char.toUpperCase()))}</strong><small>${dimension.confidence>=55?"Established pattern":dimension.confidence>=25?"Emerging pattern":"Still forming"}; ${dimension.trend>0?"rising":dimension.trend<0?"falling":"steady"}; ${Math.round(dimension.confidence)}% confidence</small><small>${dimension.evidenceCount||0} recent evidence item(s): ${(dimension.evidenceTypes||[]).slice(0,3).map(type=>type.replace(/_/g," ")).join(", ")||"none yet"}</small></div>
      <div class="social-meter"><span style="width:${clamp(dimension.value,0,100)}%"></span></div>
      <b>${Math.round(dimension.value)}</b>
    </div>`).join("")}</div>
    <p class="social-note"><strong>Why these patterns are changing:</strong> ${recentEvidence.length?recentEvidence.map(evidence=>socialEscapeHtml(evidence.type.replace(/_/g," "))).join(", "):"the company is still gathering meaningful social evidence"}. Values are derived from observed interactions, not CEO settings.${dimensions.some(([,dimension])=>dimension.confidence<25)?" Low-confidence patterns should be treated as early signals, not settled conclusions.":""}</p>`;
}
function socialGroupsPlayerHtml(){
  const groups=company.informalGroups||[],bridges=company.socialBridges||[];
  if(!groups.length)return `<p class="empty-social-state">Informal working groups are still forming through repeated shared experience.</p>`;
  return `<div class="social-group-list">${groups.map(group=>`
    <div class="social-group-row">
      <div><strong>${socialEscapeHtml(group.identity)}</strong><small>${group.memberIds.map(id=>socialEmployee(id)?.name).filter(Boolean).join(", ")}</small></div>
      <span>${socialEscapeHtml(group.type||"working")} group; ${Math.round(group.strength)} strength<small>${Math.round(group.confidence||0)}% confidence; ${group.status}; ${group.sharedHistoryScore||0} shared interaction(s)</small></span>
    </div>`).join("")}</div>
    ${bridges.length?`<p class="social-note"><strong>Cross-team connectors:</strong> ${bridges.slice(0,4).map(bridge=>socialEscapeHtml(bridge.name)).join(", ")}</p>`:""}`;
}
function socialNetworkPlayerHtml(){
  const graph=buildSocialRelationshipGraph(),width=620,height=270,cx=width/2,cy=height/2,radius=Math.min(width,height)*.36;
  if(!graph.nodes.length)return `<p class="empty-social-state">No active employees are available.</p>`;
  const positions=new Map(graph.nodes.map((node,index)=>{
    const angle=-Math.PI/2+(Math.PI*2*index)/Math.max(1,graph.nodes.length);
    return [node.id,{x:cx+Math.cos(angle)*radius,y:cy+Math.sin(angle)*radius}];
  }));
  const edges=graph.edges.filter(edge=>edge.score>=SOCIAL_GROUP_RULES.edgeThreshold).slice(0,40);
  return `<svg class="social-network" viewBox="0 0 ${width} ${height}" role="img" aria-label="Employee social network">
    ${edges.map(edge=>{const a=positions.get(edge.aId),b=positions.get(edge.bId);const edgeClass=edge.friction>=60?"network-edge-friction":edge.mentoring>0?"network-edge-mentoring":"network-edge";return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke-width="${Math.max(1,(edge.score-35)/18).toFixed(2)}" class="${edgeClass}"><title>${socialEscapeHtml(socialEmployee(edge.aId)?.name)} and ${socialEscapeHtml(socialEmployee(edge.bId)?.name)}: ${Math.round(edge.score)} relationship evidence from ${edge.meaningfulInteractions} meaningful interaction(s)${edge.mentoring?`; ${edge.mentoring} mentoring interaction(s)`:""}${edge.unresolvedConflicts?`; ${edge.unresolvedConflicts} unresolved conflict memory item(s)`:""}</title></line>`;}).join("")}
    ${graph.nodes.map(node=>{const p=positions.get(node.id);return `<g class="network-node" onclick="showEmployee(${node.id})" role="button" tabindex="0"><circle cx="${p.x}" cy="${p.y}" r="18"></circle><text x="${p.x}" y="${p.y+4}" text-anchor="middle">${socialEscapeHtml(node.name.slice(0,2).toUpperCase())}</text><text x="${p.x}" y="${p.y+33}" text-anchor="middle" class="network-label">${socialEscapeHtml(node.name)}</text></g>`;}).join("")}
  </svg>`;
}
function socialLeadershipPlayerHtml(){
  const leaders=(employees||[]).filter(employee=>employee.active).map(employee=>({employee,state:socialLeadershipState(employee,{create:false})||defaultSocialLeadershipState(employee)}))
    .filter(item=>item.state.formalAuthority>=30||item.state.informalInfluence>=SOCIAL_LEADERSHIP_RULES.informalInfluenceThreshold)
    .sort((a,b)=>b.state.informalInfluence-a.state.informalInfluence||b.state.formalAuthority-a.state.formalAuthority);
  if(!leaders.length)return `<p class="empty-social-state">No clear formal or informal leadership pattern has emerged yet.</p>`;
  return `<div class="social-leader-list">${leaders.slice(0,8).map(({employee,state})=>`
    <button type="button" class="social-leader-row" onclick="showEmployee(${employee.id})">
      <span><strong>${socialEscapeHtml(employee.name)}</strong><small>${socialEscapeHtml(employee.role)}</small></span>
      <span>${state.formalAuthority>=60?"Formal leader":state.informalInfluence>=SOCIAL_LEADERSHIP_RULES.informalInfluenceThreshold?"Informal leader":"Emerging influence"}<small>Credibility ${Math.round(state.credibility)}; coaching ${Math.round(state.coachingReputation)}; fairness ${Math.round(state.recognitionFairness)}; conflict handling ${Math.round(state.conflictHandling)}; ${Math.round(state.confidence)}% confidence from ${state.evidence.length} event(s)</small></span>
      <b>${Math.round(state.informalInfluence)}</b>
    </button>`).join("")}</div>`;
}
function setSocialOrganizationView(view){
  if(!company)return;
  company.socialOrganizationView=SOCIAL_ORGANIZATION_VIEWS.includes(view)
    ?view
    :SOCIAL_ORGANIZATION_RULES.defaultOrganizationView;
  renderSocialOrganizationPanel();
  if(!validationMode)saveGame();
}
function renderSocialOrganizationPanel(){
  if(typeof document==="undefined")return;
  const root=document.getElementById("socialOrganizationPanel");
  if(!root)return;
  ensureSocialOrganizationalSystems();
  const view=SOCIAL_ORGANIZATION_VIEWS.includes(company.socialOrganizationView)
    ?company.socialOrganizationView
    :SOCIAL_ORGANIZATION_RULES.defaultOrganizationView;
  root.innerHTML=`
    <div class="social-view-tabs" role="tablist" aria-label="People and culture views">
      ${SOCIAL_ORGANIZATION_VIEWS.map(name=>`<button type="button" class="${view===name?"active":""}" data-social-view-button="${name}">${name.charAt(0).toUpperCase()+name.slice(1)}</button>`).join("")}
    </div>
    <div class="${view==="culture"?"":"social-view-hidden"}">${socialCulturePlayerHtml()}</div>
    <div class="${view==="groups"?"":"social-view-hidden"}">${socialGroupsPlayerHtml()}</div>
    <div class="${view==="network"?"":"social-view-hidden"}">${socialNetworkPlayerHtml()}</div>
    <div class="${view==="leadership"?"":"social-view-hidden"}">${socialLeadershipPlayerHtml()}</div>`;
  root.querySelectorAll("[data-social-view-button]").forEach(button=>button.onclick=()=>setSocialOrganizationView(button.dataset.socialViewButton));
}
function employeeSocialProfileHtml(employee){
  ensureSocialOrganizationalSystems();
  const memories=recallMostRelevant(employee.id,{limit:4});
  const groups=(company.informalGroups||[]).filter(group=>group.memberIds.includes(employee.id));
  const leadership=socialLeadershipState(employee,{create:false})||defaultSocialLeadershipState(employee),adaptation=employee.cultureAdaptation||{};
  const fit=SOCIAL_CULTURE_RULES.dimensions.reduce((sum,name)=>sum+(100-Math.abs((adaptation[name]||50)-(company.socialCulture.dimensions[name]?.value||50))),0)/SOCIAL_CULTURE_RULES.dimensions.length;
  return `<h3>Professional relationships</h3>
    <div class="detail-grid">
      <div><strong>Culture fit</strong><br>${fit>=78?"Comfortable with current norms":fit>=62?"Still adapting":"Feels out of step with some norms"}</div>
      <div><strong>Informal groups</strong><br>${groups.map(group=>socialEscapeHtml(group.identity)).join("<br>")||"No stable group yet"}</div>
      <div><strong>Workplace influence</strong><br>${leadership?.informalInfluence>=SOCIAL_LEADERSHIP_RULES.informalInfluenceThreshold?"People often look to this employee":leadership?.formalAuthority>=50?"Formal leadership responsibility":"Influence is still developing"}</div>
      <div><strong>Social memory</strong><br>${memories.length?`${memories.length} recent meaningful interaction(s)`:"No strong social memories yet"}</div>
    </div>`;
}
function socialOrganizationDebugHtml(employee=null){
  ensureSocialOrganizationalSystems();
  const audit=socialSystemsIntegrityAudit(),memoryCount=company.socialMemoryStore.records.length,unresolved=company.socialConflicts.filter(conflict=>conflict.status!=="resolved").length;
  const employeeMemories=employee?socialMemoryRecords(employee.id).slice(0,8):[];
  const memoryDebug=(company.socialMemoryDebug||[]).slice(0,5),conflictDebug=(company.socialConflictDebug||[]).slice(0,5);
  return `Schema ${SOCIAL_ORGANIZATION_RULES.schemaVersion}; memory records ${memoryCount}; compressed ${company.socialMemoryStore.compressedCount}; source events ${company.socialSourceEvents.length}<br>
    Conflicts ${company.socialConflicts.length}; unresolved ${unresolved}; conversations ${company.socialConversationState.history.length}; overheard knowledge ${Object.values(company.socialConversationState.knowledge).reduce((sum,list)=>sum+list.length,0)}<br>
    Culture evidence ${company.socialCulture.evidence.length}; groups ${company.informalGroups.length}; bridges ${company.socialBridges.length}; leadership profiles ${Object.keys(company.socialLeadership).length}<br>
    Audit ${audit.passed?"passed":"failed"}: ${audit.errors.join("; ")||"no integrity errors"}<br><br>
    ${employee?`Employee memories<br>${employeeMemories.map(memory=>`${memory.id}: ${memory.type} ${socialMemoryValenceScore(memory)>0?"+":socialMemoryValenceScore(memory)<0?"-":"0"} intensity ${memory.intensity}; confidence ${Math.round(memory.confidence)}; staleness ${memory.staleness}; source ${memory.sourceEventId}`).join("<br>")||"none"}<br><br>`:""}
    Recall traces<br>${memoryDebug.map(trace=>`${trace.status}: ${trace.memoryId||"no memory"} relevance ${trace.relevanceScore??"n/a"}; stress ${trace.appliedStressDelta??trace.stressDelta??0}; morale ${trace.appliedMoraleDelta??trace.moraleDelta??0}; cooldown ${trace.cooldownRemaining??0}`).join("<br>")||"none"}<br><br>
    Conflict and repair traces<br>${conflictDebug.map(trace=>`${trace.type}: ${trace.conflictId}; source ${trace.sourceEventId}; ${trace.accepted===undefined?"recorded":trace.accepted?"accepted":"not accepted"}`).join("<br>")||"none"}`;
}

function processSocialOrganizationDaily(){
  ensureSocialOrganizationalSystems();
  Object.values(company.socialRelationships||{}).forEach(record=>pruneSocialRelationshipCooldowns(record));
  ageAndCompressSocialMemories();
  enforceSocialMemoryBounds();
  pruneSocialSourceEvents();
  updateSocialCulture();
  const interval=SOCIAL_GROUP_RULES.updateIntervalDays;
  if(company.lastSocialGroupUpdateDay===undefined||company.day-company.lastSocialGroupUpdateDay>=interval){
    deriveInformalGroups();
    company.lastSocialGroupUpdateDay=company.day;
  }
  if(company.lastSocialLeadershipUpdateDay===undefined||company.day-company.lastSocialLeadershipUpdateDay>=SOCIAL_LEADERSHIP_RULES.updateIntervalDays){
    updateSocialLeadership();
    company.lastSocialLeadershipUpdateDay=company.day;
  }
  if(company.day%7===0){
    Object.values(company.socialRelationships||{}).forEach(record=>evaluateRelationshipInterpretation(record));
  }
  compactSocialRelationshipEvidenceWindows();
  pruneSocialSourceEvents();
  processVisibleConversationsMinute();
  company.lastSocialSystemsAudit=socialSystemsIntegrityAudit();
  return company.lastSocialSystemsAudit;
}
function socialSystemsIntegrityAudit(){
  if(!company)return {passed:false,errors:["company missing"]};
  ensureSocialOrganizationContainers();
  const errors=[],records=company.socialMemoryStore.records||[],sourceIds=new Set((company.socialSourceEvents||[]).map(event=>event.id));
  const activeCount=(employees||[]).filter(employee=>employee.active).length;
  const detailedLimit=Math.max(SOCIAL_ORGANIZATION_RULES.minimumDetailedRelationships,Math.ceil(activeCount*SOCIAL_ORGANIZATION_RULES.detailedRelationshipsPerEmployee/2));
  const unresolvedPairs=new Set((company.socialConflicts||[]).filter(conflict=>conflict.status!=="resolved").map(conflict=>makeRelationshipKey(conflict.actorId,conflict.subjectId)));
  const detailedRelationships=Object.entries(company.socialRelationships||{}).filter(([,record])=>
    (record.recentExperiences||[]).length||
    (record.recentInteractionTypes||[]).length||
    (record.reputationObservations||[]).length||
    Object.keys(record.cooldowns||{}).length
  );
  if(records.some(memory=>!memory.sourceEventId))errors.push("memory without source event id");
  if(records.some(memory=>!sourceIds.has(memory.sourceEventId)))errors.push("memory without retained source event");
  if((company.socialConflicts||[]).some(conflict=>!conflict.sourceEventId))errors.push("conflict without source event id");
  if(new Set(records.map(memory=>memory.id)).size!==records.length)errors.push("duplicate social memory id");
  if(records.length>SOCIAL_MEMORY_RULES.globalCap)errors.push("global memory cap exceeded");
  if(company.socialSourceEvents.length>SOCIAL_MEMORY_RULES.maxSourceEvents)errors.push("social source event cap exceeded");
  if(Object.values(company.socialRelationships||{}).some(record=>Object.keys(record.cooldowns||{}).length>SOCIAL_ORGANIZATION_RULES.maxRelationshipCooldowns))errors.push("relationship cooldown cap exceeded");
  if(detailedRelationships.filter(([key])=>!unresolvedPairs.has(key)).length>detailedLimit)errors.push("detailed relationship evidence window cap exceeded");
  const pairCounts={};
  records.forEach(memory=>{const key=relationshipMemorySummaryKey(memory.ownerId,memory.subjectId);pairCounts[key]=(pairCounts[key]||0)+1;});
  if(Object.values(pairCounts).some(count=>count>SOCIAL_MEMORY_RULES.perRelationshipCap))errors.push("relationship memory cap exceeded");
  const employeeCounts={};
  records.forEach(memory=>employeeCounts[memory.ownerId]=(employeeCounts[memory.ownerId]||0)+1);
  if(Object.values(employeeCounts).some(count=>count>SOCIAL_MEMORY_RULES.perEmployeeCap))errors.push("employee memory cap exceeded");
  const missingTemplateCategories=SOCIAL_CONVERSATION_RULES.categories.filter(category=>(SOCIAL_DIALOGUE_TEMPLATES[category]||[]).length<SOCIAL_CONVERSATION_RULES.templatesPerCategory||(SOCIAL_DIALOGUE_TEMPLATES[category]||[]).length>SOCIAL_CONVERSATION_RULES.maxTemplatesPerCategory);
  if(missingTemplateCategories.length)errors.push(`template coverage missing: ${missingTemplateCategories.join(", ")}`);
  if((company.socialConversationState.history||[]).some(conversation=>!sourceIds.has(conversation.sourceEventId)&&!records.some(memory=>memory.sourceEventId===conversation.sourceEventId)))errors.push("conversation lost source evidence");
  if((company.socialConversationState.history||[]).some(conversation=>conversation.privacy==="confidential"))errors.push("confidential conversation exposed");
  if((company.socialConversationState.history||[]).some(conversation=>(conversation.exchanges||[]).some(exchange=>/\{\w+\}/.test(exchange.text))))errors.push("conversation contains unresolved template data");
  if((company.socialConversationState.history||[]).some(conversation=>!SOCIAL_CONVERSATION_RULES.groundedTriggerTypes.includes(conversation.triggerType)))errors.push("conversation without grounded trigger");
  if((company.socialConversationState.history||[]).some(conversation=>(conversation.exchanges||[]).length<SOCIAL_CONVERSATION_RULES.minimumExchanges||(conversation.exchanges||[]).length>SOCIAL_CONVERSATION_RULES.maximumExchanges))errors.push("conversation exchange count out of bounds");
  if((company.socialConversationState.history||[]).some(conversation=>conversation.exchanges?.[0]?.intent!=="greeting"||conversation.exchanges?.at(-1)?.intent!=="goodbye"||!conversation.exchanges?.some(exchange=>exchange.intent==="reply")))errors.push("conversation flow is incomplete");
  if((company.socialConversationState.history||[]).some(conversation=>(conversation.exchangeSchedule||[]).length!==(conversation.exchanges||[]).length||!Number.isFinite(Number(conversation.resumeAt))))errors.push("conversation timing schedule missing");
  if(Object.values(company.socialConversationState.pairHistory||{}).some(history=>(history.recentTemplateIds||[]).length>SOCIAL_CONVERSATION_RULES.maxRecentPairTemplates||(history.recentTopics||[]).length>SOCIAL_CONVERSATION_RULES.maxRecentPairTopics))errors.push("conversation pair history cap exceeded");
  if(Object.values(company.socialConversationState.recentPartnersByEmployee||{}).some(partners=>partners.length>SOCIAL_CONVERSATION_RULES.maxRecentPartnersPerEmployee))errors.push("conversation partner history cap exceeded");
  const requiredGroupFields=["type","cohesion","stability","sharedHistoryScore","conflictScore","knowledgeFlowScore","formedAt","lastConfirmedAt","confidence","sourceEvidenceIds"];
  if((company.informalGroups||[]).some(group=>requiredGroupFields.some(field=>group[field]===undefined)))errors.push("informal group schema incomplete");
  if(Object.values(company.socialCulture.dimensions||{}).some(dimension=>!Number.isFinite(dimension.value)||dimension.value<0||dimension.value>100||dimension.confidence<0||dimension.confidence>100))errors.push("culture dimension out of bounds");
  if(Object.values(company.socialLeadership||{}).some(state=>["formalAuthority","credibility","consistency","coachingReputation","recognitionFairness","conflictHandling","communicationClarity","confidence"].some(field=>state[field]!==undefined&&(!Number.isFinite(Number(state[field]))||Number(state[field])<0||Number(state[field])>100))))errors.push("leadership dimension out of bounds");
  return {
    passed:errors.length===0,
    errors,
    memoryRecords:records.length,
    sourceEvents:company.socialSourceEvents.length,
    unresolvedConflicts:company.socialConflicts.filter(conflict=>conflict.status!=="resolved").length,
      groups:company.informalGroups.length,
      conversations:company.socialConversationState.history.length,
      detailedRelationships:detailedRelationships.length,
      checkedDay:company.day
  };
}

class SocialOrganizationSystem{
  ensure(options){return ensureSocialOrganizationalSystems(options);}
  recordSource(event){return registerSocialSourceEvent(event);}
  processExperience(payload){return processSocialExperience(payload);}
  daily(){return processSocialOrganizationDaily();}
  recallRecent(ownerId,subjectId,limit){return recallRecentMemories(ownerId,subjectId,limit);}
  recallRelevant(ownerId,options){return recallMostRelevant(ownerId,options);}
  relationshipSummary(ownerId,subjectId){return getRelationshipMemorySummary(ownerId,subjectId);}
  graph(){return buildSocialRelationshipGraph();}
  audit(){return socialSystemsIntegrityAudit();}
}
const socialOrganizationSystem=new SocialOrganizationSystem();
