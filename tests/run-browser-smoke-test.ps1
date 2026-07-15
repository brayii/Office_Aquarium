$NodePath = "C:\Users\angel\.cache\codex-runtimes\codex-primary-runtime\dependencies\node"
$NodeExe = Join-Path $NodePath "bin\node.exe"
$env:NODE_PATH = @(
  (Join-Path $NodePath "node_modules\.pnpm\node_modules"),
  (Join-Path $NodePath "node_modules")
) -join ";"

& $NodeExe "tests\browser-smoke-test.js"
