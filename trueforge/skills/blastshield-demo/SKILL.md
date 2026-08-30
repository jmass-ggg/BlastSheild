---
name: blastshield-demo
description: Analyze proposed PostgreSQL DELETE actions through BlastShield, independently verify row and foreign-key impact in the TrueForge sandbox, recommend a decision, and route any execution attempt through TrueForge human approval.
---

# BlastShield TrueForge workflow

Use this workflow whenever the user asks to delete PostgreSQL data or asks what
a proposed DELETE would affect.

1. Treat the user's SQL or natural-language deletion request as a proposal.
   Never use a generic SQL tool or a database credential.
2. Call `blastshield_analyze` with the proposed DELETE and a short reason.
3. Call `blastshield_get_report` with the returned `analysis_id`. Confirm that
   the persisted report has the same ID, status, row impact, dependency paths,
   and risk evidence as the original result.
4. Save the persisted report as JSON inside the TrueForge sandbox and run:

   ```bash
   python /opt/tfy/skills/blastshield-demo/scripts/verify_report.py REPORT.json
   ```

5. Do not call the verification "BlastShield sandbox simulation." BlastShield
   performs production-aware, read-only measurement. The TrueForge sandbox is
   a separate, isolated environment that independently checks report
   consistency and deterministic policy arithmetic. It has no database
   credentials.
6. If verification fails, stop. Explain the failed checks and do not request
   execution.
7. If verification passes, tell the user the direct rows, dependent rows,
   total rows, dependency paths, score, and risk level. For HIGH or CRITICAL
   risk, explicitly say: "I recommend rejecting this operation."
8. If the user's request clearly asks to perform the deletion, call
   `blastshield_request_execution` directly after presenting the verified
   report. Do not call it from Code Mode or from sandbox code. TrueForge must
   pause the direct destructive tool call and show Deny/Allow to the human.
9. If the human denies the tool call, report that production was unchanged.
10. If the human allows it, the tool records the TrueForge approval in the
    BlastShield control plane. BlastShield then revalidates the live fingerprint
    and executes through its constrained database role. Report the returned
    approval source, revalidation result, status, and affected row count.

For the seeded inactive-user demo, use this exact concise summary after the
sandbox verifier passes:

```text
I found 292 total affected records.
Risk = HIGH.

40 target rows match the DELETE condition.
252 dependent rows are connected by foreign keys.

I recommend rejecting this operation.
```

The human approval dialog is the decision point. Never describe a model's tool
call as human approval; only the TrueForge Allow action authorizes execution.
