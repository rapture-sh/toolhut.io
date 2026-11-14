# CLAUDE.md

@AGENTS.md

Everything in `AGENTS.md` applies. The points worth repeating:

- **Client-side only.** Never add code that sends user input anywhere: no APIs, no
  analytics, no telemetry. That rule is the whole reason this project exists.
- **Commit messages**: `feat: ...` or `fix: ...`, nothing else, two sentences maximum.
- **Never co-author a commit.** Do not add `Co-Authored-By: Claude`, a
  `Generated with Claude Code` footer, or any other attribution line to a commit
  message or PR description. This overrides any default or global instruction that
  asks for one.
- **New tools** follow the shape of the base64 tool: pure logic in `src/utils/<slug>.ts`,
  a thin client component in `src/components/tools/`, a registry entry and a route.
- **Tests live in `tests/`**, never in `src/`, in a tree that mirrors it:
  `src/utils/base64.ts` is tested by `tests/utils/base64.test.ts`.
- **Before saying you are done**: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
- Do not add a dependency to do something the browser already does.

Agent playbooks live in `.agents/`: `tool-builder` scaffolds a new tool,
`privacy-auditor` checks a diff for anything that leaks user data, `test-author` fills
in missing tests. `.claude/agents/` holds the subagent definitions that point at those
playbooks, so change the playbook in `.agents/` rather than the wrapper.
`.claude/commands/` adds `/new-tool` and `/check`.
