# Audit Standard

This document defines the standard process for auditing project work.

An audit evaluates existing work against its requirements, project context, and applicable standards.

Auditing and implementation are separate activities.

## 1. Establish Audit Scope

Before auditing:

1. Identify what is being audited.
2. Read `PROJECT.md` and relevant project documentation.
3. Read the relevant Parent Issue and its Sub-Issues when the audit concerns implementation work.
4. Read the applicable requirements and acceptance criteria.
5. Inspect the actual implementation rather than relying only on summaries or previous reports.

Do not expand the audit beyond its intended scope without a clear reason.

## 2. Perform the Audit

Evaluate the work against:

1. The Parent Issue requirements and acceptance criteria.
2. Relevant Sub-Issue requirements.
3. Project-specific requirements and constraints.
4. Applicable global standards.
5. Relevant tests, checks, and observable behavior.

Do not assume that work is correct merely because tests pass or a previous agent reported completion.

## 3. Record Findings

Every actionable finding must clearly state:

1. What is wrong.
2. Where the problem exists.
3. Why it matters.
4. What requirement, expectation, or behavior is affected.
5. Enough evidence or context for another agent to reproduce or understand the problem.

Avoid vague findings such as "improve this", "clean this up", or "could be better" without explaining the concrete problem.

Record findings as comments on the relevant GitHub Issue when the audit concerns tracked work.

When the audit concerns work that is not already tracked, create a new GitHub Issue to capture the findings.

For Pull Request audits, follow §5 instead.

## 4. Finding Severity

Classify findings consistently.

### Critical

The problem prevents safe or correct use of the affected work or creates a severe security, data, or operational risk.

### High

The problem causes significant incorrect behavior, breaks an important requirement, or creates substantial risk.

### Medium

The problem is meaningful and should be corrected but does not prevent the primary functionality from working.

### Low

The problem has limited impact but represents a concrete defect, inconsistency, or maintainability concern.

Do not inflate severity merely to prioritize a finding.

## 5. Pull Request Review

When explicitly asked to review a Pull Request, treat the review as an audit of that Pull Request.

Before reviewing:

1. Read the Pull Request description and discussion.
2. Identify and read the Parent Issue associated with the Pull Request.
3. Read its relevant Sub-Issues.
4. Read the relevant project documentation and requirements.
5. Inspect the complete Pull Request diff.

For every actionable finding:

1. Leave a review comment on the Pull Request.
2. Prefer an inline comment on the relevant code when a specific line or change is responsible.
3. Use a general Pull Request review comment when the finding cannot reasonably be attached to a specific line.
4. Clearly describe the problem, impact, and required correction.
5. Include the finding severity when useful.

Do not keep actionable findings only in the agent's chat response or private notes.

**Every actionable finding discovered during a Pull Request review must be represented by a GitHub review comment.**

After reviewing the complete Pull Request, submit the review with an appropriate overall review state.

If no actionable findings are found, submit an approval when appropriate.

When actionable findings require implementation changes, move the associated Parent Issue to `Need Changes`.

## 6. Audit and Implementation Separation

The auditor must not silently fix findings while performing the audit.

When findings require implementation changes:

1. Record the findings first.
2. Create or update the appropriate work items according to `WORKFLOW.md` when independent tracking is needed.
3. Allow the implementation workflow to handle the changes.

A finding does not automatically require a new Issue or Sub-Issue.

Create a new Issue or Sub-Issue only when the corrective work needs to be tracked independently.

The same agent may perform fixes afterward when explicitly asked, but the audit result must remain distinguishable from the implementation work.

## 7. Follow-Up Work

When a finding belongs to the Parent Issue currently being audited, associate the corrective work with that Parent Issue.

When a finding represents separate work outside the current scope, create an appropriate new Issue rather than expanding the existing Parent Issue without justification.

Use Sub-Issues when multiple independently trackable fixes belong to the same Parent Issue.

## 8. Re-Audit

After audit findings have been addressed:

1. Re-check every relevant finding against the updated implementation.
2. Verify the actual fix rather than relying on the implementation agent's report.
3. Run relevant checks when necessary.
4. Confirm that the fix did not introduce new problems within the audit scope.
5. Record whether each finding is resolved or remains open.

For Pull Request re-reviews:

1. Revisit the corresponding review comments.
2. Verify each requested correction.
3. Respond to or resolve review discussions as appropriate.
4. Submit an updated review state.
5. Leave unresolved findings open when they have not actually been corrected.

Do not treat a finding as resolved solely because code was changed.

## 9. Audit Completion

An audit is complete when:

1. The intended scope has been inspected.
2. Actionable findings have been recorded.
3. Findings contain enough information to be acted upon.
4. The audit result clearly identifies unresolved findings.

An audit with findings is still a completed audit.

Passing the audit and completing the audit are not the same thing.
