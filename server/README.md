# URL and analytics server

Express, Prisma and PostgreSQL workspace. Install dependencies from the repository
root; the shared root lockfile is authoritative.

The root [README](../Readme.md) contains Docker startup, local environment setup
and manual testing instructions. For server-only development, after configuring
`server/.env` and migrating the database:

```sh
npm run dev:server
```

From the root, run focused checks with:

```sh
npm test --workspace server
npm run typecheck --workspace server
npm run build --workspace server
```

Build output starts at `server/dist/src/server.js`. Docker deploys migrations
before starting that entrypoint. `/health` checks the HTTP process; `/ready`
also queries PostgreSQL.
