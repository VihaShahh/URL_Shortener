FROM node:24-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY server ./server
RUN npm rebuild @prisma/engines && npm run db:generate && npm run build --workspace server

FROM base AS production-deps
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci --omit=dev --workspace server --ignore-scripts --no-audit --no-fund

FROM base AS runner
ENV NODE_ENV=production
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=node:node /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node server/package.json ./server/package.json
COPY --from=build --chown=node:node /app/server/dist ./server/dist
COPY --chown=node:node server/prisma ./server/prisma
COPY --chown=node:node server/docker-entrypoint.sh ./server/docker-entrypoint.sh
WORKDIR /app/server
USER node
EXPOSE 5000
CMD ["sh", "docker-entrypoint.sh"]
