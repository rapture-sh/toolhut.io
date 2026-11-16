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
    use-image-file.ts         # decodes a picked image once
  lib/
    tools/registry.ts         # the list of tools (single source of truth)
    tools/types.ts            # Tool metadata type and categories
    download.ts               # hand a blob to the browser
    clipboard.ts              # put an image on the clipboard
    read-file.ts              # what a dropped file is, and its text
    image/canvas.ts           # decode, draw, resize and encode
  utils/
    <slug>.ts                 # the pure logic of one tool

tests/                        # mirrors src/, one test file per module
  setup.ts                    # Vitest setup
  components/tools/<slug>-tool.test.tsx
  hooks/<hook>.test.ts
  lib/tools/registry.test.ts
  utils/<slug>.test.ts
```

Where things go:

- `utils/` is pure functions: input in, output out, no React and no DOM. A tool's real
  work lives here, and so does most of the test coverage.
- `hooks/` is reusable client hooks, anything stateful shared between components.
- `lib/` is app-level modules, including the glue that needs the DOM. Canvas work,
  downloads and the clipboard live here, so `utils/` can stay pure and testable. A
  tool that works on pixels keeps its maths in `utils/` and its drawing in `lib/`.
- `components/` is UI. A tool's own component goes in `components/tools/`.
- `app/` is routes and nothing else. Keep route files thin.
- `components/sections/` is the tail every page carries: why local, how it works, the
  FAQ and the contribute block. They are rendered by the root layout through
  `SiteSections`, so a route only writes what is above them.
- `tests/` sits outside `src/` and mirrors it. See Testing below.

## Adding a tool

1. Add an entry to `src/lib/tools/registry.ts` (kebab-case slug, one-sentence
   description, a category from `types.ts`).
2. Create `src/utils/<slug>.ts`: the actual work, as pure functions that take input and
   return output or throw a typed error. No React in this file.
3. Write `tests/utils/<slug>.test.ts` covering the happy path, empty input, and bad
   input.
4. Create `src/components/tools/<slug>-tool.tsx`: a `"use client"` component holding the
   state and the UI. Keep it dumb, the logic lives in `src/utils/<slug>.ts`.
5. Create `src/app/tools/<slug>/page.tsx`: the route, with metadata from the registry.

The base64 tool is the reference implementation, so copy its shape:
`src/utils/base64.ts`, `src/components/tools/base64-tool.tsx` and
`src/app/tools/base64/page.tsx`.

A tool is `planned` in the registry until all four files exist. A `planned` tool shows
on the home page as a card you cannot click, which is what the registry tests check.

## Shared tool parts

Reuse these rather than building another one. They are what makes every tool feel like
the same site.

- `components/tools/tool-io.tsx`: `ToolPanes`, `ToolField`, `ToolTextarea`,
  `ToolOutput`, `ToolOptions`, `Segmented`, `ToolSlider`, `ToolNumber`, `CopyButton`.
- `components/tools/tool-actions.tsx`: `FileActions`, the download and copy pair.
- `components/tools/drop-zone.tsx`: `DropZone`, the overlay a field shows while a file
  is held over it.
- `components/tools/image-input.tsx`: `ImageInput`, how every image tool takes its
  picture, with `useImageFile` for the decoding.
- `components/tools/code-view.tsx`: `CodeView`, output that is code. Give it the
  language and it colours the parts, so JSON reads the same in every tool. A new
  language is a few rules in `utils/highlight.ts`.
- `components/tools/pdf-input.tsx` and `hooks/use-pdf-file.ts`: how a PDF tool takes
  its file and opens it. The hook keeps the document open for as long as the tool
  needs it, because closing one takes its worker with it and everything after it
  hangs. Never close a document from a component.
- `components/tools/sortable-grid.tsx`: `SortableGrid`, the drag to reorder grid,
  with arrow key moves built in. Used by merge, the organizer and images to PDF.
- `lib/pdf/document.ts` reads with pdf.js, `lib/pdf/build.ts` writes with
  `@cantoo/pdf-lib`. Import the fork, never `pdf-lib` itself, which has not been
  released since 2021. Pages are drawn with the print intent: the display intent
  paces itself with animation frames, and a tab nobody is looking at gets none, so
  a render started in the background would never finish.

Two rules come with them:

- **Every input takes a file.** Drag and drop onto the field, and paste where that makes
  sense. `ToolTextarea` already does this, and `ImageInput` handles both.
- **Download and copy, always together.** Anything a tool produces can be saved or
  copied, through `FileActions`. Browsers only accept PNG on the clipboard, so copying
  an image hands over a PNG whatever the chosen format, and a zip is download only.
  Say so in the UI rather than letting it surprise someone.

## Code style

- Biome decides formatting; run `pnpm lint:fix` rather than arguing with it.
- **No blank lines inside JSX.** Markup runs unbroken from the opening tag to the
  closing one. Blank lines are fine between imports, constants and statements, never
  between elements in a return.
- Named exports (`export function Thing()`), not default exports, outside of
  `app/` route files where Next requires a default.
- Import with the `~/` alias (`~/lib/tools/registry`), never long relative paths.
- No `any`, no non-null `!` assertions. Model failure as a typed error class and
  handle it in the component.
- Error messages are for humans: say what is wrong with the input, in plain words.
- Accessibility is not optional: label every input, keep focus states visible, make
  results readable by screen readers (`aria-live` for live output).

## Colour and theming

All colour lives in `src/app/globals.css` as CSS variables: day values on `:root`,
night values on `.dark`. A component never names a colour that is not a token, so no
hex in a `className`, and no raw Tailwind palette class like `bg-blue-500`.

- **Brand**: lavender `--lavender` is the mark and the primary action, with peach
  `--peach` and mint `--mint` as the counterweights.
- **Surfaces**: the page is `bg-background`, anything raised is `bg-card`. One step, not
  three. Separation comes from that step and from space, never from a border on
  everything.
- **Tags**: one hue per tag, as `--tag-<name>` in both themes. `TAG_STYLES` in
  `src/lib/tools/tag-styles.ts` turns it into `text-tag-<name> bg-tag-<name>/15`. Adding
  a tag means adding both tokens and both map entries.
- **Tags read as `#name`**, drawn by `TagChip`, so they echo the mark. Do not render a
  tag as bare text or with a dot.
