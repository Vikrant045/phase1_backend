# Phase 1 — Task Management REST API

A production-style task management backend (the brain behind apps like Trello / Todoist),
built with **Node.js + TypeScript + Express 5 + Prisma 7 + PostgreSQL (Neon)**.

Covers the 5 real-world backend challenges: **full CRUD**, **server-side pagination**,
**filtering**, **sorting + search**, and **strict validation + centralized error handling**.

---

## Quick start

```bash
pnpm install         # one-time
pnpm db:migrate      # apply migrations to Neon (uses DIRECT_URL)
pnpm db:seed         # wipe + insert 15 demo tasks
pnpm dev             # start the API on http://localhost:5000
```

Other scripts:

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `pnpm db:studio`    | Prisma Studio — browse/Edit DB visually        |
| `pnpm typecheck`    | `tsc --noEmit` — type check without emitting   |
| `pnpm build` + `pnpm start` | compile to dist/ and run production server |

> Node version: the project was built with Node v24 (nvm). If `node` is not found,
> run `nvm use 24.14.1` in an admin terminal (the nvm symlink lives at C:\nvm4w\nodejs).

---

## The Task model

| Field         | Type              | Notes                                             |
| ------------- | ----------------- | ------------------------------------------------- |
| `id`          | String (UUID)     | Auto-generated primary key                        |
| `title`       | String            | **Required**, 3–200 chars, trimmed                |
| `description` | String (optional) | Up to 5000 chars                                  |
| `status`      | Enum              | `PENDING` (default) \| `IN_PROGRESS` \| `COMPLETED` |
| `priority`    | Enum              | `LOW` \| `MEDIUM` (default) \| `HIGH`               |
| `dueDate`     | DateTime (optional) | ISO-8601 string, e.g. `2026-11-20T10:00:00Z`    |
| `createdAt`   | DateTime          | Set automatically                                 |
| `updatedAt`   | DateTime          | Bumped automatically on every edit                |

---

## Endpoints

Base URL: `http://localhost:5000/api/v1`

| Method | Path              | Purpose                                    | Success |
| ------ | ----------------- | ------------------------------------------ | ------- |
| GET    | `/health`         | Health check (no DB)                       | 200     |
| POST   | `/tasks`          | Create a task                              | 201     |
| GET    | `/tasks`          | List tasks (paginated, filter, search)      | 200    |
| GET    | `/tasks/:id`      | Get one task by UUID                       | 200     |
| PATCH  | `/tasks/:id`      | Update any subset of fields                | 200     |
| DELETE | `/tasks/:id`      | Delete a task (returns the deleted row)    | 200     |

### Query params for `GET /tasks`

| Param      | Values                                                      | Default      |
| ---------- | ----------------------------------------------------------- | ------------ |
| `page`     | integer ≥ 1                                                 | `1`          |
| `limit`    | integer 1–50                                                | `10`         |
| `status`   | `PENDING` \| `IN_PROGRESS` \| `COMPLETED`                   | — (no filter)|
| `priority` | `LOW` \| `MEDIUM` \| `HIGH`                                 | — (no filter)|
| `search`   | 1–100 chars; case-insensitive match across title+description| —            |

Ordering:
- Tasks are ordered by newest first (`createdAt: desc`), with `id: asc` as a tie-breaker so pagination remains deterministic.

### Examples

```bash
# page 2, 5 per page
curl "http://localhost:5000/api/v1/tasks?page=2&limit=5"

# only IN_PROGRESS + HIGH priority
curl "http://localhost:5000/api/v1/tasks?status=IN_PROGRESS&priority=HIGH"

# search across title + description
curl "http://localhost:5000/api/v1/tasks?search=onboarding"

# create
curl -X POST "http://localhost:5000/api/v1/tasks" -H "Content-Type: application/json" \
  -d '{"title":"Complete client onboarding flow","priority":"HIGH","dueDate":"2026-10-18T17:00:00Z"}'

# update
curl -X PATCH "http://localhost:5000/api/v1/tasks/<id>" -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}'

# delete
curl -X DELETE "http://localhost:5000/api/v1/tasks/<id>"
```

