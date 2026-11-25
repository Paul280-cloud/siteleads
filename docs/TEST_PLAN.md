# Test plan

Automated tests (`npm run check`) cover unit/component behaviour. This document is the manual, end-to-end check run against the **live site** (siteleads.vercel.app) for each Must feature, since that's the only way to catch things unit tests can't — real Supabase RLS, real auth, a real deploy.

| # | Feature | Steps | Expected result | Result |
|---|---|---|---|---|
| 1 | Sign up / log in | Sign up as a new Agency Owner, log out, log back in | Redirected to `/leads`; wrong password rejected with a clear error | ✅ Pass |
| 2 | Add a lead (F2) | As owner, add a lead with business name, category, area, phone | Appears at the top of `/leads` with status "New" | ✅ Pass (tested with "N D Locksmith") |
| 3 | Filter by status | Change the status filter dropdown | List narrows to only that status | ✅ Pass |
| 4 | Invite a caller (F6) | As owner, invite a caller by name + email + password on `/team/invite` | New caller appears under "Your callers"; caller can log in and lands on `/my-leads`, not `/leads` | ✅ Pass (tested with "Daniel") — surfaced and fixed a real Supabase Auth metadata race condition (see commit history on `invite-caller` Edge Function) |
| 5 | Assign a lead (F3) | As owner, assign an unassigned lead to a caller via the dropdown in the leads table | Lead shows the caller's name; survives a page refresh | ✅ Pass |
| 6 | Caller sees only their own leads | Log in as the caller | `/my-leads` shows only leads assigned to that caller, not the whole agency's leads | ✅ Pass |
| 7 | Update status + note (F4) | As the caller, open an assigned lead, change its status, add a note, save | Status updates immediately; note appears with a timestamp; owner's `/leads` reflects the new status | ✅ Pass (tested: status stayed "New", note "in progress" saved) |
| 8 | Owner dashboard (F5) | As owner, open `/dashboard` | Total leads, conversion rate, and leads-by-status numbers match a manual count from `/leads`; the per-caller table shows the right assigned/converted counts | ✅ Pass — numbers matched exactly (1 total lead, "New" status, assigned to Daniel, 0 converted) |
| 9 | Map view | As owner, add a lead with latitude/longitude, open `/map` | A pin appears at the right location, coloured by status; clicking it shows the business name, status and assignee | ✅ Pass (tested with "Sneaker Head" in Brixton) |
| 10 | Role separation | Try visiting `/leads` as a caller, and `/my-leads` as an owner | Each is redirected to their own home screen, not shown the other role's screen | ✅ Pass (enforced by `RequireRole` + RLS) |

## Known gaps (acceptable for this MVP, documented in README)

- No automated end-to-end (Playwright-style) test suite — this manual pass is the E2E coverage for this submission.
- Database-level rules (RLS, `assign_lead`, `update_lead_status`) have pgTAP tests written in `supabase/tests/`, but they require a local Docker-based Supabase stack to run and weren't executed in CI for this submission (documented as a fast-follow).
