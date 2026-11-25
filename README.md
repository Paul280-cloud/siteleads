# SiteLeads

**SiteLeads** — a lead pipeline for web designers: find local businesses without a website, assign them to your team, and track every call to a sale.

- **Live link:** [siteleads.vercel.app](https://siteleads.vercel.app)
- **Portfolio:** [bheki-portfolio.vercel.app](https://bheki-portfolio.vercel.app)
- **Loom (pitch + demo):** [loom.com/share/f9f819e1dd314bdba106c1dbb9f93cf5](https://www.loom.com/share/f9f819e1dd314bdba106c1dbb9f93cf5)
- **Stitch designs:** [stitch.google.com/projects/11772770869643215744](https://stitch.google.com/projects/11772770869643215744) — see [docs/designs/](./docs/designs/) for exported screens
- **Repo:** [github.com/Paul280-cloud/siteleads](https://github.com/Paul280-cloud/siteleads)

See [BUSINESS.md](./BUSINESS.md) for the business case, [docs/PRD.md](./docs/PRD.md) for the product spec, and [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the build plan.

## Test logins

- **Agency Owner:** anyone can create their own account on the live site via **Sign up** — instant, no email confirmation needed.
- **Caller:** callers can't self-sign-up; an Agency Owner invites them from **Invite a caller** (`/team/invite`) with a name, email and a temporary password.
- A demo Owner + Caller pair already exists on the live site for evaluation. Credentials are shared privately with the mentor, not in this README.

## Features

| Feature | Status |
|---|---|
| Sign up (creates agency + owner), log in, log out, role-based redirect | ✅ Done (live) |
| Lead list: add a lead, filter by status (F2) | ✅ Done (live) |
| Assign a lead to a caller (F3) | ✅ Done (live) |
| Caller: My Leads + update status and add a note (F4) | ✅ Done (live) |
| Owner dashboard: stat cards, leads by status, leads per caller (F5) | ✅ Done (live) |
| Invite a caller (F6) | ✅ Done (live) |
| Map view: leads as pins coloured by status (bonus, not in original PRD) | ✅ Done (live) |

All Must-have features from the PRD are built, tested, and verified on the live site.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite 5, TypeScript, React Router 6 |
| Styling | Tailwind CSS 3 |
| Map | Leaflet + OpenStreetMap |
| Database, auth | Supabase (PostgreSQL, Auth, Row-Level Security, Edge Functions) |
| Testing | Vitest + React Testing Library |
| CI | GitHub Actions (`npm run check` on every PR) |
| Hosting | Vercel, redeploys on every merge to `main` |

**Architecture:** the React app talks to Supabase directly from the browser. Row-Level Security policies decide what each role (Agency Owner, Caller) can read and change — an owner sees every lead in their agency, a caller sees only leads assigned to them. Callers are created server-side through a Supabase Edge Function using the service-role key, so a caller can never self-sign-up or see another agency's data. Full details in [docs/PRD.md](./docs/PRD.md).

## Run it locally

```bash
git clone https://github.com/Paul280-cloud/siteleads.git
cd siteleads
npm install
cp .env.example .env   # fill in your own Supabase URL + anon key
npm run dev             # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Runs the Vitest suite |
| `npm run build` | Production build |
| `npm run check` | lint + typecheck + test + build (run before every PR) |

## Tests

21 tests across 7 test files (Vitest + React Testing Library), covering the lead list, assignment, caller status updates, invite-a-caller, the dashboard, and the map view. Database-level checks (RLS, the `assign_lead` and `update_lead_status` functions) are written as pgTAP tests in `supabase/tests/`.

Live end-to-end testing is documented in [docs/TEST_PLAN.md](./docs/TEST_PLAN.md).

## Known issues

- Email confirmation is switched off in Supabase so sign-up works instantly for the demo.
- Lead coordinates for the map are entered manually (latitude/longitude) — there's no live geocoding or scraping in this MVP, by design (see PRD §8).
- Duplicate lead entry (the same business added twice) isn't deduplicated automatically.
- If an owner removes a caller (not built in this MVP), leads stay assigned to that profile — a "reassign on removal" flow is a fast-follow.
- A caller reassigning after their own update (vs. the owner doing it) isn't a build target for this MVP.

## Project documents

- [BUSINESS.md](./BUSINESS.md) — the business case
- [docs/PRD.md](./docs/PRD.md) — product requirements
- [docs/designs/](./docs/designs/) — Stitch screen designs
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — build plan
- [docs/TEST_PLAN.md](./docs/TEST_PLAN.md) — live test checklist
