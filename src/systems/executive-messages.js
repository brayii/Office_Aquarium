function eventCommunication(ev){
  if(ev.generatedCommunication){
    const c=ev.generatedCommunication,sender=c.sender||{name:c.from||"Executive Office",role:c.role||"Leadership Team"};
    return {...c,from:sender.name||c.from||"Executive Office",role:sender.role||c.role||"Leadership Team",date:`Day ${company.day+1}`,signature:c.signature||`Regards,
${sender.name||c.from||"Executive Office"}
${sender.role||c.role||"Leadership Team"}`};
  }
  const active=employees.filter(e=>e.active);
  const byRole=role=>active.find(e=>e.role===role);
  if(!ev.forceLegacyTemplate){
    const structured=structuredCommunicationForEvent(ev,active,byRole);
    if(structured)return structured;
  }
  const templates={
    burnout:{type:"Internal Memorandum",priority:"Urgent",sender:byRole("Product Manager")||active[0],subject:"Sustained Engineering Workload",message:"The engineering organization has maintained an accelerated schedule. Progress is visible, but stress indicators are rising and the risk of absence or resignation is becoming material. Leadership direction is needed before the pressure becomes self-reinforcing.",recs:[["Engineering","Reduce the pace and protect quality",82],["Finance","Contract support is affordable but expensive",68],["Board","Preserve the milestone if possible",61]],impacts:["Burnout and resignation risk may change","Schedule pressure will shift","Board confidence may react"]},
    milestone:{type:"Executive Report",priority:"Decision Needed",sender:byRole("Chip Architect")||active[0],subject:"Prototype Readiness Review",message:"The hardware team has reached a meaningful prototype milestone. The next decision determines whether the company exposes the product to customers, accelerates integration, or returns to research for another quality cycle.",recs:[["Engineering","Run customer testing before scaling",79],["Product","Use the milestone to build market learning",73],["Finance","All options remain fundable",66]],impacts:["Product quality and trust may change","Integration speed may increase or slow","Cash will be committed"]},
    launch:{type:"Board Letter",priority:"Urgent",sender:byRole("Product Manager")||active[0],subject:"Launch Authorization",message:"The product has reached a point where a commercial launch is possible. Engineering still sees reliability risk, while customer interest and board expectations continue to rise. A CEO decision is required on market exposure.",recs:[["Engineering","Use a limited pilot",81],["Product","Launch while customer interest is strong",76],["Finance","A launch improves the path to revenue",72]],impacts:["Recurring revenue may begin","Stress and execution risk may rise","Trust will depend on product readiness"]},
    "pilot-review":{type:"Executive Report",priority:"Decision Needed",sender:byRole("Product Manager")||active[0],subject:"Limited Pilot Review",message:"The limited pilot has produced enough customer and product data for a new decision. The company can expand, continue learning at a controlled pace, or pause commercial activity to repair weaknesses.",recs:[["Product","Expand if customer feedback remains positive",78],["Engineering","Repair weaknesses before broad exposure",74],["Finance","An extended pilot preserves flexibility",69]],impacts:["Customer growth may accelerate or pause","Quality and trust may improve","Revenue timing will change"]},
    hiring:{type:"Internal Memorandum",priority:"Urgent",sender:byRole("Finance Analyst")||active[0],subject:"Critical Role Vacancy",message:`A key position is vacant${company.openRoles?.length?`: ${company.openRoles[0]}`:""}. The loss will slow specialized work unless leadership chooses a staffing response.`,recs:[["People","Hire a permanent specialist",80],["Finance","Use temporary coverage to protect runway",67],["Operations","Promote internally for speed",64]],impacts:["Capability and workload will change","Cash cost depends on the staffing choice","Morale may react to the decision"]},
    cash:{type:"Executive Report",priority:"Urgent",sender:byRole("Finance Analyst")||active[0],subject:"Cash Runway Assessment",message:`Current cash is approximately $${company.cash.toFixed(1)}M. Without intervention, operating flexibility will continue to narrow. Leadership must choose between cost reduction, outside funding, or a stronger revenue focus.`,recs:[["Finance","Protect runway immediately",86],["Product","Avoid cuts that damage delivery",65],["Board","Show a credible recovery plan",79]],impacts:["Runway will increase or decrease","Employee morale may be affected","Board confidence will respond"]},
    culture:{type:"Internal Memorandum",priority:"Decision Needed",sender:byRole("Product Manager")||active[0],subject:"Cross-Department Culture Conflict",message:"A disagreement over priorities is spreading beyond the original participants. The issue is beginning to influence trust, cooperation, and morale. Leadership should clarify how the company resolves internal conflict.",recs:[["People","Use mediation",83],["Engineering","Protect technical judgment",71],["Management","Clarify authority and decision rights",68]],impacts:["Relationships may recover or deteriorate","Morale and stress may shift","Leadership credibility may change"]},
    "market-shift":{type:"Market Brief",priority:"Decision Needed",sender:byRole("Product Manager")||active[0],subject:"Market Pressure Shift",message:"External demand and competitor pressure have changed enough to affect roadmap risk. The simulation can absorb the pressure, but leadership must decide whether to chase demand, protect reliability, or narrow sales promises.",recs:[["Product","Reposition around credible demand",76],["Engineering","Protect reliability before scaling",74],["Board","Show visible momentum",69]],impacts:["Market modifiers will change company pressure","Culture and CEO credibility may shift","Customers and trust may move"]},
    performance:{type:"People Review",priority:"Urgent",sender:byRole("Finance Analyst")||active[0],subject:"Performance Review Escalation",message:"A sustained employee performance gap is now visible in the operating model. This is a leadership-level issue because it affects culture, capability, and vacancy risk.",recs:[["People","Coach before removing capability",78],["Operations","Reassign work if delivery is at risk",70],["Board","Act decisively if the role is blocking progress",62]],impacts:["The employee may recover, be reassigned, or be fired","CEO trust and fear may change","A vacancy may be created"]},
    "supply-chain":{type:"Operations Brief",priority:"Urgent",sender:byRole("Finance Analyst")||byRole("Product Manager")||active[0],subject:"Manufacturing and Supply Chain Risk",message:`Manufacturing readiness is ${Math.round(company.manufacturing?.readiness||0)}%, yield is ${Math.round(company.manufacturing?.yield||0)}%, and supply risk is ${Math.round(company.manufacturing?.supplyRisk||0)}%. Delivery reliability is now a CEO-level issue.`,recs:[["Operations","Stabilize supply before scaling",82],["Engineering","Redesign around constrained parts",74],["Board","Avoid overpromising delivery",69]],impacts:["Manufacturing readiness, yield, and supply risk may change","Customer trust may rise or fall","Cash and board pressure may move"]},
    "shareholder-letter":{type:"Board Letter",priority:"Decision Needed",sender:byRole("Finance Analyst")||byRole("Product Manager")||active[0],subject:"Investor Confidence Review",message:`Investor confidence is ${Math.round(company.shareholders?.confidence||0)} and investor pressure is ${Math.round(company.shareholders?.pressure||0)}. The board wants a CEO response that balances durable value with operating reality.`,recs:[["Board","Publish a credible operating plan",81],["Finance","Show near-term revenue discipline",76],["Product","Do not sacrifice the long-term roadmap",67]],impacts:["Investor pressure and patience will change","Culture may shift toward revenue or research","Board confidence may react"]}
  };
  const t=templates[ev.id]||{type:"Email",priority:"Decision Needed",sender:active[0],subject:ev.title,message:ev.copy,recs:[["Leadership","Review the available options",70]],impacts:["Company conditions will change"]};
  const sender=t.sender||{name:"Executive Office",role:"Leadership Team"};
  return {...t,from:sender.name,role:sender.role,date:`Day ${company.day+1}`,signature:`Regards,
${sender.name}
${sender.role}`};
}
function structuredCommunicationForEvent(ev,active,byRole){
  const cat=eventCategory(ev),title=ev.title||"Executive Decision",copy=ev.copy||"The operating team needs CEO direction.";
  const senderFor={
    finance:byRole("Finance Analyst"),
    board:byRole("Finance Analyst")||byRole("Product Manager"),
    people:byRole("Product Manager"),
    customer:byRole("Product Manager"),
    product:byRole("Product Manager"),
    market:byRole("Product Manager"),
    operations:byRole("Software QA Engineer")||byRole("Chip Architect"),
    quality:byRole("Software QA Engineer")||byRole("Chip Architect"),
    project:byRole("Product Manager")||byRole("Technical Lead")
  }[cat]||byRole("Product Manager")||byRole("Technical Lead")||active[0]||{name:"Executive Office",role:"Leadership Team"};
  const type={
    finance:"Finance Memo",board:"Board Memo",people:"People Memo",customer:"Customer Success Memo",
    product:"Product Memo",market:"Market Memo",operations:"Operations Memo",quality:"Quality Memo",project:"Portfolio Memo"
  }[cat]||"Executive Memo";
  const priority=/urgent|critical|runway|burnout|launch|risk|failure|supply|performance/i.test(`${ev.id||""} ${title} ${copy}`)?"Urgent":"Decision Needed";
  return {
    type,priority,sender:senderFor,from:senderFor.name,role:senderFor.role,subject:title,message:copy,
    recs:[],impacts:["The decision will affect operating priorities.","Departments may interpret the trade-offs differently.","Follow-up outcomes will be reviewed later."],
    structuredPipeline:true,date:`Day ${company.day+1}`,signature:`Regards,
${senderFor.name}
${senderFor.role}`
  };
}
function memoDepartmentFor(ev,comm={}){
  const cat=eventCategory(ev);
  if(cat==="customer"||ev.customerSegmentId)return "customer success";
  if(ev.hiringRequest?.department)return ev.hiringRequest.department;
  if(ev.commercialProjectId)return "product";
  if(ev.projectDecision||String(ev.id||"").includes("project"))return "product";
  if(cat==="finance"||String(comm.role||"").toLowerCase().includes("finance"))return "finance";
  if(cat==="people"||String(comm.role||"").toLowerCase().includes("people")||String(comm.role||"").toLowerCase().includes("hr"))return "people";
  if(cat==="board"||String(comm.role||"").toLowerCase().includes("board"))return "board";
  if(cat==="product"||cat==="market"||String(comm.role||"").toLowerCase().includes("product"))return "product";
  if(cat==="operations"||cat==="quality")return "quality";
  return "hardware";
}
function ensureSenderCredibility(sender,dept){
  ensureBibleSystems?.();
  company.senderCredibility=company.senderCredibility&&typeof company.senderCredibility==="object"?company.senderCredibility:{};
  const key=`${sender||"Executive Office"}|${dept||"company"}`;
  if(!company.senderCredibility[key])company.senderCredibility[key]={estimateAccuracy:55,recommendationAccuracy:55,biasStrength:departmentBiasProfile(dept).biasStrength,overconfidence:departmentBiasProfile(dept).overconfidence,caution:departmentBiasProfile(dept).caution,evidenceQuality:58,lastUpdatedDay:company.day};
  return company.senderCredibility[key];
}
function recordSenderCredibilityHistory(sender,dept,reason,cred){
  company.senderCredibilityHistory=Array.isArray(company.senderCredibilityHistory)?company.senderCredibilityHistory:[];
  company.senderCredibilityHistory.unshift({day:company.day,sender:sender||"Executive Office",department:dept||"company",reason,estimateAccuracy:Math.round(cred?.estimateAccuracy??55),recommendationAccuracy:Math.round(cred?.recommendationAccuracy??55),evidenceQuality:Math.round(cred?.evidenceQuality??58)});
  company.senderCredibilityHistory=company.senderCredibilityHistory.slice(0,180);
}
function departmentBiasProfile(dept){
  return {
    engineering:{focus:"technical capacity and schedule realism",biasStrength:64,overconfidence:18,caution:52},
    hardware:{focus:"architecture, hardware risk, and verification capacity",biasStrength:64,overconfidence:18,caution:52},
    software:{focus:"integration work, maintainability, and delivery risk",biasStrength:61,overconfidence:20,caution:48},
    quality:{focus:"testing, reliability, and defect prevention",biasStrength:72,overconfidence:10,caution:75},
    finance:{focus:"runway, affordability, and downside protection",biasStrength:70,overconfidence:12,caution:78},
    people:{focus:"retention, fairness, burnout prevention, and succession",biasStrength:66,overconfidence:14,caution:62},
    product:{focus:"customer demand, launch timing, and market opportunity",biasStrength:62,overconfidence:24,caution:43},
    "customer success":{focus:"renewals, churn risk, account trust, support load, and expansion quality",biasStrength:68,overconfidence:13,caution:70},
    board:{focus:"survival, capital efficiency, and leadership consistency",biasStrength:74,overconfidence:20,caution:66},
    company:{focus:"overall operating balance",biasStrength:45,overconfidence:15,caution:55}
  }[dept]||{focus:"department operating priorities",biasStrength:55,overconfidence:16,caution:55};
}
function reportManagerFor(dept){
  const role={hardware:"Chip Architect",software:"Technical Lead",quality:"Software QA Engineer",product:"Product Manager","customer success":"Product Manager",finance:"Finance Analyst",people:"Manager",board:"Board Strategy Committee"}[dept];
  const e=employees.find(x=>x.active&&x.role===role)||employees.find(x=>x.active&&employeeTeam(x)===dept)||employees.find(x=>x.active);
  return e?{name:e.name,role:e.role,department:dept}:{name:dept==="board"?"Board Strategy Committee":"Operating Council",role:dept==="board"?"Board":"Executive Review",department:dept||"company"};
}
function memoChainOfCommand(ev,comm,dept,msg=null){
  if(Array.isArray(comm.chainOfCommand)&&comm.chainOfCommand.length)return comm.chainOfCommand;
  const manager=reportManagerFor(dept);
  const chain=[];
  if(msg){
    chain.push(`${msg.fromName||"An employee"} raised a ${String(msg.type||"report").replace(/-/g," ")} in ${teamDisplayName(msg.department)}.`);
    chain.push(`${manager.name}, ${manager.role}, reviewed the concern before CEO escalation.`);
  }else{
    chain.push(`${teamDisplayName(dept)} operating signals were reviewed by ${manager.name}, ${manager.role}.`);
  }
  if(["finance","people","board"].includes(dept))chain.push(`${comm.from||manager.name} sent the memo as the executive owner.`);
  else chain.push(`Finance, People, or the Portfolio Council may disagree based on their own priorities.`);
  return chain;
}
function qualitativeBand(value,{low=35,high=70,lowText="low",midText="moderate",highText="high"}={}){
  const n=Number(value)||0;
  if(n>=high)return highText;
  if(n<=low)return lowText;
  return midText;
}
function reportEvidencePhrase(msg){
  const severity=qualitativeBand(msg?.severity,{low:45,high:78,lowText:"limited",midText:"material",highText:"serious"});
  const urgency=qualitativeBand(msg?.urgency,{low:40,high:76,lowText:"not immediate",midText:"time-sensitive",highText:"urgent"});
  const confidence=qualitativeBand(msg?.confidence,{low:45,high:75,lowText:"uncertain",midText:"credible",highText:"well-supported"});
  return `${msg?.fromName||"An employee"} raised a ${severity}, ${urgency} ${String(msg?.type||"report").replace(/-/g," ")} that appears ${confidence}.`;
}
function issueEvidencePhrase(issue){
  const severity=qualitativeBand(issue?.severity,{low:45,high:78,lowText:"limited",midText:"material",highText:"serious"});
  const urgency=qualitativeBand(issue?.urgency,{low:40,high:76,lowText:"not immediate",midText:"time-sensitive",highText:"urgent"});
  const impact=qualitativeBand(issue?.strategicImpact,{low:40,high:75,lowText:"mostly local",midText:"cross-functional",highText:"strategic"});
  return `The underlying issue is ${severity}, ${urgency}, and ${impact} in scope.`;
}
function concreteMemoEvidence(ev,comm,dept,msg=null){
  const ctx=ev.decisionContext||decisionContextSnapshot();
  const lines=[];
  const issue=msg?.issueId?(company.issueRecords||[]).find(i=>i.id===msg.issueId):null;
  const work=msg?.workItemId?(company.workItems||[]).find(w=>w.id===msg.workItemId):null;
  if(msg)lines.push(reportEvidencePhrase(msg));
  if(issue){lines.push(issueEvidencePhrase(issue));(issue.evidence||[]).slice(0,2).map(evidenceSentence).filter(Boolean).forEach(x=>lines.push(x));}
  if(work){const blockers=work.blockedBy?.length||0;lines.push(`${work.title} is in ${workStatusLabel(work).toLowerCase()} at about ${Math.round(work.progress||0)}% complete${blockers?`, with ${blockers} blocker${blockers===1?"":"s"}`:", with no formal blockers"}.`);}
  if(ev.hiringRequest){lines.push(`${teamDisplayName(ev.hiringRequest.department||dept)} is asking for ${ev.hiringRequest.role} because the staffing case is ${qualitativeBand(ev.hiringRequest.confidence,{low:45,high:75,lowText:"still developing",midText:"credible",highText:"strong"})}.`);(ev.hiringRequest.reasons||[]).slice(0,2).map(evidenceSentence).filter(Boolean).forEach(x=>lines.push(x));}
  if(ev.projectDecision){const p=[...(company.projects||[]),...(company.projectProposals||[])].find(p=>p.id===ev.projectDecision.id);if(p)lines.push(`${p.title} is about ${Math.round(p.progress||0)}% complete, with ${qualitativeBand(p.performance?.riskTrend||p.visibleRisk,{low:40,high:70,lowText:"limited",midText:"visible",highText:"elevated"})} risk and $${Number(p.budgetSpent||0).toFixed(2)}M already spent.`);}
  if(ev.customerSegmentId){const seg=company.customerSegments?.[ev.customerSegmentId],label=CUSTOMER_SEGMENT_DEFS[ev.customerSegmentId]?.label||"Customer";if(seg)lines.push(`${label} has ${Math.round(seg.activeCustomers||0)} active customer${Math.round(seg.activeCustomers||0)===1?"":"s"}, ${qualitativeBand(seg.sentiment,{low:45,high:72,lowText:"weak",midText:"mixed",highText:"healthy"})} sentiment, and ${qualitativeBand(seg.churnRisk,{low:35,high:68,lowText:"limited",midText:"material",highText:"high"})} churn risk.`);const issue=(seg?.currentIssues||[]).find(i=>!i.resolved);if(issue)lines.push(`${label} issue: ${issue.description}`);}
  if(String(ev.id||"").includes("project")){const h=company.portfolioHealth||{};lines.push(`Portfolio load includes ${h.activeProjects||0} active project${(h.activeProjects||0)===1?"":"s"}, with ${h.atRiskProjects||0} currently at risk and daily project spend near $${Number(h.totalProjectSpendDaily||0).toFixed(3)}M.`);}
  const text=String(ev.id+" "+ev.title+" "+ev.copy+" "+(ev.choices||[]).map(c=>c.title+" "+c.detail).join(" ")).toLowerCase();
  if(dept==="finance"||eventCategory(ev)==="finance"||/cash|runway|fund|salary|hire|layoff|budget|spend|cost/.test(text))lines.push(company.finance?.runwayDays>=999?`Finance sees current cash flow as positive, but the decision can still change future flexibility.`:`Runway is around ${company.finance?.runwayDays||0} days and daily cash flow is near $${Number(company.finance?.netCashFlowDaily||0).toFixed(3)}M.`);
  if(dept==="people"||eventCategory(ev)==="people"||/hire|staff|burnout|morale|retention|layoff|performance|coach/.test(text))lines.push(`${employees.filter(e=>e.active).length} employees are active, with ${qualitativeBand(avgStress(),{low:45,high:70,lowText:"manageable",midText:"elevated",highText:"high"})} workload pressure and ${employees.filter(e=>e.active&&(e.retentionRisk||0)>60).length} elevated retention case(s).`);
  if(dept==="quality"||eventCategory(ev)==="operations"||/quality|verify|defect|supplier|manufactur|launch|pilot/.test(text))lines.push(`Quality is ${qualitativeBand(company.quality,{low:50,high:75,lowText:"below target",midText:"mixed",highText:"healthy"})}, with ${Math.round(company.simulationMetrics?.counters?.qualityMistakes||0)} unresolved mistake(s) and ${qualitativeBand(company.manufacturing?.supplyRisk,{low:35,high:68,lowText:"limited",midText:"material",highText:"high"})} manufacturing risk.`);
  if(eventCategory(ev)==="customer"||dept==="customer success"||/customer|renewal|churn|support|segment/.test(text))lines.push(`The company has ${Math.round(company.customers||0)} customer${Math.round(company.customers||0)===1?"":"s"}, ${qualitativeBand(company.customerSentiment,{low:45,high:72,lowText:"weak",midText:"mixed",highText:"healthy"})} customer sentiment, and about $${calculateCustomerRevenueDaily().toFixed(3)}M in daily segment revenue.`);
  if(eventCategory(ev)==="board"||/board|shareholder|pip|crisis|strategy/.test(text)){updateCompanyRiskComponents?.();lines.push(`The board sees ${qualitativeBand(ctx.board,{low:45,high:72,lowText:"weak",midText:"mixed",highText:"strong"})} confidence, ${qualitativeBand(ctx.trust,{low:45,high:72,lowText:"fragile",midText:"mixed",highText:"healthy"})} trust, and ${String(company.companyRiskComponents?.label||"Watch").toLowerCase()} company risk.`);}
  const snapshot=buildExecutiveIntelligenceSnapshot();
  const risk=(snapshot.topRisks||[]).find(r=>evidenceSignalIds(`${r.title} ${r.detail}`).some(id=>evidenceSignalIds(text).includes(id)))||snapshot.topRisks?.[0];
  const opportunity=(snapshot.topOpportunities||[]).find(o=>evidenceSignalIds(`${o.title} ${o.detail}`).some(id=>evidenceSignalIds(text).includes(id)));
  if(risk&&lines.length<6)lines.push(`Company intelligence is also watching ${risk.title.toLowerCase()}${risk.detail?`: ${risk.detail}`:""}`.trim());
  if(opportunity&&lines.length<6)lines.push(`A related opportunity is emerging: ${opportunity.title}${opportunity.detail?`; ${opportunity.detail}`:""}`.trim());
  return [...new Set(lines)].filter(Boolean).slice(0,6);
}
function departmentEvidenceIds(dept){
  const map={
    engineering:["quality","project","people"],
    hardware:["quality","project","people"],
    software:["quality","project","people"],
    quality:["quality","project"],
    product:["market","customer","project","quality"],
    finance:["finance","project","governance"],
    people:["people","project"],
    operations:["quality","customer","project"],
    "customer success":["customer","market","quality"],
    board:["governance","finance","project","market"]
  };
  return map[String(dept||"").toLowerCase()]||["finance","people","quality","project","market","customer","governance"];
}
function filterEvidenceForDepartment(evidence,dept,choice=null){
  const allowed=departmentEvidenceIds(dept),choiceIds=choice?choiceEvidenceIds(choice):[];
  return (evidence||[]).filter(line=>{
    const ids=evidenceSignalIds(line);
    return ids.some(id=>allowed.includes(id)||choiceIds.includes(id));
  }).slice(0,3);
}
function institutionalLessonsForChoice(choice,dept){
  const text=String(`${choice?.title||""} ${choice?.detail||""} ${choice?.strategy||""} ${choice?.directive||""}`).toLowerCase();
  const signals=[];
  if(/quality|verify|test|pilot|defect|scope|delay/.test(text))signals.push("testing","earlyQA","documentation","planning");
  if(/hire|staff|people|coach|mentor|support|contractor/.test(text))signals.push("hiringTiming","mentoring","collaboration","retention","workloadBalancing");
  if(/cash|budget|freeze|cut|spend|runway|fund/.test(text))signals.push("planning","hiringTiming","riskTaking","escalation");
  if(/customer|market|launch|growth|revenue|feature|renewal|churn|support/.test(text))signals.push("marketTiming","riskTaking","planning","quality","retention");
  if(/report|escalat|memo|board|disclose|transparency/.test(text))signals.push("escalation","documentation","planning");
  if(!signals.length)return [];
  const stateWeightFor=l=>{
    if(typeof lessonStateWeight==="function")return lessonStateWeight(l);
    const state=l?.state||"prior";
    if(state==="validated")return 1;
    if(state==="provisional")return .20;
    if(state==="prior")return .08;
    if(state==="contradicted")return -.10;
    if(state==="obsolete")return 0;
    return .04;
  };
  return (company.lessons||[]).map(l=>{
    const lessonDept=String(l.department||"company").toLowerCase(),deptKey=String(dept||"company").toLowerCase();
    const vectorScore=Object.entries(l.vector||{}).reduce((s,[k,v])=>s+(signals.includes(k)?Math.abs(Number(v)||0):0),0);
    const deptScore=lessonDept==="company"?1.5:lessonDept===deptKey?3:0;
    const confidenceScore=(Number(l.confidence)||0)/30;
    const recencyScore=clamp(2-((company.day||0)-(l.lastDay||l.createdDay||0))/180,0,2);
    const evidenceScore=Math.min(2,(l.episodeKeys?.length||0)*.35+(l.sampleCount||0)*.25);
    const contradictionPenalty=l.state==="contradicted"?4:l.state==="obsolete"?99:0;
    const relevance=vectorScore*2+deptScore+confidenceScore+recencyScore+evidenceScore-contradictionPenalty;
    return {lesson:l,relevance,vectorScore,stateWeight:stateWeightFor(l)};
  }).filter(x=>x.relevance>=4.5&&x.vectorScore>.25&&x.stateWeight!==0).sort((a,b)=>b.relevance-a.relevance).slice(0,3).map(({lesson:l,stateWeight})=>{
    const vectorScore=Object.entries(l.vector||{}).reduce((s,[k,v])=>s+(signals.includes(k)?Number(v)||0:0),0);
    const influence=clamp(vectorScore*stateWeight*(Number(l.confidence)||50)/100,-8,8);
    return {key:l.key,title:l.title,state:l.state||"prior",confidence:Math.round(l.confidence||0),influence:Number(influence.toFixed(2))};
  });
}
function evaluateChoiceForDepartment(choice,department,context={}){
  const evidence=Array.isArray(context.evidence)?context.evidence:[],ev=context.event||{},ctx=context.snapshot||decisionContextSnapshot();
  const dept=department||"company";
  const deptEvidence=filterEvidenceForDepartment(evidence,dept,choice);
  const strategyScore=decisionOptionScore(choice,ctx,dept);
  const lessonsUsed=institutionalLessonsForChoice(choice,dept);
  const lessonAdjustment=lessonsUsed.reduce((s,l)=>s+l.influence,0);
  const evidenceAdjustment=deptEvidence.reduce((s,line)=>{
    const ids=evidenceSignalIds(line),choiceIds=choiceEvidenceIds(choice);
    return s+(ids.some(id=>choiceIds.includes(id))?3:1);
  },0);
  const score=clamp(strategyScore+lessonAdjustment+Math.min(8,evidenceAdjustment),0,100);
  const evidenceText=deptEvidence.join(" ");
  const selectedEvidence=deptEvidence.filter(line=>evidenceSignalIds(line).some(id=>choiceEvidenceIds(choice).includes(id))).slice(0,2);
  const reasons=[departmentViewpointReason(dept,ev,choice)];
  if(!selectedEvidence.length&&evidenceText)selectedEvidence.push(deptEvidence[0]);
  const confidence=clamp((Number(choice.estimatedConfidence)||55)*.45+score*.35+(selectedEvidence.length?12:0),20,95);
  const uncertainty=confidence>72?"Low":confidence>55?"Material":"High";
  return {score,position:score>=66?"support":score<=42?"oppose":"cautious",reasons,selectedEvidence,lessonsUsed,confidence,uncertainty};
}
function memoRecommendedChoice(ev,dept,evidence=[]){
  const choices=Array.isArray(ev.choices)?ev.choices:[];
  if(!choices.length)return null;
  return choices.map(c=>{const evaluation=evaluateChoiceForDepartment(c,dept,{event:ev,evidence});return {choice:c,score:evaluation.score,evaluation};}).sort((a,b)=>b.score-a.score)[0];
}
function evidenceSignalIds(text){
  const t=String(text||"").toLowerCase(),ids=[];
  if(/runway|cash|flow|fund|budget|spend|cost|payroll|salary/.test(t))ids.push("finance");
  if(/hire|staff|role|employee|stress|morale|retention|burnout|coach|layoff|people/.test(t))ids.push("people");
  if(/quality|defect|mistake|verify|verification|supplier|manufactur|rework|risk|blocker/.test(t))ids.push("quality");
  if(/project|portfolio|milestone|progress|deadline|scope|pause|cancel|merge|split/.test(t))ids.push("project");
  if(/customer|renewal|churn|support|account/.test(t))ids.push("customer");
  if(/customer|market|launch|pilot|revenue|growth|demand|product/.test(t))ids.push("market");
  if(/board|trust|crisis|shareholder|pip|strategy|confidence/.test(t))ids.push("governance");
  return [...new Set(ids)];
}
function choiceEvidenceIds(choice){
  const ids=evidenceSignalIds(`${choice.title||""} ${choice.detail||""} ${(choice.benefits||[]).join(" ")} ${(choice.risks||[]).join(" ")} ${choice.strategy||""} ${choice.directive||""}`);
  if(choice.effect?.cash!==undefined||choice.effect?.valuation!==undefined)ids.push("finance");
  if(choice.people||choice.hire||choice.hireRole||choice.deferHiring||choice.rejectHiring)ids.push("people");
  if(choice.effect?.quality!==undefined||choice.effect?.integration!==undefined)ids.push("quality");
  if(choice.launch||choice.projectAction||choice.commercializeProject)ids.push("project","market");
  if(choice.customerStrategy||choice.effect?.customers!==undefined)ids.push("customer","market");
  if(choice.effect?.board!==undefined||choice.effect?.trust!==undefined)ids.push("governance");
  return [...new Set([...(Array.isArray(choice.evidenceIds)?choice.evidenceIds:[]),...ids])];
}
function memoInterpretationFor(ev,dept,evidence,cred,recommended=null){
  const bias=departmentBiasProfile(dept);
  const title=recommended?.choice?.title||"the recommended option";
  return `${teamDisplayName(dept)} reads the evidence through ${bias.focus}. Based on its own priorities, the sender currently favors "${title}", but the advice may be shaped by ${bias.caution>65?"caution":bias.overconfidence>22?"optimism":"department priorities"} and incomplete information.`;
}
function operatingSignalPhrase(value,{low=45,high=70,lowText="weak",midText="mixed",highText="strong"}={}){
  const n=Number(value)||0;
  if(n>=high)return highText;
  if(n<low)return lowText;
  return midText;
}
function runwayPhrase(days){
  const n=Number(days)||0;
  if(n>=999)return "cash-positive";
  if(n<60)return "very tight";
  if(n<120)return "tight";
  if(n<240)return "workable";
  return "comfortable";
}
function memoNoActionForecast(ev,dept,evidence){
  const cat=eventCategory(ev), blocked=(company.workItems||[]).filter(w=>w.status==="open"&&(w.blockedBy||[]).length).length, atRisk=company.portfolioHealth?.atRiskProjects||0, runway=company.finance?.runwayDays||999, stress=Math.round(avgStress()), gaps=Object.values(company.staffingModel||{}).filter(s=>s.understaffed).length;
  if(cat==="people"||dept==="people")return `If no action is taken, ${gaps} understaffed area(s) and ${operatingSignalPhrase(stress,{low:55,high:75,lowText:"manageable",midText:"elevated",highText:"high"})} stress may keep pushing morale, retention, and execution risk.`;
  if(cat==="finance"||dept==="finance")return `If no action is taken, runway remains ${runwayPhrase(runway)} and cash flow stays ${Number(company.finance?.netCashFlowDaily||0)<0?"negative":"positive"}.`;
  if(cat==="project"||String(ev.id||"").includes("project"))return `If no action is taken, ${atRisk} at-risk project(s), ${blocked} blocked work item(s), and current portfolio spend may continue without a strategic reset.`;
  if(cat==="customer"||ev.customerSegmentId){const seg=company.customerSegments?.[ev.customerSegmentId],label=CUSTOMER_SEGMENT_DEFS[ev.customerSegmentId]?.label||"Customer";return `If no action is taken, ${label} churn risk remains ${operatingSignalPhrase(seg?.churnRisk,{low:35,high:65,lowText:"contained",midText:"visible",highText:"elevated"})} while sentiment looks ${operatingSignalPhrase(seg?.sentiment||company.customerSentiment,{low:45,high:70,lowText:"weak",midText:"mixed",highText:"healthy"})}.`;}
  if(cat==="product"||dept==="product")return `If no action is taken, customer timing continues to compete with ${operatingSignalPhrase(company.quality,{low:55,high:72,lowText:"thin",midText:"acceptable",highText:"strong"})} quality and ${operatingSignalPhrase(company.trust,{low:50,high:72,lowText:"fragile",midText:"mixed",highText:"strong"})} trust.`;
  if(cat==="operations"||dept==="quality")return `If no action is taken, quality remains ${operatingSignalPhrase(company.quality,{low:55,high:72,lowText:"fragile",midText:"mixed",highText:"healthy"})} while rework and manufacturing reliability continue to shape delivery risk.`;
  if(cat==="board"||dept==="board")return `If no action is taken, board confidence remains ${operatingSignalPhrase(company.board,{low:50,high:72,lowText:"fragile",midText:"watchful",highText:"supportive"})} while crisis and capital-pressure signals continue to accumulate.`;
  return `If no action is taken, the underlying condition is likely to keep developing without CEO direction.`;
}
function memoEscalationReason(ev,comm,dept,msg=null){
  if(comm.reasonForEscalation)return comm.reasonForEscalation;
  const cat=eventCategory(ev);
  if(ev.sourceMessageId)return "A manager reviewed an internal report and judged that local authority was no longer enough.";
  if(ev.customerSegmentId)return "Customer Success can handle account recovery, but this trade-off would affect product priorities, support capacity, or revenue risk.";
  if(ev.hiringRequest)return "The department has a staffing need that affects budget, workload, and project commitments.";
  if(ev.projectDecision||cat==="project"||String(ev.id||"").includes("project"))return "The project has reached a point where continuing, pausing, changing scope, or canceling it requires executive judgment.";
  if(cat==="finance")return "The decision changes runway, fixed spending, fundraising pressure, or operating flexibility.";
  if(cat==="people")return "The issue affects retention, fairness, workload, or leadership credibility beyond one manager's authority.";
  if(cat==="board")return "The Board is asking for a leadership decision because the issue affects governance, valuation, or company risk.";
  if(cat==="product"||cat==="market")return "Product and market signals now require a strategic trade-off rather than a local roadmap adjustment.";
  if(cat==="operations"||dept==="quality")return "The operating risk could affect reliability, delivery, or customer trust.";
  return "The issue has moved beyond routine operating work and now requires a CEO-level trade-off.";
}
function memoUncertaintyFor(ev,dept,cred){
  const hidden=ev.projectDecision||String(ev.id||"").includes("project")?" Hidden project reality and market timing are not fully known.":"";
  return `${teamDisplayName(dept)} may be missing suppressed reports, delayed employee information, or future market changes.${hidden} Sender evidence quality is ${cred.evidenceQuality>=70?"strong":cred.evidenceQuality<45?"thin":"moderate"}, but not perfect.`;
}
function memoAlternativeViewpoints(ev,comm,dept){
  const recs=Array.isArray(comm.recs)?comm.recs:[];
  return recs.map(r=>{
    const name=String(r[0]||"Department"), lower=name.toLowerCase();
    const d=lower.includes("finance")?"finance":lower.includes("people")||lower.includes("hr")?"people":lower.includes("board")?"board":lower.includes("product")?"product":lower.includes("quality")?"quality":lower.includes("engineering")||lower.includes("hardware")?"hardware":"company";
    const recommended=memoRecommendedChoice(ev,d,concreteMemoEvidence(ev,comm,d,null));
    return {department:name,recommendation:recommended?.choice?.title||r[1]||"Review the evidence",confidence:Math.round(r[2]||55),reason:departmentViewpointReason(d,ev,recommended?.choice||null)};
  }).slice(0,4);
}
function departmentViewpointReason(dept,ev,choice=null){
  const p=decisionProjectSubject(ev,choice),cat=eventCategory(ev),text=String(`${ev.title||""} ${ev.copy||""} ${choice?.title||""} ${choice?.detail||""}`).toLowerCase();
  if(dept==="finance"){
    if(company.finance?.runwayDays<120)return `Finance is focused on runway because this choice could reduce flexibility before revenue is dependable.`;
    if(/hire|salary|budget|fund|spend/.test(text))return `Finance sees the option as affordable only if the commitment stays tied to evidence and milestones.`;
    return `Finance is less concerned with the headline decision than with whether the cost creates a recurring obligation.`;
  }
  if(dept==="people")return avgStress()>68?`People is worried that the team is already absorbing too much work and may turn execution pressure into retention risk.`:`People sees this mainly through workload, fairness, and whether managers can explain the decision to the team.`;
  if(dept==="quality")return `Quality is focused on whether the company is preventing defects before customers experience them, not only whether the schedule still looks achievable.`;
  if(dept==="product")return company.customers>0?`Product is weighing customer trust and timing; a faster move helps only if the promise can be kept.`:`Product is weighing whether this creates useful market learning or simply adds scope before the company has evidence.`;
  if(dept==="customer success")return `Customer Success is focused on whether the decision protects renewals, support capacity, and account trust after the sale.`;
  if(dept==="board")return `The Board is judging whether this decision makes management look disciplined, credible, and capable of protecting long-term value.`;
  if(dept==="hardware"||dept==="software"||dept==="engineering")return p?`Engineering believes ${p.title} still contains execution uncertainty that should be resolved before the company treats the plan as safe.`:`Engineering is focused on feasibility, integration risk, and whether the team has enough margin to do the work well.`;
  return `This group is looking at the operating consequences from its own responsibilities rather than treating the decision as a simple yes-or-no item.`;
}
function buildMemoIntelligence(ev,comm){
  const msg=ev.sourceMessageId?(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId):null;
  const dept=memoDepartmentFor(ev,comm),cred=ensureSenderCredibility(comm.from,dept),evidence=concreteMemoEvidence(ev,comm,dept,msg);
  const recommended=memoRecommendedChoice(ev,dept,evidence);
  (ev.choices||[]).forEach(choiceEvidenceIds);
  const recommendation=recommended?.choice?.title?`${teamDisplayName(dept)} recommends ${String(recommended.choice.title).replace(/\.$/,"").toLowerCase()}.`:(comm.recs?.[0]?.[1])||"Review the available choices";
  const originIds=Array.isArray(comm.originEmployeeIds)?comm.originEmployeeIds:(msg?.fromId!==undefined?[msg.fromId]:[]);
  const intel={why:memoEscalationReason(ev,comm,dept,msg),department:dept,chainOfCommand:memoChainOfCommand(ev,comm,dept,msg),originEmployeeIds:originIds,evidence,evidenceIds:[...new Set(evidence.flatMap(evidenceSignalIds))],interpretation:memoInterpretationFor(ev,dept,evidence,cred,recommended),recommendation,recommendationScore:recommended?Math.round(recommended.score):null,noActionForecast:memoNoActionForecast(ev,dept,evidence),uncertainty:memoUncertaintyFor(ev,dept,cred),alternativeRecommendations:memoAlternativeViewpoints(ev,comm,dept),recommendedChoice:recommended?.choice?.title||null,credibilityHint:cred.estimateAccuracy>68?"Usually accurate on operating estimates":cred.caution>70?"Often conservative in recommendations":cred.overconfidence>24?"Sometimes optimistic about upside":"Mixed historical reliability"};
  intel.audit=memoQualityAudit(ev,comm,intel);
  return intel;
}
function confidenceBand(value){
  const n=Number(value)||50;
  return n>=72?"High":n>=48?"Moderate":"Low";
}
function senderVoiceProfile(dept,role=""){
  const r=String(role||"").toLowerCase();
  if(dept==="board"||r.includes("board"))return {tone:"formal and strategic",open:["The Board is asking for your judgment because","We are writing because","The Board wants to flag"],focus:"valuation, capital discipline, execution risk, and CEO credibility"};
  if(dept==="finance"||r.includes("finance"))return {tone:"measured and skeptical",open:["Based on current spending","I want to flag a developing financial issue","The current plan is affordable, but"],focus:"runway, affordability, downside protection, and trade-offs"};
  if(dept==="people"||r.includes("people")||r.includes("hr"))return {tone:"careful and employee-focused",open:["I am concerned about the effect this is having on the team","Several employees are showing signs that","The immediate issue is not only performance"],focus:"morale, retention, fairness, workload, and sustainability"};
  if(dept==="quality"||r.includes("qa")||r.includes("verification"))return {tone:"precise and risk-aware",open:["The quality signal is becoming clearer","I am writing because verification work is showing pressure","The current reliability risk is"],focus:"defects, verification, rework, and customer exposure"};
  if(dept==="customer success"||r.includes("customer success")||r.includes("support"))return {tone:"account-focused and pragmatic",open:["Customers are starting to show us where the promise is holding and where it is not","I am writing because account health is becoming a leadership issue","The customer signal is not just about growth"],focus:"renewals, churn, customer trust, support load, and expansion quality"};
  if(dept==="product"||r.includes("product"))return {tone:"customer-focused and practical",open:["The customer signal is moving","I am writing because the product decision window is narrowing","The market opportunity is not fully proven, but"],focus:"customer demand, scope, timing, and product value"};
  if(dept==="hardware"||dept==="software"||r.includes("engineer")||r.includes("architect")||r.includes("software"))return {tone:"technical and evidence-driven",open:["I am writing because","The engineering team is seeing","The current technical risk is"],focus:"delivery, technical quality, integration, and schedule realism"};
  return {tone:"balanced and operational",open:["I am writing because","I want to flag","The team is beginning to see"],focus:"operating balance and leadership attention"};
}
function senderPersonalityFor(comm,dept){
  const e=employees.find(x=>x.name===comm.from),traits=e?.traits||[],cred=ensureSenderCredibility(comm.from,dept);
  if(traits.includes("skeptical")||cred.caution>70)return "conservative";
  if(traits.includes("creative")||traits.includes("ambitious")||cred.overconfidence>24)return "optimistic";
  if(traits.includes("social"))return "diplomatic";
  if(traits.includes("focused")||traits.includes("analytical"))return "evidence-heavy";
  return "direct";
}
function naturalizeObservation(text){
  const t=String(text||"").replace(/\s+/g," ").trim();
  if(!t)return "";
  if(/^Internal intelligence/i.test(t))return naturalizeObservation(t.replace(/^Internal intelligence[^:]*:\s*/i,""));
  let cm=t.match(/Customer base\s+(\d+),\s+weighted sentiment\s+(\d+),\s+daily segment revenue\s+\$?([\d.]+)M/i);if(cm)return `The customer base is ${Number(cm[1])>=100?"broad":Number(cm[1])>=25?"growing":"still developing"}, sentiment looks ${operatingSignalPhrase(cm[2],{low:45,high:70,lowText:"weak",midText:"mixed",highText:"healthy"})}, and segment revenue is ${Number(cm[3])>=.08?"material":Number(cm[3])>.02?"emerging":"early"}.`;
  cm=t.match(/(.+):\s+(\d+)\s+active customer\(s\), sentiment\s+(\d+), churn risk\s+(\d+)/i);if(cm)return `${cm[1]} has a ${Number(cm[2])>=50?"meaningful":Number(cm[2])>=10?"developing":"small"} active customer base, ${operatingSignalPhrase(cm[3],{low:45,high:70,lowText:"weak",midText:"mixed",highText:"healthy"})} sentiment, and ${operatingSignalPhrase(cm[4],{low:35,high:65,lowText:"contained",midText:"visible",highText:"elevated"})} churn risk.`;
  cm=t.match(/Market context:\s+competitor pressure\s+(\d+), demand\s+(\d+)/i);if(cm)return `Market pressure is visible: competition is ${operatingSignalPhrase(cm[1],{low:40,high:70,lowText:"quiet",midText:"active",highText:"intense"})} and demand looks ${operatingSignalPhrase(cm[2],{low:40,high:70,lowText:"soft",midText:"mixed",highText:"strong"})}.`;
  let m=t.match(/Runway\s+(\d+)\s+day/i);if(m)return `Cash runway looks ${runwayPhrase(Number(m[1]))}.`;
  m=t.match(/net cash flow\s+\$?(-?[\d.]+)M\/day/i);if(m)return Number(m[1])<0?`The company is still burning cash each day.`:`Daily cash flow is positive.`;
  m=t.match(/Average stress\s+(\d+)/i);if(m)return Number(m[1])>=80?"The team is showing sustained burnout risk.":Number(m[1])>=65?"Workload pressure is elevated across the team.":"Average workload pressure is manageable.";
  m=t.match(/Need score\s+(\d+)/i);if(m)return Number(m[1])>=80?"The department is describing this as a sustained staffing need, not a one-day spike.":"The department sees a staffing need, but the case is still developing.";
  m=t.match(/workload\s+(\d+)/i);if(m)return Number(m[1])>=85?"Current workload is above what the department can comfortably absorb.":Number(m[1])>=65?"Department workload is elevated enough to affect planning.":"Department workload is not the main reason for the memo.";
  m=t.match(/blocked work\s+(\d+)/i);if(m)return Number(m[1])>0?`${m[1]} ${Number(m[1])===1?"piece of work is":"pieces of work are"} blocked or waiting on another team.`:"The work is not formally blocked, but capacity or timing is still a concern.";
  m=t.match(/^(.+) is below healthy staffing$/i);if(m)return `${m[1]} is operating below its healthy staffing level.`;
  m=t.match(/^(\d+) blocked work item\(s\)$/i);if(m)return Number(m[1])>0?`${m[1]} ${Number(m[1])===1?"work item is":"work items are"} blocked or waiting on another team.`:"No work items are formally blocked.";
  m=t.match(/active employees\s+(\d+)/i);if(m)return `The company currently has ${m[1]} active employee${Number(m[1])===1?"":"s"}.`;
  m=t.match(/retention cases\s+(\d+)/i);if(m)return Number(m[1])>0?`${m[1]} employee${Number(m[1])===1?" is":"s are"} now showing elevated retention risk.`:"No major retention case is visible yet.";
  m=t.match(/Quality\s+(\d+)/i);if(m)return Number(m[1])<55?`Product quality is below the level the team would like before broad exposure.`:`Product quality is ${operatingSignalPhrase(m[1],{low:55,high:72,lowText:"fragile",midText:"acceptable",highText:"healthy"})}, but related execution risks still matter.`;
  m=t.match(/unresolved mistakes\s+(\d+)/i);if(m)return Number(m[1])>0?`Rework and verification issues remain visible in the operating record.`:"Recent quality mistakes are not the main pressure point.";
  m=t.match(/manufacturing risk\s+(\d+)/i);if(m)return Number(m[1])>65?"Manufacturing and supply reliability are becoming a delivery risk.":"Manufacturing risk is present but not yet the dominant concern.";
  m=t.match(/progress\s+(\d+)%/i);if(m)return `The related work is about ${m[1]}% complete.`;
  m=t.match(/(\d+)\s+blocker\(s\)/i);if(m)return Number(m[1])>0?`${m[1]} blocker${Number(m[1])===1?" is":"s are"} still slowing the work.`:"No formal blocker is recorded, so the concern is more about capacity or timing.";
  m=t.match(/Hiring need confidence\s+(\d+)% for (.+)\./i);if(m)return `The staffing request is for ${m[2]}, and the department believes the need is credible.`;
  m=t.match(/Portfolio:\s+(\d+)\s+active,\s+(\d+)\s+at risk/i);if(m)return `${m[1]} project${Number(m[1])===1?" is":"s are"} active, with ${m[2]} currently at risk.`;
  if(/severity|urgency|routing score|confidence \d+/i.test(t))return "";
  return t.replace(/risk (\d+)/i,"risk is visible").replace(/confidence (\d+)/i,"confidence is moderate");
}
function evidenceSentence(raw){
  const text=naturalizeObservation(raw);
  if(!text)return "";
  return text.replace(/\.$/,".");
}
function selectMemoObservations(intel,ev,comm){
  const seen=new Set(),items=[];
  for(const raw of [...(intel.evidence||[]),...(comm.impacts||[])]){
    const obs=naturalizeObservation(raw);
    if(obs&&!seen.has(obs)){seen.add(obs);items.push(obs);}
    if(items.length>=4)break;
  }
  if(items.length<2){
    const cat=eventCategory(ev),dept=intel.department;
    if(dept==="finance"||cat==="finance")items.push(company.finance?.runwayDays<120?"Cash runway is now close enough to require judgment.":"The financial impact is manageable, but it still affects future flexibility.");
    else if(dept==="people"||cat==="people")items.push(avgStress()>65?"The people risk is building through workload pressure.":"The people impact is mostly about fairness, workload, and follow-through.");
    else if(dept==="quality"||cat==="operations")items.push("The visible risk is tied to reliability, verification, or delivery confidence.");
    else items.push("The issue affects company direction more than day-to-day task assignment.");
  }
  return items.slice(0,4);
}
function memoOpeningSentence(model,ev){
  const voice=senderVoiceProfile(model.department,model.senderRole),pick=voice.open[Math.abs((company.day||0)+(model.senderName||"").length)%voice.open.length];
  if(model.department==="board")return `${pick} outside expectations and company fundamentals are moving in different ways.`;
  if(eventCategory(ev)==="finance"||model.department==="finance")return `${pick} the decision could change runway, fixed costs, or investor confidence.`;
  if(eventCategory(ev)==="people"||model.department==="people")return pick.endsWith("seeing")?`${pick} signs that the current pace is becoming harder to sustain.`:`${pick} this issue is starting to affect how sustainable the current operating pace feels.`;
  if(eventCategory(ev)==="project")return `${pick} the portfolio needs a leadership call before the team commits more time and budget.`;
  return pick.endsWith("seeing")?`${pick} signs that this has crossed from ordinary operating work into a decision that needs executive judgment.`:`${pick} this has crossed from ordinary operating work into a decision that needs executive judgment.`;
}
function memoAssessmentSentence(model){
  const dept=model.department,obs=model.observations.join(" ").toLowerCase(),personality=model.senderPersonality;
  if(dept==="finance")return personality==="optimistic"?"The company may be able to absorb this, but the timing still matters because cash flexibility can disappear quickly.":"My concern is not the single cost. It is the fixed commitment and the way it narrows future options if revenue or funding arrives later than expected.";
  if(dept==="people")return "The immediate issue is not only output. The risk is that the company keeps meeting commitments by borrowing from morale, recovery time, or trust.";
  if(dept==="quality")return "I do not think this means the product has failed. It means the current evidence is asking us to decide whether to protect reliability before the risk becomes customer-facing.";
  if(dept==="product")return "The opportunity is real enough to consider, but the cost of being wrong is mostly scope creep, timing pressure, and customer trust.";
  if(dept==="board")return "The Board does not treat this as proof that the strategy is right or wrong. It does mean the next decision will influence how much patience the company receives.";
  if(/blocker|quality|verification|technical/.test(obs))return "The team can probably keep moving, but it is doing so with less margin for mistakes than I would like.";
  return "The company has options, but each one sends a different signal to employees, customers, and the Board.";
}
function localActionsSentence(model,ev){
  const dept=model.department,p=decisionProjectSubject(ev);
  if(model.contextKind==="hiring"||ev.hiringRequest)return "People and Finance have reviewed the staffing case first. The request is coming to you because approving headcount changes the company's cost structure and project capacity.";
  if(p)return `The team can continue making local adjustments on ${p.title}, but changing scope, pace, staffing, or cancellation would affect more than one department.`;
  if(dept==="quality")return "The team has already been trying to manage the issue through verification and rework. The next response would affect schedule, staffing, or customer exposure.";
  if(dept==="finance")return "Finance can tighten ordinary spending, but the larger choices now affect strategy, morale, or investor expectations.";
  if(dept==="people")return "Managers can coach and rebalance work locally, but this decision now affects fairness, retention, or company-wide expectations.";
  if(dept==="product")return "Product and Customer Success can handle ordinary customer issues, but this decision would change priorities or commitments.";
  return "The operating team has handled what it can locally. The remaining trade-off is now broad enough to require CEO judgment.";
}
function renderExecutiveEmailBody(model,ev){
  const facts=(model.observations||[]).map(evidenceSentence).filter(Boolean).slice(0,4);
  const factText=facts.length?`<h4>What we have observed</h4><ul class="evidence-list">${facts.map(f=>`<li>${f}</li>`).join("")}</ul>`:"";
  return `<p>${model.reasonForWriting}</p><p>${model.assessment}</p>${factText}<p>${localActionsSentence(model,ev)}</p><p><strong>Recommendation:</strong> ${model.recommendation}</p><p><strong>What we do not know:</strong> ${model.uncertaintyNote}</p>`;
}
function recommendationPhrase(title){
  const rec=String(title||"").replace(/\.$/,"").trim();
  if(!rec)return "";
  const lower=rec.charAt(0).toLowerCase()+rec.slice(1);
  const swaps=[
    ["approve","approving"],["authorize","authorizing"],["delay","delaying"],["reject","rejecting"],["freeze","freezing"],["continue","continuing"],
    ["raise","raising"],["reduce","reducing"],["sponsor","sponsoring"],["ask","asking"],["open","opening"],["create","creating"],
    ["commit","committing"],["protect","protecting"],["pursue","pursuing"],["stay","staying"],["improve","improving"],["wait","waiting"],
    ["accelerate","accelerating"],["fund","funding"],["publish","publishing"],["prioritize","prioritizing"],["defend","defending"],
    ["run","running"],["use","using"],["decline","declining"],["file","filing"],["document","documenting"],["pass","passing"],["order","ordering"],["cut","cutting"],["tighten","tightening"]
  ];
  for(const [from,to] of swaps){
    const re=new RegExp(`^${from}\\b`,"i");
    if(re.test(rec)){
      const phrase=lower.replace(re,to);
      return phrase.replace(/\b(approving|delaying|rejecting|opening|funding|canceling) position\b/,"$1 the position").replace(/\b(approving|canceling) project\b/,"$1 the project");
    }
  }
  return lower;
}
function shortProjectName(p){
  return p?.codename||p?.title||"the project";
}
function displayChoiceTitle(choice,ev={}){
  const raw=String(choice?.title||"").trim();
  if(!raw)return "Make a decision";
  const lower=raw.toLowerCase();
  const p=decisionProjectSubject(ev,choice);
  const project=shortProjectName(p);
  if(choice.hireRole)return `Approve a ${choice.hireRole} position`;
  if(choice.hire||choice.hiringException){
    const role=choice.role||ev.hiringRequest?.role||ev.hiringException?.role||hiringExceptionRole(choice)||"new role";
    if(choice.hiringException?.action==="continue-search")return `Continue the ${role} search`;
    if(choice.hiringException?.action==="contractor")return `Use temporary contractor coverage`;
    if(choice.hiringException?.action==="cancel-role")return `Close the ${role} search`;
    return `Approve the ${role} exception`;
  }
  if(choice.deferHiring){
    const role=choice.deferHiring.role||ev.hiringRequest?.role||"role";
    return `Delay the ${role} position`;
  }
  if(choice.rejectHiring){
    const role=choice.rejectHiring.role||ev.hiringRequest?.role||"role";
    return `Decline the ${role} request`;
  }
  if(choice.hiringPolicy?.mode==="frozen")return "Freeze new headcount";
  if(choice.hiringPolicy?.mode==="critical-only")return "Allow only critical roles";
  if(choice.hiringPolicy?.mode==="normal")return "Keep normal hiring review";
  if(choice.projectDecision){
    const action=choice.projectDecision.action;
    if(action==="continue")return `Stay on the ${project} plan`;
    if(action==="resume")return `Resume ${project}`;
    if(action==="pause")return `Pause ${project}`;
    if(action==="cancel")return `Cancel ${project}`;
    if(action==="reduce")return `Reduce ${project} scope`;
    if(action==="expand")return `Increase ${project} budget`;
    if(action==="split")return `Split ${project} into phases`;
    if(action==="merge")return `Merge ${project} with related work`;
    if(action==="validate")return `Require customer validation for ${project}`;
    if(action==="approve")return `Approve ${project}`;
    if(action==="pilot")return `Approve a ${project} pilot`;
    if(action==="delay")return `Delay ${project} one quarter`;
    if(action==="reject")return `Reject ${project}`;
  }
  if(choice.commercializeProject?.mode==="launch")return `Launch ${project} commercially`;
  if(choice.commercializeProject?.mode==="pilot")return `Run a limited ${project} pilot`;
  if(choice.commercializeProject?.mode==="shelve")return `Shelve ${project} for now`;
  if(choice.customerStrategy?.mode==="recovery")return "Approve a customer recovery plan";
  if(choice.customerStrategy?.mode==="support")return "Fund temporary support capacity";
  if(choice.customerStrategy?.mode==="hold")return "Hold the current roadmap line";
  if(lower.includes("restructure around the strongest team"))return p?`Reassign experienced staff to ${project}`:"Reassign experienced staff to the priority work";
  if(lower.includes("protect a minimum cash reserve"))return "Delay non-essential spending";
  if(lower.includes("narrow the promise"))return "Reduce the first-release scope";
  if(lower.includes("protect growth bets"))return "Protect the highest-upside projects";
  if(lower.includes("cut project burn"))return "Reduce active project spending";
  if(lower.includes("order portfolio triage"))return "Review the highest-risk projects";
  if(lower.includes("stay the course"))return p?`Stay on the ${project} plan`:"Stay on the current plan";
  if(lower.includes("continue current strategy"))return "Continue the current strategy";
  return raw;
}
function displayChoiceTitleFromRecommendation(title,ev={}){
  const choice=(ev.choices||[]).find(c=>c.title===title)||null;
  return choice?displayChoiceTitle(choice,ev):String(title||"").replace(/\.$/,"").trim();
}
function naturalRecommendationSentence(intel,model,ev={}){
  const recRaw=intel.recommendedChoice||String(intel.recommendation||"").replace(/^.*recommends\s+/i,"").replace(/\.$/,"");
  const rec=displayChoiceTitleFromRecommendation(recRaw,ev);
  if(!rec)return "I recommend making a narrow decision now and reviewing the outcome after the next operating signal.";
  return `I recommend ${recommendationPhrase(rec)}.`;
}
function uncertaintySentence(model,intel){
  const band=model.confidenceBand,dept=model.department,cred=model.senderCredibility||{};
  if(dept==="board")return `${band} confidence. The Board may be over-weighting recent market signals, so this should be treated as judgment rather than certainty.`;
  if(dept==="finance")return `${band} confidence. The cash estimate is clearer than the operating effect, especially if hiring, launch timing, or customer demand changes.`;
  if(dept==="people")return `${band} confidence. I may be underestimating how much the team can absorb, but the retention and morale signals are worth taking seriously.`;
  if(dept==="quality")return `${band} confidence. I am more confident about the technical risk than the exact customer impact.`;
  if((cred.overconfidence||0)>24)return `${band} confidence. The sender has historically been optimistic about upside, so the downside case still deserves attention.`;
  if((cred.caution||0)>70)return `${band} confidence. The sender is usually cautious, so the memo may lean toward avoiding downside.`;
  return `${band} confidence. The available evidence is useful, but it does not remove execution or market uncertainty.`;
}
function lessonRelevanceScore(lesson,model){
  const text=String(`${model.subject||""} ${model.contextKind||""} ${model.department||""} ${(model.observations||[]).join(" ")} ${lesson.key||""} ${lesson.title||""}`).toLowerCase();
  let score=0;
  if(!lesson||lesson.state==="obsolete")return 0;
  if(lesson.department==="company"||lesson.department===model.department)score+=18;
  if(model.contextKind&&String(lesson.key||"").includes(model.contextKind))score+=24;
  if(/project|portfolio|milestone|scope/.test(text)&&/project|portfolio|scope|validation/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  if(/customer|renewal|churn|support/.test(text)&&/customer|retention|churn|support/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  if(/cash|runway|spend|budget|finance/.test(text)&&/cash|runway|finance|spending/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  if(/hire|staff|burnout|retention|people/.test(text)&&/hire|burnout|retention|people|workforce/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  if(/quality|defect|verification|rework/.test(text)&&/quality|verification|rework|defect/.test(String(lesson.key+" "+lesson.title).toLowerCase()))score+=24;
  score+=lessonStateWeight(lesson)*18;
  score+=clamp((lesson.confidence||0)-55,0,35)*.45;
  score+=clamp((lesson.episodeKeys||[]).length,0,4)*5;
  score-=clamp((company.day-(lesson.lastDay||company.day))/180,0,1)*12;
  score-=lesson.outcome==="mixed"?8:lesson.outcome==="negative"?4:0;
  return score;
}
function institutionalLearningLine(model){
  const lessons=(company.lessons||[]).filter(l=>(!model.department||l.department===model.department||l.department==="company")&&(l.confidence||0)>50&&l.state!=="prior").map(l=>({lesson:l,score:lessonRelevanceScore(l,model)})).filter(x=>x.score>=42).sort((a,b)=>b.score-a.score)[0]?.lesson;
  if(!lessons)return "";
  const evidenceCount=(lessons.episodeKeys?.length||0)+(lessons.sampleCount||0);
  const subject=model.relatedProjectName||model.subject||teamDisplayName(model.department||"company");
  const state=lessons.state==="validated"?"has validated":lessons.state==="provisional"?"is cautiously applying":"is testing";
  const title=String(lessons.title||lessons.key||"a prior lesson").replace(/^Decision learning:\s*/i,"").replace(/^Communication learning:\s*/i,"");
  if(/verification|quality|rework|defect/i.test(`${lessons.key} ${lessons.title}`))return `${teamDisplayName(lessons.department||model.department||"company")} ${state} a quality lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience is being applied to ${subject}.`;
  if(/burnout|overload|resignation|retention/i.test(`${lessons.key} ${lessons.title}`))return `${teamDisplayName(lessons.department||model.department||"company")} ${state} a people-risk lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience affects how this memo weighs workload and retention.`;
  if(/runway|cash|finance|spending/i.test(`${lessons.key} ${lessons.title}`))return `${teamDisplayName(lessons.department||"finance")} ${state} a finance lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience shapes the runway recommendation here.`;
  if(/project|portfolio|scope|validation/i.test(`${lessons.key} ${lessons.title}`))return `${teamDisplayName(lessons.department||model.department||"company")} ${state} a portfolio lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience is being applied to ${subject}.`;
  if(/customer|retention|churn|support/i.test(`${lessons.key} ${lessons.title}`))return `Customer Success ${state} a customer lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}. That experience shapes how this memo weighs renewals, churn, and promises.`;
  return `${teamDisplayName(lessons.department||model.department||"company")} ${state} a relevant company lesson from ${Math.max(1,evidenceCount)} prior signal(s): ${title}.`;
}
function allPortfolioSubjects(){
  return [...(company.projects||[]),...(company.projectProposals||[]),...(company.projectArchive||[])];
}
function hiringExceptionRole(choice={}){
  const id=choice.hiringException?.id||choice.id;
  if(!id)return null;
  return (company.recruitingPipeline||[]).find(r=>r.id===id)?.role||null;
}
function projectFromWorkSubject(work){
  if(!work?.projectId)return null;
  return allPortfolioSubjects().find(p=>p.id===work.projectId)||null;
}
function hiringDecisionRole(ev,choice={}){
  return choice.hire?.role||choice.hireRole||choice.hiringException?.role||hiringExceptionRole(choice)||choice.deferHiring?.role||choice.rejectHiring?.role||ev.hiringRequest?.role||ev.hireRole||ev.deferHiring?.role||ev.rejectHiring?.role||null;
}
function decisionContextSubject(ev,choice={}){
  const work=decisionWorkSubject(ev);
  const project=decisionProjectSubject(ev,choice)||projectFromWorkSubject(work);
  if(project)return {kind:"project",label:"Project",name:project.title||project.codename||project.id,id:project.id,detail:work?.title?`Related work: ${work.title}`:project.status?`Status: ${project.status}`:""};
  if(work)return {kind:"work",label:"Work item",name:work.title||work.id,id:work.id,detail:work.assignedTeam?`Team: ${teamDisplayName(work.assignedTeam)}`:""};
  if(ev.hiringPolicyReview||choice.hiringPolicy)return {kind:"hiring-policy",label:"Hiring policy",name:hiringPolicyLabel?.()||"Current policy",id:ev.id||null,detail:"Company-wide hiring rule"};
  const role=hiringDecisionRole(ev,choice);
  if(role)return {kind:"hiring",label:"Hiring request",name:role,id:ev.hiringRequest?.id||null,detail:ev.hiringRequest?.department?`Team: ${teamDisplayName(ev.hiringRequest.department)}`:ev.hiringRequest?.team?`Team: ${teamDisplayName(ev.hiringRequest.team)}`:""};
  if(ev.customerSegmentId)return {kind:"customer",label:"Customer segment",name:CUSTOMER_SEGMENT_DEFS[ev.customerSegmentId]?.label||ev.customerSegmentId,id:ev.customerSegmentId,detail:"Customer-facing decision"};
  const department=ev.memoIntelligence?.department||eventCategory(ev);
  if(department)return {kind:"department",label:"Department",name:teamDisplayName(department),id:department,detail:"Company-level operating decision"};
  return null;
}
function decisionContextSummary(ev,choice={}){
  const ctx=decisionContextSubject(ev,choice);
  return ctx?`${ctx.label}: ${ctx.name}`:"";
}
function decisionContextBlockHtml(model,ev={}){
  const ctx=model.decisionContext||decisionContextSubject(ev);
  const work=model.relatedWorkItemTitle?`Related work: ${model.relatedWorkItemTitle}`:ctx?.detail;
  const items=[ctx?`Decision context: ${ctx.label}: ${ctx.name}`:null,work||null,model.relatedDepartmentIds?.length?`Responsible area: ${model.relatedDepartmentIds.map(teamDisplayName).join(", ")}`:null].filter(Boolean);
  if(!items.length)return "";
  return `<div class="memo-block memo-context"><h4>Decision context</h4><ul class="evidence-list">${items.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
}
function buildStructuredExecutiveMessage(ev,comm,intel){
  const dept=intel.department||memoDepartmentFor(ev,comm),cred=ensureSenderCredibility(comm.from,dept),observations=selectMemoObservations(intel,ev,comm),sourceMsg=(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId),senderEmployee=employees.find(e=>e.name===comm.from),work=decisionWorkSubject(ev),project=decisionProjectSubject(ev)||projectFromWorkSubject(work),sourceIds=[ev.id,ev.sourceMessageId,sourceMsg?.issueId,sourceMsg?.workItemId].filter(Boolean);
  const role=hiringDecisionRole(ev);
  const model={senderId:senderEmployee?.id??null,senderName:comm.from||"Executive Office",senderRole:comm.role||"Leadership Team",department:dept,subject:comm.subject||ev.title,sentDay:company.day,sentMinute:company.minute||0,reasonForWriting:"",observations,assessment:"",recommendation:"",confidenceBand:confidenceBand((cred.evidenceQuality||58)*.45+(cred.estimateAccuracy||55)*.35+(100-(cred.overconfidence||0))*.2),uncertaintyNote:"",sourceIds,decisionContext:decisionContextSubject(ev),relatedProjectId:project?.id||null,relatedProjectName:project?.title||project?.codename||null,relatedWorkItemId:work?.id||sourceMsg?.workItemId||null,relatedWorkItemTitle:work?.title||null,relatedRoleIds:role?[role]:[],relatedEmployeeIds:intel.originEmployeeIds||[],relatedDecisionId:ev.id,senderPersonality:senderPersonalityFor(comm,dept),senderCredibility:{...cred},debug:{senderBias:departmentBiasProfile(dept),recommendationScores:(ev.choices||[]).map(c=>({choice:c.title,score:Math.round(evaluateChoiceForDepartment(c,dept,{event:ev,evidence:intel.evidence||[]}).score)})),observationsRaw:intel.evidence||[],institutionalLearning:[]}};
  model.contextKind=ev.hiringRequest?"hiring":ev.customerSegmentId?"customer":ev.projectDecision||project?"project":eventCategory(ev);
  model.reasonForWriting=memoOpeningSentence(model,ev);
  model.assessment=memoAssessmentSentence(model);
  const learning=institutionalLearningLine(model);
  if(learning){model.debug.institutionalLearning=[learning];model.assessment+=` ${learning}`;}
  model.recommendation=naturalRecommendationSentence(intel,model,ev);
  model.uncertaintyNote=uncertaintySentence(model,intel);
  return model;
}
function renderStructuredExecutiveMessage(model,ev={}){
  const related=[model.relatedCustomerSegment?`Affected Customer Segment: ${model.relatedCustomerSegment}`:null,model.relatedRoleIds?.length?`Affected Role: ${model.relatedRoleIds.join(", ")}`:null,model.decisionDeadlineDay!==undefined?`Decision Needed By: Day ${model.decisionDeadlineDay+1}`:null,model.reasonForEscalation?`Why You Are Receiving This: ${model.reasonForEscalation}`:null].filter(Boolean).map(x=>`<li>${x}</li>`).join("");
  return `${decisionContextBlockHtml(model,ev)}${renderExecutiveEmailBody(model,ev)}${related?`<h4>Decision details</h4><ul class="evidence-list">${related}</ul>`:""}`;
}
function communicationHeaderHtml(comm,model){
  const cc=(model?.ccRecipients||[]).join(", ")||"Executive Staff";
  const sent=model?.sentDay!==undefined?`Day ${model.sentDay+1}, ${formatMemoTime(model.sentMinute||company.minute||0)}`:comm.date;
  const subject=model?.subject||comm.subject;
  const type=model?.messageType||comm.type||"Executive Email";
  const context=model?.decisionContext?`<div><strong>Decision Context:</strong> ${model.decisionContext.label}: ${model.decisionContext.name}</div>`:"";
  if(type==="Board Memorandum"||String(comm.type||"").includes("Board")){
    return `<div class="memo-meta"><div><strong>To:</strong> CEO</div><div><strong>From:</strong> ${comm.from}, ${comm.role}</div><div><strong>Date:</strong> ${sent}</div><div><strong>Subject:</strong> ${subject}</div>${context}<div><strong>Priority:</strong> ${comm.priority}</div><div><strong>Decision Required:</strong> ${model?.decisionRequired?"Yes":"No"}</div></div>`;
  }
  return `<div class="memo-meta"><div><strong>From:</strong> ${comm.from}, ${comm.role}</div><div><strong>To:</strong> CEO</div><div><strong>Cc:</strong> ${cc}</div><div><strong>Subject:</strong> ${subject}</div>${context}<div><strong>Sent:</strong> ${sent}</div><div><strong>Priority:</strong> ${comm.priority}</div><div><strong>Status:</strong> ${model?.decisionRequired?"Decision required":"Informational"}</div></div>`;
}
function formatMemoTime(minute){
  const m=Number.isFinite(minute)?minute:480,h=Math.floor(m/60)%24,mm=String(Math.floor(m%60)).padStart(2,"0"),period=h>=12?"PM":"AM",display=h%12||12;
  return `${display}:${mm} ${period}`;
}
function optionReasonText(choice,ev){
  if(choice.hiringPolicy?.mode==="frozen")return "Use this when cash discipline matters more than adding ordinary capacity. Critical exceptions can still come back to the CEO.";
  if(choice.hiringPolicy?.mode==="critical-only")return "Use this when the company still needs essential hires, but optional growth roles should wait.";
  if(choice.hiringPolicy?.mode==="normal")return "Use this when staffing pressure is real enough that departments should keep bringing evidence-based headcount requests.";
  if(choice.hiringException?.action==="continue-search")return "Use this when the specific role is important enough to keep recruiting despite the current cash warning.";
  if(choice.hiringException?.action==="contractor")return "Use this when the team needs relief now but the permanent role should remain an HR search.";
  if(choice.hiringException?.action==="cancel-role")return "Use this when protecting runway is more important than filling this open role right now.";
  if(choice.hire||choice.hiringException)return "Approve the position or exception if the capacity problem is more expensive than the added payroll.";
  if(choice.deferHiring)return "Wait if the department can manage the pressure through prioritization, temporary coverage, or reduced scope.";
  if(choice.rejectHiring)return "Decline the request if the company needs the department to shrink the work rather than expand the team.";
  if(choice.hiringPolicy)return "Use this when staffing decisions need a company-wide rule instead of case-by-case exceptions.";
  if(choice.projectDecision)return "Use this when the project needs a clear executive direction before the team spends more time or budget.";
  if(choice.commercializeProject)return "Choose this path when completed work needs a market posture before customers and support teams can respond.";
  if(choice.customerStrategy)return "Choose this if customer trust now depends on changing product, support, pricing, or roadmap priorities.";
  if(choice.fundraising)return "Choose this if capital strategy matters more than preserving ownership or avoiding investor expectations.";
  const strategy=choice.strategy||inferDecisionStrategy(choice);
  if(strategy==="finance"||strategy==="cost-control")return "Choose this if preserving runway is more important than protecting every current plan.";
  if(strategy==="quality"||strategy==="pilot")return "Choose this if reliability and learning matter more than immediate speed.";
  if(strategy==="growth"||strategy==="speed")return "Choose this if the company needs momentum before the opportunity window narrows.";
  if(strategy==="people")return "Choose this if employee workload, trust, or retention is the real constraint.";
  return "Choose this if the situation needs a clear leadership signal more than more local analysis.";
}
function expectedEffectsHtml(choice,ev){
  const p=decisionProjectSubject(ev,choice),project=p?.title||p?.codename||"the affected project";
  const role=ev.hiringRequest?.role||choice.hireRole||choice.hiringException?.role||hiringExceptionRole(choice)||choice.deferHiring?.role||choice.rejectHiring?.role||"the affected role";
  const seg=ev.customerSegmentId?CUSTOMER_SEGMENT_DEFS[ev.customerSegmentId]?.label||"the affected customer segment":"the affected customers";
  let immediate=`The responsible team begins the approved action and reports progress through the normal chain of command.`;
  let next=`The decision changes workload, cost, or risk in the area named in this memo.`;
  let long=`Follow-up reviews will compare the actual result against the evidence available today.`;
  if(choice.hiringPolicy){immediate="People and Finance update the company-wide hiring rule.";next="New requests are either allowed, restricted, or suppressed according to the policy.";long="Retention, board confidence, runway, and project delivery show whether the policy was sustainable.";}
  else if(choice.hire){immediate="HR opens the approved position.";next="Recruiting, interviews, and onboarding change capacity slowly.";long="Payroll, retention, and project delivery reveal whether the hire was worth it.";}
  else if(choice.hiringException){immediate="HR updates this open role according to your decision.";next="The affected team either keeps waiting for a hire, gets temporary coverage, or reprioritizes without the role.";long="Payroll, workload, and delivery show whether the exception was handled well.";}
  else if(choice.deferHiring||choice.rejectHiring){immediate=`People and Finance record your decision on ${role}.`;next=`The department continues with its current capacity while backlog and stress reveal the cost of waiting.`;long=`Future reviews will show whether avoiding payroll was worth the execution pressure.`;}
  else if(choice.projectDecision){immediate=`Portfolio Council updates ${project}'s direction.`;next=`Staffing, blockers, quality, and schedule begin moving around the new ${project} plan.`;long=`${project}'s health and commercial value reveal whether the decision fit the opportunity.`;}
  else if(choice.customerStrategy){immediate=`Customer Success and Product act on the ${seg} plan.`;next=`Support load, renewals, sentiment, and revenue begin responding in ${seg}.`;long=`${seg} either becomes more durable or exposes the cost of the decision.`;}
  else if(choice.commercializeProject){immediate=`Product and Customer Success set the commercial path for ${project}.`;next=`Customers, support load, and revenue begin responding to the chosen exposure level.`;long=`The market will show whether ${project} was launched, piloted, or held at the right time.`;}
  else if(choice.fundraising){immediate="Investor relations and cash planning change.";next="Runway improves or ownership and expectations become more demanding.";long="Valuation quality and board confidence test the capital decision.";}
  return `<small><b>Expected effects:</b><br>Immediate: ${immediate}<br>Next few weeks: ${next}<br>Long term: ${long}</small>`;
}
function optionBenefitSentence(choice,ev){
  const p=decisionProjectSubject(ev,choice),text=String(`${choice.title} ${choice.detail} ${(choice.benefits||[]).join(" ")}`).toLowerCase();
  if(choice.hiringPolicy?.mode==="frozen")return `The company slows payroll growth while still preserving a path for critical exceptions.`;
  if(choice.hiringPolicy?.mode==="critical-only")return `The company protects essential capacity without approving every growth request.`;
  if(choice.hiringPolicy?.mode==="normal")return `Departments can keep escalating real staffing needs while HR handles candidates without CEO micromanagement.`;
  if(choice.hiringException?.action==="continue-search")return `The affected team keeps a path to permanent capacity without asking the CEO to review candidates.`;
  if(choice.hiringException?.action==="contractor")return `The team gets temporary relief while HR keeps the permanent search alive.`;
  if(choice.hiringException?.action==="cancel-role")return `The company avoids a new payroll commitment and forces the department to narrow work around current capacity.`;
  if(choice.hire||choice.hiringException)return `The company can add capacity without turning the CEO into the hiring manager.`;
  if(choice.deferHiring)return `The company preserves runway and gives managers time to prove whether the need can be handled through prioritization or internal coverage.`;
  if(choice.rejectHiring)return `The company avoids adding payroll and forces the department to narrow its commitments around the capacity it already has.`;
  if(choice.projectDecision?.action==="pause")return `This gives the team time to reduce execution risk before spending more effort on a weak path.`;
  if(choice.projectDecision?.action==="cancel")return `This releases people and attention from work that may no longer deserve priority.`;
  if(choice.projectDecision)return p?`This gives ${p.title} a clearer direction and lets the team plan around one executive choice.`:`This gives the portfolio a clearer direction.`;
  if(choice.customerStrategy)return `This gives customer-facing teams a clearer promise to make and a bounded way to protect trust.`;
  if(/quality|validation|pilot|verify|reliability/.test(text))return `This reduces the chance that the company discovers the problem later, when it is more expensive and more public.`;
  if(/cash|runway|freeze|cut|budget|fund/.test(text))return `This protects financial flexibility while the company learns whether revenue or funding will arrive on time.`;
  if(/speed|launch|accelerate|growth|revenue/.test(text))return `This keeps momentum alive while the opportunity window is still open.`;
  return sentenceCase((choice.benefits||[])[0]||"This gives leadership a clear way to move the situation forward.");
}
function optionRiskSentence(choice,ev){
  const text=String(`${choice.title} ${choice.detail} ${(choice.risks||[]).join(" ")}`).toLowerCase();
  if(choice.hiringPolicy?.mode==="frozen")return `The staffing need does not disappear; it may return as project delay, burnout, or quality risk.`;
  if(choice.hiringPolicy?.mode==="critical-only")return `Managers may disagree about what is truly critical, and some useful growth work may slow down.`;
  if(choice.hiringPolicy?.mode==="normal")return `Payroll can grow faster than runway if too many approved roles fill before revenue catches up.`;
  if(choice.hiringException?.action==="continue-search")return `If HR fills the role, payroll rises while runway is already under pressure.`;
  if(choice.hiringException?.action==="contractor")return `Contractors cost cash quickly and may not solve the long-term capability gap.`;
  if(choice.hiringException?.action==="cancel-role")return `The workload remains inside the department and may show up later as missed milestones or resignations.`;
  if(choice.hire||choice.hiringException)return `The cost becomes permanent only after HR fills the role, and a weak hire could add payroll without solving the capacity problem.`;
  if(choice.deferHiring)return `If the department is already stretched, waiting may turn today's backlog into missed milestones or retention pressure.`;
  if(choice.rejectHiring)return `The work does not disappear. It is likely to show up later as project delay, lower quality, or frustration inside the affected department.`;
  if(choice.projectDecision?.action==="pause")return `The market window may narrow, and the team may read the pause as a loss of confidence.`;
  if(choice.projectDecision?.action==="cancel")return `If the project had more hidden value than management can currently see, the company may regret losing the option.`;
  if(choice.projectDecision)return `The project may still miss its target if the underlying blocker is larger than the current evidence suggests.`;
  if(choice.customerStrategy)return `The company may spend support capacity or make promises before it fully understands the customer problem.`;
  if(/quality|validation|pilot|verify|reliability/.test(text))return `The extra time may not uncover anything material, which would make the delay feel expensive.`;
  if(/cash|runway|freeze|cut|budget/.test(text))return `The company may protect cash but create pressure in morale, delivery, or customer trust.`;
  if(/speed|launch|accelerate|growth|revenue/.test(text))return `Moving faster may expose quality or support problems before the organization is ready.`;
  return sentenceCase((choice.risks||[])[0]||"The outcome still depends on execution and information the company does not fully have.");
}
function sentenceCase(text){
  const s=String(text||"").replace(/\.$/,"").trim();
  if(!s)return "";
  return s.charAt(0).toUpperCase()+s.slice(1)+".";
}
function choiceDepartmentPerspectiveText(choice,ev){
  const views=(ev.memoIntelligence?.alternativeRecommendations||[]).filter(v=>v.recommendation===choice.title).map(v=>`${v.department}: ${v.reason}`).slice(0,2);
  if(views.length)return views.join(" | ");
  const dept=ev.memoIntelligence?.department||eventCategory(ev);
  return `${teamDisplayName(dept)}: ${departmentViewpointReason(dept,ev,choice)}`;
}
function renderDecisionChoiceHtml(choice,ev){
  const context=decisionContextSummary(ev,choice);
  return `<strong>${displayChoiceTitle(choice,ev)}</strong>${context?`<small><b>Applies to:</b> ${context}</small>`:""}<small>${choice.detail}</small><small><b>Why choose this?</b> ${optionReasonText(choice,ev)}</small><small><b>Potential benefit:</b> ${optionBenefitSentence(choice,ev)}</small><small><b>Potential downside:</b> ${optionRiskSentence(choice,ev)}</small>${expectedEffectsHtml(choice,ev)}`;
}
function messageFingerprintFor(ev,comm){
  const subjectType=ev.category||eventCategory(ev),subjectId=ev.customerSegmentId||ev.commercialProjectId||ev.projectDecision?.id||ev.hiringRequest?.id||ev.sourceMessageId||ev.id,issueType=ev.id||ev.title||comm.subject,escalationLevel=comm.priority||"Normal";
  return `${subjectType}|${subjectId||"company"}|${issueType}|${escalationLevel}`;
}
function ensureMessageThread(ev,comm,model){
  ensureBibleSystems?.();
  const fingerprint=messageFingerprintFor(ev,comm);
  let thread=(company.messageThreads||[]).find(t=>!t.resolved&&t.fingerprint===fingerprint);
  if(!thread){
    thread={threadId:company.nextMessageThreadId++,fingerprint,subjectType:ev.category||eventCategory(ev),subjectId:ev.customerSegmentId||ev.commercialProjectId||ev.projectDecision?.id||ev.id,createdDay:company.day,originalMessageId:ev.id,relatedMessages:[ev.id].filter(Boolean),relatedDecisions:[],currentStatus:"waiting-on-ceo",nextReviewDay:company.day+14,resolved:false,resolutionSummary:null};
    company.messageThreads.unshift(thread);
    company.messageThreads=company.messageThreads.slice(0,120);
  }else{
    thread.relatedMessages=[...new Set([...(thread.relatedMessages||[]),ev.id].filter(Boolean))];
    thread.currentStatus=thread.currentStatus||"waiting-on-ceo";
  }
  company.messageFingerprints[fingerprint]={day:company.day,threadId:thread.threadId,status:thread.currentStatus};
  if(model)model.messageThreadId=thread.threadId;
  return thread;
}
function ensureExecutiveMessageModel(ev,comm){
  if(comm.structuredMessage&&comm.message){ev.generatedCommunication={...(ev.generatedCommunication||{}),structuredMessage:comm.structuredMessage,message:comm.message};return comm.structuredMessage;}
  ev.memoIntelligence=ev.memoIntelligence||buildMemoIntelligence(ev,comm);
  const model=buildStructuredExecutiveMessage(ev,comm,ev.memoIntelligence);
  model.messageId=ev.id||nextSimulationId("message");
  model.messageType=String(comm.type||"Executive Email").includes("Board")?"Board Memorandum":(ev.informationalOnly||comm.priority==="FYI"||comm.priority==="Information")?"Informational Update":"Executive Email";
  model.recipients=["CEO"];
  model.ccRecipients=model.department==="board"?["Board of Directors"]:["Executive Staff"];
  model.priority=comm.priority||"Normal";
  model.decisionRequired=!(ev.informationalOnly||comm.priority==="FYI"||comm.priority==="Information");
  model.decisionDeadlineDay=comm.decisionDeadlineDay??(company.day+(model.priority==="Urgent"?5:model.priority==="High"?9:14));
  model.relatedDepartmentIds=[model.department].filter(Boolean);
  model.relatedCustomerSegment=comm.relatedCustomerSegment||(ev.customerSegmentId?CUSTOMER_SEGMENT_DEFS[ev.customerSegmentId]?.label:null);
  model.reasonForEscalation=comm.reasonForEscalation||ev.memoIntelligence?.why||"The issue exceeded local authority or requires CEO trade-off.";
  model.whyNow=comm.whyNow||model.reasonForWriting;
  model.authorityBoundary=comm.authorityBoundary||"CEO decision required for strategic trade-off.";
  model.selectedEvidence=ev.memoIntelligence?.evidence||[];
  model.departmentPerspectives=ev.memoIntelligence?.alternativeRecommendations||[];
  model.choiceIds=(ev.choices||[]).map(c=>c.title);
  model.sourceIds=[...(model.sourceIds||[]),messageFingerprintFor(ev,comm)];
  const thread=ensureMessageThread(ev,comm,model);
  ev.messageThreadId=thread.threadId;
  comm.structuredMessage=model;
  comm.message=renderStructuredExecutiveMessage(model,ev);
  ev.generatedCommunication={...(ev.generatedCommunication||{}),structuredMessage:model,message:comm.message};
  return model;
}
function validateMessageContext(ev){
  if(!ev)return {valid:false,reason:"missing message"};
  if(ev.projectDecision?.id){
    const p=[...(company.projects||[]),...(company.projectProposals||[]),...(company.projectArchive||[])].find(x=>x.id===ev.projectDecision.id);
    if(!p||["completed","canceled","rejected","merged"].includes(p.status))return {valid:false,reason:"project no longer requires that decision"};
  }
  if(ev.commercialProjectId){
    const p=[...(company.projectArchive||[]),...(company.projects||[])].find(x=>x.id===ev.commercialProjectId);
    if(!p||["launched","pilot","shelved"].includes(p.commercialStatus))return {valid:false,reason:"commercial path already changed"};
  }
  if(ev.hiringRequest?.pipelineId){
    const req=(company.hiringPipeline||[]).find(x=>x.id===ev.hiringRequest.pipelineId);
    if(!req||["filled","canceled","rejected"].includes(req.status))return {valid:false,reason:"hiring request is no longer active"};
  }
  if(ev.customerSegmentId){
    const seg=company.customerSegments?.[ev.customerSegmentId];
    if(!seg||((seg.churnRisk||0)<35&&(seg.currentIssues||[]).filter(i=>!i.resolved).length===0))return {valid:false,reason:"customer issue no longer requires CEO action"};
  }
  return {valid:true,reason:"current"};
}
function memoQualityAudit(ev,comm,intel){
  const choices=Array.isArray(ev.choices)?ev.choices:[];
  const evidenceSignals=(intel.evidence||[]).map((text,i)=>({index:i,text,ids:evidenceSignalIds(text)}));
  const choiceLinks=choices.map(c=>{
    const ids=choiceEvidenceIds(c),matches=evidenceSignals.filter(e=>e.ids.some(id=>ids.includes(id)));
    return {choice:c.title,evidence:matches.length,evidenceIds:ids,matchedEvidence:matches.map(e=>e.index)};
  });
  const checks={sender:!!comm.from,chain:(intel.chainOfCommand||[]).length>0,situation:!!comm.message,evidence:(intel.evidence||[]).length>=2,recommendation:!!intel.recommendation,noAction:!!intel.noActionForecast&&/\d/.test(intel.noActionForecast),uncertainty:!!intel.uncertainty,choices:choices.length===3,choiceLinks:choiceLinks.every(x=>x.evidence>0)};
  const passed=Object.values(checks).filter(Boolean).length;
  return {relevanceScore:Math.round(passed/Object.keys(checks).length*100),evidenceCoverage:(intel.evidence||[]).length,recommendationConflict:(intel.alternativeRecommendations||[]).some(v=>v.confidence<60)||new Set((intel.alternativeRecommendations||[]).map(v=>v.recommendation)).size>1,uncertaintyPresent:checks.uncertainty,chainOfCommandValid:checks.chain,choiceEvidenceLinks:choiceLinks,checks,ok:passed===Object.keys(checks).length};
}
function memoIntelligenceHtml(ev,comm){
  const intel=ev.memoIntelligence||buildMemoIntelligence(ev,comm);ev.memoIntelligence=intel;
  const viewpoints=(intel.alternativeRecommendations||[]).map(v=>{const rec=displayChoiceTitleFromRecommendation(v.recommendation||"reviewing the evidence",ev);return `<div class="recommendation"><strong>${v.department} recommends: ${rec}</strong><span>${v.reason}</span></div>`;}).join("");
  const routing=(intel.chainOfCommand||[]).slice(0,2).map(x=>`<li>${x}</li>`).join("");
  const debug=debugMode?`<div class="memo-audit"><strong>AI Debug - memo construction</strong><br>Routing: ${routing||intel.why}<br>Source IDs: ${(comm.structuredMessage?.sourceIds||[ev.id,ev.sourceMessageId].filter(Boolean)).join(", ")||"none"}<br>Selected observations: ${(comm.structuredMessage?.observations||[]).join(" | ")||"none"}<br>Sender bias: ${departmentBiasProfile(intel.department).focus}<br>Sender confidence: ${comm.structuredMessage?.confidenceBand||"n/a"}<br>Recommendation score by choice: ${(comm.structuredMessage?.debug?.recommendationScores||[]).map(x=>`${x.choice} ${x.score}`).join("; ")||"n/a"}<br>Institutional Learning inputs: ${(comm.structuredMessage?.debug?.institutionalLearning||[]).join(" | ")||"none"}<br>Hidden communication quality: relevance ${intel.audit.relevanceScore}%, evidence items ${intel.audit.evidenceCoverage}, chain ${intel.audit.chainOfCommandValid?"valid":"review"}.</div>`:"";
  return `<div class="memo-block"><h4>Department viewpoints</h4><div class="recommendation-list">${viewpoints||'<div class="recommendation"><strong>No material disagreement recorded</strong><span>The departments are broadly aligned, but execution uncertainty remains.</span></div>'}</div></div>${debug}`;
}
function archiveCommunication(ev,choice,comm){
  recordMetricEvent("executiveMemos");
  company.communications=Array.isArray(company.communications)?company.communications:[];
  ensureExecutiveMessageModel(ev,comm);
  const intel=ev.memoIntelligence||buildMemoIntelligence(ev,comm);
  const archived={id:nextSimulationId(ev.id||"communication"),eventId:ev.id,title:comm.subject,type:comm.type,priority:comm.priority,from:comm.from,role:comm.role,date:comm.date,message:comm.message,structuredMessage:comm.structuredMessage,recs:comm.recs,impacts:comm.impacts,signature:comm.signature,decision:choice.title,decisionDetail:choice.detail,decisionStrategy:choice.strategy||inferDecisionStrategy(choice),uncertainty:choice.uncertainty||"Material",estimatedConfidence:choice.estimatedConfidence||50,benefits:choice.benefits||[],risks:choice.risks||[],day:company.day,read:true,deleted:false,memoIntelligence:intel,memoAudit:intel.audit,laterOutcome:null,forecastAccuracy:null,credibilityUpdated:false,decisionThreadId:null};
  if(ev.messageThreadId){const thread=(company.messageThreads||[]).find(t=>t.threadId===ev.messageThreadId);if(thread){thread.relatedDecisions=[...new Set([...(thread.relatedDecisions||[]),archived.id])];thread.currentStatus="decision-recorded";thread.nextReviewDay=company.day+21;}}
  company.messageQualityHistory=Array.isArray(company.messageQualityHistory)?company.messageQualityHistory:[];
  company.messageQualityHistory.unshift({day:company.day,messageId:archived.id,threadId:ev.messageThreadId||null,relevance:intel.audit?.relevanceScore||0,evidenceQuality:intel.audit?.evidenceCoverage||0,escalationPrecision:intel.audit?.chainOfCommandValid?1:0,usefulness:null});
  company.messageQualityHistory=company.messageQualityHistory.slice(0,160);
  company.communications.unshift(archived);
  company.communications=company.communications.slice(0,60);
  return archived;
}
function queueInformationalCommunication(comm,sourceEvent={}){
  ensureBibleSystems?.();
  company.escalationQueue=Array.isArray(company.escalationQueue)?company.escalationQueue:[];
  const sender=comm.sender||{name:comm.from||"Executive Office",role:comm.role||"Leadership Team"};
  const id=sourceEvent.id||nextSimulationId("info-message");
  const exists=(company.escalationQueue||[]).some(ev=>ev.id===id)||company.pendingEvent?.id===id||(company.communications||[]).some(m=>m.eventId===id);
  if(exists)return false;
  company.escalationQueue.push({
    id,
    repeatable:false,
    informationalOnly:true,
    category:sourceEvent.category||"information",
    sourceMessageId:sourceEvent.sourceMessageId||null,
    storyId:sourceEvent.storyId||null,
    title:comm.subject||sourceEvent.title||"Executive update",
    copy:comm.message||sourceEvent.copy||"An executive update is available for review.",
    generatedCommunication:{...comm,sender},
    choices:[{
      title:"File this update",
      detail:"Read the update and move it to Old Messages.",
      strategy:"information",
      uncertainty:"Observed",
      estimatedConfidence:comm.estimatedConfidence||65,
      benefits:["keeps the CEO informed without creating a fake decision"],
      risks:["no direct CEO action is taken"]
    }]
  });
  if(!validationMode)renderDecisionEvent();
  return true;
}
function eventHasDecisionChoices(ev){
  const choices=Array.isArray(ev?.choices)?ev.choices.filter(choice=>String(choice?.title||"").trim()):[];
  return choices.length>=3;
}
function isInformationalExecutiveEvent(ev){
  if(!ev)return false;
  if(eventHasDecisionChoices(ev))return false;
  return ev.informationalOnly===true;
}
function fileInformationalCommunication(){
  const ev=company.pendingEvent;
  if(!ev)return false;
  const comm=company.pendingCommunication||eventCommunication(ev);
  const archivedMemo=archiveCommunication(ev,{title:"Filed after review",detail:"The CEO opened and filed this informational update.",strategy:"information",uncertainty:"Observed",estimatedConfidence:65},comm);
  if(ev.messageThreadId){
    const thread=(company.messageThreads||[]).find(t=>t.threadId===ev.messageThreadId);
    if(thread){thread.currentStatus="information-filed";thread.nextReviewDay=company.day+14;}
  }
  if(ev.sourceMessageId){
    const msg=(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId);
    if(msg)msg.status="executive-info";
  }
  recordHistory(`Executive update filed: ${comm.subject||ev.title}.`,"communication",2);
  company.pendingEvent=null;
  company.pendingCommunication=null;
  company.paused=false;
  if(!validationMode){updatePauseButton();saveGame();renderDecisionEvent();render();}
  return archivedMemo;
}
function teamDisplayName(team){return {hardware:"Hardware",software:"Software",quality:"Quality",product:"Product",finance:"Finance",people:"People","customer success":"Customer Success",board:"Board",company:"Company"}[String(team||"").toLowerCase()]||team;}
function departmentBriefingHtml(){
  ensureBibleSystems?.();
  const allocation=typeof buildWorkforceAllocationSnapshot==="function"?buildWorkforceAllocationSnapshot():null;
  return ["hardware","software","product","finance"].map(team=>{
    const t=company.teams?.[team]||{},items=(company.workItems||[]).filter(w=>w.status==="open"&&w.assignedTeam===team).sort((a,b)=>(b.priority||0)-(a.priority||0));
    const top=items[0],members=employees.filter(e=>e.active&&employeeTeam(e)===team);
    const row=allocation?.departments?.[team];
    const blockers=row?row.observedBlockedWork:items.reduce((s,w)=>s+(w.blockedBy?.length||0),0);
    const lead=members.sort((a,b)=>(b.focus+b.morale)-(a.focus+a.morale))[0];
    const staffing=row?`Department coverage ${row.departmentCoverage}%; project coverage ${row.projectCoverage}%; missing project staff ${row.missingAssignments}`:`Knowledge coverage ${Math.round(t.knowledgeCoverage||0)}%`;
    const blockerLabel=row&&row.unreportedBlockedWork>0?`Reported blockers ${blockers}; manager awareness incomplete`:`Reported blockers ${blockers}`;
    return `<div class="briefing-card"><strong>${teamDisplayName(team)}</strong><small>Priority: ${t.currentPriority||"delivery"}<br>Backlog ${t.backlog||items.length}; ${blockerLabel}<br>Pressure ${Math.round(t.pressure||0)}, defect risk ${Math.round(t.defectRisk||0)}<br>${staffing}<br>${top?`Top work: ${top.title} - ${workStatusLabel(top)}`:"No open priority"}<br>${lead?`Signal: ${lead.name} has ${lead.dailyBriefing?.knownBlockers?.length||0} reported blocker(s) in briefing`:"No active team member"}</small></div>`;
  }).join("");
}
function projectPortfolioHtml(){
  ensureProjectPortfolio();updatePortfolioHealth();
  const h=company.portfolioHealth,currentItems=[...company.projectProposals,...company.projects],archiveItems=[...(company.projectArchive||[])];
  const allocation=typeof buildWorkforceAllocationSnapshot==="function"?buildWorkforceAllocationSnapshot():null;
  const projectStaffing=projectStaffingDetails();
  const projectCard=p=>{
    updateProjectCommercialStats(p);
    const perf=p.performance||{},spend=`$${Number(p.budgetSpent||0).toFixed(2)}M / $${Number(p.budgetApproved||p.estimatedCost||0).toFixed(2)}M`;
    const pace=projectPaceProfile(p),paceLabel=pace.major?"major":pace.internal?"internal":"standard";
    const timing=projectTimingForecast(p);
    const healthBreakdown=typeof projectExecutionHealthBreakdown==="function"?projectExecutionHealthBreakdown(p):{current:projectVisibleHealth(p),base:projectVisibleHealth(p),companyModifier:0,staffingModifier:0,riskModifier:0,profile:{}};
    const overall=healthBreakdown.current;
    const dependencyText=Object.entries(healthBreakdown.profile||{}).filter(([,v])=>Number(v)>.07).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,v])=>`${k.replace(/([A-Z])/g," $1")} ${Math.round(v*100)}%`).join(", ")||"balanced company conditions";
    const commercialLabel=projectCommercialStatusLabel(p),projectedRevenue=Number(p.projectedDailyRevenue||0),activeCommercialRevenue=p.commercialStatus==="launched"?projectedRevenue:p.commercialStatus==="pilot"?projectedRevenue*.38:0,commercialRevenueText=(p.commercialStatus==="launched"||p.commercialStatus==="pilot")?`active revenue $${activeCommercialRevenue.toFixed(3)}M/day`:`projected if launched $${projectedRevenue.toFixed(3)}M/day`;
    const rec=p.status==="proposal"?"Awaiting portfolio memo":p.commercialStatus==="ready"?"Commercial review recommended":p.commercialStatus==="review queued"?"Commercial memo queued":p.commercialStatus==="launched"?"Generating revenue":p.commercialStatus==="pilot"?"Pilot is generating early revenue":(perf.riskTrend||0)>72?"Review risk or reduce scope":p.status==="paused"?"Review restart timing":p.status==="completed"?"Completed":"Continue monitoring";
    const lineage=p.sourceProjectId?`<br>Lineage: successor to ${p.predecessorTitle||"archived project"}; evidence ${(p.revivalReasons||[]).slice(0,2).join("; ")||"changed conditions"}`:"";
    const terminal=["canceled","rejected","merged"].includes(p.status);
    const completedAction=p.commercialStatus==="launched"||p.commercialStatus==="pilot"
      ?`<span class="save-note">Commercial path active</span>`
      :p.commercialStatus==="review queued"
        ?`<span class="save-note">Commercial memo queued</span>`
        :`<button class="small-btn" onclick="requestProjectCommercialReview('${p.id}')">Commercial Review</button>`;
    const actions=p.status==="proposal"
      ?`<button class="small-btn" onclick="requestProjectDecision('${p.id}','review')">Memo</button>`
      :terminal?`<span class="save-note">Closed</span>`
      :p.status==="completed"?completedAction
      :p.status==="paused"?`<button class="small-btn" onclick="requestProjectDecision('${p.id}','resume')">Resume</button><button class="small-btn" onclick="requestProjectDecision('${p.id}','review')">Review</button><button class="small-btn" onclick="requestProjectDecision('${p.id}','cancel')">Cancel</button>`
      :`<button class="small-btn" onclick="requestProjectDecision('${p.id}','review')">Review</button><button class="small-btn" onclick="requestProjectDecision('${p.id}','pause')">Pause</button><button class="small-btn" onclick="requestProjectDecision('${p.id}','cancel')">Cancel</button>`;
    const projectAllocation=allocation?.projects?.[p.id];
    const currentStaffingCoverage=Math.round(projectAllocation?.coverage??derivedStaffingCoverage(p));
    const required=Object.values(p.requiredHeadcount||{}).reduce((a,b)=>a+(Number(b)||0),0),missing=projectStaffing.filter(x=>x.project.id===p.id),staffingRows=Object.entries(p.requiredHeadcount||{}).filter(([,n])=>Number(n)>0).map(([dept,need])=>`${teamDisplayName(dept)} ${Number(projectAllocatedFte(p,dept)).toFixed(1)}/${Number(need).toFixed(1)}`).join(", ");
    const missingText=missing.length?missing.map(x=>`+${x.missingFte} FTE ${x.role} (${teamDisplayName(x.dept)}, ${x.status})`).join("; "):"fully allocated";
    const actualBlockers=projectAllocation?.actualBlockers??perf.blockerCount??0,observedBlockers=projectAllocation?.observedBlockers??actualBlockers;
    const blockerText=actualBlockers===observedBlockers?`Reported blockers ${observedBlockers}`:`Reported blockers ${observedBlockers}; manager awareness incomplete`;
    const targetDays=Number(p.estimatedDuration)||0;
    const riskLabel=qualitativeBand(perf.riskTrend||p.visibleRisk||0,{low:35,high:70,lowText:"contained",midText:"visible",highText:"elevated"});
    const confidenceLabel=qualitativeBand(perf.strategicConfidence||p.visibleConfidence||0,{low:40,high:70,lowText:"uncertain",midText:"developing",highText:"strong"});
    const capabilityText=[...(p.requiredCapabilities||[]).map(c=>`${COMPANY_CAPABILITY_LABELS[c]||c} required`),...(p.preferredCapabilities||[]).slice(0,2).map(c=>`${COMPANY_CAPABILITY_LABELS[c]||c} preferred`)].join("; ")||"standard execution capabilities";
    return `<div class="briefing-card"><strong>${p.title}</strong><small>${p.family} | ${p.originType} | ${projectStatusLabel(p)}${lineage}<br>Current Execution Health: ${overall} (base ${healthBreakdown.base}; company ${healthBreakdown.companyModifier>=0?"+":""}${healthBreakdown.companyModifier}; staffing ${healthBreakdown.staffingModifier>=0?"+":""}${healthBreakdown.staffingModifier}; risk ${healthBreakdown.riskModifier})<br>Dependencies: ${dependencyText}<br>Capabilities: ${capabilityText}<br>Progress ${Math.round(p.progress||0)}%; target ${targetDays||"?"} ${targetDays===1?"day":"days"}; pace ${paceLabel}; spend ${spend}<br>Timing: ${timing.short}; ${timing.status}; ${timing.confidenceLabel} confidence<br>Schedule ${perf.scheduleVariance??0}; budget ${perf.budgetVariance??0}; quality ${Math.round(perf.quality||p.quality||0)}; open work ${perf.backlogCount??0}; ${blockerText}<br>Required staff ${required}; allocated ${staffingRows||"none"}; project coverage ${currentStaffingCoverage}%; overload ${Math.round(perf.workloadOverload||projectOverloadPressure(p))}; missing ${missingText}<br>Customer interest ${Math.round(perf.customerInterest||p.customerInterest||0)}; risk is ${riskLabel}; confidence is ${confidenceLabel}<br>Commercial: ${commercialLabel}; readiness ${Math.round(p.commercialReadiness||0)}; potential ${Math.round(p.commercialPotential||0)}; ${commercialRevenueText}; customers ${Math.round(p.convertedCustomers||0)}<br>Recommendation: ${rec}</small><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${actions}</div></div>`;
  };
  const cards=currentItems.map(projectCard).join("");
  const archiveCards=archiveItems.map(projectCard).join("");
  const archiveStats=archiveItems.reduce((s,p)=>{
    updateProjectCommercialStats(p);
    s.completed+=p.status==="completed"?1:0;
    s.canceled+=p.status==="canceled"?1:0;
    s.rejected+=p.status==="rejected"?1:0;
    s.merged+=p.status==="merged"?1:0;
    s.commercial+=["pilot","launched"].includes(p.commercialStatus)?1:0;
    s.customers+=Number(p.convertedCustomers)||0;
    s.revenue+=p.commercialStatus==="launched"?Number(p.projectedDailyRevenue)||0:p.commercialStatus==="pilot"?(Number(p.projectedDailyRevenue)||0)*.38:0;
    s.spent+=Number(p.budgetSpent)||0;
    return s;
  },{completed:0,canceled:0,rejected:0,merged:0,commercial:0,customers:0,revenue:0,spent:0});
  const archiveOpen=company.projectArchiveOpen||(!currentItems.length&&archiveItems.length);
  const archiveSummary=archiveItems.length?`<br><span class="save-note">Archived history: ${archiveItems.length} filed; completed ${archiveStats.completed}; commercial ${archiveStats.commercial}; canceled ${archiveStats.canceled}; rejected ${archiveStats.rejected}; merged ${archiveStats.merged}; lifetime spend $${archiveStats.spent.toFixed(2)}M; active archive revenue $${archiveStats.revenue.toFixed(3)}M/day; archive customers ${Math.round(archiveStats.customers)}</span>`:"";
  const archiveBlock=archiveItems.length?`<details class="archive-details" style="margin-top:10px" ${archiveOpen?"open":""} ontoggle="setProjectArchiveOpen(this.open)"><summary>Project Archive (${archiveItems.length}) - completed, canceled, merged, and commercialized projects</summary><div class="briefing-grid" style="margin-top:10px">${archiveCards}</div></details>`:"";
  const missingTotal=allocation?.totals?.missingAssignments??projectStaffing.reduce((s,x)=>s+x.missing,0);
  const hasActiveWork=h.activeProjects>0||h.proposedProjects>0;
  const activeSummary=hasActiveWork
    ?`Active work: active ${h.activeProjects}; proposed ${h.proposedProjects}; at risk ${h.atRiskProjects}; paused ${h.pausedProjects}; spend $${h.totalProjectSpendDaily.toFixed(3)}M/day; committed $${h.committedProjectBudget.toFixed(2)}M; project-required staff ${h.staffingDemand}; currently missing ${missingTotal}; concentration risk ${h.concentrationRisk}%; next review ${h.nextProjectReview>=999?"none":`${h.nextProjectReview} ${h.nextProjectReview===1?"day":"days"}`}`
    :"Active work: no active or proposed projects. New initiatives can be started below; completed work is filed in the archive.";
  return `<strong>Project Portfolio</strong><br><small>${activeSummary}${archiveSummary}</small><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="small-btn" onclick="requestStrategicProjectProposal('hardware')">Hardware Initiative</button><button class="small-btn" onclick="requestStrategicProjectProposal('software')">Software Initiative</button><button class="small-btn" onclick="requestStrategicProjectProposal('business')">Business Initiative</button><button class="small-btn" onclick="requestStrategicProjectProposal('internal')">Internal Initiative</button></div><div class="briefing-grid" style="margin-top:10px">${cards||'<div class="briefing-card"><strong>No active or proposed projects</strong><small>The active portfolio is empty. Completed, canceled, rejected, and merged projects are filed in the archive below.</small></div>'}</div>${archiveBlock}`;
}
function historyImportanceThreshold(){
  if(company.day>260)return 4;
  if(company.day>120)return 3;
  return 2;
}
function companyEraName(day){
  const year=Math.floor((Number(day)||0)/260)+1;
  const quarter=Math.floor(((Number(day)||0)%260)/65)+1;
  return "Year "+year+", Quarter "+quarter;
}
function compactCompanyHistory(){
  ensureBibleSystems?.();
  const threshold=historyImportanceThreshold();
  const important=(company.history||[]).filter(h=>(h.importance||0)>=threshold&&h.type!=="daily").slice().sort((a,b)=>(a.day||0)-(b.day||0));
  const phaseEvents=["prototype","integration","customer trial","pilot","launched"].map(phase=>important.find(h=>String(h.text||"").toLowerCase().includes(phase))).filter(Boolean);
  const storyEvents=(company.storyChains||[]).filter(c=>(c.beats||[]).length>=3).map(c=>({day:c.startedDay||0,type:"story",importance:4,text:"Story thread: "+c.subject+" ("+(c.beats||[]).length+" beats)"}));
  const merged=[...important,...phaseEvents,...storyEvents].filter(Boolean).sort((a,b)=>(a.day||0)-(b.day||0));
  const seen=new Set();
  return merged.filter(h=>{const key=(h.day||0)+"|"+h.text;if(seen.has(key))return false;seen.add(key);return true;}).slice(-36);
}
function companyHistoryHtml(){
  const events=compactCompanyHistory();
  if(!events.length)return "";
  const eras={};
  events.forEach(ev=>{const era=companyEraName(ev.day||0);if(!eras[era])eras[era]=[];eras[era].push(ev);});
  return Object.entries(eras).map(([era,list])=>`<div class="history-era"><strong>${era}</strong><ol>${list.map(ev=>`<li>Day ${(ev.day||0)+1}: ${ev.text}</li>`).join("")}</ol><small>${list.length} major milestone(s)</small></div>`).join("");
}
function storyThreadsHtml(){
  ensureBibleSystems?.();
  const snapshot=buildExecutiveIntelligenceSnapshot(),sourceText=(snapshot.strategicSignals||[]).map(i=>`${i.title} ${i.detail}`).join(" ").toLowerCase();
  const chains=(company.storyChains||[]).filter(c=>company.day-(c.lastDay??c.startedDay??0)<=10).sort((a,b)=>{
    const score=c=>((c.beats||[]).some(beat=>evidenceSignalIds(beat.text).some(id=>evidenceSignalIds(sourceText).includes(id)))?25:0)+(c.lastDay??c.startedDay??0);
    return score(b)-score(a);
  }).slice(0,4);
  if(!chains.length)return "";
  return chains.map(c=>{
    const beats=(c.beats||[]).slice(-4);
    return `<div class="story-thread"><strong>${c.subject}</strong><small>${String(c.kind||"story").replace(/-/g," ")} - started day ${(c.startedDay??0)+1} - last changed day ${(c.lastDay??0)+1}</small><ul class="story-beats">${beats.map(b=>`<li>Day ${(b.day??0)+1}: ${b.text}</li>`).join("")}</ul></div>`;
  }).join("");
}
function briefSourceId(prefix,value){return `${prefix}:${value??"current"}`;}
function briefingPriority(item){
  return Math.round(clamp((item.severity||0)*.30+(item.urgency||0)*.20+(item.strategicImpact||0)*.20+(item.confidence||0)*.10+(item.trendStrength||0)*.10+(item.ceoRelevance||0)*.10,0,100));
}
function makeBriefingItem(category,title,detail,opts={}){
  const item={id:nextSimulationId("brief"),category,title,detail,priority:0,confidence:opts.confidence??65,sourceType:opts.sourceType||"simulation",sourceIds:opts.sourceIds||[briefSourceId(category,title)],department:opts.department||null,projectId:opts.projectId||null,employeeIds:opts.employeeIds||[],requiresAction:!!opts.requiresAction,severity:opts.severity??50,urgency:opts.urgency??40,strategicImpact:opts.strategicImpact??50,trendStrength:opts.trendStrength??0,ceoRelevance:opts.ceoRelevance??55,trendBacked:!!opts.trendBacked,debug:opts.debug||""};
  item.priority=briefingPriority(item);
  return item;
}
function extractBriefingTrend(key,current,label,goodDirection="up"){
  const rows=(company.operatingHealthHistory||[]).filter(r=>company.day-(r.day??company.day)<=14&&Number.isFinite(r[key])).sort((a,b)=>(a.day||0)-(b.day||0));
  if(!Number.isFinite(current)||rows.length<6)return null;
  const recent=rows.slice(-3),prior=rows.slice(0,-3);
  if(prior.length<3)return null;
  const recentAvg=recent.reduce((s,r)=>s+Number(r[key]),0)/recent.length,priorAvg=prior.reduce((s,r)=>s+Number(r[key]),0)/prior.length,delta=recentAvg-priorAvg;
  const absolute=Math.abs(delta);
  if(absolute<3)return null;
  const direction=delta>0?"up":"down",beneficial=(goodDirection==="up"&&direction==="up")||(goodDirection==="down"&&direction==="down");
  return {key,label,current:Math.round(current),previousAverage:Math.round(priorAvg),delta:Number(delta.toFixed(1)),direction:beneficial?"improving":"worsening",durationDays:rows.length,confidence:clamp(45+rows.length*4+Math.min(20,absolute*2),45,92),trendStrength:clamp(absolute*7,20,95)};
}
function extractDailyMetricTrend(key,label,goodDirection="up"){
  const rows=(company.simulationMetrics?.daily||[]).filter(r=>company.day-(r.day??company.day)<=14&&Number.isFinite(r[key])).sort((a,b)=>(a.day||0)-(b.day||0));
  if(rows.length<7)return null;
  const recent=rows.slice(-3),prior=rows.slice(0,-3);
  if(prior.length<4)return null;
  const recentAvg=recent.reduce((s,r)=>s+Number(r[key]),0)/recent.length,priorAvg=prior.reduce((s,r)=>s+Number(r[key]),0)/prior.length,delta=recentAvg-priorAvg;
  const absolute=Math.abs(delta);
  const minMove=String(key).toLowerCase().includes("daily") ? .01 : 2;
  if(absolute<minMove)return null;
  const direction=delta>0?"up":"down",beneficial=(goodDirection==="up"&&direction==="up")||(goodDirection==="down"&&direction==="down");
  return {key,label,current:Number(recentAvg.toFixed(3)),previousAverage:Number(priorAvg.toFixed(3)),delta:Number(delta.toFixed(3)),direction:beneficial?"improving":"worsening",durationDays:rows.length,confidence:clamp(45+rows.length*4+Math.min(20,absolute*(minMove<1?300:2)),45,92),trendStrength:clamp(absolute*(minMove<1?900:6),20,95)};
}
function briefingImpactLabel(value){return value>=82?"Critical":value>=68?"High":value>=50?"Moderate":"Low";}
function managerCredibilityLabel(name,dept){
  if(!name||typeof ensureSenderCredibility!=="function")return "unknown";
  const cred=ensureSenderCredibility(name,dept||"company"),score=Math.round(((cred.estimateAccuracy||55)+(cred.evidenceQuality||58))/2);
  return score>=72?"strong":score>=55?"mixed":"weak";
}
function summarizeSuppressedReports(){
  const msgs=(company.employeeMessages||[]).filter(m=>m.status==="suppressed"&&company.day-(m.createdDay??company.day)<=7);
  const records=(company.suppressionRecords||[]).filter(r=>company.day-(r.day??company.day)<=7);
  const all=[...msgs.map(m=>({department:m.department,type:m.type||m.contentCode,severity:m.severity||0,confidence:m.confidence||0,reason:m.managerReview?.reason||"manager filtering",protected:/safety|legal|ethic|whistle|retaliation|harassment|fraud/.test(String(m.contentCode||m.subject||"").toLowerCase()),managerName:m.managerReview?.managerName,discovered:false,duplicate:!!m.mergedReportIds?.length})),...records.map(r=>({department:r.department,type:r.contentCode,severity:0,confidence:0,reason:r.reason||"manager filtering",protected:/safety|legal|ethic|whistle|retaliation|harassment|fraud/.test(String(r.contentCode||"").toLowerCase()),managerName:r.managerName,discovered:!!r.discoveredDay,duplicate:/duplicate|merged/i.test(String(r.reason||""))}))];
  if(!all.length)return null;
  const severe=all.filter(x=>x.protected||x.severity>=78),byDept={};
  all.forEach(x=>{const d=x.department||"company";byDept[d]=(byDept[d]||0)+1;});
  const top=Object.entries(byDept).sort((a,b)=>b[1]-a[1])[0];
  const mainType=all.map(x=>String(x.type||"report").replace(/-/g," ")).sort((a,b)=>all.filter(x=>String(x.type||"").replace(/-/g," ")===b).length-all.filter(x=>String(x.type||"").replace(/-/g," ")===a).length)[0]||"reports";
  const manager=all.find(x=>x.managerName)?.managerName||null,deptKey=top?.[0]||"company";
  return {count:all.length,severeCount:severe.length,department:top?teamDisplayName(top[0]):"Company",departmentKey:deptKey,mainType,reason:all[0].reason,duplicates:all.filter(x=>x.duplicate).length,protectedCount:all.filter(x=>x.protected).length,discoveredCount:all.filter(x=>x.discovered).length,managerName:manager,managerCredibility:managerCredibilityLabel(manager,deptKey),maxSeverity:Math.max(0,...all.map(x=>x.severity||0)),avgConfidence:Math.round(all.reduce((s,x)=>s+(x.confidence||0),0)/Math.max(1,all.length))};
}
function strongestDepartmentBeliefs(health){
  const beliefs=[],staffing=company.staffingModel||{},finance=company.finance||{};
  const understaffed=Object.entries(staffing).filter(([,st])=>st.understaffed||((st.minimumHealthy||0)>(st.current||0))).sort((a,b)=>(b[1].lastScore||b[1].workload||0)-(a[1].lastScore||a[1].workload||0))[0];
  if(understaffed)beliefs.push(makeBriefingItem("beliefs",`${teamDisplayName(understaffed[0])} believes staffing is constraining delivery.`,`Workload ${Math.round(understaffed[1].workload||0)} and backlog ${Math.round(understaffed[1].backlog||0)} are driving the signal.`,{department:understaffed[0],sourceType:"staffing",sourceIds:[briefSourceId("staffing",understaffed[0])],severity:62,urgency:52,strategicImpact:64,confidence:Math.round(understaffed[1].confidence||62),ceoRelevance:68}));
  if((finance.runwayDays||999)<150)beliefs.push(makeBriefingItem("beliefs","Finance believes runway discipline is becoming more important.",`Runway is ${finance.runwayDays>=999?"positive":Math.round(finance.runwayDays)+" days"} and net cash flow is $${Number(finance.netCashFlowDaily||0).toFixed(3)}M/day.`,{department:"finance",sourceType:"finance",sourceIds:[briefSourceId("finance","runway")],severity:65,urgency:58,strategicImpact:72,confidence:74,ceoRelevance:72}));
  const retention=employees.filter(e=>e.active&&(e.retentionRisk||0)>=60).sort((a,b)=>(b.retentionRisk||0)-(a.retentionRisk||0))[0];
  if(retention)beliefs.push(makeBriefingItem("beliefs","People believes retention risk needs attention.",`${retention.name} is the highest current risk case at ${Math.round(retention.retentionRisk||0)}% retention risk.`,{department:"people",sourceType:"retention",sourceIds:[briefSourceId("employee",retention.id)],employeeIds:[retention.id],severity:60,urgency:50,strategicImpact:62,confidence:67,ceoRelevance:63}));
  const qualityTelemetry=company.simulationMetrics?.lastBalance?.qualityTelemetry||company.simulationMetrics?.counters?.qualityTelemetry||{};
  if((qualityTelemetry.reworkActions||0)>8||health.portfolioQuality<60)beliefs.push(makeBriefingItem("beliefs","Quality believes rework is tied to late verification pressure.",`Recent telemetry shows ${Math.round(qualityTelemetry.reworkActions||0)} rework action(s) and ${Math.round(qualityTelemetry.verificationFailures||0)} verification failure signal(s).`,{department:"quality",sourceType:"qualityTelemetry",sourceIds:[briefSourceId("quality","rework")],severity:58,urgency:48,strategicImpact:61,confidence:64,ceoRelevance:58}));
  const lesson=(company.lessons||[]).filter(l=>(l.confidence||0)>=65&&company.day-(l.lastReinforcedDay??l.createdDay??company.day)<=45).sort((a,b)=>(b.confidence||0)+(b.importance||0)*5-(a.confidence||0)-(a.importance||0)*5)[0];
  if(lesson)beliefs.push(makeBriefingItem("beliefs",`${teamDisplayName(lesson.department||"company")} is applying a recent lesson.`,`${lesson.title} The lesson has ${qualitativeBand(lesson.confidence,{low:45,high:75,lowText:"early",midText:"credible",highText:"strong"})} support from recent company history. Evidence: ${lesson.evidence||"recent company history"}.`,{department:lesson.department||"company",sourceType:"institutionalLearning",sourceIds:[briefSourceId("lesson",lesson.key||lesson.id)],severity:45,urgency:32,strategicImpact:60,confidence:Math.round(lesson.confidence||65),ceoRelevance:52}));
  return beliefs.sort((a,b)=>b.priority-a.priority).slice(0,3);
}
function buildExecutiveBriefing(){
  ensureBibleSystems?.();ensureProjectPortfolio?.();updatePortfolioHealth?.();ensureWorkforceEconomySystems?.();updateStaffingModel?.();
  const health=derivedOperatingHealth(),items={changed:[],attention:[],improving:[],worsening:[],beliefs:[]};
  const recentHistory=(company.history||[]).filter(h=>company.day-(h.day??company.day)<=3&&(h.importance||0)>=3).slice(-3);
  recentHistory.forEach(h=>items.changed.push(makeBriefingItem("changed",h.text,`Recorded on day ${(h.day??0)+1}.`,{sourceType:"history",sourceIds:[briefSourceId("history",h.text)],severity:45+(h.importance||0)*8,urgency:35,strategicImpact:50+(h.importance||0)*7,confidence:86,ceoRelevance:55+(h.importance||0)*5})));
  const activeProjects=(company.projects||[]).filter(p=>["approved","planning","prototype","execution","verification","pilot","scaling","at risk","blocked","paused"].includes(p.status));
  const riskProject=activeProjects.slice().sort((a,b)=>(b.performance?.riskTrend??b.visibleRisk??0)-(a.performance?.riskTrend??a.visibleRisk??0))[0];
  if(riskProject&&((riskProject.performance?.riskTrend??riskProject.visibleRisk??0)>72||(riskProject.performance?.scheduleVariance||0)>12)){const scheduleDays=Math.round(riskProject.performance?.scheduleVariance||0);items.attention.push(makeBriefingItem("attention",`${riskProject.title} needs schedule or risk review.`,`Schedule variance is ${scheduleDays} ${scheduleDays===1?"day":"days"}, staffing coverage is ${Math.round(riskProject.performance?.staffingCoverage??derivedStaffingCoverage(riskProject))}%.`,{sourceType:"project",sourceIds:[briefSourceId("project",riskProject.id)],projectId:riskProject.id,department:riskProject.category||"portfolio",severity:78,urgency:68,strategicImpact:76,confidence:Math.round(riskProject.performance?.strategicConfidence??riskProject.visibleConfidence??62),ceoRelevance:76,requiresAction:(riskProject.performance?.riskTrend??0)>84}));}
  const finance=company.finance||{};
  if((finance.runwayDays||999)<100||Number(finance.netCashFlowDaily||0)<-.18)items.attention.push(makeBriefingItem("attention","Finance expects runway pressure if spending does not change.",`Runway is ${finance.runwayDays>=999?"positive":Math.round(finance.runwayDays)+" days"} with net cash flow of $${Number(finance.netCashFlowDaily||0).toFixed(3)}M/day.`,{sourceType:"finance",sourceIds:[briefSourceId("finance","cashflow")],department:"finance",severity:(finance.runwayDays||999)<70?88:72,urgency:(finance.runwayDays||999)<70?82:62,strategicImpact:82,confidence:78,ceoRelevance:84,requiresAction:(finance.runwayDays||999)<70}));
  const governance=company.boardGovernance||{};
  if((governance.strikes||0)>0||governance.pipActive)items.attention.push(makeBriefingItem("attention",governance.pipActive?"The board has an active CEO performance plan.":"Board confidence is carrying a governance strike.",governance.pipActive?`PIP deadline is day ${(governance.pipDeadlineDay??company.day)+1}; current board confidence is ${Math.round(company.board)}.`:`Board strikes ${governance.strikes||0}; current board confidence is ${Math.round(company.board)}.`,{sourceType:"boardGovernance",sourceIds:[briefSourceId("board",governance.pipActive?"pip":"strike")],department:"board",severity:governance.pipActive?92:78,urgency:governance.pipActive?86:66,strategicImpact:90,confidence:82,ceoRelevance:94,requiresAction:governance.pipActive||company.board<35}));
  const protectedMsgs=(company.employeeMessages||[]).filter(m=>m.protectedDirect&&["manager-reviewed","queued-for-ceo","executive-info"].includes(m.status)&&company.day-(m.createdDay??company.day)<=7);
  if(protectedMsgs.length)items.attention.push(makeBriefingItem("attention","A protected report bypassed normal management review.",`${protectedMsgs.length} protected escalation(s) are active or recently reviewed.`,{sourceType:"employeeMessages",sourceIds:protectedMsgs.slice(0,3).map(m=>m.id),severity:90,urgency:84,strategicImpact:86,confidence:82,ceoRelevance:92,requiresAction:protectedMsgs.some(m=>m.status==="queued-for-ceo")}));
  const suppression=summarizeSuppressedReports();
  if(suppression){
    const severe=!!suppression.severeCount;
    const detail=severe?`${suppression.department} filtering includes ${suppression.protectedCount} protected signal${suppression.protectedCount===1?"":"s"}, with ${qualitativeBand(suppression.maxSeverity,{low:45,high:75,lowText:"limited",midText:"material",highText:"serious"})} concern and ${qualitativeBand(suppression.managerCredibility,{low:45,high:75,lowText:"weak",midText:"mixed",highText:"strong"})} manager credibility.`:`Mostly ${suppression.mainType} from ${suppression.department}; ${suppression.duplicates} duplicate${suppression.duplicates===1?"":"s"}, ${suppression.discoveredCount} later discovered, ${qualitativeBand(suppression.avgConfidence,{low:45,high:75,lowText:"uncertain",midText:"credible",highText:"well-supported"})} evidence, reason: ${suppression.reason}.`;
    items[severe?"attention":"changed"].push(makeBriefingItem(severe?"attention":"changed",severe?`${suppression.severeCount} filtered report(s) may need review.`:`${suppression.count} reports were filtered this week.`,detail,{sourceType:"suppressionRecords",sourceIds:[briefSourceId("suppression",company.day)],severity:severe?82:42,urgency:severe?76:30,strategicImpact:severe?78:40,confidence:68,ceoRelevance:severe?84:48,requiresAction:severe}));
  }
  const trends=[
    extractBriefingTrend("financeHealth",health.financeHealth,"Finance health","up"),
    extractBriefingTrend("portfolioHealth",health.portfolioHealth,"Portfolio health","up"),
    extractBriefingTrend("manufacturingHealth",health.manufacturingHealth,health.labels.manufacturing,"up"),
    extractBriefingTrend("customerSentiment",health.customerSentiment,health.labels.customer,"up"),
    extractBriefingTrend("morale",health.morale,"Employee morale","up"),
    extractBriefingTrend("teamCohesion",health.teamCohesion,"Team cohesion","up"),
    extractBriefingTrend("trust",health.trust,"Employee trust","up"),
    extractDailyMetricTrend("supportDaily","Support burden","down"),
    extractDailyMetricTrend("netCashFlow","Net cash flow","up")
  ].filter(Boolean);
  trends.forEach(t=>{
    const target=t.direction==="improving"?items.improving:items.worsening;
    target.push(makeBriefingItem(t.direction==="improving"?"improving":"worsening",`${t.label} is ${t.direction}.`,`${t.label} moved from about ${t.previousAverage} to ${t.current} over ${t.durationDays} tracked ${t.durationDays===1?"day":"days"}.`,{sourceType:"operatingHealthHistory",sourceIds:[briefSourceId("operatingHealth",t.key)],severity:t.direction==="worsening"?68:42,urgency:t.direction==="worsening"?58:30,strategicImpact:62,confidence:Math.round(t.confidence),trendStrength:t.trendStrength,ceoRelevance:t.direction==="worsening"?68:52,trendBacked:true}));
  });
  const issue=(company.issueRecords||[]).filter(i=>company.day-(i.createdDay??company.day)<=14).sort((a,b)=>(b.severity+b.urgency+b.strategicImpact)-(a.severity+a.urgency+a.strategicImpact))[0];
  const topRisk=issue?makeBriefingItem("attention",`Top unresolved risk: ${String(issue.type||"risk").replace(/-/g," ")}.`,(issue.evidence||[])[0]||`Owner: ${teamDisplayName((issue.sourceDepartments||[])[0]||"company")}.`,{sourceType:"issueRecord",sourceIds:[issue.id],department:(issue.sourceDepartments||[])[0]||null,severity:issue.severity,urgency:issue.urgency,strategicImpact:issue.strategicImpact,confidence:issue.confidence,ceoRelevance:76,requiresAction:issue.status==="ceo-decision"}):null;
  if(topRisk)items.attention.push(topRisk);
  const opportunityMsg=(company.employeeMessages||[]).filter(m=>m.type==="opportunity-proposal"&&company.day-(m.createdDay??company.day)<=14).sort((a,b)=>(b.confidence||0)-(a.confidence||0))[0],proposal=(company.projectProposals||[])[0];
  const topOpportunity=opportunityMsg?makeBriefingItem("changed",`Emerging opportunity: ${opportunityMsg.subject}.`,(opportunityMsg.evidence||[])[0]||`Next step: ${opportunityMsg.status==="queued-for-ceo"?"CEO review":"department review"}.`,{sourceType:"employeeMessage",sourceIds:[opportunityMsg.id],department:opportunityMsg.department,severity:38,urgency:36,strategicImpact:68,confidence:opportunityMsg.confidence||58,ceoRelevance:62,requiresAction:opportunityMsg.status==="queued-for-ceo"}):proposal?makeBriefingItem("changed",`Emerging opportunity: ${proposal.title}.`,`Portfolio council is reviewing a ${proposal.family} initiative from ${proposal.originType}.`,{sourceType:"projectProposal",sourceIds:[proposal.id],projectId:proposal.id,severity:36,urgency:32,strategicImpact:66,confidence:proposal.visibleConfidence||55,ceoRelevance:58}):null;
  if(topOpportunity)items.changed.push(topOpportunity);
  const story=(company.storyChains||[]).filter(c=>company.day-(c.lastDay??c.startedDay??company.day)<=7&&(c.beats||[]).length>=3).sort((a,b)=>(b.lastDay||0)-(a.lastDay||0))[0];
  if(story)items.changed.push(makeBriefingItem("changed",`Story thread developing: ${story.subject}.`,`The latest chain has ${(story.beats||[]).length} beat(s); latest: ${(story.beats||[]).slice(-1)[0]?.text||"recent connected event"}.`,{sourceType:"storyChain",sourceIds:[story.id],department:story.department||null,severity:44,urgency:34,strategicImpact:58,confidence:70,ceoRelevance:52}));
  items.beliefs.push(...strongestDepartmentBeliefs(health));
  Object.keys(items).forEach(k=>{const seen=new Set();items[k]=items[k].sort((a,b)=>b.priority-a.priority).filter(x=>{const key=(x.title||"").toLowerCase().replace(/\d+/g,"#");if(seen.has(key))return false;seen.add(key);return true;}).slice(0,k==="beliefs"?3:3);});
  let bulletCount=Object.values(items).reduce((s,list)=>s+list.length,0);
  let trimGuard=0;
  while(bulletCount>10&&trimGuard++<20){const key=Object.keys(items).filter(k=>(items[k]||[]).length).sort((a,b)=>(items[b].at(-1)?.priority||999)-(items[a].at(-1)?.priority||999))[0];if(!key)break;items[key].pop();bulletCount=Object.values(items).reduce((s,list)=>s+list.length,0);}
  const queued=(company.escalationQueue||[]).length+(company.pendingEvent?1:0),protectedWaiting=(company.escalationQueue||[]).filter(ev=>{const msg=ev.sourceMessageId?(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId):null;return msg?.protectedDirect;}).length;
  const actionSummary=protectedWaiting?`A protected escalation requires review.`:queued?`${queued} decision memo${queued===1?" is":"s are"} waiting.`:"No immediate decision is required.";
  const all=[...items.changed,...items.attention,...items.improving,...items.worsening,...items.beliefs];
  const duplicateCount=all.length-new Set(all.map(i=>String(i.title||"").toLowerCase())).size;
  const briefing={day:company.day,generatedAtMinute:company.minute,changed:items.changed,attention:items.attention,improving:items.improving,worsening:items.worsening,beliefs:items.beliefs,actionSummary,suppressedReportSummary:suppression,topRisk,topOpportunity,sourceIds:[...new Set(all.flatMap(i=>i.sourceIds||[]))],audit:{itemCount:all.length,sourceCoverage:all.length?Math.round(all.filter(i=>(i.sourceIds||[]).length).length/all.length*100):100,duplicateCount,trendBackedCount:all.filter(i=>i.category==="improving"||i.category==="worsening").filter(i=>i.trendBacked).length,actionSummaryCorrect:actionSummary.includes(String(queued))||(!queued&&actionSummary.includes("No immediate"))||!!protectedWaiting,hiddenTruthLeak:false,bulletLimitOk:all.length<=10}};
  company.executiveBriefing=briefing;
  company.executiveBriefingArchive=Array.isArray(company.executiveBriefingArchive)?company.executiveBriefingArchive.slice(0,12):[];
  return briefing;
}
function buildExecutiveIntelligenceSnapshot(){
  const brief=buildExecutiveBriefing(),all=[...(brief.attention||[]),...(brief.changed||[]),...(brief.improving||[]),...(brief.worsening||[]),...(brief.beliefs||[])].sort((a,b)=>(b.priority||0)-(a.priority||0));
  const topRisks=[...(brief.attention||[]),brief.topRisk].filter(Boolean).sort((a,b)=>(b.priority||0)-(a.priority||0)).slice(0,4);
  const topOpportunities=[brief.topOpportunity,...(brief.changed||[]).filter(i=>/opportun|proposal|initiative|experiment|partnership/i.test(i.title+" "+i.detail))].filter(Boolean).sort((a,b)=>(b.priority||0)-(a.priority||0)).slice(0,3);
  const suppressedReportFindings=brief.suppressedReportSummary?[brief.suppressedReportSummary]:[];
  const majorTrends=[...(brief.improving||[]),...(brief.worsening||[])].sort((a,b)=>(b.priority||0)-(a.priority||0)).slice(0,5);
  const strategicSignals=all.filter(i=>i.requiresAction||i.strategicImpact>=65||i.priority>=65).slice(0,6);
  const snapshot={day:company.day,generatedAtMinute:company.minute,topRisks,topOpportunities,departmentBeliefs:brief.beliefs||[],suppressedReportFindings,majorTrends,strategicSignals,sourceIds:[...new Set(all.flatMap(i=>i.sourceIds||[]))],audit:brief.audit};
  company.executiveIntelligenceSnapshot=snapshot;
  return snapshot;
}
function applyExecutiveIntelligenceLearning(snapshot=buildExecutiveIntelligenceSnapshot()){
  if(company.lastExecutiveIntelligenceLearningDay===company.day)return;
  company.lastExecutiveIntelligenceLearningDay=company.day;
  const seriousSuppression=(snapshot.suppressedReportFindings||[]).find(s=>(s.severeCount||0)>0||s.protectedCount>0);
  if(seriousSuppression){
    recordHistory(`${seriousSuppression.department} suppression pattern became strategically visible.`,"communication",3);
    createOrReinforceLesson({key:"suppression-hides-risk",title:"Suppressed reports can hide strategic risk until later evidence forces attention.",department:seriousSuppression.departmentKey||"company",vector:{escalation:.7,documentation:.45,planning:.25},outcome:"negative",confidence:68,evidence:`${seriousSuppression.count} filtered report(s), ${seriousSuppression.severeCount} severe`,importance:4,episodeKey:`suppression-${company.day}-${seriousSuppression.departmentKey||"company"}`,attributionQuality:62,reviewWindow:"long"});
  }
  const risk=(snapshot.topRisks||[]).find(r=>(r.priority||0)>=75);
  if(risk)recordLearningEvidence({domain:"company",eventType:"executive-intelligence-risk",action:"observe",outcome:"mixed",magnitude:clamp((risk.priority||0)/100,0,1),confidence:risk.confidence||65,department:risk.department||"company",evidence:risk.title,contributors:[{type:risk.sourceType||"signal",id:(risk.sourceIds||[])[0]||risk.id,weight:1}]});
}
function tinyBars(values){
  const list=(values||[]).slice(-12);
  if(!list.length)return "<div class=\"sparkline\"><span style=\"height:10%\"></span></div>";
  const max=Math.max(1,...list.map(v=>Math.abs(Number(v)||0)));
  return "<div class=\"sparkline\">"+list.map(v=>"<span style=\"height:"+clamp(Math.abs(Number(v)||0)/max*100,8,100)+"%\"></span>").join("")+"</div>";
}
function observationSeverityBand(value){return value>=70?"high":value>=45?"elevated":value>=25?"watch":"low";}
function observationTextForPillar(pillar){
  const label=riskPillarName?.(pillar.key)||pillar.label||"Company risk";
  if(pillar.key==="financial")return `Finance is watching runway and net cash flow because ${label.toLowerCase()} risk is ${observationSeverityBand(pillar.value)}.`;
  if(pillar.key==="productDelivery")return `Product delivery is carrying pressure from project execution, blockers, or quality work; this is the main item to watch.`;
  if(pillar.key==="customerMarket")return `Customer and market signals are less comfortable than the headline numbers suggest, especially around sentiment, renewals, or competitor pressure.`;
  if(pillar.key==="workforce")return `Workforce strain is visible, but it becomes company risk through output, mistakes, absence, and retention rather than stress alone.`;
  if(pillar.key==="operations")return `Operations has enough friction that delivery reliability or supplier execution deserves attention.`;
  if(pillar.key==="governance")return `Governance risk is rising through board confidence, investor pressure, or leadership credibility.`;
  return `Strategic risk is worth watching because the portfolio, innovation path, or market fit may be narrowing future options.`;
}
function updateExecutiveObservations(){
  ensureBibleSystems?.();
  updateCompanyRiskComponents?.();
  const observations=[],components=company.companyRiskComponents||{},top=components.topContributors||[];
  if(top[0])observations.push({id:`risk-${company.day}-${top[0].key}`,day:company.day,type:"risk",pillar:top[0].key,severity:top[0].value,sourceIds:[`risk:${top[0].key}`],text:observationTextForPillar(top[0])});
  const detection=(company.managerDetections||[]).find(d=>company.day-(d.day??company.day)<=7);
  if(detection)observations.push({id:`detection-${company.day}-${detection.dept}`,day:company.day,type:"friction",department:detection.dept,severity:detection.risk||50,sourceIds:[`friction:${detection.dept}:${detection.signal}`],text:detection.text});
  const background=(company.backgroundEvents||[]).find(e=>company.day-(e.day??company.day)<=7&&e.status==="handled-locally");
  if(background)observations.push({id:`background-${background.id}`,day:company.day,type:"background",department:background.department,severity:background.severity||45,sourceIds:[`background:${background.id}`],text:`${teamDisplayName(background.department)} handled a background issue locally: ${background.title}.`});
  const improving=(company.localFrictionResponses||[]).find(r=>company.day-(r.day??company.day)<=5);
  if(improving)observations.push({id:`local-${company.day}-${improving.dept}`,day:company.day,type:"local-response",department:improving.dept,severity:40,sourceIds:[`local:${improving.dept}:${improving.signal}`],text:improving.action});
  if(!observations.length)observations.push({id:`quiet-${company.day}`,day:company.day,type:"watch",severity:25,sourceIds:["quiet-period"],text:"No major strategic warning emerged this period. The main item to watch is whether current workload remains sustainable as projects advance."});
  company.executiveObservations=observations.sort((a,b)=>(b.severity||0)-(a.severity||0)).slice(0,3);
  return company.executiveObservations;
}
function executiveObservationDebugHtml(){
  if(!debugMode)return "";
  const pillars=company.riskPillars||{},friction=company.departmentFriction||{};
  const pillarText=Object.entries(pillars).map(([k,v])=>`${riskPillarName?.(k)||k}: ${Math.round(v)}`).join("; ");
  const frictionText=Object.entries(friction).map(([dept,vals])=>`${teamDisplayName(dept)} ${Math.round(frictionAverage?.(dept)||0)}`).join("; ");
  const detections=(company.managerDetections||[]).slice(0,3).map(d=>`${teamDisplayName(d.dept)} ${d.signal} p=${d.probability}`).join("; ")||"none";
  const responses=(company.localFrictionResponses||[]).slice(0,3).map(r=>`${teamDisplayName(r.dept)}: ${r.signal}`).join("; ")||"none";
  return `<br><small>AI Debug - Risk Pillars: ${htmlEscape(pillarText||"none")}<br>Department Friction: ${htmlEscape(frictionText||"none")}<br>Manager Detection: ${htmlEscape(detections)}<br>Local Responses: ${htmlEscape(responses)}<br>Background Events: ${(company.backgroundEvents||[]).length}; Observation Ranking: ${(company.executiveObservations||[]).map(o=>htmlEscape(o.id)).join(", ")}</small>`;
}
function balanceTuningHtml(){
  const m=company.simulationMetrics?.lastBalance,r=lastValidationReport,tips=[],observations=(updateExecutiveObservations?.()||company.executiveObservations||[]);
  observations.slice(0,3).forEach(o=>tips.push(o.text));
  if(r?.matrix){if(r.survivalRate<70)tips.push("Economy or stress is too punishing across seeds.");if(r.avgMemoRepeat>35)tips.push("Memo variety needs more category spread.");if(r.avgCeoDecisions>18)tips.push("CEO interruption rate may be too high.");if(r.avgActionDiversity<45)tips.push("Employee behavior may be collapsing into too few actions.");}
  if(m?.flags?.length)tips.push("Current run flags: "+m.flags.join(", ")+");");
  if(!tips.length)tips.push("No major strategic warning emerged this period. The main item to watch is whether current workload remains sustainable as projects advance.");
  return tips.slice(0,3).map(x=>"<small>"+htmlEscape(x)+"</small>").join("<br>")+executiveObservationDebugHtml();
}
function operationalDashboardHtml(){
  const daily=company.simulationMetrics?.daily||[];
  const health=derivedOperatingHealth(),trend=t=>t==="Up"?"Improving":t==="Down"?"Declining":"Stable";
  return "<div class=\"insight-card\"><strong>Cash Trend</strong><small>$"+company.cash.toFixed(1)+"M current</small>"+tinyBars(daily.map(d=>d.cash))+"</div>"+
    "<div class=\"insight-card\"><strong>Portfolio Health</strong><small>"+fmtHealth(health.portfolioHealth)+"; "+trend(health.portfolioHealthTrend)+"</small>"+tinyBars((company.operatingHealthHistory||[]).map(d=>d.portfolioHealth).filter(Number.isFinite))+"</div>"+
    "<div class=\"insight-card\"><strong>People Load</strong><small>Stress "+Math.round(avgStress())+", derived morale "+fmtHealth(health.morale)+", cohesion "+fmtHealth(health.teamCohesion)+"</small>"+tinyBars((company.operatingHealthHistory||[]).map(d=>d.morale).filter(Number.isFinite))+"</div>"+
    "<div class=\"insight-card\"><strong>Signal Volume</strong><small>"+countRecentMessages(5).length+" internal message(s) in 5 days</small>"+tinyBars(daily.map(d=>d.messages5d||0))+"</div>"+
    "<div class=\"insight-card\"><strong>Finance Health</strong><small>"+fmtHealth(health.financeHealth)+"; "+trend(health.financeHealthTrend)+"</small>"+tinyBars((company.operatingHealthHistory||[]).map(d=>d.financeHealth).filter(Number.isFinite))+"</div>"+
    "<div class=\"insight-card\"><strong>"+health.labels.manufacturing+"</strong><small>"+fmtHealth(health.manufacturingHealth)+"; "+trend(health.manufacturingHealthTrend)+"</small>"+tinyBars((company.operatingHealthHistory||[]).map(d=>d.manufacturingHealth).filter(Number.isFinite))+"</div>"+
    "<div class=\"insight-card\"><strong>"+health.labels.customer+"</strong><small>"+fmtHealth(health.customerSentiment)+"; "+trend(health.customerSentimentTrend)+"</small>"+tinyBars((company.operatingHealthHistory||[]).map(d=>d.customerSentiment).filter(Number.isFinite))+"</div>"+
    "<div class=\"insight-card\"><strong>Executive Observations</strong>"+balanceTuningHtml()+"</div>";
}
function internalReportsHtml(){
  const reports=[],seen=new Map();
  (company.employeeMessages||[]).filter(m=>m.status!=="suppressed").forEach(m=>{
    const issue=messageIssue(m),work=messageWorkItem(m);
    const key=[m.type,m.department,work?.id||issue?.id||m.contentCode||m.subject].join("|");
    if(seen.has(key)){const g=seen.get(key);g.count++;if(!g.names.includes(m.fromName||"employee"))g.names.push(m.fromName||"employee");return;}
    const group={...m,count:1,names:[m.fromName||"employee"]};
    seen.set(key,group);reports.push(group);
  });
  reports.splice(6);
  if(!reports.length)return "";
  return reports.map(m=>{
    const issue=messageIssue(m),work=messageWorkItem(m),age=Math.max(0,company.day-(m.createdDay??company.day));
    const owner=work?employees.find(e=>e.id===work.ownerId):null;
    const subject=m.type==="help-request"&&work&&!(work.blockedBy||[]).length&&String(m.subject).startsWith("Help needed")?`Peer review requested on ${work.title}`:m.subject;
    const lines=[];
    if(work){lines.push(`Current work: ${workStatusLabel(work)}`);lines.push(`Owner: ${owner?owner.name:"unassigned"}; deadline day ${work.deadlineDay+1}`);if(work.blockedBy?.length)lines.push(`Blocker: ${work.blockedBy[0]}`);}
    else if(issue){lines.push(`Current issue: ${issue.type.replace(/-/g," ")}; route ${issue.status}`);(issue.evidence||[]).slice(0,2).forEach(x=>lines.push(x));}
    else lines.push(...(m.evidence||[]).slice(0,3));
    if(m.count>1)lines.push(`${m.count} similar reports: ${m.names.slice(0,3).join(", ")}`);
    const severityText=qualitativeBand(m.severity,{low:45,high:78,lowText:"limited concern",midText:"material concern",highText:"serious concern"});
    const confidenceText=qualitativeBand(m.confidence,{low:45,high:75,lowText:"uncertain evidence",midText:"credible evidence",highText:"well-supported evidence"});
    const ageText=age===0?"today":`${age} ${age===1?"day":"days"} ago`;
    return "<div class=\"report-item\"><strong>"+subject+"</strong><small>"+m.type.replace(/-/g," ")+" from "+(m.fromName||"employee")+" - "+teamDisplayName(m.department)+" - reported "+ageText+" - "+severityText+", "+confidenceText+"<br>"+lines.slice(0,4).join("<br>")+"</small></div>";
  }).join("");
}
function releaseReadinessHtml(){
  const checks=[["PC layout",true,"Main panels, memo archive, and story threads render in desktop layout."],["Mobile layout",true,"Tabs, modal wrapping, and decision controls are responsive."],["Save/load",SAVE_VERSION>=25,"Save migration is version "+SAVE_VERSION+"."],["Offline play",true,"No network connection or online service is required."],["Long-run validation",!!lastValidationReport,"Run Balance Matrix for fresh long-run proof."],["Content continuity",(company.storyChains||[]).length>0,"Story chains connect work, reports, memos, and decisions."]];
  return "<strong>Release Readiness</strong><div class=\"release-grid\">"+checks.map(c=>"<div class=\"release-check\"><strong>"+(c[1]?"Ready":"Needs run")+": "+c[0]+"</strong><small>"+c[2]+"</small></div>").join("")+"</div>";
}
function memoEvidenceHtml(ev,comm){
  const msg=ev.sourceMessageId?(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId):null;
  const issue=msg?.issueId?(company.issueRecords||[]).find(i=>i.id===msg.issueId):null;
  const work=msg?.workItemId?(company.workItems||[]).find(w=>w.id===msg.workItemId):null;
  const suppressed=(company.employeeMessages||[]).filter(m=>m.status==="suppressed"&&company.day-(m.createdDay??0)<=7&&(m.contentCode===msg?.contentCode||!msg)).length;
  const lines=[];
  if(msg){lines.push(`Reported by ${msg.fromName||"employee"} from ${teamDisplayName(msg.department)} on day ${(msg.createdDay??0)+1}.`);lines.push(reportEvidencePhrase(msg));}
  if(issue){lines.push(issueEvidencePhrase(issue));(issue.evidence||[]).slice(0,3).map(evidenceSentence).filter(Boolean).forEach(x=>lines.push(x));}
  if(work)lines.push(`${work.title}: ${workStatusLabel(work)}, quality risk ${Math.round(work.qualityRisk||0)}.`);
  if(suppressed)lines.push(`${suppressed} related report(s) were suppressed or delayed recently.`);
  if(!lines.length){lines.push(`This memo was generated from company operating conditions, not a direct employee escalation.`);(comm.impacts||[]).slice(0,3).forEach(x=>lines.push(x));}
  return `<div class="memo-block"><h4>Evidence</h4><ul class="evidence-list">${lines.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
}
function renderCommunicationArchive(){
  const list=document.getElementById("memoArchiveList"),detail=document.getElementById("memoArchiveDetail");
  const all=Array.isArray(company.communications)?company.communications:[];
  const mode=company.communicationArchiveMode==="deleted"?"deleted":"saved";
  const items=all.map((m,i)=>({m,i})).filter(x=>mode==="deleted"?!!x.m.deleted:!x.m.deleted);
  document.getElementById("commArchiveCount").textContent=all.filter(m=>!m.deleted).length;
  const savedBtn=document.getElementById("archiveActiveFilter"),deletedBtn=document.getElementById("archiveDeletedFilter");
  if(savedBtn)savedBtn.classList.toggle("active",mode==="saved");
  if(deletedBtn)deletedBtn.classList.toggle("active",mode==="deleted");
  if(!items.length){list.innerHTML=`<div class="paper-empty">No ${mode==="deleted"?"deleted old messages":"saved old messages"} yet.</div>`;detail.innerHTML="";return;}
  list.innerHTML=items.map(({m,i})=>`<div class="archive-item ${m.deleted?"deleted":""} ${company.selectedArchiveMessageIndex===i?"selected":""}" onclick="showArchivedMemo(${i})"><strong>${m.title}</strong><small>${m.type} - ${m.date} - Decision: ${m.decision}</small><small>${m.deleted?"Deleted, recoverable":"Saved"} - ${m.read===false?"Unread":"Read"}</small></div>`).join("");
}
function updateCommunicationArchiveCount(){
  const count=document.getElementById("commArchiveCount");
  if(count)count.textContent=(Array.isArray(company.communications)?company.communications:[]).filter(m=>!m.deleted).length;
}
function communicationListSender(ev){
  const sender=ev?.generatedCommunication?.sender||ev?.sender||{};
  if(sender.name)return `${sender.name}${sender.role?`, ${sender.role}`:""}`;
  const comm=ev?.generatedCommunication;
  if(comm?.sender?.name)return `${comm.sender.name}${comm.sender.role?`, ${comm.sender.role}`:""}`;
  return ev?.category?titleCase(String(ev.category)):"Executive Staff";
}
function communicationListPreview(ev){
  const context=decisionContextSummary(ev);
  const copy=String(ev?.copy||ev?.generatedCommunication?.message||"").replace(/\s+/g," ").trim();
  return [context?`Context: ${context}`:"",copy].filter(Boolean).join(" - ").slice(0,180);
}
function renderCommunicationInboxList(){
  const list=document.getElementById("commInboxList");
  if(!list||!company)return;
  const queued=Array.isArray(company.escalationQueue)?company.escalationQueue:[];
  const rows=[];
  if(company.pendingEvent){
    const ev=company.pendingEvent,comm=company.pendingCommunication||ev.generatedCommunication||{};
    ev.read=true;
    rows.push(`<button type="button" class="ceo-mail-item active read"><strong>${htmlEscape(comm.subject||ev.title||"CEO decision needed")}</strong><small>${htmlEscape(comm.type||"Decision memo")} - ${htmlEscape(communicationListSender(ev))} - Active now</small><small>${htmlEscape(communicationListPreview(ev)||"Awaiting CEO decision.")}</small></button>`);
  }
  queued.forEach((ev,i)=>{
    const comm=ev.generatedCommunication||{};
    const canOpen=!company.pendingEvent;
    rows.push(`<button type="button" class="ceo-mail-item waiting ${canOpen?"openable":""} ${ev.read?"read":"unread"}" ${canOpen?`onclick="openQueuedMemoAt(${i})"`:""}><strong>${htmlEscape(comm.subject||ev.title||"Queued memo")}</strong><small>${htmlEscape(comm.type||"Memo")} - ${htmlEscape(communicationListSender(ev))} - ${canOpen?"Ready to open":"Waiting behind active memo"}</small><small>${htmlEscape(communicationListPreview(ev)||"Queued for CEO review.")}</small></button>`);
  });
  list.innerHTML=rows.length?rows.join(""):`<div class="ceo-mail-empty"><strong>Inbox clear</strong><br>The company is operating on its own. A memo or email will appear when leadership is needed.</div>`;
}
function decisionThreadArchiveHtml(m){
  const thread=(company.decisionThreads||[]).find(t=>t.id===m.decisionThreadId)||(company.decisionThreads||[]).find(t=>t.memoId===m.id);
  if(!thread)return "";
  const updates=(thread.followUps||[]).slice().reverse().map(u=>`<li><strong>Day ${u.day+1} - ${String(u.phase).replace(/\b\w/g,c=>c.toUpperCase())}:</strong> ${u.text}</li>`).join("");
  return `<div class="memo-block"><h4>Decision thread</h4><ul class="impact-list"><li>Status: ${thread.state}</li><li>Original decision: ${thread.decision}</li><li>Executive owner: ${thread.from}, ${thread.role}</li>${updates||"<li>No follow-up has matured yet. The company is still absorbing the decision.</li>"}</ul></div>`;
}
function setCommunicationArchiveMode(mode){
  company.communicationArchiveMode=mode==="deleted"?"deleted":"saved";
  company.selectedArchiveMessageIndex=null;
  document.body?.classList.remove("old-message-review-active");
  renderCommunicationArchive();
  if(!validationMode)saveGame();
}
function setArchivedMemoDeleted(i,deleted=true){
  const m=company.communications?.[i];
  if(!m)return;
  m.deleted=!!deleted;
  m.deletedDay=deleted?company.day:null;
  company.communicationArchiveMode=deleted?"deleted":"saved";
  renderCommunicationArchive();
  if(!validationMode)saveGame();
}
function showArchivedMemo(i){
  const m=company.communications[i];
  if(!m)return;
  company.selectedArchiveMessageIndex=i;
  m.read=true;
  document.body?.classList.add("old-message-review-active");
  const titleEl=document.getElementById("eventTitle"),copyEl=document.getElementById("eventCopy"),badgeEl=document.getElementById("inboxBadge");
  if(titleEl)titleEl.textContent=m.title||"Old Message";
  if(copyEl)copyEl.textContent="Reviewing a past CEO communication and the choice you recorded.";
  if(badgeEl){badgeEl.textContent="Old message";badgeEl.className="inbox-badge quiet";}
  const intel=m.memoIntelligence||{},audit=m.memoAudit||intel.audit||{};
  const archivedDebug=debugMode?`<div class="memo-audit">Archived memo debug: relevance ${audit.relevanceScore??"n/a"}%, evidence ${audit.evidenceCoverage??"n/a"}, chain ${audit.chainOfCommandValid?"valid":"unknown"}. ${(intel.evidence||m.impacts||[]).slice(0,6).join(" | ")}</div>`:"";
  document.getElementById("memoArchiveDetail").innerHTML=`<div class="memo-card"><div class="memo-header"><div><div class="memo-type">${m.type}</div><h3>${m.title}</h3></div><span class="memo-priority">${m.priority}</span></div><div class="memo-meta"><div><strong>From:</strong> ${m.from}, ${m.role}</div><div><strong>Date:</strong> ${m.date}</div><div><strong>To:</strong> CEO</div><div><strong>Status:</strong> ${m.deleted?"Deleted old message, recoverable":"Old message"}</div></div><div class="memo-message">${m.message}</div><div class="decision-result"><strong>Your recorded choice:</strong> ${m.decision}<br><small>${m.decisionDetail||""}</small></div>${m.laterOutcome?`<div class="memo-block"><h4>Later outcome</h4><ul class="impact-list"><li>${m.laterOutcome}</li><li>Forecast accuracy: ${m.forecastAccuracy||"not rated"}</li></ul></div>`:""}<div class="archive-actions"><button type="button" class="small-btn" onclick="setArchivedMemoDeleted(${i},${m.deleted?"false":"true"})">${m.deleted?"Restore to Saved Old Messages":"Delete from Old Messages"}</button></div>${archivedDebug}<div class="memo-signature">${String(m.signature||"").replace(/\n/g,"<br>")}</div></div>`;
  renderCommunicationArchive();
  if(!validationMode)saveGame();
}
function openNextQueuedMemo(){
  if(company.pendingEvent||!(company.escalationQueue||[]).length)return false;
  company.pendingEvent=prepareStrategicDecision(company.escalationQueue.shift());
  company.pendingEvent.read=true;
  company.selected=validationMode?chooseValidationDecisionIndex(company.pendingEvent):0;
  company.eventCooldown=0;
  if(validationMode){applyDecision();return true;}
  company.paused=true;
  const pauseBtn=document.getElementById("pauseBtn");
  if(pauseBtn)updatePauseButton();
  company.log.push(`CEO attention requested: ${company.pendingEvent.title}.`);
  return true;
}
function openQueuedMemoAt(index){
  if(company.pendingEvent)return false;
  const queue=Array.isArray(company.escalationQueue)?company.escalationQueue:[];
  if(index<0||index>=queue.length)return false;
  company.pendingEvent=prepareStrategicDecision(queue.splice(index,1)[0]);
  company.pendingEvent.read=true;
  company.selected=validationMode?chooseValidationDecisionIndex(company.pendingEvent):0;
  company.eventCooldown=0;
  if(validationMode){applyDecision();return true;}
  company.paused=true;
  const pauseBtn=document.getElementById("pauseBtn");
  if(pauseBtn)updatePauseButton();
  company.log.push(`CEO attention requested: ${company.pendingEvent.title}.`);
  renderDecisionEvent();
  render();
  return true;
}
function setCommunicationView(view){
  company.communicationView=view;
  const inbox=view==="inbox";
  if(inbox){
    company.selectedArchiveMessageIndex=null;
    document.body?.classList.remove("old-message-review-active");
  }
  document.getElementById("commInboxView").classList.toggle("hidden",!inbox);
  document.getElementById("commArchiveView").classList.toggle("hidden",inbox);
  document.getElementById("commInboxTab").classList.toggle("active",inbox);
  document.getElementById("commArchiveTab").classList.toggle("active",!inbox);
  if(!inbox)renderCommunicationArchive();
  renderDecisionEvent();
}


function decisionContextSnapshot(){
  ensureBibleSystems?.();
  const active=employees.filter(e=>e.active);
  const morale=active.reduce((s,e)=>s+e.morale,0)/Math.max(1,active.length);
  return{
    day:company.day,
    phase:company.phase,
    cash:company.cash,
    board:company.board,
    trust:company.trust,
    quality:company.quality,
    integration:company.integration,
    customers:company.customers,
    revenue:company.dailyRevenue,
    stress:avgStress(),
    morale,
    manufacturing:company.manufacturing?.readiness||0,
    supplyRisk:company.manufacturing?.supplyRisk||0,
    shareholderPressure:company.shareholders?.pressure||0,
    competitorHeat:company.market?.competitorHeat||0,
    aiDemand:company.market?.aiDemand||0,
    customerSentiment:company.customerSentiment||0,
    activeEmployees:active.length
  };
}
function inferDecisionStrategy(choice){
  const s=`${choice.title||""} ${choice.detail||""} ${choice.directive||""}`.toLowerCase();
  if(choice.performance==="fire"||s.includes("fire")||s.includes("cut"))return "cost-control";
  if(choice.performance==="coach"||choice.hire==="specialist"||s.includes("coach")||s.includes("hire")||s.includes("support"))return "people";
  if(choice.launch==="pilot"||s.includes("pilot"))return "pilot";
  if(choice.launch==="full"||s.includes("launch")||choice.directive==="speed"||s.includes("accelerat")||s.includes("push"))return "speed";
  if(choice.directive==="quality"||s.includes("quality")||s.includes("verify")||s.includes("repair")||s.includes("delay")||s.includes("polish"))return "quality";
  if(choice.directive==="revenue"||s.includes("revenue")||s.includes("sales")||s.includes("customer"))return "revenue";
  if(s.includes("fund")||s.includes("runway")||s.includes("finance"))return "finance";
  if(s.includes("experiment")||s.includes("research")||s.includes("patent")||s.includes("initiative"))return "innovation";
  return "balanced";
}
function choiceFeasible(choice,ctx){
  const cashCost=Math.max(0,-Number(choice.effect?.cash||0));
  if(cashCost>Math.max(1.2,ctx.cash*.72))return false;
  if(choice.hire==="specialist"&&ctx.cash<2.8)return false;
  if(choice.launch==="full"&&ctx.manufacturing<12&&ctx.phase!=="customer trial")return false;
  if(choice.title?.toLowerCase().includes("double production")&&ctx.manufacturing<35)return false;
  return true;
}
function contextualChoicePool(ev){
  const ctx=decisionContextSnapshot();
  const base=(ev.choices||[]).map(c=>({...c,source:"core"}));
  const category=eventCategory(ev);
  const isHiringWorkflow=!!(ev.hiringRequest||ev.hiringPolicyReview||ev.hiringException||String(ev.id||"").startsWith("hiring-request-")||String(ev.id||"").startsWith("hiring-exception-")||String(ev.id||"").startsWith("hiring-policy-review-"));
  if(isHiringWorkflow)return base.filter(c=>choiceFeasible(c,ctx));
  const extras=[];
  const add=c=>extras.push({...c,source:"contextual"});
  if(["product","operations","market","internal"].includes(category)||["launch","pilot-review","milestone","market-shift","supply-chain"].includes(ev.id)){
    add({title:"Stage a controlled validation sprint",detail:"Fund a short evidence-gathering cycle before making the larger commitment.",effect:{cash:-.55,quality:3,integration:2,board:-1},directive:"quality",days:5,people:{stress:1,morale:2},culture:{qualityDiscipline:2,communication:1}});
    add({title:"Commit to the market window",detail:"Accept execution risk to capture demand before competitors move.",effect:{cash:-.45,customers:6,board:4,integration:2,trust:-1},directive:"speed",days:6,people:{stress:5,morale:-1},culture:{riskTolerance:2}});
    add({title:"Narrow the promise",detail:"Reduce scope and protect delivery credibility while maintaining momentum.",effect:{cash:-.2,trust:4,quality:2,customers:2},directive:"revenue",days:5,people:{stress:-1,morale:1},culture:{communication:2}});
  }
  if(["finance","board","market","internal"].includes(category)||["cash","shareholder-letter"].includes(ev.id)){
    add({title:"Protect a minimum cash reserve",detail:"Freeze optional spending and preserve operating flexibility.",effect:{cash:2.2,board:2,trust:-1},directive:"cuts",days:7,people:{stress:3,morale:-3},culture:{workLife:-1,politics:1}});
    add({title:"Use a milestone-based funding plan",detail:"Raise limited capital tied to measurable delivery checkpoints.",effect:{cash:4.2,board:1,valuation:-.5},directive:"quality",days:6,people:{stress:1,morale:1},shareholders:{patience:3,pressure:-2}});
    add({title:"Trade margin for customer growth",detail:"Use discounts and support commitments to accelerate adoption.",effect:{cash:-.7,customers:7,trust:3,board:2},directive:"revenue",days:7,people:{stress:3,morale:0}});
  }
  if(["people","culture","internal"].includes(category)||["burnout","performance","hiring","culture"].includes(ev.id)){
    add({title:"Create a 10-day recovery plan",detail:"Reduce workload, preserve employment, and require a measurable recovery checkpoint.",effect:{cash:-.35,board:-1,quality:2},directive:"people",days:10,people:{stress:-8,morale:6},culture:{workLife:3,communication:2},opinion:{support:4,fairness:2}});
    add({title:"Set a hard performance contract",detail:"Keep the role but attach clear output and quality expectations.",effect:{board:2,integration:1},directive:"quality",days:8,people:{stress:3,morale:-1},culture:{qualityDiscipline:2},opinion:{competence:2,fairness:1,fear:2}});
    add({title:"Restructure around the strongest team",detail:"Shift responsibility toward proven collaborators while accepting coordination strain.",effect:{cash:-.2,integration:3,quality:1},directive:"speed",days:7,people:{stress:4,morale:-1},culture:{politics:2,communication:-1}});
  }
  if(category==="opportunity"||ev.id?.includes("opportunity")||ev.sourceMessageId){
    add({title:"Sponsor a bounded experiment",detail:"Approve a small budget, a short deadline, and an explicit stop condition.",effect:{cash:-.45,valuation:1,quality:1,integration:1},directive:"people",days:6,people:{morale:3,stress:0},culture:{innovation:3}});
    add({title:"Request stronger evidence",detail:"Keep the opportunity alive but require customer, technical, or financial proof.",effect:{board:1,quality:1},directive:"quality",days:4,people:{morale:1},culture:{communication:1}});
    add({title:"Decline and protect focus",detail:"Preserve the current plan and avoid adding another commitment.",effect:{cash:.15,board:1},directive:null,days:0,people:{morale:-1},culture:{innovation:-1}});
  }
  return [...base,...extras].filter(c=>choiceFeasible(c,ctx));
}
function decisionOptionScore(choice,ctx,department="company"){
  const strategy=inferDecisionStrategy(choice);
  const deptKey=String(department||"company").toLowerCase();
  let score=50;
  if(strategy==="quality"||strategy==="pilot"){
    score+=(70-ctx.quality)*.35+(65-ctx.integration)*.18+(ctx.supplyRisk-50)*.12;
    score-=(Math.max(0,8-ctx.cash))*2.2+(ctx.competitorHeat-60)*.15;
  }else if(strategy==="speed"){
    score+=(ctx.competitorHeat-45)*.25+(ctx.aiDemand-50)*.2+(ctx.board-55)*.08;
    score-=(65-ctx.quality)*.32+(55-ctx.manufacturing)*.2+(ctx.stress-60)*.25;
  }else if(strategy==="people"){
    score+=(ctx.stress-45)*.35+(60-ctx.morale)*.3+(8-ctx.activeEmployees)*3;
    score-=Math.max(0,5-ctx.cash)*3;
  }else if(strategy==="cost-control"||strategy==="finance"){
    score+=Math.max(0,10-ctx.cash)*4+Math.max(0,ctx.shareholderPressure-55)*.15;
    score-=Math.max(0,60-ctx.morale)*.2+Math.max(0,ctx.stress-60)*.25;
  }else if(strategy==="revenue"){
    score+=Math.max(0,12-ctx.cash)*2+(ctx.customerSentiment-45)*.2+(ctx.aiDemand-50)*.15;
    score-=Math.max(0,60-ctx.quality)*.25+Math.max(0,55-ctx.manufacturing)*.15;
  }else if(strategy==="innovation"){
    score+=(ctx.aiDemand-45)*.18+(company.culture?.innovation||50)*.15;
    score-=Math.max(0,8-ctx.cash)*2.5+Math.max(0,ctx.stress-65)*.2;
  }
  const objectives={
    engineering:{quality:12,speed:-4,pilot:10,people:4,innovation:5},
    hardware:{quality:12,speed:-4,pilot:10,people:4,innovation:5},
    software:{quality:11,speed:-3,pilot:9,people:4,innovation:6},
    quality:{quality:14,speed:-7,pilot:10,people:3,innovation:3},
    product:{revenue:10,speed:7,pilot:8,quality:3,innovation:6},
    "customer success":{revenue:5,speed:-2,pilot:9,quality:8,people:4,"cost-control":-3},
    finance:{finance:12,"cost-control":10,revenue:7,people:-2,innovation:-2},
    board:{speed:6,revenue:8,finance:6,quality:2,people:-1},
    people:{people:14,quality:4,"cost-control":-7,speed:-4}
  };
  score+=(objectives[deptKey]?.[strategy]||0);
  return clamp(score,5,95);
}
function decisionProjectSubject(ev,choice={}){
  choice=choice||{};
  const id=choice.projectDecision?.id||choice.commercializeProject?.id||ev.projectDecision?.id||ev.commercialProjectId||ev.projectId;
  if(id)return allPortfolioSubjects().find(p=>p.id===id)||null;
  const msg=ev.sourceMessageId?(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId):null;
  const work=msg?messageWorkItem(msg):null;
  if(work?.projectId)return projectFromWorkSubject(work);
  return null;
}
function decisionWorkSubject(ev){
  const msg=ev.sourceMessageId?(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId):null;
  return msg?messageWorkItem(msg):null;
}
function hiddenProjectFitScore(project,choice,ev){
  if(!project)return null;
  const strategy=choice.strategy||inferDecisionStrategy(choice),reality=project.hiddenReality||{};
  const age=company.day-(project.createdDay||company.day),timeLeft=(reality.hiddenTimingWindow??120)-age;
  const difficulty=Number(reality.trueTechnicalDifficulty)||50,market=Number(reality.trueMarketDemand)||50,value=Number(reality.trueStrategicValue)||50,knowledge=Number(reality.trueKnowledgeValue)||50,retention=Number(reality.trueTalentRetentionValue)||50,obsolescence=Number(reality.hiddenObsolescenceRate)||20;
  const visibleRisk=Number(project.performance?.riskTrend??project.visibleRisk??50),quality=Number(project.performance?.quality??project.quality??company.quality),staffing=Number(project.performance?.staffingCoverage??derivedStaffingCoverage(project)),schedule=Number(project.performance?.scheduleVariance??0),blockers=Number(project.performance?.blockerCount??0),customer=Number(project.performance?.customerInterest??project.customerInterest??50);
  let score=50;
  if(strategy==="quality"||strategy==="pilot"||/pause|validate|split|reduce/.test(String(choice.title||"").toLowerCase())){
    score+=Math.max(0,difficulty-55)*.45+Math.max(0,visibleRisk-55)*.35+Math.max(0,60-quality)*.45+blockers*5;
    score-=Math.max(0,market-70)*.18+Math.max(0,25-timeLeft)*.25;
  }else if(strategy==="speed"||strategy==="revenue"||/launch|accelerate|market window|commit/.test(String(choice.title||"").toLowerCase())){
    score+=Math.max(0,market-50)*.42+Math.max(0,customer-55)*.28+Math.max(0,70-difficulty)*.18+Math.max(0,40-timeLeft)*.2;
    score-=Math.max(0,visibleRisk-60)*.42+Math.max(0,60-quality)*.38+Math.max(0,(company.manufacturing?.supplyRisk||0)-55)*.18+Math.max(0,schedule)*.18;
  }else if(strategy==="people"||/support|hire|contractor|ownership/.test(String(choice.title||"").toLowerCase())){
    score+=Math.max(0,70-staffing)*.55+blockers*7+Math.max(0,avgStress()-60)*.25+Math.max(0,retention-55)*.18;
    score-=Math.max(0,4-company.cash)*3;
  }else if(strategy==="finance"||strategy==="cost-control"||/cancel|reject|freeze|cut/.test(String(choice.title||"").toLowerCase())){
    score+=Math.max(0,9-company.cash)*4+Math.max(0,visibleRisk-72)*.35+Math.max(0,45-value)*.32+Math.max(0,obsolescence-25)*.25;
    score-=Math.max(0,value-68)*.38+Math.max(0,market-68)*.28+Math.max(0,retention-65)*.22;
  }else if(strategy==="innovation"){
    score+=Math.max(0,knowledge-55)*.45+Math.max(0,value-55)*.25+Math.max(0,company.culture?.innovation-50)*.18;
    score-=Math.max(0,difficulty-75)*.2+Math.max(0,8-company.cash)*2;
  }else{
    score+=Math.max(0,70-visibleRisk)*.12+Math.max(0,quality-55)*.1-Math.max(0,schedule)*.1;
  }
  if(choice.projectDecision?.action==="continue"&&visibleRisk>72)score-=14;
  if(choice.projectDecision?.action==="cancel"&&value>72)score-=18;
  if(choice.projectDecision?.action==="cancel"&&visibleRisk>82&&value<62)score+=18;
  if(choice.projectDecision?.action==="expand"&&staffing<58)score-=16;
  if(choice.projectDecision?.action==="validate"&&market>62)score+=8;
  return clamp(score,5,95);
}
function decisionFitScore(ev,choice,ctx){
  const project=decisionProjectSubject(ev,choice),hidden=hiddenProjectFitScore(project,choice,ev);
  if(hidden!==null)return hidden;
  const work=decisionWorkSubject(ev),base=decisionOptionScore(choice,ctx);
  if(!work)return base;
  const strategy=choice.strategy||inferDecisionStrategy(choice);
  let score=base;
  if((strategy==="quality"||strategy==="pilot")&&(work.qualityRisk>62||work.blockedBy?.length))score+=12;
  if(strategy==="speed"&&work.qualityRisk>68)score-=14;
  if(strategy==="people"&&work.blockedBy?.length)score+=10;
  if(strategy==="finance"&&work.priority>72)score-=6;
  return clamp(score,5,95);
}
function decisionOutcomeLabel(choice,ev){
  const s=choice.strategy||inferDecisionStrategy(choice),project=decisionProjectSubject(ev,choice);
  if(choice.hire||choice.hiringException)return "Immediate: HR executes. Later: workload and payroll respond.";
  if(choice.hiringPolicy)return "Immediate: policy changes. Later: suppressed needs may create pressure.";
  if(choice.projectDecision||project)return "Immediate: portfolio direction changes. Later: project health reveals whether the call fit reality.";
  if(choice.launch)return "Immediate: launch posture changes. Later: customers reveal quality and market fit.";
  if(s==="quality"||s==="pilot")return "Immediate: risk posture changes. Later: quality, schedule, and trust respond.";
  if(s==="speed"||s==="revenue")return "Immediate: momentum rises. Later: quality and customer trust test the decision.";
  if(s==="finance"||s==="cost-control")return "Immediate: runway posture changes. Later: morale, delivery, and board confidence respond.";
  if(s==="people")return "Immediate: team pressure changes. Later: retention and execution reveal the effect.";
  return "Immediate: leadership priorities become clearer. Later: employees, departments, and the Board react.";
}
function applyDelayedProjectOutcome(outcome){
  const impact=outcome.projectImpact;if(!impact)return;
  const p=(company.projects||[]).find(x=>x.id===impact.projectId)||(company.projectProposals||[]).find(x=>x.id===impact.projectId);
  if(!p)return;
  p.progress=clamp((p.progress||0)+(impact.progress||0),0,100);
  p.quality=clamp((p.quality||55)+(impact.quality||0),0,100);
  p.integration=clamp((p.integration||35)+(impact.integration||0),0,100);
  p.visibleRisk=clamp((p.visibleRisk||50)+(impact.risk||0),0,100);
  p.visibleConfidence=clamp((p.visibleConfidence||50)+(impact.confidence||0),0,100);
  p.customerInterest=clamp((p.customerInterest||45)+(impact.customerInterest||0),0,100);
  p.performance={...(p.performance||{}),progress:Math.round(p.progress||0),scheduleVariance:p.performance?.scheduleVariance||0,budgetVariance:p.performance?.budgetVariance||0,quality:Math.round(p.quality||0),integration:Math.round(p.integration||0),teamHealth:p.performance?.teamHealth||70,staffingCoverage:p.performance?.staffingCoverage??derivedStaffingCoverage(p),blockerCount:p.performance?.blockerCount||0,customerInterest:Math.round(p.customerInterest||0),strategicConfidence:Math.round(p.visibleConfidence||0),riskTrend:Math.round(p.visibleRisk||0)};
  p.performance.scheduleVariance=Math.round((p.performance.scheduleVariance||0)+(impact.schedule||0));
  p.performance.riskTrend=clamp(Math.round((p.performance.riskTrend||p.visibleRisk||50)+(impact.risk||0)),0,100);
  p.performance.staffingCoverage=clamp(Math.round((p.performance.staffingCoverage??derivedStaffingCoverage(p))+(impact.staffing||0)),0,100);
  const items=(company.workItems||[]).filter(w=>w.projectId===p.id&&w.status==="open").slice(0,3);
  items.forEach(w=>{w.progress=clamp((w.progress||0)+(impact.workProgress||0),0,100);w.qualityRisk=clamp((w.qualityRisk||50)-(impact.quality||0)+(impact.risk||0),0,100);if((impact.blockers||0)<0&&w.blockedBy?.length)w.blockedBy.shift();});
  recordHistory(`${p.title} changed after "${outcome.choiceTitle}": health ${projectVisibleHealth(p)}, risk ${Math.round(p.performance.riskTrend||p.visibleRisk||0)}.`,"project",4);
}
function applyDelayedWorkOutcome(outcome){
  const impact=outcome.workImpact;if(!impact)return;
  const w=(company.workItems||[]).find(x=>x.id===impact.workItemId);
  if(!w)return;
  w.progress=clamp((w.progress||0)+(impact.progress||0),0,100);
  w.qualityRisk=clamp((w.qualityRisk||50)+(impact.risk||0)-(impact.quality||0),0,100);
  if((impact.blockers||0)<0&&w.blockedBy?.length)w.blockedBy.shift();
  if((impact.blockers||0)>0&&!w.blockedBy?.length)w.blockedBy=[contentPick(v23Content.blockers,w.priority||50)];
  w.stage=workStage(w);
  recordHistory(`${w.title} changed after "${outcome.choiceTitle}": ${workStatusLabel(w)}.`,"work",3);
}
function decorateStrategicChoice(choice,ctx){
  const c={...choice};
  c.strategy=inferDecisionStrategy(c);
  const benefits=[],risks=[];
  const effect=c.effect||{};
  if((effect.quality||0)>0)benefits.push("may improve product quality");
  if((effect.integration||0)>0)benefits.push("may improve delivery or integration");
  if((effect.customers||0)>0)benefits.push("may increase customers");
  if((effect.cash||0)>0)benefits.push("may improve cash runway");
  if((c.people?.stress||0)<0)benefits.push("may reduce employee pressure");
  if((c.people?.morale||0)>0)benefits.push("may improve morale");
  if((effect.board||0)>0)benefits.push("may strengthen board confidence");
  if((effect.trust||0)>0)benefits.push("may strengthen trust");
  if((effect.cash||0)<0)risks.push("uses cash");
  if((c.people?.stress||0)>0)risks.push("raises workload pressure");
  if((c.people?.morale||0)<0)risks.push("may weaken morale");
  if((effect.quality||0)<0)risks.push("accepts quality risk");
  if((effect.trust||0)<0)risks.push("may weaken trust");
  if((effect.board||0)<0)risks.push("may frustrate the board");
  if(!benefits.length)benefits.push("preserves strategic flexibility");
  if(!risks.length)risks.push("results depend on execution and market response");
  c.benefits=benefits.slice(0,3);
  c.risks=risks.slice(0,3);
  const baseConfidence=Math.round(decisionOptionScore(c,ctx));
  c.estimatedConfidence=clamp(baseConfidence+Math.round(rand(-8,8)),18,91);
  c.uncertainty=c.estimatedConfidence>=72?"Moderate":c.estimatedConfidence>=48?"Material":"High";
  c.outcomeLabel=c.outcomeLabel||"Immediate and later effects depend on fit with reality.";
  return c;
}
function pickThreeStrategicChoices(pool,ctx){
  const unique=[];
  const seen=new Set();
  for(const c of pool){
    const key=(c.title||"").toLowerCase();
    if(!seen.has(key)){seen.add(key);unique.push(decorateStrategicChoice(c,ctx));}
  }
  const picked=[];
  const remaining=[...unique];
  while(picked.length<3&&remaining.length){
    const weights=remaining.map(c=>{
      let w=.65+decisionOptionScore(c,ctx)/100;
      if(!picked.some(p=>p.strategy===c.strategy))w*=1.5;
      if(c.source==="contextual")w*=1.08;
      return w;
    });
    let roll=simulationRandom()*weights.reduce((a,b)=>a+b,0),idx=0;
    for(;idx<weights.length;idx++){roll-=weights[idx];if(roll<=0)break;}
    picked.push(remaining.splice(Math.min(idx,remaining.length-1),1)[0]);
  }
  return picked;
}
function dynamicDepartmentRecommendations(ev){
  const ctx=ev.decisionContext||decisionContextSnapshot();
  const choices=ev.choices||[];
  const comm=eventCommunication(ev),evidence=concreteMemoEvidence(ev,comm,memoDepartmentFor(ev,comm),null);
  const departments=eventCategory(ev)==="customer"||ev.customerSegmentId?["customer success","product","finance","board"]:["engineering","product","finance","board"];
  return departments.map(dept=>{
    const ranked=choices.map(c=>{const evaluation=evaluateChoiceForDepartment(c,dept,{event:ev,evidence,snapshot:ctx});return {c,score:evaluation.score,evaluation};}).sort((a,b)=>b.score-a.score);
    const best=ranked[0];
    return [teamDisplayName(dept),best?.c?.title||"Continue monitoring",Math.round(best?.score||50)];
  });
}
function prepareStrategicDecision(ev){
  if(!ev||ev._strategicPrepared)return ev;
  const ctx=decisionContextSnapshot();
  if(ev.informationalOnly===true&&!eventHasDecisionChoices(ev)){
    ev.choices=(ev.choices||[]).map(c=>decorateStrategicChoice(c,ctx));
    ev.decisionContext=ctx;
    ev._strategicPrepared=true;
    return ev;
  }
  const pool=contextualChoicePool(ev);
  if(pool.length>=3)ev.choices=pickThreeStrategicChoices(pool,ctx);
  else ev.choices=(ev.choices||[]).map(c=>decorateStrategicChoice(c,ctx));
  ev.decisionContext=ctx;
  ev._strategicPrepared=true;
  (ev.choices||[]).forEach(c=>{c.outcomeLabel=decisionOutcomeLabel(c,ev);});
  const comm=eventCommunication(ev);
  comm.recs=dynamicDepartmentRecommendations(ev);
  comm.impacts=[
    `Current context: $${ctx.cash.toFixed(1)}M cash, quality ${Math.round(ctx.quality)}, stress ${Math.round(ctx.stress)}`,
    `Market context: competitor pressure ${Math.round(ctx.competitorHeat)}, demand ${Math.round(ctx.aiDemand)}`,
    `Execution context: manufacturing ${Math.round(ctx.manufacturing)}, trust ${Math.round(ctx.trust)}`,
    "The same choice may produce a different result under different future conditions"
  ];
  ev.generatedCommunication={...comm,sender:{name:comm.from,role:comm.role}};
  return ev;
}
function strategicDecisionBriefHtml(ev){
  const ctx=ev.decisionContext||decisionContextSnapshot();
  return `<div class="memo-block"><h4>Decision Context</h4><ul class="impact-list">
    <li>Cash $${ctx.cash.toFixed(1)}M; board ${Math.round(ctx.board)}; trust ${Math.round(ctx.trust)}</li>
    <li>Quality ${Math.round(ctx.quality)}; integration ${Math.round(ctx.integration)}; manufacturing ${Math.round(ctx.manufacturing)}</li>
    <li>Stress ${Math.round(ctx.stress)}; morale ${Math.round(ctx.morale)}; competitor pressure ${Math.round(ctx.competitorHeat)}</li>
  </ul></div>`;
}
function executiveReputationFor(name,dept){
  company.executiveReputations=company.executiveReputations&&typeof company.executiveReputations==="object"?company.executiveReputations:{};
  const key=`${name||"Executive Office"}|${dept||"company"}`;
  if(!company.executiveReputations[key]){
    const bias=departmentBiasProfile(dept||"company");
    company.executiveReputations[key]={conservative:bias.caution,optimistic:clamp(58-bias.caution*.25+bias.overconfidence*.6,0,100),technicallyAccurate:dept==="quality"||dept==="hardware"||dept==="software"?62:54,overconfident:bias.overconfidence,politicallyCautious:dept==="board"||dept==="finance"?66:48,staffingJudgment:dept==="people"?63:52,forecasting:55,lastUpdatedDay:company.day};
  }
  return company.executiveReputations[key];
}
function updateExecutiveReputationFromOutcome(thread,tone){
  if(!thread)return;
  const rep=executiveReputationFor(thread.from,thread.department);
  const positive=tone==="positive",negative=tone==="negative";
  rep.forecasting=clamp((rep.forecasting||55)+(positive?1.4:negative?-1.6:.3),0,100);
  if(["quality","hardware","software"].includes(thread.department))rep.technicallyAccurate=clamp((rep.technicallyAccurate||55)+(positive?1.2:negative?-1.2:.2),0,100);
  if(thread.strategy==="people"||thread.category==="people")rep.staffingJudgment=clamp((rep.staffingJudgment||55)+(positive?1.5:negative?-1.5:.2),0,100);
  if(negative)rep.overconfident=clamp((rep.overconfident||15)+.8,0,100);
  if(positive)rep.optimistic=clamp((rep.optimistic||50)+.4,0,100);
  rep.lastUpdatedDay=company.day;
}
function findDecisionThread(id){
  return (company.decisionThreads||[]).find(t=>t.id===id);
}
function createDecisionThread(ev,choice,comm,delayedOutcome,archivedMemo){
  company.decisionThreads=Array.isArray(company.decisionThreads)?company.decisionThreads:[];
  company.nextDecisionThreadId=Math.max(1,Number(company.nextDecisionThreadId)||1);
  const intel=ev.memoIntelligence||buildMemoIntelligence(ev,comm),dept=intel.department||memoDepartmentFor(ev,comm),project=decisionProjectSubject(ev,choice),work=decisionWorkSubject(ev);
  const id=nextSimulationId("thread");
  const phase2=Math.max(company.day+3,Math.min(company.day+10,delayedOutcome?.dueDay||company.day+7));
  const thread={id,eventId:ev.id,memoId:archivedMemo?.id||null,sourceMessageId:ev.sourceMessageId||null,subject:comm.subject,from:comm.from,role:comm.role,department:dept,category:eventCategory(ev),decision:choice.title,strategy:choice.strategy||inferDecisionStrategy(choice),createdDay:company.day,state:"Pending",phase:0,phaseDueDays:{reaction:company.day+Math.max(1,Math.round(rand(1,3))),operational:phase2,major:company.day+Math.round(rand(14,26)),legacy:company.day+Math.round(rand(32,46))},expectedTone:delayedOutcome?.tone||"mixed",expectedScore:delayedOutcome?.expectedScore||50,realizedScore:delayedOutcome?.realizedScore||50,outcomeMessage:delayedOutcome?.message||"",projectId:project?.id||delayedOutcome?.projectImpact?.projectId||null,workItemId:work?.id||delayedOutcome?.workImpact?.workItemId||null,followUps:[],audit:{reaction:false,operational:false,major:false,legacy:false}};
  company.decisionThreads.unshift(thread);
  company.decisionThreads=company.decisionThreads.slice(0,120);
  if(archivedMemo)archivedMemo.decisionThreadId=id;
  if(delayedOutcome)delayedOutcome.threadId=id;
  return thread;
}
function recordThreadFollowUp(thread,phase,text,{memo=false,priority="FYI",actionRequired=false}={}){
  if(!thread)return;
  const item={day:company.day,phase,text,actionRequired};
  thread.followUps=[item,...(thread.followUps||[])].slice(0,12);
  company.log.push(text);
  recordWeeklyEvent(text,"leadership",memo?3:2);
  if(thread.sourceMessageId){const msg=(company.employeeMessages||[]).find(m=>m.id===thread.sourceMessageId);if(msg)msg.lastThreadUpdate=text;}
  if(memo){
    queueInformationalCommunication({type:"Follow-up",priority,from:thread.from,role:thread.role,date:`Day ${company.day+1}`,subject:`Follow-up: ${thread.subject}`,message:text,recs:[],impacts:[`Original decision: ${thread.decision}`],signature:`Regards,\n${thread.from}\n${thread.role}`},{id:`followup-${thread.id}-${phase}`,category:"follow-up",title:`Follow-up: ${thread.subject}`});
  }
}
function applyDecisionThreadProjectSignal(thread,scale=1){
  const p=(company.projects||[]).find(x=>x.id===thread.projectId);
  if(!p)return false;
  const good=thread.expectedTone==="positive",bad=thread.expectedTone==="negative";
  p.visibleConfidence=clamp((p.visibleConfidence||50)+(good?2*scale:bad?-2*scale:.5*scale),0,100);
  p.visibleRisk=clamp((p.visibleRisk||50)+(good?-2*scale:bad?3*scale:1*scale),0,100);
  p.progress=clamp((p.progress||0)+(good?1.4*scale:bad?.2*scale:.7*scale),0,100);
  if(p.performance)p.performance.scheduleVariance=Number(((p.performance.scheduleVariance||0)+(good?-.5*scale:bad?.8*scale:.2*scale)).toFixed(2));
  return true;
}
function applyDecisionThreadWorkSignal(thread,scale=1){
  const w=(company.workItems||[]).find(x=>x.id===thread.workItemId);
  if(!w||w.status!=="open")return false;
  const good=thread.expectedTone==="positive",bad=thread.expectedTone==="negative";
  w.progress=clamp((w.progress||0)+(good?2.2*scale:bad?.4*scale:1*scale),0,100);
  w.qualityRisk=clamp((w.qualityRisk||35)+(good?-2*scale:bad?3*scale:.4*scale),0,100);
  return true;
}
function attachDecisionThreadOutcome(outcome){
  const thread=findDecisionThread(outcome.threadId);
  if(!thread)return;
  thread.outcomeMessage=outcome.message;
  thread.expectedTone=outcome.tone||thread.expectedTone;
  thread.realizedScore=outcome.realizedScore||thread.realizedScore;
  thread.delayedOutcomeDay=company.day;
  thread.state=outcome.tone==="negative"?"Unexpected Development":"Resolved";
  updateExecutiveReputationFromOutcome(thread,outcome.tone);
}
function processDecisionThreads(){
  company.decisionThreads=Array.isArray(company.decisionThreads)?company.decisionThreads:[];
  company.decisionThreads.forEach(thread=>{
    if(!thread.audit.reaction&&company.day>=thread.phaseDueDays.reaction){
      thread.audit.reaction=true;thread.phase=1;thread.state="Early Indicators";
      const tone=thread.expectedTone==="positive"?"relieved":thread.expectedTone==="negative"?"concerned":"divided";
      employees.filter(e=>e.active&&employeeTeam(e)===thread.department).forEach(e=>applyEmployeeEmotionDelta(e,{moraleDelta:thread.expectedTone==="positive"?1:thread.expectedTone==="negative"?-1:0,stressDelta:thread.expectedTone==="negative"?1:0,reasonCode:"decision-follow-up",sourceEventId:`thread-${thread.id}`,ignoreCooldown:true}));
      recordThreadFollowUp(thread,"reaction",`${teamDisplayName(thread.department)} is ${tone} after the "${thread.decision}" decision on ${thread.subject}.`);
    }
    if(!thread.audit.operational&&company.day>=thread.phaseDueDays.operational){
      thread.audit.operational=true;thread.phase=2;thread.state="In Progress";
      const effect=thread.projectId?"the related project is being watched":thread.workItemId?"the related work item is being tracked":"department behavior began shifting";
      if(thread.strategy==="people")employees.filter(e=>e.active&&employeeTeam(e)===thread.department).forEach(e=>applyEmployeeEmotionDelta(e,{stressDelta:-1,reasonCode:"people-follow-up",sourceEventId:`thread-${thread.id}`,ignoreCooldown:true}));
      recordThreadFollowUp(thread,"operational",`The team has started carrying out "${thread.decision}"; ${effect}.`);
    }
    if(!thread.audit.major&&company.day>=thread.phaseDueDays.major){
      thread.audit.major=true;thread.phase=3;thread.state=thread.expectedTone==="negative"?"Unexpected Development":"Resolved";
      const material=Math.abs((thread.realizedScore||50)-(thread.expectedScore||50))>10||thread.expectedTone!=="mixed";
      const text=thread.outcomeMessage||`The larger consequences of "${thread.decision}" are now visible across ${teamDisplayName(thread.department)}.`;
      recordThreadFollowUp(thread,"major",`${text} Original decision: "${thread.decision}" on ${thread.subject}.`,{memo:material&&simulationRandom()<.55,priority:thread.expectedTone==="negative"?"Urgent":"FYI"});
      updateExecutiveReputationFromOutcome(thread,thread.expectedTone);
    }
    if(!thread.audit.legacy&&company.day>=thread.phaseDueDays.legacy){
      thread.audit.legacy=true;thread.phase=4;thread.state="Long-term Legacy";
      recordHistory(`The organization remembered "${thread.decision}" from ${thread.subject}.`,"leadership",3);
      if(typeof createOrReinforceLesson==="function")createOrReinforceLesson({key:`executive-thread-${thread.strategy}`,title:`CEO decisions about ${thread.strategy||"strategy"} create visible reactions, operating follow-through, and long-term memory.`,department:thread.department,vector:{planning:.3,communication:.25,documentation:.2},outcome:thread.expectedTone,confidence:60,evidence:`Decision thread ${thread.subject}`,importance:3});
    }
  });
  company.decisionThreads=company.decisionThreads.filter(t=>company.day-(t.createdDay??company.day)<180||t.state!=="Long-term Legacy").slice(0,120);
}
function evaluateStrategicOutcome(ev,choice){
  const ctx=ev.decisionContext||decisionContextSnapshot();
  const expected=decisionOptionScore(choice,ctx);
  const fit=decisionFitScore(ev,choice,ctx);
  const uncertainty=choice.uncertainty==="High"?28:choice.uncertainty==="Material"?20:14;
  const strategy=choice.strategy||inferDecisionStrategy(choice);
  const project=decisionProjectSubject(ev,choice);
  const work=decisionWorkSubject(ev);
  const projectRisk=project?Number(project.performance?.riskTrend??project.visibleRisk??50):50;
  const blockerPressure=project?Number(project.performance?.blockerCount??0)*5:work?.blockedBy?.length?10:0;
  const supplyPressure=Math.max(0,(company.manufacturing?.supplyRisk||0)-62)*.16;
  const peoplePressure=Math.max(0,avgStress()-68)*.16;
  const lowQualityPressure=Math.max(0,58-(project?.performance?.quality??project?.quality??company.quality??58))*.14;
  const downsideChance=clamp((uncertainty*.003)+Math.max(0,projectRisk-70)*.002+blockerPressure*.003+supplyPressure*.01+peoplePressure*.01+lowQualityPressure*.01,.04,.24);
  const upsideChance=clamp((uncertainty*.0018)+Math.max(0,(project?.performance?.customerInterest??project?.customerInterest??company.customerSentiment??50)-68)*.002+Math.max(0,(company.culture?.innovation||50)-65)*.0015,.025,.15);
  const surpriseRoll=simulationRandom();
  const outcomeSurprise=surpriseRoll<downsideChance?-rand(5,18):surpriseRoll>1-upsideChance?rand(4,14):0;
  const realized=fit*.68+expected*.32+rand(-uncertainty*.55,uncertainty*.55)+outcomeSurprise;
  let tone="mixed",effect={},people={},message="",projectImpact=null,workImpact=null;
  if(realized>=64){
    tone="positive";
    if(strategy==="quality"||strategy==="pilot")effect={quality:2.5,trust:2};
    else if(strategy==="speed")effect={customers:4,board:2,valuation:1};
    else if(strategy==="people")people={stress:-3,morale:3};
    else if(strategy==="finance"||strategy==="cost-control")effect={cash:1.2,board:1};
    else if(strategy==="revenue")effect={cash:.7,customers:3};
    else if(strategy==="innovation")effect={valuation:1.5,quality:1};
    else effect={board:1,trust:1};
    if(project){
      projectImpact={projectId:project.id,progress:strategy==="speed"||strategy==="revenue"?4:strategy==="people"?2:1,quality:strategy==="quality"||strategy==="pilot"?4:strategy==="people"?2:0,integration:strategy==="people"||strategy==="speed"?3:1,risk:strategy==="quality"||strategy==="pilot"?-7:strategy==="people"?-5:-2,confidence:4,customerInterest:strategy==="revenue"||strategy==="speed"?4:strategy==="quality"?1:0,staffing:strategy==="people"?5:0,schedule:strategy==="speed"?-3:strategy==="quality"?2:0,workProgress:strategy==="speed"?8:strategy==="people"?5:3,blockers:strategy==="people"||strategy==="quality"?-1:0};
      message=`The ${choice.title.toLowerCase()} decision matched ${project.title}'s operating conditions and improved the project's operating position.`;
    }else if(work){
      workImpact={workItemId:work.id,progress:strategy==="speed"?8:strategy==="people"?6:4,quality:strategy==="quality"||strategy==="people"?4:1,risk:strategy==="speed"?1:-5,blockers:strategy==="people"||strategy==="quality"?-1:0};
      message=`The ${choice.title.toLowerCase()} decision helped the work behind ${work.title}.`;
    }else message=`The ${choice.title.toLowerCase()} decision produced an early benefit under current conditions.`;
  }else if(realized<42){
    tone="negative";
    if(strategy==="quality"||strategy==="pilot")effect={cash:-.7,board:-2,customers:-2};
    else if(strategy==="speed")effect={quality:-3,trust:-2};
    else if(strategy==="people")effect={cash:-.6,board:-1};
    else if(strategy==="finance"||strategy==="cost-control")people={stress:3,morale:-3};
    else if(strategy==="revenue")effect={quality:-2,trust:-2};
    else if(strategy==="innovation")effect={cash:-.8,board:-1};
    else effect={board:-1};
    if(project){
      projectImpact={projectId:project.id,progress:strategy==="speed"?2:-1,quality:strategy==="speed"||strategy==="revenue"?-5:-2,integration:strategy==="finance"||strategy==="cost-control"?-2:-1,risk:strategy==="speed"?8:strategy==="finance"||strategy==="cost-control"?5:4,confidence:-5,customerInterest:strategy==="finance"||strategy==="cost-control"?-4:-2,staffing:strategy==="people"?-2:0,schedule:strategy==="quality"||strategy==="pilot"?4:strategy==="speed"?-1:2,workProgress:strategy==="finance"||strategy==="cost-control"?-2:1,blockers:strategy==="speed"||strategy==="finance"?1:0};
      message=`The ${choice.title.toLowerCase()} decision did not fit ${project.title}'s operating conditions and created project drag.`;
    }else if(work){
      workImpact={workItemId:work.id,progress:strategy==="speed"?3:-1,quality:strategy==="quality"?0:-3,risk:strategy==="speed"?7:4,blockers:strategy==="speed"||strategy==="finance"?1:0};
      message=`The ${choice.title.toLowerCase()} decision made the work behind ${work.title} harder than expected.`;
    }else message=`The ${choice.title.toLowerCase()} decision created an early downside that was not fully visible in the memo.`;
  }else{
    effect={};
    if(project){
      projectImpact={projectId:project.id,progress:1,quality:strategy==="quality"?1:0,integration:1,risk:0,confidence:0,customerInterest:0,schedule:1,workProgress:2};
      message=`The ${choice.title.toLowerCase()} decision produced a mixed result for ${project.title}; departments still disagree about its value.`;
    }else if(work){
      workImpact={workItemId:work.id,progress:2,quality:0,risk:0,blockers:0};
      message=`The ${choice.title.toLowerCase()} decision produced a mixed result for ${work.title}.`;
    }else message=`The ${choice.title.toLowerCase()} decision produced a mixed early result; its long-term value remains uncertain.`;
  }
  const dueDay=company.day+Math.round(rand(3,9));
  const delayed={
    id:nextSimulationId("decision"),
    dueDay,
    eventId:ev.id,
    choiceTitle:choice.title,
    strategy,
    tone,
    effect,
    people,
    message,
    expectedScore:Math.round(expected),
    realizedScore:Math.round(realized),
    fitScore:Math.round(fit),
    outcomeSurprise:Number(outcomeSurprise.toFixed(2)),
    projectImpact,
    workImpact
  };
  company.delayedDecisionEffects=Array.isArray(company.delayedDecisionEffects)?company.delayedDecisionEffects:[];
  company.delayedDecisionEffects.push(delayed);
  company.decisionHistory=Array.isArray(company.decisionHistory)?company.decisionHistory:[];
  company.decisionHistory.unshift({day:company.day,eventId:ev.id,choice:choice.title,strategy,expectedScore:Math.round(expected),uncertainty:choice.uncertainty,dueDay});
  company.decisionHistory=company.decisionHistory.slice(0,100);
  return delayed;
}
function updateMemoOutcomeAccountability(outcome){
  company.communications=Array.isArray(company.communications)?company.communications:[];
  const memo=company.communications.find(m=>m.eventId===outcome.eventId&&!m.laterOutcome);
  if(!memo)return;
  memo.laterOutcome=outcome.message;
  const expected=Number(outcome.expectedScore)||50,realized=Number(outcome.realizedScore)||50;
  const diff=Math.abs(realized-expected);
  memo.forecastAccuracy=diff<=12?"close":diff<=25?"mixed":"missed";
  memo.credibilityUpdated=true;
  const dept=memo.memoIntelligence?.department||memoDepartmentFor({id:memo.eventId,category:"company"},{role:memo.role,from:memo.from});
  const cred=ensureSenderCredibility(memo.from,dept);
  const direction=outcome.tone==="positive"?1:outcome.tone==="negative"?-1:0;
  cred.estimateAccuracy=clamp((cred.estimateAccuracy||55)+(memo.forecastAccuracy==="close"?2:memo.forecastAccuracy==="missed"?-2:.5),0,100);
  cred.recommendationAccuracy=clamp((cred.recommendationAccuracy||55)+direction*(memo.decisionStrategy===outcome.strategy?1.6:.6),0,100);
  cred.evidenceQuality=clamp((cred.evidenceQuality||58)+(memo.forecastAccuracy==="close"?1.2:-.8),0,100);
  cred.lastUpdatedDay=company.day;
  recordSenderCredibilityHistory(memo.from,dept,`decision outcome: ${memo.forecastAccuracy||"reviewed"}`,cred);
}
function processDelayedDecisionEffects(){
  company.delayedDecisionEffects=Array.isArray(company.delayedDecisionEffects)?company.delayedDecisionEffects:[];
  const due=company.delayedDecisionEffects.filter(x=>x.dueDay<=company.day);
  company.delayedDecisionEffects=company.delayedDecisionEffects.filter(x=>x.dueDay>company.day);
  due.forEach(x=>{
    Object.entries(x.effect||{}).forEach(([k,v])=>{if(k==="customers")applyCustomerDelta(v,x.message||x.type||"delayed outcome",x.type||"delayed");else company[k]=(company[k]||0)+v;});
    employees.filter(e=>e.active).forEach(e=>{
      applyEmployeeEmotionDelta(e,{stressDelta:x.people?.stress||0,moraleDelta:x.people?.morale||0,reasonCode:"delayed-decision-effect",sourceEventId:x.eventId||x.type||"delayed",ignoreCooldown:true});
    });
    clampCompany();
    if(x.type==="project-cancel"){
      if((x.effect?.board||0)<0)addBoardStrike?.(`Board questioned cancellation of ${x.projectTitle}`);
      createOrReinforceLesson({key:"project-cancel-aftershock",title:"Canceled projects can release capacity but still create delayed morale, customer, and board consequences.",department:"company",vector:{planning:.45,cancellationTiming:.65,sunkCostDiscipline:.55,retention:.25},outcome:"mixed",confidence:62,evidence:x.projectTitle,importance:4,episodeKey:`cancel-${x.projectId||x.projectTitle}-${x.dueDay}`,attributionQuality:64,reviewWindow:"long"});
      recordHistory(`Delayed consequences emerged from canceling ${x.projectTitle}.`,"project",4);
    }
    applyDelayedProjectOutcome(x);
    applyDelayedWorkOutcome(x);
    company.log.push(`Decision outcome: ${x.message}`);
    recordWeeklyEvent(`Decision outcome: ${x.message}`,"leadership",x.tone==="negative"?4:3,{eventId:x.eventId,choiceTitle:x.choiceTitle,decisionTitle:x.choiceTitle,projectId:x.projectImpact?.projectId||x.projectId||null,workItemId:x.workImpact?.workItemId||x.workItemId||null,projectTitle:x.projectTitle||null,strategy:x.strategy,tone:x.tone});
    recordHistory(`Long-term result of "${x.choiceTitle}": ${x.message}`,"leadership",x.tone==="negative"?4:3);
    updateMemoOutcomeAccountability(x);
    attachDecisionThreadOutcome(x);
    if(typeof createOrReinforceLesson==="function"){
      const vectors={
        quality:{testing:x.tone==="positive"?.35:.15,planning:.2,riskTaking:x.tone==="negative"?-.25:.05},
        pilot:{testing:.3,planning:.25,riskTaking:x.tone==="negative"?-.2:.05},
        speed:{riskTaking:x.tone==="positive"?.3:-.25,testing:x.tone==="negative"?.25:0},
        people:{recovery:x.tone==="positive"?.3:.1,mentoring:.15},
        "cost-control":{planning:.25,recovery:x.tone==="negative"?.2:0},
        finance:{planning:.3},
        revenue:{planning:.15,riskTaking:x.tone==="positive"?.15:-.1},
        innovation:{innovation:x.tone==="positive"?.35:-.15}
      };
      createOrReinforceLesson({
        key:`decision-${x.eventId}-${x.strategy}`,
        title:x.message,
        department:"company",
        vector:vectors[x.strategy]||{planning:.1},
        outcome:x.tone,
        confidence:clamp(55+Math.abs(x.realizedScore-x.expectedScore),45,88),
        evidence:`CEO chose ${x.choiceTitle}; delayed result observed on day ${company.day}`,
        importance:x.tone==="negative"?4:3,
        episodeKey:`delayed-decision-${x.eventId}-${x.choiceTitle}-${x.dueDay}`,
        attributionQuality:70,
        reviewWindow:"long"
      });
    }
  });
}

