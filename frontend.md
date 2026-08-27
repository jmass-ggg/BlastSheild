# BlastShield — Developer 2: Frontend

## Role

You are the Frontend engineer on a two-developer, four-day hackathon project called BlastShield. Another developer is simultaneously building the entire backend/database/MCP system. Your responsibility is to build an exceptional BlastShield frontend while staying strictly inside your ownership boundary.

---

## 0. Absolute Team Rules

### You OWN

```
frontend/
```

You may modify anything inside:

- `frontend/app/`
- `frontend/components/`
- `frontend/lib/`
- `frontend/types/`
- `frontend/hooks/`
- `frontend/public/`
- `frontend/package.json`
- `frontend/next.config.*`
- `frontend/tailwind*`
- `frontend/components.json`
- `frontend/Dockerfile`

### You DO NOT OWN

```
backend/
database/
mcp_server/
docker-compose.yml
.env.example
Makefile
root README.md
```

Never modify those files. The backend developer is working there simultaneously. If backend behavior is missing, do NOT implement backend logic yourself — use a mock matching the agreed API contract temporarily.

---

## 1. Your Job

Your job is NOT to calculate BlastShield risk. Your job is to make the backend evidence **understandable to a human**.

The user must understand in seconds:

- What action is the AI trying to perform?
- How many records will it affect?
- What dependent records will be affected?
- What relationships cause that damage?
- What business impact could happen?
- How dangerous is this operation?
- Can I use a safer alternative?
- Should I approve or reject it?

---

## 2. Product Mental Model

TrueForge proposes:

```sql
DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';
```

BlastShield backend analyzes it. The frontend receives:

- risk
- direct impact
- dependent impact
- FK graph
- business impact
- safer alternative
- approval status
- execution status

Your frontend **visualizes** those results. Never make the browser calculate them.

---

## 3. Technology

Use:

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- React Flow

Use **strict TypeScript**. Avoid `any`.

---

## 4. Ownership Boundary

Never create:

- FastAPI endpoints
- PostgreSQL queries
- SQL parser logic
- Risk formulas
- FK graph discovery
- MCP tools
- Execution logic

Those belong to Backend Developer. You only call backend APIs.

---

## 5. UI Goal

The UI should feel like:

> **Security gateway + database observability + AI approval interface**

NOT:

> generic CRUD admin dashboard

The main question communicated visually is:

> **"What will this AI action damage?"**

---

## 6. Frontend Structure

```
frontend/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   │
│   └── analysis/
│       └── [id]/
│           └── page.tsx
│
├── components/
│   ├── blastshield/
│   │   ├── header.tsx
│   │   ├── sql-input.tsx
│   │   ├── risk-score.tsx
│   │   ├── impact-card.tsx
│   │   ├── impact-summary.tsx
│   │   ├── dependency-graph.tsx
│   │   ├── dependency-node.tsx
│   │   ├── risk-breakdown.tsx
│   │   ├── business-impact.tsx
│   │   ├── safer-alternative.tsx
│   │   ├── approval-actions.tsx
│   │   ├── analysis-timeline.tsx
│   │   ├── sql-preview.tsx
│   │   ├── analysis-status.tsx
│   │   └── recent-analyses.tsx
│   │
│   └── ui/
│
├── lib/
│   ├── api.ts
│   ├── format.ts
│   ├── mock-data.ts
│   └── utils.ts
│
├── hooks/
│   └── use-analysis.ts
│
└── types/
    └── blastshield.ts
```

Do not create unnecessary routes.

---

## 7. Frozen Backend API Contract

The backend developer owns this contract. Build against it. Do not invent alternative field names unless explicitly told.

### `POST /api/v1/analyze`

**Request:**

```json
{
  "sql": "DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';",
  "source": "ui",
  "reason": "Remove inactive users"
}
```

**Expected response:**

