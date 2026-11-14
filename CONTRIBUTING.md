# Contributing to toolhut

Thanks for being here. New tools, fixes and polish are all welcome, and you do not need
permission to start. Open an issue if you want to talk it through first.

## Before you write code

Read [AGENTS.md](AGENTS.md). It is short and it is the actual contract for this repo.
The part that gets PRs rejected if ignored:

> **No user data may leave the browser.** No uploads, no API calls with user input, no
> analytics, no telemetry. If a tool can't be built client-side, it doesn't belong here.

Using an AI agent to help? Point it at `AGENTS.md` and the matching playbook in
`.agents/`. The same rules apply to code it writes.

## What makes a good tool

- **Generally useful.** Something plenty of people reach for: an encoder, a converter,
  a formatter, an image or file utility. Not a one-off for a single niche workflow.
- **Better local than remote.** It should be a tool people currently paste private data
  into some random website to use.
- **Self-contained.** No API keys, no accounts, no server.
- **Honest about limits.** If it can't handle a 2 GB file, say so in the UI.

Not sure if an idea fits? Open an issue describing it. That is cheaper than building it
and finding out.

## Setup

```bash
pnpm install
pnpm dev
```

Node 20+, pnpm 10+.

## Adding a tool

The base64 tool is the reference implementation, so copy its shape.

1. Add the tool to `src/lib/tools/registry.ts`.
2. `src/utils/<slug>.ts`: the real work, as pure functions. No React, no DOM.
3. `tests/utils/<slug>.test.ts`: happy path, empty input, invalid input.
4. `src/components/tools/<slug>-tool.tsx`: `"use client"` component, state and UI only.
   Its test goes in `tests/components/tools/<slug>-tool.test.tsx`.
5. `src/app/tools/<slug>/page.tsx`: the route.

Full detail is in [AGENTS.md](AGENTS.md#adding-a-tool).

## Dependencies

Default answer is no. Use the browser's own APIs first: `TextEncoder`, `Web Crypto`,
`Canvas`, `File System Access` cover most of what tools need. If you do need a package,
say in the PR what it does, why the platform can't, and how big it is.

## Checks

Run these before opening a PR, and make sure they pass:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm lint:fix` fixes most style complaints for you. CI runs the same four.

## Commits

Commit messages are `feat: ...` or `fix: ...` and **at most two sentences**. No other
prefixes, no essays, no emoji.

```
feat: add json formatter with sorted keys
fix: keep base64 output when switching direction
```

No `Co-Authored-By:` trailers and no tool or AI attribution footers, in commit
messages or PR descriptions. The person opening the PR is the author.

Branches: `feat/<short-name>` or `fix/<short-name>`, cut from `main`.

## Pull requests

- One logical change per PR.
- Say what it does and why; include a screenshot for anything visual.
- Note any new dependency and why it earned its place.
- Tests for new logic, and a regression test for any bug you fix.

Reviews are about the code, never the person. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Forking

Fork it, run your own copy, build something else on top; that is what MIT is for. Keep
the copyright notice and credit where the code came from, and we are square.
