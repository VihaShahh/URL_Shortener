# Shortner Frontend

Next.js App Router frontend for the URL Shortner product.

## Local Development

Use Node.js 24. From the repository root:

```sh
npm ci
npm run dev:client
```

Open `/` for short links or `/qr` for the free static QR generator.

## Static QR Generator

The public `/qr` page generates QR artwork in the browser without an account or
backend connection. Enter a complete HTTP(S) URL, choose Classic, Navy, or Forest,
and download a 1,024 × 1,024 PNG or a scalable SVG. Query strings, fragments, and
Unicode are preserved. The limit is 2,048 UTF-8 bytes, and embedded URL credentials
are rejected.

Changing the destination or color clears the old preview and disables downloads
until a new QR is generated. The image contains exactly the entered URL, rather
than a newly created platform redirect. Static destinations cannot be edited
after printing and do not collect platform scan analytics. The destination must
remain available; scan a print proof before producing a batch.

The page works offline after its assets have loaded. Loading the website for the
first time still requires a connection. Logo uploads, editable campaigns,
subscriptions, and account quotas are later milestones.

See [QR generation design](../docs/qr-generation.md) for payload, rendering,
privacy, and failure contracts.

## Verification

From the repository root:

```sh
npm test --workspace client
npm run typecheck --workspace client
npm run build --workspace client
npx playwright install chromium
npm run test:browser
```

The browser suite builds the production frontend and starts a temporary server
on port 3107. It needs no running backend or database. It exercises desktop and
mobile Chromium layouts, downloads both image formats, and decodes them using
jsQR independently of the QR encoder. SVG is rasterized with Sharp for decoding.
It also verifies invalid input, stale-preview prevention, canvas failure,
navigation, and generation/downloads while offline.

If Google Chrome is already installed, use it without downloading Chromium:

```sh
QR_BROWSER_CHANNEL=chrome npm run test:browser
```

Set `QR_TEST_PORT` if port 3107 is occupied. Screenshots, traces, and downloaded
test artifacts stay under ignored `test-results/`. Mobile browser emulation and
software decoding do not replace scans on physical Android/iPhone devices or an
actual print proof.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Heroicons

## Important Folders

- `src/app`: Next.js routes and route-level loading states.
- `src/components`: shared UI and app shell components.
- `src/features/links`: link creation workflow.
- `src/features/analytics`: analytics and management dashboard.
- `src/features/qr`: public static QR generation, preview, and downloads.
- `src/hooks`: reusable client-side state hooks.
- `src/lib`: API client, endpoint layer, cache, config, formatting helpers.
- `src/types`: shared frontend API types.

## Runtime Configuration

Set:

```sh
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

This value is read by `src/lib/config.ts`.

## Docker

The root `docker-compose.yml` includes a `client` service. It builds this workspace from the root lockfile and serves its standalone output on port `3000`. The browser API origin is provided through the Compose build argument, not a runtime-only public environment variable.

## Caching Strategy

The frontend uses a small in-memory cache in `src/lib/request-cache.ts`.

It provides:

- TTL-based cached reads;
- in-flight request de-duplication;
- prefix invalidation after metadata and status mutations.

This keeps the app optimized without introducing a larger data-fetching library during the initial build.

## Admin Key Handling

Analytics pages use `useAdminKey`.

The hook:

- reads `adminKey` from the query string;
- stores it per short code in `localStorage`;
- lets users clear the saved key.

The backend remains the authority; the frontend only gates UI optimistically.

## Styling Rules

The interface uses a neutral sidebar layout, black primary actions and locally
hosted Inter. Its font file and Open Font License are in `src/app/fonts/`, so
rendering and builds do not depend on a font CDN. Global CSS provides the QR
preview pattern and reduced-motion behavior; components use Tailwind utilities.

UI primitives live in `src/components/ui`. Existing link tags use a consistent
pastel palette across draft forms, created links, the searchable recent-link
library and management pages. The same label keeps its color without storing
presentation fields in the API. The library contains links created in this
browser; clearing its history does not disable the actual redirects.