```json
{
  "analysis_id": "uuid",
  "status": "PENDING_APPROVAL",

  "action": {
    "operation": "DELETE",
    "table": "users",
    "has_where": true
  },

  "impact": {
    "direct_rows": 12481,
    "dependent_rows": 49233,
    "total_rows": 61714
  },

  "dependencies": [
    {
      "table": "orders",
      "rows": 21003,
      "depth": 1,
      "path": ["users", "orders"],
      "on_delete": "CASCADE",
      "effect": "DELETE",
      "measurement": "EXACT"
    }
  ],

  "business_impact": {
    "active_subscriptions": 347,
    "mrr_at_risk": 6116,
    "arr_at_risk": 73392
  },

  "risk": {
    "score": 88,
    "level": "CRITICAL",

    "breakdown": {
      "operation": 20,
      "direct_impact": 20,
      "dependent_impact": 20,
      "cascade": 15,
      "business_impact": 10,
      "recoverability": 4
    },

    "reasons": [
      "12,481 users match the DELETE condition."
    ]
  },

  "graph": {
    "nodes": [
      {
        "id": "users",
        "table": "users",
        "rows": 12481,
        "depth": 0
      }
    ],

    "edges": [
      {
        "id": "users-orders",
        "source": "users",
        "target": "orders",
        "on_delete": "CASCADE"
      }
    ]
  },

  "safer_alternative": {
    "available": true,
    "sql": "UPDATE users SET deleted_at = NOW() WHERE ...",
    "risk_score": 32,
    "risk_level": "MEDIUM"
  },

  "requires_approval": true,

  "timeline": [
    {
      "key": "intercepted",
      "label": "SQL intercepted",
      "status": "complete"
    }
  ]
}
```

---

## 8. Other APIs

Use:

```
GET  /api/v1/analyses
GET  /api/v1/analyses/{analysis_id}
POST /api/v1/analyses/{analysis_id}/approve
POST /api/v1/analyses/{analysis_id}/reject
POST /api/v1/analyses/{analysis_id}/execute
```

Do not create alternatives.

---

## 9. Typed API Client

All HTTP calls belong in `frontend/lib/api.ts`.

Implement:

- `analyzeSQL()`
- `listAnalyses()`
- `getAnalysis()`
- `approveAnalysis()`
- `rejectAnalysis()`
- `executeAnalysis()`

Components must NOT scatter raw `fetch()` calls throughout the project.

---

## 10. TypeScript Types

Create `frontend/types/blastshield.ts`.

Define:

```ts
type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

type AnalysisStatus =
  | "ANALYZING"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "STALE"
  | "EXECUTED"
  | "FAILED";
```

Also create types for:

- `ActionInfo`
- `ImpactSummary`
- `DependencyImpact`
- `BusinessImpact`
- `RiskBreakdown`
- `RiskReport`
- `BlastGraphNode`
- `BlastGraphEdge`
- `SaferAlternative`
- `TimelineEvent`
- `AnalysisReport`

No `any`.

---

## 11. Mock Strategy

The backend developer may not have `/analyze` finished when you start. That must NOT block frontend work.

Create `frontend/lib/mock-data.ts` with ONE realistic mock `AnalysisReport` matching the backend contract exactly.

**Important:**

- Mocks are temporary frontend development data
- They are NOT fake production logic
- Do not calculate anything in the mock layer

When backend is available:

```
mock
 ↓
remove/disable
 ↓
real API
```

The UI should not need major rewrites because the data shape stays identical.

---

## 12. Main Page

**Route:** `/`

Build a focused page.

**Header:**

> BlastShield AI Pre-Execution Impact Analysis

Possible subtitle:

> See the blast radius before your AI agent touches production.

---

## 13. SQL Input

Create a large SQL input area.

**Default demo:**

```sql
DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';
```

**Actions:**

- `Analyze Impact`
- `Load Demo Query`

When user clicks Analyze:

```
POST /api/v1/analyze
     ↓
receive analysis_id
     ↓
navigate
     ↓
/analysis/{analysis_id}
```

---

## 14. Analysis Loading Experience

Analysis may take a few seconds. Do not show only a spinner. Show meaningful steps:

```
✓ SQL intercepted
→ Parsing destructive operation...
→ Inspecting live schema...
→ Building FK dependency graph...
→ Tracing correlated records...
→ Calculating business impact...
→ Calculating deterministic risk...
```

