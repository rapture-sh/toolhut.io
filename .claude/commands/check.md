---
description: Run the full local check suite
---

Run these in order and report what fails, with the relevant output:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Fix anything mechanical (formatting, imports, obvious type errors) yourself. For real
failures, explain the cause before changing behaviour.
