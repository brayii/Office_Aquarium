const fs = require("fs");
const path = require("path");
const vm = require("vm");

function collectJsFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) collectJsFiles(file, out);
    else if (file.endsWith(".js")) out.push(file);
  }
  return out;
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function allProjectText(files) {
  return files.map(file => `${file}\n${read(file)}`).join("\n");
}

function checkDuplicateHtmlIds() {
  const html = fs.readFileSync("Office_Aquarium.html", "utf8");
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) throw new Error(`Duplicate HTML ids: ${duplicates.join(", ")}`);
  return ids.length;
}

function checkDuplicateFunctions() {
  const seen = new Map();
  const duplicates = [];
  for (const file of collectJsFiles("src")) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
      if (seen.has(match[1])) duplicates.push(match[1]);
      else seen.set(match[1], file);
    }
  }
  const uniqueDuplicates = [...new Set(duplicates)];
  if (uniqueDuplicates.length) throw new Error(`Duplicate functions: ${uniqueDuplicates.join(", ")}`);
  return seen.size;
}
function checkJavaScriptSyntax(files) {
  for (const file of files) {
    new vm.Script(read(file), { filename: file });
  }
  return files.length;
}

function checkMissingHtmlScripts() {
  const html = read("Office_Aquarium.html");
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
  const missing = scripts.filter(src => !fs.existsSync(path.normalize(src)));
  if (missing.length) throw new Error(`Missing script files: ${missing.join(", ")}`);
  return scripts.length;
}

function checkDuplicateTopLevelDeclarations(files) {
  const seen = new Map();
  const duplicates = [];
  const declaration = /^(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)\b/gm;
  for (const file of files) {
    const text = read(file);
    for (const match of text.matchAll(declaration)) {
      if (seen.has(match[1])) duplicates.push(match[1]);
      else seen.set(match[1], file);
    }
  }
  const uniqueDuplicates = [...new Set(duplicates)];
  if (uniqueDuplicates.length) throw new Error(`Duplicate top-level declarations: ${uniqueDuplicates.join(", ")}`);
  return seen.size;
}

function checkForbiddenPatterns(files) {
  const text = allProjectText(files.concat(["Office_Aquarium.html"]));
  const forbidden = [
    [/fetch\s*\(/, "fetch"],
    [/XMLHttpRequest/, "XMLHttpRequest"],
    [/\uFFFD|â€|â€œ|â€|â€™|â€˜|â†’|â€”/, "replacement/encoding artifact"]
  ];
  const found = forbidden.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
  if (found.length) throw new Error(`Forbidden pattern(s): ${found.join(", ")}`);
  return forbidden.length;
}

function checkRandomAndTimers(files) {
  const randomHits = [];
  const timerHits = [];
  for (const file of files) {
    const text = read(file);
    if (/Math\.random\s*\(/.test(text)) {
      const allowedFallback = file.endsWith(path.join("src", "core", "state-startup.js")) && /function simulationRandom\(\)[\s\S]*return Math\.random\(\);[\s\S]*function nextSimulationId/.test(text);
      if (!allowedFallback) randomHits.push(file);
    }
    if (/setInterval\s*\(/.test(text)) timerHits.push(file);
  }
  if (randomHits.length) throw new Error(`Uncontrolled Math.random usage: ${[...new Set(randomHits)].join(", ")}`);
  if (timerHits.length > 1) throw new Error(`Multiple timer owners: ${[...new Set(timerHits)].join(", ")}`);
  return { randomAllowedInRuntimeService: true, timerOwners: timerHits.length };
}

function checkCausalLearningIntegrity() {
  const learning = read(path.join("src", "systems", "institutional-company-intelligence.js"));
  const regressionPatterns = [
    [/\(\s*episode\.messageId\s*\|\|\s*episode\.protectedChannel\s*\)\s*\?\s*\.25\s*:\s*-\s*\.10/, "communication message-existence reward"],
    [/Math\.max\s*\(\s*ep\.attributionQuality\s*,\s*score\s*\)/, "sticky attribution quality"],
    [/Number\s*\(\s*e\.recentOutput\s*\|\|\s*0\s*\)/, "legacy employee output field"],
    [/if\s*\(\s*state\s*===\s*"prior"\s*\)\s*return\s*\.22/, "overweighted prior lesson state"],
    [/return\s*\.45\s*;/, "unknown lesson fallback influence"]
  ];
  const found = regressionPatterns.filter(([pattern]) => pattern.test(learning)).map(([, label]) => label);
  if (found.length) throw new Error(`Causal learning regression pattern(s): ${found.join(", ")}`);
  const requiredSignals = [
    [/communicationOutcomeScore\s*\(\s*episode\s*\)/, "communication outcome scoring"],
    [/currentAttributionQuality/, "revisable attribution quality"],
    [/segmentCustomers/, "segment-specific customer learning"],
    [/staffingCoverage/, "workforce staffing coverage learning"],
    [/departmentBacklog/, "department backlog learning"],
    [/retentionRate/, "retention outcome learning"],
    [/roleOutput/, "role output learning"],
    [/low attribution from unrelated operating pressure/, "unrelated pressure attribution guard"]
  ];
  const missing = requiredSignals.filter(([pattern]) => !pattern.test(learning)).map(([, label]) => label);
  if (missing.length) throw new Error(`Missing causal learning guard(s): ${missing.join(", ")}`);
  const regression = read(path.join("tests", "simulation-regression-test.js"));
  if (!/company:\s*canonicalize\s*\(\s*company\s*\)/.test(regression)) {
    throw new Error("Regression test must canonicalize authoritative company state");
  }
  if (!/performance\?\.recentOutput\s*\?\?\s*e\.recentOutput/.test(regression)) {
    throw new Error("Regression test must hash performance.recentOutput");
  }
  return requiredSignals.length;
}

const htmlIds = checkDuplicateHtmlIds();
const jsFiles = collectJsFiles("src").concat(collectJsFiles("tests"));
const syntaxFiles = checkJavaScriptSyntax(jsFiles);
const functions = checkDuplicateFunctions();
const htmlScripts = checkMissingHtmlScripts();
const topLevelDeclarations = checkDuplicateTopLevelDeclarations(collectJsFiles("src"));
const forbiddenChecks = checkForbiddenPatterns(collectJsFiles("src"));
const randomAndTimers = checkRandomAndTimers(collectJsFiles("src"));
const causalLearningGuards = checkCausalLearningIntegrity();
console.log(JSON.stringify({ ok: true, htmlIds, htmlScripts, syntaxFiles, functions, topLevelDeclarations, forbiddenChecks, randomAndTimers, causalLearningGuards }, null, 2));
