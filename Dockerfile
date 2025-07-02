# --- Base Stage ---
# Defines the Bun version we use
FROM oven/bun:1.2-alpine AS base

# --- Builder Stage ---
# This stage installs all dependencies (including dev) and builds the application
FROM base AS builder
WORKDIR /app

# Setup the needed build args secret. Only do this in private build server
ARG BETTER_AUTH_SECRET
ARG FX_RATES_API_TOKEN
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    FX_RATES_API_TOKEN=$FX_RATES_API_TOKEN \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

COPY package.json bun.lock ./

# Install production + dev exactly as locked
RUN bun install

# Copy the rest of sources
COPY . .
ENV NODE_ENV=production
RUN bun run build

# --- Runner Stage ---
# This is the final, lean image that will run in production
FROM base AS runner
WORKDIR /app

# Set the final production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from the builder stage
# This is the key: we copy the pre-installed node_modules, which includes drizzle-kit
COPY --chown=nextjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next
COPY --chown=nextjs:nodejs --from=builder /app/drizzle.config.ts ./
COPY --chown=nextjs:nodejs --from=builder /app/drizzle ./drizzle
COPY --chown=nextjs:nodejs --from=builder /app/scripts ./scripts
COPY --chown=nextjs:nodejs --from=builder /app/lib ./lib
COPY --chown=nextjs:nodejs --from=builder /app/db ./db
COPY --chown=nextjs:nodejs --from=builder /app/emails ./emails
COPY --chown=nextjs:nodejs --from=builder /app/tsconfig.json ./


# Switch to the non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000

# The final command. 'bunx' will find drizzle-kit in the copied node_modules.
# `bun run start` will execute `next start` as defined in package.json.
CMD ["sh", "-c", "bunx drizzle-kit migrate && bun run .next/standalone/server.js"]