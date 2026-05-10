---
name: work-off-github-issues
description: Work through GitHub issues labeled ready-for-agent one at a time, from branch creation through implementation, PR-posted code review, review fixes, PR merge, and the next issue. Use when the user asks to work off ready-for-agent issues, process an issue queue, start from a specific issue number, or keep implementing GitHub issues sequentially.
---

# Work Off GitHub Issues

Implement `ready-for-agent` GitHub issues sequentially in full AFK mode. Finish one issue completely before starting the next.

## Quick Start

1. Confirm the repository from `git remote -v`.
2. List open issues with `ready-for-agent`, ordered by issue number.
3. Start with the issue number requested by the user, or the lowest-numbered eligible issue.
4. For each issue: branch, implement, test, open PR, review, post review to the PR, fix review findings, merge, then continue.

## Queue Rules

- Only work on open issues labeled `ready-for-agent`.
- Work sequentially. Do not implement multiple issues in parallel.
- If the user names a starting issue, skip lower-numbered issues until that issue is complete; then continue upward by issue number.
- Use subagents only for bounded side tasks inside the current issue, such as independent investigation or review. Do not let subagents start another issue.
- If an issue is blocked, underspecified, already solved, or no longer labeled `ready-for-agent`, comment on the issue with the reason and move to the next eligible issue.

## Full AFK Mode

- Assume the user has delegated the whole issue queue. Do not ask permission for routine implementation, testing, branch creation, commits, PR creation, review comments, review fixes, merges, or moving to the next eligible issue.
- Make conservative engineering decisions from the issue, repo docs, existing code patterns, and acceptance criteria.
- When multiple reasonable implementation choices exist, choose the smallest reversible option that satisfies the issue and document the decision in the PR or issue comment.
- Ask the user only when continuing would require credentials or access you do not have, destructive action outside the current issue workflow, spending money, changing product scope, violating explicit repo instructions, or merging with failing relevant checks.
- If a single issue needs human input, comment on that issue with the blocker, leave it open, and continue to the next eligible `ready-for-agent` issue.

## Per-Issue Workflow

### 1. Gather

- Fetch the full issue body, labels, and comments:
  `gh issue view <number> --comments --json number,title,body,labels,comments,url`
- Read repo guidance: `AGENTS.md`, `docs/agents/issue-tracker.md`, domain docs, and relevant ADRs/docs.
- Inspect the code before planning. Prefer `rg` and existing tests to understand local patterns.
- Identify acceptance criteria and any issue comments that modify scope.

### 2. Branch

- Make sure the base branch is current enough for the work. Do not discard unrelated local changes.
- Create a branch named from the issue, for example:
  `issue-<number>-short-slug`
- Keep commits focused on the current issue.

### 3. Implement

- Make the smallest complete change that satisfies the issue.
- Follow existing architecture, style, and test patterns.
- After codebase changes, update relevant architecture docs. The primary doc is `docs/architecture.md`.
- Add or update tests according to risk and behavior changed.

### 4. Verify

- Run the relevant local checks before review.
- If a check cannot be run, capture why and what remains unverified.
- Do not open or merge a PR with known failing relevant checks unless the user explicitly directs it.

### 5. Open PR

- Open a PR for the issue branch.
- Link the issue using a closing keyword in the PR body, such as `Closes #<number>`.
- Include a concise summary and verification results.

### 6. Review

- Review the diff as if reviewing another engineer's PR.
- Prioritize correctness, regressions, missing tests, maintainability, and architecture/documentation drift.
- Post the review to the PR, not the issue and not only in chat. Start with a short heading such as:
  `## Code Review for PR #<pr-number>`
- If there are no findings, say so and note residual risks or test gaps.

### 7. Address Review

- Fix every actionable review finding before merging.
- Re-run relevant checks.
- Repeat review and fixes until there are no unresolved actionable findings.
- Post each follow-up review or resolution summary to the PR.

### 8. Merge And Continue

- Merge the PR into `main` only after review is clean and checks are acceptable.
- Use the repo's preferred merge method when known; otherwise use the GitHub default.
- Return to `main`, update it, and select the next open `ready-for-agent` issue by issue number.
- Stop only when no eligible issues remain, the user redirects you, or every remaining eligible issue is blocked by missing human input.

Prefer the GitHub app tools when the runtime exposes them and they cover the operation. Use `gh` for local branch, status, check, and merge workflows when needed.
