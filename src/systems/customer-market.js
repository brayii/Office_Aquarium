const CUSTOMER_SEGMENT_DEFS={
  enterprise:{label:"Enterprise",weight:.30,contractValue:.0048,reliability:1.25,support:1.15,price:.75,roadmap:1.15,switching:68},
  smallBusiness:{label:"Small Business",weight:.26,contractValue:.0017,reliability:.82,support:1.05,price:1.35,roadmap:.78,switching:38},
  education:{label:"Education",weight:.14,contractValue:.0011,reliability:.86,support:.90,price:1.55,roadmap:1.05,switching:47},
  government:{label:"Government",weight:.12,contractValue:.0039,reliability:1.35,support:.95,price:.90,roadmap:1.10,switching:74},
  strategicPartners:{label:"Strategic Partners",weight:.18,contractValue:.0058,reliability:1.08,support:.85,price:.72,roadmap:1.30,switching:62}
};
function defaultCustomerSegmentState(id,count=0,sentiment=null){
  const d=CUSTOMER_SEGMENT_DEFS[id]||CUSTOMER_SEGMENT_DEFS.enterprise,base=Number.isFinite(sentiment)?sentiment:(company.customerSentiment??company.trust??55);
  return {activeCustomers:Math.max(0,Math.round(count)),prospects:Math.round(12+d.weight*55),sentiment:clamp(base,0,100),retentionOutlook:clamp(base+(d.switching-50)*.22,0,100),trust:clamp(company.trust??base,0,100),productFit:clamp(48+(company.integration||20)*.25+(company.quality||40)*.15,0,100),switchingCost:d.switching,priceSensitivity:Math.round(42+d.price*24),supportSatisfaction:clamp(base-2,0,100),reliabilitySatisfaction:clamp(company.quality??base,0,100),roadmapConfidence:clamp(company.trust??base,0,100),churnRisk:0,expansionPotential:0,contractValue:d.contractValue,productExposure:{},recentExperiences:[],currentIssues:[],lastUpdatedDay:company.day||0};
}
function ensureCustomerMarketSystems(){
  company.customerProductExposure=company.customerProductExposure&&typeof company.customerProductExposure==="object"?company.customerProductExposure:{};
  company.departmentCapabilities={customerSuccess:0,support:0,technicalSupport:0,onboardingSupport:0,accountManagement:0,...(company.departmentCapabilities||{})};
  company.customerExperiences=Array.isArray(company.customerExperiences)?company.customerExperiences:[];
  company.customerLearningEpisodes=Array.isArray(company.customerLearningEpisodes)?company.customerLearningEpisodes:[];
  company.nextCustomerExperienceId=Math.max(1,Number(company.nextCustomerExperienceId)||1);
  company.nextCustomerLearningEpisodeId=Math.max(1,Number(company.nextCustomerLearningEpisodeId)||1);
  company.lastCustomerUpdateDay=Number.isFinite(company.lastCustomerUpdateDay)?company.lastCustomerUpdateDay:-999;
  company.customerLocalResponses=Array.isArray(company.customerLocalResponses)?company.customerLocalResponses:[];
  company.customerMarketStats={acquired:0,renewed:0,expanded:0,churned:0,complaints:0,...(company.customerMarketStats||{})};
  company.customerSegments=company.customerSegments&&typeof company.customerSegments==="object"?company.customerSegments:{};
  const existingTotal=Object.values(company.customerSegments).reduce((s,x)=>s+(Number(x?.activeCustomers)||0),0);
  const legacyCustomers=Math.max(0,Math.round(company.customers||0));
  for(const id of Object.keys(CUSTOMER_SEGMENT_DEFS)){
    if(!company.customerSegments[id]){
      const share=existingTotal?0:legacyCustomers*(CUSTOMER_SEGMENT_DEFS[id].weight||.2);
      company.customerSegments[id]=defaultCustomerSegmentState(id,share,company.customerSentiment);
    }else{
      company.customerSegments[id]={...defaultCustomerSegmentState(id,0,company.customerSentiment),...company.customerSegments[id]};
      company.customerSegments[id].recentExperiences=Array.isArray(company.customerSegments[id].recentExperiences)?company.customerSegments[id].recentExperiences:[];
      company.customerSegments[id].currentIssues=Array.isArray(company.customerSegments[id].currentIssues)?company.customerSegments[id].currentIssues:[];
      company.customerSegments[id].productExposure=company.customerSegments[id].productExposure&&typeof company.customerSegments[id].productExposure==="object"?company.customerSegments[id].productExposure:{};
    }
    company.customerProductExposure[id]={...(company.customerProductExposure[id]||{}),...(company.customerSegments[id].productExposure||{})};
    company.customerSegments[id].productExposure=company.customerProductExposure[id];
  }
  syncCustomerSummaryFromSegments();
}
function syncCustomerSummaryFromSegments(){
  const segs=Object.values(company.customerSegments||{}),total=segs.reduce((s,x)=>s+(Number(x.activeCustomers)||0),0);
  company.customers=Math.max(0,Math.round(total));
  const weighted=segs.reduce((s,x)=>s+(Number(x.activeCustomers)||0)*((Number(x.sentiment)||50)*.72+(Number(x.trust)||50)*.28),0);
  company.customerSentiment=Math.round(clamp(total?weighted/Math.max(1,total):(company.customerSentiment??company.trust??50),0,100));
}
function updateRetentionOutlook(seg){
  seg.retentionOutlook=clamp((seg.sentiment||50)*.32+(seg.trust||50)*.18+(seg.switchingCost||50)*.24+(100-(seg.churnRisk||0))*.18+(seg.contractValue||0)*600,0,100);
  return seg.retentionOutlook;
}
function syncCustomerExposure(segmentId,projectId,exposure={}){
  if(!segmentId||!projectId)return null;
  ensureCustomerMarketSystems();
  const seg=company.customerSegments[segmentId];if(!seg)return null;
  const prev=seg.productExposure?.[projectId]||{};
  const rec={usageShare:clamp(Number(exposure.usageShare??prev.usageShare??.35),0,1),contractShare:clamp(Number(exposure.contractShare??prev.contractShare??.30),0,1),dependency:clamp(Number(exposure.dependency??prev.dependency??.45),0,1),publicVisibility:clamp(Number(exposure.publicVisibility??prev.publicVisibility??.35),0,1)};
  seg.productExposure={...(seg.productExposure||{}),[projectId]:rec};
  company.customerProductExposure[segmentId]={...(company.customerProductExposure[segmentId]||{}),[projectId]:rec};
  return rec;
}
function projectForCustomerSource(sourceId=""){
  return [...(company.projects||[]),...(company.projectArchive||[]),...(company.projectProposals||[])].find(p=>p.id===sourceId)||null;
}
function segmentProductExperience(seg){
  const entries=Object.entries(seg.productExposure||{});
  if(!entries.length)return null;
  let weight=0,quality=0,delivery=0,roadmap=0,support=0;
  for(const [projectId,exposure] of entries){
    const p=projectForCustomerSource(projectId);if(!p)continue;
    const w=clamp((exposure.usageShare||0)*.38+(exposure.contractShare||0)*.24+(exposure.dependency||0)*.24+(exposure.publicVisibility||0)*.14,0,1);
    weight+=w;
    quality+=w*Number(p.performance?.quality??p.quality??company.quality??50);
    delivery+=w*Number(p.performance?.executionHealth??p.performance?.staffingCoverage??projectVisibleHealth?.(p)??55);
    roadmap+=w*Number(p.performance?.strategicConfidence??p.visibleConfidence??50);
    support+=w*Number(p.performance?.riskTrend??p.visibleRisk??40);
  }
  if(weight<=0)return null;
  return {quality:quality/weight,delivery:delivery/weight,roadmap:roadmap/weight,supportLoad:support/weight,weight};
}
function updateDepartmentCapabilities(){
  ensureCustomerMarketSystems();
  const active=employees.filter(e=>e.active);
  const roleValue={ProductManager:{customerSuccess:6,accountManagement:4,onboardingSupport:2},SoftwareQAEngineer:{technicalSupport:4,support:2},TechnicalLead:{technicalSupport:3},SoftwareEngineer:{technicalSupport:2},FirmwareEngineer:{technicalSupport:2},FinanceAnalyst:{accountManagement:1}};
  const caps={customerSuccess:0,support:0,technicalSupport:0,onboardingSupport:0,accountManagement:0};
  active.forEach(e=>{
    const key=canonicalRole(String(e.role||"")).replace(/\s+/g,"");
    const v=roleValue[key]||{};
    Object.keys(caps).forEach(k=>caps[k]+=Number(v[k])||0);
  });
  company.departmentCapabilities=Object.fromEntries(Object.entries(caps).map(([k,v])=>[k,Math.round(clamp(v+(company.culture?.communication||50)*.08-avgStress()*.04,0,100))]));
  return company.departmentCapabilities;
}
function customerSupportCapacity(){
  const c=updateDepartmentCapabilities();
  return clamp(34+(c.customerSuccess||0)*1.6+(c.support||0)*1.3+(c.technicalSupport||0)*.95+(c.onboardingSupport||0)*.75+(c.accountManagement||0)*.7,0,100);
}
function customerSegmentScore(seg,type){
  const unresolved=(seg.currentIssues||[]).filter(i=>!i.resolved).reduce((s,i)=>s+(i.severity||0),0)/Math.max(1,(seg.currentIssues||[]).length||1);
  const competitor=company.market?.competitorHeat||50,pricePressure=(company.worldState?.customerBudgetClimate<42?58:38)+(seg.priceSensitivity||50)*.15;
  const retention=Number.isFinite(seg.retentionOutlook)?seg.retentionOutlook:updateRetentionOutlook(seg);
  const quality=(seg.reliabilitySatisfaction||50)*.35+(seg.supportSatisfaction||50)*.25+(seg.productFit||50)*.20+(seg.roadmapConfidence||50)*.20;
  if(type==="adopt")return quality+(company.market?.hardwareDemand||50)*.18+(company.market?.aiDemand||50)*.16-(competitor-50)*.22-pricePressure*.16;
  if(type==="renew")return quality*.72+retention*.38-unresolved*.35-pricePressure*.13;
  if(type==="expand")return quality+(seg.expansionPotential||0)*.35+(company.trust||50)*.12-unresolved*.30;
  if(type==="leave")return unresolved*.55+competitor*.20+pricePressure*.25-(retention||50)*.36-(seg.trust||50)*.12;
  return quality-unresolved*.25;
}
function customerSegmentUtilities(seg){
  const adopt=customerSegmentScore(seg,"adopt"),renew=customerSegmentScore(seg,"renew"),expand=customerSegmentScore(seg,"expand"),leave=customerSegmentScore(seg,"leave");
  const unresolved=(seg.currentIssues||[]).filter(i=>!i.resolved).reduce((s,i)=>s+(i.severity||0),0)/Math.max(1,(seg.currentIssues||[]).length||1);
  return {
    adopt:Math.round(adopt),
    renew:Math.round(renew),
    expand:Math.round(expand),
    wait:Math.round(clamp(62-adopt*.25+(company.market?.competitorHeat||50)*.10+(seg.switchingCost||50)*.16,0,100)),
    reduceUsage:Math.round(clamp(leave*.55+unresolved*.20-(seg.switchingCost||50)*.10,0,100)),
    complain:Math.round(clamp(unresolved*.58+(100-(seg.supportSatisfaction||50))*.20+(100-(seg.reliabilitySatisfaction||50))*.15,0,100)),
    leave:Math.round(leave)
  };
}
function recordCustomerExperience(segmentId,type,severity,description,sourceId="",isPublic=false){
  ensureCustomerMarketSystems();
  const seg=company.customerSegments[segmentId]||company.customerSegments.enterprise;
  const project=projectForCustomerSource(sourceId);
  const exposure=project?syncCustomerExposure(segmentId,project.id):null;
  const rec={id:company.nextCustomerExperienceId++,day:company.day,segmentId,type,severity:Math.round(clamp(severity,0,100)),sourceId,projectId:project?.id||null,productExposureWeight:exposure?Number(((exposure.usageShare+exposure.contractShare+exposure.dependency+exposure.publicVisibility)/4).toFixed(2)):0,public:!!isPublic,description,resolved:false,resolutionDay:null};
  company.customerExperiences.unshift(rec);
  company.customerExperiences=company.customerExperiences.slice(0,220);
  seg.recentExperiences=[rec,...(seg.recentExperiences||[])].slice(0,8);
  if(severity>=55)seg.currentIssues=[rec,...(seg.currentIssues||[])].slice(0,6);
  updateRetentionOutlook(seg);
  return rec;
}
function addCustomersToSegment(segmentId,count,reason="customer acquisition",sourceId=""){
  ensureCustomerMarketSystems();
  const seg=company.customerSegments[segmentId]||company.customerSegments.enterprise;
  const n=Math.max(0,Math.round(count));
  if(!n)return;
  const project=projectForCustomerSource(sourceId);
  if(project)syncCustomerExposure(segmentId,project.id,{usageShare:clamp(.18+n*.015,0,1),contractShare:clamp(.14+n*.012,0,1),dependency:String(project.family||"").includes("legacy")?0.55:0.42,publicVisibility:.52});
  seg.activeCustomers=Math.max(0,Math.round((seg.activeCustomers||0)+n));
  seg.prospects=Math.max(0,Math.round((seg.prospects||0)-Math.min(n,seg.prospects||0)));
  seg.trust=clamp((seg.trust||50)+Math.min(5,n*.18),0,100);
  seg.sentiment=clamp((seg.sentiment||50)+Math.min(3,n*.12),0,100);
  company.customerMarketStats.acquired=(company.customerMarketStats.acquired||0)+n;
  recordCustomerExperience(segmentId,"successful-launch",38,`${CUSTOMER_SEGMENT_DEFS[segmentId]?.label||"Customer"} adoption increased after ${reason}.`,sourceId,true);
  syncCustomerSummaryFromSegments();
}
function applyCustomerDelta(delta,reason="CEO decision",sourceId="decision"){
  ensureCustomerMarketSystems();
  const n=Math.round(Number(delta)||0);
  if(!n)return;
  const ids=Object.keys(CUSTOMER_SEGMENT_DEFS);
  if(n>0){
    const ranked=ids.map(id=>({id,score:customerSegmentScore(company.customerSegments[id],"adopt")})).sort((a,b)=>b.score-a.score);
    let remain=n;
    ranked.forEach((r,i)=>{const add=i===ranked.length-1?remain:Math.max(0,Math.round(n*(CUSTOMER_SEGMENT_DEFS[r.id].weight||.2)));remain-=add;addCustomersToSegment(r.id,add,reason,sourceId);});
  }else{
    let loss=Math.abs(n);
    ids.map(id=>({id,score:customerSegmentScore(company.customerSegments[id],"leave")})).sort((a,b)=>b.score-a.score).forEach(r=>{const seg=company.customerSegments[r.id],take=Math.min(loss,Math.max(0,Math.round(seg.activeCustomers||0)));if(take>0){seg.activeCustomers-=take;recordCustomerExperience(r.id,"public-communication",55,`${CUSTOMER_SEGMENT_DEFS[r.id]?.label||"Customer"} accounts reduced usage after ${reason}.`,sourceId,true);loss-=take;}});
    syncCustomerSummaryFromSegments();
  }
}

