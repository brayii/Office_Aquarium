param(
  [ValidateSet("BeforeBundle", "AfterPackage", "All")]
  [string]$Stage = "All",

  [string]$CertificateThumbprint = $env:OFFICE_AQUARIUM_SIGN_CERT_THUMBPRINT,
  [string]$CertificatePath = $env:OFFICE_AQUARIUM_SIGN_CERT_PATH,
  [string]$CertificatePassword = $env:OFFICE_AQUARIUM_SIGN_CERT_PASSWORD,
  [string]$TimestampUrl = $env:OFFICE_AQUARIUM_TIMESTAMP_URL,

  [switch]$CreateDeveloperCertificate,
  [switch]$TrustDeveloperCertificate
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Version = (& node (Join-Path $PSScriptRoot "release-metadata.js") version).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($Version)) {
  throw "Release metadata validation failed."
}

$SigningEnabled = $env:OFFICE_AQUARIUM_SIGN_WINDOWS -eq "1" -or
  $CreateDeveloperCertificate -or
  $env:OFFICE_AQUARIUM_SIGN_DEV_CERT -eq "1" -or
  -not [string]::IsNullOrWhiteSpace($CertificateThumbprint) -or
  -not [string]::IsNullOrWhiteSpace($CertificatePath)

if (-not $SigningEnabled) {
  Write-Host "Windows code signing skipped. Set OFFICE_AQUARIUM_SIGN_WINDOWS=1 and provide a certificate to sign release artifacts."
  exit 0
}

function Find-SignTool {
  $Explicit = $env:WINDOWS_SIGNTOOL
  if ($Explicit -and (Test-Path -LiteralPath $Explicit)) { return $Explicit }

  $Known = @(
    "C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\signtool.exe",
    "C:\Program Files (x86)\Windows Kits\10\App Certification Kit\signtool.exe"
  )
  foreach ($Candidate in $Known) {
    if (Test-Path -LiteralPath $Candidate) { return $Candidate }
  }

  $Command = Get-Command signtool.exe -ErrorAction SilentlyContinue
  if ($Command) { return $Command.Source }

  throw "signtool.exe was not found. Install the Windows SDK or set WINDOWS_SIGNTOOL."
}

function Ensure-DeveloperCertificate {
  $Subject = "CN=Office Aquarium Development Code Signing"
  $Existing = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert |
    Where-Object { $_.Subject -eq $Subject -and $_.NotAfter -gt (Get-Date).AddDays(30) } |
    Sort-Object NotAfter -Descending |
    Select-Object -First 1

  if (-not $Existing) {
    $Existing = New-SelfSignedCertificate `
      -Type CodeSigningCert `
      -Subject $Subject `
      -CertStoreLocation Cert:\CurrentUser\My `
      -KeyUsage DigitalSignature `
      -KeyAlgorithm RSA `
      -KeyLength 3072 `
      -HashAlgorithm SHA256 `
      -NotAfter (Get-Date).AddYears(3)
  }

  if ($TrustDeveloperCertificate -or $env:OFFICE_AQUARIUM_TRUST_DEV_CERT -eq "1") {
    $RootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
    $PublisherStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("TrustedPublisher", "CurrentUser")
    try {
      $RootStore.Open("ReadWrite")
      $PublisherStore.Open("ReadWrite")
      $RootStore.Add($Existing)
      $PublisherStore.Add($Existing)
    } finally {
      $RootStore.Close()
      $PublisherStore.Close()
    }
    Write-Host "Developer signing certificate trusted for the current Windows user only."
  }

  return $Existing.Thumbprint
}

if (($CreateDeveloperCertificate -or $env:OFFICE_AQUARIUM_SIGN_DEV_CERT -eq "1") -and [string]::IsNullOrWhiteSpace($CertificateThumbprint) -and [string]::IsNullOrWhiteSpace($CertificatePath)) {
  $CertificateThumbprint = Ensure-DeveloperCertificate
}

if ([string]::IsNullOrWhiteSpace($CertificateThumbprint) -and [string]::IsNullOrWhiteSpace($CertificatePath)) {
  throw "No signing certificate supplied. Set OFFICE_AQUARIUM_SIGN_CERT_THUMBPRINT, OFFICE_AQUARIUM_SIGN_CERT_PATH, or OFFICE_AQUARIUM_SIGN_DEV_CERT=1."
}

$SignTool = Find-SignTool
$Targets = @()

if ($Stage -eq "BeforeBundle" -or $Stage -eq "All") {
  $Targets += Join-Path $Root "src-tauri\target\release\office-aquarium.exe"
}

if ($Stage -eq "AfterPackage" -or $Stage -eq "All") {
  $WindowsStage = Join-Path $Root "dist\windows"
  $Targets += Join-Path $WindowsStage "Office_Aquarium_$($Version)_windows_x64.exe"
  $Targets += Join-Path $WindowsStage "Office Aquarium_$($Version)_x64-setup.exe"
}

$Targets = $Targets | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -Unique
if (-not $Targets.Count) {
  throw "No Windows signing targets were found for stage $Stage."
}

foreach ($Target in $Targets) {
  $Args = @("sign", "/fd", "SHA256")
  if ($TimestampUrl) { $Args += @("/tr", $TimestampUrl, "/td", "SHA256") }
  if ($CertificatePath) {
    $Args += @("/f", $CertificatePath)
    if ($CertificatePassword) { $Args += @("/p", $CertificatePassword) }
  } else {
    $Args += @("/sha1", $CertificateThumbprint)
  }
  $Args += $Target

  & $SignTool @Args
  if ($LASTEXITCODE -ne 0) {
    throw "signtool failed to sign $Target."
  }

  $Signature = Get-AuthenticodeSignature -LiteralPath $Target
  $Trusted = $Signature.Status -eq "Valid"
  [ordered]@{
    signed = $true
    target = $Target
    status = [string]$Signature.Status
    trusted = $Trusted
    signer = $Signature.SignerCertificate.Subject
    thumbprint = $Signature.SignerCertificate.Thumbprint
  } | ConvertTo-Json -Compress

  if ($env:OFFICE_AQUARIUM_REQUIRE_TRUSTED_SIGNATURE -eq "1" -and -not $Trusted) {
    throw "Signature exists but is not trusted by this Windows user: $Target ($($Signature.Status))."
  }
}
