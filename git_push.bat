@echo off
REM ==========================================================================
REM  Dance Directory - safe sync and push   (rewritten 2026-09-29)
REM
REM  The old version of this script backed up 7 files to TEMP, ran
REM  "git reset --hard origin/main", then copied those stale backups back over
REM  the fresh checkout. That silently reverted newer work already on GitHub,
REM  e.g. the Dance Booking Rank entries in app/sitemap.ts (see
REM  docs/dancebookingrank.md) and the Sept 2026 WordPress error-handling fixes.
REM
REM  This version never resets, never overwrites files and never commits for
REM  you. It only rebases the commits you already made on top of origin/main
REM  and pushes them. Commit your changes yourself first (git add <files>,
REM  git commit -m "...").
REM ==========================================================================
cd /d "%~dp0"
echo Working in: %CD%

if exist .git\index.lock del /f .git\index.lock
if exist .git\HEAD.lock del /f .git\HEAD.lock
if exist .git\config.lock del /f .git\config.lock

echo.
echo [1/4] Fetching latest from GitHub...
git fetch origin
if errorlevel 1 (echo ERROR: git fetch failed & pause & exit /b 1)

echo.
echo [2/4] Checking for uncommitted changes...
git diff --quiet
if errorlevel 1 (echo You have uncommitted changes. Commit or stash them first, then run this again. & git status --short & pause & exit /b 1)
git diff --cached --quiet
if errorlevel 1 (echo You have staged but uncommitted changes. Commit them first, then run this again. & git status --short & pause & exit /b 1)

set AHEAD=0
for /f %%i in ('git rev-list --count origin/main..HEAD') do set AHEAD=%%i
if "%AHEAD%"=="0" (echo Nothing to push: no local commits ahead of origin/main. & pause & exit /b 0)
echo   %AHEAD% local commit(s) to push.

echo.
echo [3/4] Rebasing your commits on top of origin/main...
git rebase origin/main
if errorlevel 1 (echo ERROR: rebase hit a conflict. Aborting so nothing is lost. Resolve it by hand. & git rebase --abort & pause & exit /b 1)

echo.
echo [4/4] Pushing to GitHub...
git push origin HEAD:main
if errorlevel 1 (echo ERROR: git push failed & pause & exit /b 1)

echo.
echo SUCCESS: pushed %AHEAD% commit(s) on top of the latest origin/main.
pause
