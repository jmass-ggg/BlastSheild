# BlastShield — Typography System Implementation

A design-system-driven typography hierarchy has been implemented across the application without altering any layout or visual structure.

---

## 🎨 Typography Tokens & Design System

The typography system is built with CSS design tokens and responsive clamp scales mapped to utility classes in Tailwind CSS:

| Token / Class | Font Family | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `text-display` | Inter | 36px – 60px clamp | Bold (700) | 1.05 | -0.035em | Hero / Display titles |
| `text-h1` | Inter | 30px – 44px clamp | Bold (700) | 1.12 | -0.03em | Primary page headers |
| `text-h2` | Inter | 24px – 32px clamp | Semibold (600) | 1.20 | -0.025em | Section headers |
| `text-h3` | Inter | 20px – 24px clamp | Semibold (600) | 1.25 | -0.02em | Modal / High-priority headers |
| `text-h4` | Inter | 18px (1.125rem) | Bold / Semibold | 1.35 | -0.015em | Card headers / Brand title |
| `text-body-lg` | Inter | 18px (1.125rem) | Regular (400) | 1.65 | -0.01em | Lead paragraphs |
| `text-body` | Inter | 16px (1.000rem) | Regular (400) | 1.60 | -0.005em | Main prompt input & body copy |
| `text-body-sm` | Inter | 14px (0.875rem) | Regular / Medium | 1.50 | 0.00em | Consequence metrics & action buttons |
| `text-caption` | Inter / Mono | 12px (0.750rem) | Medium (500) | 1.40 | +0.01em | Secondary metadata, code, status pills |
| `text-badge` | Inter / Mono | 11px (0.6875rem) | Semibold / Bold | 1.30 | +0.03em | ER labels, PK/FK badges, uppercase pills |

---

## 📐 Visual Hierarchy Rules Implemented

1. **Heading Distinguishability**:
   - Headings combine weight (`font-bold`, `font-semibold`), size, and negative letter-spacing (`tracking-tight`, `tracking-tighter`) for high contrast against body copy.
2. **Emphasis Weight Management**:
   - Bold weights are reserved for critical headings and direct target metrics.
   - Medium weights (`font-medium`) and semibold (`font-semibold`) are applied to interactive buttons, navigation labels, and badges.
3. **Monospace Integration**:
   - `JetBrains Mono` is used strictly for SQL queries, schema table names, primary/foreign keys, row counts, and security audit IDs.
4. **Fluid Responsiveness**:
   - Heading sizes dynamically adapt across mobile, tablet, and desktop viewports using CSS `clamp()` functions.
