<#
push-to-github.ps1
Interactive helper to initialize the repo, merge the remote README safely, and push to GitHub.
Run this locally in PowerShell inside the repository folder.

Usage: Open PowerShell, cd to the repo root and run:
  .\push-to-github.ps1

This script will:
 - git init (if needed)
 - git add/commit (if no existing commit)
 - set branch to main
 - offer SSH or HTTPS+PAT push
 - fetch remote and pull with '--allow-unrelated-histories' preferring local files
 - push to origin

Security:
 - If you choose HTTPS+PAT the token will be used only for the push and the remote URL will be restored to the canonical HTTPS URL (without token) afterwards.
 - Do NOT paste tokens into public chat. Run this script locally.
#>

function Ensure-GitInit {
    if (-not (Test-Path .git)) {
        Write-Host "Initializing new git repository..."
        git init
        if ($LASTEXITCODE -ne 0) { throw "git init failed" }
    } else {
        Write-Host "Git repository already initialized."
    }
}

function Ensure-UserConfig {
    $name = git config user.name
    $email = git config user.email
    if (-not $name) { git config user.name "Giorvanni"; Write-Host "Set git user.name to 'Giorvanni' (you can override later)." }
    if (-not $email) { git config user.email "you@example.com"; Write-Host "Set git user.email to 'you@example.com' (please update with your real email later)." }
}

function Commit-IfNeeded {
    if (-not (git rev-parse --verify HEAD 2>$null)) {
        git add .
        git commit -m 'Initial import: IK Engine V2 - brand normalization & fixes'
        if ($LASTEXITCODE -ne 0) { Write-Host "Commit failed or nothing to commit." }
    } else {
        Write-Host "Repository already has a commit. Skipping initial commit."
    }
}

function Add-Or-Set-Remote($remoteUrl) {
    $remotes = git remote
    if ($remotes -contains 'origin') {
        Write-Host "Remote 'origin' already exists. Setting URL to: $remoteUrl"
        git remote set-url origin $remoteUrl
    } else {
        git remote add origin $remoteUrl
    }
}

function Pull-Merge-PreferLocal {
    Write-Host "Fetching remote and attempting to merge (preferring local content on conflicts)..."
    git fetch origin
    # Use recursive strategy with -X ours to prefer local files on conflicts
    git pull origin main --allow-unrelated-histories -s recursive -X ours
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Pull produced conflicts or non-zero exit code. Staging and committing merge results..."
        git add -A
        git commit -m 'Merge remote main (keep local changes)'
        if ($LASTEXITCODE -ne 0) { Write-Host "No merge commit needed or commit failed." }
    }
}

function Push-With-Url($pushUrl) {
    Add-Or-Set-Remote $pushUrl
    Write-Host "Pushing to origin main..."
    git push -u origin main
}

Clear-Host
Write-Host "=== Push to GitHub helper ===" -ForegroundColor Cyan
Write-Host "This script runs locally and will prompt as needed."

Ensure-GitInit
Ensure-UserConfig
Commit-IfNeeded

git branch -M main

# Ask user which method
$choice = Read-Host "Choose push method: (1) SSH (recommended if you have keys)  (2) HTTPS + PAT (enter token securely) -- type 1 or 2"
if ($choice -eq '1') {
    $sshUrl = 'git@github.com:Giorvanni/IKNEXUS.git'
    Add-Or-Set-Remote $sshUrl
    Pull-Merge-PreferLocal
    Write-Host "Now pushing over SSH. Ensure your SSH key is loaded and registered with GitHub."
    git push -u origin main
    Write-Host "Done. Visit: https://github.com/Giorvanni/IKNEXUS" -ForegroundColor Green
    exit 0
} elseif ($choice -eq '2') {
    $username = Read-Host "GitHub username (e.g. Giorvanni)"
    Write-Host "Paste your GitHub Personal Access Token (scoped to repo) when prompted; it will not be stored in this script." -ForegroundColor Yellow
    $secure = Read-Host "Personal Access Token" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

    try {
        $pushUrlWithToken = "https://$($username):$($token)@github.com/Giorvanni/IKNEXUS.git"
        Add-Or-Set-Remote $pushUrlWithToken
        Pull-Merge-PreferLocal
        git push -u origin main

        # restore remote to canonical HTTPS URL without token
        git remote set-url origin https://github.com/Giorvanni/IKNEXUS.git
        Write-Host "Push complete. Remote URL restored to https://github.com/Giorvanni/IKNEXUS.git" -ForegroundColor Green
        Write-Host "Visit: https://github.com/Giorvanni/IKNEXUS"
        exit 0
    } finally {
        # clear token from memory
        $token = $null
    }
} else {
    Write-Host 'Invalid choice. Exiting.' -ForegroundColor Red
    exit 1
}
