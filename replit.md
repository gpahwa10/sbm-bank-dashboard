# TalentFlow — Recruitment Automation Platform

Enterprise-grade ATS (Applicant Tracking System) built for First Bank Nigeria. Full-stack banking recruitment platform covering the entire hire-to-onboard lifecycle.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/ats run dev` — run the React frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the database with demo data
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + Recharts + Wouter routing
- API: Express 5 (port 8080, paths under `/api`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- State: Zustand (auth) + React Query (server state)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — Source of truth for all API contracts
- `lib/db/src/schema/` — All Drizzle ORM table definitions (10 schema files)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod validators
- `artifacts/api-server/src/routes/` — All Express route handlers (14 files)
- `artifacts/ats/src/pages/` — All React page components (11 pages)
- `artifacts/ats/src/components/layout.tsx` — Main app shell (sidebar + header)
- `scripts/src/seed.ts` — Database seeding script

## Architecture decisions

- Contract-first: OpenAPI spec → codegen → Zod validators + React Query hooks. No manual type duplication.
- Auth is token-based (Base64 userId:email) with `setAuthTokenGetter` wiring the zustand store to every API call automatically.
- AI candidate analysis is simulated (deterministic scoring, no OpenAI calls in demo) but the route structure supports real LLM integration.
- Drizzle `numeric` columns are stored as strings in Postgres and converted to `Number` in route handlers before returning JSON.
- All money values are in NGN (Nigerian Naira) by default; currency is stored per-offer and formatted using `Intl.NumberFormat`.

## Product

17 modules:
1. **Auth** — Login/logout with role-based access (HR Admin, Recruiter, Hiring Manager, Executive, Compliance)
2. **HR Dashboard** — KPI cards, pipeline bar chart, recruiter workload, recent activity
3. **Requisitions** — Multi-step approval workflow (submit → dept → HR → CFO)
4. **Jobs** — Job posting management with external/internal/both posting types
5. **Candidates** — Candidate pool with AI match scoring
6. **Applications** — Kanban pipeline + list view with stage movement
7. **Interviews** — Scheduling, completion tracking, panel feedback submission, AI summary
8. **Offers** — Offer letter creation with salary breakdown, Finance approval workflow
9. **Onboarding** — Onboarding records with 9 default tasks across IT/HR/compliance categories
10. **Reports** — Hiring trends, source effectiveness, recruiter performance, offer acceptance charts
11. **Compliance/Audit** — Full audit log, SLA breaches, workflow bottlenecks
12. **Admin** — User management, departments, job grades configuration
13. **Notifications** — Per-user notification feed with unread badge
14. **Approvals** — Unified pending approvals view
15. **Workflow History** — Tracked on requisitions and offers

## User preferences

- Strict flat design: navy/blue palette, Inter font, no gradients/glassmorphism
- Enterprise density: compact tables, small font sizes, tight spacing
- Realistic First Bank Nigeria demo data throughout

## Gotchas

- Auth token is plain Base64 (userId:email) — suitable for demo only, not production
- `pnpm run build` needs `PORT` and `BASE_PATH` env vars (set by workflow). Use `typecheck` for validation from CLI.
- DB `numeric` columns return strings from Drizzle — always convert with `Number()` before returning JSON
- `onConflictDoNothing()` in seed script — safe to re-run without duplicating data

## Pointers

- See `pnpm-workspace` skill for workspace structure and TypeScript setup
- Demo credentials: `hr.admin@firstbankng.com` / `admin123`
