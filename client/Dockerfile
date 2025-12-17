FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY client ./client
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build --workspace client && mkdir -p client/public

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/client/.next/standalone ./
COPY --from=build --chown=node:node /app/client/.next/static ./client/.next/static
COPY --from=build --chown=node:node /app/client/public ./client/public
USER node
EXPOSE 3000
CMD ["node", "client/server.js"]
