$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$DistRoot = Join-Path $Root "dist"
$Stage = Join-Path $DistRoot "itch-web"
$ZipPath = Join-Path $DistRoot "Office_Aquarium_itch_web.zip"

if (-not (Test-Path (Join-Path $Root "Office_Aquarium.html"))) {
  throw "Office_Aquarium.html was not found. Run this script from the project folder."
}

New-Item -ItemType Directory -Force -Path $DistRoot | Out-Null

$ResolvedStage = [System.IO.Path]::GetFullPath($Stage)
$ResolvedDist = [System.IO.Path]::GetFullPath($DistRoot)
if (-not $ResolvedStage.StartsWith($ResolvedDist, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to clean a path outside dist."
}

if (Test-Path $Stage) {
  Remove-Item -LiteralPath $Stage -Recurse -Force
}
if (Test-Path $ZipPath) {
  Remove-Item -LiteralPath $ZipPath -Force
}

New-Item -ItemType Directory -Force -Path $Stage | Out-Null

Copy-Item -LiteralPath (Join-Path $Root "Office_Aquarium.html") -Destination (Join-Path $Stage "index.html")
Copy-Item -LiteralPath (Join-Path $Root "README.md") -Destination (Join-Path $Stage "README.md")
Copy-Item -LiteralPath (Join-Path $Root "src") -Destination (Join-Path $Stage "src") -Recurse
Copy-Item -LiteralPath (Join-Path $Root "assets") -Destination (Join-Path $Stage "assets") -Recurse

if (Test-Path (Join-Path $Root "docs\Office_Aquarium_Player_Manual.md")) {
  New-Item -ItemType Directory -Force -Path (Join-Path $Stage "docs") | Out-Null
  Copy-Item -LiteralPath (Join-Path $Root "docs\Office_Aquarium_Player_Manual.md") -Destination (Join-Path $Stage "docs\Office_Aquarium_Player_Manual.md")
}

$PackageItems = Get-ChildItem -LiteralPath $Stage -Force
Compress-Archive -LiteralPath $PackageItems.FullName -DestinationPath $ZipPath -Force

Write-Host "Created $ZipPath"
Write-Host "Upload this ZIP to itch.io as an HTML game."
