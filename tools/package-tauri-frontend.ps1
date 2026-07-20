$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$DistRoot = Join-Path $Root "dist"
$Stage = Join-Path $DistRoot "desktop"

if (-not (Test-Path (Join-Path $Root "Office_Aquarium.html"))) {
  throw "Office_Aquarium.html was not found. Run this script from the project folder."
}

New-Item -ItemType Directory -Force -Path $DistRoot | Out-Null

$ResolvedStage = [System.IO.Path]::GetFullPath($Stage)
$ResolvedDist = [System.IO.Path]::GetFullPath($DistRoot)
if (-not $ResolvedStage.StartsWith("$ResolvedDist$([System.IO.Path]::DirectorySeparatorChar)", [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to clean a path outside dist."
}

if (Test-Path $Stage) {
  Remove-Item -LiteralPath $Stage -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $Stage | Out-Null

Copy-Item -LiteralPath (Join-Path $Root "Office_Aquarium.html") -Destination (Join-Path $Stage "index.html")
Copy-Item -LiteralPath (Join-Path $Root "src") -Destination (Join-Path $Stage "src") -Recurse
Copy-Item -LiteralPath (Join-Path $Root "assets") -Destination (Join-Path $Stage "assets") -Recurse
Copy-Item -LiteralPath (Join-Path $Root "LICENSE") -Destination (Join-Path $Stage "LICENSE")
Copy-Item -LiteralPath (Join-Path $Root "ASSET_ATTRIBUTION.md") -Destination (Join-Path $Stage "ASSET_ATTRIBUTION.md")
Copy-Item -LiteralPath (Join-Path $Root "THIRD_PARTY_NOTICES.md") -Destination (Join-Path $Stage "THIRD_PARTY_NOTICES.md")
Copy-Item -LiteralPath (Join-Path $Root "docs\PUBLIC_BETA_0.9_RELEASE_NOTES.md") -Destination (Join-Path $Stage "RELEASE_NOTES.md")
Copy-Item -LiteralPath (Join-Path $Root "docs\Office_Aquarium_Player_Guide_Release.md") -Destination (Join-Path $Stage "PLAYER_GUIDE.md")

& node (Join-Path $PSScriptRoot "generate-package-manifest.js") $Stage "tauri-frontend"
if ($LASTEXITCODE -ne 0) {
  throw "Release manifest generation failed."
}

Write-Host "Prepared desktop frontend at $Stage"
