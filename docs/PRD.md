# SiteLeads — PRD

See [BUSINESS.md](../BUSINESS.md) for the problem, customer, business model and go-to-market.

## 1. Roles

| Role | Can do |
|---|---|
| Agency Owner (admin) | Create/import leads, assign leads to callers, view all leads, view dashboard (conversion rate, leads per caller), manage callers |
| Caller | View only leads assigned to them, update lead status and add a call note |

A user is exactly one role, set at sign-up (owner) or invite (caller), and belongs to exactly one agency. There is no cross-agency visibility: an owner never sees another agency's leads, and a caller never sees another agency's leads even if invited to multiple (out of scope — one agency per user for MVP).

## 2. Screens

| ID | Screen | Route | Role |
|---|---|---|---|
| S1 | Welcome / landing | `/` | Public |
| S2 | Log in | `/log-in` | Public |
| S3 | Sign up (Agency Owner only; callers are invited) | `/sign-up` | Public |
| S4 | Lead list (all leads) | `/leads` | Agency Owner |
| S5 | Lead detail + assign | `/leads/:id` | Agency Owner |
| S6 | My leads (assigned to me) | `/my-leads` | Caller |
| S7 | Update lead status | `/my-leads/:id` | Caller |
| S8 | Dashboard (conversion rate, leads per caller, by status) | `/dashboard` | Agency Owner |
| S9 | Invite a caller | `/team/invite` | Agency Owner |

## 3. Data model (summary)

- **profiles**: id, email, full_name, role (`owner` \| `caller`), agency_id
- **agencies**: id, name, owner_id
- **leads**: id, agency_id, business_name, category, area, phone, source, has_website (false), status (`new` \| `contacted` \| `interested` \| `converted` \| `not_interested`), assigned_to (caller id, nullable), created_at
- **lead_notes**: id, lead_id, author_id, note, created_at

Full column types and constraints live in `supabase/migrations/20261123100000_core_tables.sql`.

## 4. Permission rules (enforced on the backend, not just in the UI)

- A caller can only read/update leads where `assigned_to = their own profile id`.
- A caller cannot see leads belonging to a different agency.
- Only the Agency Owner can assign leads or invite callers.
- A caller cannot re-assign a lead to someone else, and cannot change another caller's lead even inside the same agency.
- A caller cannot directly `UPDATE` a lead row in the database — status changes and notes go only through the `update_lead_status()` function, which checks `assigned_to = auth.uid()` before writing.
- An owner cannot assign a lead to a caller from a different agency (`assign_lead()` checks both the lead and the caller belong to the caller's own agency).

## 5. Must features — detailed, with acceptance criteria

### F1 — Log in with two roles (Owner / Caller)
- Sign up creates an agency and an owner profile in one step (`handle_new_user()` trigger).
- Callers cannot self-sign-up; they only exist after an owner invites them (F5).
- **Acceptance:** an owner can sign up, log out, and log back in. A caller account (created via invite) can log in and lands on `/my-leads`, not `/leads`.

### F2 — Lead list filtered to businesses with no website
- `/leads` shows every lead in the owner's agency: name, category, area, phone, status badge, assigned caller (or "Unassigned").
- Supports filtering by status and by area.
- **Acceptance:** an owner never sees a lead from another agency, even if they guess its ID directly in the URL (enforced by RLS, not just hidden in the UI).

### F3 — Owner assigns a lead to a caller
- From `/leads/:id`, the owner picks a caller from their own agency and assigns the lead.
- **Acceptance:** assigning a lead to a caller outside the agency fails with a clear error (`assign_lead()` raises an exception, surfaced in the UI as a toast/error message, not a silent failure).

### F4 — Caller updates lead status + note, sees only their own leads
- `/my-leads` shows only leads where `assigned_to` = the logged-in caller.
- `/my-leads/:id` lets the caller change status (contacted/interested/converted/not interested) and add a note.
- **Acceptance:** a caller who edits the URL to open a lead not assigned to them gets a "not found" result (RLS hides the row entirely; the UI must not leak that the lead exists for another caller).

### F5 — Owner dashboard: leads by status, conversion rate, leads per caller
- Stat cards: total leads, conversion rate (`converted` / total non-`new`), leads added this week.
- A breakdown of leads by status.
- A table of each caller's assigned count and converted count.
- **Acceptance:** the dashboard numbers match a manual count of the `leads` table for that agency (used as the live-test check in `docs/TEST_PLAN.md`).

### F6 — Invite a caller (needed to make F3/F4 testable at all)
- Owner enters a caller's name and email on `/team/invite`.
- MVP approach: owner creates the caller's login directly (email + a temporary password shown once), since building a full email-invite flow is out of scope for the time available. The caller logs in and is prompted to change their password on first login (stretch; manual password reset is an acceptable MVP fallback).
- **Acceptance:** a newly created caller account has `role = 'caller'` and the same `agency_id` as the owner who created it, and cannot access `/leads`, `/dashboard`, or `/team/invite` (owner-only routes).

## 6. User flows

**Owner flow:** sign up → land on `/leads` (empty state: "No leads yet") → import/seed leads → invite a caller → assign leads → watch `/dashboard` update as the caller works leads.

**Caller flow:** receive login from owner → log in → land on `/my-leads` → open a lead → call the business → update status + note → lead disappears from "new" filter, dashboard updates for the owner.

## 7. Error and edge cases to handle

- Owner tries to assign an already-converted lead: allowed (reassigning after a lost deal is valid), but the UI should warn with a confirm step.
- Caller has zero assigned leads: show an empty state, not a blank screen.
- Owner deletes/deactivates a caller (not in MVP scope) — leads stay assigned to that profile; a future "reassign on removal" flow is a known issue, documented in the README.
- Duplicate lead entry (same business added twice): not deduplicated automatically in MVP; documented as a known issue.

## 8. Lead sourcing (MVP scope)

For the MVP, do not build a live scraping pipeline. Instead:
- Seed the database with a curated list of roughly 30-50 real local businesses (name, category, area, phone, whether they have a website), gathered manually or via one batch call to the Google Places API (not scraped from Google Maps directly, to respect their Terms of Service).
- This is enough to prove the workflow end to end. An automated "search for more leads" feature is a fast-follow, not a Must.

## 9. Non-functional requirements

- All backend permission rules enforced via Postgres RLS and security-definer functions, not only in the frontend — verified by `supabase/tests/01_lead_access.test.sql` (pgTAP).
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, test and build on every PR.
- The live link must be tested logged in as both an owner and a caller before being marked "Done" anywhere in the README (see `docs/TEST_PLAN.md`).

## 10. Out of scope for MVP

- Automated lead scraping/crawling.
- Payment processing for the subscription itself (can be a "Contact us to upgrade" stub).
- SMS/call integration (click-to-call is a nice-to-have, not a Must).
- Email-based invite flow for callers (see F6 MVP fallback).
- Multi-agency membership per user.

## 11. Test logins (for README)

- Owner: `owner@test.com` / test password
- Caller: `caller@test.com` / test password
