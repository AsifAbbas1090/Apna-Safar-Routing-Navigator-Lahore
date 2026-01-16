# Seed Database Script
# This script loads the .env file and runs the seed script

$ErrorActionPreference = "Stop"

Write-Host "🌱 Starting database seed..." -ForegroundColor Green

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Load .env file
if (Test-Path ".env") {
    Write-Host "📄 Loading .env file..." -ForegroundColor Cyan
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            $value = $value -replace '^["'']|["'']$', ''
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  ✓ Loaded: $key" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Verify DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL not found in .env file!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ DATABASE_URL loaded" -ForegroundColor Green
Write-Host "🚀 Running seed script..." -ForegroundColor Cyan

# Run the seed script
npx ts-node prisma/seed-complete.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Database seeded successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Seed failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