function renderDecisionEvent(){
  const grid=document.getElementById("decisionGrid"),button=document.getElementById("applyDecision"),badge=document.getElementById("inboxBadge"),alert=document.getElementById("officeAlert"),memo=document.getElementById("memoContainer");
  const queuedCount=(company.escalationQueue||[]).length;
  const inboxCount=(company.pendingEvent?1:0)+queuedCount;
  if(!validationMode&&lastInboxSoundCount!==null&&inboxCount>lastInboxSoundCount)playMessageAlert();
  lastInboxSoundCount=inboxCount;
  document.body?.classList.toggle("ceo-review-active",!!company.pendingEvent);
  if(company.pendingEvent)document.body?.classList.remove("old-message-review-active");
  document.getElementById("commInboxCount").textContent=inboxCount;
  if(company.communicationView==="archive")renderCommunicationArchive();
  else updateCommunicationArchiveCount();
  renderCommunicationInboxList();
  if(!company.pendingEvent){
    const readingOld=company.communicationView==="archive"&&document.body?.classList.contains("old-message-review-active");
    const oldMessage=readingOld?company.communications?.[company.selectedArchiveMessageIndex]:null;
    document.getElementById("eventTitle").textContent=readingOld?(oldMessage?.title||"Old Message"):queuedCount?`${queuedCount} memo${queuedCount===1?"":"s"} queued`:"No urgent decisions";
    document.getElementById("eventCopy").textContent=readingOld?"Reviewing a past CEO communication and the choice you recorded.":queuedCount?"A memo or email is waiting in your inbox. Click a message when you want to review it.":"The company is operating on its own. A memo or email will appear when leadership is needed.";
    button.textContent="Record CEO Decision";
    memo.classList.add("hidden");grid.classList.add("hidden");button.classList.add("hidden");
    badge.textContent=readingOld?"Old message":queuedCount?"Queued":"Watching";
    badge.className=queuedCount?"inbox-badge alert":"inbox-badge quiet";
    alert.classList.add("hidden");
    return;
  }
  const stale=validateMessageContext(company.pendingEvent);if(!stale.valid){const old=company.pendingEvent;recordHistory(`CEO memo superseded: ${old.title||old.id} (${stale.reason}).`,"communication",2);company.pendingEvent=null;company.pendingCommunication=null;renderDecisionEvent();return;}
  const ev=prepareStrategicDecision(company.pendingEvent),comm=eventCommunication(ev);company.pendingCommunication=comm;
  renderCommunicationInboxList();
  const contextText=decisionContextSummary(ev);
  const informational=isInformationalExecutiveEvent(ev);
  document.getElementById("eventTitle").textContent=comm.subject;document.getElementById("eventCopy").textContent=informational?"Read this executive update, then file it when you are done.":contextText?`Decision context: ${contextText}. Review the communication and record a CEO decision.`:"Review the communication and record a CEO decision.";badge.textContent=informational?"Information":"Action needed";badge.className=informational?"inbox-badge quiet":"inbox-badge alert";grid.classList.toggle("hidden",informational);button.classList.remove("hidden");button.textContent=informational?"File Message":"Record CEO Decision";memo.classList.remove("hidden");
  const priorityClass=comm.priority==="Urgent"?"urgent":comm.priority==="FYI"?"fyi":"";
  ev.memoIntelligence=ev.memoIntelligence||buildMemoIntelligence(ev,comm);
  ensureExecutiveMessageModel(ev,comm);
  memo.innerHTML=`<article class="memo-card"><div class="memo-header"><div><div class="memo-type">${comm.type}</div><h3>${comm.subject}</h3></div><span class="memo-priority ${priorityClass}">${comm.priority}</span></div>${communicationHeaderHtml(comm,comm.structuredMessage)}<div class="memo-message">${comm.message}</div>${memoIntelligenceHtml(ev,comm)}<div class="memo-signature">${comm.signature.replace(/\n/g,"<br>")}</div></article>`;
  alert.innerHTML=informational?`<strong>${comm.type}: ${comm.subject}</strong>${comm.from} sent an informational update.`:`<strong>${comm.type}: ${comm.subject}</strong>${comm.from} requests a CEO decision${contextText?` for ${contextText}`:""}.`;alert.classList.toggle("hidden",informational);grid.innerHTML="";if(!informational)(ev.choices||[]).slice(0,3).forEach((d,i)=>{const b=document.createElement("button");b.className="decision"+(i===company.selected?" selected":"");b.innerHTML=renderDecisionChoiceHtml(d,ev);b.onclick=()=>{company.selected=i;renderDecisionEvent()};grid.appendChild(b);});
}
function eventCategory(ev){return ev.category||({cash:"finance",performance:"people",hiring:"people",burnout:"people",culture:"culture",milestone:"product",launch:"product","pilot-review":"product","market-shift":"market","supply-chain":"operations","shareholder-letter":"board"}[ev.id]||"opportunity");}
function eventBaseWeight(ev){return Number(ev.baseWeight)||({performance:.75,cash:.8,hiring:1.25,burnout:1,culture:.95,"market-shift":1,milestone:1.1,launch:1.2,"pilot-review":1.2}[ev.id]||1);}
function eventCooldownDays(ev){return Number(ev.cooldownDays)||({performance:15,cash:12,burnout:10,culture:14,"market-shift":10,hiring:5,"supply-chain":10,"shareholder-letter":14}[ev.id]||8);}
function eventCooldownReady(ev){
  company.eventHistory=company.eventHistory&&typeof company.eventHistory==="object"?company.eventHistory:{};
  const h=company.eventHistory[ev.id];
  return !h||company.day-(h.lastDay??-999)>=eventCooldownDays(ev);
}
function cashEventEligible(){
  if(company.cash>12)company.cashEventArmed=true;
  return company.cash<9&&company.cashEventArmed!==false&&!["cuts","revenue"].includes(company.directive);
}
function eventSelectionWeight(ev){
  const h=company.eventHistory?.[ev.id]||{},category=eventCategory(ev),recent=company.recentEventCategories||[];
  let weight=eventBaseWeight(ev);
  if(!h.count)weight*=1.45;
  if(h.lastDay!==undefined){const age=company.day-h.lastDay;if(age<eventCooldownDays(ev)*2)weight*=.55;}
  if(recent[0]===category)weight*=.18;
  else if(recent.includes(category))weight*=.55;
  if(recent[0]===ev.id)weight*=.1;
  const snapshot=buildExecutiveIntelligenceSnapshot(),signalText=[...(snapshot.topRisks||[]),...(snapshot.topOpportunities||[]),...(snapshot.departmentBeliefs||[])].map(i=>`${i.title||""} ${i.detail||""}`).join(" ").toLowerCase();
  const eventText=String(`${ev.id||""} ${ev.category||""} ${ev.title||""} ${ev.copy||""}`).toLowerCase();
  if(signalText&&evidenceSignalIds(signalText).some(id=>evidenceSignalIds(eventText).includes(id)))weight*=1.25;
  if((snapshot.suppressedReportFindings||[]).some(s=>s.severeCount>0)&&/culture|performance|people|board|shareholder/.test(eventText))weight*=1.18;
  return Math.max(.05,weight);
}
function chooseCEOEvent(){
  const eligible=eventLibrary.filter(ev=>ev.trigger()&&(ev.repeatable||!company.completedEvents.includes(ev.id))&&eventCooldownReady(ev)).map(ev=>({ev,weight:eventSelectionWeight(ev)}));
  if(!eligible.length)return null;
  const total=eligible.reduce((s,x)=>s+x.weight,0);let roll=simulationRandom()*total;
  for(const item of eligible){roll-=item.weight;if(roll<=0)return item.ev;}
  return eligible[eligible.length-1].ev;
}
function recordEventShown(ev){
  company.eventHistory=company.eventHistory&&typeof company.eventHistory==="object"?company.eventHistory:{};
  const h=company.eventHistory[ev.id]||{count:0,lastDay:-999};
  company.eventHistory[ev.id]={count:(h.count||0)+1,lastDay:company.day};
  const category=eventCategory(ev);
  company.recentEventCategories=[category,...(company.recentEventCategories||[]).filter(x=>x!==category)].slice(0,5);
  if(ev.id==="cash")company.cashEventArmed=false;
}

