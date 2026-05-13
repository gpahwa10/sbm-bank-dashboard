# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `npm run typecheck` — full typecheck across all packages
- `npm run build` — typecheck + build all packages
- `npm run codegen -w @workspace/api-spec` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `npm run push -w @workspace/db` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- npm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/web`); demo data via `mock-store` / `mock-hooks`
- DB / schema libs (`lib/db`, `lib/api-zod`) remain for codegen and optional tooling
- API codegen: Orval (from OpenAPI spec in `lib/api-spec`)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- Use `npm install` at the repo root; workspace packages live under `artifacts/`, `lib/`, and `scripts/`.
