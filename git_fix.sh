#!/bin/bash
echo "--- Git Diagnose ---"
echo "Current Directory: $(pwd)"
echo "Current Branch: $(git branch --show-current)"
echo "Remote URL: $(git remote -v)"
echo "--- Git Status ---"
git status
echo "--- Performing Fix ---"
git add components/HRSalaryComponents.tsx
git commit -m "fix: remove Export to CSV button (Final Push)"
git push origin main --force
echo "--- Post Push Status ---"
git log -n 1