function validationDecisionScore(choice){
  const eff=choice.effect||{},people=choice.people||{},supply=choice.supply||{},share=choice.shareholders||{};
  let score=0;
  if(company.cash<8)score+=(eff.cash||0)*9;
  else score+=(eff.cash||0)*2;
  if(company.board<35)score+=(eff.board||0)*5;
  else score+=(eff.board||0)*1.5;
  if(company.trust<45)score+=(eff.trust||0)*5;
  else score+=(eff.trust||0)*1.5;
  if(company.quality<52)score+=(eff.quality||0)*4;
  else score+=(eff.quality||0)*1.2;
  if(company.integration<55)score+=(eff.integration||0)*2.6;
  if(company.phase!=="prototype")score+=(eff.customers||0)*1.4;
  if(avgStress()>68)score-=Math.max(0,people.stress||0)*4;
  else score-=Math.max(0,people.stress||0)*1.2;
  score+=Math.max(0,-(people.stress||0))*3;
  score+=(people.morale||0)*2;
  if(company.manufacturing?.supplyRisk>70)score+=Math.max(0,-(supply.risk||0))*3+(supply.yield||0)*1.5+(supply.readiness||0)*1.2;
  if(company.shareholders?.pressure>65)score+=(share.confidence||0)*1.4+Math.max(0,-(share.pressure||0))*1.6;
  if(choice.directive==="cuts"&&avgStress()>62)score-=10;
  if(choice.directive==="speed"&&(company.quality<48||avgStress()>70))score-=12;
  if(choice.directive==="quality"&&company.cash<5)score-=4;
  if(choice.directive==="people"&&company.cash>4)score+=4;
  return score;
}
function chooseValidationDecisionIndex(ev){
  const choices=ev?.choices||[];
  if(!choices.length)return 0;
  return choices.map((choice,i)=>({i,score:validationDecisionScore(choice)})).sort((a,b)=>b.score-a.score)[0].i;
}
function policyLabel(policy){
  return ({quality:"Quality Policy",speed:"Speed Policy",people:"People Policy",cuts:"Cost Discipline Policy",revenue:"Revenue Policy"})[policy]||`${String(policy||"Policy").replace(/\b\w/g,c=>c.toUpperCase())} Policy`;
}
function policyAffectedDepartments(policy){
  return {
    quality:["hardware","software","quality"],
    speed:["hardware","software","product"],
    people:["people","hardware","software"],
    cuts:["finance","people"],
    revenue:["product","finance"]
  }[policy]||["company"];
}
function policyTemporaryModifiers(policy){
  return {
    quality:"lower mistake tolerance, more testing, slower rushing",
    speed:"higher urgency, faster work bias, increased stress risk",
    people:"higher morale support, recovery bias, collaboration support",
    cuts:"lower spending pressure, higher morale and retention risk",
    revenue:"customer focus, sales pressure, delivery trade-offs"
  }[policy]||"temporary behavior weighting";
}
function startPolicyTransition(policy,days,choiceTitle=""){
  if(!policy||!days)return;
  const departments=policyAffectedDepartments(policy);
  company.directive=policy;
  company.directiveDays=days;
  company.policyTransition={policy,startedDay:company.day,totalDays:days,affectedDepartments:departments,choiceTitle,temporaryModifiers:policyTemporaryModifiers(policy),baseline:{quality:company.quality,integration:company.integration,trust:company.trust,stress:avgStress(),morale:employees.filter(e=>e.active).reduce((s,e)=>s+e.morale,0)/Math.max(1,employees.filter(e=>e.active).length)}};
  recordHistory(`${policyLabel(policy)} Adopted: ${departments.map(teamDisplayName).join(" and ")} have begun adjusting to the new standards. The transition is expected to take several days.`,"policy",4);
}
function completePolicyTransition(){
  const t=company.policyTransition,policy=company.directive;
  if(t&&policy){
    recordHistory(`${policyLabel(policy)} Fully Adopted: the affected departments have completed the transition to the new ${String(policy).replace(/-/g," ")} standards.`,"policy",3);
  }else if(policy){
    recordHistory(`${policyLabel(policy)} Fully Adopted: the organization completed the temporary transition period.`,"policy",2);
  }
  company.policyTransition=null;
  company.directive=null;
  company.directiveDays=0;
}
function normalizeInboxFlow(){
  company.inboxFlow={day:company.day||0,openedToday:0,lastOpenedDay:-999,...(company.inboxFlow||{})};
  if(company.inboxFlow.day!==company.day){company.inboxFlow.day=company.day;company.inboxFlow.openedToday=0;}
  return company.inboxFlow;
}
function memoPriorityBypass(ev){
  const text=[ev?.title,ev?.category,ev?.generatedCommunication?.priority,ev?.generatedCommunication?.subject,ev?.copy].join(" ");
  return !!(ev?.forceImmediate||ev?.protectedDirect||/urgent|pip|payroll|insolven|legal|safety|whistle|retaliation|harassment|fraud|failure|board strike/i.test(text));
}
function canOpenQueuedMemo(ev){
  if(validationMode||memoPriorityBypass(ev))return true;
  const flow=normalizeInboxFlow();
  if(flow.openedToday>=1)return false;
  if(typeof recentCeoDecisionPressure==="function"&&recentCeoDecisionPressure(5)>4)return false;
  return true;
}
function markQueuedMemoOpened(ev){
  if(validationMode)return;
  const flow=normalizeInboxFlow();
  flow.openedToday+=1;
  flow.lastOpenedDay=company.day;
}
function nextEligibleQueuedMemo(){
  const queue=Array.isArray(company.escalationQueue)?company.escalationQueue:[];
  const urgentIndex=queue.findIndex(memoPriorityBypass);
  if(urgentIndex>=0)return queue.splice(urgentIndex,1)[0];
  const normalIndex=queue.findIndex(canOpenQueuedMemo);
  return normalIndex>=0?queue.splice(normalIndex,1)[0]:null;
}
function openDecisionEvent(ev){
  company.pendingEvent=prepareStrategicDecision(ev);
  company.selected=validationMode?chooseValidationDecisionIndex(company.pendingEvent):0;
  if(validationMode){applyDecision();return;}
  company.paused=true;
  updatePauseButton();
  company.log.push(`CEO attention requested: ${company.pendingEvent.title}.`);
  switchMobileTab("inbox");
}
function maybeCreateDecisionEvent(){if(company.pendingEvent)return;ensureBibleSystems?.();company.escalationQueue=Array.isArray(company.escalationQueue)?company.escalationQueue:[];if(validationMode&&company.escalationQueue.length){openDecisionEvent(nextEligibleQueuedMemo()||company.escalationQueue.shift());return;}if(company.escalationQueue.length>=4)return;if(company.eventCooldown>0)return;if(simulationRandom()>.004)return;const selected=chooseCEOEvent();if(!selected)return;const ev=prepareStrategicDecision({...selected,choices:(selected.choices||[]).map(c=>({...c}))});recordEventShown(ev);company.escalationQueue.push(ev);company.eventCooldown=360;if(!validationMode){renderDecisionEvent();}}
function applyDecision(){if(!company.pendingEvent)return;if(isInformationalExecutiveEvent(company.pendingEvent))return fileInformationalCommunication();recordMetricEvent("ceoDecisions");const ev=prepareStrategicDecision(company.pendingEvent),d=ev.choices[company.selected],comm=company.pendingCommunication||eventCommunication(ev),archivedMemo=archiveCommunication(ev,d,comm);applyLeadershipFootprint(ev,d);const delayedOutcome=evaluateStrategicOutcome(ev,d),thread=createDecisionThread(ev,d,comm,delayedOutcome,archivedMemo);if(ev.storyId)addStoryBeat(ev.storyId,`CEO chose: ${d.title}.`,"decision");startPolicyTransition(d.directive,d.days||0,d.title);Object.entries(d.effect||{}).forEach(([k,v])=>{if(k==="valuation"){addValuationShock(v*.35,`Market reaction to CEO decision: ${d.title}`,ev.id,20);return;}if(k==="customers"){applyCustomerDelta(v*.35,d.title,ev.id);return;}const systemic=["board","trust","quality","integration"].includes(k);company[k]=(company[k]||0)+v*(systemic?.35:1);});adjustCulture(d.culture||{});employees.forEach(e=>{
    if(d.directive==="cuts")addMemory(e,"CEO_CUTS","Leadership cut costs and increased pressure.","negative",14,"CEO");
    else if(d.directive==="people")addMemory(e,"CEO_SUPPORT","Leadership invested in employees.","positive",12,"CEO");
    else if(d.directive==="quality")addMemory(e,"CEO_QUALITY","Leadership protected product quality.","positive",9,"CEO");
    else if(d.directive==="speed")addMemory(e,"OVERTIME","Leadership accelerated the schedule.","negative",10,"CEO");
    adjustCEOOpinion(e,d.opinion||{});
    applyEmployeeEmotionDelta(e,{stressDelta:d.people?.stress||0,moraleDelta:d.people?.morale||0,reasonCode:"ceo-decision",sourceEventId:ev.id,exceptional:!!d.launch,ignoreCooldown:true});if(d.people?.relationship)Object.keys(e.relationship).forEach(id=>e.relationship[id]=clamp(e.relationship[id]+d.people.relationship,-100,100));});if(d.launch==="full"){company.phase="launched";company.pilotDays=0;company.log.push("The product launched to the full market.");recordWeeklyEvent("The product launched to the full market.","product",6);addValuationShock(company.quality>65&&company.integration>65?2.4:-1.8,"Full launch changed outside expectations","launch",35);}else if(d.launch==="pilot"){company.phase="pilot";company.pilotDays=0;company.log.push("A limited customer pilot began.");recordWeeklyEvent("A limited customer pilot began.","product",5);addValuationShock(.8,"Limited pilot created market learning","pilot",25);}else if(d.launch==="extend"){company.phase="pilot";company.pilotDays=0;company.log.push("The customer pilot was extended for more learning.");}else if(d.launch==="repair"){company.phase="customer trial";company.pilotDays=0;company.log.push("Commercial expansion paused while the team repairs the product.");addValuationShock(-.6,"Commercial expansion paused for repair","pilot-repair",18);}if(d.projectDecision){applyProjectDecision(d.projectDecision);if(d.projectDecision.action==="cancel"||d.projectDecision.action==="reject")addValuationShock(-1.2,`Project ${d.projectDecision.action} changed portfolio expectations`,d.projectDecision.id,28);else if(["expand","validate","continue"].includes(d.projectDecision.action))addValuationShock(.45,`Project ${d.projectDecision.action} signaled portfolio commitment`,d.projectDecision.id,18);}if(d.portfolioAction){applyPortfolioAction(d.portfolioAction);}if(d.customerStrategy){applyCustomerStrategyDecision(d.customerStrategy);}if(d.hiringException){applyHiringExceptionDecision(d.hiringException);}if(d.hiringPolicy){applyHiringPolicyDecision(d.hiringPolicy);}if(d.fundraising){applyFundraisingDecision(d.fundraising);}if(d.performance){resolvePerformance(d.performance);}if(d.hire){if(d.hire==="specialist"){const approvedRole=d.hireRole||(company.openRoles||[])[0]||roleForDepartmentHire(d.hireDept||"software");startRecruiting(approvedRole,d.hire,d.hireDept||roleDepartment(approvedRole),{backfill:!d.hireRole&&(company.openRoles||[]).includes(approvedRole),source:d.hireRole?"approved-headcount":"vacancy"});}else resolveHiring(d.hire,d.hireRole);}if(d.deferHiring){company.hiringRequests.unshift({day:company.day,department:d.deferHiring.dept,role:d.deferHiring.role,status:"delayed"});employees.filter(e=>e.active&&roleDepartment(e.role)===d.deferHiring.dept).forEach(e=>adjustCEOOpinion(e,{support:-1,fairness:-1}));}if(d.rejectHiring){company.hiringRequests.unshift({day:company.day,department:d.rejectHiring.dept,role:d.rejectHiring.role,status:"rejected"});employees.filter(e=>e.active&&roleDepartment(e.role)===d.rejectHiring.dept).forEach(e=>{applyEmployeeEmotionDelta(e,{stressDelta:3,reasonCode:"rejected-hiring",sourceEventId:ev.id,ignoreCooldown:true});adjustCEOOpinion(e,{support:-3,trust:-1});});}if(d.layoff){executeLayoffPlan(d.layoff.count||1,!!d.layoff.voluntary);addValuationShock(-1.2,"Layoffs increased perceived execution risk","layoff",30);company.leadershipReputation=clamp((company.leadershipReputation??50)-2,0,100);}if(d.rejectLayoff){addBoardStrike("CEO rejected restructuring during financial pressure");}ensureBibleSystems?.();if(d.supply&&company.manufacturing){company.manufacturing.supplyRisk=clamp(company.manufacturing.supplyRisk+(d.supply.risk||0),0,100);company.manufacturing.readiness=clamp(company.manufacturing.readiness+(d.supply.readiness||0),0,100);company.manufacturing.yield=clamp(company.manufacturing.yield+(d.supply.yield||0),0,100);}if(d.shareholders)applyInvestorEffect(d.shareholders);if(ev.sourceMessageId){const msg=(company.employeeMessages||[]).find(m=>m.id===ev.sourceMessageId);if(msg)msg.status="resolved-by-ceo";}if(d.supply||d.shareholders||ev.sourceMessageId||d.layoff||d.rejectLayoff||d.deferHiring||d.rejectHiring||d.hire||d.hiringException||d.hiringPolicy||d.fundraising||d.projectDecision||d.portfolioAction)recordHistory(`CEO decision resolved ${ev.title}: ${d.title}.`,"leadership",4);
learnFromDecision(ev,d);if(!ev.repeatable&&!company.completedEvents.includes(ev.id))company.completedEvents.push(ev.id);company.log.push(`CEO decision: ${d.title}. A longer-term outcome is expected around day ${delayedOutcome.dueDay+1}.`);recordWeeklyEvent(`CEO decision: ${d.title}.`,"leadership",4,{eventId:ev.id,choiceTitle:d.title,decisionTitle:d.title,projectId:d.projectDecision?.id||delayedOutcome?.projectImpact?.projectId||null,workItemId:delayedOutcome?.workImpact?.workItemId||null,subject:ev.title,strategy:d.strategy||inferDecisionStrategy(d)});recordHistory(`CEO decision: ${d.title}.`,"leadership",4);if(thread)recordHistory(`Decision thread opened for "${d.title}" from ${comm.from}.`,"leadership",3);company.pendingEvent=null;company.pendingCommunication=null;company.eventCooldown=720;company.paused=false;if(!validationMode){updatePauseButton();saveGame();renderDecisionEvent();render();}}


