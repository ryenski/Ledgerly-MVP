---
name: work-ready-issues
description: "Work sequentially through GitHub issues labeled `ready-for-agent` in full AFK mode: select the next issue starting at a requested number, create a branch, implement the issue, open a PR linked with a closing keyword, run verification, perform and post a code review to the issue, address review findings, repeat review/fix cycles until clear, merge into main, and continue to the next ready issue without asking for permission except for hard external blockers. Use when Codex is asked to work off GitHub issues, drain a ready-for-agent queue, start with a specific issue number, or run an issue-to-merge automation loop."
---

# Work Ready Issues

## Overview

Use this workflow to turn a queue of ready GitHub issues into merged PRs, one issue at a time. This is full AFK mode: make reasonable conservative decisions from the issue, repo docs, and existing code; do not ask the user for permission before normal development actions. Keep issue order deterministic, keep each issue isolated on its own branch, and do not begin implementation for the next issue until the current issue is merged.

## AFK Autonomy

- Proceed without asking before reading issues, creating branches, editing files, running tests, committing, pushing, opening PRs, posting review comments, addressing review findings, merging PRs, and starting the next issue.
- Prefer the smallest reversible action that satisfies the issue when details are ambiguous.
- Use repository conventions and existing patterns as the decision source. If conventions conflict, choose the lower-risk option and document the choice in the PR.
- Treat sandbox, network, and GitHub permission prompts as pre-authorized by the user's AFK instruction when the action is necessary for the issue workflow.
- Record decisions, tradeoffs, and skipped alternatives in the issue or PR instead of interrupting the user.
- Continue through the queue until no eligible `ready-for-agent` issues remain or a hard blocker prevents progress.

## Prerequisites

- Confirm the repository and tracker from local agent docs when present, especially `AGENTS.md`, `docs/agents/issue-tracker.md`, and repo-specific contribution docs.
- Use the GitHub app tools for issue, PR, review, and merge operations when available. Use `gh` only when the app lacks a needed capability.
- Inspect the worktree before changing code. Never overwrite unrelated local changes.
- If the user gives a start issue number, treat lower-numbered matching issues as out of scope for that run.
- If branch naming is not specified, use `agent/issue-<number>-<short-slug>`.

## Queue Selection

1. Fetch open issues with label `ready-for-agent`.
2. Sort by issue number ascending unless the user specifies another ordering.
3. Start at the requested issue number when provided, for example `#2`.
4. Skip issues that are closed, already have an active PR, are blocked by comments or labels, or cannot be understood after reading the issue.
5. Work exactly one issue at a time. Do not create branches or PRs for later issues while the current issue is active.

Post a short issue comment before starting if the project convention expects claiming work. Keep it factual: say that work is starting, name the branch, and mention the expected PR.

## Per-Issue Loop

For each selected issue:

1. Read the issue body, comments, linked docs, and relevant code. Restate the acceptance criteria internally before editing.
2. Update from `main`, then create a branch for only this issue.
3. Implement the smallest complete vertical slice that satisfies the issue. Follow repo instructions, including architecture-doc updates after code changes when required.
4. Run focused tests first, then the repo's normal verification for the touched area. If verification cannot run, record the reason.
5. Open a PR against `main`. Include `Closes #<issue-number>` in the PR body so merge closes the issue.
6. Request or perform code review as the project permits.
7. Post the code review result to the PR. Include findings, severity, and verification status.
8. Address every actionable review finding. If a finding is invalid, explain why in the PR thread.
9. Repeat review and fix cycles until there are no unresolved actionable findings.
10. Merge the PR into `main` after required checks pass and review is clear.
11. Update local `main` after the merge, then select the next ready issue.

## Review Standard

Use a real code-review stance:

- Lead with defects, regressions, missing tests, unclear behavior, and security or data risks.
- Include file and line references for findings when possible.
- Prefer concise findings over broad summaries.
- If there are no findings, say that clearly and note remaining test gaps or residual risk.
- Treat review findings as blocking until fixed, explicitly declined with reasoning, or made out of scope by the user.

When posting review to the PR, use this shape:

```markdown
Code review for PR #<pr-number>:

Findings:
- <severity> <file:line> <problem> <fix>

Verification:
- <command>: <result>

Status:
- <clear | needs fixes | blocked>
```

## Subagents

Use subagents only inside the current issue's boundary. Good uses:

- Exploration of different code areas relevant to the same issue.
- Independent code review after implementation.
- Verification or test-failure investigation while the main agent handles another non-overlapping task.

Do not use subagents to start later issues in parallel. Tell workers they are not alone in the codebase, assign clear file ownership, and require changed file paths in their final response.

## Stop Conditions

- Stop only for hard blockers that cannot be resolved from the issue, repo docs, codebase, GitHub metadata, or conservative engineering judgment.
- Stop and report if required GitHub, CI, or merge permissions are missing.
- Stop after the queue has no open `ready-for-agent` issues at or above the requested starting issue.
- Do not merge with failing required checks unless repository policy explicitly allows it.

## Ledgerly-MVP Defaults

For `ryenski/Ledgerly-MVP`, read `AGENTS.md` first. The repo tracks issues in GitHub, requires PRs to link issues with closing keywords, and requires relevant architecture diagram docs, primarily `docs/architecture.md`, to be updated after codebase changes.
