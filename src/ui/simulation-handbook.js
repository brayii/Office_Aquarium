/*
  Simulation Handbook

  Player-facing handbook copy and behavior live here so the main simulation
  markup stays readable. Context help can open any section or topic through:

    openSimulationHandbook("projects", "project-health")

  Future UI controls may also call OfficeAquariumHandbook.open(section, topic).
*/

const SIMULATION_HANDBOOK_SECTIONS = [
  {
    id: "welcome",
    icon: "?",
    title: "Welcome",
    summary: "Office Aquarium is a living company. Your job is to lead it, not control every person.",
    topics: [
      {
        id: "lead-dont-command",
        title: "Lead, do not command",
        paragraphs: [
          "You are the CEO of an autonomous technology company. Employees choose their own work, solve routine problems, communicate, learn, and sometimes make mistakes.",
          "You set direction through executive decisions, project choices, hiring approval, policy, and crisis response. The organization decides how to carry that direction into daily work."
        ],
        callouts: [
          {
            type: "tip",
            label: "Start here",
            text: "Read Quick Start, then let the company run at 1x speed while you watch one full workday."
          }
        ],
        related: [
          { label: "Begin in two minutes", sectionId: "quick-start", topicId: "first-two-minutes" },
          { label: "What the CEO controls", sectionId: "your-role", topicId: "indirect-leadership" }
        ]
      },
      {
        id: "living-organization",
        title: "The office is alive",
        paragraphs: [
          "A quiet Inbox does not mean the simulation is idle. Teams handle many issues locally, employees form incomplete beliefs, managers review reports, and only strategic matters normally reach the CEO.",
          "Watch for patterns across the Live Office, employee profiles, Reports, History, CEO Communications, and the Weekly Report. Each view describes the same company from a different angle."
        ],
        callouts: [
          {
            type: "note",
            label: "Core idea",
            text: "A company is a collection of people, not numbers. The numbers report what those people and systems are producing."
          }
        ],
        related: [
          { label: "Understand the simulation loop", sectionId: "understanding-the-simulation", topicId: "simulation-loop" },
          { label: "Tour the interface", sectionId: "user-interface-guide", topicId: "three-workspaces" }
        ]
      }
    ]
  },
  {
    id: "quick-start",
    icon: ">",
    title: "Quick Start",
    summary: "Start a company, read its signals, and make your first decision without trying to micromanage.",
    topics: [
      {
        id: "first-two-minutes",
        title: "Your first two minutes",
        steps: [
          "Choose Start New Company, or Continue Company if this device already has a save.",
          "Run at 1x and watch where employees go, what they do, and what they say.",
          "Select two employees to compare their current work, morale, stress, skills, and thoughts.",
          "Open Reports and scan the top metrics, department briefings, Project Portfolio, and Workforce pressure.",
          "Wait for a CEO email or memo. Queued messages do not open or pause the game automatically.",
          "Open the message. The clock pauses while you read; compare the three choices, record your decision, and let time pass.",
          "Later, read History and the Weekly Report to see what changed."
        ],
        callouts: [
          {
            type: "tip",
            label: "Good first habit",
            text: "Pause when reading. Use 4x or 12x only when you are comfortable with the current company state."
          }
        ],
        related: [
          { label: "Read CEO messages", sectionId: "your-role", topicId: "ceo-communications" },
          { label: "Read projects", sectionId: "projects", topicId: "project-health" }
        ]
      },
      {
        id: "essential-controls",
        title: "Essential controls",
        table: {
          headers: ["Control", "What it does", "When to use it"],
          rows: [
            ["Pause / Resume", "Stops or continues simulated time.", "Pause to read a long memo or inspect the company."],
            ["1x", "Runs at normal pace.", "Use while learning the office rhythm."],
            ["4x", "Moves routine periods faster.", "Use when conditions are stable."],
            ["12x", "Advances time very quickly.", "Use carefully during long waits or testing."],
            ["Gear", "Opens sound, this handbook, and restart.", "Use for preferences or a fresh company."],
            ["Sound", "Selects Muted, Alerts Only, Music Only, or Music + Alerts.", "Choose the mix you want; missing audio never stops the game."]
          ]
        },
        callouts: [
          {
            type: "warning",
            label: "Restart warning",
            text: "Restart Company replaces the company saved on this device after you confirm."
          }
        ],
        related: [
          { label: "Mobile controls", sectionId: "user-interface-guide", topicId: "mobile-and-settings" },
          { label: "Saving and sound", sectionId: "faq", topicId: "save-mobile-sound" }
        ]
      },
      {
        id: "first-decision",
        title: "Make your first decision",
        paragraphs: [
          "Open a message in CEO Communications. The simulation pauses while the active email or memo is open so you can read without losing time. The message explains the situation first, then provides evidence, uncertainty, recommendations, and department viewpoints.",
          "Select one concrete action, then choose Record CEO Decision. Filing or recording the message resumes the clock. The organization carries the decision out over time, and some outcomes are delayed, uncertain, or different from the sender's forecast."
        ],
        bullets: [
          "Check which project, department, customer, or policy is affected.",
          "Look for staffing, schedule, cash, quality, customer, and people trade-offs.",
          "Remember that each department has its own priorities and may be wrong.",
          "Review the old message later to see what you chose."
        ],
        related: [
          { label: "Why advice can be wrong", sectionId: "understanding-the-simulation", topicId: "imperfect-information" },
          { label: "Leadership consequences", sectionId: "leadership", topicId: "ceo-footprint" }
        ]
      }
    ]
  },
  {
    id: "understanding-the-simulation",
    icon: "~",
    title: "Understanding the Simulation",
    summary: "The company generates work and information, employees interpret it, and consequences shape future behavior.",
    topics: [
      {
        id: "simulation-loop",
        title: "How the company thinks",
        paragraphs: [
          "Office Aquarium runs an offline, rule-based simulation. It does not require an API key or an online language model.",
          "Employees receive partial information based on their role, work, relationships, meetings, reports, and experience. They choose actions from their needs, beliefs, goals, skills, workload, and learned preferences."
        ],
        flow: [
          "Projects and company conditions create work",
          "Employees observe local evidence",
          "Employees and managers act, communicate, and report",
          "Teams solve routine issues or escalate strategic ones",
          "The CEO makes a decision",
          "Short- and long-term outcomes are measured",
          "Employees and the institution may learn from real results"
        ],
        related: [
          { label: "Employee learning", sectionId: "advanced-systems", topicId: "learning-and-memory" },
          { label: "Grounded conversations", sectionId: "conversations", topicId: "why-people-talk" }
        ]
      },
      {
        id: "imperfect-information",
        title: "Information is imperfect",
        paragraphs: [
          "Employees, managers, departments, customers, investors, the Board, and the CEO do not see the same facts. A report can be early, late, cautious, optimistic, incomplete, biased, or wrong.",
          "Recommendations are scored from each sender's evidence and priorities. Finance may protect runway, Engineering may protect feasibility, Product may protect customer value, People may protect workload, and the Board may protect leadership credibility."
        ],
        callouts: [
          {
            type: "example",
            label: "Example",
            text: "A project can look late to Product, recoverable to Engineering, unaffordable to Finance, and dangerous to People at the same time."
          }
        ],
        related: [
          { label: "Read executive advice", sectionId: "your-role", topicId: "ceo-communications" },
          { label: "Understand hidden systems", sectionId: "advanced-systems", topicId: "derived-health" }
        ]
      },
      {
        id: "cause-and-effect",
        title: "Look for cause and effect",
        paragraphs: [
          "Most important outcomes are chains, not isolated rolls. A staffing shortage can create backlog, pressure, mistakes, blockers, schedule risk, a manager report, a CEO decision, and a later customer consequence.",
          "History, Story Threads, old CEO messages, and the Weekly Report help you connect those events."
        ],
        related: [
          { label: "Use History", sectionId: "user-interface-guide", topicId: "history-and-weekly-report" },
          { label: "Advanced story systems", sectionId: "advanced-systems", topicId: "story-time-scales" }
        ]
      }
    ]
  },
  {
    id: "your-role",
    icon: "@",
    title: "Your Role",
    summary: "You approve strategic actions and create conditions. Employees and departments execute the work.",
    topics: [
      {
        id: "indirect-leadership",
        title: "What you control",
        table: {
          headers: ["You decide", "The organization decides"],
          rows: [
            ["Strategic project direction", "Daily tasks, methods, collaboration, and testing"],
            ["Headcount and hiring policy", "Ordinary recruiting, interviews, offers, and onboarding"],
            ["Budget, runway, scope, and launch trade-offs", "How teams distribute routine work"],
            ["Company-wide policy and crisis response", "When an employee rests, asks for help, reports, or resigns"],
            ["CEO-level coaching, performance, or restructuring choices", "Routine management, mentoring, and local problem solving"]
          ]
        },
        callouts: [
          {
            type: "note",
            label: "CEO rule",
            text: "You influence behavior through conditions and decisions. You do not directly set morale, stress, productivity, loyalty, or learning."
          }
        ],
        related: [
          { label: "Hiring authority", sectionId: "hiring", topicId: "headcount-not-candidates" },
          { label: "Project decisions", sectionId: "projects", topicId: "project-decisions" }
        ]
      },
      {
        id: "ceo-communications",
        title: "CEO Communications",
        paragraphs: [
          "The Inbox holds current emails and memos. Nothing opens or pauses the company automatically. Select a message when you are ready; the clock pauses while that active communication is open.",
          "Decision messages provide exactly three actions. Informational follow-ups clearly say that no reply is needed. Filing or recording the message resumes the simulation, and the message moves to Old Messages with your selected action and later outcomes when available."
        ],
        bullets: [
          "Inbox: unread and active communications.",
          "Old Messages: read, handled, and completed communications.",
          "Deleted filter: messages removed from the normal old-message list.",
          "Record CEO Decision: applies the selected choice only after you confirm it."
        ],
        callouts: [
          {
            type: "warning",
            label: "Advice is not truth",
            text: "A strong recommendation is still one executive's judgment. Compare it with Reports, project state, employee pressure, and recent history."
          }
        ],
        related: [
          { label: "Read imperfect advice", sectionId: "understanding-the-simulation", topicId: "imperfect-information" },
          { label: "Old messages and accountability", sectionId: "advanced-systems", topicId: "message-accountability" }
        ]
      },
      {
        id: "decision-rhythm",
        title: "Choose what deserves attention",
        paragraphs: [
          "The company is designed to handle ordinary work without you. CEO messages should focus on strategy, budget, hiring authority, launch timing, major people issues, company-wide policy, governance, and serious risk.",
          "Do not chase every daily movement. Read trends, decide when authority is needed, and give consequences time to appear."
        ],
        related: [
          { label: "Beginner decision habits", sectionId: "beginner-tips", topicId: "read-before-reacting" },
          { label: "Winning over time", sectionId: "winning", topicId: "what-success-means" }
        ]
      }
    ]
  },
  {
    id: "user-interface-guide",
    icon: "#",
    title: "User Interface Guide",
    summary: "Every major screen is a different lens on the same company.",
    topics: [
      {
        id: "startup-and-status",
        title: "Startup and top status",
        table: {
          headers: ["Area", "Why it matters", "When to use it"],
          rows: [
            ["Continue Company", "Loads the save stored on this device.", "Use when returning to an existing company."],
            ["Start New Company", "Creates fresh employees, relationships, market conditions, and history.", "Use for a new run; it replaces the current save after confirmation."],
            ["Company Time", "Shows the simulated day and time.", "Use to judge deadlines, workdays, reviews, and hiring waits."],
            ["Cash", "Funds payroll, projects, hiring, support, manufacturing, and recovery.", "Watch whenever spending, runway, or growth is discussed."],
            ["Board Confidence", "Shows how much the Board trusts your leadership.", "Watch after major outcomes, crises, and repeated misses."],
            ["Company Risk", "Summarizes broad company danger.", "Investigate when it rises; use Reports to find the cause."]
          ]
        },
        related: [
          { label: "How you lose", sectionId: "winning", topicId: "failure-and-recovery" },
          { label: "Advanced operating health", sectionId: "advanced-systems", topicId: "derived-health" }
        ]
      },
      {
        id: "three-workspaces",
        title: "Live Office, CEO Communications, and People",
        table: {
          headers: ["Area", "What it is", "When to use it"],
          rows: [
            ["Live Office", "A real-time view of employee location, action, thoughts, and visible conversations.", "Watch current behavior; select a person or speech bubble for context."],
            ["Time and gear controls", "Pause, speed, sound, handbook, and restart controls.", "Adjust pace or preferences without changing employee decisions."],
            ["CEO Communications", "Inbox and Old Messages for executive email and memos.", "Open when leadership is needed or review a past choice."],
            ["People", "A scrollable list of active employees with role, action, morale, and stress.", "Scan for individual pressure, then open a profile for detail."]
          ]
        },
        related: [
          { label: "Read employee profiles", sectionId: "reading-employees", topicId: "profile-fields" },
          { label: "Read CEO communications", sectionId: "your-role", topicId: "ceo-communications" }
        ]
      },
      {
        id: "reports-workspace",
        title: "Reports",
        paragraphs: [
          "Reports is the current-state workspace. The View menu can show Overview, Projects, Workforce, Story, or All."
        ],
        table: {
          headers: ["Report area", "Why it matters", "When to use it"],
          rows: [
            ["Valuation Trend", "Shows the market's estimate across 1D, 1W, 1M, 3M, YTD, 1Y, or All.", "Use to see direction and volatility, not to control valuation directly."],
            ["Operating metrics", "Summarize product health, morale, trust, customers, revenue, manufacturing, investors, cohesion, and sentiment.", "Scan daily, then investigate weak or N/A values."],
            ["Department Briefings", "Show priority, pressure, backlog, blockers, risk, staffing, and knowledge by team.", "Use before approving project or hiring choices."],
            ["Operational Dashboard", "Shows recent trends and cross-company signals.", "Use to distinguish a temporary dip from a worsening pattern."],
            ["Project Portfolio", "Shows proposals, active work, paused work, archive, staffing, budget, risk, timing, and commercial status.", "Use for project reviews and resource trade-offs."],
            ["Workforce and Financial Pressure", "Shows payroll, costs, runway, staffing signals, recruiting, onboarding, retention, and leadership scale.", "Use before hiring, freezing, restructuring, or expanding."],
            ["Internal Reports", "Shows selected employee and department observations.", "Use to understand what the organization noticed below CEO level."],
            ["People and Culture", "Shows Culture, Groups, Network, and Leadership evidence.", "Use to understand how repeated behavior is shaping the organization."]
          ]
        },
        related: [
          { label: "Project metrics", sectionId: "projects", topicId: "project-health" },
          { label: "Hiring pipeline", sectionId: "hiring", topicId: "hiring-pipeline" },
          { label: "Culture views", sectionId: "office-culture", topicId: "culture-views" }
        ]
      },
      {
        id: "history-and-weekly-report",
        title: "History and Weekly Report",
        table: {
          headers: ["Area", "Why it matters", "When to use it"],
          rows: [
            ["Company Story", "Records meaningful events as they happen.", "Use for a recent chronological account."],
            ["Organizational Dynamics", "Summarizes leadership, momentum, retention, reviews, and sustained crisis signals.", "Use to understand slow company-wide change."],
            ["Story Threads", "Connect related causes and consequences.", "Use when you want to know why an outcome happened."],
            ["Lessons", "Shows institutional learning supported by outcomes.", "Use to see which past patterns may influence future behavior."],
            ["Company History", "Preserves major milestones and turning points.", "Use to understand the company's long-term identity."],
            ["Weekly Report", "Publishes a newspaper from real events every five simulated workdays.", "Use for a readable recap of decisions, risks, people, customers, money, and ongoing stories."]
          ]
        },
        related: [
          { label: "Story time scales", sectionId: "advanced-systems", topicId: "story-time-scales" },
          { label: "Cause and effect", sectionId: "understanding-the-simulation", topicId: "cause-and-effect" }
        ]
      },
      {
        id: "mobile-and-settings",
        title: "Mobile and settings",
        paragraphs: [
          "On small screens, use Office, Employees, CEO Inbox, Company, and Paper tabs. Panels stack vertically so each area remains readable.",
          "The gear menu contains Sound, Simulation Handbook, and Restart Company. The game continues safely when audio files are missing or the browser blocks sound."
        ],
        bullets: [
          "Office opens the live workplace.",
          "Employees opens the employee list.",
          "CEO Inbox opens current communications.",
          "Company opens Reports.",
          "Paper opens the Weekly Report."
        ],
        related: [
          { label: "Essential controls", sectionId: "quick-start", topicId: "essential-controls" },
          { label: "Save and audio help", sectionId: "faq", topicId: "save-mobile-sound" }
        ]
      }
    ]
  },
  {
    id: "reading-employees",
    icon: "i",
    title: "Reading Employees",
    summary: "Employee profiles combine current condition, work, beliefs, relationships, memories, and leadership evidence.",
    topics: [
      {
        id: "profile-fields",
        title: "Tasks, skills, workload, and thoughts",
        table: {
          headers: ["Signal", "What it means", "Why it matters"],
          rows: [
            ["Current action and task", "What the employee is doing now and which work item it supports.", "Shows immediate behavior, not a permanent assignment."],
            ["Skills", "Role-specific technical, communication, and leadership capability.", "Affects useful work, collaboration, mentoring, and role fit."],
            ["Workload", "Assigned project demand compared with practical capacity.", "High sustained load can create backlog, stress, mistakes, and delays."],
            ["Focus and energy", "Short-term ability to work effectively.", "Low values may reduce output or make recovery more useful."],
            ["Thought", "The employee's current interpretation or concern.", "Provides a readable clue, not perfect access to every hidden belief."],
            ["Beliefs and confidence", "What the employee thinks is true and how certain they are.", "Explains disagreement, reporting, caution, and mistakes."]
          ]
        },
        related: [
          { label: "Project staffing", sectionId: "projects", topicId: "project-health" },
          { label: "Imperfect information", sectionId: "understanding-the-simulation", topicId: "imperfect-information" }
        ]
      },
      {
        id: "stress-morale",
        title: "Stress, morale, burnout, and workload",
        paragraphs: [
          "Stress is current pressure. Morale is how the employee feels about working at the company. They influence each other, but they are not the same value.",
          "Sustained overload, conflict, poor leadership, repeated misses, low recovery, and difficult company conditions can raise burnout risk. Breaks, useful help, fair decisions, progress, recovery, and supportive relationships can help."
        ],
        flow: [
          "Workload or conflict creates pressure",
          "Stress rises and focus may fall",
          "Mistakes, absence, or lower output can appear",
          "Morale and trust may decline",
          "Sustained pressure can become burnout or retention risk"
        ],
        callouts: [
          {
            type: "warning",
            label: "Watch the pattern",
            text: "One hard day is not automatically a crisis. Several overloaded employees, persistent backlog, failed recruiting, and worsening delivery are much more serious."
          }
        ],
        related: [
          { label: "Staffing pressure", sectionId: "hiring", topicId: "staffing-signals" },
          { label: "Culture and wellbeing", sectionId: "office-culture", topicId: "how-culture-emerges" },
          { label: "Crisis recovery", sectionId: "winning", topicId: "failure-and-recovery" }
        ]
      },
      {
        id: "relationships-memories",
        title: "Relationships, memories, and leadership",
        paragraphs: [
          "Professional relationships grow from real encounters, help, collaboration, pressure, disagreement, recognition, repair, and repeated shared outcomes. Sharing a room alone is not enough.",
          "Memories are selective and directional. Two employees may remember the same event differently. Strong memories can affect future comfort, trust, stress, communication, and interpretation.",
          "Leadership includes formal authority and earned influence. A manager can have authority without credibility, while a specialist can become an informal leader through reliable help, mentoring, communication, and conflict repair."
        ],
        related: [
          { label: "Conversation behavior", sectionId: "conversations", topicId: "conversation-lifecycle" },
          { label: "Formal and informal leadership", sectionId: "leadership", topicId: "formal-and-informal" },
          { label: "Culture evidence", sectionId: "office-culture", topicId: "culture-views" }
        ]
      },
      {
        id: "speech-and-thoughts",
        title: "Thoughts and speech bubbles",
        paragraphs: [
          "Thoughts describe an employee's current focus or interpretation. Speech bubbles appear only when a real simulation event gives employees a grounded reason to talk.",
          "Select an employee for a full profile. Select a speech bubble for a larger conversation view with the participants, topic, and available context."
        ],
        related: [
          { label: "Why conversations happen", sectionId: "conversations", topicId: "why-people-talk" },
          { label: "Live Office guide", sectionId: "user-interface-guide", topicId: "three-workspaces" }
        ]
      }
    ]
  },
  {
    id: "conversations",
    icon: "...",
    title: "Conversations",
    summary: "Visible dialogue comes from real work, social, leadership, and company events.",
    topics: [
      {
        id: "why-people-talk",
        title: "Why people talk",
        paragraphs: [
          "Conversations are not random decoration. A grounded trigger must exist, such as current work, a help request, blocker, meeting, deadline, mentoring assignment, recognition, conflict, repair attempt, company news, or shared success.",
          "Personality, relationship history, current emotion, privacy, role, and recent wording influence how the exchange sounds. Employees do not learn new sentences like a language model; they learn preferences and context that select and shape authored dialogue."
        ],
        callouts: [
          {
            type: "note",
            label: "What learning changes",
            text: "Experience can change who speaks, when they speak, what topic they choose, whether they ask for help, and which tone fits. It does not invent unrestricted text."
          }
        ],
        related: [
          { label: "Employee learning", sectionId: "advanced-systems", topicId: "learning-and-memory" },
          { label: "Relationships and memories", sectionId: "reading-employees", topicId: "relationships-memories" }
        ]
      },
      {
        id: "conversation-lifecycle",
        title: "What a conversation does",
        flow: [
          "A real trigger becomes available",
          "A suitable partner and moment are selected",
          "Employees approach and face one another",
          "They exchange several context-aware lines",
          "The conversation may create a remembered social experience",
          "They say goodbye and return to prior work"
        ],
        paragraphs: [
          "Critical work is protected from irrelevant interruptions. Recent pair and template history reduces repetition. Some conversations remain private, and confidential conversations never appear to the CEO."
        ],
        related: [
          { label: "Read speech bubbles", sectionId: "reading-employees", topicId: "speech-and-thoughts" },
          { label: "Office culture", sectionId: "office-culture", topicId: "how-culture-emerges" }
        ]
      },
      {
        id: "conversation-meaning",
        title: "How to interpret dialogue",
        bullets: [
          "A help exchange can reveal a blocker, skill gap, or trusted working relationship.",
          "Recognition can support morale, reputation, and leadership evidence.",
          "Repeated tension can reveal professional friction or unresolved pressure.",
          "An apology or clarification can attempt repair, but the other employee may not accept it.",
          "Casual dialogue can build familiarity without instantly creating friendship or productivity."
        ],
        callouts: [
          {
            type: "tip",
            label: "Use dialogue as a clue",
            text: "Check the employee profile, project, department briefing, or Story Thread before treating one conversation as the whole truth."
          }
        ],
        related: [
          { label: "Read employee evidence", sectionId: "reading-employees", topicId: "profile-fields" },
          { label: "Culture views", sectionId: "office-culture", topicId: "culture-views" }
        ]
      }
    ]
  },
  {
    id: "projects",
    icon: "%",
    title: "Projects",
    summary: "Projects create work, staffing demand, blockers, deadlines, quality risk, and future products.",
    topics: [
      {
        id: "project-lifecycle",
        title: "From proposal to outcome",
        flow: [
          "The organization proposes an initiative",
          "The CEO receives a project memo",
          "Approved work enters the active portfolio",
          "Employees advance milestones and work items",
          "Blockers, backlog, staffing, quality, and risk affect execution",
          "Development completes and enters the archive",
          "Commercial review determines whether it generates customers or revenue"
        ],
        paragraphs: [
          "A completed project is not automatically a successful product. It may become a commercial offering, pilot, internal asset, research result, merged capability, or cancelled effort."
        ],
        related: [
          { label: "Project decisions", sectionId: "projects", topicId: "project-decisions" },
          { label: "Customers and revenue", sectionId: "advanced-systems", topicId: "market-and-customers" }
        ]
      },
      {
        id: "project-health",
        title: "Milestones, blockers, deadlines, staffing, and quality",
        table: {
          headers: ["Project signal", "What it means", "What to watch"],
          rows: [
            ["Progress and stage", "How much planned development is complete and where work currently sits.", "Progress can be slow when work is hard, blocked, understaffed, or in verification."],
            ["Milestones", "Meaningful checkpoints within the plan.", "Missed milestones can increase schedule risk even when the main percentage moves."],
            ["Blockers and backlog", "Work that cannot proceed and work waiting to be done.", "They should arise from real staffing, dependencies, skill gaps, defects, pressure, and project conditions."],
            ["Deadline and timing", "The organization's estimate of on-time, delayed, or ahead-of-plan delivery.", "Forecasts are role-specific estimates and may be wrong."],
            ["Required staff and allocation", "Needed full-time-equivalent effort compared with actual project assignment.", "Company headcount alone does not mean the project is staffed."],
            ["Quality", "The reliability of completed work and verification.", "Rushed work, weak focus, stress, defects, and poor testing can reduce it."],
            ["Health, risk, and confidence", "A derived view of execution, staffing, schedule, quality, conditions, and uncertainty.", "Use the breakdown, not one number, before deciding."]
          ]
        },
        callouts: [
          {
            type: "warning",
            label: "Recovery is work",
            text: "A delayed project can recover through staffing, scope, quality, blocker resolution, planning, or time. No decision guarantees an instant percentage increase."
          }
        ],
        related: [
          { label: "Staffing signals", sectionId: "hiring", topicId: "staffing-signals" },
          { label: "Stress and workload", sectionId: "reading-employees", topicId: "stress-morale" }
        ]
      },
      {
        id: "project-decisions",
        title: "What project buttons do",
        table: {
          headers: ["Action", "What happens"],
          rows: [
            ["New initiative", "Requests a hardware, software, business, or internal proposal."],
            ["Memo / Review", "Asks the organization to prepare an executive recommendation."],
            ["Pause", "Creates a CEO decision; it does not stop work until approved."],
            ["Resume", "Creates a decision to restart paused work."],
            ["Cancel", "Creates a decision to end active work. The idea may return later if new evidence makes it relevant."],
            ["Commercial Review", "Asks how completed work should create customer, revenue, strategic, or internal value."]
          ]
        },
        paragraphs: [
          "Project controls route through CEO Communications because they are strategic decisions. The email should name the affected project, explain the current state, and present concrete actions."
        ],
        related: [
          { label: "Read CEO communications", sectionId: "your-role", topicId: "ceo-communications" },
          { label: "Commercial value", sectionId: "advanced-systems", topicId: "market-and-customers" }
        ]
      }
    ]
  },
  {
    id: "hiring",
    icon: "+",
    title: "Hiring",
    summary: "Projects and operating scale create staffing needs. The CEO approves headcount; HR runs the normal pipeline.",
    topics: [
      {
        id: "staffing-signals",
        title: "Where hiring demand comes from",
        paragraphs: [
          "Staffing demand is generated by actual project allocation, workload, backlog, blockers, missing skills, vacancies, customer support, manufacturing, management span, company scale, and succession needs.",
          "A staffing signal is not always an approved job. It may still be under department, Finance, or People review."
        ],
        table: {
          headers: ["Signal", "Meaning"],
          rows: [
            ["Staffing need", "The company believes more capacity or a missing role is needed."],
            ["CEO approval", "A reviewed headcount request is waiting for your decision."],
            ["Recruiting", "An approved role is moving through search, interviews, or offer."],
            ["Paused or suppressed", "Policy or conditions are preventing normal recruiting."],
            ["Onboarding", "A hire has joined but is not yet fully productive."],
            ["Vacancy or backfill", "A departed employee left a role that may need replacement."]
          ]
        },
        related: [
          { label: "Project staffing", sectionId: "projects", topicId: "project-health" },
          { label: "Stress and workload", sectionId: "reading-employees", topicId: "stress-morale" }
        ]
      },
      {
        id: "hiring-pipeline",
        title: "Recruiting and onboarding",
        flow: [
          "Need identified",
          "Department review",
          "Finance and People review",
          "CEO approval when authority is required",
          "Requisition and candidate search",
          "Interviews and offer",
          "Offer accepted",
          "Onboarding with gradual productivity",
          "Active employee"
        ],
        paragraphs: [
          "Recruiting time depends on role difficulty, labor competition, company reputation, salary competitiveness, policy, and previous search attempts. Offers can fail, searches can restart, and rare exceptions can return to the CEO.",
          "Onboarding is gradual. Mentor quality, culture, documentation, workload, stress, and institutional knowledge affect how quickly a new employee becomes productive. The employee may appear in the office during onboarding before reaching full capacity."
        ],
        callouts: [
          {
            type: "note",
            label: "Why headcount does not rise immediately",
            text: "Approval opens the process. Search, interviews, offer acceptance, and onboarding must finish before the hire becomes a fully active employee."
          }
        ],
        related: [
          { label: "Hiring questions", sectionId: "faq", topicId: "hiring-and-onboarding-faq" },
          { label: "Mentoring", sectionId: "leadership", topicId: "mentoring-and-coaching" }
        ]
      },
      {
        id: "headcount-not-candidates",
        title: "The CEO approves positions, not ordinary candidates",
        paragraphs: [
          "A normal hiring memo asks whether the company should fund and open a role. HR and the department then search, interview, select, offer, and onboard without a second CEO approval.",
          "The CEO becomes involved again only for an unusual case, such as a long failed search, executive hire, hiring freeze exception, salary-band exception, contractor decision, or changed project need."
        ],
        related: [
          { label: "Your authority", sectionId: "your-role", topicId: "indirect-leadership" },
          { label: "Hiring policy", sectionId: "hiring", topicId: "hiring-policy" }
        ]
      },
      {
        id: "hiring-policy",
        title: "Hiring policy and company growth",
        paragraphs: [
          "Review Hiring Policy creates a formal CEO memo. Normal allows ordinary evidence-based requests. Critical Roles Only limits escalation to severe bottlenecks, succession, compliance, safety, and essential vacancies. Frozen pauses normal recruiting while unmet needs continue to affect the company.",
          "As projects, customers, revenue, valuation, and coordination complexity grow, specialist and leadership roles become relevant. The company is designed to grow beyond its founding team, but each approved role adds persistent payroll, overhead, and management cost."
        ],
        callouts: [
          {
            type: "warning",
            label: "A freeze is not free",
            text: "Suppressed demand remains real. Backlog, delays, stress, quality risk, retention pressure, and later exception memos can grow."
          }
        ],
        related: [
          { label: "Leadership scale", sectionId: "leadership", topicId: "formal-and-informal" },
          { label: "Failure and recovery", sectionId: "winning", topicId: "failure-and-recovery" }
        ]
      }
    ]
  },
  {
    id: "office-culture",
    icon: "=",
    title: "Office Culture",
    summary: "Culture emerges from repeated behavior, decisions, relationships, pressure, and recovery.",
    topics: [
      {
        id: "how-culture-emerges",
        title: "Culture is an outcome",
        paragraphs: [
          "You do not select a culture label. The company develops tendencies from repeated decisions and employee experience: innovation, work-life balance, communication, politics, quality discipline, support, accountability, and risk tolerance.",
          "A single decision may create a temporary reaction. Lasting culture requires repeated, attributable evidence across time."
        ],
        bullets: [
          "Repeated quality investment can strengthen quality discipline.",
          "Repeated rushed work can normalize speed while increasing stress or defects.",
          "Fair coaching and useful mentoring can strengthen support and trust.",
          "Suppressed reports or inconsistent decisions can increase politics and fear.",
          "Successful recovery can become part of institutional identity."
        ],
        related: [
          { label: "CEO leadership footprint", sectionId: "leadership", topicId: "ceo-footprint" },
          { label: "Institutional learning", sectionId: "advanced-systems", topicId: "learning-and-memory" }
        ]
      },
      {
        id: "culture-views",
        title: "People and Culture views",
        table: {
          headers: ["View", "What it reports", "Why it matters"],
          rows: [
            ["Culture", "Supported norms, direction, confidence, and warnings.", "Shows what repeated behavior is teaching the organization."],
            ["Groups", "Informal groups formed through meaningful repeated interaction.", "Shows belonging and possible silos without treating proximity as friendship."],
            ["Network", "Mentoring, conflict, and bridge relationships.", "Shows who connects teams and where friction may isolate information."],
            ["Leadership", "Formal authority, earned credibility, coaching, fairness, and informal influence.", "Shows who people actually rely on."]
          ]
        },
        callouts: [
          {
            type: "note",
            label: "Evidence, not a control panel",
            text: "Opening these views does not change employee behavior. They summarize what the simulation has observed."
          }
        ],
        related: [
          { label: "Relationships and memories", sectionId: "reading-employees", topicId: "relationships-memories" },
          { label: "Leadership", sectionId: "leadership", topicId: "formal-and-informal" }
        ]
      },
      {
        id: "culture-change",
        title: "Changing culture",
        paragraphs: [
          "Culture changes through consistent leadership and outcomes, not one button. Employees may accept, resist, reinterpret, or only partly inherit a new norm.",
          "New hires learn some company and department lessons through onboarding. Veterans who experienced an event directly may carry stronger or different beliefs."
        ],
        related: [
          { label: "Hiring and onboarding", sectionId: "hiring", topicId: "hiring-pipeline" },
          { label: "Learning and memory", sectionId: "advanced-systems", topicId: "learning-and-memory" }
        ]
      }
    ]
  },
  {
    id: "leadership",
    icon: "^",
    title: "Leadership",
    summary: "Authority is formal. Credibility, influence, mentoring, and trust must be earned.",
    topics: [
      {
        id: "formal-and-informal",
        title: "Formal managers and informal leaders",
        paragraphs: [
          "Managers, Directors, and Vice Presidents coordinate people, projects, budgets, evidence, and executive communication as the company grows.",
          "Formal authority gives responsibility, not automatic credibility. Employees also develop reputations for expertise, fairness, reliability, mentoring, communication, conflict handling, and follow-through. A non-manager can become an informal leader."
        ],
        table: {
          headers: ["Signal", "What builds it"],
          rows: [
            ["Credibility", "Accurate judgment, useful recommendations, follow-through, and honest handling of uncertainty."],
            ["Influence", "Repeated help, expertise, communication, trust, and cross-team connections."],
            ["Management capacity", "Enough leaders to coordinate growing teams and projects without excessive span."],
            ["Reputation", "Evidence from real workplace outcomes, not popularity alone."]
          ]
        },
        related: [
          { label: "People and Culture views", sectionId: "office-culture", topicId: "culture-views" },
          { label: "Company growth", sectionId: "hiring", topicId: "hiring-policy" }
        ]
      },
      {
        id: "mentoring-and-coaching",
        title: "Mentoring and coaching",
        paragraphs: [
          "Mentoring transfers knowledge, supports onboarding, strengthens relationships, and can grow informal leadership. The mentor also gives up some short-term capacity.",
          "Coaching is used when sustained performance or behavior needs recovery. Improvement depends on role expectations, output, mistakes, absence, workload, manager quality, employee trust, and time. It is not an instant stat repair."
        ],
        related: [
          { label: "Employee workload", sectionId: "reading-employees", topicId: "stress-morale" },
          { label: "Onboarding", sectionId: "hiring", topicId: "hiring-pipeline" }
        ]
      },
      {
        id: "ceo-footprint",
        title: "Your leadership footprint",
        paragraphs: [
          "CEO decisions gradually reveal patterns in quality focus, speed, innovation, employee wellbeing, financial discipline, customer focus, transparency, risk tolerance, accountability, and long-term thinking.",
          "Employees, departments, customers, investors, and the Board respond to the accumulated pattern as well as the latest decision. Quarterly and annual reviews can compare promises with outcomes."
        ],
        callouts: [
          {
            type: "warning",
            label: "Consistency matters",
            text: "A good outcome can still weaken trust if the process looked unfair or reckless. A painful decision can preserve credibility if the evidence, trade-offs, and follow-through were clear."
          }
        ],
        related: [
          { label: "Culture change", sectionId: "office-culture", topicId: "culture-change" },
          { label: "Failure and Board pressure", sectionId: "winning", topicId: "failure-and-recovery" }
        ]
      }
    ]
  },
  {
    id: "winning",
    icon: "W",
    title: "Winning",
    summary: "Success is a healthy, adaptive company that delivers value and survives its mistakes.",
    topics: [
      {
        id: "what-success-means",
        title: "What success means",
        paragraphs: [
          "There is no single profit-only victory condition. A strong company delivers projects, creates customer value, retains capable employees, builds knowledge, grows leaders, protects morale, earns trust, and develops a healthy culture.",
          "A profitable company can still become fragile through burnout, poor quality, dependence on one person, weak governance, or customer collapse. A company that makes mistakes can still become durable if it learns and recovers."
        ],
        bullets: [
          "Deliver useful projects and create sustainable commercial value.",
          "Retain employees and preserve knowledge continuity.",
          "Maintain morale without ignoring accountability.",
          "Build credible formal and informal leaders.",
          "Keep enough cash and capability to recover.",
          "Create a culture that can adapt under pressure."
        ],
        related: [
          { label: "Beginner strategy", sectionId: "beginner-tips", topicId: "first-thirty-days" },
          { label: "Institutional learning", sectionId: "advanced-systems", topicId: "learning-and-memory" }
        ]
      },
      {
        id: "failure-and-recovery",
        title: "How you lose and how recovery works",
        paragraphs: [
          "You can lose your job if the Board concludes that different leadership is required. The company can also fail because it can no longer continue operating.",
          "Most loss paths build over time and provide warning. A crisis should reflect broad or sustained danger, not one ordinary staffing gap."
        ],
        table: {
          headers: ["Loss path", "Typical causes"],
          rows: [
            ["CEO removal", "Collapsed Board confidence, repeated board strikes, failed CEO performance plan, leadership crisis, severe governance or investor pressure, or repeated crisis mismanagement."],
            ["Company failure", "Insolvency, unpaid payroll, unrecoverable financial pressure, product or operational collapse, customer collapse, lost technical continuity, or an unresolved critical crisis."],
            ["Crisis deadline", "A sustained finance, staffing, product, reputation, leadership, burnout, manufacturing, customer, or operational crisis is not repaired before its recovery window closes."]
          ]
        },
        bullets: [
          "Investigate the cause before choosing a response.",
          "Restore cash, staffing continuity, product capability, customer trust, or leadership credibility as the crisis requires.",
          "Watch the recovery conditions and deadline in History and Reports.",
          "A temporary improvement may not end a crisis until the recovery is sustained."
        ],
        related: [
          { label: "Top status signals", sectionId: "user-interface-guide", topicId: "startup-and-status" },
          { label: "Stress and burnout", sectionId: "reading-employees", topicId: "stress-morale" },
          { label: "Hiring policy consequences", sectionId: "hiring", topicId: "hiring-policy" }
        ]
      }
    ]
  },
  {
    id: "beginner-tips",
    icon: "!",
    title: "Beginner Tips",
    summary: "Read trends, protect recovery room, and avoid treating every number as a direct control.",
    topics: [
      {
        id: "first-thirty-days",
        title: "Your first 30 simulated days",
        bullets: [
          "Use 1x until you understand the office and message flow.",
          "Protect cash, but do not starve the founding project of needed capability.",
          "Watch actual project allocation, not just total employee count.",
          "Compare hardware, software, quality, staffing, and integration before accelerating.",
          "Treat rising backlog, blockers, stress, and missed milestones as a connected warning.",
          "Let HR complete recruiting and onboarding after you approve a position.",
          "Read the first Weekly Reports to learn the company's pace."
        ],
        related: [
          { label: "Quick Start", sectionId: "quick-start", topicId: "first-two-minutes" },
          { label: "Project health", sectionId: "projects", topicId: "project-health" }
        ]
      },
      {
        id: "read-before-reacting",
        title: "Read before reacting",
        bullets: [
          "Check the affected project or department named in the memo.",
          "Compare the sender's recommendation with other viewpoints.",
          "Look at cash, runway, staffing, workload, quality, customer impact, and uncertainty.",
          "Ask whether the problem is temporary, sustained, local, or company-wide.",
          "After deciding, give short- and medium-term consequences time to appear."
        ],
        callouts: [
          {
            type: "tip",
            label: "No universal best choice",
            text: "The same action can help one company and hurt another because timing, capability, cash, trust, culture, and market conditions differ."
          }
        ],
        related: [
          { label: "Imperfect information", sectionId: "understanding-the-simulation", topicId: "imperfect-information" },
          { label: "Message accountability", sectionId: "advanced-systems", topicId: "message-accountability" }
        ]
      },
      {
        id: "common-mistakes",
        title: "Common beginner mistakes",
        table: {
          headers: ["Mistake", "Better approach"],
          rows: [
            ["Running at 12x through warnings", "Pause, read the affected systems, then choose a pace."],
            ["Assuming progress means health", "Check staffing, backlog, blockers, quality, timing, risk, and confidence."],
            ["Approving every hire", "Approve roles that solve real capability or capacity gaps and fit runway."],
            ["Rejecting every hire to save cash", "Remember that missing capacity creates delay, rework, burnout, and lost opportunity."],
            ["Treating one memo as perfect truth", "Compare evidence, departments, Reports, and history."],
            ["Expecting immediate results", "Many decisions, hires, projects, customers, and lessons require days or months."]
          ]
        },
        related: [
          { label: "Hiring strategy", sectionId: "hiring", topicId: "hiring-policy" },
          { label: "Project recovery", sectionId: "projects", topicId: "project-health" }
        ]
      }
    ]
  },
  {
    id: "advanced-systems",
    icon: "*",
    title: "Advanced Systems",
    summary: "Operating health, markets, memory, messages, and history connect long-run company behavior.",
    topics: [
      {
        id: "learning-and-memory",
        title: "Employee and Institutional Learning",
        paragraphs: [
          "Employees adapt after completed actions by comparing expected and observed outcomes. They can become more or less inclined to collaborate, test, ask for help, recover, take risks, report, or suppress reports in similar contexts.",
          "Institutional Learning reviews major decisions and repeated patterns over short-, medium-, and long-term windows. A lesson can be reinforced, contradicted, left provisional, or ignored when attribution is weak.",
          "The company does not learn merely because a decision was approved, a countdown changed, a message appeared, or a policy transition completed. Meaningful attributable outcomes are required."
        ],
        callouts: [
          {
            type: "note",
            label: "Bounded learning",
            text: "Learning changes tendencies, not destiny. Personality, role, current needs, evidence, policy, and company conditions still matter."
          }
        ],
        related: [
          { label: "How conversations adapt", sectionId: "conversations", topicId: "why-people-talk" },
          { label: "Culture change", sectionId: "office-culture", topicId: "culture-change" }
        ]
      },
      {
        id: "derived-health",
        title: "Derived Operating Health and hidden state",
        paragraphs: [
          "Operating Health is calculated from authoritative project, employee, staffing, customer, manufacturing, finance, Board, and market state. It is not a disconnected set of bars.",
          "The normal UI reports executive-level evidence. Exact hidden truth, internal random state, audits, and developer validation remain outside the public interface. N/A means the company does not yet have enough relevant evidence for a meaningful value."
        ],
        bullets: [
          "Project staffing uses actual allocation and skill fit.",
          "Product health uses relevant active and commercial project evidence.",
          "Company risk combines multiple pressure pillars.",
          "Department briefings use local work, pressure, defects, blockers, staffing, and knowledge.",
          "Forecasts remain estimates because employees and departments have partial information."
        ],
        related: [
          { label: "Reports guide", sectionId: "user-interface-guide", topicId: "reports-workspace" },
          { label: "Why a value shows N/A", sectionId: "faq", topicId: "metrics-and-projects-faq" }
        ]
      },
      {
        id: "market-and-customers",
        title: "Customers, revenue, valuation, and the market",
        paragraphs: [
          "Customers respond to product exposure, quality, reliability, support, price, trust, roadmap confidence, market demand, and company stability. Completed development needs a commercial path before it creates meaningful revenue.",
          "Valuation is a market estimate influenced by revenue, customers, products, growth, risk, Board and investor confidence, market conditions, and uncertainty. Its chart changes range without changing the underlying history."
        ],
        bullets: [
          "1D shows the most recent daily movement.",
          "1W, 1M, 3M, YTD, 1Y, and All show progressively longer history.",
          "Investor Confidence is market belief, not cash or Board Confidence.",
          "Daily Revenue is generated by active commercial products and customers, then reduced by real operating costs elsewhere in the economy."
        ],
        related: [
          { label: "Completed project questions", sectionId: "faq", topicId: "metrics-and-projects-faq" },
          { label: "Project lifecycle", sectionId: "projects", topicId: "project-lifecycle" }
        ]
      },
      {
        id: "message-accountability",
        title: "Old messages and accountability",
        paragraphs: [
          "Old Messages preserve what the company told you, which choice you made, and later outcomes when the simulation can evaluate them. Informational follow-ups are marked No reply needed.",
          "Sender and manager credibility can change when forecasts, recommendations, suppression, or protected reports are later tested by events. Routine updates may go directly into the old-message thread, Company Story, or Weekly Report instead of interrupting the CEO again."
        ],
        related: [
          { label: "CEO Communications", sectionId: "your-role", topicId: "ceo-communications" },
          { label: "Story systems", sectionId: "advanced-systems", topicId: "story-time-scales" }
        ]
      },
      {
        id: "story-time-scales",
        title: "Four time scales of company history",
        table: {
          headers: ["View", "Time scale", "Purpose"],
          rows: [
            ["Company Story", "Immediate", "Records meaningful events as they happen."],
            ["Story Threads", "Days to months", "Connects causes, decisions, and consequences."],
            ["Weekly Report", "Recent five-workday periods", "Turns events into a readable company newspaper."],
            ["Company History", "Months to years", "Preserves major milestones and the company's legacy."]
          ]
        },
        related: [
          { label: "History UI", sectionId: "user-interface-guide", topicId: "history-and-weekly-report" },
          { label: "Cause and effect", sectionId: "understanding-the-simulation", topicId: "cause-and-effect" }
        ]
      }
    ]
  },
  {
    id: "faq",
    icon: "?",
    title: "FAQ",
    summary: "Answers to common questions about messages, hiring, projects, metrics, saving, mobile play, and sound.",
    topics: [
      {
        id: "inbox-faq",
        title: "Why is my Inbox quiet?",
        paragraphs: [
          "The company may be handling work locally, a report may still be under review, or no issue currently requires CEO authority. Quiet periods are normal.",
          "If Old Messages contains something you never saw in the Inbox, it should be a clearly labeled informational follow-up or thread update. Decision messages must appear in the Inbox before they can be archived."
        ],
        related: [
          { label: "CEO Communications", sectionId: "your-role", topicId: "ceo-communications" },
          { label: "The office is alive", sectionId: "welcome", topicId: "living-organization" }
        ]
      },
      {
        id: "hiring-and-onboarding-faq",
        title: "Why did my employee count not rise after approval?",
        paragraphs: [
          "You approved a position, not an instant employee. The role must move through requisition, search, interviews, offer, acceptance, and onboarding.",
          "The Workforce panel should show its current stage. A failed offer can return to search. A new hire can appear during onboarding before becoming fully productive. Persistent stuck states are a bug, not intended difficulty."
        ],
        related: [
          { label: "Hiring pipeline", sectionId: "hiring", topicId: "hiring-pipeline" },
          { label: "Staffing signals", sectionId: "hiring", topicId: "staffing-signals" }
        ]
      },
      {
        id: "metrics-and-projects-faq",
        title: "Why is a metric N/A, progress slow, or revenue zero?",
        bullets: [
          "N/A means no relevant project, product, customer, or manufacturing evidence exists yet.",
          "Slow project progress can come from realistic duration, low allocation, skill mismatch, backlog, blockers, verification, quality work, stress, or recovery.",
          "A completed project moves to the archive. It needs a commercial path and customer adoption to generate revenue.",
          "A paused or cancelled project stays preserved in portfolio history and can be reviewed later.",
          "One short-staffed project is a project warning. A company staffing crisis requires broader or sustained evidence."
        ],
        related: [
          { label: "Project health", sectionId: "projects", topicId: "project-health" },
          { label: "Markets and revenue", sectionId: "advanced-systems", topicId: "market-and-customers" },
          { label: "Derived health", sectionId: "advanced-systems", topicId: "derived-health" }
        ]
      },
      {
        id: "decisions-faq",
        title: "Is there always a right choice?",
        paragraphs: [
          "No. Every choice can help or hurt depending on current conditions and later uncertainty. The organization has a hidden outcome model, but employees and departments only estimate it from their point of view.",
          "A strong choice should improve the issue it addresses when conditions support it, while still creating realistic costs or risks. A poor fit can worsen project, people, financial, customer, or leadership outcomes."
        ],
        related: [
          { label: "Imperfect information", sectionId: "understanding-the-simulation", topicId: "imperfect-information" },
          { label: "Read before reacting", sectionId: "beginner-tips", topicId: "read-before-reacting" }
        ]
      },
      {
        id: "save-mobile-sound",
        title: "How do saves, mobile play, and sound work?",
        bullets: [
          "The game autosaves on the current device. Clearing browser storage or using private browsing can remove or fail to preserve the save.",
          "Moving the game files does not automatically move browser storage.",
          "Keep Office_Aquarium.html, src, and assets together when playing from files.",
          "On mobile, use the top tabs to open one major area at a time.",
          "Sound defaults to Music + Alerts. The sound menu can separate music and message alerts.",
          "If audio is missing or blocked, the simulation continues silently."
        ],
        related: [
          { label: "Mobile and settings", sectionId: "user-interface-guide", topicId: "mobile-and-settings" },
          { label: "Essential controls", sectionId: "quick-start", topicId: "essential-controls" }
        ]
      },
      {
        id: "where-next",
        title: "Where should I look next?",
        table: {
          headers: ["Question", "Best place to look"],
          rows: [
            ["What is happening right now?", "Live Office and People"],
            ["Why is a team struggling?", "Department Briefings, Internal Reports, and Project Portfolio"],
            ["What needs my authority?", "CEO Communications"],
            ["Why did this happen?", "Story Threads and Old Messages"],
            ["What happened this week?", "Weekly Report"],
            ["What has the company become?", "Company History, Lessons, and People and Culture"]
          ]
        },
        related: [
          { label: "Full interface tour", sectionId: "user-interface-guide", topicId: "three-workspaces" },
          { label: "Quick Start", sectionId: "quick-start", topicId: "first-two-minutes" }
        ]
      }
    ]
  }
];

