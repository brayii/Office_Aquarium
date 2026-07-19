const DAILY_PIPELINE_STAGE_ORDER=OFFICE_AQUARIUM_CONSTANTS.dailyPipeline.stageOrder;
const MANUFACTURING_RULES=OFFICE_AQUARIUM_CONSTANTS.manufacturing;

function captureDailyPipelineContext(){
  const active=employees.filter(e=>e.active);
  return {
    activeAtClose:active.length,
    morale:active.reduce((sum,e)=>sum+e.morale,0)/Math.max(1,active.length),
    stress:avgStress(),
    dailyCost:0,
    portfolioSpend:0
  };
}

function processDailyEmployeeLifecycle(){
  employees.forEach(e=>{
    if(!e.active)return;
    decayMemories(e);
    if(e.stress>72){
      addMemory(e,"OVERTIME","The workload felt excessive today.","negative",7,"leadership");
      adjustCEOOpinion(e,{support:-.7,trust:-.4,fear:.3});
    }
    e.energy=clamp(e.energy+30,0,100);
    e.focus=clamp(e.focus+16,0,100);
    applyEmployeeEmotionDelta(e,{stressDelta:-10.5,reasonCode:"overnight-recovery",sourceEventId:`daily-close-${company.day}`,ignoreCooldown:true});
    const relationship=averageRelationship(e);
    applyEmployeeEmotionDelta(e,{moraleDelta:relationship>20?.6:relationship<-20?-1.2:0,reasonCode:"relationship-climate",sourceEventId:`daily-close-${company.day}`,ignoreCooldown:true});
    if(e.stress>88){
      e.daysAtRisk++;
      if(simulationRandom()<.08){
        e.sickDays=1+Math.floor(simulationRandom()*3);
        recordMetricEvent("sickness");
        company.log.push(`${e.name} called in sick after sustained stress.`);
      }
    }else{
      e.daysAtRisk=Math.max(0,e.daysAtRisk-1);
    }
    if(e.sickDays>0){
      e.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(e.performance||{})};
      e.performance.absenceDays++;
      e.sickDays--;
      if(e.sickDays===0){
        e.action="recovering";
        e.thought="I should be ready to return tomorrow.";
      }
    }
    if(e.achievements>=3&&e.careerLevel<3){
      e.careerLevel++;
      e.achievements=0;
      applyEmployeeEmotionDelta(e,{moraleDelta:8,reasonCode:"promotion",sourceEventId:`promotion-${e.id}-${company.day}`,exceptional:true});
      e.careerHistory.push(`Promoted to level ${e.careerLevel} on day ${company.day}`);
      company.log.push(`${e.name} earned a promotion through sustained contribution.`);
      recordWeeklyEvent(`${e.name} earned a promotion.`,"people",4);
      recordHistory(`${e.name} was promoted to career level ${e.careerLevel}.`,"people",4);
      const promotionWitness=employees.find(other=>other.active&&!other.offsite&&other.id!==e.id&&other.currentRoom&&other.currentRoom===e.currentRoom);
      if(promotionWitness&&typeof recordSharedExperience==="function")recordSharedExperience(e,promotionWitness,{
        type:"recognition_shared",
        sourceEventId:`promotion-${e.id}-${company.day}`,
        roomId:e.currentRoom,
        tone:"positive",
        intensity:4,
        actorId:promotionWitness.id,
        subjectId:e.id,
        category:"celebration",
        confidence:100,
        context:{workTitle:`${e.name}'s promotion`,newsTopic:`${e.name}'s promotion`}
      });
    }
    applyDailyPersonalityEmotion?.(e);
    if(e.performance){
      e.performance.recentOutput*=.96;
      const beforeMistakes=e.performance.qualityMistakes||0;
      e.performance.qualityMistakes*=.94;
      recordQualityResolution(Math.max(0,beforeMistakes-(e.performance.qualityMistakes||0)));
      if(e.performance.coachingDays>0)e.performance.coachingDays--;
      updatePerformanceReviewRisk(e);
    }
    if(e.daysAtRisk>=4&&e.morale<30&&simulationRandom()<(.10+(55-(e.opinionOfCEO?.trust||55))*.002)){
      const baseline=companyLearningBaseline?.();
      e.active=false;
      e.offsite=true;
      e.action="resigned";
      if(!company.openRoles.includes(e.role))company.openRoles.push(e.role);
      company.board-=4;
      recordMetricEvent("resignations");
      company.log.push(`${e.name}, the ${e.role}, resigned after prolonged burnout.`);
      recordWeeklyEvent(`${e.name}, the ${e.role}, resigned after prolonged burnout.`,"people",5);
      recordLearningEvidence({domain:"workforce",eventType:"burnout-resignation",action:"resignation",outcome:"negative",magnitude:1,confidence:82,department:employeeTeam(e),employeeIds:[e.id],evidence:`${e.name} resigned after burnout`,contributors:[{type:"stress",id:"burnout",weight:.45},{type:"leadershipTrust",id:"ceo",weight:.25},{type:"workload",id:employeeTeam(e),weight:.3}]});
      createLearningEpisode?.({
        domain:"workforce",
        subtype:"workforce.burnout-resignation",
        sourceId:`burnout-resignation-${e.id}-${company.day}`,
        decisionTitle:"Burnout resignation",
        choiceTitle:`${e.name} resigned after sustained overload`,
        strategy:"burnout-recovery",
        department:employeeTeam(e),
        employeeIds:[e.id],
        baseline,
        attributionSources:[`employee-${e.id}`,"burnout-watch"],
        attributionQuality:72,
        reviewSchedule:[company.day+14,company.day+30,company.day+60],
        hypotheses:[{expected:"Later workforce outcomes will show whether overload and recovery practices contributed to the departure."}]
      });
      recordHistory(`${e.name} resigned after prolonged burnout.`,"people",5);
    }
  });
}

