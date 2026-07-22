$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$DistRoot = Join-Path $Root "dist"
$Stage = Join-Path $DistRoot "windows"
$TargetRelease = Join-Path $Root "src-tauri\target\release"
$NsisDirectory = Join-Path $TargetRelease "bundle\nsis"
$Version = (& node (Join-Path $PSScriptRoot "release-metadata.js") version).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($Version)) {
  throw "Release metadata validation failed."
}

New-Item -ItemType Directory -Force -Path $DistRoot | Out-Null

function Remove-ReleaseOutput {
  param(
    [string]$PathToClean,
    [string]$AllowedRoot,
    [switch]$Required
  )

  $ResolvedPath = [System.IO.Path]::GetFullPath($PathToClean)
  $ResolvedRoot = [System.IO.Path]::GetFullPath($AllowedRoot)
  if (-not $ResolvedPath.StartsWith($ResolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to clean a path outside the release output folders."
  }
  if (Test-Path -LiteralPath $PathToClean) {
    try {
      Remove-Item -LiteralPath $PathToClean -Recurse -Force
    } catch {
      if ($Required) { throw }
      Write-Warning "Could not remove cached bundle output at $PathToClean. Continuing so the build can refresh it if Windows releases the file lock. $($_.Exception.Message)"
    }
  }
}

Remove-ReleaseOutput -PathToClean $Stage -AllowedRoot $DistRoot -Required
Remove-ReleaseOutput -PathToClean $NsisDirectory -AllowedRoot $TargetRelease

& npm.cmd run tauri:build
if ($LASTEXITCODE -ne 0) {
  throw "The Windows release build failed."
}

$Executable = Join-Path $TargetRelease "office-aquarium.exe"
$Installer = Get-ChildItem -LiteralPath $NsisDirectory -File -Filter "*_$($Version)_x64-setup.exe" |
  Select-Object -First 1
if (-not (Test-Path -LiteralPath $Executable)) {
  throw "The Windows executable was not produced."
}
if (-not $Installer) {
  throw "The versioned NSIS installer was not produced."
}

& node (Join-Path $PSScriptRoot "generate-third-party-notices.js")
if ($LASTEXITCODE -ne 0) {
  throw "Third-party notice generation failed."
}

New-Item -ItemType Directory -Force -Path $Stage | Out-Null
$PortableName = "Office_Aquarium_$($Version)_windows_x64.exe"
Copy-Item -LiteralPath $Executable -Destination (Join-Path $Stage $PortableName)
Copy-Item -LiteralPath $Installer.FullName -Destination (Join-Path $Stage $Installer.Name)
Copy-Item -LiteralPath (Join-Path $Root "LICENSE") -Destination (Join-Path $Stage "LICENSE")
Copy-Item -LiteralPath (Join-Path $Root "ASSET_ATTRIBUTION.md") -Destination (Join-Path $Stage "ASSET_ATTRIBUTION.md")
Copy-Item -LiteralPath (Join-Path $Root "THIRD_PARTY_NOTICES.md") -Destination (Join-Path $Stage "THIRD_PARTY_NOTICES.md")
Copy-Item -LiteralPath (Join-Path $Root "docs\PUBLIC_BETA_0.9_RELEASE_NOTES.md") -Destination (Join-Path $Stage "RELEASE_NOTES.md")
Copy-Item -LiteralPath (Join-Path $Root "docs\Office_Aquarium_Player_Guide_Release.md") -Destination (Join-Path $Stage "PLAYER_GUIDE.md")

& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "sign-windows-release.ps1") -Stage AfterPackage
if ($LASTEXITCODE -ne 0) {
  throw "The Windows release signing step failed."
}

& node (Join-Path $PSScriptRoot "generate-package-manifest.js") $Stage "windows"
if ($LASTEXITCODE -ne 0) {
  throw "Windows release manifest generation failed."
}

Write-Host "Prepared Windows release at $Stage"
Write-Host "Installer: $($Installer.Name)"
Write-Host "Portable executable: $PortableName"