- **No gradients, no glows, no decorative shadows.** Light mode may use a soft shadow to
  lift a surface; that is the limit.
- Buttons and badges are pills already, set in `ui/button.tsx` and `ui/badge.tsx`. Do
  not re-round them at the call site.

shadcn components live in `src/components/ui/`. Edit them in place when the whole system
should change, rather than overriding the same thing at twenty call sites.

## Comments

- Code should read on its own. Do not write a comment that repeats what the next line
  already says, and do not use banner comments to label sections.
- Use TSDoc (`/** ... */`) only where the code cannot say it itself: a contract the
  types do not capture, an invariant the caller has to keep, a unit, the error a
  function throws, or the reason something is done an unusual way. Explain why, not
  what.
- Nothing commented out, no `TODO` without a linked issue, no changelog inside a file.
- A stale comment is worse than no comment. If the code moves on, delete the comment.

## Testing

- Tests live in `tests/`, outside `src/`, in a tree that mirrors it. The tests for
  `src/utils/base64.ts` are in `tests/utils/base64.test.ts`, and the file name is always
  the source file name plus `.test`.
- Import the code under test through the `~/` alias, the same way the app does.
- Pure logic in `src/utils/` must have unit tests. That is where coverage counts.
- Interactive components get one or two Testing Library tests for the real user path.
- Hooks get tests through `renderHook`.
- Query by role, label or text, not by class name or test id.
- **Every test name starts with `should`**, reads as a sentence, and says the case it
  covers. Add `when` where the case needs saying.

  ```ts
  describe("decodeBase64", () => {
    it("should reject input that is not Base64", () => {});
    it("should return an empty string when the input is only whitespace", () => {});
  });
  ```

  `describe` names the thing under test, so a function, a component or a hook, and
  carries no `should`.

Tests have to earn their place. A test is worth keeping only if it can fail for a real
reason:

- Test behaviour, not structure: what a caller or a user actually gets back. Cover the
  happy path, empty input, invalid input, boundaries, round trips, and any bug that was
  just fixed.
- No test that restates the implementation, asserts a mock was called with the argument
  you just handed it, or snapshots a whole component.
- Do not test the framework, the browser or a dependency. Assume they work.
- Avoid arbitrary thresholds (`expect(name.length).toBeGreaterThan(2)`). Assert the
  invariant you actually care about.
- A few tests that would catch a real break beat many that pad the count.
- Test files follow everything else in this file, the comment rules included.

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

Every Linux job runs on Blacksmith, at `blacksmith-2vcpu-ubuntu-2404`, which needs the
Blacksmith app installed on the repository. Only 2vcpu is served on this account: a larger
size, or any `blacksmith-*-arm` label, is accepted and then queues forever instead of
failing, which is a slow way to find out.

## Dependencies and protection

Renovate owns every version update, under one policy shared by every rapture-sh repository:
`renovate-config.json` in `rapture-sh/.github`, which `.github/renovate.json` here extends
and nothing else. It holds a new release for seven days before offering it, unless the
dependency carries a published advisory, which skips the wait. Dependabot is enabled for
alerts and security fixes only, with no `dependabot.yml`, so one bump never arrives as two
pull requests. Change the policy in the shared preset, not here.

`.github/rulesets/` holds what protects `main`, as the JSON the API takes, so
the live rule can be diffed against the repository rather than read off a settings page.
The contexts in `main.json` are job names from `checks.yml`: renaming a job without
renaming it there silently stops it gating the branch.
