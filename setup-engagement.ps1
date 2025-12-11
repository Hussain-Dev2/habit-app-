# Engagement Features Setup Script

Write-Host "🚀 Setting up new engagement features..." -ForegroundColor Cyan
Write-Host ""

# Check if Prisma is available
Write-Host "📦 Checking Prisma installation..." -ForegroundColor Yellow
if (!(Get-Command "npx" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: npm/npx not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma found!" -ForegroundColor Green
Write-Host ""

# Generate Prisma Client
Write-Host "🔨 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Push database schema
Write-Host "📊 Pushing database schema..." -ForegroundColor Yellow
Write-Host "⚠️  This will update your database. Make sure you have a backup!" -ForegroundColor Magenta
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "⏸️  Setup cancelled." -ForegroundColor Yellow
    exit 0
}

npx prisma db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema updated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update database schema" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 New features added:" -ForegroundColor Cyan
Write-Host "  • 🎯 Daily Challenges - Refresh every 24 hours" -ForegroundColor White
Write-Host "  • 🎮 Mini Games - 4 fun games to play" -ForegroundColor White
Write-Host "  • 🥠 Fortune Cookie - Motivational messages" -ForegroundColor White
Write-Host "  • 🌍 Community Feed - Social interaction" -ForegroundColor White
Write-Host ""
Write-Host "📖 Read NEW_ENGAGEMENT_FEATURES.md for full documentation" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Start your dev server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
