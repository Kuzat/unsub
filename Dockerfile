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

# Copy necessary files from the builder stage
# We copy package.json to install the exact dependencies for our project
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./
COPY --chown=nextjs:nodejs --from=builder /app/package-lock.json ./

# Copy the built application and public assets
COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next
COPY --chown=nextjs:nodejs --from=builder /app/public ./public

# Copy config files needed for migration and running the app
COPY --chown=nextjs:nodejs --from=builder /app/drizzle.config.ts ./
COPY --chown=nextjs:nodejs --from=builder /app/drizzle ./drizzle
COPY --chown=nextjs:nodejs --from=builder /app/next.config.ts ./

# Install ALL dependencies (prod and dev) from the lock file.
# This makes our dev tools, like drizzle-kit, available.
RUN npm ci

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Use 'npx' to run the drizzle-kit from node_modules, ensuring we use the project's version.
# Then, start the application using the 'start' script from package.json.
CMD ["sh", "-c", "npx drizzle-kit migrate && npm run start"]