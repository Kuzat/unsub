# 💰 Unsub

Unsub is a subscription management application that helps you track, manage, and optimize your recurring subscriptions. Never forget about unwanted subscriptions again!

## Features

- Track all your subscriptions in one place
- Get reminders before renewal dates
- View transaction history
- Find cancellation guides for popular services
- Categorize and analyze your subscription spending

## Development Setup

### Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- PostgreSQL (or use the provided Docker setup)

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/unsub.git
   cd unsub
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your specific configuration:
   - `DATABASE_URL`: PostgreSQL connection string
   - `BETTER_AUTH_SECRET`: Secret for authentication
   - `BETTER_AUTH_URL`: URL for authentication callbacks
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: For Google OAuth integration

4. Start the PostgreSQL database:
   ```bash
   docker-compose up -d
   ```

### Database Migrations

This project uses Drizzle ORM for database management. The schema is defined in the `db/schema` directory.

#### Generate Migration Files

To generate migration files based on your schema changes:

```bash
npx drizzle-kit generate
```

This will create SQL migration files in the `drizzle` directory.

#### Apply Migrations

To apply migrations to your database:

```bash
npx drizzle-kit migrate
```

#### Push Schema Changes Directly (Development Only)

For quick development iterations, you can push schema changes directly:

```bash
npx drizzle-kit push
```

> Note: It's recommended to use proper migrations for production environments.

## Running the Application

Start the development server:

```bash
npm run dev
# or
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Processing Subscription Renewals

The application includes a job to process subscription renewals based on each subscription's billing cycle. This job:

1. Finds all active subscriptions
2. Calculates any missed renewal dates
3. Creates renewal transactions for each missed date

### Running the Renewal Process Manually

To manually process subscription renewals, run:

```bash
npm run job:subscriptions:processRenewals
# or
bun run job:subscriptions:processRenewals
```

This will execute the renewal job once and display a summary of the results.

### Setting Up Automated Renewal Processing

For production environments, it's recommended to set up a cron job to run the renewal process daily:

```bash
# Example cron job to run daily at 1:00 AM
0 1 * * * cd /path/to/unsub && npm run job:subscriptions:processRenewals
```

This ensures that subscription renewals are processed automatically without manual intervention.

## Building for Production

```bash
npm run build
npm run start
```

## Technologies Used

- Next.js 15
- React 19
- Drizzle ORM
- PostgreSQL
- Tailwind CSS
- Better Auth for authentication