function processDailyManufacturingFulfillment(){
  if(company.phase!==OFFICE_AQUARIUM_CONSTANTS.productPhases.launched||!company.manufacturing)return;
  const fulfillment=(company.manufacturing.readiness+company.manufacturing.yield+company.manufacturing.capacity)/300;
  if(fulfillment>=MANUFACTURING_RULES.fulfillmentThreshold)return;
  const shortfall=MANUFACTURING_RULES.fulfillmentThreshold-fulfillment;
  const penalty=company.dailyRevenue*shortfall*MANUFACTURING_RULES.revenuePenaltyRate;
  company.cash=clamp(company.cash-penalty,0,999);
  company.trust=clamp(company.trust-shortfall*MANUFACTURING_RULES.trustPenaltyScale,0,100);
  recordCustomerExperience?.("enterprise","delivery-delay",Math.round(58+(1-fulfillment)*24),"Manufacturing fulfillment delays affected customer delivery.","manufacturing",true);
  Object.values(company.customerSegments||{}).forEach(segment=>{
    segment.sentiment=clamp((segment.sentiment||50)-shortfall*MANUFACTURING_RULES.customerSentimentPenaltyScale,0,100);
    segment.trust=clamp((segment.trust||50)-shortfall*MANUFACTURING_RULES.customerTrustPenaltyScale,0,100);
  });
  syncCustomerSummaryFromSegments?.();
  const owner=employees.filter(e=>e.active).find(e=>canonicalRole(e.role)==="Software QA Engineer")||employees.find(e=>e.active);
  if(owner)recordQualityMistake(owner,"launched-product fulfillment defects",.6);
  recordHistory(`Manufacturing fulfillment dragged revenue by $${penalty.toFixed(2)}M.`,"manufacturing",3);
}

function processDailyFinance(context){
  company.dailyRevenue=Number((calculateCustomerRevenueDaily()+commercialProjectRevenueDaily()).toFixed(4));
  context.portfolioSpend=company.portfolioHealth?.totalProjectSpendDaily||0;
  context.dailyCost=calculateLivingFinance()+context.portfolioSpend;
  company.finance.totalDailyCost+=context.portfolioSpend;
  company.finance.netCashFlowDaily-=context.portfolioSpend;
  company.finance.runwayDays=company.finance.netCashFlowDaily<0
    ?Math.max(0,Math.floor(company.cash/Math.abs(company.finance.netCashFlowDaily)))
    :OFFICE_AQUARIUM_CONSTANTS.time.unknownFutureDay;
  company.cash+=company.finance.netCashFlowDaily;
  if(company.unpaidPayrollDays>0){
    employees.filter(e=>e.active).forEach(e=>{
      applyEmployeeEmotionDelta(e,{moraleDelta:-4,stressDelta:5,reasonCode:"unpaid-payroll",sourceEventId:`payroll-${company.day}`,ignoreCooldown:true});
      adjustCEOOpinion(e,{trust:-3,fairness:-4,support:-3,fear:3});
    });
    recordWeeklyEvent("Payroll could not be fully covered.","finance",6);
  }
}

function processDailyWorkforce(context){
  ensureLeadershipSystems();
  ensureWorkforceEconomySystems();
  processInternalTransfersDaily();
  updateCompanyCapabilitySystem({createSupport:true});
  updateOrganizationalMomentum();
  evaluateEmployeeRetentionDaily();
  processOrganizationalReviews();
  applyHiringPolicyToRecruiting();
  processRecruitingPipeline();
  completeDueOnboarding();
  maybeQueueHiringFreezeException();
  maybeQueueHiringPolicyReview();
  applyStaffingPressure();
  employees.filter(e=>e.active).forEach(processBurnoutResponseDaily);
  processManagerPerformanceDaily();
  maybeQueueHiringRequests();
  maybeQueueRestructuringRequest();
  maybeIssueOrEvaluatePip();
  applyDailyOrganizationalPressure(context.morale,context.stress);
  if(company.directiveDays>0){
    company.directiveDays--;
    if(company.directiveDays===0)completePolicyTransition();
  }
  processDailyEmployeeLifecycle();
}

