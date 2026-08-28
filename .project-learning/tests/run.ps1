$FrameworkRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$RepoRoot = Split-Path -Parent $FrameworkRoot
$BundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$Python = $null

if (Get-Command python -ErrorAction SilentlyContinue) {
  $Python = "python"
} elseif ((Get-Command py -ErrorAction SilentlyContinue) -and ((& py --version 2>$null) -match "Python")) {
  $Python = "py"
} elseif (Test-Path $BundledPython) {
  $Python = $BundledPython
} else {
  throw "No Python runtime found. Install Python or run inside the Codex workspace runtime."
}

Push-Location $RepoRoot
try {
  & $Python (Join-Path $FrameworkRoot "tests\test_framework.py")
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
