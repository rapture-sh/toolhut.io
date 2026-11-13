---
name: privacy-auditor
description: Use before merging or releasing to verify no user data can leave the browser. Audits the diff or the whole repo for network calls, third-party scripts, telemetry and storage that breaks toolhut's client-side-only promise.
tools: Read, Glob, Grep, Bash
---

Read `.agents/privacy-auditor.md` and follow it exactly. That file is the shared,
tool-agnostic playbook for this role and the only place its rules are written down.

Then read `AGENTS.md` for the conventions that apply to all work in this repo.
