# Project Creation Standard

This document defines the standard process for establishing a new project.

Project creation establishes enough project context, repository infrastructure, local configuration, and initial work for future agents to continue through `WORKFLOW.md`.

This process creates the **initial roadmap**. After project creation is complete, new work discovered or requested later is handled through `WORKFLOW.md`.

## 1. Establish Project Context

Before implementation begins:

1. Understand the project's purpose and intended outcome.
2. Define the initial scope and important boundaries.
3. Create `PROJECT.md`.
4. Create additional project-specific documentation only when required.
5. Ensure `PROJECT.md` references important project documentation.

If `PROJECT.md` does not contain enough information to define the initial roadmap, resolve the gaps with the user before proceeding.

Follow `DOCUMENTATION.md` when deciding what belongs in project documentation.

## 2. Initialize Git

1. Initialize the repository with `main` as the default branch.
2. Ensure the required global documents are present:

   * `AGENTS.md`
   * `docs/global/PROJECT_CREATION.md`
   * `docs/global/WORKFLOW.md`
   * `docs/global/GIT.md`
   * `docs/global/DOCUMENTATION.md`
   * `docs/global/AUDIT.md`
3. Ensure required project-specific documents are present.
4. Create `.gitignore`. At minimum it must exclude `.project.local`.
5. Create the initial commit. The initial commit must include `PROJECT.md`, the global documents, and `.gitignore`. Do not include implementation code.
6. Keep the initial repository free of implementation work that has not yet been represented by the initial roadmap.

## 3. Configure Local Project Settings

Create `.project.local` for local user and agent configuration.

The initial structure is:

```ini
GITHUB_REPO=
PR_REVIEWER=
```

`GITHUB_REPO` is the name of the GitHub repository to create.

`PR_REVIEWER` is the GitHub username of the Pull Request reviewer.

Both must be explicitly configured. If either is not already known, ask the user.

Do not guess either value.

See `DOCUMENTATION.md` for `.project.local` policy.

Follow `GIT.md` when using the configured reviewer.

## 4. Create the GitHub Repository

1. Read `GITHUB_REPO` from `.project.local`.
2. Create a GitHub repository using that name.
3. Use private visibility by default unless the user explicitly requests otherwise.
4. Configure the repository as the Git remote.
5. Push `main`.
6. Configure upstream tracking.
7. Verify that the local repository and remote are synchronized.

## 5. Create the GitHub Project

Create or configure a GitHub Project for managing project work.

The Project must provide these workflow fields.

### Status

* `Todo`
* `Ready`
* `In Progress`
* `In Review`
* `Need Changes`
* `Done`

### Priority

* `P0` — Critical
* `P1` — High
* `P2` — Normal
* `P3` — Low

Do not add additional workflow fields unless they serve a concrete project requirement.

## 6. Create the Initial Roadmap

The initial roadmap is represented by GitHub Issues.

Do not create a separate roadmap document unless explicitly required by the project.

1. Break the initial project scope into deliverable units.
2. Create one Parent Issue for each deliverable unit.
3. Create Sub-Issues when a Parent Issue contains multiple independently trackable pieces of work.
4. Do not create Sub-Issues for trivial divisions of work.
5. Associate every Sub-Issue with its Parent Issue.
6. Add the roadmap Issues to the GitHub Project.
7. Define dependencies when one Issue must be completed before another.
8. Assign an appropriate Priority.
9. Assign an appropriate Status.

The standard delivery relationship is:

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

## 7. Make the Roadmap Actionable

For each Parent Issue:

1. Define its goal.
2. Define its scope.
3. Define relevant requirements.
4. Define clear acceptance criteria.
5. Ensure dependencies are represented.
6. Ensure Priority is assigned.
7. Create Sub-Issues when appropriate.

For each Sub-Issue:

1. Define the specific work it represents.
2. Define a clear completion condition.
3. Ensure its Parent Issue is correctly associated.

Issues that are sufficiently defined and have no unfinished blocking dependencies may be moved to `Ready`.

Issues that are known but not yet ready for implementation remain `Todo`.

## 8. Verify the Handoff

Before considering project creation complete, verify that:

1. `PROJECT.md` provides a usable entry point for project context.
2. Required global documents are available.
3. The Git repository is initialized and clean.
4. The GitHub repository exists and `main` is synchronized.
5. `.project.local` exists and is ignored.
6. `GITHUB_REPO` is configured.
7. `PR_REVIEWER` is configured.
8. The GitHub Project exists with the required Status and Priority fields.
9. The initial roadmap is represented by Parent Issues and appropriate Sub-Issues.
10. Dependencies, priorities, and statuses are configured.
11. At least one Parent Issue is `Ready` when actionable implementation work exists.

After this point, normal project work follows `WORKFLOW.md`.
