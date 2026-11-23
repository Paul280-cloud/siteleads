# SiteLeads — PRD

See [BUSINESS.md](../BUSINESS.md) for the problem, customer, business model and go-to-market.

## 1. Roles

| Role | Can do |
|---|---|
| Agency Owner (admin) | Create/import leads, assign leads to callers, view all leads, view dashboard (conversion rate, leads per caller), manage callers |
| Caller | View only leads assigned to them, update lead status and add a call note |

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

## 4. Permission rules (enforced on the backend, not just in the UI)

- A caller can only read/update leads where `assigned_to = their own profile id`.
- A caller cannot see leads belonging to a different agency.
- Only the Agency Owner can assign leads or invite callers.
- A caller cannot re-assign a lead to someone else.

## 5. Must features (day one) — from BUSINESS.md

1. Log-in with two roles (Owner / Caller).
2. Lead list filtered to businesses with no website.
3. Owner assigns a lead to a Caller.
4. Caller updates lead status + note, sees only their own leads.
5. Owner dashboard: leads by status, conversion rate, leads per caller.

## 6. Lead sourcing (MVP scope)

For the MVP, do not build a live scraping pipeline. Instead:
- Seed the database with a curated CSV of roughly 30-50 real local businesses (name, category, area, phone, whether they have a website), gathered manually or via one batch call to the Google Places API (not scraped from Google Maps directly, to respect their Terms of Service).
- This is enough to prove the workflow end to end. An automated "search for more leads" feature is a fast-follow, not a Must.

## 7. Out of scope for MVP

- Automated lead scraping/crawling.
- Payment processing for the subscription itself (can be a "Contact us to upgrade" stub).
- SMS/call integration (click-to-call is a nice-to-have, not a Must).

## 8. Test logins (for README)

- Owner: `owner@test.com` / test password
- Caller: `caller@test.com` / test password
