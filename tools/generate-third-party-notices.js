const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const manifest = path.join(root, "src-tauri", "Cargo.toml");
const output = path.join(root, "THIRD_PARTY_NOTICES.md");
const metadataResult = spawnSync(
  "cargo",
  ["metadata", "--locked", "--format-version", "1", "--filter-platform", "x86_64-pc-windows-msvc", "--manifest-path", manifest],
  { encoding: "utf8", maxBuffer: 100 * 1024 * 1024 }
);
if (metadataResult.status !== 0) {
  throw new Error(`Cargo metadata failed: ${metadataResult.stderr || metadataResult.stdout}`);
}

const metadata = JSON.parse(metadataResult.stdout);
const packages = metadata.packages
  .filter(pkg => pkg.source)
  .sort((left, right) => left.name.localeCompare(right.name) || left.version.localeCompare(right.version));
const licenseGroups = new Map();
const missingLicenseText = [];

for (const pkg of packages) {
  const directory = path.dirname(pkg.manifest_path);
  const licenseFiles = fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && /^(LICENSE|COPYING|NOTICE)/i.test(entry.name))
    .map(entry => path.join(directory, entry.name));
  if (!licenseFiles.length) {
    missingLicenseText.push(`${pkg.name} ${pkg.version}`);
    continue;
  }
  for (const file of licenseFiles) {
    const text = fs.readFileSync(file, "utf8")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map(line => line.trimEnd())
      .join("\n")
      .trim();
    if (!text) continue;
    const hash = crypto.createHash("sha256").update(text).digest("hex");
    const group = licenseGroups.get(hash) || { text, packages: new Set() };
    group.packages.add(`${pkg.name} ${pkg.version}`);
    licenseGroups.set(hash, group);
  }
}

const inventory = packages.map(pkg =>
  `| ${pkg.name} | ${pkg.version} | ${pkg.license || "Not declared"} |`
).join("\n");
const texts = [...licenseGroups.values()]
  .sort((left, right) => [...left.packages][0].localeCompare([...right.packages][0]))
  .map(group => {
    const names = [...group.packages].sort().join(", ");
    return `## License Text for ${names}\n\n\`\`\`text\n${group.text}\n\`\`\``;
  })
  .join("\n\n");

const notice = `# Third-Party Notices

This file is generated from the locked Tauri dependency graph by
\`node tools/generate-third-party-notices.js\`. It records dependencies included
in the optional Windows desktop binary. Office Aquarium's browser runtime has
no third-party JavaScript dependency.

Microsoft Edge WebView2 Runtime is supplied separately by Microsoft as part of
the Windows web-platform environment and remains subject to Microsoft's terms.
The Tauri CLI and Playwright are build/test tools and are not shipped in the
browser package.

## Locked Windows Runtime Inventory

| Package | Version | Declared license |
|---|---:|---|
${inventory}

${missingLicenseText.length ? `## Packages Without a Local License File

The following locked packages declared license metadata but did not include a
root-level LICENSE, COPYING, or NOTICE file in the local Cargo source cache:

${missingLicenseText.map(name => `- ${name}`).join("\n")}

Their declared license expressions remain listed in the inventory above.

` : ""}${texts}
`;

fs.writeFileSync(output, notice);
console.log(JSON.stringify({
  ok: true,
  output: path.relative(root, output),
  packages: packages.length,
  uniqueLicenseTexts: licenseGroups.size,
  missingLicenseText
}, null, 2));
