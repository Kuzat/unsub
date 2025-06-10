# Use Node.js 20 as the base image
FROM node:20-alpine AS base

# Install dependencies and build in one stage for debugging
FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install drizzle-kit and pg globally.
# pg is a peer dependency for drizzle-kit when working with PostgreSQL.
# This is done as root before switching to the nextjs user.
RUN npm install -g drizzle-kit pg

# Copy Drizzle configuration and migration files from the builder stage.
# These are needed by 'drizzle-kit migrate'.
# Ensure these paths match your project structure (e.g., drizzle.config.ts and drizzle/ folder at the root).
COPY --chown=nextjs:nodejs --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --chown=nextjs:nodejs --from=builder /app/drizzle ./drizzle

# Copy the built application files
COPY --from=builder /app/public ./public

# Ensure .next directory exists and has correct permissions before copying static assets into it
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Modify CMD to run migrations then start the server.
# 'drizzle-kit migrate' will use the globally installed package.
# 'node server.js' starts your Next.js application.
CMD ["sh", "-c", "drizzle-kit migrate && node server.js"]