When backend does not stream individual phases, animate these cautiously while waiting. Do not lie by permanently marking unfinished operations as complete.

---

## 15. Analysis Report Page

**Route:** `/analysis/[id]`

This is the core hackathon screen. It should contain, in order:

1. Intercept header
2. SQL preview
3. Risk score
4. Impact cards
5. Blast radius graph
6. Risk breakdown
7. Business impact
8. Reasons
9. Safer alternative
10. Approval controls
11. Timeline

---

## 16. Intercept Header

Display prominently:

```
🛡 BLASTSHIELD INTERCEPTED
```

Then:

```
DELETE on users
```

And current status:

```
PENDING APPROVAL
```

The user should immediately understand: **the destructive operation has NOT executed yet.**

Show something like:

> No production mutation has been executed.

---

## 17. SQL Preview

Show:

```sql
DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';
```

Use a code-style block. Make destructive action visually distinguishable from normal content. Do not make the SQL editable on the analysis report page.

---

## 18. Risk Score

Large central risk element. Example:

```
88 / 100
CRITICAL
```

Support: `LOW` · `MEDIUM` · `HIGH` · `CRITICAL`

The risk level comes from backend. **Do not calculate it.**

---

## 19. Impact Cards

Create cards for:

- Direct Rows
- Dependent Records
- Active Subscriptions
- ARR at Risk

Example:

```
12,481    Users Targeted
49,233    Dependent Records
347       Active Subscriptions
$73.4K    ARR at Risk
```

Use proper number formatting.

---

## 20. Blast Radius Graph

Use **React Flow**. This is one of the most important visual parts of the demo.

Render backend:
- `graph.nodes`
- `graph.edges`

Never hard-code the final graph.

**Example conceptual layout:**

```
USERS
12,481
   │
   ├──────────────┬──────────────┐
   │              │              │
   ▼              ▼              ▼
ORDERS      SUBSCRIPTIONS    SESSIONS
21,003           347           9,682
   │
   ▼
PAYMENTS
18,201
```

**Each node:** table name + affected row count

**Each edge:** `CASCADE` · `RESTRICT` · `NO ACTION` · `SET NULL` · `SET DEFAULT`

---

## 21. Graph Edge Meaning

Visually distinguish semantics. UI should help the user understand:

| On Delete    | Meaning                                       |
|--------------|-----------------------------------------------|
| `CASCADE`    | Dependent rows may be deleted                 |
| `SET NULL`   | Rows stay, FK changes to null                 |
| `RESTRICT`   | Delete may be blocked                         |
| `NO ACTION`  | Delete may fail because dependencies exist    |

Do not claim `RESTRICT` rows are definitely deleted.

---

## 22. Risk Breakdown

Display all backend scores. Example:

```
Operation Severity     20 / 25
Direct Impact          20 / 20
Dependent Impact       20 / 20
Cascade Severity       15 / 15
Business Impact        10 / 15
Recoverability          4 / 5
```

Use progress bars or a simple visual meter. Also show backend `risk.reasons`:

> Why is this risky?

---

## 23. Business Impact

Create a section: **BUSINESS IMPACT**

Show:

```
347       Active subscriptions at risk
$6,116    Monthly recurring revenue
$73,392   Annual recurring revenue
```

This is different from database row impact. Make that distinction **visually obvious**.

---

## 24. Safer Alternative

If `safer_alternative.available === true`, show a side-by-side comparison.

```
ORIGINAL                    SAFER ALTERNATIVE
--------                    -----------------
DELETE                      SOFT DELETE
Risk  88  CRITICAL          Risk  32  MEDIUM
```

Show alternative SQL:

```sql
UPDATE users SET deleted_at = NOW() WHERE ...
```

**Button:** `Analyze Safer Alternative`

Do NOT execute it directly. When clicked:

```
POST /api/v1/analyze with safer SQL
→ navigate to new analysis
```

---

## 25. Approval Controls

Possible actions:

- `Reject Action`
- `Approve Original`
- `Analyze Safer Alternative`

**Approval:** `POST /approve`

After success: `status = APPROVED`

