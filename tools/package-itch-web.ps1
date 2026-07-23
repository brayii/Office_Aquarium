$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$DistRoot = Join-Path $Root "dist"
$Stage = Join-Path $DistRoot "itch-web"
$ArchiveName = (& node (Join-Path $PSScriptRoot "release-metadata.js") archive-name).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($ArchiveName)) {
  throw "Release metadata validation failed."
}
$ZipPath = Join-Path $DistRoot $ArchiveName
$HashPath = "$ZipPath.sha256"

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
Get-ChildItem -LiteralPath $DistRoot -File -Filter "Office_Aquarium*itch_web*.zip*" | ForEach-Object {
  $ResolvedArtifact = [System.IO.Path]::GetFullPath($_.FullName)
  if (-not $ResolvedArtifact.StartsWith("$ResolvedDist$([System.IO.Path]::DirectorySeparatorChar)", [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove an artifact outside dist."
  }
  Remove-Item -LiteralPath $_.FullName -Force
}

New-Item -ItemType Directory -Force -Path $Stage | Out-Null

& node (Join-Path $PSScriptRoot "build-single-file-web.js") (Join-Path $Stage "index.html")
if ($LASTEXITCODE -ne 0) {
  throw "Single-file itch web build failed."
}

Copy-Item -LiteralPath (Join-Path $Root "LICENSE") -Destination (Join-Path $Stage "LICENSE")
Copy-Item -LiteralPath (Join-Path $Root "ASSET_ATTRIBUTION.md") -Destination (Join-Path $Stage "ASSET_ATTRIBUTION.md")
Copy-Item -LiteralPath (Join-Path $Root "THIRD_PARTY_NOTICES.md") -Destination (Join-Path $Stage "THIRD_PARTY_NOTICES.md")
Copy-Item -LiteralPath (Join-Path $Root "docs\PUBLIC_BETA_0.9_RELEASE_NOTES.md") -Destination (Join-Path $Stage "RELEASE_NOTES.md")
Copy-Item -LiteralPath (Join-Path $Root "docs\Office_Aquarium_Player_Guide_Release.md") -Destination (Join-Path $Stage "PLAYER_GUIDE.md")

& node (Join-Path $PSScriptRoot "generate-package-manifest.js") $Stage "itch-web"
if ($LASTEXITCODE -ne 0) {
  throw "Release manifest generation failed."
}

$PackageItems = Get-ChildItem -LiteralPath $Stage -Force
Compress-Archive -LiteralPath $PackageItems.FullName -DestinationPath $ZipPath -Force
$Hash = (Get-FileHash -LiteralPath $ZipPath -Algorithm SHA256).Hash.ToLowerInvariant()
"$Hash  $ArchiveName" | Set-Content -LiteralPath $HashPath -Encoding ascii

Write-Host "Created $ZipPath"
Write-Host "Created $HashPath"
Write-Host "Upload this ZIP to itch.io as an HTML game."
