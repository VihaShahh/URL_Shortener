# URL Shortner

An npm workspace monorepo for short links and free static QR codes:

- `server/`: Node.js, Express, TypeScript, Prisma, PostgreSQL.
- `client/`: Next.js, React, TypeScript, Tailwind CSS.
- Runtime: Docker Compose with PostgreSQL.

The backend is the most complete part right now. It supports short-link creation, redirects, click analytics, admin-key protected analytics access, request validation, rate limiting, Docker runtime configuration, and Prisma migrations.

## Current Backend Features

- Create short links with optional custom codes.
- Redirect short links through `GET /:code`.
- Record click analytics asynchronously.
- Fetch protected analytics through `GET /api/links/:code/analytics`.
- Export protected click analytics as CSV through `GET /api/links/:code/analytics/export.csv`.
- Fetch public link metadata through `GET /api/links/:code`.
- Update safe link metadata through `PATCH /api/links/:code`.
- Fetch owner-only operational summary through `GET /api/links/:code/admin`.
- Fetch owner-only audit history through `GET /api/links/:code/audit`.
- Disable or reactivate links through `PATCH /api/links/:code/status`.
- Reject unsafe target URLs such as private network and localhost addresses.
- Block reserved short codes that would collide with platform routes.
- Validate environment variables at startup.
- Use PostgreSQL migrations through Prisma.
- Include request IDs in error responses for production debugging.
- Expose runtime version metadata through `GET /version`.
- Apply API and create-link rate limits.
- Send explicit production-minded security headers with Helmet.
- Mark API JSON responses as `no-store` to avoid accidental caching.
- Use bounded graceful shutdown for container-friendly deploys.
- Serve `robots.txt` to discourage indexing short-link paths.

## Try It With Docker

From the repository root:

```sh
docker compose up --build --wait
```

Open:

- App and short-link creation: http://localhost:3000
- Free QR generator: http://localhost:3000/qr
- API readiness: http://localhost:5000/ready
- PostgreSQL for local tools: localhost:5433 (`postgres` / `postgres`, database `url_shortner`)

Compose waits for PostgreSQL, applies Prisma migrations, and starts the server
and client with health checks. The development defaults are bound to localhost.
No separate Node installation or environment file is needed for this route.

Try a URL in the QR generator, download PNG/SVG, and scan the result. On the home
page, create a short link, open it, then use its analytics page to change metadata
or disable the link. Static QR generation is free and requires no account;
accounts, paid editing, and billing are later milestones.

```sh
docker compose logs -f client server
docker compose down
```

Stopping keeps PostgreSQL data in the existing `postgres-data` volume. To change
ports or browser-facing origins, copy `.env.example` to `.env`, edit the settings,
and rebuild. `PUBLIC_API_URL` is compiled into the client and is also used in
returned short URLs; use a browser-reachable address, not Docker's `server`
hostname. Update `PUBLIC_WEB_URL` with the client port so CORS remains consistent.

## Workspace Development

Use Node.js 24 (`nvm use`) and install once from the repository root:

For native development, stop any running client/server containers first with
`docker compose stop client server`; keep PostgreSQL running.

```sh
npm ci
npm run db:generate
cp -n server/.env.example server/.env
docker compose up -d --wait postgres
npm run db:migrate
npm run dev
```

`npm run dev` starts both workspaces. `npm run dev:client` and
`npm run dev:server` run them separately. The root `.env` controls Compose;
`server/.env` configures a server running outside Docker. Its sample database URL
uses the Compose host port, 5433.

There is one root `package-lock.json`. Add dependencies with
`npm install PACKAGE --workspace client` or `--workspace server`.

## Checks

```sh
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:browser
```

With the Docker stack running, this checks real database/API behavior and the QR
page without contacting a destination website:

```sh
npm run test:stack
```

It creates and then disables one local test link, retaining it in the database.
Use `QR_BROWSER_CHANNEL=chrome npm run test:browser` to use an installed Google
Chrome instead of downloading Chromium. The browser suite also verifies QR
exports and offline generation independently of the backend.

## Important API Routes

- `GET /health`: process health check.
- `GET /ready`: database readiness check with query latency.
- `GET /version`: service version and deployment metadata.
- `GET /robots.txt`: crawler policy.
- `POST /api/links`: create a short link.
- `GET /api/links/:code`: read public metadata for a short link.
- `PATCH /api/links/:code`: update title, description, tags, or expiration with an admin key.
- `PATCH /api/links/:code/status`: disable or reactivate a short link with an admin key.
- `GET /api/links/:code/analytics`: read admin-key protected analytics.
- `GET /api/links/:code/analytics/export.csv`: download click events as CSV with an admin key.
- `GET /api/links/:code/admin`: read admin-key protected summary.
- `GET /api/links/:code/audit`: read admin-key protected audit history.
- `GET /:code`: redirect to the original target URL.

## Documentation

Read [understanding.md](docs/understanding.md) for detailed explanations of the architecture, backend choices, database design, security rules, and API behavior.

The API contract is documented in [docs/openapi.yaml](./docs/openapi.yaml).

Manual request examples are available in [docs/api-examples.http](./docs/api-examples.http).

Backend operations guidance is available in [docs/backend-runbook.md](./docs/backend-runbook.md).

Backend stack rationale is recorded in [docs/decisions/001-backend-stack.md](./docs/decisions/001-backend-stack.md).

Frontend-specific notes are available in [client/README.md](./client/README.md).

The current workspace/container boundaries are documented in [docs/architecture.md](./docs/architecture.md).

Static QR payload and export contracts are documented in [docs/qr-generation.md](./docs/qr-generation.md).
