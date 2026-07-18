const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

async function launchBrowser() {
  for (const executablePath of chromeCandidates) {
    if (fs.existsSync(executablePath)) return chromium.launch({ headless: true, executablePath });
  }
  return chromium.launch({ headless: true });
}

async function main() {
  const errors = [];
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on("pageerror", error => errors.push(`PAGE: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`CONSOLE: ${message.text()}`);
  });

  await page.goto(`file:///${path.resolve("Office_Aquarium.html").replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const result = await page.evaluate(() => {
    const failures = [];
    const assert = (condition, message) => { if (!condition) failures.push(message); };
    validationMode = true;
    startNewCompany();
    ensureInstitutionalLearning();

    const key = "test-causal-learning-gate";
    company.lessons = company.lessons.filter(lesson => lesson.key !== key);
    company.learningEvidence = [];
    company.departmentLearning.software = emptyLessonVector();
    employees.filter(employee => employee.active).forEach(employee => {
      employee.learnedLessons = emptyLessonVector();
    });
    const employee = employees.find(candidate => candidate.active);
    const initialDepartment = JSON.stringify(company.departmentLearning.software);
    const initialEmployee = JSON.stringify(employee.learnedLessons);
    const lessonInput = {
      key,
      title: "Reviewed collaboration improves integration",
      department: "software",
      vector: { collaboration: 1, helpSeeking: 0.5, planning: 0.25 },
      outcome: "positive",
      confidence: 82,
      evidence: "A controlled integration review observed the result.",
      importance: 4
    };

    const unreviewed = createOrReinforceLesson(lessonInput);
    assert(unreviewed === null, "Unreviewed evidence must not create a lesson");
    assert(!company.lessons.some(lesson => lesson.key === key), "Unreviewed evidence must not enter the lesson store");
    assert(JSON.stringify(company.departmentLearning.software) === initialDepartment, "Unreviewed evidence must not alter department behavior");
    assert(JSON.stringify(employee.learnedLessons) === initialEmployee, "Unreviewed evidence must not alter employee behavior");
    assert(company.learningEvidence.length === 1, "Unreviewed evidence should remain available for audit");

    createOrReinforceLesson({
      ...lessonInput,
      episodeKey: "episode-1",
      independenceGroup: "project-a",
      attributionQuality: 90,
      reviewWindow: "short"
    });
    assert(!company.lessons.some(lesson => lesson.key === key), "A short review must not create an institutional lesson");

    const provisional = createOrReinforceLesson({
      ...lessonInput,
      episodeKey: "episode-1",
      independenceGroup: "project-a",
      attributionQuality: 82,
      reviewWindow: "medium"
    });
    assert(provisional?.state === "provisional", `Medium review should create a provisional lesson, got ${provisional?.state}`);
    assert(provisional?.sampleCount === 1, "First reviewed episode should create one sample");
    const provisionalDepartment = company.departmentLearning.software.collaboration;
    const provisionalEmployee = employee.learnedLessons.collaboration;
    assert(provisionalDepartment > 0 && provisionalEmployee > 0, "A provisional lesson should have bounded behavioral influence");

    createOrReinforceLesson({
      ...lessonInput,
      episodeKey: "episode-1",
      independenceGroup: "project-a",
      attributionQuality: 82,
      reviewWindow: "medium"
    });
    assert(provisional.sampleCount === 1, "Repeating the same review must not inflate the sample count");
    assert(company.departmentLearning.software.collaboration === provisionalDepartment, "Repeating the same review must not reinforce behavior");

    const validated = createOrReinforceLesson({
      ...lessonInput,
      episodeKey: "episode-1",
      independenceGroup: "project-a",
      attributionQuality: 82,
      reviewWindow: "long"
    });
    assert(validated.state === "validated", `Long review should promote strong evidence to validated, got ${validated.state}`);
    assert(validated.sampleCount === 1, "Promoting one episode must not count it twice");
    assert(company.departmentLearning.software.collaboration > provisionalDepartment, "Promotion should apply only the additional validated influence");

    const validatedDepartment = company.departmentLearning.software.collaboration;
    createOrReinforceLesson({
      ...lessonInput,
      episodeKey: "episode-2",
      independenceGroup: "project-a",
      attributionQuality: 84,
      reviewWindow: "long"
    });
    assert(validated.sampleCount === 1, "A second observation from the same causal episode group must not inflate samples");
    assert(company.departmentLearning.software.collaboration === validatedDepartment, "Dependent evidence must not reinforce behavior");

    createOrReinforceLesson({
      ...lessonInput,
      episodeKey: "episode-3",
      independenceGroup: "project-b",
      attributionQuality: 78,
      reviewWindow: "medium"
    });
    assert(validated.sampleCount === 2, "An independent reviewed episode should increase the sample count");
    assert(validated.state === "validated", "A later medium review must not downgrade a validated lesson");
    assert(validated.independenceGroups.includes("project-a") && validated.independenceGroups.includes("project-b"), "Independent causal groups should be preserved");
    assert(Math.abs(company.departmentLearning.software.collaboration) <= 10, "Department learning must remain bounded");
    assert(Math.abs(employee.learnedLessons.collaboration) <= 10, "Employee learning must remain bounded");

    ensureProjectPortfolio();
    company.projectLessons.estimateAccuracy = emptyProjectLessons().estimateAccuracy;
    reinforceProjectLesson("estimateAccuracy", 1, "A project estimate was approved");
    assert(company.projectLessons.estimateAccuracy.sampleCount === 0, "Starting a project action must not reinforce project learning");
    const projectReview = {
      episodeKey: "project-outcome-1",
      independenceGroup: "project-causal-group-1",
      attributionQuality: 80,
      reviewWindow: "long",
      projectId: "test-project"
    };
    reinforceProjectLesson("estimateAccuracy", 0.8, "The completed project matched its estimate", 7, "positive", projectReview);
    assert(company.projectLessons.estimateAccuracy.sampleCount === 1, "A reviewed project outcome should create one project-learning sample");
    const projectScore = company.projectLessons.estimateAccuracy.score;
    reinforceProjectLesson("estimateAccuracy", 0.8, "The same project outcome was read again", 7, "positive", projectReview);
    assert(company.projectLessons.estimateAccuracy.sampleCount === 1, "The same project outcome must not count twice");
    assert(company.projectLessons.estimateAccuracy.score === projectScore, "Duplicate project evidence must not change the learned score");
    reinforceProjectLesson("estimateAccuracy", 0.6, "A dependent project report repeated the result", 6, "positive", {
      ...projectReview,
      episodeKey: "project-outcome-2"
    });
    assert(company.projectLessons.estimateAccuracy.sampleCount === 1, "Dependent project evidence must not create another sample");
    reinforceProjectLesson("estimateAccuracy", -0.4, "A different completed project missed its estimate", 6, "contradiction", {
      ...projectReview,
      episodeKey: "project-outcome-3",
      independenceGroup: "project-causal-group-2",
      projectId: "test-project-2"
    });
    assert(company.projectLessons.estimateAccuracy.sampleCount === 2, "An independent reviewed project outcome should reinforce project learning");

    ensureWorkforceEconomySystems();
    company.workforceLessons.hiringTiming = { score: 0, confidence: 0, count: 0, lastEvidence: "" };
    reinforceWorkforceLesson("hiringTiming", 1, "Recruiting was opened");
    assert(company.workforceLessons.hiringTiming.count === 0, "Opening recruiting must not teach the company that hiring worked");
    const workforceReview = {
      episodeKey: "onboarding-outcome-1",
      independenceGroup: "hire-causal-group-1",
      attributionQuality: 78,
      reviewWindow: "long",
      employeeIds: [employee.id]
    };
    reinforceWorkforceLesson("hiringTiming", 0.75, "A hire completed onboarding", 7, workforceReview);
    assert(company.workforceLessons.hiringTiming.count === 1, "A reviewed onboarding outcome should create one workforce-learning sample");
    const workforceScore = company.workforceLessons.hiringTiming.score;
    reinforceWorkforceLesson("hiringTiming", 0.75, "The same onboarding outcome was read again", 7, workforceReview);
    assert(company.workforceLessons.hiringTiming.count === 1, "The same workforce outcome must not count twice");
    assert(company.workforceLessons.hiringTiming.score === workforceScore, "Duplicate workforce evidence must not change the learned score");
    reinforceWorkforceLesson("hiringTiming", 0.5, "A second independent hire completed onboarding", 6, {
      ...workforceReview,
      episodeKey: "onboarding-outcome-2",
      independenceGroup: "hire-causal-group-2"
    });
    assert(company.workforceLessons.hiringTiming.count === 2, "An independent reviewed workforce outcome should reinforce workforce learning");

    validationMode = false;
    return {
      ok: failures.length === 0,
      failures,
      lesson: {
        state: validated.state,
        sampleCount: validated.sampleCount,
        episodeCount: validated.episodeKeys.length,
        independenceGroups: validated.independenceGroups,
        confidence: validated.confidence
      },
      departmentCollaboration: company.departmentLearning.software.collaboration,
      employeeCollaboration: employee.learnedLessons.collaboration,
      projectLearningSamples: company.projectLessons.estimateAccuracy.sampleCount,
      workforceLearningSamples: company.workforceLessons.hiringTiming.count,
      evidenceCount: company.learningEvidence.length
    };
  });

  await browser.close();
  const ok = errors.length === 0 && result.ok;
  console.log(JSON.stringify({ ok, result, errors }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
