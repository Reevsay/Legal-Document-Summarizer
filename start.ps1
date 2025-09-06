# Windows PowerShell start script for Legal Summarizer
# Usage: Right-click > Run with PowerShell, or run in a pwsh terminal: ./start.ps1

param(
  [string]$BindAddr = '127.0.0.1',
  [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'

${url} = ('http://{0}:{1}' -f $BindAddr, $Port)
Write-Host ("Starting Legal Summarizer on ${url}") -ForegroundColor Cyan

# Ensure UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Activate venv if present
$venvActivate = Join-Path -Path $PSScriptRoot -ChildPath '.venv/Scripts/Activate.ps1'
if (Test-Path $venvActivate) {
  Write-Host 'Activating .venv ...'
  . $venvActivate
}

# Ensure core deps
function Ensure-PyModule($module, $fallbackPackages) {
  & python -c "import $module" 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host ("Installing missing Python module: {0}" -f $module) -ForegroundColor Yellow
    if ($null -ne $fallbackPackages -and $fallbackPackages.Count -gt 0) {
      pip install $fallbackPackages
    } else {
      pip install $module
    }
  }
}

if (Test-Path (Join-Path $PSScriptRoot 'requirements.txt')) {
  Ensure-PyModule -module 'uvicorn' -fallbackPackages @('uvicorn')
  Ensure-PyModule -module 'fastapi' -fallbackPackages @('fastapi')
  Ensure-PyModule -module 'multipart' -fallbackPackages @('python-multipart')
  # Bulk install to catch the rest (quiet if already satisfied)
  pip install -r (Join-Path $PSScriptRoot 'requirements.txt')
} else {
  Ensure-PyModule -module 'uvicorn' -fallbackPackages @('uvicorn')
  Ensure-PyModule -module 'fastapi' -fallbackPackages @('fastapi')
  Ensure-PyModule -module 'multipart' -fallbackPackages @('python-multipart')
}

# Launch server with reload
uvicorn server:app --host $BindAddr --port $Port --reload
