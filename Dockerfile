# syntax=docker/dockerfile:1

# ---- Builder ----
# NOTE: Debian slim (glibc), not alpine. Rollup ships a native binary that
# installs reliably under glibc; the musl variant on alpine is flaky with npm ci.
FROM node:22.21.1-slim AS build

WORKDIR /app

# Install deps first for better layer caching.
# NOTE: We deliberately do NOT copy package-lock.json here. That lockfile was
# generated on macOS, and npm CLI bug #4828 causes it to skip rollup's
# Linux native binary (@rollup/rollup-linux-x64-gnu) on this Linux builder.
# Since package.json pins every dependency to an exact version, resolving fresh
# on Linux is deterministic for top-level deps and installs the correct
# platform-native optional dependency. The macOS lockfile is still used for
# local development; it is simply not authoritative inside the Linux image.
COPY package.json ./
RUN --mount=type=cache,target=/root/.npm \
	npm install

# Copy the rest of the source
COPY . .

# VITE_* vars are baked into the client bundle at build time.
# Provide sensible production defaults; override with --build-arg if needed.
# Secrets (SENTRY_DSN, POSTHOG) default to empty → disabled in the image.
ARG VITE_APP_NAME=voucher-manager
ARG VITE_APP_URL=""
ARG VITE_BASE_PATH=/
ARG VITE_ENVIRONMENT=production
ARG VITE_SENTRY_DSN=""
ARG VITE_POSTHOG_KEY=""
ARG VITE_POSTHOG_HOST=""

# `prebuild` runs `node --env-file=.env scripts/generate-manifest.js`,
# which requires a .env file to exist. Synthesize one from the build args.
RUN printf '%s\n' \
		"VITE_APP_NAME=${VITE_APP_NAME}" \
		"VITE_APP_URL=${VITE_APP_URL}" \
		"VITE_BASE_PATH=${VITE_BASE_PATH}" \
		"VITE_ENVIRONMENT=${VITE_ENVIRONMENT}" \
		"VITE_SENTRY_DSN=${VITE_SENTRY_DSN}" \
		"VITE_POSTHOG_KEY=${VITE_POSTHOG_KEY}" \
		"VITE_POSTHOG_HOST=${VITE_POSTHOG_HOST}" \
	> .env

# Build the Nitro server output (.output/server/index.mjs)
RUN npm run build

# ---- Runtime ----
# Distroless-free minimal Node runtime so we get a shell + env flexibility.
FROM node:22.21.1-slim AS runtime

WORKDIR /app

# Non-root user
RUN groupadd --system app && useradd --system --gid app --home-dir /app app

# Copy only the built server output
COPY --from=build /app/.output ./.output

USER app

# Runtime env (server reads process.env for Sentry env, DSN, etc.)
ENV NODE_ENV=production \
	PORT=9000

EXPOSE 9000

# Run the Nitro server directly (no `--env-file` dependency;
# pass runtime secrets via `docker run -e`).
CMD ["node", ".output/server/index.mjs"]
