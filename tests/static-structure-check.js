const fs = require("fs");
const path = require("path");

function collectJsFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) collectJsFiles(file, out);
    else if (file.endsWith(".js")) out.push(file);
  }
  return out;
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

const htmlIds = checkDuplicateHtmlIds();
const functions = checkDuplicateFunctions();
console.log(JSON.stringify({ ok: true, htmlIds, functions }, null, 2));
