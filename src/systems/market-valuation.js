function seededUnitFromText(text){
  let h=2166136261>>>0;
  for(let i=0;i<String(text).length;i++){h^=String(text).charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
  return (h%10000)/10000;
}
function defaultWorldState(){return{capitalClimate:50,sectorEnthusiasm:50,interestRatePressure:50,regulatoryPressure:50,supplyReliability:50,talentMarket:50,competitorAggression:50,customerBudgetClimate:50};}
function deterministicBoardProfile(){
  const orientations=["Growth-Oriented","Conservative","Execution-Focused","Market-Driven","Employee-Conscious","Capital-Efficient"];
  const seed=`${company.randomState??OFFICE_AQUARIUM_CONSTANTS.determinism.defaultRandomState}-${company.day??0}-board-profile`,r=i=>seededUnitFromText(seed+"-"+i),orientation=orientations[Math.floor(r(0)*orientations.length)];
  const base={orientation,growthBias:45+r(1)*25,cashBias:45+r(2)*25,valuationBias:45+r(3)*25,executionBias:45+r(4)*25,employeeBias:35+r(5)*30,patience:42+r(6)*28};
  if(orientation==="Growth-Oriented"){base.growthBias+=15;base.valuationBias+=8;base.patience-=4;}
  if(orientation==="Conservative"){base.cashBias+=16;base.patience+=8;base.growthBias-=8;}
  if(orientation==="Execution-Focused"){base.executionBias+=18;base.valuationBias-=4;}
  if(orientation==="Market-Driven"){base.valuationBias+=18;base.growthBias+=8;}
  if(orientation==="Employee-Conscious"){base.employeeBias+=20;base.patience+=6;}
  if(orientation==="Capital-Efficient"){base.cashBias+=18;base.executionBias+=8;}
  Object.keys(base).forEach(k=>{if(k!=="orientation")base[k]=Math.round(clamp(base[k],10,95));});
  return base;
}
function ensureMarketValuationSystems(){
  if(!company)return;
  company.worldState={...defaultWorldState(),...(company.worldState||{})};
  company.marketSentiment=Number.isFinite(company.marketSentiment)?company.marketSentiment:50;
  company.marketConfidence=Number.isFinite(company.marketConfidence)?company.marketConfidence:50;
  company.leadershipReputation=Number.isFinite(company.leadershipReputation)?company.leadershipReputation:50;
  company.valuationQuality=Number.isFinite(company.valuationQuality)?company.valuationQuality:50;
  company.investorAppetite=Number.isFinite(company.investorAppetite)?company.investorAppetite:50;
  company.marketNoiseState=Number.isFinite(company.marketNoiseState)?company.marketNoiseState:0;
  company.valuationHistory=Array.isArray(company.valuationHistory)?company.valuationHistory:[];
  company.valuationShocks=Array.isArray(company.valuationShocks)?company.valuationShocks:[];
  company.boardMarketLessons=company.boardMarketLessons&&typeof company.boardMarketLessons==="object"?company.boardMarketLessons:{};
  company.lastValuationReviewDay=Number.isFinite(company.lastValuationReviewDay)?company.lastValuationReviewDay:OFFICE_AQUARIUM_CONSTANTS.time.neverDay;
  company.lastValuationMemoDay=Number.isFinite(company.lastValuationMemoDay)?company.lastValuationMemoDay:OFFICE_AQUARIUM_CONSTANTS.time.neverDay;
  company.lastFundraisingMemoDay=Number.isFinite(company.lastFundraisingMemoDay)?company.lastFundraisingMemoDay:OFFICE_AQUARIUM_CONSTANTS.time.neverDay;
  company.lastValuationStoryDay=Number.isFinite(company.lastValuationStoryDay)?company.lastValuationStoryDay:OFFICE_AQUARIUM_CONSTANTS.time.neverDay;
  company.lastBoardValuationState=company.lastBoardValuationState||null;
  const rangeAliases={daily:"1d",weekly:"1w",monthly:"1m",quarterly:"3m",yearly:"1y"};
  company.marketRangeView=rangeAliases[company.marketRangeView]||company.marketRangeView;
  company.marketRangeView=["1d","1w","1m","3m","ytd","1y","all"].includes(company.marketRangeView)?company.marketRangeView:"1m";
  company.valuationDrivers=company.valuationDrivers&&typeof company.valuationDrivers==="object"?company.valuationDrivers:{};
  company.boardProfile=company.boardProfile&&typeof company.boardProfile==="object"?company.boardProfile:deterministicBoardProfile();
  company.founderOwnership=Number.isFinite(company.founderOwnership)?company.founderOwnership:100;
  company.investorOwnership=Number.isFinite(company.investorOwnership)?company.investorOwnership:0;
  company.boardControlPressure=Number.isFinite(company.boardControlPressure)?company.boardControlPressure:0;
  const seededInvestorConfidence=Number.isFinite(company.shareholders?.confidence)?company.shareholders.confidence:Math.round(clamp((company.marketConfidence||50)*.55+(company.board||50)*.20+(company.valuationQuality||50)*.25,0,100));
  company.investorSentiment={confidence:seededInvestorConfidence,patience:50,growthExpectation:50,executionConcern:0,dilutionConcern:0,volatilityConcern:0,valuationConcern:0,recentQuestions:[],dominantConcern:null,dominantOpportunity:null,lastUpdatedDay:company.day,...(company.investorSentiment||{})};
  company.investorRelationsReport=company.investorRelationsReport&&typeof company.investorRelationsReport==="object"?company.investorRelationsReport:null;
  company.investorRelationsLearning={trendPredictionAccuracy:0,concernDiagnosisAccuracy:0,fundraisingTimingAccuracy:0,volatilityInterpretationAccuracy:0,narrativeAccuracy:0,overreactionBias:0,concernDetection:0,volatilityInterpretation:0,fundraisingTiming:0,...(company.investorRelationsLearning||{})};
  company.lastInvestorRelationsReportDay=Number.isFinite(company.lastInvestorRelationsReportDay)?company.lastInvestorRelationsReportDay:OFFICE_AQUARIUM_CONSTANTS.time.neverDay;
  company.lastInvestorBoardMemoDay=Number.isFinite(company.lastInvestorBoardMemoDay)?company.lastInvestorBoardMemoDay:OFFICE_AQUARIUM_CONSTANTS.time.neverDay;
  [...(company.projects||[]),...(company.projectProposals||[]),...(company.projectArchive||[])].forEach(p=>{p.marketVisibility=p.marketVisibility||((p.status==="proposal"||p.originType==="internal")?"private":(company.day-(p.createdDay??company.day)>45?"rumored":"private"));});
}
function findValuationHistoryAtOrBefore(targetDay){
  ensureMarketValuationSystems();
  return (company.valuationHistory||[]).filter(h=>Number.isFinite(h.day)&&Number.isFinite(h.valuation)&&h.day<=targetDay).sort((a,b)=>b.day-a.day)[0]||null;
}
function valuationChange(days=OFFICE_AQUARIUM_CONSTANTS.time.daysPerMonth){
  ensureMarketValuationSystems();
  const current=Number(company.valuation)||0,latest=(company.valuationHistory||[]).filter(h=>Number.isFinite(h.day)&&Number.isFinite(h.valuation)).sort((a,b)=>b.day-a.day)[0],currentDay=latest?.day??company.day,older=findValuationHistoryAtOrBefore(currentDay-days);
  if(!older||!older.valuation)return 0;
  return ((current-older.valuation)/Math.max(.1,older.valuation))*100;
}
function valuationTrend(days=OFFICE_AQUARIUM_CONSTANTS.time.daysPerMonth){const c=valuationChange(days);return c>3?"rising":c<-3?"falling":"steady";}
function valuationDisplayChange(days=OFFICE_AQUARIUM_CONSTANTS.time.daysPerMonth){
  ensureMarketValuationSystems();
  const hist=(company.valuationHistory||[]).filter(h=>Number.isFinite(h.valuation)&&Number.isFinite(h.day)).slice().sort((a,b)=>a.day-b.day);
  if(hist.length<2)return {change:0,amount:0,days:0,previous:Number(company.valuation)||0,current:Number(company.valuation)||0};
  const currentRow=hist[hist.length-1],current=Number(company.valuation)||currentRow.valuation,older=days===Infinity?hist[0]:[...hist].reverse().find(h=>currentRow.day-h.day>=days)||hist[0];
  const span=Math.max(0,currentRow.day-older.day);
  return {change:((current-older.valuation)/Math.max(.1,older.valuation))*100,amount:current-older.valuation,days:span,previous:older.valuation,current};
}
function valuationRangeText(days,actualDays=days){
  if(days===Infinity)return "all time";
  if(actualDays<=0)return "startup";
  if(actualDays<days)return `${actualDays} day${actualDays===1?"":"s"}`;
  if(days===1)return "1 day";
  if(days===OFFICE_AQUARIUM_CONSTANTS.time.daysPerWeek)return "1 week";
  if(days===OFFICE_AQUARIUM_CONSTANTS.time.daysPerMonth)return `${OFFICE_AQUARIUM_CONSTANTS.time.daysPerMonth} days`;
  if(days===OFFICE_AQUARIUM_CONSTANTS.time.daysPerMonth*3)return "3 months";
  if(days===OFFICE_AQUARIUM_CONSTANTS.time.daysPerYear)return `${OFFICE_AQUARIUM_CONSTANTS.time.daysPerYear} days`;
  return `${days} days`;
}
function formatValuationDelta(amount){
  const abs=Math.abs(Number(amount)||0).toFixed(1);
  return amount>0?`+$${abs}M`:amount<0?`-$${abs}M`:"$0.0M";
}
function formatPercentDelta(value){
  const abs=Math.abs(Number(value)||0).toFixed(1);
  return value>0?`+${abs}%`:value<0?`-${abs}%`:"0.0%";
}
function valuationRangeConfig(){
  ensureMarketValuationSystems();
  const selected=company.marketRangeView||"1m";
  const daysPerYear=OFFICE_AQUARIUM_CONSTANTS.time.daysPerYear;
  const ytdStart=Math.floor((company.day||0)/daysPerYear)*daysPerYear;
  const ytdDays=Math.max(1,(company.day||0)-ytdStart);
  const configs={
    "1d":{key:"1d",days:1,label:"1D"},
    "1w":{key:"1w",days:OFFICE_AQUARIUM_CONSTANTS.time.daysPerWeek,label:"1W"},
    "1m":{key:"1m",days:OFFICE_AQUARIUM_CONSTANTS.time.daysPerMonth,label:"1M"},
    "3m":{key:"3m",days:OFFICE_AQUARIUM_CONSTANTS.time.daysPerMonth*3,label:"3M"},
    ytd:{key:"ytd",days:ytdDays,label:"YTD"},
    "1y":{key:"1y",days:daysPerYear,label:"1Y"},
    all:{key:"all",days:Infinity,label:"All"}
  };
  return configs[selected]||configs["1m"];
}
function setMarketRangeView(range){
  if(!company)return;
  company.marketRangeView=["1d","1w","1m","3m","ytd","1y","all"].includes(range)?range:"1m";
  document.querySelectorAll(".market-range-btn").forEach(btn=>btn.classList.toggle("active",btn.dataset.marketRange===company.marketRangeView));
  const label=document.getElementById("valuationLabel");
  if(label)label.textContent=`$${company.valuation.toFixed(1)}M valuation - ${valuationTrendLabel()}`;
  renderValuationChart();
  if(!validationMode)saveGame();
}
function valuationSeries(days){
  ensureMarketValuationSystems();
  const all=(company.valuationHistory||[]).filter(h=>Number.isFinite(h.valuation)&&Number.isFinite(h.day)).slice().sort((a,b)=>a.day-b.day);
  const currentDay=all.length?all[all.length-1].day:company.day;
  const hist=days===Infinity?all:all.filter(h=>currentDay-h.day<=days);
  if(!hist.length&&Number.isFinite(company.valuation))return [{day:company.day,valuation:company.valuation}];
  return hist.length>1?hist:all.slice(-Math.min(days===1?2:8,all.length));
}
function renderValuationChart(){
  const canvas=document.getElementById("valuationChart"),title=document.getElementById("marketViewTitle"),detail=document.getElementById("marketViewDetail");
  if(!canvas||!title||!detail)return;
  const cfg=valuationRangeConfig(),series=valuationSeries(cfg.days),change=valuationDisplayChange(cfg.days);
  title.textContent=`${cfg.label} Valuation Trend`;
  const latest=Number(company.valuation||0),rangeLabel=valuationRangeText(cfg.days,change.days);
  detail.textContent=`$${latest.toFixed(1)}M valuation | ${formatValuationDelta(change.amount)} (${formatPercentDelta(change.change)}) over ${rangeLabel}.`;
  document.querySelectorAll(".market-range-btn").forEach(btn=>btn.classList.toggle("active",btn.dataset.marketRange===cfg.key));
  const rect=canvas.getBoundingClientRect(),ratio=window.devicePixelRatio||1,w=Math.max(260,Math.floor(rect.width||canvas.clientWidth||620)),h=92;
  canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);canvas.style.height="74px";
  const ctx=canvas.getContext("2d");if(!ctx)return;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,w,h);ctx.strokeStyle="#e0ecec";ctx.lineWidth=1;
  for(let i=1;i<4;i++){const y=(h-18)*i/4+7;ctx.beginPath();ctx.moveTo(8,y);ctx.lineTo(w-8,y);ctx.stroke();}
  if(series.length<2){ctx.fillStyle="#667085";ctx.font="12px system-ui";ctx.fillText("Valuation history will build after daily closes.",12,48);return;}
  const values=series.map(s=>s.valuation),minRaw=Math.min(...values),maxRaw=Math.max(...values),padding=Math.max(.25,(maxRaw-minRaw)*.18),min=minRaw-padding,max=maxRaw+padding,spread=Math.max(.5,max-min),xStep=(w-22)/Math.max(1,series.length-1);
  const zeroY=8+(1-(change.previous-min)/spread)*(h-24);
  if(Number.isFinite(zeroY)&&zeroY>8&&zeroY<h-16){ctx.strokeStyle="#c9d8d8";ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(8,zeroY);ctx.lineTo(w-8,zeroY);ctx.stroke();ctx.setLineDash([]);}
  ctx.strokeStyle=change.change>=0?"#2ab7a9":"#ef6f6c";ctx.lineWidth=2.5;ctx.beginPath();
  series.forEach((s,i)=>{const x=11+i*xStep,y=8+(1-(s.valuation-min)/spread)*(h-24);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
  ctx.stroke();
  const last=series[series.length-1],lastX=11+(series.length-1)*xStep,lastY=8+(1-(last.valuation-min)/spread)*(h-24);
  ctx.fillStyle=change.change>=0?"#2ab7a9":"#ef6f6c";ctx.beginPath();ctx.arc(lastX,lastY,3.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#667085";ctx.font="11px system-ui";ctx.fillText(`High $${maxRaw.toFixed(1)}M`,12,16);ctx.fillText(`Low $${minRaw.toFixed(1)}M`,12,h-8);ctx.textAlign="right";ctx.fillText(`Day ${series[0].day+1}`,w-86,h-8);ctx.fillText(`Day ${series[series.length-1].day+1}`,w-12,h-8);ctx.textAlign="left";
}
function valuationVolatility(days=30){
  const hist=(company.valuationHistory||[]).filter(h=>company.day-(h.day??0)<=days).map(h=>h.valuation).filter(Number.isFinite);
  if(hist.length<3)return 0;
  const avg=hist.reduce((a,b)=>a+b,0)/hist.length;
  return Math.sqrt(hist.reduce((a,b)=>a+Math.pow(b-avg,2),0)/hist.length);
}
function publicProjectSignal(){
  ensureProjectPortfolio?.();
  const visible=[...(company.projects||[]),...(company.projectArchive||[])].filter(p=>["announced","rumored"].includes(p.marketVisibility)||["launched","pilot"].includes(p.commercialStatus));
  const failures=visible.filter(p=>["canceled","rejected"].includes(p.status)||(p.performance?.scheduleVariance||0)>22||(p.performance?.riskTrend||0)>80).length;
  const opportunities=visible.filter(p=>p.status==="completed"||p.commercialStatus==="launched"||(p.performance?.customerInterest||p.customerInterest||0)>70).length;
  return {visible:visible.length,failures,opportunities};
}
function updateInvestorReaction(force=false){
  ensureMarketValuationSystems();
  if(!force&&company.lastInvestorUpdateDay===company.day)return company.investorSentiment;
  company.lastInvestorUpdateDay=company.day;
  const reaction=OFFICE_AQUARIUM_CONSTANTS.investorRelations.reaction;
  const prev=Number(company.investorSentiment?.confidence??company.shareholders?.confidence??50),target=derivedInvestorConfidence(company.portfolioHealth?.portfolioHealth??null),volatility=valuationVolatility(60),trend=valuationChange(30),projects=publicProjectSignal(),noise=rand(reaction.dailyNoiseMinimum,reaction.dailyNoiseMaximum);
  const executionConcern=clamp((company.portfolioHealth?.atRiskProjects||0)*12+(company.portfolioHealth?.averageScheduleVariance||0)*.55+projects.failures*10+(company.companyRiskComponents?.total>70?8:0),0,100);
  const dilutionConcern=clamp((company.investorOwnership||0)*.45+(company.boardControlPressure||0)*.40,0,100);
  const volatilityConcern=clamp(volatility*5+Math.max(0,-trend)*.45,0,100);
  const valuationConcern=clamp((company.valuationQuality<45?55-company.valuationQuality:0)+(trend>10&&company.valuationQuality<55?12:0),0,100);
  const growthExpectation=clamp((company.investorAppetite||50)*.42+(company.marketSentiment||50)*.24+Math.max(0,trend)*.55+projects.opportunities*3,0,100);
  const confidence=clamp(
    prev*reaction.previousConfidenceWeight+
    target*reaction.derivedConfidenceWeight+
    noise+
    Math.max(0,trend)*reaction.positiveTrendWeight-
    Math.max(0,-trend)*reaction.negativeTrendWeight,
    0,
    100
  );
  const concerns=[["execution",executionConcern],["dilution",dilutionConcern],["volatility",volatilityConcern],["valuation support",valuationConcern]].sort((a,b)=>b[1]-a[1]);
  const opportunities=[["funding window",company.investorAppetite||50],["customer proof",clamp((company.customers||0)*.4+(company.customerSentiment||50)*.5,0,100)],["visible project momentum",clamp(projects.opportunities*18+Math.max(0,trend),0,100)]].sort((a,b)=>b[1]-a[1]);
  company.investorSentiment={...(company.investorSentiment||{}),confidence,patience:clamp((company.investorSentiment?.patience??50)+(confidence-55)*.025-(company.crisis?1:0)-volatilityConcern*.006,0,100),growthExpectation,executionConcern,dilutionConcern,volatilityConcern,valuationConcern,dominantConcern:concerns[0][1]>38?concerns[0][0]:null,dominantOpportunity:opportunities[0][1]>58?opportunities[0][0]:null,lastUpdatedDay:company.day};
  const questions=[];
  if(executionConcern>55)questions.push("Can management deliver announced milestones?");
  if(dilutionConcern>55)questions.push("Will future financing dilute existing owners?");
  if(volatilityConcern>55)questions.push("Is the current valuation stable or noisy?");
  if(valuationConcern>50)questions.push("Do fundamentals support the valuation?");
  company.investorSentiment.recentQuestions=[...questions,...(company.investorSentiment.recentQuestions||[])].slice(0,8);
  company.shareholders={...(company.shareholders||{}),confidence:Math.round(confidence),patience:Math.round(company.investorSentiment.patience),pressure:Math.round(clamp(100-confidence+(company.market.capitalClimate<40?8:0)+(company.cash<8?6:0)+Math.max(executionConcern,volatilityConcern)*.12,0,100))};
  return company.investorSentiment;
}
function applyInvestorEffect(effect={}){
  ensureMarketValuationSystems();
  company.shareholders=company.shareholders||{confidence:50,patience:50,pressure:50};
  Object.entries(effect||{}).forEach(([k,v])=>company.shareholders[k]=clamp((company.shareholders[k]||0)+v,0,100));
  if(company.investorSentiment){
    if(Number.isFinite(effect.confidence))company.investorSentiment.confidence=clamp((company.investorSentiment.confidence??company.shareholders.confidence)+effect.confidence,0,100);
    if(Number.isFinite(effect.patience))company.investorSentiment.patience=clamp((company.investorSentiment.patience??company.shareholders.patience)+effect.patience,0,100);
    if(Number.isFinite(effect.pressure)){
      const pressure=clamp((company.shareholders.pressure||0),0,100);
      company.investorSentiment.executionConcern=clamp((company.investorSentiment.executionConcern||0)+effect.pressure*.35,0,100);
      if(pressure>70)company.investorSentiment.dominantConcern=company.investorSentiment.dominantConcern||"execution";
    }
  }
}
function investorConfidenceBand(v=company.investorSentiment?.confidence??50){return v>=72?"Strong":v>=56?"Moderate":v>=40?"Fragile":"Weak";}
function updateInvestorRelationsReport(force=false){
  ensureMarketValuationSystems();
  if(!force&&company.day-(company.lastInvestorRelationsReportDay||OFFICE_AQUARIUM_CONSTANTS.time.neverDay)<7)return company.investorRelationsReport;
  const v30=valuationDisplayChange(30),v7=valuationDisplayChange(7),s=company.investorSentiment||{},trend=v30.change>4?"improving":v30.change<-4?"weakening":"stable";
  const evidence=[`Investor confidence ${Math.round(s.confidence??0)} (${investorConfidenceBand(s.confidence)})`,`30-day valuation ${formatPercentDelta(v30.change)} over ${valuationRangeText(30,v30.days)}`,`Valuation quality ${valuationQualityLabel()} and market confidence ${Math.round(company.marketConfidence||0)}`];
  if(s.dominantConcern)evidence.push(`Dominant concern: ${s.dominantConcern}`);
  if(s.dominantOpportunity)evidence.push(`Dominant opportunity: ${s.dominantOpportunity}`);
  if((company.investorOwnership||0)>0)evidence.push(`Investor ownership ${Number(company.investorOwnership||0).toFixed(1)}% after financing activity`);
  const report={generatedDay:company.day,periodStartDay:Math.max(0,company.day-30),confidenceTrend:trend,dominantConcern:s.dominantConcern||null,dominantOpportunity:s.dominantOpportunity||null,questionsRaised:[...(s.recentQuestions||[])].slice(0,4),evidence:evidence.slice(0,6),confidenceBand:investorConfidenceBand(s.confidence),sourceIds:["valuation-history","market-confidence","public-project-signals"],sevenDayChange:Number(v7.change.toFixed(2)),thirtyDayChange:Number(v30.change.toFixed(2))};
  company.investorRelationsReport=report;company.lastInvestorRelationsReportDay=company.day;
  company.investorRelationsForecasts=Array.isArray(company.investorRelationsForecasts)?company.investorRelationsForecasts:[];
  company.investorRelationsForecasts.unshift({id:nextSimulationId("ir-forecast"),reportId:`ir-report-${company.day}`,generatedDay:company.day,reviewDay:company.day+30,forecastTypes:["trendPrediction","concernDiagnosis","volatilityInterpretation","narrativeAccuracy"],predictedTrend:trend,predictedConcern:s.dominantConcern||null,confidence:Math.round(s.confidence??50),baseline:{valuation:Number(company.valuation||0),confidence:Number(s.confidence||50),valuationQuality:Number(company.valuationQuality||50),marketConfidence:Number(company.marketConfidence||50)},resolved:false,outcome:null,day:company.day,reportDay:company.day,forecastDay:company.day+30,forecastConfidence:Math.round(s.confidence??50),forecastTrend:trend,expectedThirtyDayChange:trend==="improving"?4:trend==="weakening"?-4:0,evidenceIds:report.sourceIds,status:"pending"});
  company.investorRelationsForecasts=company.investorRelationsForecasts.slice(0,80);
  return report;
}
function evaluateInvestorRelationsForecasts(){
  ensureMarketValuationSystems();
  (company.investorRelationsForecasts||[]).forEach(f=>{
    if(f.status!=="pending"||company.day<(f.reviewDay??f.forecastDay??0))return;
    const actual=valuationDisplayChange(Math.max(1,company.day-(f.reportDay??company.day))).change;
    const expected=Number(f.expectedThirtyDayChange)||0;
    const accuracy=clamp(100-Math.abs(actual-expected)*6,0,100);
    const actualConcern=company.investorSentiment?.dominantConcern||null,concernHit=(!f.predictedConcern&&!actualConcern)||f.predictedConcern===actualConcern;
    const volatility=valuationVolatility(30),baselineQuality=Number(f.baseline?.valuationQuality||50),qualityDelta=(company.valuationQuality||50)-baselineQuality;
    const trendPredictionAccuracy=accuracy,concernDiagnosisAccuracy=concernHit?78:34,volatilityInterpretationAccuracy=(volatility>8&&f.predictedConcern==="volatility")?76:volatility>10?38:62,narrativeAccuracy=clamp(accuracy*.62+concernDiagnosisAccuracy*.25+volatilityInterpretationAccuracy*.13,0,100),overreactionAccuracy=Math.abs(actual)>8&&Math.abs(qualityDelta)<2?35:Math.abs(actual)<4&&Math.abs(qualityDelta)>5?70:55;
    f.status="reviewed";f.resolved=true;f.outcome={actualChange:Number(actual.toFixed(2)),accuracy:Math.round(accuracy),trendPredictionAccuracy:Math.round(trendPredictionAccuracy),concernDiagnosisAccuracy,volatilityInterpretationAccuracy,narrativeAccuracy:Math.round(narrativeAccuracy),overreactionAccuracy,actualConcern,valuationQuality:Number(company.valuationQuality||0),marketConfidence:Number(company.marketConfidence||0),concernHit,volatility:Number(volatility.toFixed(2)),qualityDelta:Number(qualityDelta.toFixed(2))};f.actualChange=Number(actual.toFixed(2));f.accuracy=Math.round(accuracy);f.reviewedDay=company.day;
    investorRelationsLearningUpdate("trendPredictionAccuracy",(trendPredictionAccuracy-55)/140);
    investorRelationsLearningUpdate("concernDiagnosisAccuracy",(concernDiagnosisAccuracy-55)/140);
    investorRelationsLearningUpdate("volatilityInterpretationAccuracy",(volatilityInterpretationAccuracy-55)/140);
    investorRelationsLearningUpdate("narrativeAccuracy",(narrativeAccuracy-55)/160);
    investorRelationsLearningUpdate("concernDetection",concernHit?.18:-.22);
    investorRelationsLearningUpdate("volatilityInterpretation",(volatility>8&&f.predictedConcern==="volatility")?.16:volatility>10?-.12:.04);
    investorRelationsLearningUpdate("narrativeAccuracy",(accuracy-50)/160+(concernHit?.06:-.06));
    investorRelationsLearningUpdate("overreactionBias",Math.abs(actual)>8&&Math.abs(qualityDelta)<2?-.16:Math.abs(actual)<4&&Math.abs(qualityDelta)>5?.08:.02);
  });
}
function investorRelationsLearningUpdate(kind,delta){
  ensureMarketValuationSystems();
  if(!company.investorRelationsLearning)return;
  company.investorRelationsLearning[kind]=clamp((company.investorRelationsLearning[kind]||0)+delta,-10,10);
}
function valuationMomentum(days=30){return valuationChange(days)-valuationChange(days*2);}
function companyIdentityLabel(){
  ensureMarketValuationSystems();
  const active=employees.filter(e=>e.active).length,age=company.day||0,launched=(company.phase==="launched"||company.customers>60),risk=company.companyRiskComponents?.total??50,portfolio=company.portfolioHealth?.portfolioHealth??derivedOperatingHealth().portfolioHealth??50;
  if(company.crisis||risk>82||company.cash<2)return "Distressed Company";
  if((company.restructuringRequests||[]).some(r=>company.day-(r.day||0)<45)||company.hiringPolicy?.mode==="frozen")return "Restructuring Company";
  if(launched&&company.customers>360&&company.dailyRevenue>.9&&active>=18)return "Industry Leader";
  if(launched&&((company.customers>180&&portfolio>65)||(age>OFFICE_AQUARIUM_CONSTANTS.time.daysPerYear&&company.customers>80&&portfolio>58)))return "Established Technology Company";
  if(launched&&company.customers>80)return "Market Challenger";
  if(company.customers>25||company.dailyRevenue>.08||(age>180&&company.customers>10))return "Growing Technology Company";
  if(company.customers>0||company.phase==="pilot"||company.phase==="customer trial")return "Early Commercial Company";
  if((company.culture?.innovation||50)>64||(company.projects||[]).some(p=>p.family?.toLowerCase().includes("research")))return "Research-Driven Company";
  return "Technology Startup";
}
function valuationQualityLabel(v=company.valuationQuality){return v>=78?"Durable":v>=64?"Supported":v>=47?"Mixed":v>=32?"Speculative":"Fragile";}
function updateHiddenWorldState(){
  ensureMarketValuationSystems();
  const w=company.worldState;
  Object.keys(defaultWorldState()).forEach(k=>{w[k]=clamp((w[k]??50)+rand(-.75,.75),5,95);});
  if(simulationRandom()<.045){
    const shocks=[
      ["AI investment boom","sectorEnthusiasm",rand(5,11),"positive"],
      ["Technology selloff","sectorEnthusiasm",rand(-12,-5),"negative"],
      ["Capital tightening","capitalClimate",rand(-11,-4),"negative"],
      ["Regulatory uncertainty","regulatoryPressure",rand(5,12),"negative"],
      ["Competitor breakthrough","competitorAggression",rand(6,13),"negative"],
      ["Supply-chain recovery","supplyReliability",rand(5,12),"positive"]
    ],s=shocks[Math.floor(simulationRandom()*shocks.length)];
    w[s[1]]=clamp(w[s[1]]+s[2],5,95);
    addValuationShock(s[3]==="positive"?1.8:-1.8,s[0],"world",18);
    recordWeeklyEvent(s[0],"market",4);
  }
  company.market.capitalClimate=clamp(w.capitalClimate*.7+(company.market.capitalClimate||50)*.3,5,95);
  company.market.supplyPressure=clamp((100-w.supplyReliability)*.65+(company.market.supplyPressure||35)*.35,5,95);
  company.market.competitorHeat=clamp(w.competitorAggression*.7+(company.market.competitorHeat||45)*.3,5,95);
  company.market.aiDemand=clamp(w.sectorEnthusiasm*.55+w.customerBudgetClimate*.25+(company.market.aiDemand||50)*.2,5,95);
  company.market.hardwareDemand=clamp(w.customerBudgetClimate*.45+w.sectorEnthusiasm*.25+w.supplyReliability*.15+(company.market.hardwareDemand||50)*.15,5,95);
}
function institutionalCapabilityScore(){
  const lessons=(company.lessons||[]).filter(l=>(l.confidence||0)>20);
  if(!lessons.length)return 50;
  const values=lessons.map(l=>{
    const evidenceQuality=clamp(((l.evidence||[]).length||1)/4,0.25,1);
    const age=company.day-(l.lastUpdatedDay??l.day??company.day),relevance=clamp(1-age/420,.25,1);
    const adoption=clamp(((l.departments?.length||0)+(l.employeeIds?.length||0)*.25+1)/5,.25,1);
    const provenUsefulness=clamp(.55+(l.successEvidence||0)*.08-(l.contradictionEvidence||0)*.12+(l.outcome==="negative"?-.18:0),.15,1);
    return (l.confidence||0)*evidenceQuality*relevance*adoption*provenUsefulness;
  });
  return clamp(values.reduce((a,b)=>a+b,0)/values.length,0,100);
}
function companyFundamentalsScore(){
  const h=derivedOperatingHealth(),finance=h.financeHealth??50,portfolio=h.portfolioHealth??50,traction=clamp((company.customers||0)/2+(company.customerSentiment||50)*.35,0,100),revenueQuality=clamp((company.dailyRevenue||0)*85+(company.finance?.netCashFlowDaily||0)*90+50,0,100),operating=clamp(((h.hardwareHealth??50)+(h.softwareHealth??50)+(h.manufacturingHealth??50))/3*.65+(h.teamCohesion??50)*.35,0,100),workforce=clamp((h.teamCohesion??50)*.35+(100-avgStress())*.25+(employees.filter(e=>e.active).length*5),0,100),institutional=clamp(45+institutionalCapabilityScore()*.45+(company.culture?.communication||50)*.10,0,100);
  return clamp(finance*.20+portfolio*.20+traction*.15+revenueQuality*.15+operating*.10+workforce*.10+institutional*.10,0,100);
}
function updateMarketPerception(){
  ensureMarketValuationSystems();
  const w=company.worldState,h=derivedOperatingHealth(),fundamentals=companyFundamentalsScore(),active=employees.filter(e=>e.active);
  company.marketSentiment=clamp(company.marketSentiment*.94+(w.sectorEnthusiasm*.25+w.capitalClimate*.22+(100-w.interestRatePressure)*.14+(100-w.regulatoryPressure)*.12+w.supplyReliability*.1+w.customerBudgetClimate*.12+(100-w.competitorAggression)*.05)*.06,0,100);
  const execution=clamp((h.portfolioHealth??50)*.35+(h.hardwareHealth??50)*.2+(h.softwareHealth??50)*.2+(100-avgStress())*.12+(company.boardGovernance?.strikes?30:60)*.13,0,100);
  const completedProjectCount=[...(company.projects||[]),...(company.projectArchive||[])].filter(p=>p.status==="completed").length;
  const portfolioConfidence=clamp((h.portfolioHealth??50)*.65+(100-(company.portfolioHealth?.concentrationRisk||35))*.2+completedProjectCount*4,0,100);
  const boardStability=clamp(company.board-(company.boardGovernance?.strikes||0)*12-company.boardControlPressure*.15,0,100);
  company.leadershipReputation=clamp(company.leadershipReputation*.97+(company.board*.25+company.trust*.2+(company.leadership?.transparency||55)*.15+(company.leadership?.accountability||55)*.15+(100-(company.simulationMetrics?.counters?.resignations||0)*4)*.1+(company.crisis?25:65)*.15)*.03,0,100);
  company.marketConfidence=clamp(company.marketConfidence*.965+(company.valuationQuality*.20+company.leadershipReputation*.20+execution*.20+((company.customerSentiment||50)+(company.customers||0)*.18)*.15+portfolioConfidence*.15+boardStability*.10)*.035,0,100);
  const revenueSupport=clamp((company.dailyRevenue||0)*95+(company.finance?.netCashFlowDaily||0)*90+45,0,100),customerSupport=clamp((company.customerSentiment||50)*.55+(company.customers||0)*.35,0,100),cashFlowSupport=clamp((company.finance?.netCashFlowDaily||0)*120+55,0,100),portfolioExecution=h.portfolioHealth??50,diversification=clamp(100-(company.portfolioHealth?.concentrationRisk||40),0,100);
  let quality=revenueSupport*.25+customerSupport*.20+cashFlowSupport*.15+portfolioExecution*.15+company.leadershipReputation*.10+diversification*.10+boardStability*.05;
  if((company.valuation||0)>Math.max(15,(company.dailyRevenue||0)*900+35)&&company.dailyRevenue<.08)quality-=10;
  const delayedProjects=(company.projects||[]).filter(p=>p.status!=="completed"&&((p.performance?.scheduleVariance||0)>20||p.closeoutReadyDays>2)).length;
  const turnover=(company.simulationMetrics?.counters?.resignations||0)+(company.simulationMetrics?.counters?.firings||0);
  if(company.portfolioHealth?.concentrationRisk>70)quality-=5;
  if(delayedProjects>0)quality-=Math.min(8,delayedProjects*3);
  if(turnover>3)quality-=Math.min(8,(turnover-3)*1.5);
  if((company.boardGovernance?.strikes||0)>0)quality-=Math.min(10,(company.boardGovernance.strikes||0)*4);
  if(avgStress()>72)quality-=5;
  if(active.length<6)quality-=6;
  company.valuationQuality=clamp(company.valuationQuality*.93+quality*.07,0,100);
  company.investorAppetite=clamp(company.investorAppetite*.94+(company.marketSentiment*.38+company.marketConfidence*.32+company.valuationQuality*.18+w.capitalClimate*.12)*.06,0,100);
  company.valuationDrivers={fundamentalsScore:fundamentals,executionCredibility:execution,portfolioConfidence,boardStability,revenueSupport,customerSupport,cashFlowSupport,diversification,valuationQualityLabel:valuationQualityLabel()};
}
function activeValuationShockTotal(){
  ensureMarketValuationSystems();
  let total=0;
  company.valuationShocks.forEach(s=>{const age=company.day-(s.day??company.day),decay=Math.max(0,1-age/Math.max(1,s.decayDays||20));total+=(s.magnitude||0)*decay;});
  company.valuationShocks=company.valuationShocks.filter(s=>company.day-(s.day??company.day)<=Math.max(1,s.decayDays||20));
  return clamp(total,-18,24);
}
function updateDailyValuationCore(force=false){
  ensureMarketValuationSystems();
  if(!force&&company.lastValuationUpdateDay===company.day)return company.valuation;
  company.lastValuationUpdateDay=company.day;
  ensureMarketValuationSystems();updateMarketPerception();
  const health=derivedOperatingHealth();
  const fundamentals=company.valuationDrivers.fundamentalsScore??companyFundamentalsScore(),active=employees.filter(e=>e.active).length,base=18+fundamentals*.42+Math.max(0,active-6)*1.6+(company.customers||0)*.11+(company.dailyRevenue||0)*210;
  const valuationRisk=Number.isFinite(Number(company.valuationRiskScore))?Number(company.valuationRiskScore):OFFICE_AQUARIUM_CONSTANTS.riskPillars.valuationSnapshotDefault;
  const announced=(company.projects||[]).filter(p=>["announced","rumored"].includes(p.marketVisibility)),portfolioMultiplier=clamp(1+((health.portfolioHealth??50)-50)/210+announced.reduce((a,p)=>a+((p.hiddenReality?.trueStrategicValue||50)-50)*.0008,0),.55,1.65),customerMultiplier=clamp(.72+(company.customerSentiment||50)/155+(company.customers||0)/900,.6,1.75),revenueMultiplier=clamp(.78+(company.dailyRevenue||0)*5+(company.finance?.netCashFlowDaily||0)*.55,.55,1.9),executionMultiplier=clamp(.70+((company.valuationDrivers.executionCredibility||50)/155),.55,1.55),marketMultiplier=clamp(.72+(company.marketSentiment||50)/160,.55,1.65),leadershipMultiplier=clamp(.78+(company.leadershipReputation||50)/210,.6,1.45),riskMultiplier=clamp(1-valuationRisk/260-(company.crisis?.15:0),.35,1.2),qualityMultiplier=clamp(.72+(company.valuationQuality||50)/185,.55,1.45);
  const shockPct=activeValuationShockTotal(),shockMultiplier=clamp(1+shockPct/100,.70,1.35);
  const target=clamp(base*portfolioMultiplier*customerMultiplier*revenueMultiplier*executionMultiplier*marketMultiplier*leadershipMultiplier*riskMultiplier*qualityMultiplier*shockMultiplier,5,500);
  const noisePct=rand(-.004,.004),shock=shockPct;
  company.marketNoiseState=Number((noisePct*(company.valuation||target)).toFixed(4));
  company.valuation=clamp((company.valuation||target)*.96+target*.04+company.marketNoiseState,1,OFFICE_AQUARIUM_CONSTANTS.defaults.simulationValueCeiling);
  company.valuationDrivers={...company.valuationDrivers,valuationTarget:Number(target.toFixed(2)),dailyNoise:Number(company.marketNoiseState.toFixed(3)),activeShock:Number(shock.toFixed(3)),shockMultiplier:Number(shockMultiplier.toFixed(3)),multipliers:{portfolio:portfolioMultiplier,customer:customerMultiplier,revenue:revenueMultiplier,execution:executionMultiplier,market:marketMultiplier,leadership:leadershipMultiplier,risk:riskMultiplier,quality:qualityMultiplier,shock:shockMultiplier}};
  company.valuationHistory=company.valuationHistory.filter(point=>point.day!==company.day);
  company.valuationHistory.push({day:company.day,valuation:Number(company.valuation.toFixed(2)),dailyRevenue:Number((company.dailyRevenue||0).toFixed(4)),customers:Math.round(company.customers||0),marketSentiment:Math.round(company.marketSentiment),marketConfidence:Math.round(company.marketConfidence),valuationQuality:Math.round(company.valuationQuality),fundamentalsScore:Math.round(fundamentals),leadershipReputation:Math.round(company.leadershipReputation)});
  company.valuationHistory=company.valuationHistory.slice(-1100);
  return company.valuation;
}
function updateDailyValuation(){
  updateDailyValuationCore();
  updateInvestorReaction();
  updateInvestorRelationsReport();
  evaluateInvestorRelationsForecasts();
  return company.valuation;
}
function maybeRecordValuationStory(){
  ensureMarketValuationSystems();
  const move=valuationChange(30);
  if(company.day<30||Math.abs(move)<8||company.day-(company.lastValuationStoryDay??OFFICE_AQUARIUM_CONSTANTS.time.neverDay)<20)return;
  company.lastValuationStoryDay=company.day;
  const quality=valuationQualityLabel().toLowerCase(),direction=move>0?"rose":"fell";
  const text=`Outside confidence shifted: valuation ${direction} ${Math.abs(move).toFixed(1)}% over 30 days with ${quality} support.`;
  recordHistory(text,"market",4);
  recordWeeklyEvent(text,"market",4);
}
function addValuationShock(magnitude,reason,sourceId="system",decayDays=20){
  ensureMarketValuationSystems();
  company.valuationShocks.unshift({day:company.day,magnitude:Number(magnitude)||0,direction:magnitude>=0?"positive":"negative",reason,sourceId,decayDays});
  company.valuationShocks=company.valuationShocks.slice(0,40);
}
function reinforceBoardMarketLesson(key,delta,evidence,confidence=58){
  ensureMarketValuationSystems();
  if(typeof createLearningEpisode==="function"){
    createLearningEpisode({domain:"board",sourceId:key,choiceTitle:evidence,strategy:key,department:"company",baseline:companyLearningBaseline(),reviewSchedule:[company.day+30,company.day+90],hypotheses:[{delta,confidence,expected:"Board interpretation will be checked for durability, not only valuation reaction."}]});
  }
  const l=company.boardMarketLessons[key]||{belief:0,confidence:0,evidenceCount:0,positiveEvidence:0,contradictionEvidence:0,lastUpdatedDay:company.day,decayRate:.992};
  l.belief=clamp((l.belief||0)+delta,-10,10);l.confidence=clamp((l.confidence||0)*.88+confidence*.12,0,100);l.evidenceCount=(l.evidenceCount||0)+1;
  if(delta>=0)l.positiveEvidence=(l.positiveEvidence||0)+1;else l.contradictionEvidence=(l.contradictionEvidence||0)+1;
  l.lastUpdatedDay=company.day;l.lastEvidence=evidence;company.boardMarketLessons[key]=l;
}
function reviewBoardMarketLessons(){
  ensureMarketValuationSystems();
  Object.values(company.boardMarketLessons).forEach(l=>{l.belief=clamp((l.belief||0)*(l.decayRate||.992),-10,10);l.confidence=clamp((l.confidence||0)*.998,0,100);});
  if(company.day-company.lastValuationReviewDay<30)return;
  company.lastValuationReviewDay=company.day;
  const h=derivedOperatingHealth(),old=findValuationHistoryAtOrBefore(company.day-30)||{},v30=valuationChange(30),revUp=(company.dailyRevenue||0)>(old.dailyRevenue||0),customerUp=(company.customers||0)>(old.customers||0),volatility=valuationVolatility(60);
  if(v30>8&&company.valuationQuality>62)reinforceBoardMarketLesson("executionCredibility",.6,"Valuation and support quality improved together",68);
  if(v30>10&&company.valuationQuality<45)reinforceBoardMarketLesson("hypeDurability",-.7,"Valuation rose faster than durable support",72);
  if(v30< -8&&company.valuationQuality>62)reinforceBoardMarketLesson("investorPatience",.5,"Market fell while fundamentals stayed durable",64);
  if(revUp&&customerUp&&company.valuationQuality>55)reinforceBoardMarketLesson("customerProof",.5,"Revenue and customers improved together",66);
  if((h.portfolioHealth??50)>64&&v30>3)reinforceBoardMarketLesson("portfolioConfidence",.4,"Portfolio health supported market belief",62);
  if((h.portfolioHealth??50)<42&&v30>6)reinforceBoardMarketLesson("overexpansionRisk",-.5,"Valuation rose while portfolio health weakened",68);
  if(volatility>8)reinforceBoardMarketLesson("valuationReversalRisk",-.5,"Valuation volatility increased reversal risk",64);
  if(company.marketConfidence>62&&company.leadershipReputation>62)reinforceBoardMarketLesson("marketNarrative",.4,"Leadership reputation and market confidence reinforced each other",62);
  if(company.boardControlPressure>35)reinforceBoardMarketLesson("dilutionTolerance",-.4,"Investor control pressure increased",60);
  const fundamentalsImproved=(company.valuationDrivers?.fundamentalsScore||0)>(old.fundamentalsScore||0);
  if(v30< -7&&fundamentalsImproved)reinforceBoardMarketLesson("marketOverreaction",.5,"Market weakened while fundamentals improved",66);
}
function boardValuationView(){
  ensureMarketValuationSystems();
  const report=updateInvestorRelationsReport(),p=company.boardProfile,v30=valuationChange(30),fund=company.valuationDrivers.fundamentalsScore??companyFundamentalsScore(),risk=company.companyRiskComponents?.total??40,quality=company.valuationQuality,level=clamp((company.valuation||0)*1.2,0,100),trend=clamp(50+v30*1.8,0,100),execution=company.valuationDrivers.executionCredibility??50,cash=clamp(company.cash*5,0,100),customer=company.valuationDrivers.customerSupport??50,leadership=company.leadershipReputation??50,finance=derivedFinanceHealth(),portfolio=derivedOperatingHealth().portfolioHealth??50,investorSignal=company.investorSentiment?.confidence??50,patience=company.investorSentiment?.patience??50;
  const lessonBias=Object.values(company.boardMarketLessons||{}).reduce((s,l)=>s+(l.belief||0)*((l.confidence||0)/100),0);
  let score=investorSignal*.16+level*(p.valuationBias/100)*.13+trend*.10+quality*.14+fund*.15+customer*.09+execution*(p.executionBias/100)*.12+cash*(p.cashBias/100)*.08+leadership*.06+finance*.05+portfolio*.06+lessonBias-risk*.15-company.boardControlPressure*.07;
  if(quality<42&&v30>8)score-=10;
  if(quality>65&&v30< -7)score+=Math.max(0,(p.patience-45)*.25);
  if(patience<38&&report?.confidenceTrend==="weakening")score-=6;
  let interpretation=quality<42&&v30>7?"overheated":v30>7&&company.investorAppetite>62?"funding-window":v30>7?"improving":v30< -7&&quality<50?"weakening":v30< -7&&fund>55?"mispriced":v30< -7?"weakening":"steady";
  if(report?.dominantConcern==="volatility"&&quality>58&&fund>58)interpretation="mispriced";
  const boardPosition=interpretation==="mispriced"?"investors may be overreacting":interpretation==="overheated"?"valuation may be overheated":interpretation==="weakening"?"investor patience is weakening":interpretation==="funding-window"?"funding window may be open":"market signal is not decisive";
  company.lastBoardValuationState={day:company.day,interpretation,boardPosition,investorSignal:Math.round(investorSignal),score:Math.round(score),trend:Number(v30.toFixed(2)),quality:Math.round(quality),fundamentals:Math.round(fund),risk:Math.round(risk),memoTriggerReason:null};
  return {score:clamp(score,0,100),trend:v30,quality,level,fundamentals:fund,risk,interpretation,boardPosition,investorSignal,report};
}
function fundraisingOffer(mode="modest"){
  ensureMarketValuationSystems();
  const pre=clamp(company.valuation*(mode==="aggressive"?1.08:mode==="bridge"?.82:.95),8,600),base=mode==="aggressive"?Math.min(18,pre*.18):mode==="bridge"?Math.min(4.5,pre*.08):Math.min(8,pre*.11),app=(company.investorAppetite-50)*.025,amount=Number(clamp(base*(1+app),1.2,24).toFixed(2)),dilution=Number(clamp(amount/(pre+amount)*100+(company.valuationQuality<45?3:0)+(mode==="bridge"?4:0),3,38).toFixed(1));
  return {amount,preMoneyValuation:Number(pre.toFixed(1)),dilutionPercent:dilution,boardSeatRisk:Math.round(clamp(dilution*1.8+(company.valuationQuality<45?18:0),5,85)),expectationIncrease:Math.round(clamp(amount*2+(mode==="aggressive"?15:5),5,80)),reputationEffect:mode==="aggressive"?2:mode==="bridge"?-1:1,expiryDay:company.day+(mode==="aggressive"?45:60),mode};
}
function makeFundraisingChoice(title,detail,mode,strategy){
  const offer=fundraisingOffer(mode);
  return {title,detail:`${detail} Terms estimate: $${offer.amount}M at $${offer.preMoneyValuation}M pre-money, about ${offer.dilutionPercent}% dilution.`,effect:{cash:0,board:mode==="bridge"?-1:1},directive:null,days:0,fundraising:offer,strategy,benefits:["adds cash without product revenue","may improve recruiting confidence"],risks:["dilutes founder ownership","raises investor expectations"],uncertainty:"High",estimatedConfidence:Math.round(clamp(company.marketConfidence*.45+company.investorAppetite*.35+company.valuationQuality*.2,35,86))};
}
function makeBoardValuationMemo(kind,view){
  const report=view.report||updateInvestorRelationsReport(true),concern=report?.dominantConcern||"no single dominant concern",opportunity=report?.dominantOpportunity||"no clear investor opportunity";
  const trendText=view.trend>6?"rose quickly":view.trend<-6?"fell noticeably":"moved only modestly";
  const signalText=qualitativeBand(view.investorSignal,{low:42,high:68,lowText:"weak",midText:"mixed",highText:"strong"}),fundText=qualitativeBand(view.fundamentals,{low:45,high:68,lowText:"fragile",midText:"developing",highText:"solid"});
  const base={id:`valuation-${kind}-${company.day}`,repeatable:false,category:"board",title:"Investor confidence and valuation review",copy:"Investor Relations summarized market reaction, and the Board interpreted it through company performance and Board experience.",generatedCommunication:{type:"Board Market Letter",priority:view.interpretation==="overheated"||view.interpretation==="weakening"?"Urgent":"Decision Needed",sender:{name:"Board Market Committee",role:"Board"},subject:"Investor Confidence and Market Perception Review",message:`Investor Relations is asking for a CEO decision because outside confidence ${trendText} while investor sentiment is ${signalText} and company fundamentals are ${fundText}. The Board view is that ${view.boardPosition}. The question is whether to raise capital, change external communication, invest into the signal, or stay disciplined and let operating results catch up.`,recs:[["Board",view.interpretation==="overheated"?"Use the window carefully; support is fragile":view.interpretation==="weakening"?"Show disciplined execution before patience worsens":view.interpretation==="mispriced"?"Do not let a noisy market force a bad operating decision":"Keep market actions tied to evidence",78],["Investor Relations",opportunity!=="no clear investor opportunity"?`Investors are most receptive to ${opportunity}`:`Current investor questions focus on ${concern}`,72],["Finance",company.cash<8?"Consider funding if terms are acceptable":"Avoid raising money just because valuation moved",70],["People",company.marketConfidence>62?"A durable reputation can support recruiting":"Unstable perception can hurt candidates and retention",62]],impacts:[...(report.evidence||[]).slice(0,3),`Thirty-day valuation movement ${view.trend.toFixed(1)}%`,"Valuation may move without cash changing","Fundraising changes ownership and expectations","Board confidence depends on valuation quality, not only valuation level"]},choices:[]};
  if(kind==="improving")base.choices=[makeFundraisingChoice("Prepare a modest funding round","Use improved confidence to extend runway without overpromising.","modest","finance"),{title:"Continue without fundraising",detail:"Preserve ownership and let fundamentals keep building.",effect:{board:view.quality>60?1:-1},directive:"quality",days:6,strategy:"quality",benefits:["preserves ownership","keeps expectations grounded"],risks:["misses a favorable market window"],uncertainty:"Material",estimatedConfidence:62},{title:"Increase strategic investment",detail:"Spend selectively to turn market confidence into execution proof.",effect:{cash:-1.2,board:1,quality:2,integration:2},directive:"quality",days:8,strategy:"growth",benefits:["can validate the valuation","supports projects"],risks:["burn rises before revenue catches up"],uncertainty:"High",estimatedConfidence:56}];
  else if(kind==="weakening")base.choices=[{title:"Reassure through disciplined execution",detail:"Commit to fewer, clearer milestones rather than chasing perception.",effect:{board:2,trust:1},directive:"quality",days:8,strategy:"quality",benefits:["improves credibility","reduces narrative risk"],risks:["growth may look slower"],uncertainty:"Material",estimatedConfidence:68},{title:"Reduce speculative commitments",detail:"Cut visible hype and protect the durable core.",effect:{cash:.4,board:2,valuation:-.4},directive:"cuts",days:8,strategy:"finance",benefits:["protects valuation quality","reduces burn"],risks:["morale and opportunity cost"],uncertainty:"Material",estimatedConfidence:60},{title:"Continue current strategy",detail:"Assume the market is temporarily misreading progress.",effect:{board:view.quality>62?1:-2},directive:null,days:0,strategy:"balanced",benefits:["avoids overreaction"],risks:["weak confidence may deepen"],uncertainty:"High",estimatedConfidence:view.quality>62?58:42}];
  else if(kind==="overheated")base.choices=[makeFundraisingChoice("Raise capital now","Use the high valuation before sentiment reverses.","aggressive","finance"),{title:"Wait for fundamentals to catch up",detail:"Do not sell ownership until revenue, customers, and execution support the price.",effect:{board:view.quality<45?-1:1},directive:"quality",days:10,strategy:"quality",benefits:["avoids fragile hype","protects ownership"],risks:["window may close"],uncertainty:"High",estimatedConfidence:54},{title:"Accelerate growth to justify expectations",detail:"Invest in customers and delivery to make the valuation real.",effect:{cash:-1.8,customers:5,board:2},directive:"speed",days:8,strategy:"growth",benefits:["could validate market belief"],risks:["burnout or quality damage if the company is not ready"],uncertainty:"High",estimatedConfidence:48}];
  else if(kind==="mispricing")base.choices=[{title:"Stay the course",detail:"Treat the lower valuation as noisy external perception and keep executing against the plan.",effect:{board:view.quality>62?1:0},directive:"quality",days:6,strategy:"quality",benefits:["avoids overreacting to market noise","keeps the team focused"],risks:["the market may stay skeptical longer"],uncertainty:"Material",estimatedConfidence:view.quality>62?66:52},{title:"Improve external communication",detail:"Share clearer progress signals without promising work the company has not earned yet.",effect:{board:1,trust:1},directive:"quality",days:5,strategy:"communication",benefits:["can close a perception gap","supports recruiting and customer confidence"],risks:["creates expectations that must be met"],uncertainty:"Material",estimatedConfidence:61},{title:"Pursue a strategic partnership",detail:"Use an outside partner to validate the company while accepting slower negotiation and dependency risk.",effect:{cash:-.8,board:2,customers:3},directive:null,days:7,strategy:"growth",benefits:["adds third-party credibility","may unlock customers"],risks:["costs attention and negotiating leverage"],uncertainty:"High",estimatedConfidence:55}];
  else base.choices=[makeFundraisingChoice("Raise modest funding","Take a small round while terms are acceptable.","modest","finance"),makeFundraisingChoice("Raise aggressive funding","Prioritize runway and growth even with more dilution.","aggressive","growth"),{title:"Remain privately funded",detail:"Preserve ownership and rely on execution instead of outside capital.",effect:{board:company.cash<7?-1:1},directive:"quality",days:6,strategy:"quality",benefits:["protects ownership","keeps expectations lower"],risks:["runway may narrow"],uncertainty:"Material",estimatedConfidence:60}];
  return base;
}
function maybeQueueBoardValuationMemo(){
  ensureMarketValuationSystems();
  if(company.pendingEvent||!Array.isArray(company.escalationQueue))return;
  const cadence=OFFICE_AQUARIUM_CONSTANTS.investorRelations.memoCadence;
  const view=boardValuationView(),daysSince=company.day-(company.lastValuationMemoDay??OFFICE_AQUARIUM_CONSTANTS.time.neverDay),fundDays=company.day-(company.lastFundraisingMemoDay??OFFICE_AQUARIUM_CONSTANTS.time.neverDay);
  let kind=null,urgent=false,triggerReason=null;
  if(view.interpretation==="overheated"&&daysSince>=cadence.urgentMinimumGapDays){kind="overheated";urgent=true;triggerReason="valuation rose faster than durable support";}
  else if(view.interpretation==="weakening"&&daysSince>=cadence.urgentMinimumGapDays&&((view.report?.confidenceTrend==="weakening")||view.investorSignal<44)){kind="weakening";urgent=true;triggerReason="investor confidence weakened materially";}
  else if(view.interpretation==="funding-window"&&view.trend>7&&fundDays>=cadence.fundraisingMinimumGapDays&&company.investorAppetite>62){kind="improving";triggerReason="investor appetite and valuation support created a funding window";}
  else if(view.interpretation==="mispriced"&&daysSince>=cadence.routineMinimumGapDays){kind="mispricing";triggerReason="valuation fell despite stronger operating evidence";}
  if(!kind)return;
  if(!urgent&&daysSince<cadence.routineMinimumGapDays)return;
  const ev=makeBoardValuationMemo(kind,view);
  if(ev.choices.some(c=>c.fundraising)&&fundDays<cadence.fundraisingMinimumGapDays)return;
  company.escalationQueue.push(ev);
  company.lastValuationMemoDay=company.day;
  company.lastBoardValuationState={...(company.lastBoardValuationState||{}),memoTriggerReason:triggerReason};
  if(ev.choices.some(c=>c.fundraising))company.lastFundraisingMemoDay=company.day;
}
function applyFundraisingDecision(offer){
  if(!offer)return;
  ensureMarketValuationSystems();
  company.cash=clamp(company.cash+(offer.amount||0),0,OFFICE_AQUARIUM_CONSTANTS.defaults.simulationValueCeiling);
  company.founderOwnership=clamp((company.founderOwnership||100)-(offer.dilutionPercent||0),0,100);
  company.investorOwnership=clamp(100-company.founderOwnership,0,100);
  company.boardControlPressure=clamp((company.boardControlPressure||0)+(offer.boardSeatRisk||0)*.18+(offer.expectationIncrease||0)*.12,0,100);
  company.leadershipReputation=clamp(company.leadershipReputation+(offer.reputationEffect||0),0,100);
  applyInvestorEffect({confidence:(offer.amount||0)*.6-(offer.dilutionPercent||0)*.15});
  if(company.investorSentiment){company.investorSentiment.dilutionConcern=clamp((company.investorSentiment.dilutionConcern||0)+(offer.dilutionPercent||0)*.8,0,100);company.investorSentiment.dominantConcern=company.investorSentiment.dilutionConcern>55?"dilution":company.investorSentiment.dominantConcern;}
  investorRelationsLearningUpdate("fundraisingTiming",offer.mode==="bridge"&&company.valuationQuality<45?-.4:.35);
  investorRelationsLearningUpdate("fundraisingTimingAccuracy",offer.mode==="bridge"&&company.valuationQuality<45?-.4:.35);
  addValuationShock(Math.max(.8,(offer.amount||0)*.18),`Funding round added $${Number(offer.amount||0).toFixed(1)}M but increased expectations`,"fundraising",35);
  reinforceBoardMarketLesson("fundraisingTiming",offer.mode==="bridge"&&company.valuationQuality<45?-.4:.5,`Raised $${offer.amount}M at $${offer.preMoneyValuation}M pre-money`,70);
  recordHistory(`The company raised $${Number(offer.amount||0).toFixed(1)}M at a $${Number(offer.preMoneyValuation||0).toFixed(1)}M pre-money valuation, leaving founders with ${company.founderOwnership.toFixed(1)}% ownership.`,"finance",6);
  recordWeeklyEvent(`The company raised $${Number(offer.amount||0).toFixed(1)}M in new funding.`,"finance",6);
}
function valuationTrendLabel(){
  const cfg=valuationRangeConfig(),d=valuationDisplayChange(cfg.days),c=d.change,arrow=c>.05?"up":c<-.05?"down":"flat",window=valuationRangeText(cfg.days,d.days);
  return `${arrow} ${formatValuationDelta(d.amount)} (${formatPercentDelta(c)}) over ${window}`;
}
function marketValuationDebugHtml(){
  ensureMarketValuationSystems();
  const lessons=Object.entries(company.boardMarketLessons||{}).slice(0,8).map(([k,l])=>`${k}: ${Number(l.belief||0).toFixed(1)} (${Math.round(l.confidence||0)}%)`).join("<br>")||"No board market lessons yet.";
  const shocks=(company.valuationShocks||[]).slice(0,5).map(s=>`${s.direction} ${Number(s.magnitude||0).toFixed(2)}: ${s.reason}`).join("<br>")||"No active shocks.";
  const d=company.valuationDrivers||{},w=company.worldState||{},s=company.investorSentiment||{},r=company.investorRelationsReport||{},b=company.lastBoardValuationState||{},irl=company.investorRelationsLearning||{};
  return `<strong>Valuation Integrity</strong><br>Fundamentals ${Math.round(d.fundamentalsScore??companyFundamentalsScore())}; institutional capability ${Math.round(institutionalCapabilityScore())}<br>Target $${Number(d.valuationTarget||0).toFixed(1)}M; noise $${Number(d.dailyNoise||0).toFixed(3)}M; shock ${Number(d.activeShock||0).toFixed(2)}%; multiplier ${Number(d.shockMultiplier||1).toFixed(3)}<br><strong>Investor State</strong><br>Confidence ${Math.round(s.confidence||0)}, patience ${Math.round(s.patience||0)}, growth expectation ${Math.round(s.growthExpectation||0)}, execution concern ${Math.round(s.executionConcern||0)}, dilution ${Math.round(s.dilutionConcern||0)}, volatility ${Math.round(s.volatilityConcern||0)}, valuation ${Math.round(s.valuationConcern||0)}<br>Concern ${s.dominantConcern||"none"}; opportunity ${s.dominantOpportunity||"none"}<br><strong>Investor Relations</strong><br>Report day ${r.generatedDay??"none"}; trend ${r.confidenceTrend||"n/a"}; band ${r.confidenceBand||"n/a"}<br>Evidence ${(r.evidence||[]).join("; ")||"none"}<br>Source IDs ${(r.sourceIds||[]).join(", ")||"none"}<br>Learning concern ${Number(irl.concernDetection||0).toFixed(1)}, volatility ${Number(irl.volatilityInterpretation||0).toFixed(1)}, fundraising ${Number(irl.fundraisingTiming||0).toFixed(1)}, narrative ${Number(irl.narrativeAccuracy||0).toFixed(1)}, overreaction ${Number(irl.overreactionBias||0).toFixed(1)}<br><strong>Board Interpretation</strong><br>${b.boardPosition||b.interpretation||"No board interpretation yet"}; score ${b.score??"n/a"}; trigger ${b.memoTriggerReason||"none"}<br><strong>Market</strong><br>Sentiment ${Math.round(company.marketSentiment)}, confidence ${Math.round(company.marketConfidence)}, leadership ${Math.round(company.leadershipReputation)}, quality ${Math.round(company.valuationQuality)} (${valuationQualityLabel()}), appetite ${Math.round(company.investorAppetite)}<br><strong>World</strong> capital ${Math.round(w.capitalClimate||0)}, sector ${Math.round(w.sectorEnthusiasm||0)}, rates ${Math.round(w.interestRatePressure||0)}, regulation ${Math.round(w.regulatoryPressure||0)}, supply ${Math.round(w.supplyReliability||0)}, talent ${Math.round(w.talentMarket||0)}, competitors ${Math.round(w.competitorAggression||0)}<br><strong>Board profile</strong> ${company.boardProfile?.orientation}: growth ${company.boardProfile?.growthBias}, cash ${company.boardProfile?.cashBias}, valuation ${company.boardProfile?.valuationBias}, execution ${company.boardProfile?.executionBias}, people ${company.boardProfile?.employeeBias}, patience ${company.boardProfile?.patience}<br><strong>Active shocks</strong><br>${shocks}<br><strong>Board lessons</strong><br>${lessons}`;
}
function recordMajorHistory(text,type="general",importance=4){recordHistory(text,type,importance);recordWeeklyEvent(text,type,importance);}
function strongestCompanyMemory(type){ensureBibleSystems();return company.history.filter(h=>!type||h.type===type).sort((a,b)=>(b.importance||0)-(a.importance||0))[0]||null;}

class MarketValuationSystem{
  ensure(){return ensureMarketValuationSystems();}
  daily(){return updateDailyValuation();}
  investorReaction(force=false){return updateInvestorReaction(force);}
  investorReport(force=false){return updateInvestorRelationsReport(force);}
  boardView(){return boardValuationView();}
  trendLabel(){return valuationTrendLabel();}
  debugHtml(){return marketValuationDebugHtml();}
}
