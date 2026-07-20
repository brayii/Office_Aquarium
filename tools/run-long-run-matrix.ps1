param(
  [ValidateRange(1, 100)]
  [int]$SeedCount = 20,

  [ValidateRange(1, 2000)]
  [int]$HorizonDays = 365,

  [string]$Strategies = "conservative,balanced,growth-oriented",

  [ValidateRange(1, 32)]
  [int]$Concurrency = 4,

  [switch]$WriteReports
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$env:OFFICE_AQUARIUM_LONG_RUN = "1"
$env:OFFICE_AQUARIUM_SEED_COUNT = [string]$SeedCount
$env:OFFICE_AQUARIUM_HORIZON_DAYS = [string]$HorizonDays
$env:OFFICE_AQUARIUM_STRATEGIES = $Strategies
$env:OFFICE_AQUARIUM_CONCURRENCY = [string]$Concurrency
$env:OFFICE_AQUARIUM_WRITE_REPORTS = if ($WriteReports) { "1" } else { "0" }

Push-Location $Root
try {
  & npm.cmd run test:long-run
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
