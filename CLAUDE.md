# Visão Verde — Backend

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Fastify 5 |
| Language | TypeScript 6 (strict) |
| ORM | Prisma 7 + PostgreSQL |
| Validation | Zod 4 (pt-BR locale) |
| Auth | @fastify/jwt (JWT, 1d expiry) |
| Logger | Pino + AsyncLocalStorage (requestId / userId) |
| Error tracking | Sentry (optional, via `SENTRY_DSN`) |
| Email | Nodemailer |
| Package manager | **pnpm** (never use npm or npx) |
| Build | tsup |
| Dev server | tsx watch |
| Linter/formatter | Biome |

---

## Architecture

The project follows **Clean Architecture** with four layers:

```
HTTP Request
    │
    ▼
Controller        — validates input (Zod), calls use-case, maps errors to HTTP status
    │
    ▼
Use Case          — business logic, throws domain errors, calls repository
    │
    ▼
Repository        — interface (contract) + Prisma implementation
    │
    ▼
Prisma Client     — generated to src/@types/prisma/
```

### Supporting pieces

- **Presenter** — maps internal model to HTTP response shape (never exposes raw Prisma models)
- **Factory** — creates a use-case with its repository dependency injected
- **Middleware** — `verifyJwt`, `verifyUserRole` — applied via `onRequest` hooks on routes
- **Error classes** — `src/use-cases/errors/` — domain errors thrown by use-cases, routed by the global error handler
- **Error handler** — `src/http/error-handler.ts` — `registerErrorHandler(app)` handles `AppError`, `ZodError`, `SyntaxError`, and 500s
- **Messages** — `src/constants/messages.ts` — all user-facing strings in Portuguese (no inline strings)

---

## Directory Structure

```
src/
├── @types/
│   ├── fastify-jwt.d.ts          # JWT payload type augmentation
│   └── prisma/                   # Prisma-generated client (do not edit)
├── constants/
│   └── messages.ts               # All Portuguese user-facing strings
├── env/
│   └── index.ts                  # Zod-validated env vars
├── http/
│   ├── routes.ts                 # Top-level route registration
│   ├── controllers/
│   │   ├── health-check/
│   │   ├── parks/                # One file per endpoint, named *.controller.ts
│   │   └── users/
│   ├── middlewares/
│   │   ├── verify-jwt.middleware.ts
│   │   └── verify-user-role.middleware.ts
│   ├── presenters/               # park-presenter.ts, user-presenter.ts
│   └── schemas/
│       ├── parks/                # Zod schemas for park endpoints
│       ├── users/                # Zod schemas for user endpoints
│       └── utils/                # Shared schemas (e.g. id-schema)
├── lib/
│   ├── logger/                   # Pino + AsyncLocalStorage helpers
│   └── prisma/                   # Prisma client singleton
├── repositories/
│   ├── parks-repository.ts       # Interface + exported types
│   ├── reviews-repository.ts
│   ├── users-repository.ts
│   └── prisma/                   # Prisma implementations
├── use-cases/
│   ├── errors/                   # Domain error classes
│   ├── factories/                # make-*-use-case.ts
│   ├── parks/
│   ├── users/
│   └── messaging/
└── server.ts                     # Entry point
```

---

## Key Conventions

### Primary Keys

All models use **UUID v7** as the sole primary key (`id String @id @default(uuid(7))`). There is no separate `publicId` field — the UUID is both the PK and the public identifier exposed in the API.

### Import Aliases (tsconfig paths)

Always use aliases instead of relative paths:

```ts
import { prisma } from '@lib/prisma/index.js'
import type { ParkRepository } from '@repositories/parks-repository.js'
import { logger } from '@lib/logger/index.js'
import { messages } from '@constants/messages.js'
```

Always include `.js` extension on imports (required for ESM/NodeNext).

### Controller Pattern

Controllers do **not** contain try/catch. Domain errors propagate to the global error handler automatically.