function calculateCustomerRevenueDaily(){
  ensureCustomerMarketSystems();
  return Number(Object.entries(company.customerSegments||{}).reduce((sum,[id,seg])=>{
    updateRetentionOutlook(seg);
    const use=clamp((seg.sentiment||50)*.005+(seg.trust||50)*.003+(seg.retentionOutlook||50)*.003,.45,1.35);
    const reliability=clamp((seg.reliabilitySatisfaction||50)/70,.55,1.25);
    return sum+(seg.activeCustomers||0)*(seg.contractValue||CUSTOMER_SEGMENT_DEFS[id]?.contractValue||.002)*use*reliability;
  },0).toFixed(4));
}
function processCustomerLocalResponses(){
  ensureCustomerMarketSystems();
  const supportCapacity=customerSupportCapacity();
  for(const [id,seg] of Object.entries(company.customerSegments||{})){
    const label=CUSTOMER_SEGMENT_DEFS[id]?.label||"Customer";
    const issues=(seg.currentIssues||[]).filter(i=>!i.resolved);
    if(!issues.length)continue;
    for(const issue of issues.slice(0,2)){
      const age=company.day-(issue.day||company.day);
      const resolveChance=clamp((supportCapacity-(issue.severity||50))*0.012+age*.018+((seg.trust||50)-45)*.002,0.04,0.72);
      if(simulationRandom()<resolveChance){
        issue.resolved=true;issue.resolutionDay=company.day;
        const master=(company.customerExperiences||[]).find(e=>e.id===issue.id);
        if(master){master.resolved=true;master.resolutionDay=company.day;}
        seg.supportSatisfaction=clamp((seg.supportSatisfaction||50)+Math.max(1,8-(issue.severity||50)/14),0,100);
        seg.sentiment=clamp((seg.sentiment||50)+Math.max(.4,5-(issue.severity||50)/18),0,100);
        seg.churnRisk=clamp((seg.churnRisk||0)-Math.max(2,10-(issue.severity||50)/10),0,100);
        updateRetentionOutlook(seg);
        company.customerLocalResponses.unshift({day:company.day,segmentId:id,type:"resolved",interventionType:"temporary-support-coverage",source:"customer-local-response",issueType:issue.type,severity:issue.severity,description:`${label} ${issue.type} handled locally by customer-facing teams.`});
      }else if(age>=7&&issue.severity>=62&&simulationRandom()<0.18){
        seg.churnRisk=clamp((seg.churnRisk||0)+2.5,0,100);
        seg.sentiment=clamp((seg.sentiment||50)-1.2,0,100);
        company.customerLocalResponses.unshift({day:company.day,segmentId:id,type:"still-open",issueType:issue.type,severity:issue.severity,description:`${label} ${issue.type} remained open after local response.`});
      }
    }
    seg.currentIssues=(seg.currentIssues||[]).filter(i=>!i.resolved&&company.day-(i.day||0)<35).slice(0,6);
  }
  company.customerLocalResponses=company.customerLocalResponses.slice(0,80);
}
function updateCustomerMarketDaily(){
  ensureCustomerMarketSystems();
  const publicQuality=clamp((company.quality||50)*.45+(company.trust||50)*.25+(company.manufacturing?.yield||50)*.15+(company.integration||50)*.15,0,100);
  const supportCapacity=customerSupportCapacity();
  const delivery=clamp((company.manufacturing?.readiness||50)*.35+(company.manufacturing?.capacity||50)*.25+(100-(company.manufacturing?.supplyRisk||40))*.25+(company.phase==="launched"?8:0),0,100);
  for(const [id,seg] of Object.entries(company.customerSegments)){
    const d=CUSTOMER_SEGMENT_DEFS[id]||CUSTOMER_SEGMENT_DEFS.enterprise;
    const productExperience=segmentProductExperience(seg);
    const segmentQuality=productExperience?productExperience.quality:publicQuality;
    const segmentDelivery=productExperience?productExperience.delivery:delivery;
    const segmentRoadmap=productExperience?productExperience.roadmap:((company.trust||50)*.55+(company.integration||50)*.25+(company.marketConfidence||50)*.20);
    const segmentSupportDrag=productExperience?Math.max(0,(productExperience.supportLoad||0)-55)*.08:0;
    const experience=clamp(segmentQuality*d.reliability*.40+supportCapacity*d.support*.24+segmentDelivery*.18+(company.trust||50)*.18-(company.market?.competitorHeat||50)*.10-segmentSupportDrag,0,100);
    seg.reliabilitySatisfaction=clamp((seg.reliabilitySatisfaction||50)*.90+segmentQuality*.10,0,100);
    seg.supportSatisfaction=clamp((seg.supportSatisfaction||50)*.88+supportCapacity*.12,0,100);
    seg.roadmapConfidence=clamp((seg.roadmapConfidence||50)*.91+segmentRoadmap*.09,0,100);
    seg.productFit=clamp((seg.productFit||50)*.92+((company.market?.aiDemand||50)*.28+(company.market?.hardwareDemand||50)*.28+(company.software||50)*.20+(company.chip||50)*.24)*.08,0,100);
    seg.sentiment=clamp((seg.sentiment||50)*.90+experience*.10,0,100);
    seg.trust=clamp((seg.trust||50)*.94+((company.trust||50)*.6+experience*.4)*.06,0,100);
    updateRetentionOutlook(seg);
    const leave=customerSegmentScore(seg,"leave"),adopt=customerSegmentScore(seg,"adopt"),expand=customerSegmentScore(seg,"expand");
    seg.churnRisk=clamp(seg.churnRisk*.82+Math.max(0,leave-52)*.18,0,100);
    seg.expansionPotential=clamp(seg.expansionPotential*.84+Math.max(0,expand-58)*.16,0,100);
    if(company.phase==="launched"&&company.day%7===0){
      const gained=Math.max(0,Math.round((adopt-54)/20+(seg.prospects||0)*.015*clamp(adopt/70,.2,1.4)));
      if(gained>0)addCustomersToSegment(id,gained,"market adoption",`customer-${company.day}`);
      const churn=Math.max(0,Math.round((seg.activeCustomers||0)*clamp((seg.churnRisk-62)/900,0,.035)));
      if(churn>0){seg.activeCustomers=Math.max(0,(seg.activeCustomers||0)-churn);company.customerMarketStats.churned=(company.customerMarketStats.churned||0)+churn;recordCustomerExperience(id,"quality-defect",66,`${d.label} churn increased after unresolved customer pressure.`,`churn-${company.day}`,true);}
      const renew=customerSegmentScore(seg,"renew");
      if((seg.activeCustomers||0)>0&&company.day%30===0){
        if(renew>=60){company.customerMarketStats.renewed=(company.customerMarketStats.renewed||0)+Math.max(1,Math.round((seg.activeCustomers||0)*.08));seg.churnRisk=clamp((seg.churnRisk||0)-4,0,100);recordCustomerExperience(id,"rapid-resolution",24,`${d.label} renewals held after continued customer success coverage.`,`renewal-${company.day}`,false);}
        else if(renew<46){seg.churnRisk=clamp((seg.churnRisk||0)+5,0,100);recordCustomerExperience(id,"support-delay",58,`${d.label} renewal confidence softened after unresolved operating concerns.`,`renewal-risk-${company.day}`,false);}
      }
      if((seg.activeCustomers||0)>0&&company.day%14===0&&expand>66){
        const lift=clamp((expand-62)/1200,0,.018);
        seg.contractValue=Number(clamp((seg.contractValue||d.contractValue)*(1+lift),.0006,.012).toFixed(5));
        seg.expansionPotential=clamp((seg.expansionPotential||0)-8,0,100);
        company.customerMarketStats.expanded=(company.customerMarketStats.expanded||0)+Math.max(1,Math.round((seg.activeCustomers||0)*.04));
        recordCustomerExperience(id,"successful-launch",28,`${d.label} accounts expanded usage after stronger product fit.`,`expansion-${company.day}`,false);
      }
    }else if((company.phase==="pilot"||company.phase==="customer trial")&&company.day%9===0&&adopt>62){
      addCustomersToSegment(id,1,"pilot learning",`pilot-${company.day}`);
    }
    const utilities=customerSegmentUtilities(seg);
    if(utilities.complain>66&&company.day%11===0){
      company.customerMarketStats.complaints=(company.customerMarketStats.complaints||0)+1;
      recordCustomerExperience(id,"support-delay",Math.round(clamp(utilities.complain,45,82)),`${d.label} customers complained about unresolved service or reliability friction.`,`complaint-${company.day}`,false);
    }
    seg.lastUpdatedDay=company.day;
    seg.currentIssues=(seg.currentIssues||[]).filter(i=>!i.resolved&&company.day-(i.day||0)<35).slice(0,6);
  }
  processCustomerLocalResponses();
  syncCustomerSummaryFromSegments();
  maybeCreateCustomerLearningEpisode();
  reviewCustomerLearningEpisodes();
  maybeQueueCustomerStrategicMemo();
}
function maybeCreateCustomerLearningEpisode(){
  ensureCustomerMarketSystems();
  if(company.day<8||company.day%14!==0)return;
  const risk=Object.entries(company.customerSegments).sort((a,b)=>(b[1].churnRisk||0)-(a[1].churnRisk||0))[0];
  if(!risk||risk[1].churnRisk<55)return;
  const key=`customer-${risk[0]}-${Math.floor(company.day/30)}`;
  if(company.customerLearningEpisodes.some(e=>e.key===key))return;
  const comparisonSegments=Object.keys(company.customerSegments||{}).filter(id=>id!==risk[0]).slice(0,3);
  const recentIds=(risk[1].recentExperiences||[]).slice(0,4).map(e=>e.id);
  company.customerLearningEpisodes.push({id:company.nextCustomerLearningEpisodeId++,key,type:"segment-risk",interventionType:"temporary-support-coverage",interventionSource:"customer-success-local",startedDay:company.day,affectedSegments:[risk[0]],affectedProjects:Object.keys(risk[1].productExposure||{}),comparisonSegments,customerExperienceIds:recentIds,baseline:{sentiment:risk[1].sentiment,retentionOutlook:risk[1].retentionOutlook,customers:risk[1].activeCustomers,churnRisk:risk[1].churnRisk,comparisons:Object.fromEntries(comparisonSegments.map(id=>[id,{sentiment:company.customerSegments[id]?.sentiment||50,retentionOutlook:company.customerSegments[id]?.retentionOutlook||50,customers:company.customerSegments[id]?.activeCustomers||0,churnRisk:company.customerSegments[id]?.churnRisk||0}]))},baselineSentiment:risk[1].sentiment,baselineCustomers:risk[1].activeCustomers,actions:["temporary-support-coverage"],reviewDays:[company.day+7,company.day+21,company.day+45],reviewWindows:["short","medium","long"],observations:[],outcomes:[],attributionQuality:0,status:"open"});
}
function reviewCustomerLearningEpisodes(){
  ensureCustomerMarketSystems();
  company.customerLearningEpisodes.forEach(ep=>{
    if(ep.status==="resolved")return;
    (ep.reviewDays||[]).filter(day=>day<=company.day&&!ep.observations.some(o=>o.reviewDay===day)).forEach(day=>{
      const seg=company.customerSegments[ep.affectedSegments?.[0]],base=ep.baseline||{},sentimentDelta=(seg?.sentiment||0)-(base.sentiment??ep.baselineSentiment??0),customerDelta=(seg?.activeCustomers||0)-(base.customers??ep.baselineCustomers??0);
      const comparisonDelta=(ep.comparisonSegments||[]).reduce((s,id)=>s+((company.customerSegments[id]?.sentiment||50)-(base.comparisons?.[id]?.sentiment||50)),0)/Math.max(1,(ep.comparisonSegments||[]).length);
      const attributableDelta=sentimentDelta-comparisonDelta;
      const window=(ep.reviewWindows||[])[ep.observations.length]||"review";
      ep.observations.push({reviewDay:day,window,sentimentDelta:Number(sentimentDelta.toFixed(1)),comparisonDelta:Number(comparisonDelta.toFixed(1)),attributableDelta:Number(attributableDelta.toFixed(1)),customerDelta});
      if(window!=="short"&&(Math.abs(attributableDelta)>=5||Math.abs(customerDelta)>=3)){
        const positive=sentimentDelta>=0&&customerDelta>=0;
        ep.outcomes=[...(ep.outcomes||[]),positive?"recovered":"not-recovered"];ep.attributionQuality=window==="long"?76:64;
        createOrReinforceLesson({key:`customer.${ep.interventionType}-${positive?"retention":"churn"}-${ep.affectedSegments?.[0]}`,title:positive?"Customer recovery can protect retention when the intervention matches the issue.":"Unresolved customer pressure can turn into churn.",department:"product",vector:{customerValidation:positive?0.5:-0.35,planning:0.35,escalation:positive?0.2:0.55},outcome:positive?"positive":"negative",confidence:65,evidence:`${CUSTOMER_SEGMENT_DEFS[ep.affectedSegments?.[0]]?.label||"Customer"} ${ep.interventionType} episode reviewed against comparison segments`,importance:4,episodeKey:`customer-episode-${ep.id}`,attributionQuality:window==="long"?76:64,reviewWindow:window});
        if(window==="long")ep.status="resolved";
      }
    });
    if(company.day-(ep.startedDay||company.day)>50)ep.status="resolved";
  });
}
function customerMarketDebugHtml(){
  ensureCustomerMarketSystems();
  const segments=Object.entries(company.customerSegments).map(([id,s])=>{
    const u=customerSegmentUtilities(s);
    return `${CUSTOMER_SEGMENT_DEFS[id]?.label||id}: customers ${Math.round(s.activeCustomers||0)}, prospects ${Math.round(s.prospects||0)}, sentiment ${Math.round(s.sentiment||0)}, retention outlook ${Math.round(s.retentionOutlook||0)}, churn risk ${Math.round(s.churnRisk||0)}, expansion ${Math.round(s.expansionPotential||0)}<br>Exposure: ${Object.keys(s.productExposure||{}).join(", ")||"none"}<br>Utility adopt ${u.adopt}, renew ${u.renew}, expand ${u.expand}, wait ${u.wait}, reduce ${u.reduceUsage}, complain ${u.complain}, leave ${u.leave}<br>Recent: ${(s.recentExperiences||[]).slice(0,2).map(e=>e.type+" "+e.severity+(e.resolved?" resolved":"")).join(", ")||"none"}`;
  }).join("<hr>");
  const responses=(company.customerLocalResponses||[]).slice(0,4).map(r=>`Day ${r.day}: ${r.description}`).join("<br>")||"none";
  const episodes=(company.customerLearningEpisodes||[]).slice(0,4).map(e=>`${e.key||e.id}: ${e.status}, observations ${(e.observations||[]).length}`).join("<br>")||"none";
  const stats=company.customerMarketStats||{};
  const caps=company.departmentCapabilities||{};
  return `${segments}<br>Department capabilities: Customer Success ${caps.customerSuccess||0}, Support ${caps.support||0}, Technical Support ${caps.technicalSupport||0}, Onboarding ${caps.onboardingSupport||0}, Account Management ${caps.accountManagement||0}<br>Local responses<br>${responses}<br>Market actions acquired ${stats.acquired||0}, renewed ${stats.renewed||0}, expanded ${stats.expanded||0}, churned ${stats.churned||0}, complaints ${stats.complaints||0}.<br>Learning episodes ${(company.customerLearningEpisodes||[]).length}; experiences ${(company.customerExperiences||[]).length}; daily segment revenue $${calculateCustomerRevenueDaily().toFixed(3)}M.<br>Episode detail<br>${episodes}`;
}
function customerStrategicPressure(){
  ensureCustomerMarketSystems();
  const segs=Object.entries(company.customerSegments),risk=segs.map(([id,s])=>({id,seg:s,score:(s.churnRisk||0)+(100-(s.sentiment||50))*.35+(s.currentIssues||[]).filter(i=>!i.resolved).length*8})).sort((a,b)=>b.score-a.score)[0];
  const supportBacklog=(company.customerExperiences||[]).filter(e=>!e.resolved&&company.day-(e.day||0)<=21&&["support-delay","quality-defect","delivery-delay","roadmap-slip"].includes(e.type)).length;
  const concentration=company.customers?Math.max(0,...segs.map(([,s])=>(s.activeCustomers||0)/Math.max(1,company.customers)*100)):0;
  return {riskSegment:risk,score:Math.round(Math.max(risk?.score||0,supportBacklog*13,concentration>62?concentration:0)),supportBacklog,concentration:Math.round(concentration)};
}
function makeCustomerStrategicMemo(){
  ensureCustomerMarketSystems();
  const p=customerStrategicPressure(),id=p.riskSegment?.id||"enterprise",seg=company.customerSegments[id],label=CUSTOMER_SEGMENT_DEFS[id]?.label||"Customer",issues=(seg.currentIssues||[]).filter(i=>!i.resolved).slice(0,3);
  const urgency=p.score>82?"Urgent":p.score>68?"High":"Normal",deadline=company.day+(urgency==="Urgent"?5:urgency==="High"?9:14);
  const sentimentText=qualitativeBand(seg.sentiment||50,{low:45,high:70,lowText:"weak",midText:"mixed",highText:"healthy"}),churnText=qualitativeBand(seg.churnRisk||0,{low:35,high:65,lowText:"contained",midText:"material",highText:"high"});
  return {id:`customer-strategy-${id}-${Math.floor(company.day/14)}`,repeatable:false,category:"customer",customerSegmentId:id,title:`Customer strategy review: ${label}`,copy:`Customer-facing teams have handled ${label.toLowerCase()} pressure locally, but the issue now affects retention, support capacity, or roadmap commitments.`,generatedCommunication:{type:"Executive Email",priority:urgency,sender:{name:"Customer Success Council",role:"VP Customer Success"},subject:`${label} customer risk needs a strategic decision`,message:`Customer Success is asking for direction because ${label.toLowerCase()} customers are showing pressure that local teams can no longer absorb alone. Sentiment is ${sentimentText}, churn risk is ${churnText}, and the decision now requires a product, support, pricing, or roadmap trade-off.`,relatedCustomerSegment:label,decisionDeadlineDay:deadline,reasonForEscalation:"Customer Success cannot resolve this without a product, support, pricing, or roadmap trade-off.",recs:[["Customer Success","Protect at-risk renewals with a limited recovery plan",76],["Product","Avoid broad promises until the roadmap evidence is stronger",68],["Finance","Keep concessions tied to retention value",64],["Board","Preserve trust without creating an open-ended commitment",66]],impacts:[`${label} customer base: ${Math.round(seg.activeCustomers||0)} active`,`${label} sentiment is ${sentimentText}; churn risk is ${churnText}`,`Open customer issues: ${issues.length||p.supportBacklog}`,`Decision needed by Day ${deadline+1}`]},choices:[{title:"Approve customer recovery plan",detail:"Give Customer Success and Product authority to protect renewals with bounded commitments.",effect:{cash:-.55,trust:2,board:1},directive:"quality",days:8,strategy:"customer-retention",customerStrategy:{segmentId:id,mode:"recovery"},benefits:["protects renewals and customer trust","keeps commitments bounded"],risks:["uses support capacity and may slow new work"],uncertainty:"Material",estimatedConfidence:68},{title:"Fund temporary support capacity",detail:"Add temporary support and reliability work before making roadmap promises.",effect:{cash:-.85,quality:2,trust:1},directive:"people",days:10,strategy:"support-capacity",customerStrategy:{segmentId:id,mode:"support"},benefits:["reduces support backlog and defect frustration","protects customer sentiment"],risks:["costs runway before revenue impact is certain"],uncertainty:"Material",estimatedConfidence:64},{title:"Hold the current roadmap",detail:"Decline special commitments and accept possible churn to protect product focus.",effect:{cash:.15,board:1,trust:-1},directive:"quality",days:6,strategy:"focus",customerStrategy:{segmentId:id,mode:"hold"},benefits:["protects focus and avoids overpromising"],risks:["at-risk customers may reduce usage or leave"],uncertainty:"High",estimatedConfidence:50}]};
}
function maybeQueueCustomerStrategicMemo(){
  ensureCustomerMarketSystems();
  if(company.pendingEvent||company.day<12)return;
  const pressure=customerStrategicPressure();
  if(pressure.score<66)return;
  const key=`customer|${pressure.riskSegment?.id||"market"}|${Math.floor(company.day/14)}`;
  company.messageFingerprints=company.messageFingerprints&&typeof company.messageFingerprints==="object"?company.messageFingerprints:{};
  if(company.messageFingerprints[key]&&company.day-company.messageFingerprints[key].day<14)return;
  if((company.escalationQueue||[]).some(ev=>ev.category==="customer"&&ev.customerSegmentId===(pressure.riskSegment?.id)))return;
  company.messageFingerprints[key]={day:company.day,status:"queued"};
  company.escalationQueue=Array.isArray(company.escalationQueue)?company.escalationQueue:[];
  company.escalationQueue.push(makeCustomerStrategicMemo());
}
function applyCustomerStrategyDecision(strategy){
  if(!strategy)return;
  ensureCustomerMarketSystems();
  const seg=company.customerSegments[strategy.segmentId]||company.customerSegments.enterprise,label=CUSTOMER_SEGMENT_DEFS[strategy.segmentId]?.label||"Customer";
  const learningBaseline=typeof companyLearningBaseline==="function"?companyLearningBaseline():null;
  const interventionType=strategy.mode==="support"?"support-staffing":strategy.mode==="recovery"?"account-outreach":"roadmap-communication";
  if(strategy.mode==="recovery"){recordCustomerExperience(strategy.segmentId,"rapid-resolution",35,`${label} customers received a bounded recovery commitment.`,"ceo-customer",true);const target=company.customerSegments[strategy.segmentId]||seg;target.sentiment=clamp((target.sentiment||50)+6,0,100);target.trust=clamp((target.trust||50)+5,0,100);target.churnRisk=clamp((target.churnRisk||0)-14,0,100);updateRetentionOutlook(target);}
  else if(strategy.mode==="support"){recordCustomerExperience(strategy.segmentId,"rapid-resolution",30,`${label} support capacity improved after CEO approval.`,"ceo-support",false);const target=company.customerSegments[strategy.segmentId]||seg;target.supportSatisfaction=clamp((target.supportSatisfaction||50)+8,0,100);target.churnRisk=clamp((target.churnRisk||0)-9,0,100);updateRetentionOutlook(target);}
  else if(strategy.mode==="hold"){recordCustomerExperience(strategy.segmentId,"roadmap-slip",58,`${label} customers saw leadership hold the roadmap line instead of making special commitments.`,"ceo-focus",true);const target=company.customerSegments[strategy.segmentId]||seg;target.roadmapConfidence=clamp((target.roadmapConfidence||50)-4,0,100);target.churnRisk=clamp((target.churnRisk||0)+7,0,100);updateRetentionOutlook(target);}
  createLearningEpisode({domain:"customer",sourceId:`customer-strategy-${strategy.segmentId}`,decisionTitle:"Customer strategy",choiceTitle:strategy.mode,strategy:strategy.mode,department:"product",customerSegmentIds:[strategy.segmentId],interventionType,baseline:learningBaseline,reviewSchedule:[company.day+7,company.day+21,company.day+45],hypotheses:[{strategy:strategy.mode,expected:"Customer outcome will be reviewed after support, renewal, and sentiment changes appear."}]});
  syncCustomerSummaryFromSegments();
}
function makeProjectCommercializationEvent(project){
  updateProjectCommercialStats(project);
  const readiness=Math.round(project.commercialReadiness||0),potential=Math.round(project.commercialPotential||0),interest=Math.round(project.performance?.customerInterest??project.customerInterest??0);
  return {
    id:`commercialize-${project.id}-${company.day}`,
    repeatable:false,
    category:"commercialization",
    commercialProjectId:project.id,
    title:`Commercial review: ${project.title}`,
    copy:`${project.title} is complete and has enough customer signal to require a commercialization decision.`,
    generatedCommunication:{
      type:"Product Commercialization Memo",
      priority:"Decision Needed",
      sender:{name:"Product Council",role:"Product and Revenue Review"},
      subject:`Commercial path for ${project.title}`,
      message:`${project.title} is complete and now needs a commercial path. Product sees ${qualitativeBand(interest,{low:40,high:70,lowText:"limited",midText:"credible",highText:"strong"})} customer interest and ${qualitativeBand(readiness,{low:45,high:70,lowText:"early",midText:"workable",highText:"strong"})} commercial readiness. If the launch path works, the project could contribute about $${Number(project.projectedDailyRevenue||0).toFixed(3)}M per day. The CEO needs to decide whether to launch it, pilot it with limited exposure, or shelve it for now.`,
      recs:[["Product",potential>=72?"Launch commercially":"Run a limited pilot",potential],["Engineering",readiness>=70?"Commercial exposure is supportable":"Pilot before broad launch",readiness],["Finance",(project.projectedDailyRevenue||0)>.08?"Revenue upside is material":"Keep spend bounded",Math.round(clamp((project.projectedDailyRevenue||0)*600,35,88))]],
      impacts:[`Project complete: ${project.title}`,`Customer interest ${interest}; readiness ${readiness}; commercial potential ${potential}`,`Projected daily revenue if launched: $${Number(project.projectedDailyRevenue||0).toFixed(3)}M`]
    },
    choices:[
      {title:"Launch commercially",detail:"Convert the completed project into a customer-facing offer and accept support risk.",effect:{board:2,trust:readiness>=65?2:-1},directive:"revenue",days:8,strategy:"revenue",commercializeProject:{id:project.id,mode:"launch"},benefits:["can create customers and daily revenue","turns completed work into market proof"],risks:["customer trust may suffer if readiness is overstated","support costs may rise"],uncertainty:"Material",estimatedConfidence:clamp((potential+readiness)/2,35,86)},
      {title:"Run a limited pilot",detail:"Expose the project to a smaller customer group before full commercialization.",effect:{trust:2,quality:1},directive:"quality",days:8,strategy:"pilot",commercializeProject:{id:project.id,mode:"pilot"},benefits:["creates market learning with less exposure","can still add early customers"],risks:["revenue arrives more slowly","competitors may move while the company learns"],uncertainty:"Material",estimatedConfidence:clamp(readiness*.55+potential*.35,35,88)},
      {title:"Shelve for now",detail:"Keep the completed work internal until the company has stronger evidence or capacity.",effect:{cash:.1,board:readiness<50?1:-1},directive:null,days:0,strategy:"cost-control",commercializeProject:{id:project.id,mode:"shelve"},benefits:["protects focus and support capacity","avoids premature exposure"],risks:["completed work may lose market timing","employees may see the project as wasted effort"],uncertainty:"Moderate",estimatedConfidence:clamp(100-Math.max(potential,readiness)*.45,32,76)}
    ]
  };
}
function maybeQueueProjectCommercialization(){
  ensureProjectPortfolio();
  if(company.pendingEvent)return;
  company.escalationQueue=Array.isArray(company.escalationQueue)?company.escalationQueue:[];
  const alreadyQueued=new Set(company.escalationQueue.map(ev=>ev.commercialProjectId).filter(Boolean));
  const candidate=(company.projectArchive||[]).find(p=>{
    updateProjectCommercialStats(p);
    return p.status==="completed"&&p.commercialStatus==="ready"&&!p.commercialMemoQueued&&!alreadyQueued.has(p.id)&&company.day-(p.completedDay??company.day)>=1;
  });
  if(!candidate)return;
  if(queuePortfolioMemoOnce(makeProjectCommercializationEvent(candidate))){
    candidate.commercialMemoQueued=true;
    candidate.commercialStatus="review queued";
    recordHistory(`${candidate.title} entered commercial review after completion.`,"project",4);
  }
}
function applyProjectCommercializationDecision(decision){
  if(!decision)return;
  ensureProjectPortfolio();
  const p=(company.projectArchive||[]).find(x=>x.id===decision.id)||[...(company.projects||[])].find(x=>x.id===decision.id);
  if(!p)return;
  updateProjectCommercialStats(p);
  const readiness=Number(p.commercialReadiness)||0,potential=Number(p.commercialPotential)||0,interest=Number(p.performance?.customerInterest??p.customerInterest??0)||0;
  if(decision.mode==="launch"){
    const customers=Math.round(clamp(6+interest*.18+potential*.14+readiness*.08,6,42));
    p.commercialStatus="launched";p.commercialDecisionDay=company.day;p.convertedCustomers=(p.convertedCustomers||0)+customers;
    addCustomersToSegment("enterprise",Math.round(customers*.45),p.title,p.id);
    addCustomersToSegment("strategicPartners",Math.round(customers*.30),p.title,p.id);
    addCustomersToSegment("smallBusiness",Math.max(0,customers-Math.round(customers*.45)-Math.round(customers*.30)),p.title,p.id);
    company.phase="launched";company.pilotDays=0;
    addValuationShock(readiness>=65?1.4:-.9,`${p.title} commercial launch changed outside expectations`,p.id,28);
    recordMajorHistory(`${p.title} launched commercially and converted ${customers} customer(s).`,"product",6);
    recordWeeklyEvent(`${p.title} launched commercially and added customers.`,"product",6);
  }else if(decision.mode==="pilot"){
    const customers=Math.round(clamp(2+interest*.08+potential*.06,2,18));
    p.commercialStatus="pilot";p.commercialDecisionDay=company.day;p.convertedCustomers=(p.convertedCustomers||0)+customers;
    addCustomersToSegment("strategicPartners",Math.ceil(customers*.55),`${p.title} pilot`,p.id);
    addCustomersToSegment("enterprise",Math.max(0,customers-Math.ceil(customers*.55)),`${p.title} pilot`,p.id);
    if(company.phase!=="launched")company.phase="pilot";
    company.pilotDays=0;
    addValuationShock(.45,`${p.title} entered customer pilot`,p.id,18);
    recordHistory(`${p.title} entered a limited commercial pilot with ${customers} customer(s).`,"product",5);
    recordWeeklyEvent(`${p.title} entered a limited customer pilot.`,"product",5);
  }else if(decision.mode==="shelve"){
    p.commercialStatus="shelved";p.commercialDecisionDay=company.day;
    p.projectedDailyRevenue=0;
    recordHistory(`${p.title} was shelved after completion instead of commercialized.`,"project",4);
    recordWeeklyEvent(`${p.title} was shelved after commercial review.`,"project",4);
  }
}

