# Global Workflow

This document defines the standard lifecycle of work across all projects.

Detailed Git, documentation, and audit procedures are defined in their respective global documents.

## 1. Understand the Work

Before starting:

1. Read the relevant project context referenced by `PROJECT.md`.
2. Understand the requested outcome.
3. Determine whether the work already has a GitHub Issue.
4. If an Issue exists, read the complete Issue, its relevant discussion, and its relationships.
5. Identify requirements, constraints, and acceptance criteria.
6. Resolve important ambiguity before implementation begins.

## 2. Establish the Unit of Work

All planned implementation work must be represented by a GitHub Issue.

A **Parent Issue** represents one complete unit of delivery.

A Parent Issue may contain **Sub-Issues** representing independently trackable parts of that work. Sub-Issues are optional.

The standard relationship is:

```text
Parent Issue
├── Sub-Issue (optional)
├── Sub-Issue (optional)
└── Sub-Issue (optional)
        ↓
One Pull Request for the Parent Issue
```

**One Parent Issue = One Pull Request.**

Sub-Issues do not create separate Pull Requests unless explicitly instructed.

When new work is identified:

1. Reuse an existing Parent Issue when it already represents the work.
2. Otherwise, create a Parent Issue.
3. Create Sub-Issues only when the Parent Issue contains multiple independently trackable pieces of work.
4. Associate every Sub-Issue with its Parent Issue.
5. Add newly created work to the GitHub Project.
6. Assign appropriate Status and Priority.
7. Represent dependencies when the work is blocked by another Issue.

When given a Sub-Issue directly, identify and read its Parent Issue before proceeding.

The Parent Issue remains the unit of delivery.

## 3. Select the Next Work

When asked to select or take the next task:

1. Consider Parent Issues with `Status = Ready`.
2. Exclude Parent Issues with unfinished blocking dependencies.
3. Select the highest-priority eligible Parent Issue in this order:

   * `P0` — Critical
   * `P1` — High
   * `P2` — Normal
   * `P3` — Low
4. If multiple eligible Parent Issues have the same Priority, select the oldest.
5. Read the selected Parent Issue completely.
6. Read all relevant Sub-Issues before starting.
7. Move the Parent Issue to `In Progress` when work begins.

Do not independently select a Sub-Issue as the next unit of work.

## 4. Prepare

Before changing the implementation:

1. Inspect the relevant existing implementation.
2. Identify the required changes.
3. Determine an implementation approach.
4. Follow `GIT.md` to prepare the working environment.
5. Follow `DOCUMENTATION.md` for task planning and information placement.

## 5. Implement

1. Complete the work defined by the Parent Issue.
2. When Sub-Issues exist, work through the required Sub-Issues under that Parent Issue.
3. Keep changes within the scope of the Parent Issue.
4. Follow project-specific requirements and existing conventions.
5. Avoid unrelated changes.
6. Track task progress according to `DOCUMENTATION.md`.

Close a Sub-Issue when its work has been implemented and verified.

Do not wait for the Parent Issue Pull Request to merge before closing a completed Sub-Issue.

If additional work is discovered, determine whether it belongs within the current Parent Issue or should become separate future work.

Do not silently expand the scope of the Parent Issue.

## 6. Verify

Before considering implementation complete:

1. Verify the Parent Issue's acceptance criteria.
2. When Sub-Issues exist, verify every required Sub-Issue.
3. Run relevant tests and checks.
4. Inspect the resulting changes for unintended modifications.
5. Resolve known relevant failures before proceeding.

## 7. Audit

When an audit or formal review is required, follow `AUDIT.md`.

When asked to review a Pull Request, treat it as an audit activity and follow `AUDIT.md`.

## 8. Deliver

When the Parent Issue and any required Sub-Issues are complete and verified:

1. Ensure required project documentation is current according to `DOCUMENTATION.md`.
2. Follow `GIT.md` to commit, push, and create or update the Pull Request.
3. Create one Pull Request for the Parent Issue.
4. Include its completed Sub-Issues when they exist.
5. Move the Parent Issue to `In Review`.
6. Request the configured reviewer according to `GIT.md`.
7. Do not merge unless explicitly instructed.

When review requires additional implementation, move the Parent Issue to `Need Changes`.

When the changes are ready for another review, return it to `In Review` and request review again.

Move the Parent Issue to `Done` only after the work has been successfully merged or otherwise explicitly accepted as complete.
