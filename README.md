# SiteLeads

**SiteLeads** — a lead pipeline for web designers: find local businesses without a website, assign them to your team, and track every call to a sale.

- **Live link:** [siteleads.vercel.app](https://siteleads.vercel.app)
- **Stitch designs:** [stitch.google.com/projects/11772770869643215744](https://stitch.google.com/projects/11772770869643215744) — see [docs/designs/](./docs/designs/) for exported screens
- **Test logins:** anyone can create an Agency Owner account on the live site via **Sign up** (no email confirmation needed). A Caller demo login will be added here once the invite flow is built.

See [BUSINESS.md](./BUSINESS.md) for the business case, [docs/PRD.md](./docs/PRD.md) for the product spec, and [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the build plan.

## Status

| Feature | Status |
|---|---|
| Sign up (creates agency + owner), log in, log out, role-based redirect | Done (live) |
| Database: tables, RLS, assign/update functions | Done (live) |
| Lead list, assign, caller screens, dashboard, invite a caller | Not started |

## Known issues

- Email confirmation is switched off in Supabase so sign-up works instantly for the demo.
- `/leads` and `/my-leads` are placeholder screens until the lead list is built.