function processDailyExecutiveCommunication(){
  processDecisionThreads();
  updateTeamOperationalState();
  employees.forEach(updateEmployeeBeliefsAndBriefing);
  updateIssueRecords();
  generateEmployeeCommunications();
  processInternalEscalations();
  updateExecutiveObservations?.();
  applyExecutiveIntelligenceLearning?.();
}

function processDailyNarrative(context){
  if(company.finance?.runwayDays<75){
    recordLearningEvidence({domain:"finance",eventType:"runway-pressure",action:"daily-runway",outcome:"negative",magnitude:clamp((75-company.finance.runwayDays)/75,0,1),confidence:65,department:"finance",evidence:`Runway ${company.finance.runwayDays} ${company.finance.runwayDays===1?"day":"days"}`,contributors:[{type:"cash",id:"company",weight:.5},{type:"cost",id:"operations",weight:.5}]});
  }
  company.log.push(`Day ${company.day}: revenue $${company.dailyRevenue.toFixed(2)}M, operating cost $${context.dailyCost.toFixed(2)}M, morale ${Math.round(context.morale)}, stress ${Math.round(context.stress)}.`);
  recordHistory(`Day ${company.day} closed with ${company.cash.toFixed(1)}M cash, ${Math.round(company.customers)} customers, and ${Math.round(context.stress)} average stress.`,"daily",1);
  if(company.cash>25&&company.day>20&&!company.history.some(h=>h.type==="finance"&&String(h.text).includes("cash reserve")))recordMajorHistory("The company built a meaningful cash reserve.","finance",4);
  if(company.dailyRevenue>context.dailyCost&&company.phase===OFFICE_AQUARIUM_CONSTANTS.productPhases.launched&&!company.history.some(h=>h.type==="finance"&&String(h.text).includes("Revenue became positive")))recordMajorHistory("Revenue became positive after launch.","finance",5);
  if(company.customers>=100&&!company.history.some(h=>h.type==="customer"&&String(h.text).includes("100 customers")))recordMajorHistory("The company reached 100 customers.","customer",5);
  if(company.cash>12)company.cashEventArmed=true;
  if(company.day>0&&company.day%5===0)publishWeeklyNewspaper();
  if(company.manufacturing?.supplyRisk>82&&simulationRandom()<.18)recordMajorHistory("Supply pressure disrupted manufacturing planning.","manufacturing",4);
  if(company.shareholders?.pressure>78&&simulationRandom()<.16)recordMajorHistory("Investor pressure increased on the board.","board",4);
  pruneLongRunCollections();
}

function dailyPipelineHandlers(context){
  return {
    "employee-outcomes":()=>processDelayedDecisionEffects(),
    "work-items":()=>{maintainWorkItems();updateTeamOperationalState();},
    "projects-portfolio":()=>updateProjectPortfolioSystem(),
    "customers-manufacturing":()=>{
      updateManufacturingAndStakeholders();
      updateCustomerMarketDaily();
      if(company.phase===OFFICE_AQUARIUM_CONSTANTS.productPhases.pilot)company.pilotDays++;
      company.dailyRevenue=Number((calculateCustomerRevenueDaily()+commercialProjectRevenueDaily()).toFixed(4));
      processDailyManufacturingFulfillment();
    },
    finance:()=>processDailyFinance(context),
    "market-labor":()=>{updateMarket();updateHiddenWorldState();updateLaborMarketDaily();},
    valuation:()=>updateDailyValuationCore(),
    "investor-reaction":()=>updateInvestorReaction(),
    "investor-relations":()=>{updateInvestorRelationsReport();evaluateInvestorRelationsForecasts();},
    board:()=>{
      maybeRecordValuationStory();
      reviewBoardMarketLessons();
      maybeQueueBoardValuationMemo();
      updateBoardConfidenceDaily(context.morale,context.stress);
    },
    workforce:()=>processDailyWorkforce(context),
    "social-organization":()=>processSocialOrganizationDaily(),
    "organizational-friction":()=>updateDepartmentFrictionDaily(),
    "risk-pillars":()=>updateCompanyRiskComponents({recordForValuation:true}),
    "crisis-lifecycle":()=>{updateCrisisRiskSystem();evaluateFailure();if(!company.gameOver)advanceCrisisDay();},
    "learning-reviews":()=>{reviewLearningEpisodes();reviewInstitutionalPatterns();},
    "executive-communication":()=>processDailyExecutiveCommunication(),
    narrative:()=>processDailyNarrative(context),
    telemetry:()=>collectDailyMetrics?.(),
    save:()=>{if(!validationMode)saveGame();}
  };
}

function dailyCloseCoreOrdered(){
  const context=captureDailyPipelineContext();
  const handlers=dailyPipelineHandlers(context);
  let terminal=false;
  for(const stage of DAILY_PIPELINE_STAGE_ORDER){
    const handler=handlers[stage];
    if(typeof handler!=="function")throw new Error(`Missing daily pipeline handler: ${stage}`);
    const shouldRun=!terminal||stage==="telemetry"||stage==="save";
    runDailyStage(stage,shouldRun?handler:()=>{});
    if(company.gameOver)terminal=true;
  }
}