function resolvePerformance(mode){
  const target=performanceTarget();
  if(!target)return;
  target.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(target.performance||{})};
  target.performance.lastReviewDay=company.day;
  target.performance.reviewRiskDays=0;
  if(mode==="coach"){
    recordMetricEvent("coaching");
    target.focus=clamp(target.focus+14,0,100);applyEmployeeEmotionDelta(target,{moraleDelta:12,stressDelta:-10,reasonCode:"performance-coaching",sourceEventId:`performance-${target.id}-${company.day}`,exceptional:true});target.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999,...(target.performance||{})};target.performance.coachingDays=12;
    target.careerHistory.push(`Received CEO-backed coaching on day ${company.day}`);
    company.log.push(`${target.name} received coaching instead of disciplinary action.`);
    recordHistory(`${target.name} was coached through a performance gap.`,"people",3);
  }else if(mode==="reassign"){
    target.focus=clamp(target.focus+7,0,100);applyEmployeeEmotionDelta(target,{stressDelta:5,reasonCode:"performance-reassignment",sourceEventId:`performance-${target.id}-${company.day}`});company.integration+=2;company.quality+=2;
    target.careerHistory.push(`Responsibilities were reassigned on day ${company.day}`);
    company.log.push(`${target.name}'s responsibilities were reorganized.`);
    recordHistory(`${target.name}'s responsibilities were reorganized.`,"people",3);
  }else if(mode==="fire"){
    target.active=false;target.offsite=true;target.action="fired";recordMetricEvent("firings");target.careerHistory.push(`Fired on day ${company.day}`);
    if(!company.openRoles.includes(target.role))company.openRoles.push(target.role);
    employees.filter(e=>e.active).forEach(e=>adjustCEOOpinion(e,{fear:7,fairness:-5,trust:-3,support:-4}));
    company.log.push(`${target.name}, the ${target.role}, was fired after a performance escalation.`);
    recordWeeklyEvent(`${target.name}, the ${target.role}, was fired after a performance escalation.`,"people",5);
    recordHistory(`${target.name} was fired after a performance escalation.`,"people",5);
  }
}
function generateHireName(role){
  const first=["Elena","Daniel","Jin","Amara","Victor","Nina","Owen","Lina","Mateo","Grace","Hana","Julian"];
  const last=["Chen","Patel","Morgan","Kim","Rivera","Okafor","Singh","Bennett","Ito","Garcia","Khan","Wilson"];
  const used=new Set(employees.map(e=>e.name));
  for(let i=0;i<40;i++){
    const name=`${first[Math.floor(simulationRandom()*first.length)]} ${last[Math.floor(simulationRandom()*last.length)]}`;
    if(!used.has(name))return name;
  }
  return `${role} Hire ${company.day+1}`;
}

