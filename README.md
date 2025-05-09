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