```ts
export async function actionName(request: FastifyRequest, reply: FastifyReply) {
  const { field } = schema.parse(request.body) // or .params / .query

  const useCase = makeXyzUseCase()
  const { result } = await useCase.execute({ field })

  logger.info({ targetId: ... }, 'Action completed successfully!')

  return reply.status(2xx).send({ result: Presenter.toHTTP(result) })
}
```

Every controller **must** call `logger.info(...)` on success.

### Use-Case Pattern

```ts
interface XyzUseCaseRequest { ... }
type XyzUseCaseResponse = { ... }

export class XyzUseCase {
  constructor(private repo: SomeRepository) {}

  async execute(request: XyzUseCaseRequest): Promise<XyzUseCaseResponse> {
    // business logic
    // throw domain errors on failure
  }
}
```

### Factory Pattern

```ts
export function makeXyzUseCase() {
  const repo = new PrismaXyzRepository()
  return new XyzUseCase(repo)
}
```

### Presenter Pattern

Never return raw Prisma models from controllers. Always go through a presenter:

```ts
export class ParkPresenter {
  static toHTTP(park: Park): HTTPPark { ... }
  static toHTTPWithRelations(park: ParkWithRelations): HTTPParkWithRelations { ... }
  static toHTTPWithDistance(parks: ParkWithDistance[]): HTTPParkWithDistance[] { ... }
}
```

### Error Classes

All domain errors extend `AppError` and declare their own `statusCode`. The global handler in `src/http/error-handler.ts` reads this field automatically — no mapping needed in controllers.

```ts
export class ParkNotFoundError extends AppError {
  readonly statusCode = 404
  constructor() {
    super(messages.validation.parkNotFound) // always use messages constant
  }
}
```

### Logging

Use `logger` from `@lib/logger/index.js`. Every request is automatically enriched with `requestId` and `userId` (via AsyncLocalStorage) — no need to pass them manually.

```ts
logger.info('Simple message')
logger.info({ targetId: id }, 'Resource deleted')
logger.error({ message: error.message }, 'Something failed')
```

Use `logError` from `@lib/logger/helpers.js` for caught unknown errors.

### Prisma Client

After any schema change, regenerate the client:

```bash
pnpm exec prisma generate
```

The client is generated to `src/@types/prisma/` — never import from `@prisma/client`, always use `@/@types/prisma/client.js`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` \| `staging` \| `production` \| `test` |
| `LOG_LEVEL` | `info` \| `debug` \| `warn` \| `error` \| `trace` |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: 3000) |
| `JWT_SECRET` | At least 60 characters |
| `FRONTEND_URL` | Allowed CORS origin |
| `HASH_SALT_ROUNDS` | bcrypt rounds (default: 12) |
| `SENTRY_DSN` | Optional — enables Sentry error tracking |
| `SMTP_*` | Email (host, port, email, password, secure) |

---

## Running the Project

```bash
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev   # apply migrations + regenerate client
pnpm run start:dev             # tsx watch (development)
pnpm run build                 # tsup production build
pnpm run lint:fix              # Biome auto-fix
pnpm run check                 # Biome format + lint
```

---

## Git Commit Convention

All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:** `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `perf`, `test`, `ci`

**Scopes (optional):** `parks`, `users`, `auth`, `infra`, `prisma`

**Examples:**
```
feat(parks): add proximity search endpoint
fix(auth): handle expired token with 401 response
refactor!: replace int primary keys with uuid v7
chore(prisma): regenerate client after schema update
docs: add architecture overview to CLAUDE.md
```

**Rules:**
- Description in **lowercase**, imperative mood, no period at the end
- Breaking changes: append `!` after type/scope and explain in body
- Subject line must not exceed **72 characters**
- **One commit per logical change** — do not bundle unrelated changes
- Never use `--no-verify` to skip hooks
- Never add AI co-author attribution
- Before committing: run `pnpm run lint:fix` and `pnpm exec tsc --noEmit`
- **After every task**: review whether new patterns, conventions, or architectural decisions were introduced and update this file accordingly
