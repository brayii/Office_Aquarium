const ROOM_CAPACITY={
  "software-studio":8,
  "hardware-lab":6,
  "meeting-room":8,
  "break-area":6,
  "executive-suite":5
};
const ROOM_ZONE_MAP={
  "software-studio":"dev",
  "hardware-lab":"lab",
  "meeting-room":"meet",
  "break-area":"break",
  "executive-suite":"exec"
};
const ZONE_ROOM_MAP=Object.fromEntries(Object.entries(ROOM_ZONE_MAP).map(([room,zone])=>[zone,room]));
const ROLE_ALIASES={
  "Software Lead":"Technical Lead",
  "QA Engineer":"Software QA Engineer",
  "Verification Engineer":"Software QA Engineer"
};
const ROLE_DEFINITIONS={
  "Software Engineer":{
    primaryRoom:"software-studio",secondaryRooms:["meeting-room","break-area"],allowedActivities:["coding","debugging","code review","software testing","pair programming","issue investigation"],department:"software",skills:{software:82,firmware:42,verification:46,architecture:46,leadership:38,communication:48},leadershipLevel:0,projectCapabilities:{software:1,quality:.45,integration:.7}
  },
  "Firmware Engineer":{
    primaryRoom:"software-studio",secondaryRooms:["hardware-lab","meeting-room","break-area"],allowedActivities:["firmware integration","debugging","coding","hardware integration","issue investigation"],department:"software",skills:{firmware:82,software:58,hardware:64,verification:46,architecture:42,leadership:38,communication:46},leadershipLevel:0,projectCapabilities:{software:.75,hardware:.55,integration:1}
  },
  "Software QA Engineer":{
    primaryRoom:"software-studio",secondaryRooms:["hardware-lab","meeting-room","break-area"],allowedActivities:["software testing","debugging","code review","issue investigation","validation"],department:"quality",skills:{verification:82,software:58,hardware:42,firmware:45,communication:48,leadership:36},leadershipLevel:0,projectCapabilities:{quality:1,software:.55,integration:.65}
  },
  "Technical Lead":{
    primaryRoom:"software-studio",secondaryRooms:["meeting-room","executive-suite","break-area"],allowedActivities:["architecture work","code review","planning","mentoring","design discussions","project coordination"],department:"software",skills:{software:84,architecture:68,firmware:52,leadership:70,communication:62,verification:52},leadershipLevel:1,projectCapabilities:{software:1,leadership:.85,integration:.8}
  },
  "Software Architect":{
    primaryRoom:"software-studio",secondaryRooms:["meeting-room","executive-suite","break-area"],allowedActivities:["architecture work","design reviews","planning","mentoring","issue investigation"],department:"software",skills:{software:86,architecture:84,firmware:48,leadership:62,communication:58,verification:48},leadershipLevel:1,projectCapabilities:{software:1,architecture:1,integration:.75}
  },
  "Hardware Engineer":{
    primaryRoom:"hardware-lab",secondaryRooms:["meeting-room","break-area"],allowedActivities:["prototyping","hardware testing","validation","board testing","hardware integration"],department:"hardware",skills:{hardware:82,verification:52,architecture:48,firmware:42,leadership:38,communication:46},leadershipLevel:0,projectCapabilities:{hardware:1,quality:.5,integration:.6}
  },
  "Chip Architect":{
    primaryRoom:"hardware-lab",secondaryRooms:["meeting-room","executive-suite","break-area"],allowedActivities:["chip design","architecture work","design reviews","hardware integration","strategic planning"],department:"hardware",skills:{architecture:82,hardware:78,verification:48,leadership:52,communication:52,firmware:40},leadershipLevel:1,projectCapabilities:{hardware:1,architecture:1,integration:.55}
  },
  "Electrical Engineer":{
    primaryRoom:"hardware-lab",secondaryRooms:["meeting-room","break-area"],allowedActivities:["board testing","hardware testing","validation","prototyping","reliability work"],department:"hardware",skills:{hardware:80,verification:58,architecture:50,firmware:40,leadership:36,communication:44},leadershipLevel:0,projectCapabilities:{hardware:1,quality:.65}
  },
  "Industrial Designer":{
    primaryRoom:"hardware-lab",secondaryRooms:["meeting-room","break-area"],allowedActivities:["prototyping","design verification","manufacturing preparation","design discussions"],department:"hardware",skills:{hardware:64,product:58,communication:55,architecture:46,verification:42,leadership:38},leadershipLevel:0,projectCapabilities:{hardware:.65,product:.65,manufacturing:.45}
  },
  "Manufacturing Engineer":{
    primaryRoom:"hardware-lab",secondaryRooms:["meeting-room","executive-suite","break-area"],allowedActivities:["manufacturing preparation","yield improvement","reliability work","validation","supplier qualification"],department:"hardware",skills:{hardware:72,verification:64,leadership:48,communication:50,finance:36},leadershipLevel:0,projectCapabilities:{manufacturing:1,hardware:.75,quality:.6}
  },
  "Product Manager":{
    primaryRoom:"meeting-room",secondaryRooms:["executive-suite","software-studio","break-area"],allowedActivities:["roadmap reviews","project coordination","customer analysis","planning","cross-department decisions"],department:"product",skills:{product:84,communication:78,leadership:62,software:38,finance:34},leadershipLevel:1,projectCapabilities:{product:1,leadership:.65,customer:.8}
  },
  "Finance Analyst":{
    primaryRoom:"executive-suite",secondaryRooms:["meeting-room","break-area"],allowedActivities:["budget reviews","forecasting","board preparation","strategic planning"],department:"finance",skills:{finance:86,communication:54,leadership:42,product:36,software:25},leadershipLevel:0,projectCapabilities:{finance:1,leadership:.35}
  },
  "Manager":{
    primaryRoom:"meeting-room",secondaryRooms:["executive-suite","break-area"],allowedActivities:["project coordination","mentoring","planning","crisis meetings","hiring interviews"],department:"people",skills:{leadership:74,communication:72,product:44,finance:38,software:35},leadershipLevel:2,projectCapabilities:{leadership:1,people:1}
  },
  "Director":{
    primaryRoom:"executive-suite",secondaryRooms:["meeting-room","break-area"],allowedActivities:["executive briefings","budget reviews","strategic planning","hiring approvals"],department:"people",skills:{leadership:82,communication:76,finance:48,product:52},leadershipLevel:3,projectCapabilities:{leadership:1,people:1,finance:.45}
  },
  "Vice President":{
    primaryRoom:"executive-suite",secondaryRooms:["meeting-room"],allowedActivities:["executive briefings","board reviews","strategic planning","restructuring discussions"],department:"people",skills:{leadership:90,communication:82,finance:58,product:58},leadershipLevel:4,projectCapabilities:{leadership:1,people:1,finance:.55}
  }
};
const FOUNDING_ROLES=["Software Engineer","Firmware Engineer","Hardware Engineer","Chip Architect","Software QA Engineer","Industrial Designer","Product Manager","Finance Analyst"];
const DEFAULT_COMPANY_CAPABILITY_NEEDS={
  managementCapacity:0,
  portfolioGovernance:0,
  financialPlanning:0,
  manufacturingReadiness:0,
  customerSupportCapacity:0,
  technicalLeadership:0,
  mentoringCapacity:0,
  successionCoverage:0,
  crossProjectCoordination:0,
  executiveCommunication:0
};
const COMPANY_CAPABILITY_TO_ROLES={
  managementCapacity:["Manager","Director"],
  portfolioGovernance:["Director","Vice President"],
  financialPlanning:["Finance Analyst"],
  manufacturingReadiness:["Manufacturing Engineer"],
  customerSupportCapacity:["Product Manager","Manager"],
  technicalLeadership:["Technical Lead","Software Architect","Chip Architect"],
  mentoringCapacity:["Technical Lead","Manager","Director"],
  successionCoverage:["Manager","Director","Vice President"],
  crossProjectCoordination:["Product Manager","Manager","Director"],
  executiveCommunication:["Vice President","Director","Finance Analyst"]
};
const COMPANY_CAPABILITY_LABELS={
  managementCapacity:"Management capacity",
  portfolioGovernance:"Portfolio governance",
  financialPlanning:"Financial planning",
  manufacturingReadiness:"Manufacturing readiness",
  customerSupportCapacity:"Customer support capacity",
  technicalLeadership:"Technical leadership",
  mentoringCapacity:"Mentoring capacity",
  successionCoverage:"Succession coverage",
  crossProjectCoordination:"Cross-project coordination",
  executiveCommunication:"Executive communication"
};
const COMPANY_CAPABILITY_DEPARTMENT={
  managementCapacity:"people",
  portfolioGovernance:"people",
  financialPlanning:"finance",
  manufacturingReadiness:"hardware",
  customerSupportCapacity:"product",
  technicalLeadership:"software",
  mentoringCapacity:"people",
  successionCoverage:"people",
  crossProjectCoordination:"product",
  executiveCommunication:"people"
};
const COMPANY_CAPABILITY_SUPPORT_WORK={
  managementCapacity:{department:"people",type:"coordination",title:"Balance workloads and resolve people issues"},
  portfolioGovernance:{department:"people",type:"portfolio",title:"Coordinate portfolio priorities and staffing"},
  financialPlanning:{department:"finance",type:"forecasting",title:"Improve runway forecast and hiring affordability"},
  manufacturingReadiness:{department:"hardware",type:"manufacturing",title:"Prepare suppliers and production readiness"},
  customerSupportCapacity:{department:"product",type:"customer",title:"Prepare customer support and launch handoff"},
  technicalLeadership:{department:"software",type:"architecture",title:"Review architecture and integration risk"},
  mentoringCapacity:{department:"people",type:"mentoring",title:"Mentor onboarding and reduce knowledge gaps"},
  successionCoverage:{department:"people",type:"succession",title:"Develop succession and acting-role coverage"},
  crossProjectCoordination:{department:"product",type:"coordination",title:"Resolve cross-project dependency conflicts"},
  executiveCommunication:{department:"people",type:"executive",title:"Prepare executive communication and board context"}
};
function canonicalRole(role){return ROLE_DEFINITIONS[role]?role:(ROLE_ALIASES[role]||role);}
function roleDefinition(role){const canonical=canonicalRole(role);return ROLE_DEFINITIONS[canonical]||null;}
function allRecruitableRoles(){return Object.keys(ROLE_DEFINITIONS);}
function roleDepartment(role){const def=roleDefinition(role);if(!def)throw new Error(`Unknown role department: ${role}`);return def.department;}
function employeeTeam(e){return roleDepartment(e?.role);}
function rolePrimaryRoom(role){const def=roleDefinition(role);if(!def)throw new Error(`Unknown role room: ${role}`);return def.primaryRoom;}
function roleSecondaryRooms(role){return [...(roleDefinition(role)?.secondaryRooms||[])];}
function roleAllowedActivities(role){return [...(roleDefinition(role)?.allowedActivities||[])];}
function roleProjectCapabilities(role){return {...(roleDefinition(role)?.projectCapabilities||{})};}
function roleLeadershipLevel(role){return Number(roleDefinition(role)?.leadershipLevel)||0;}
function roomForZone(zone){return ZONE_ROOM_MAP[zone]||null;}
function zoneForRoom(room){return ROOM_ZONE_MAP[room]||"dev";}
function roomOccupancy(room){const zone=zoneForRoom(room);return (employees||[]).filter(e=>e.active&&!e.offsite&&e.zone===zone).length;}
function roomCongestion(room){return clamp(roomOccupancy(room)/Math.max(1,ROOM_CAPACITY[room]||6),0,2);}
function baseSkillsForRole(role){
  const common={architecture:35,verification:35,firmware:35,software:35,hardware:35,leadership:35,communication:45,finance:25,product:30};
  return {...common,...(roleDefinition(role)?.skills||{})};
}
function salaryBandForRole(role){
  return {
    "Software Engineer":[.13,.19],"Firmware Engineer":[.14,.20],"Software QA Engineer":[.11,.17],
    "Technical Lead":[.18,.25],"Software Architect":[.20,.29],"Hardware Engineer":[.13,.20],
    "Chip Architect":[.19,.27],"Electrical Engineer":[.13,.20],"Industrial Designer":[.12,.18],
    "Manufacturing Engineer":[.14,.21],"Product Manager":[.15,.22],"Finance Analyst":[.12,.18],
    "Manager":[.16,.24],"Director":[.22,.32],"Vice President":[.32,.48]
  }[canonicalRole(role)]||[.11,.18];
}
function roleRecruitingDifficulty(role){
  return {
    "Software Engineer":58,"Firmware Engineer":66,"Software QA Engineer":54,"Technical Lead":78,
    "Software Architect":84,"Hardware Engineer":64,"Chip Architect":86,"Electrical Engineer":63,
    "Industrial Designer":54,"Manufacturing Engineer":67,"Product Manager":56,"Finance Analyst":58,
    "Manager":70,"Director":82,"Vice President":92
  }[canonicalRole(role)]||60;
}
function rolesForDepartment(dept){
  return allRecruitableRoles().filter(role=>roleDepartment(role)===dept);
}
function roleForDepartmentHire(dept){
  const preferred={
    hardware:["Hardware Engineer","Electrical Engineer","Chip Architect","Manufacturing Engineer","Industrial Designer"],
    software:["Software Engineer","Firmware Engineer","Technical Lead","Software Architect"],
    quality:["Software QA Engineer"],
    product:["Product Manager"],
    finance:["Finance Analyst"],
    people:["Manager","Director"]
  }[dept]||rolesForDepartment(dept);
  return preferred.slice().sort((a,b)=>(employees||[]).filter(e=>e.active&&canonicalRole(e.role)===a).length-(employees||[]).filter(e=>e.active&&canonicalRole(e.role)===b).length)[0];
}
function roleForCompanyCapability(capability){
  const roles=COMPANY_CAPABILITY_TO_ROLES[capability]||[];
  if(!roles.length)return roleForDepartmentHire(COMPANY_CAPABILITY_DEPARTMENT[capability]||"people");
  return roles.slice().sort((a,b)=>(employees||[]).filter(e=>e.active&&canonicalRole(e.role)===a).length-(employees||[]).filter(e=>e.active&&canonicalRole(e.role)===b).length)[0];
}
function roleCapabilityContribution(role,capability,employee=null){
  role=canonicalRole(role);
  const mapped=COMPANY_CAPABILITY_TO_ROLES[capability]||[];
  const def=roleDefinition(role)||{};
  const skills=employee?.skills||def.skills||{};
  const leadership=Number(skills.leadership)||Number(def.leadershipLevel||0)*20||35;
  const communication=Number(skills.communication)||45;
  const finance=Number(skills.finance)||25;
  const architecture=Number(skills.architecture)||35;
  const verification=Number(skills.verification)||35;
  const product=Number(skills.product)||30;
  const hardware=Number(skills.hardware)||35;
  const software=Number(skills.software)||35;
  const direct=mapped.includes(role)?50:0;
  const leadershipLevel=roleLeadershipLevel(role)*7;
  const skillScore={
    managementCapacity:leadership*.50+communication*.35+product*.15,
    portfolioGovernance:leadership*.45+communication*.25+finance*.18+product*.12,
    financialPlanning:finance*.72+communication*.16+leadership*.12,
    manufacturingReadiness:hardware*.42+verification*.30+communication*.14+leadership*.14,
    customerSupportCapacity:product*.55+communication*.28+leadership*.17,
    technicalLeadership:architecture*.38+software*.24+hardware*.18+verification*.10+leadership*.10,
    mentoringCapacity:leadership*.45+communication*.35+Math.max(software,hardware,verification,architecture)*.20,
    successionCoverage:leadership*.52+communication*.24+Math.max(product,finance,software,hardware)*.24,
    crossProjectCoordination:communication*.36+leadership*.34+product*.20+finance*.10,
    executiveCommunication:communication*.42+leadership*.32+finance*.16+product*.10
  }[capability]||0;
  const onboarding=employee&&typeof onboardingProductivity==="function"?onboardingProductivity(employee):1;
  const stressPenalty=employee?Math.max(0,(employee.stress||0)-70)*.25:0;
  return Math.round(clamp((direct+leadershipLevel+skillScore*.42-stressPenalty)*onboarding,0,100));
}
function capabilityFulfillmentOptions(capability){
  const roles=COMPANY_CAPABILITY_TO_ROLES[capability]||[];
  return [
    `external hiring: ${roles.join(" or ")||roleForCompanyCapability(capability)}`,
    "internal promotion recommendation",
    "temporary acting role",
    "contractor or advisor coverage",
    "reassignment or mentoring plan",
    "scope reduction or project reprioritization"
  ];
}
function normalizeEmployeeRoleProfile(e){
  const role=canonicalRole(e.role);
  e.role=roleDefinition(role)?role:e.role;
  const room=rolePrimaryRoom(e.role);
  e.homeRoom=room;
  e.homeZone=zoneForRoom(room);
  e.allowedActivities=roleAllowedActivities(e.role);
  e.projectCapabilities=roleProjectCapabilities(e.role);
  e.leadershipLevel=roleLeadershipLevel(e.role);
  e.department=roleDepartment(e.role);
  e.skills={...baseSkillsForRole(e.role),...(e.skills||{})};
  if(!roomForZone(e.zone))e.zone=e.homeZone;
  return e;
}
function roomForAction(e,action,ctx={}){
  if(action==="break"||action==="socialize"||action==="complain")return "break-area";
  if(action==="meeting")return "meeting-room";
  if(action==="collaborate")return (e.stress>78||e.energy<32)&&roleSecondaryRooms(e.role).includes("break-area")?"break-area":"meeting-room";
  if(action==="lab")return roomCongestion("hardware-lab")>1.25&&rolePrimaryRoom(e.role)==="software-studio"?"software-studio":"hardware-lab";
  if(action==="home")return null;
  const work=ctx?.work, type=String(work?.type||work?.assignedTeam||"").toLowerCase();
  let room=rolePrimaryRoom(e.role);
  if(/hardware|chip|manufactur|prototype|validation|verification/.test(type)&&["hardware-lab","software-studio"].includes(room))room="hardware-lab";
  if(/plan|review|blocker|coordination/.test(type))room="meeting-room";
  const alternatives=roleSecondaryRooms(e.role).filter(r=>r!=="break-area"||e.energy<28||e.stress>82);
  if(roomCongestion(room)>1.25&&alternatives.length){
    const better=alternatives.slice().sort((a,b)=>roomCongestion(a)-roomCongestion(b))[0];
    if(roomCongestion(better)+.25<roomCongestion(room))room=better;
  }
  return room;
}
function roomEffectFor(e,action,room){
  const congestion=roomCongestion(room);
  const correct=room===roomForAction(e,action,workContext?.(e)||{})||room===rolePrimaryRoom(e.role)||roleSecondaryRooms(e.role).includes(room);
  return {room,capacity:ROOM_CAPACITY[room]||6,occupancy:roomOccupancy(room),congestion,correct,productivity:clamp((correct?1:.86)-(Math.max(0,congestion-1)*.18),.55,1.12),focus:clamp((correct?0:.08)+Math.max(0,congestion-1)*.12,0,.5),stress:clamp(Math.max(0,congestion-1)*.16-(room==="break-area"&&congestion<1?.06:0),-.12,.5)};
}
function applyRoomTickEffects(e){
  const room=roomForZone(e.zone);
  if(!room)return {room:null};
  const effect=roomEffectFor(e,e.lastAction||e.action,room);
  e.currentRoom=room;
  e.roomSelectionReason=`${e.role} ${effect.correct?"is using a relevant room":"is outside the ideal room"} for ${e.action}.`;
  e.roomEffect=effect;
  e.focus=clamp(e.focus-effect.focus,0,100);
  e.stress=clamp(e.stress+effect.stress,0,100);
  return effect;
}
