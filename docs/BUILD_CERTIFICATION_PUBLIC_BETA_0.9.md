# Office Aquarium Public Beta 0.9 Build Certification

**Certification date:** 2026-07-19
**Application version:** 0.9.0
**Save version:** 41
**Release channel:** Public Beta
**Overall result:** Web package certified; Windows install/launch certification pending

## Test Environment

| Item | Value |
|---|---|
| Operating system | Microsoft Windows NT 10.0.26200.0, 64-bit |
| Logical processors | 8 |
| System memory | Approximately 15.9 GB |
| Node.js | 24.18.0 |
| npm | 11.16.0 |
| Rust | 1.97.0 |
| Cargo | 1.97.0 |

## Source Validation

The release reporter completed all 51 configured groups twice from the final
source state:

```text
Pass 1: 51/51 (100%), 326.6 seconds
Pass 2: 51/51 (100%), 316.1 seconds
```

Coverage includes syntax, static ownership, release metadata, shared constants,
save and runtime recovery, projects, hiring, messages, the Handbook,
accessibility, deterministic continuation, learning boundaries, social
behavior, emotional homeostasis, and long-run result contracts.

The 20-seed-per-strategy Day-365 matrix passed all first-year survival ranges
with zero system errors, timeouts, or false passes.

## Web Package

**Result:** Certified from a clean extracted package.

| Item | Value |
|---|---|
| Archive | `Office_Aquarium_Public_Beta_0.9_itch_web.zip` |
| Size | 3,061,669 bytes |
| SHA-256 | `10965ebc50551d61bfc0e680ca39e1bc85b6997ef433e4769412676a9ecbdf54` |
| Manifest entries | 27 |
| Browser errors | 0 |
| Failed asset requests | 0 |

The automated package check extracted the ZIP to a clean temporary directory
and verified:

- launch and a new eight-employee company
- restart warning, cancel, and confirmation
- save/resume through Day 12
- recruiting and completed onboarding
- active projects, reports, and Weekly Report rendering
- informational Inbox message, filing, Old Messages, and archive detail
- all five primary destinations
- Handbook access
- optional audio assets and fail-soft sound wiring
- runtime recovery notice
- company-loss flow
- corrupt-current/valid-backup recovery and restore
- normal UI exclusion of developer controls

## Windows Package

**Result:** Not certified from the final source state.

An earlier 0.9.0 installer and portable executable exist locally, but they
predate the final hardening documents and package manifest. They are not release
artifacts.

The Windows release workflow now includes optional code signing support. When a
trusted code-signing certificate is provided, the build signs the raw Tauri
executable before bundling and then signs the packaged portable executable and
installer after they are copied into `dist/windows`.

Supported signing inputs:

- `OFFICE_AQUARIUM_SIGN_CERT_THUMBPRINT` for a certificate installed in the
  current user's certificate store.
- `OFFICE_AQUARIUM_SIGN_CERT_PATH` and `OFFICE_AQUARIUM_SIGN_CERT_PASSWORD` for
  a `.pfx` certificate.
- `OFFICE_AQUARIUM_SIGN_DEV_CERT=1` for local developer-only signing. This is
  not a public release certificate and is trusted only on machines where the
  developer certificate has been explicitly installed and trusted.

The hardened release workflow requires:

1. a clean Tauri build
2. strict current-file and manifest integrity
3. temporary-folder installation
4. installed-app launch
5. save, quit, relaunch, and continue
6. audio, Handbook, hiring, project, Inbox, archive, and recovery checks
7. clean uninstall

This managed environment blocks newly built unsigned executable launch and its
execution allowance prevented a final rebuild-and-launch cycle. This report
therefore does not claim Windows launch certification. The release workflow
must pass on a normal Windows runner before a Windows package is published.

## Security And Contents

- Tauri uses a local-only Content Security Policy.
- Remote network sources are disallowed.
- The application contains no telemetry or online API dependency.
- Public packages exclude tests, private `CODEX_*.md` plans, logs, `misc/`,
  build caches, and developer output.
- Project license, asset attribution, and generated third-party notices are
  included.

## Certification Decision

The web package is certified for distribution testing. The complete
cross-platform Public Beta is not certified until the Windows package passes
its clean install, launch, continue, and uninstall cycle.
