# Git Workflow Script for Appmacro Project
# Usage: ./git-workflow.ps1 [task|commit|merge] [description]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("task", "commit", "merge", "status")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$Description = ""
)

function Show-Status {
    Write-Host "Current Git Status:" -ForegroundColor Cyan
    git status --porcelain
    Write-Host "Current Branch: $(git branch --show-current)" -ForegroundColor Yellow
    
    # Check for uncommitted changes
    $uncommitted = git status --porcelain
    if ($uncommitted) {
        Write-Host "WARNING: You have uncommitted changes!" -ForegroundColor Red
        return $false
    }
    return $true
}

function Start-Task {
    param([string]$TaskDescription)
    
    if (-not $TaskDescription) {
        Write-Host "ERROR: Please provide a task description" -ForegroundColor Red
        return
    }
    
    # Convert to kebab-case
    $kebabCase = $TaskDescription.ToLower() -replace '[^a-z0-9]+', '-' -replace '^-|-$', ''
    $branchName = "feat/$kebabCase"
    
    Write-Host "Starting task: $TaskDescription" -ForegroundColor Green
    
    # Save current work if any
    $uncommitted = git status --porcelain
    if ($uncommitted) {
        Write-Host "Saving current work..." -ForegroundColor Yellow
        git add -A
        git commit -m "wip: save before $TaskDescription" 2>$null
    }
    
    # Switch to main and pull latest
    Write-Host "Switching to main branch..." -ForegroundColor Blue
    git checkout main
    
    # Try to pull (will fail if no remote, but that's ok)
    Write-Host "Pulling latest changes..." -ForegroundColor Blue
    git pull --ff-only 2>$null
    
    # Create new feature branch
    Write-Host "Creating feature branch: $branchName" -ForegroundColor Green
    git checkout -b $branchName
    
    Write-Host "Branch ready: $branchName" -ForegroundColor Green
}

function Make-Commit {
    # Stage all changes
    git add -A
    
    # Check if there are changes to commit
    $staged = git diff --cached --name-only
    if (-not $staged) {
        Write-Host "No changes to commit" -ForegroundColor Yellow
        return
    }
    
    # Get current branch to determine commit type
    $currentBranch = git branch --show-current
    $commitType = "feat"
    
    if ($currentBranch -match "fix/") { $commitType = "fix" }
    elseif ($currentBranch -match "docs/") { $commitType = "docs" }
    elseif ($currentBranch -match "style/") { $commitType = "style" }
    elseif ($currentBranch -match "refactor/") { $commitType = "refactor" }
    elseif ($currentBranch -match "test/") { $commitType = "test" }
    elseif ($currentBranch -match "chore/") { $commitType = "chore" }
    
    # Create commit message
    $branchDesc = $currentBranch -replace '^[^/]+/', '' -replace '-', ' '
    $commitMsg = "$commitType" + ": $branchDesc"
    
    Write-Host "Committing changes..." -ForegroundColor Green
    Write-Host "Message: $commitMsg" -ForegroundColor Gray
    
    git commit -m $commitMsg
    
    Write-Host "Changes committed!" -ForegroundColor Green
}

function Merge-Branch {
    $currentBranch = git branch --show-current
    
    if ($currentBranch -eq "main") {
        Write-Host "ERROR: Already on main branch" -ForegroundColor Red
        return
    }
    
    # Check if we have a GitHub remote
    $remotes = git remote
    if (-not $remotes) {
        Write-Host "No GitHub remote found. Merging locally..." -ForegroundColor Yellow
        
        # Local merge
        git checkout main
        git merge $currentBranch --no-ff
        git branch -d $currentBranch
        
        Write-Host "Branch merged locally and deleted" -ForegroundColor Green
        return
    }
    
    # Try to use GitHub CLI
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        Write-Host "Pushing branch and creating PR..." -ForegroundColor Blue
        
        # Push branch
        git push -u origin HEAD
        
        # Create PR
        $prTitle = "feat: " + ($currentBranch -replace '^[^/]+/', '' -replace '-', ' ')
        gh pr create --title $prTitle --body "(auto-generated)" --base main
        
        # Wait for user confirmation
        Write-Host "Please review and approve the PR, then press Enter to merge..." -ForegroundColor Yellow
        Read-Host
        
        # Merge PR
        gh pr merge --squash --delete-branch --subject $prTitle
        
        # Switch back to main
        git checkout main
        git pull
        
        Write-Host "PR merged and branch deleted!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: GitHub CLI not available. Please install 'gh' or merge manually." -ForegroundColor Red
    }
}

# Main execution
switch ($Action) {
    "status" { 
        Show-Status 
    }
    "task" { 
        if (-not (Show-Status)) {
            Write-Host "WARNING: You have uncommitted work. It will be saved before creating the new branch." -ForegroundColor Yellow
        }
        Start-Task -TaskDescription $Description 
    }
    "commit" { 
        Make-Commit 
    }
    "merge" { 
        Merge-Branch 
    }
} 