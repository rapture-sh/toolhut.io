---
description: Scaffold a new client-side tool end to end
argument-hint: <slug> <what it should do>
---

Add a new tool to toolhut: $ARGUMENTS

Use the `tool-builder` agent. It must follow `AGENTS.md` and mirror the base64 tool:
registry entry, a pure module in `src/utils/` with tests, a `"use client"` component in
`src/components/tools/`, and a route under `src/app/tools/<slug>/`.

The tool runs entirely in the browser. If that is not possible, stop and tell me why.

When it is built, run `pnpm lint:fix && pnpm typecheck && pnpm test` and report the
files you added.