The UI must NOT automatically execute after approval. Instead display:

```
Approved
This operation is authorized but has not executed yet.
```

Then show a separate:

```
[Execute Approved Action]
```

---

## 26. Execution

When `Execute Approved Action` is clicked: `POST /execute`

Show:

```
Revalidating live production state...
```

Do not pretend execution starts immediately.

**Possible backend results:**

Unchanged:
```
✓ Production state unchanged
✓ Approval still valid
✓ Executed successfully
```

Stale:
```
⚠ Production changed after approval.
  This approval is stale.
  BlastShield blocked execution.
  Re-analysis is required.
```

---

## 27. Status Behavior

Support these states:

| Status             | Available Actions                               |
|--------------------|--------------------------------------------------|
| `PENDING_APPROVAL` | Approve · Reject · Safer Alternative            |
| `APPROVED`         | Execute Approved Action                         |
| `REJECTED`         | No execution button                             |
| `STALE`            | Re-analyze                                      |
| `EXECUTED`         | Executed successfully (read-only)               |

Do not show impossible controls.

---

## 28. Timeline

Display events such as:

```
✓ SQL intercepted
✓ SQL parsed
✓ Live schema inspected
✓ FK graph built
✓ 61,714 records traced
✓ Risk calculated
○ Awaiting human approval
○ Production revalidation
○ Execution
```

After approval, update state. After execution, update state.

The backend is source of truth where timeline data exists. Frontend can derive display ordering, but must not invent security state.

---

## 29. Recent Analyses

Main dashboard should show recent analyses.

**Fields:**

- operation
- table
- risk
- status
- time

Example:

```
DELETE  users  CRITICAL · 88  PENDING APPROVAL  2 min ago
```

Click → `/analysis/{id}`

---

## 30. Error Handling

Support backend errors like:

```json
{
  "code": "ANALYSIS_STALE",
  "message": "Production state changed after approval. Re-analysis is required."
}
```

Display user-friendly message. Handle:

- `UNSUPPORTED_SQL`
- `INVALID_SQL`
- `MULTIPLE_STATEMENTS`
- `APPROVAL_REQUIRED`
- `ANALYSIS_STALE`
- `ANALYSIS_QUERY_TIMEOUT`
- `EXECUTION_FAILED`
- `NOT_FOUND`

Do not show raw JavaScript errors.

---

## 31. Loading States

Create good loading states for:

- analyzing SQL
- fetching report
- approving
- rejecting
- executing
- revalidating

Disable duplicate button clicks.

---

## 32. No Business Logic In UI

Never implement things like:

```ts
if (rows > 10000) risk = "CRITICAL"  // FORBIDDEN
```

Never calculate:

- risk score
- cascade impact
- ARR risk
- dependent row counts
- FK graph

Those belong to backend. **Frontend formats and visualizes only.**

---

## 33. Formatting Helpers

`frontend/lib/format.ts`

Create:

```ts
formatCount(61714)    → "61,714"
formatCurrency(73392) → "$73.4K"  // or full display where appropriate
```

---

## 34. UI Quality

Aim for:

- clean
- security-focused
- technical
- credible
- easy to demo

Avoid:

- too many gradients
- huge marketing landing page
- random animations
- multiple unrelated pages
- fake charts
- fake security claims

**The risk report is the product.**

---

## 35. Responsive Behavior

Primary demo will be desktop/laptop. Optimize **desktop first**. But do not break completely on smaller screens. Graph may scroll horizontally if necessary.

---

## 36. Accessibility

Use:

- semantic buttons
- keyboard accessible controls
- visible focus labels
- sufficient contrast

Risk meaning should not rely only on color. Always include text: `CRITICAL` · `HIGH` · `MEDIUM` · `LOW`

---

## 37. Development With Backend Not Ready

If backend endpoint fails because Developer 1 is still working:

- Do NOT edit backend
- Do NOT change the API contract
- Do: fall back to mock data

Create one environment option:

```
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Keep production/default integration easy to switch to real backend.

---

## 38. Environment

Expected frontend env:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Only edit frontend-specific env files. Do not edit root `.env.example` unless explicitly assigned.

---

## 39. Integration Verification

When backend is available, test this full chain:

```
Frontend SQL input
     ↓
