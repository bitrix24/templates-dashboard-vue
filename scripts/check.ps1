# Full local verification for Windows (PowerShell). Run: powershell -ExecutionPolicy Bypass -File scripts/check.ps1
# Runs every quality gate the CI runs and stops at the first failure.
$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

function Invoke-Step($name, $cmd) {
    Write-Host "==> $name"
    & cmd /c $cmd
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ $name failed (exit $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Invoke-Step 'pnpm install' 'pnpm install'
Invoke-Step 'lint'         'pnpm run lint'
Invoke-Step 'test'         'pnpm run test'
Invoke-Step 'typecheck'    'pnpm run typecheck'
Invoke-Step 'build'        'pnpm run build'

Write-Host "✅ All checks passed" -ForegroundColor Green
