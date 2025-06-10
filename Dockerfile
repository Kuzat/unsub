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

# Explicitly set NODE_PATH to help Node find globally installed packages.
ENV NODE_PATH=/usr/local/lib/node_modules

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install drizzle-kit and its required peer dependencies globally.
RUN npm install -g drizzle-kit pg dotenv

# Copy Drizzle configuration and migration files from the builder stage.
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

CMD ["sh", "-c", "drizzle-kit migrate && node server.js"]
