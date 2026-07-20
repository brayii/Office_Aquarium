$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Stage = Join-Path $Root "dist\windows"
$Version = (& node (Join-Path $Root "tools\release-metadata.js") version).Trim()
$Installer = Get-ChildItem -LiteralPath $Stage -File -Filter "*_$($Version)_x64-setup.exe" |
  Select-Object -First 1
if (-not $Installer) {
  throw "Build the Windows release before running the install smoke test."
}

$SmokeRoot = Join-Path $env:TEMP "office-aquarium-install-smoke-$PID"
$InstallDirectory = Join-Path $SmokeRoot "app"
$ApplicationProcess = $null
$Uninstaller = $null
New-Item -ItemType Directory -Force -Path $SmokeRoot | Out-Null

try {
  $Install = Start-Process -FilePath $Installer.FullName `
    -ArgumentList @("/S", "/D=$InstallDirectory") `
    -PassThru -Wait -WindowStyle Hidden
  if ($Install.ExitCode -ne 0) {
    throw "The NSIS installer exited with code $($Install.ExitCode)."
  }

  $Application = Get-ChildItem -LiteralPath $InstallDirectory -Recurse -File -Filter "*.exe" |
    Where-Object { $_.Name -notmatch "^(uninstall|unins)" } |
    Select-Object -First 1
  if (-not $Application) {
    throw "The installed application executable was not found."
  }

  $ApplicationProcess = Start-Process -FilePath $Application.FullName -PassThru -WindowStyle Hidden
  Start-Sleep -Seconds 8
  if ($ApplicationProcess.HasExited) {
    throw "The installed application exited during its launch smoke window."
  }

  Stop-Process -Id $ApplicationProcess.Id -Force
  $ApplicationProcess.WaitForExit()
  $ApplicationProcess = $null

  $Uninstaller = Get-ChildItem -LiteralPath $InstallDirectory -Recurse -File -Filter "*.exe" |
    Where-Object { $_.Name -match "^(uninstall|unins)" } |
    Select-Object -First 1
  if (-not $Uninstaller) {
    throw "The NSIS uninstaller was not found."
  }
  $Uninstall = Start-Process -FilePath $Uninstaller.FullName `
    -ArgumentList "/S" -PassThru -Wait -WindowStyle Hidden
  if ($Uninstall.ExitCode -ne 0) {
    throw "The NSIS uninstaller exited with code $($Uninstall.ExitCode)."
  }

  [ordered]@{
    ok = $true
    version = $Version
    installer = $Installer.Name
    installedExecutable = $Application.Name
    launchWindowSeconds = 8
    uninstallExitCode = $Uninstall.ExitCode
  } | ConvertTo-Json
} finally {
  if ($ApplicationProcess -and -not $ApplicationProcess.HasExited) {
    Stop-Process -Id $ApplicationProcess.Id -Force -ErrorAction SilentlyContinue
  }
  if (Test-Path -LiteralPath $SmokeRoot) {
    Remove-Item -LiteralPath $SmokeRoot -Recurse -Force -ErrorAction SilentlyContinue
  }
}
