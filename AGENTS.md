# AGENTS.md

Guide for humans and AI agents working in this repo. Read this before writing code.

## What toolhut is

toolhut is a collection of small, everyday tools: encoders, converters, formatters,
image and file utilities. Most tools on the web upload your data to a server to do
work your own machine can do perfectly well. toolhut does not. **Every tool runs
entirely in the browser.**

It is part of [Rapture.sh](https://rapture.sh) and is MIT licensed.

## The rules that matter

1. **No user data leaves the device.** No uploads, no API calls carrying user input,
   no analytics, no error reporting that includes input. If a tool cannot work
   client-side, it does not belong here.
2. **No accounts, no server state.** There is no database and no backend. Anything a
   tool needs to remember goes in `localStorage` or `IndexedDB`, and only with a
   clear reason.
3. **Prefer the platform.** Use built-in web APIs (`TextEncoder`, `Web Crypto`,
   `Canvas`, `OffscreenCanvas`, `File System Access`) before adding a dependency. A
   new dependency needs a reason in the PR description.
4. **Keep heavy work off the main thread.** Anything that can take more than ~100 ms
   on a large input belongs in a Web Worker.
5. **Tools should be generally useful.** Something many people reach for, not a
   one-off for a single niche workflow. If you are unsure, open an issue first.

## Stack

- Next.js (App Router) + React, static-friendly, no server-side processing of input
- TypeScript, strict
- Tailwind CSS v4
- Biome for lint + format
- Vitest + Testing Library for tests

## Commands

```bash
pnpm install        # install dependencies
pnpm dev            # dev server on http://localhost:3000
pnpm test           # run unit tests once
pnpm test:watch     # run unit tests in watch mode
pnpm test:coverage  # tests with coverage
pnpm typecheck      # tsc --noEmit
pnpm lint           # biome check (lint + format check)
pnpm lint:fix       # biome check --write
pnpm build          # production build
```

Before you call work done: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

## Layout

```
src/
  app/                        # routes only, no tool logic
    page.tsx                  # home page, lists the registry
    tools/<slug>/page.tsx     # one route per tool
  components/                 # shared UI
    site-footer.tsx
    tools/<slug>-tool.tsx     # the client component of one tool
  hooks/                      # reusable client hooks
    use-copy-to-clipboard.ts
  lib/
    tools/registry.ts         # the list of tools (single source of truth)
    tools/types.ts            # Tool metadata type and categories
  utils/
    <slug>.ts                 # the pure logic of one tool
  test/setup.ts               # Vitest setup
```

Where things go:

- `utils/` is pure functions: input in, output out, no React and no DOM. A tool's real
  work lives here, and so does most of the test coverage.
- `hooks/` is reusable client hooks, anything stateful shared between components.
- `lib/` is app-level modules. Right now that is the tool registry and its types.
- `components/` is UI. A tool's own component goes in `components/tools/`.
- `app/` is routes and nothing else. Keep route files thin.

## Adding a tool

1. Add an entry to `src/lib/tools/registry.ts` (kebab-case slug, one-sentence
   description, a category from `types.ts`).
2. Create `src/utils/<slug>.ts`: the actual work, as pure functions that take input and
   return output or throw a typed error. No React in this file.
3. Write `src/utils/<slug>.test.ts` covering the happy path, empty input, and bad input.
4. Create `src/components/tools/<slug>-tool.tsx`: a `"use client"` component holding the
   state and the UI. Keep it dumb, the logic lives in `src/utils/<slug>.ts`.
5. Create `src/app/tools/<slug>/page.tsx`: the route, with metadata from the registry.

The base64 tool is the reference implementation, so copy its shape:
`src/utils/base64.ts`, `src/components/tools/base64-tool.tsx` and
`src/app/tools/base64/page.tsx`.

## Code style

- Biome decides formatting; run `pnpm lint:fix` rather than arguing with it.
- Named exports (`export function Thing()`), not default exports, outside of
  `app/` route files where Next requires a default.
- Import with the `~/` alias (`~/lib/tools/registry`), never long relative paths.
- No `any`, no non-null `!` assertions. Model failure as a typed error class and
  handle it in the component.
- Error messages are for humans: say what is wrong with the input, in plain words.
- Accessibility is not optional: label every input, keep focus states visible, make
  results readable by screen readers (`aria-live` for live output).

## Testing

- Pure logic in `src/utils/` must have unit tests. That is where coverage counts.
- Interactive components get one or two Testing Library tests for the real user path.
- Hooks get tests through `renderHook`.
- Tests sit next to what they test and are named `*.test.ts(x)`.
- Query by role, label or text, not by class name or test id.

## Agent playbooks

`.agents/` holds one playbook per role in plain Markdown, with no vendor frontmatter, so
any coding agent can be pointed at them:

- `.agents/tool-builder.md` builds a new tool end to end.
- `.agents/privacy-auditor.md` audits a diff for anything that leaks user data.
- `.agents/test-author.md` writes the tests that are missing.

For Claude Code, `.claude/agents/` wraps each playbook as a subagent and
`.claude/commands/` adds `/new-tool` and `/check`. The instructions themselves stay in
`.agents/` only, so nothing has to be kept in sync.

Rules that apply to everyone belong in this file, not in a playbook.

## Git

- Branch from `main`: `feat/<short-name>` or `fix/<short-name>`.
- **Commit messages are `feat: ...` or `fix: ...` only, and at most two sentences.**
  No other prefixes, no bodies that ramble, no emoji.

  ```
  feat: add base64 encoder and decoder
  fix: decode base64 with whitespace in it
  ```

- **No co-author trailers, no tool attribution.** A commit message is the one
  `feat:`/`fix:` line and nothing else. Never append `Co-Authored-By:` trailers,
  `Generated with ...` footers, or any other credit for an AI agent, editor or tool.
  Not in commit messages, not in PR descriptions. The human who opened the PR is the
  author.
- One logical change per PR. Keep the diff readable.
