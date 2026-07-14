param(
  [string]$ProjectPath = "C:\Users\phass\evolution-of-us",
  [switch]$SkipInstall,
  [switch]$SkipChecks
)
$ErrorActionPreference = "Stop"
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceFull = [System.IO.Path]::GetFullPath($Source).TrimEnd('\')
$ProjectFull = [System.IO.Path]::GetFullPath($ProjectPath).TrimEnd('\')
Write-Host "Evolution of Us v0.9.42 — Decision Focus & Expressive Status" -ForegroundColor Cyan
Write-Host "ปุ่มตัดสินใจเด่นขึ้น · คืนหน้าต่างเหตุการณ์ · ตัวอักษรคนอ่านง่าย · แถบสถานะมีอารมณ์ร่วม" -ForegroundColor Cyan
Write-Host "Source : $SourceFull" -ForegroundColor DarkGray
Write-Host "Target : $ProjectFull" -ForegroundColor DarkGray
if ($SourceFull -eq $ProjectFull) { throw "โฟลเดอร์ต้นทางและโครงการต้องเป็นคนละตำแหน่ง" }
if (!(Test-Path $ProjectFull)) { New-Item -ItemType Directory -Path $ProjectFull -Force | Out-Null }
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$projectParent = Split-Path -Parent $ProjectFull
$projectName = Split-Path -Leaf $ProjectFull
$backupRoot = Join-Path $projectParent ("${projectName}_backup_before_v0942_$timestamp")
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$items = @("app","data","docs","types","logic","engine","save","tests","package.json","package-lock.json","tsconfig.json","next.config.ts","next-env.d.ts","postcss.config.mjs",".gitignore","README.md","QUALITY_CHECK.md","AUDIT_REPORT_v0942.md","AUDIT_RESULT_v0942.txt")
$backedUp = 0
foreach ($item in $items) {
  $existing = Join-Path $ProjectFull $item
  if (Test-Path $existing) {
    $target = Join-Path $backupRoot $item
    $parent = Split-Path -Parent $target
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Copy-Item $existing $target -Recurse -Force
    $backedUp++
  }
}
if ($backedUp -gt 0) { Write-Host "สำรองไฟล์เดิมแล้ว: $backupRoot" -ForegroundColor DarkGray } else { Remove-Item $backupRoot -Recurse -Force }
foreach ($item in $items) {
  $src = Join-Path $SourceFull $item
  if (!(Test-Path $src)) { continue }
  $dst = Join-Path $ProjectFull $item
  if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
  Copy-Item $src $dst -Recurse -Force
}
foreach ($generated in @(".next","tsconfig.tsbuildinfo")) { $p = Join-Path $ProjectFull $generated; if (Test-Path $p) { Remove-Item $p -Recurse -Force } }
Push-Location $ProjectFull
try {
  if (!$SkipInstall) { npm ci --no-audit --no-fund; if ($LASTEXITCODE -ne 0) { throw "npm ci ไม่สำเร็จ" } }
  if (!$SkipChecks) { npm run check; if ($LASTEXITCODE -ne 0) { throw "การตรวจระบบไม่ผ่าน" } }
} finally { Pop-Location }
Write-Host "อัปเดต v0.9.42 สำเร็จ" -ForegroundColor Green
Write-Host "เปิดเกม: cd `"$ProjectFull`"; npm run dev" -ForegroundColor Green
Write-Host "อัป Vercel: git add -A; git commit -m `"update v0.9.42 decision focus and expressive status`"; git push" -ForegroundColor Green
