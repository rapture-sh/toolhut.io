# toolhut

**Everyday tools that run entirely in your browser.**

[toolhut.io](https://toolhut.io) · a [Rapture.sh](https://rapture.sh) project ·
MIT licensed

Most online tools make you upload your data to a server so it can do work your own
machine could do in milliseconds. Converting an image, formatting some JSON, hashing a
string. None of that needs a cloud, so toolhut does the work locally: every tool is
plain JavaScript running in your tab.

- **Nothing is uploaded.** Your input never leaves the page.
- **No accounts, no tracking, no analytics.** There is no backend to send anything to.
- **Works offline** once the page is loaded.
- **Open source**, so you can check all of the above for yourself.

## Tools

| Tool | What it does |
| --- | --- |
| [Base64 encoder & decoder](src/utils/base64.ts) | Encode text to Base64 or decode it back, with full Unicode support. |

More are on the way. Want one? [Open an issue](https://github.com/rapture-sh/toolhut.io/issues)
or build it yourself, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Running it locally

Requires [Node.js](https://nodejs.org) 20+ and [pnpm](https://pnpm.io) 10+.

```bash
git clone https://github.com/rapture-sh/toolhut.io.git
cd toolhut.io
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm test` | Run unit tests once |
| `pnpm test:watch` | Run unit tests in watch mode |
| `pnpm test:coverage` | Tests with a coverage report |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm lint` | Biome lint + format check |
| `pnpm lint:fix` | Fix what Biome can fix |

## Stack

Next.js (App Router), React, TypeScript, Tailwind CSS v4, Biome, Vitest.

## How it is organised

```
src/
  app/                 # routes
  components/          # shared UI, with components/tools/ for each tool's UI
  hooks/               # reusable client hooks
  lib/tools/           # the tool registry and its types
  utils/               # pure logic, one module per tool, with its tests
```

Each tool keeps its real work in a pure module under `src/utils/` with unit tests, and
its UI in a thin client component under `src/components/tools/`. The base64 tool is the
reference implementation.

## Contributing

Contributions are very welcome: new tools, fixes, polish. Read
[CONTRIBUTING.md](CONTRIBUTING.md) for the conventions and
[AGENTS.md](AGENTS.md) for the rules the code has to follow (the big one: nothing user
data touches may leave the browser).

## License

MIT, see [LICENSE](LICENSE). Fork it, ship it, build on it; just keep the copyright
notice and credit where it came from.
