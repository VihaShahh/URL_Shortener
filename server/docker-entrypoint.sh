#!/bin/sh
set -eu

npm run prisma:deploy
exec node dist/src/server.js
