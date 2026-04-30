# Aurum Livetest — Website Dev Log

Repository: `Aurum-Korea/aurum-livetest`
Branch: `main`

---

## Session: Website Dev — 2026-04-30

### Changes made

**File:** `admin.html`

#### 1. Fund Dashboard — KPI section redesigned

Replaced the old 8-cell equal-weight `.kpi-row` with a new two-tier `.fund-hero` layout:

- **Primary row** (large serif italic ~38px): Fund NAV · Gold Position · LTV Available · Net Yield
  - These are the four stats needed at a glance above the fold
  - NAV and LTV Available have a subtle gold background highlight (`hl`)
- **Secondary row** (smaller ~19px): Unrealised P&L · Deployed · SORA Cost · Cohort seats
  - Supporting context, visually subordinate

All existing element IDs preserved (`f-nav`, `f-gold-val`, `f-avail`, `f-net-yield`, `f-gold-gain`, `f-deployed`, `f-sora`, `f-cohort`) so JS rendering is fully backward compatible.

Also fixed: `$('f-gold-gain').className` was being set to `'kpi-val ...'` dynamically in `renderFundTab()` — updated to `'fhs-val ...'` to match the new structure.

---

#### 2. Approval Queue (Ops tab) — full redesign

The old two-column layout (360px action list + side panel) was replaced with a full-width regulatory workflow screen.

**New structure:**

1. **Stage pipeline bar** (`#aq-stage-bar`) — horizontal flow strip showing live applicant counts at each of the 6 stages:
   - New Inquiry → Code Issued → NDA Review → KYC · Pending IOI → IOI Verify → Wire Pending → Admitted
   - Amber pulse dot appears on stages that need partner action (NDA Review, IOI Verify)

2. **Actions Required section** — replaces the old compact `aq-item` cards with new `aq-act-item` cards:
   - Colour-coded by step: amber (NDA), gold (IOI), blue (Wire)
   - Each card shows: applicant name, which regulatory step is blocked, why it matters, and action buttons inline
   - NDA: `Approve NDA →` + `Decline`
   - IOI: `Set LTV + Wire →`
   - Wire: `In-Flight` + `Cleared → Admit`
   - Recently cleared wires show as green confirmation items

3. **Membership Pipeline** — full-width prospect rows (`aq-pipe-row`) replacing the old `lead-item` rows:
   - Each row: name + meta | 5-step workflow track (Code · NDA · KYC · IOI · Wire) | badge + action button
   - Filter tabs: All / Needs Action / Pending / Closed
   - Selected row highlighted with gold left border

4. **Applicant detail** — changed from a static side column to a **fixed slide-over panel** (500px, right edge, `z-index:150`):
   - Slides in when a prospect row is clicked
   - Full detail + action panel rendered inside
   - Closes with ✕ button (`clearOpsLead()`)
   - The old `ops-side-default` div is kept as a hidden backing store (JS still populates admitted members list and activity feed for potential future use)

**JS changes:**
- `renderOpsView()` — fully rewritten to render stage bar, new action cards, new pipeline rows
- `pickOpsLead()` — removed `ops-side-default` hide/show (no longer needed)
- `clearOpsLead()` — removed `ops-side-default` show (no longer needed)
- `_funnelFilter === 'pending'` now also includes `'kyc'` stage

**New CSS classes added** (all before `</style>`):
- `.fund-hero`, `.fund-hero-primary`, `.fund-hero-secondary`, `.fhp`, `.fhp-val`, `.fhs`, `.fhs-val`, etc.
- `.aq-stage-bar`, `.aq-stage-node`, `.aq-stage-ct`, `.aq-stage-pip`, `.aq-stage-arr`
- `.aq-act-item` (+ `.nda`, `.ioi`, `.wire`, `.cleared`), `.aq-act-icon`, `.aq-act-body`, `.aq-act-btns`
- `.aq-pipe-row`, `.aq-pipe-name`, `.aq-pipe-meta`, `.aq-pipe-actions`
- `.aq-wf`, `.aq-wf-s`, `.aq-wf-d`, `.aq-wf-l`, `.aq-wf-ln`
- Responsive breakpoints at 900px and 640px

---

### What was NOT changed

- All API endpoints and data flow unchanged
- All modal HTML (NDA modal, IOI modal, deploy overlay) unchanged
- Members tab, Deal Book, Advisors, Customer Portal tabs unchanged
- Heartbeat bar unchanged
- All JS functions below `renderOpsView` unchanged
- Fund tab sections below the hero KPI (daily strip, posture signal, capital engine, deal pipeline, P&L, risk grid, timeline) unchanged

---

### To do / next session ideas

- Consider adding an "Admitted Members" summary panel at the bottom of the Approval tab (currently hidden, data is available)
- Fund tab: the posture strip (Deploy / Pace / Hold) could potentially be moved above the fold
- Consider a mobile-optimised view for the approval pipeline rows

---
