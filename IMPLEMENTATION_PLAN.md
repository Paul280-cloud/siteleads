# SiteLeads — Implementation Plan

Builds on [docs/PRD.md](./docs/PRD.md). Stack matches FixMyKasi: React 18 + Vite + TypeScript + Tailwind + Supabase (Postgres, Auth) + Vercel + Vitest.

## Phase 0 — Scaffold (today, Mon AM)
- `npm create vite@latest` (React + TypeScript), Tailwind, React Router.
- GitHub Actions CI: lint, typecheck, test, build on every PR.
- `.env.example`, Supabase client in `src/lib/supabase.ts`.
- Issue: #1 Project scaffold + CI

## Phase 1 — Database (Mon PM / Tue AM)
- Tables: `agencies`, `profiles`, `leads`, `lead_notes` (see PRD section 3).
- RLS: callers can only read/update their own assigned leads; owners can read/write everything in their agency.
- Seed: ~30 real local businesses (name, category, area, phone, has_website=false).
- pgTAP tests for the RLS rules.
- Issues: #2 Core tables + RLS, #3 Seed data, #4 pgTAP tests for lead access rules

## Phase 2 — Auth (Tue AM)
- Sign up (Agency Owner), log in, log out.
- `profiles` row created on sign-up via trigger, role=`owner`, new `agencies` row.
- Issue: #5 Auth screens (S2, S3)

## Phase 3 — Core screens, frontend-first with mock data (Mon PM onward)
- S1 Welcome, S4 Lead list, S5 Lead detail + assign, S6 My leads, S7 Update status, S8 Dashboard, S9 Invite caller.
- Build against real Supabase calls as soon as Phase 1/2 land; use typed query functions in `src/lib/leads.ts`.
- Issues: #6–#12, one per screen.

## Phase 4 — Permission rules end to end (Tue PM)
- Confirm a caller cannot see/update another agency's or another caller's leads (tested, not just assumed).
- Issue: #13 Enforce and test cross-agency/cross-caller access rules

## Phase 5 — Deploy (Tue PM)
- Vercel deploy, env vars set, live link in README.
- Issue: #14 Deploy to Vercel

## Phase 6 — Polish + README (Wed AM)
- Test logins, screenshots, known issues, architecture section in README.
- Issue: #15 Finish README

## Test plan
- `docs/TEST_PLAN.md`: sign up as owner, invite a caller, assign a lead, log in as caller, update status, confirm dashboard reflects it — run on the live link, not just locally, and record the result with a date and commit hash.

## Branch/PR discipline
- One Issue → one branch → one small PR → review (self-review is fine solo, but write it down) → squash merge.
- No merging with an unresolved review comment.
