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
   - `EMAIL_FROM`: Email address used as the sender
   - `EMAIL_NAME`: Display name for the sender (used in production)
   - `OTP_COOLDOWN_SECONDS`: Minimum time in seconds between sending verification codes (default: 60)
   - `SCALEWAY_ACCESS_KEY`, `SCALEWAY_SECRET_KEY`, `SCALEWAY_PROJECT_ID`: Required for production email sending
   - `NEXT_PUBLIC_SUPPORT_EMAIL`: Email address displayed for support contact in the application

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

## Local Email Development

For local development, the application uses MailDev to capture and view emails sent by the application without actually sending them to real recipients.

### Starting the Local Email Server

Start the MailDev server:

```bash
npm run maildev
# or
bun run maildev
```

This will start a local SMTP server on port 1025 and a web interface on port 1080.

### Viewing Sent Emails

Once the MailDev server is running, you can view all emails sent by the application by opening:

[http://localhost:1080](http://localhost:1080)

### How It Works

In development mode, the application automatically sends emails to the local SMTP server on port 1025. The emails are captured by MailDev and can be viewed in its web interface. This allows you to test email functionality without sending real emails.

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

### Standard Build

```bash
npm run build
npm run start
```

### Docker Deployment

The application includes Docker configuration for production deployment.

#### Prerequisites

- Docker and Docker Compose installed on your server

#### Environment Setup

1. Create a production environment file:
   ```bash
   cp .env.example .env.production
   ```

2. Edit the `.env.production` file with your production configuration:
   - Set `NODE_ENV=production`
   - Configure `DATABASE_URL` to use the PostgreSQL service: `postgres://postgres:postgres@postgres:5432/postgres`
   - Set all other required environment variables for production

#### Building and Running with Docker

1. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

2. Apply database migrations:
   ```bash
   docker-compose exec nextjs npx drizzle-kit migrate
   ```

3. The application will be available at http://localhost:3000 (or your configured domain)

#### Stopping the Application

```bash
docker-compose down
```

#### Viewing Logs

```bash
docker-compose logs -f nextjs
```

#### Updating the Application

To update the application with new code:

```bash
git pull
docker-compose up -d --build
```

## Technologies Used

- Next.js 15
- React 19
- Drizzle ORM
- PostgreSQL
- Tailwind CSS
- Better Auth for authentication
- Docker for containerization and deployment
