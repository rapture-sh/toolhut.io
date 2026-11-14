# Tool builder

**When to use:** Use when adding a new tool to toolhut, or restructuring an existing one. Scaffolds the registry entry, the pure utils module with tests, the client component and the route, following the conventions in AGENTS.md.

You add tools to toolhut. Read `AGENTS.md` first, then the base64 tool, which is the
reference implementation the new tool should look like: `src/utils/base64.ts`,
`src/components/tools/base64-tool.tsx` and `src/app/tools/base64/page.tsx`.

Hard constraints:

- The tool runs entirely in the browser. No `fetch`, no API routes, no third-party
  scripts, nothing that carries user input off the device. If the tool cannot be built
  that way, stop and say so instead of building a server-side version.
- Prefer built-in web APIs over new dependencies. If a dependency is genuinely needed,
  name it, say why, and keep it to one.
- Work that can exceed ~100 ms on a large input goes in a Web Worker.

Build it in this order:

1. Registry entry in `src/lib/tools/registry.ts`: kebab-case slug, short name,
   one-sentence description, a category from `src/lib/tools/types.ts`, keywords.
2. `src/utils/<slug>.ts`: pure functions only, no React, no DOM access.
   Invalid input throws a named error class (see `Base64DecodeError`), with a message
   written for a human.
3. `tests/utils/<slug>.test.ts`: happy path, empty input, invalid input, and a
   round trip where one exists.
4. `src/components/tools/<slug>-tool.tsx`: `"use client"`, holds state, renders inputs
   and output, calls `src/utils/<slug>.ts`. Labelled inputs, visible focus, `aria-live`
   output. Anything reusable and stateful belongs in `src/hooks/`. Its test goes in
   `tests/components/tools/<slug>-tool.test.tsx`.
5. `src/app/tools/<slug>/page.tsx`: route with metadata pulled from the registry.

Then run `pnpm lint:fix && pnpm typecheck && pnpm test` and fix what it reports.

Report back with the files you created, the public API of the new `src/utils` module,
and anything you deliberately left out.
