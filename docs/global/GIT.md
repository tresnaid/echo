# Git Standard

This document defines the standard Git workflow for project work.

The Parent Issue is the unit of delivery.

By default, one Parent Issue produces one branch, one worktree, and one Pull Request unless explicitly instructed otherwise.

## 1. Prepare the Work

Before modifying the project:

1. Ensure the main working tree is clean.
2. Ensure the local default branch is synchronized with its remote.
3. Create a dedicated branch for the Parent Issue.
4. Create a dedicated Git worktree for that branch.
5. Perform implementation work inside the dedicated worktree.

A dedicated branch and worktree are the default.

Working directly on `main` is allowed only when the user explicitly instructs the agent to do so.

Do not interpret urgency, task size, simplicity, or convenience as permission to work directly on `main`.

When explicitly instructed to work on `main`:

1. Confirm the local `main` branch is clean and synchronized before making changes.
2. Perform only the requested work.
3. Run the same required verification as normal work.
4. Do not create a task branch or worktree unless subsequently requested.

## 2. Branch Scope

A branch represents one Parent Issue.

All required Sub-Issues belonging to that Parent Issue are implemented on the same branch.

Do not create separate branches for Sub-Issues unless explicitly instructed.

Branch names should clearly identify the Parent Issue and the work being performed.

Use the format `{issue-number}-{short-description}`, for example `42-user-auth`.

## 3. Commits

1. Keep commits relevant to the Parent Issue.
2. Do not include unrelated changes.
3. Use a short imperative subject line, for example `Add user authentication`. Add a body when the change needs explanation.
4. Create commits at meaningful implementation points rather than using commits only as arbitrary checkpoints.
5. Ensure relevant checks pass before considering the work ready for delivery.

Multiple commits are allowed when they make the implementation history easier to understand.

## 4. Push

Push the Parent Issue branch to the remote repository after the work is ready to be shared or reviewed.

Configure upstream tracking when pushing the branch for the first time.

Do not force-push unless explicitly required and safe to do so.

## 5. Pull Request

Create one Pull Request for the Parent Issue.

The Pull Request must:

1. Clearly identify the Parent Issue.
2. Describe the completed work.
3. Include the Sub-Issues completed as part of the Parent Issue, when applicable.
4. Include relevant verification or test results.
5. Identify known limitations or unresolved concerns.
6. Link the appropriate GitHub Issues.

Do not create separate Pull Requests for individual Sub-Issues unless explicitly instructed.

## 6. Request Review

After creating a Pull Request:

1. Read `PR_REVIEWER` from `.project.local`.
2. Request that GitHub user as reviewer.
3. Do not consider Pull Request creation complete until the review has been requested.
4. If `.project.local` is missing, `PR_REVIEWER` is not configured, or the reviewer cannot be requested, report the problem instead of silently skipping review.

After changes are made in response to review, request review again when another review cycle is required.

## 7. Updating a Pull Request

When additional changes are required:

1. Continue using the same Parent Issue branch and worktree.
2. Address the requested changes.
3. Run relevant verification again.
4. Commit and push the additional changes.
5. Update the Pull Request when its description or status is no longer accurate.
6. Request review again when the changes are ready for another review cycle.

Do not create a replacement Pull Request merely because changes were requested.

## 8. Merge

Do not merge a Pull Request unless explicitly instructed to do so.

Before merging, ensure required implementation, verification, review, and audit requirements have been satisfied.

## 9. Cleanup

After a Pull Request has been merged:

1. Confirm the merge succeeded.
2. Synchronize the local default branch.
3. Remove the completed worktree when it is no longer needed.
4. Remove the local task branch when safe.
5. Remove the remote task branch when appropriate.

Do not delete branches or worktrees that still contain unmerged work.
