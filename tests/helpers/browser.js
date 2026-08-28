const fs = require("fs");
const { chromium } = require("playwright");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

async function launchBrowser(options = {}) {
  for (const executablePath of chromeCandidates) {
    if (fs.existsSync(executablePath)) {
      return chromium.launch({ headless: true, executablePath, ...options });
    }
  }
  return chromium.launch({ headless: true, ...options });
}

module.exports = { chromeCandidates, launchBrowser };