---

## Response format

Every response has the same shape:

```json
// single item (POST / PATCH / GET /tasks/:id / DELETE)
{
  "success": true,
  "message": "Task created successfully",
  "data": { "id": "…", "title": "…", "status": "PENDING", "priority": "HIGH", … }
}

// list (GET /tasks) — data is an array + pagination meta
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": [ …tasks… ],
  "meta": {
    "page": 1, "limit": 10, "totalItems": 15,
    "totalPages": 2, "hasNext": true, "hasPrev": false
  }
}
```

### Errors — fail fast, never crash the server

```json
// Zod rejects bad input BEFORE the DB (400):
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Too small: expected string to have >=3 characters" },
    { "field": "status", "message": "Invalid value for enum (e.g. DONE_ZO)" }
  ]
}

// unknown task (404):
{ "success": false, "message": "Task not found" }

// unknown route (404):
{ "success": false, "message": "Route GET /api/v1/nope not found" }

// server fault (500): details in server logs only, nothing leaked to the client
{ "success": false, "message": "Internal server error" }
```

Also handled: malformed JSON body → 400, unknown extra fields in the body → 400
(strict DTO), bad UUID path param → 400 (Zod) instead of a Prisma crash.

---

## Architecture (3-tier)

```
Request → Middleware chain → Router → Controller → Service → Prisma → Neon PostgreSQL
```

- **Routes** (`src/routes/tasks.ts`) map URLs to handlers and mount the Zod validator.
- **Controllers** (`src/controllers/tasks.ts`) are thin: read validated data, call the service, send JSON.
- **Services** (`src/services/tasks.ts`) hold business logic and Prisma queries; they throw `AppError` for 4xx problems.
- **Validation** (`src/schemas/tasks.ts` + `src/middlewares/validate.ts`) parses+coerces input; clean types flow downstream.
- **Errors** (`src/middlewares/error.ts`) is the single 4-argument handler for EVERYTHING:
  AppError → its status, ZodError → 400 + field details, malformed JSON → 400, unknown → 500.
- **Order matters** in `src/app.ts`: `express.json()` → logger → routers → `routeNotFound` → `errorHandler` last.

Express 5 specifics you'll see in the code:
- Async handlers that reject are auto-forwarded to the error handler (no try/catch per controller).
- `req.query` is read-only; validated query values travel via `res.locals`.

## Environment variables (`.env`)

| Key            | Used by                          | Why                                            |
| -------------- | -------------------------------- | ---------------------------------------------- |
| `PORT`         | server.ts                        | HTTP port (default 5000)                       |
| `DATABASE_URL` | the API server (pooler URL)      | Runtime queries through Neon's PgBouncer pooler |
| `DIRECT_URL`   | Prisma CLI (migrate/studio/seed) | Migrations need a DIRECT connection, not the pooler |

## Verified behavior

32 automated smoke tests (CRUD, pagination, filtering, sorting, search, and every
error path) all pass against the live Neon database. Run them yourself via any HTTP client.

## Viva / interview cheat-sheet

- **Why validate in middleware, not the controller?** One reusable guard per route; invalid input dies at the door.
- **Why is the error handler last?** Express matches error handlers in registration order; it must see errors from every layer above.
- **Why `next()` and not `return res.json()`?** `next()` keeps the chain alive; `res.json()` ends the response.
- **Why paginate server-side?** 10k rows can't ship to a browser at once — `skip/take` + count-based meta.
- **Why is `res.locals.body/query/params` populated?** The Zod validator replaced raw request data with parsed, typed, defaults-applied data.
- **Why throw `AppError` in the service instead of res.json there?** Keeps HTTP concerns in one layer; the service stays reusable and testable.
- **Why two DB URLs?** CLI (migrations) needs a direct Neon connection; the long-running server pools connections efficiently.