POST /analyze
     ↓
analysis report
     ↓
real graph
     ↓
Approve
     ↓
status updates
     ↓
Execute
     ↓
backend revalidation
     ↓
final state
```

If field mismatch occurs, do not silently rename frontend API assumptions. Report exactly:

```
EXPECTED: risk.score
RECEIVED: risk.total_score
```

Then coordinate with backend owner.

---

## 40. Git / Collaboration Discipline

You are working simultaneously with another developer.

- Do not make broad repo-wide formatting changes
- Do not rename shared root folders
- Do not modify backend imports
- Do not modify Docker Compose
- Do not run tools that rewrite unrelated files
- Keep commits frontend-only

**Good commit examples:**

```
feat(frontend): add blast radius report layout
feat(frontend): add react-flow dependency graph
feat(frontend): integrate analysis API
feat(frontend): add approval execution states
```

---

## 41. Day 1

**Goal:** Build the entire UI skeleton without waiting for backend.

Complete:

- Next.js setup
- Tailwind + shadcn/ui
- TypeScript types
- API client structure
- Mock `AnalysisReport`
- Dashboard
- SQL input
- Analysis report skeleton
- Impact cards
- Risk display

**End of day:** demo query → mock analysis → report page

---

## 42. Day 2

**Goal:** Make BlastShield visually understandable.

Complete:

- React Flow graph
- Custom nodes
- FK edge labels
- Risk breakdown
- Business impact
- Safer alternative
- Timeline
- Status badge
- Recent analyses

**End of day:** A judge looking at the page understands the blast radius.

---

## 43. Day 3

**Goal:** Replace mocks with real backend.

Complete:

- `/analyze` integration
- `/report` integration
- Approve API
- Reject API
- Execution API
- Real graph
- Real risk report
- Error handling
- Revalidation states

Do NOT modify backend when there is an issue. Report API mismatches.

---

## 44. Day 4

**Goal:** Polish and demo reliability.

Complete:

- Loading states
- Responsive fixes
- Number formatting
- Empty states
- Error states
- Button guards
- Demo query button
- Visual cleanup
- Demo rehearsal

Do not introduce major new product pages.

---

## 45. Frontend Definition of Done

Frontend is done when:

1. User can enter demo SQL.
2. User can submit analysis.
3. Report displays risk score.
4. Direct impact is shown.
5. Dependent impact is shown.
6. Business impact is shown.
7. React Flow renders backend FK graph.
8. FK actions are understandable.
9. Risk breakdown is visible.
10. Safer alternative is displayed.
11. User can approve.
12. Approval does not execute automatically.
13. User can separately request execution.
14. Revalidation state is shown.
15. `STALE` blocks normal execution UI.
16. `REJECTED` removes execution controls.
17. `EXECUTED` state is clearly shown.
18. Loading/error states work.
19. No risk or database impact calculations exist in frontend.
20. No backend/system files were modified.

---

## 46. How to Work

Before making changes: inspect the existing `frontend/` directory. Preserve working components. Do not inspect/change backend unless required only to understand the documented API contract. Work entirely inside `frontend/`.

For every phase:

```
implement
 ↓
typecheck
 ↓
lint
 ↓
build
 ↓
fix
 ↓
report
```

**Report format:**

```
FILES CHANGED: frontend/...
WHAT WORKS: ...
MOCK OR REAL API: ...
API CONTRACT ISSUE: NONE
```

If there is no issue, explicitly say: `API CONTRACT ISSUE: NONE`

---

## 47. Start Now

Start with **Frontend Day 1 only**.

**Do:**

- frontend setup
- types
- API client
- temporary exact-shape mock
- dashboard
- SQL input
- analysis report layout
- risk score
- impact cards

**Do NOT:**

- touch `backend/`
- touch `database/`
- touch `mcp_server/`
- touch `docker-compose.yml`
- calculate risk
- calculate impact
- hard-code final React Flow production data
- build unrelated pages

Stay strictly within the BlastShield frontend plan.
