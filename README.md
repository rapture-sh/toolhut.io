<p align="center">
  <a href="https://toolhut.io">
    <img src="./public/icon-512.png" width="80" height="80" alt="toolhut" />
  </a>
</p>

<h1 align="center">toolhut</h1>

<p align="center">Free online tools that never upload your files.</p>

<p align="center">
  <a href="https://toolhut.io"><strong>Open toolhut</strong></a> ·
  <a href="./CONTRIBUTING.md">Contributing</a> ·
  <a href="./AGENTS.md">Conventions</a> ·
  <a href="https://github.com/rapture-sh/toolhut.io/issues">Issues</a> ·
  <a href="https://rapture.sh">Rapture</a>
</p>

Search for a PDF merger or an image converter and almost every result asks you
to upload. Your file is copied to a server you know nothing about, processed
there, and kept for as long as that company decides. Browsers stopped needing
help with this a long time ago.

toolhut is the catalogue built on that. Every tool is plain JavaScript running
in your own tab.

## What you get

- **Nothing is uploaded.** No request carries your input. Open the network tab
  and check.
- **No accounts, no tracking.** There is no backend to send anything to and no
  analytics watching what you do.
- **Works offline.** Once the page has loaded, every tool keeps working with
  the network switched off.
- **Open from top to bottom.** MIT licensed, so you can read any tool before
  you trust it with anything, or run your own copy.

## Run it locally

Requires [Node.js](https://nodejs.org) 20+ and [pnpm](https://pnpm.io) 10+.

```bash
git clone https://github.com/rapture-sh/toolhut.io.git
cd toolhut.io
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm lint` | Biome lint and format check |

## How it is put together

```
src/
  app/                 # routes
  components/          # shared UI, with components/tools/ for each tool
  config/              # fonts and site wide values
  lib/                 # the registry, plus the glue that needs the DOM
  utils/               # the pure logic of every tool
tests/                 # mirrors src/, one test file per module
```

A tool is a pure module in `src/utils/`, a thin client component in
`src/components/tools/`, a registry entry and a route. The registry decides
what the site lists, so adding a tool is mostly adding data.

[AGENTS.md](./AGENTS.md) has the rules the code follows, including the one that
matters most: nothing a tool touches may leave the browser.

## Contributing

New tools, fixes and polish are all welcome. Read
[CONTRIBUTING.md](./CONTRIBUTING.md) first, then open an issue or send a pull
request.

## License

[MIT](./LICENSE)
