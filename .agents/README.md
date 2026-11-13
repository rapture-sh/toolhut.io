# .agents

Shared, tool-agnostic playbooks for AI agents working on toolhut. Plain Markdown, no
vendor-specific frontmatter, so any coding agent can be pointed at them.

| Playbook | Use it for |
| --- | --- |
| [tool-builder.md](tool-builder.md) | Adding a new tool, or restructuring an existing one |
| [privacy-auditor.md](privacy-auditor.md) | Checking a diff or the repo for anything that leaks user data |
| [test-author.md](test-author.md) | Writing the Vitest and Testing Library tests that are missing |

Repo-wide rules live in [AGENTS.md](../AGENTS.md), not here. These files cover one role
each and assume `AGENTS.md` has been read.

`.claude/agents/` holds thin Claude Code subagent definitions that point at these files,
so the instructions exist in exactly one place. If you change a playbook, you do not
need to touch anything under `.claude/`.
