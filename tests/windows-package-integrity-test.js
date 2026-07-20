const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const release = JSON.parse(execFileSync(
  process.execPath,
  [path.resolve("tools", "release-metadata.js"), "json"],
  { encoding: "utf8" }
));
const stage = path.resolve("dist", "windows");
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const sha256 = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

check(fs.existsSync(stage), "Windows release stage exists");
if (!fs.existsSync(stage)) {
  throw new Error(failures.join("; "));
}

const entries = fs.readdirSync(stage).sort();
const installerPattern = new RegExp(`^Office Aquarium_${release.applicationVersion.replace(/\./g, "\\.")}_x64-setup\\.exe$`);
const portableName = `Office_Aquarium_${release.applicationVersion}_windows_x64.exe`;
const installer = entries.find(name => installerPattern.test(name));
const allowedStatic = new Set([
  "ASSET_ATTRIBUTION.md",
  "LICENSE",
  "PLAYER_GUIDE.md",
  "RELEASE_NOTES.md",
  "release-manifest.json",
  "SHA256SUMS.txt",
  "THIRD_PARTY_NOTICES.md",
  portableName
]);
const requiredPublicFiles = new Map([
  ["ASSET_ATTRIBUTION.md", path.resolve("ASSET_ATTRIBUTION.md")],
  ["LICENSE", path.resolve("LICENSE")],
  ["PLAYER_GUIDE.md", path.resolve("docs", "Office_Aquarium_Player_Guide_Release.md")],
  ["RELEASE_NOTES.md", path.resolve("docs", "PUBLIC_BETA_0.9_RELEASE_NOTES.md")],
  ["THIRD_PARTY_NOTICES.md", path.resolve("THIRD_PARTY_NOTICES.md")]
]);
check(Boolean(installer), "Windows release contains the versioned NSIS installer");
check(entries.includes(portableName), "Windows release contains the versioned portable executable");
check(entries.every(name => allowedStatic.has(name) || name === installer), "Windows release contains only approved files");
check(!entries.some(name => /0\.38\.0|0\.40\.0|CODEX_|WORKLOG|READINESS_AUDIT/i.test(name)), "Windows release excludes stale and private artifacts");
for (const [name, source] of requiredPublicFiles) {
  const packaged = path.join(stage, name);
  check(fs.existsSync(packaged), `Windows release contains required ${name}`);
  check(fs.existsSync(source), `Repository contains source ${name}`);
  if (fs.existsSync(packaged) && fs.existsSync(source)) {
    check(sha256(packaged) === sha256(source), `Windows ${name} matches the current release source`);
  }
}

const manifestPath = path.join(stage, "release-manifest.json");
check(fs.existsSync(manifestPath), "Windows release manifest exists");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  check(manifest.version === release.applicationVersion, "Windows manifest uses the release version");
  check(manifest.packageType === "windows", "Windows manifest identifies the package type");
  check(manifest.offline === true && manifest.telemetry === false, "Windows manifest records offline privacy behavior");
  const badFiles = manifest.files.filter(entry => {
    const file = path.join(stage, ...entry.path.split("/"));
    return !fs.existsSync(file) || fs.statSync(file).size !== entry.bytes || sha256(file) !== entry.sha256;
  });
  check(badFiles.length === 0, "Windows release files match the SHA-256 manifest");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: release.applicationVersion,
  installer,
  portable: portableName,
  failures
}, null, 2));
if (failures.length) process.exit(1);
