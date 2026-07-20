const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const stage = path.resolve(process.argv[2] || "");
const packageType = process.argv[3] || "unknown";
if (!stage || !fs.existsSync(stage) || !fs.statSync(stage).isDirectory()) {
  throw new Error("A valid staged package directory is required.");
}

const release = JSON.parse(execFileSync(
  process.execPath,
  [path.resolve(__dirname, "release-metadata.js"), "json"],
  { encoding: "utf8" }
));
const excluded = new Set(["release-manifest.json", "SHA256SUMS.txt"]);

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const absolute = path.join(directory, entry.name);
      return entry.isDirectory() ? filesIn(absolute) : [absolute];
    });
}

const files = filesIn(stage)
  .filter(file => !excluded.has(path.basename(file)))
  .map(file => {
    const content = fs.readFileSync(file);
    return {
      path: path.relative(stage, file).replace(/\\/g, "/"),
      bytes: content.length,
      sha256: crypto.createHash("sha256").update(content).digest("hex")
    };
  })
  .sort((left, right) => left.path.localeCompare(right.path));

const manifest = {
  product: "Office Aquarium",
  version: release.applicationVersion,
  channel: release.channel,
  packageType,
  offline: release.offline,
  telemetry: release.telemetry,
  generatedAt: new Date().toISOString(),
  files
};
fs.writeFileSync(path.join(stage, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(
  path.join(stage, "SHA256SUMS.txt"),
  `${files.map(file => `${file.sha256}  ${file.path}`).join("\n")}\n`
);
process.stdout.write(`${JSON.stringify({ ok: true, packageType, version: release.applicationVersion, files: files.length }, null, 2)}\n`);
