/*
  Shared constants for Office Aquarium.

  Codex/reviewer rule:
  If a value represents a reusable game rule, label, timing, status, threshold,
  or default, use the constant from this file. If the needed constant does not
  exist yet, add it here first, then update every caller that depends on the
  same meaning. Do not copy/paste magic numbers or status strings across the
  simulation.
*/
function deepFreezeConstants(value){
  if(!value||typeof value!=="object"||Object.isFrozen(value))return value;
  Object.getOwnPropertyNames(value).forEach(key=>deepFreezeConstants(value[key]));
  return Object.freeze(value);
}

globalThis.OFFICE_AQUARIUM_CONSTANTS=deepFreezeConstants({
  storage:{
    saveKey:"office-aquarium-living-office-v3",
    saveVersion:38
  },
  determinism:{
    defaultRandomState:2463534242,
    firstRuntimeId:1
  },
  time:{
    minutesPerDay:1440,
    workdayStartMinute:480,
    workdayEndMinute:1200,
    offsiteReturnCutoffMinute:1020,
    unknownFutureDay:999,
    quarterlyReviewDays:91,
    annualReviewDays:365
  },
  defaults:{
    neutralScore:50,
    healthyScore:55,
    unknownSkill:35,
    unknownLeadershipSkill:45,
    unknownSupplyRisk:35,
    unknownQualityRisk:35,
    unknownTeamCohesion:55,
    maxScore:100,
    minScore:0
  },
  social:{
    neutralRelationship:{
      trust:50,
      respect:50,
      comfort:50,
      professionalFriction:0
    },
    familiarityKnownThreshold:15,
    passiveBreakThresholdMinutes:20,
    passiveRoomThresholdMinutes:60,
    socialNeedThreshold:55,
    minFamiliarity:0,
    maxFamiliarity:100
  },
  cohesion:{
    collaborationBase:45,
    collaborationPerDayWeight:12,
    recentDepartureWindowDays:45,
    layoffPenalty:8,
    departurePenalty:3
  },
  retention:{
    defaultBelonging:50
  },
  recommendations:{
    minScore:5,
    maxScore:95,
    supportScore:66,
    opposeScore:42
  },
  sound:{
    modes:{
      both:"both",
      alerts:"alerts",
      music:"music",
      off:"off"
    },
    defaultMode:"both"
  },
  aiOwners:{
    work:"work-ai",
    social:"social-ai",
    institutional:"institutional-learning",
    emotional:"emotional-system"
  },
  projectStatus:{
    proposal:"proposal",
    planning:"planning",
    approved:"approved",
    prototype:"prototype",
    execution:"execution",
    verification:"verification",
    pilot:"pilot",
    scaling:"scaling",
    atRisk:"at risk",
    blocked:"blocked",
    paused:"paused",
    completed:"completed",
    canceled:"canceled",
    failed:"failed",
    rejected:"rejected",
    merged:"merged"
  },
  messageStatus:{
    queuedForCeo:"queued-for-ceo",
    active:"active",
    archived:"archived",
    deleted:"deleted"
  },
  hiringStatus:{
    needIdentified:"Need Identified",
    departmentReview:"Department Review",
    financeHrReview:"Finance/HR Review",
    ceoApproval:"CEO Approval",
    candidateSearch:"Candidate Search",
    interviewing:"Interviewing",
    offer:"Offer",
    onboarding:"Onboarding",
    onboardingComplete:"Onboarding Complete",
    paused:"Paused",
    suppressed:"Suppressed"
  },
  startingCompany:{
    cash:18,
    board:72,
    trust:68,
    chip:22,
    software:31,
    quality:38,
    integration:15,
    valuation:42,
    phase:"prototype",
    marketSentiment:50,
    marketConfidence:50,
    leadershipReputation:50,
    valuationQuality:50,
    investorAppetite:50
  }
});
