# syntax=docker/dockerfile:1

# ---- Build stage -------------------------------------------------------------
# Debian-based image: native deps (@takumi-rs/core for OG images) ship glibc builds,
# and Node 22 provides node:sqlite required by @nuxt/content's native connector.
FROM node:22-bookworm-slim AS build

WORKDIR /app

# pnpm version comes from the "packageManager" field in package.json
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN pnpm build

# ---- Runtime stage -----------------------------------------------------------
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000

WORKDIR /app

# Nuxt Content rebuilds its SQLite database under .data at startup, so it must be writable.
COPY --from=build --chown=node:node /app/.output ./.output
RUN mkdir -p .data && chown node:node .data

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
