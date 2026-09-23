# Documentation Standard

This document defines where project information should live and when documentation must be created or updated.

## 1. Information Scope

Information belongs to one of three scopes.

### Global

Global documentation contains rules that apply across projects.

Examples include workflow, Git, documentation, audit, and project-creation standards.

Do not duplicate global rules in project-specific documentation.

### Project

Project documentation contains durable knowledge required to understand or maintain the project.

Examples include:

* Project purpose and scope.
* Architecture and important technical decisions.
* Public interfaces and contracts.
* Project-specific conventions and constraints.
* Setup, operation, and maintenance information.

Project documentation should remain useful after the task that created it has been completed.

### Task

Task-specific information belongs in GitHub Issues.

Examples include:

* Task requirements.
* Acceptance criteria.
* Implementation plans.
* Progress notes.
* Investigation results.
* Task-specific decisions.
* Review or audit findings related to the work.
* Follow-up work.

Do not create repository Markdown files solely to store temporary task information.

## 2. Project Entry Point

Every project must contain `PROJECT.md`.

`PROJECT.md` is the entry point for project-specific knowledge.

It should provide:

1. A concise project overview.
2. Current scope and important boundaries.
3. Important project-specific instructions or constraints.
4. References to additional project documentation when they exist.

At minimum, `PROJECT.md` must be sufficient for an agent to understand what the project does and begin work without requiring user clarification on scope.

`PROJECT.md` should document what verification steps are expected before delivery, or reference a document that does.

Do not turn `PROJECT.md` into a copy of every project document.

## 3. Additional Project Documentation

Create additional project documentation only when the information is durable and substantial enough to justify its own document.

The required documents may differ between projects.

For example, a project may require architecture, API, design system, deployment, data model, or operational documentation while another project may not.

`PROJECT.md` must reference important project documentation so agents can discover it predictably.

## 4. During Work

When performing a task:

1. Keep task-specific information in the relevant GitHub Issue or Sub-Issue.
2. Do not create temporary planning or progress Markdown files in the repository.
3. Update existing project documentation when the implementation changes durable documented behavior.
4. Create new project documentation only when new durable knowledge requires it.
5. Keep `PROJECT.md` references current when project documentation is added, moved, or removed.

## 5. Promote Durable Knowledge

Information may begin as task-specific knowledge and later become important to the project as a whole.

When this happens:

1. Preserve the task-specific history in the GitHub Issue.
2. Add the durable result to the appropriate project documentation.
3. Document the resulting decision or behavior rather than copying the entire task discussion.
4. Avoid maintaining the same source of truth in multiple locations.

## 6. Local Configuration

Local machine, user, or agent configuration does not belong in project documentation.

Use `.project.local` for supported local project configuration.

`.project.local` must not be committed.

Do not use `.project.local` as a substitute for application secret management or application environment configuration.

## 7. Keep Documentation Current

Documentation is part of completing work when the work changes documented project knowledge.

Before delivery:

1. Check whether existing documentation has become inaccurate.
2. Update affected documentation.
3. Remove obsolete references when appropriate.
4. Ensure `PROJECT.md` still provides a valid path to important project knowledge.

Do not leave known documentation inconsistencies for a future task unless explicitly recorded as follow-up work.