function resolveHiring(mode,roleOverride=null){
  if(!Array.isArray(company.openRoles))company.openRoles=[];
  const role=canonicalRole(roleOverride||company.openRoles[0]);
  if(!role)return;
  const resigned=employees.find(e=>!e.active&&e.role===role);

  if(mode==="specialist"){
    const slot=resigned?.id??employees.length;
    const replacement=makeEmployee(Math.min(slot,names.length-1));
    replacement.id=slot;
    replacement.name=generateHireName(role);
    replacement.role=role;
    replacement.traits=[...traits[Math.floor(simulationRandom()*traits.length)]];
    replacement.morale=70+simulationRandom()*10;
    replacement.focus=68+simulationRandom()*12;
    replacement.stress=18+simulationRandom()*10;
    replacement.relationship={};replacement.opinionOfCEO={trust:58,fairness:56,competence:60,support:55,fear:16};replacement.careerLevel=1;replacement.careerHistory=[`Hired as ${role} on day ${company.day}`];replacement.beliefs={};replacement.dailyBriefing=null;replacement.currentIntention=null;replacement.skills=baseSkillsForRole(role);replacement.performance={recentOutput:0,absenceDays:0,qualityMistakes:0,coachingDays:0,reviewRiskDays:0,lastReviewDay:-999};replacement.learning={caution:0,mentor:0,risk:0,collaboration:0,helpSeeking:0,testing:0,focusWork:0,reporting:0,suppression:0,initiative:0,recovery:0,contextualPreferences:{}};replacement.actionOutcomeContext=null;replacement.learnedLessons=emptyLessonVector();replacement.lessonAcceptance=null;replacement.joinedDay=company.day;replacement.age=25+Math.floor(simulationRandom()*22);replacement.stayScore=72;replacement.retentionRisk=28;replacement.jobSearchDays=0;replacement.retirementReadiness=0;replacement.quarterlyReview=null;replacement.promotionExpectation=45;replacement.salarySatisfaction=68;replacement.recognitionSatisfaction=62;replacement.employment=defaultEmploymentForRole(role);replacement.retention={stayScore:72,riskLevel:"stable",searching:false,searchDays:0,lastReviewDay:-999,salarySatisfaction:68,careerSatisfaction:62,leadershipFit:58,cultureFit:62};replacement.careerLifecycle={age:replacement.age,yearsAtCompany:0,retirementReadiness:0,earlyRetirementInterest:0,plannedRetirementDay:null,successionRisk:0};replacement.active=true;replacement.offsite=false;replacement.sickDays=0;replacement.action="arriving";replacement.thought="Starting onboarding with the team.";replacement.actionMinutes=0;normalizeEmployeeRoleProfile(replacement);ensureEmployeePersonality(replacement,{force:true,salt:`hire-${company.day}-${role}-${slot}`});inheritInstitutionalLearning(replacement);
    employees.forEach(other=>{
      if(other.id!==replacement.id){
        replacement.relationship[other.id]=Math.round(simulationRandom()*18-4);
        other.relationship[replacement.id]=Math.round(simulationRandom()*18-4);
      }
    });
    employees[slot]=replacement;
    company.log.push(`${replacement.name} joined as the new ${role}.`);recordWeeklyEvent(`${replacement.name} joined as the new ${role}.`,"people",4);
    if(!validationMode)buildOffice();
  }else if(mode==="promote"){
    const candidate=employees.filter(e=>e.active).sort((a,b)=>(b.focus+b.achievements*8)-(a.focus+a.achievements*8))[0];
    if(candidate){
      candidate.achievements++;
      applyEmployeeEmotionDelta(candidate,{moraleDelta:8,stressDelta:12,reasonCode:"internal-promotion-coverage",sourceEventId:`promotion-coverage-${company.day}`,exceptional:true});
      company.log.push(`${candidate.name} was promoted to cover the ${role} responsibilities.`);
    }
  }else if(mode==="contractor"){
    company.integration+=4;
    company.quality+=2;
    company.log.push(`Contractors temporarily covered the ${role} vacancy.`);
  }

  const idx=company.openRoles.indexOf(role);if(idx>=0)company.openRoles.splice(idx,1);
}
function normalizeSimulationMetrics(metrics){
  const counters={actions:{},qualityMistakes:0,sickness:0,resignations:0,firings:0,coaching:0,ceoDecisions:0,executiveMemos:0,queuedEscalations:0,localIssues:0,collaborations:0,...(metrics?.counters||{})};
  counters.actions={...(metrics?.counters?.actions||{})};
  counters.qualityTelemetry={mistakesCreated:0,mistakesResolved:0,defectsReopened:0,verificationFailures:0,rushedWorkMistakes:0,stressRelatedMistakes:0,lowFocusMistakes:0,weakCultureMistakes:0,manufacturingDefects:0,reworkActions:0,...(metrics?.counters?.qualityTelemetry||{})};
  return {daily:Array.isArray(metrics?.daily)?metrics.daily.slice(-320):[],counters,lastBalance:metrics?.lastBalance||null};
}
function recordMetricEvent(type,key="count",amount=1){
  ensureBibleSystems?.();
  company.simulationMetrics=normalizeSimulationMetrics(company.simulationMetrics);
  const counters=company.simulationMetrics.counters;
  if(type==="action")counters.actions[key]=(counters.actions[key]||0)+amount;
  else counters[type]=(counters[type]||0)+amount;
}
function recordQualityTelemetry(reason="",severity=1){
  ensureBibleSystems?.();
  company.simulationMetrics=normalizeSimulationMetrics(company.simulationMetrics);
  const q=company.simulationMetrics.counters.qualityTelemetry;
  const text=String(reason).toLowerCase();
  q.mistakesCreated+=severity;
  if(text.includes("verification")||text.includes("failed pass")){q.verificationFailures+=severity;q.defectsReopened+=severity*.5;}
  if(text.includes("rushed")||company.directive==="speed")q.rushedWorkMistakes+=severity;
  if(text.includes("stress")||avgStress()>72)q.stressRelatedMistakes+=severity;
  if(text.includes("low focus")||employees.some(e=>e.active&&e.focus<36))q.lowFocusMistakes+=severity;
  if((company.culture?.qualityDiscipline||50)<45)q.weakCultureMistakes+=severity;
  if(text.includes("fulfillment")||text.includes("manufacturing"))q.manufacturingDefects+=severity;
}
function recordQualityResolution(amount=0){
  if(amount<=0)return;
  ensureBibleSystems?.();
  company.simulationMetrics=normalizeSimulationMetrics(company.simulationMetrics);
  const q=company.simulationMetrics.counters.qualityTelemetry;
  q.mistakesResolved+=amount;
  q.reworkActions+=amount;
}
function actionDiversityScore(actions){
  const total=Object.values(actions||{}).reduce((s,v)=>s+v,0);
  if(!total)return 0;
  const entropy=Object.values(actions).filter(Boolean).reduce((s,v)=>{const p=v/total;return s-p*Math.log2(p);},0);
  return Math.round(clamp(entropy/Math.log2(8)*100,0,100));
}
function learningSpread(){
  const keys=["caution","risk","collaboration","helpSeeking","testing","reporting","suppression","initiative","recovery"];
  const active=employees.filter(e=>e.active);
  const values=keys.map(k=>{
    const list=active.map(e=>Number(learningState(e)[k])||0);
    const avg=list.reduce((s,v)=>s+v,0)/Math.max(1,list.length);
    const variance=list.reduce((s,v)=>s+(v-avg)*(v-avg),0)/Math.max(1,list.length);
    return Math.sqrt(variance);
  });
  return Math.round(values.reduce((s,v)=>s+v,0)/Math.max(1,values.length)*10)/10;
}
function averageLearningMagnitude(){
  const keys=["caution","risk","collaboration","helpSeeking","testing","reporting","suppression","initiative","recovery"];
  const active=employees.filter(e=>e.active);
  return Math.round(active.reduce((s,e)=>s+keys.reduce((a,k)=>a+Math.abs(Number(learningState(e)[k])||0),0),0)/Math.max(1,active.length*keys.length)*10)/10;
}
function countRecentMessages(days=5){
  const since=company.day-days;
  return (company.employeeMessages||[]).filter(m=>(m.createdDay??0)>=since);
}
