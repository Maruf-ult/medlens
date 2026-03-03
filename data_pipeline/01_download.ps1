# =============================================================
# 01_download.ps1 — Windows version of the MedLens Downloader
# Run: .\data_pipeline\01_download.ps1
# =============================================================

Clear-Host
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    MedLens Dataset Downloader (Windows)      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Ensure directories exist
$paths = "data/raw/mtsamples", "data/raw/medquad", "data/raw/pmcpatients"
foreach ($path in $paths) {
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

# ── 1. MTSamples (Kaggle) ──────────────────────────────────────
Write-Host "📥 [1/3] Downloading MTSamples from Kaggle..." -ForegroundColor Yellow
Write-Host "   Source: https://www.kaggle.com/datasets/tboyle10/medicaltranscriptions"

# Check for Kaggle Credentials
$kaggleJson = "$env:USERPROFILE\.kaggle\kaggle.json"
if (!(Test-Path $kaggleJson)) {
    Write-Host "⚠️  Kaggle credentials not found at $kaggleJson" -ForegroundColor Red
    Write-Host "   1. Go to https://www.kaggle.com/settings"
    Write-Host "   2. Click 'Create New API Token' to download kaggle.json"
    Write-Host "   3. Move it to: $kaggleJson"
    Write-Host ""
} else {
    # Run Kaggle CLI (Assumes 'pip install kaggle' was done)
    kaggle datasets download -d tboyle10/medicaltranscriptions -p data/raw/mtsamples --unzip
    Write-Host "✅ MTSamples downloaded -> data/raw/mtsamples/" -ForegroundColor Green
}

Write-Host ""

# ── 2. MedQuAD (GitHub) ───────────────────────────────────────
Write-Host "📥 [2/3] Downloading MedQuAD from GitHub..." -ForegroundColor Yellow
$medquadPath = "data/raw/medquad/MedQuAD"

if (Test-Path $medquadPath) {
    Write-Host "   Already downloaded, pulling latest changes..."
    Set-Location $medquadPath
    git pull
    Set-Location ../../../../
} else {
    git clone https://github.com/abachaa/MedQuAD.git $medquadPath
}
Write-Host "✅ MedQuAD downloaded -> data/raw/medquad/" -ForegroundColor Green

Write-Host ""

# ── 3. PMC-Patients (HuggingFace) ────────────────────────────
Write-Host "📥 [3/3] PMC-Patients — Pre-check..." -ForegroundColor Yellow
Write-Host "   (Note: This is a massive dataset. It will be streamed by 04_pmcpatients.py)"
Write-Host "   Source: https://huggingface.co/datasets/zhengyun21/PMC-Patients"

Write-Host ""

# ── 4. MIMIC-IV ───────────────────────────────────────────────
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "⚠️  MIMIC-IV REQUIRES MANUAL ACCESS:" -ForegroundColor Magenta
Write-Host "   Step 1: CITI Training (Data or Specimens Only Research)"
Write-Host "   Step 2: Register & Request at PhysioNet (https://physionet.org/)"
Write-Host "   Step 3: Once approved, place 'discharge.csv' at:"
Write-Host "           data/raw/mimic/discharge.csv"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Windows download script complete!" -ForegroundColor Green
Write-Host "Next step: python data_pipeline/02_mtsamples.py"