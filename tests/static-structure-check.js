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

const htmlIds = checkDuplicateHtmlIds();
const jsFiles = collectJsFiles("src").concat(collectJsFiles("tests"));
const syntaxFiles = checkJavaScriptSyntax(jsFiles);
const functions = checkDuplicateFunctions();
const htmlScripts = checkMissingHtmlScripts();
const topLevelDeclarations = checkDuplicateTopLevelDeclarations(collectJsFiles("src"));
const forbiddenChecks = checkForbiddenPatterns(collectJsFiles("src"));
const randomAndTimers = checkRandomAndTimers(collectJsFiles("src"));
console.log(JSON.stringify({ ok: true, htmlIds, htmlScripts, syntaxFiles, functions, topLevelDeclarations, forbiddenChecks, randomAndTimers }, null, 2));
