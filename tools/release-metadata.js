const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function gameRelease() {
  const context = { globalThis: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(root, "src", "core", "constants.js"), "utf8"),
    context
  );
  return context.globalThis.OFFICE_AQUARIUM_CONSTANTS.release;
}

function packageMetadata() {
  return JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
}

function tauriMetadata() {
  return JSON.parse(fs.readFileSync(path.join(root, "src-tauri", "tauri.conf.json"), "utf8"));
}

function cargoVersion() {
  const cargo = fs.readFileSync(path.join(root, "src-tauri", "Cargo.toml"), "utf8");
  return cargo.match(/^\s*version\s*=\s*"([^"]+)"/m)?.[1] || null;
}

function cargoLockVersion() {
  const lock = fs.readFileSync(path.join(root, "src-tauri", "Cargo.lock"), "utf8");
  return lock.match(/\[\[package\]\]\s+name\s*=\s*"office-aquarium"\s+version\s*=\s*"([^"]+)"/m)?.[1] || null;
}

function verify() {
  const release = gameRelease();
  const versions = {
    constants: release.applicationVersion,
    package: packageMetadata().version,
    tauri: tauriMetadata().version,
    cargo: cargoVersion(),
    cargoLock: cargoLockVersion()
  };
  const unique = new Set(Object.values(versions));
  if (unique.size !== 1 || unique.has(null)) {
    throw new Error(`Release version mismatch: ${JSON.stringify(versions)}`);
  }
  if (!release.webArchiveName.includes(release.displayVersion.replace(/\s+/g, "_"))) {
    throw new Error(`Web archive name does not identify ${release.displayVersion}.`);
  }
  return { ...release, versions };
}

const command = process.argv[2] || "verify";
const release = verify();
if (command === "archive-name") process.stdout.write(release.webArchiveName);
else if (command === "version") process.stdout.write(release.applicationVersion);
else if (command === "json") process.stdout.write(JSON.stringify(release, null, 2));
else if (command === "verify") process.stdout.write(`${JSON.stringify({ ok: true, release }, null, 2)}\n`);
else throw new Error(`Unknown release metadata command: ${command}`);