function publicProjectObservation(project){
  if(!project)return null;
  return {id:project.id,title:project.title,status:project.status,progress:Math.round(project.progress||0),quality:Math.round(project.performance?.quality??project.quality??0),executionHealth:Math.round(project.performance?.executionHealth??projectVisibleHealth?.(project)??50),staffingCoverage:Math.round(project.performance?.staffingCoverage??100),riskTrend:Math.round(project.performance?.riskTrend??project.visibleRisk??0),customerInterest:Math.round(project.performance?.customerInterest??project.customerInterest??0),commercialStatus:project.commercialStatus||"not ready"};
}
function buildEmployeeObservation(employeeId){
  const e=employees.find(x=>x.id===employeeId);if(!e)return null;
  return {day:company.day,employeeId:e.id,role:e.role,team:employeeTeam(e),energy:Math.round(e.energy||0),stress:Math.round(e.stress||0),morale:Math.round(e.morale||0),focus:Math.round(e.focus||0),currentWork:activeWorkForEmployee?.(e)?.title||null,visibleCompany:{cashBand:company.cash<3?"low":company.cash<8?"tight":"adequate",phase:company.phase,trust:Math.round(company.trust||0)},knownMessages:(e.knownMessages||[]).slice(0,5).map(m=>({subject:m.subject,source:m.source||m.from,reliability:m.reliability}))};
}
function buildManagerObservation(departmentId){
  const team=company.teams?.[departmentId]||{};
  const members=employees.filter(e=>e.active&&employeeTeam(e)===departmentId);
  return {day:company.day,departmentId,staff:members.length,avgStress:Math.round(members.reduce((s,e)=>s+(e.stress||0),0)/Math.max(1,members.length)),backlog:Math.round(team.backlog||0),blockedWork:Math.round(team.blockedWork||0),pressure:Math.round(team.pressure||0),currentPriority:team.currentPriority||"delivery",projects:(company.projects||[]).filter(p=>(p.requiredDepartments||[]).includes(departmentId)).map(publicProjectObservation)};
}
function buildCustomerSuccessObservation(segmentId){
  ensureCustomerMarketSystems();
  const seg=company.customerSegments[segmentId];if(!seg)return null;
  return {day:company.day,segmentId,label:CUSTOMER_SEGMENT_DEFS[segmentId]?.label||segmentId,activeCustomers:Math.round(seg.activeCustomers||0),sentiment:Math.round(seg.sentiment||0),retentionOutlookBand:(seg.retentionOutlook||0)>70?"strong":(seg.retentionOutlook||0)>45?"mixed":"weak",supportSatisfaction:Math.round(seg.supportSatisfaction||0),openIssues:(seg.currentIssues||[]).filter(i=>!i.resolved).map(i=>({id:i.id,type:i.type,severity:i.severity,projectId:i.projectId||null,public:i.public})),productExposure:Object.fromEntries(Object.entries(seg.productExposure||{}).map(([projectId,e])=>[projectId,{usageShare:e.usageShare,contractShare:e.contractShare,dependency:e.dependency,publicVisibility:e.publicVisibility}]))};
}
function buildInvestorRelationsObservation(){
  return {day:company.day,valuation:Math.round(company.valuation||0),valuationTrend:valuationTrendLabel?.()||"unknown",investorConfidence:Math.round(company.shareholders?.confidence||company.board||0),boardConfidence:Math.round(company.board||0),pressure:Math.round(company.shareholders?.pressure||0),cash:Math.round(company.cash||0),publicRisks:(buildExecutiveIntelligenceSnapshot?.().topRisks||[]).slice(0,4).map(r=>({title:r.title,detail:r.detail,sourceIds:r.sourceIds||[]}))};
}
function buildBoardObservation(){
  return {...buildInvestorRelationsObservation(),governanceStrikes:company.boardGovernance?.strikes||0,ceoPipActive:!!company.boardGovernance?.pipActive,crisis:company.crisis?{type:company.crisis.type,failureOwner:company.crisis.failureOwner,deadlineDay:company.crisis.deadlineDay,currentProgress:company.crisis.currentProgress}:null};
}
function buildCEOObservation(){
  return {day:company.day,cash:Number((company.cash||0).toFixed(2)),board:Math.round(company.board||0),trust:Math.round(company.trust||0),customerSentiment:Math.round(company.customerSentiment||0),phase:company.phase,projects:(company.projects||[]).map(publicProjectObservation),inboxCount:(company.escalationQueue||[]).length+(company.pendingEvent?1:0),crisis:company.crisis?{type:company.crisis.type,visibleSignals:company.crisis.visibleSignals,recoveryCriteria:company.crisis.recoveryCriteria,deadlineDay:company.crisis.deadlineDay,currentProgress:company.crisis.currentProgress}:null};
}

class CustomerMarketSystem{
  ensure(){return ensureCustomerMarketSystems();}
  daily(){return updateCustomerMarketDaily();}
  revenue(){return calculateCustomerRevenueDaily();}
  strategicPressure(){return customerStrategicPressure();}
  queueStrategicMemo(){return maybeQueueCustomerStrategicMemo();}
  applyStrategy(strategy){return applyCustomerStrategyDecision(strategy);}
}
