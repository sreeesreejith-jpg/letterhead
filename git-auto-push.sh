#!/bin/bash

# Configuration
REPO_DIR="/var/www/html/letterhead"
COMMIT_MESSAGE="Automatic sync: $(date)"
BRANCH="main"
LOG_FILE="/var/www/html/letterhead/git-auto-push.log"

# Log a message with a timestamp
log() {
    echo "$(date): $1" >> "$LOG_FILE"
}

# Move to the repository directory
cd "$REPO_DIR" || { log "Error: Could not enter repo directory."; exit 1; }

# Check if there are changes to commit
if [[ -n $(git status --porcelain) ]]; then
    log "Changes detected. Committing and pushing..."
    git add . >> "$LOG_FILE" 2>&1
    git commit -m "$COMMIT_MESSAGE" >> "$LOG_FILE" 2>&1
    git push origin "$BRANCH" >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "Push successful."
    else
        log "Error: Push failed. Check your git credentials/remote."
    fi
else
    # Optionally log no changes for debugging (commented out to save space)
    # log "No changes to commit."
    :
fi