const SIMULATION_HANDBOOK_CONFIG = OFFICE_AQUARIUM_CONSTANTS.handbook;
let simulationHandbookInitialized = false;
let simulationHandbookCurrentSection = SIMULATION_HANDBOOK_CONFIG.defaultSection;
let simulationHandbookPreviousFocus = null;
let simulationHandbookToggleGuard = false;
let simulationHandbookCachedSearchIndex = null;

function simulationHandbookStripMarkup(value) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(value ?? "");
  return String(wrapper.textContent || "").replace(/\s+/g, " ").trim();
}

function simulationHandbookFlatten(value) {
  if (Array.isArray(value)) return value.map(simulationHandbookFlatten).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(simulationHandbookFlatten).join(" ");
  return simulationHandbookStripMarkup(value);
}

function simulationHandbookSectionById(sectionId) {
  return SIMULATION_HANDBOOK_SECTIONS.find(section => section.id === sectionId) || null;
}

function simulationHandbookTopicById(topicId) {
  for (const section of SIMULATION_HANDBOOK_SECTIONS) {
    const topic = section.topics.find(candidate => candidate.id === topicId);
    if (topic) return { section, topic };
  }
  return null;
}

function simulationHandbookRenderTable(table) {
  if (!table) return "";
  return `<div class="handbook-table-wrap"><table class="handbook-table"><thead><tr>${table.headers.map(header => `<th scope="col">${header}</th>`).join("")}</tr></thead><tbody>${table.rows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${cell}</th>` : `<td data-label="${table.headers[index]}">${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function simulationHandbookRenderRelated(related) {
  if (!related?.length) return "";
  return `<div class="handbook-related"><span>Related topics</span><div>${related.map(link => `<button type="button" class="handbook-related-link" data-handbook-target="${link.sectionId}" data-handbook-topic="${link.topicId || ""}">${link.label}</button>`).join("")}</div></div>`;
}

function simulationHandbookRenderTopic(topic) {
  const paragraphs = (topic.paragraphs || []).map(text => `<p>${text}</p>`).join("");
  const bullets = topic.bullets?.length ? `<ul>${topic.bullets.map(item => `<li>${item}</li>`).join("")}</ul>` : "";
  const steps = topic.steps?.length ? `<ol>${topic.steps.map(item => `<li>${item}</li>`).join("")}</ol>` : "";
  const flow = topic.flow?.length ? `<div class="handbook-flow" aria-label="Process">${topic.flow.map((item, index) => `<div class="handbook-flow-step"><span>${index + 1}</span><p>${item}</p></div>`).join("")}</div>` : "";
  const callouts = (topic.callouts || []).map(callout => `<aside class="handbook-callout handbook-callout-${callout.type || "note"}"><span class="handbook-callout-icon" aria-hidden="true">${callout.type === "warning" ? "!" : callout.type === "tip" ? ">" : callout.type === "example" ? "#" : "i"}</span><div><strong>${callout.label}</strong><p>${callout.text}</p></div></aside>`).join("");
  return `<article class="handbook-topic" id="handbook-topic-${topic.id}" data-handbook-topic-id="${topic.id}" tabindex="-1"><h3>${topic.title}</h3>${paragraphs}${bullets}${steps}${flow}${simulationHandbookRenderTable(topic.table)}${callouts}${simulationHandbookRenderRelated(topic.related)}</article>`;
}

function simulationHandbookRenderSection(section, index) {
  const open = section.id === SIMULATION_HANDBOOK_CONFIG.defaultSection ? " open" : "";
  return `<details class="handbook-section" id="handbook-section-${section.id}" data-handbook-section="${section.id}"${open}><summary><span class="handbook-section-icon" aria-hidden="true">${section.icon}</span><span><strong>${index + 1}. ${section.title}</strong><small>${section.summary}</small></span></summary><div class="handbook-section-content">${section.topics.map(simulationHandbookRenderTopic).join("")}</div></details>`;
}

function simulationHandbookRender() {
  const toc = document.getElementById("handbookToc");
  const list = document.getElementById("handbookSectionList");
  if (!toc || !list) return;
  toc.innerHTML = SIMULATION_HANDBOOK_SECTIONS.map((section, index) => `<button type="button" class="handbook-toc-button${section.id === SIMULATION_HANDBOOK_CONFIG.defaultSection ? " active" : ""}" data-handbook-target="${section.id}" aria-current="${section.id === SIMULATION_HANDBOOK_CONFIG.defaultSection ? "page" : "false"}"><span class="handbook-toc-number">${index + 1}</span><span>${section.title}</span></button>`).join("");
  list.innerHTML = SIMULATION_HANDBOOK_SECTIONS.map(simulationHandbookRenderSection).join("");
}

function simulationHandbookUpdateNavigation(sectionId) {
  const index = SIMULATION_HANDBOOK_SECTIONS.findIndex(section => section.id === sectionId);
  const previous = SIMULATION_HANDBOOK_SECTIONS[index - 1] || null;
  const next = SIMULATION_HANDBOOK_SECTIONS[index + 1] || null;
  const previousButton = document.getElementById("handbookPrevious");
  const nextButton = document.getElementById("handbookNext");
  if (previousButton) {
    previousButton.disabled = !previous;
    previousButton.dataset.handbookTarget = previous?.id || "";
    previousButton.innerHTML = previous ? `<span>Previous</span><strong>${previous.title}</strong>` : "<span>Previous</span><strong>Start</strong>";
  }
  if (nextButton) {
    nextButton.disabled = !next;
    nextButton.dataset.handbookTarget = next?.id || "";
    nextButton.innerHTML = next ? `<span>Next</span><strong>${next.title}</strong>` : "<span>Next</span><strong>Complete</strong>";
  }
  document.querySelectorAll(".handbook-toc-button").forEach(button => {
    const active = button.dataset.handbookTarget === sectionId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
}

function navigateSimulationHandbook(sectionId, topicId = null, options = {}) {
  if (!simulationHandbookInitialized) initializeSimulationHandbook();
  const fallback = simulationHandbookSectionById(SIMULATION_HANDBOOK_CONFIG.defaultSection) || SIMULATION_HANDBOOK_SECTIONS[0];
  const section = simulationHandbookSectionById(sectionId) || fallback;
  const details = document.getElementById(`handbook-section-${section.id}`);
  const reader = document.getElementById("handbookReader");
  if (!details || !reader) return false;

  simulationHandbookToggleGuard = true;
  document.querySelectorAll(".handbook-section").forEach(candidate => {
    candidate.open = candidate === details;
  });
  simulationHandbookToggleGuard = false;
  simulationHandbookCurrentSection = section.id;
  simulationHandbookUpdateNavigation(section.id);

  const requestedTopic = topicId ? document.getElementById(`handbook-topic-${topicId}`) : null;
  const target = requestedTopic && details.contains(requestedTopic) ? requestedTopic : details;
  if (options.scroll !== false) {
    const readerTop = reader.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    reader.scrollTo({ top: Math.max(0, reader.scrollTop + targetTop - readerTop - 8), behavior: "auto" });
  }
  if (options.focus !== false) {
    const focusTarget = target === details ? details.querySelector("summary") : target;
    setTimeout(() => focusTarget?.focus({ preventScroll: true }), 0);
  }
  return true;
}

function simulationHandbookSearchIndex() {
  if (simulationHandbookCachedSearchIndex) return simulationHandbookCachedSearchIndex;
  const entries = [];
  SIMULATION_HANDBOOK_SECTIONS.forEach(section => {
    section.topics.forEach(topic => {
      const body = simulationHandbookFlatten(topic);
      entries.push({
        sectionId: section.id,
        sectionTitle: section.title,
        topicId: topic.id,
        topicTitle: topic.title,
        text: `${section.title} ${section.summary} ${topic.title} ${body}`.toLowerCase(),
        preview: simulationHandbookStripMarkup(topic.paragraphs?.[0] || topic.bullets?.[0] || topic.steps?.[0] || section.summary)
      });
    });
  });
  simulationHandbookCachedSearchIndex = entries;
  return simulationHandbookCachedSearchIndex;
}

function simulationHandbookSearchScore(entry, query, tokens) {
  const title = entry.topicTitle.toLowerCase();
  const section = entry.sectionTitle.toLowerCase();
  if (!tokens.every(token => entry.text.includes(token))) return -1;
  let score = tokens.reduce((total, token) => total + (title.includes(token) ? 24 : 0) + (section.includes(token) ? 12 : 0), 0);
  if (title === query) score += 100;
  else if (title.startsWith(query)) score += 60;
  else if (title.includes(query)) score += 30;
  return score;
}

function updateSimulationHandbookSearch(queryValue) {
  const results = document.getElementById("handbookSearchResults");
  const status = document.getElementById("handbookSearchStatus");
  if (!results || !status) return [];
  const query = String(queryValue || "").trim().toLowerCase();
  if (!query) {
    results.innerHTML = "";
    results.classList.add("hidden");
    status.textContent = "Search all handbook topics.";
    return [];
  }
  const tokens = query.split(/\s+/).filter(Boolean);
  const matches = simulationHandbookSearchIndex()
    .map(entry => ({ ...entry, score: simulationHandbookSearchScore(entry, query, tokens) }))
    .filter(entry => entry.score >= 0)
    .sort((left, right) => right.score - left.score || left.sectionTitle.localeCompare(right.sectionTitle) || left.topicTitle.localeCompare(right.topicTitle))
    .slice(0, SIMULATION_HANDBOOK_CONFIG.searchResultLimit);
  status.textContent = matches.length ? `${matches.length} matching topic${matches.length === 1 ? "" : "s"}.` : "No matching topics.";
  results.innerHTML = matches.length
    ? matches.map(match => `<button type="button" class="handbook-search-result" role="option" data-handbook-target="${match.sectionId}" data-handbook-topic="${match.topicId}"><strong>${match.topicTitle}</strong><span>${match.sectionTitle}</span><small>${match.preview}</small></button>`).join("")
    : `<div class="handbook-search-empty">No topic matched. Try a shorter word such as <strong>hiring</strong>, <strong>stress</strong>, or <strong>projects</strong>.</div>`;
  results.classList.remove("hidden");
  return matches;
}

function clearSimulationHandbookSearch() {
  const input = document.getElementById("handbookSearch");
  if (input) input.value = "";
  updateSimulationHandbookSearch("");
  input?.focus();
}

function openSimulationHandbook(sectionId = SIMULATION_HANDBOOK_CONFIG.defaultSection, topicId = null) {
  if (!simulationHandbookInitialized) initializeSimulationHandbook();
  const modal = document.getElementById("guideModal");
  if (!modal) return false;
  if (modal.classList.contains("hidden")) simulationHandbookPreviousFocus = document.activeElement;
  modal.classList.remove("hidden");
  document.body.classList.add("handbook-open");
  const searchInput = document.getElementById("handbookSearch");
  if (searchInput) searchInput.value = "";
  updateSimulationHandbookSearch("");
  navigateSimulationHandbook(sectionId, topicId, { focus: false });
  const focusTarget = topicId ? document.getElementById(`handbook-topic-${topicId}`) : document.getElementById("handbookTitle");
  setTimeout(() => focusTarget?.focus({ preventScroll: true }), 0);
  return true;
}

function closeSimulationHandbook() {
  const modal = document.getElementById("guideModal");
  if (!modal || modal.classList.contains("hidden")) return false;
  modal.classList.add("hidden");
  document.body.classList.remove("handbook-open");
  const returnTarget = simulationHandbookPreviousFocus;
  simulationHandbookPreviousFocus = null;
  if (returnTarget?.isConnected) setTimeout(() => returnTarget.focus(), 0);
  return true;
}

function simulationHandbookHandleNavigationClick(event) {
  const button = event.target.closest("[data-handbook-target]");
  if (!button) return;
  const sectionId = button.dataset.handbookTarget;
  if (!sectionId) return;
  navigateSimulationHandbook(sectionId, button.dataset.handbookTopic || null);
  document.getElementById("handbookSearchResults")?.classList.add("hidden");
}

function initializeSimulationHandbook() {
  if (simulationHandbookInitialized) return true;
  const modal = document.getElementById("guideModal");
  if (!modal) return false;
  simulationHandbookRender();

  const navigationRoot = document.getElementById("handbookNavigationRoot");
  navigationRoot?.addEventListener("click", simulationHandbookHandleNavigationClick);
  document.getElementById("handbookSectionList")?.addEventListener("toggle", event => {
    const details = event.target;
    if (simulationHandbookToggleGuard || !details.matches?.(".handbook-section") || !details.open) return;
    simulationHandbookToggleGuard = true;
    document.querySelectorAll(".handbook-section").forEach(candidate => {
      if (candidate !== details) candidate.open = false;
    });
    simulationHandbookToggleGuard = false;
    simulationHandbookCurrentSection = details.dataset.handbookSection;
    simulationHandbookUpdateNavigation(simulationHandbookCurrentSection);
  }, true);

  const search = document.getElementById("handbookSearch");
  search?.addEventListener("input", event => updateSimulationHandbookSearch(event.target.value));
  search?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const firstResult = document.querySelector("#handbookSearchResults .handbook-search-result");
      if (firstResult) {
        event.preventDefault();
        firstResult.click();
      }
    }
  });
  document.getElementById("handbookSearchClear")?.addEventListener("click", clearSimulationHandbookSearch);
  document.getElementById("handbookTop")?.addEventListener("click", () => {
    const reader = document.getElementById("handbookReader");
    reader?.scrollTo({ top: 0, behavior: "auto" });
    setTimeout(() => document.getElementById("handbookTitle")?.focus({ preventScroll: true }), 0);
  });
  document.addEventListener("click", event => {
    const searchShell = event.target.closest(".handbook-search-shell");
    if (!searchShell) document.getElementById("handbookSearchResults")?.classList.add("hidden");
  });
  document.addEventListener("keydown", event => {
    const activeModal = document.getElementById("guideModal");
    if (!activeModal || activeModal.classList.contains("hidden")) return;
    if (event.key === "Tab") {
      const focusable = [...activeModal.querySelectorAll('button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')]
        .filter(element => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.key !== "Escape") return;
    const searchInput = document.getElementById("handbookSearch");
    if (searchInput?.value) clearSimulationHandbookSearch();
    else closeSimulationHandbook();
  });

  simulationHandbookInitialized = true;
  simulationHandbookUpdateNavigation(simulationHandbookCurrentSection);
  return true;
}

globalThis.openSimulationHandbook = openSimulationHandbook;
globalThis.closeSimulationHandbook = closeSimulationHandbook;
globalThis.navigateSimulationHandbook = navigateSimulationHandbook;
globalThis.OfficeAquariumHandbook = Object.freeze({
  open: openSimulationHandbook,
  close: closeSimulationHandbook,
  navigate: navigateSimulationHandbook,
  sections: SIMULATION_HANDBOOK_SECTIONS.map(section => section.id),
  topics: SIMULATION_HANDBOOK_SECTIONS.flatMap(section => section.topics.map(topic => topic.id)),
  findTopic: simulationHandbookTopicById
});

initializeSimulationHandbook();
