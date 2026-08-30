# TrueForge demo assets

This directory contains the repository-owned pieces of the TrueForge demo.

- `agent-manifest.example.json` shows the required agent configuration. Replace
  the model name with a model already configured in TrueForge.
- `skills/blastshield-demo` is a git-backed TrueForge skill. Register this
  repository under **Settings → Skills** with the path
  `trueforge/skills/blastshield-demo`, then attach the skill to the agent.
- Enable a TrueForge sandbox provider for the agent. The sandbox runs the
  bundled verifier without receiving PostgreSQL or MCP credentials.

The literal `blastshield_request_execution` approval policy is intentional.
It lets analysis and report retrieval run before pausing exactly at the
destructive execution tool.

The MCP server must be reachable only by the trusted TrueForge harness (or an
equivalent trusted host). The execution tool treats a successfully dispatched
tool call as proof that the host's human approval gate allowed it. For the
local demo the MCP port is bound to loopback; production deployment must add
authenticated network isolation.

