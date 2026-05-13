# TalentFlow — Recruitment Automation Platform

Enterprise-grade ATS (Applicant Tracking System) built for First Bank Nigeria. Full-stack banking recruitment platform covering the entire hire-to-onboard lifecycle.

## Run & Operate

- `npm run dev -w @workspace/api-server` — run the API server (defaults to **8080**; loads repo-root `.env` for `DATABASE_URL`)
- `npm run dev` or `npm run dev -w @workspace/web` — run the React frontend (`web/`; defaults to **5173** and `BASE_PATH=/` if unset). Vite proxies **`/api`** to **`http://127.0.0.1:8080`** (override with **`VITE_API_PROXY_TARGET`**).
- `npm run dev` or `npm run dev -w @workspace/web` — run the React frontend (`web/`; defaults to **5173** and `BASE_PATH=/` if unset)
- `npm run typecheck` — full typecheck across all packages
- `npm run build` — typecheck + build all packages
- `npm run codegen -w @workspace/api-spec` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `npm run push -w @workspace/db` — push DB schema changes (dev only)
- `npm run seed -w @workspace/scripts` — seed the database with demo data
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- npm workspaces, Node.js 24, TypeScript 5.9
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
- `web/src/pages/` — All React page components (11 pages)
- `web/src/components/layout.tsx` — Main app shell (sidebar + header)
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
- For a non-root deploy base, set `BASE_PATH` (and `PORT` if needed) before `npm run build -w @workspace/web`. Local dev defaults to `PORT=5173` and `BASE_PATH=/`.
- DB `numeric` columns return strings from Drizzle — always convert with `Number()` before returning JSON
- `onConflictDoNothing()` in seed script — safe to re-run without duplicating data

## Pointers

- Root `package.json` defines npm `workspaces` (including `web/`) and `overrides`.
- Demo credentials: `hr.admin@firstbankng.com` / `admin123`
