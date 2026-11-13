# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for a security problem.

Report it privately through GitHub:
[Security → Report a vulnerability](https://github.com/rapture-sh/toolhut.io/security/advisories/new).

Include what you found, how to reproduce it, and what an attacker could do with it.
Expect an acknowledgement within a few days.

## What counts as a vulnerability here

toolhut has no backend and no accounts, so the interesting class of bug is anything that
breaks the client-side-only promise or lets one page affect another:

- User input leaving the browser: a network request, a beacon, a remote script, or
  input ending up in a URL that gets shared or logged.
- Cross-site scripting through tool input or output.
- A dependency that exfiltrates data or runs unexpected code.
- User content leaking between tools, or persisting in storage when it shouldn't.

Reports about the hosting setup, DNS, or headers on toolhut.io are welcome too.

## Supported versions

Only `main` and the current deployment of toolhut.io are supported. There are no
backported fixes.
