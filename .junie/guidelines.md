# Unsub Project Guidelines

This document provides guidelines and information for developers working on the Unsub project.

Use Tailwind v4 which means you do the config in global.css

## Build/Configuration Instructions

### Prerequisites

- Node.js v18 or later
- Docker and Docker Compose
- PostgreSQL (or use the provided Docker setup)

### Environment Setup

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/yourusername/unsub.git
   cd unsub
   npm install
   # or
   bun install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in the `.env` file:
   - `DATABASE_URL`: PostgreSQL connection string
   - `BETTER_AUTH_SECRET`: Secret for authentication
   - `BETTER_AUTH_URL`: URL for authentication callbacks
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: For Google OAuth integration

3. Start the PostgreSQL database:
   ```bash
   docker-compose up -d
   ```

### Database Management

This project uses Drizzle ORM for database management. The schema is defined in the `db/schema` directory.

#### Generate Migration Files

```bash
npx drizzle-kit generate
```

#### Apply Migrations

```bash
npx drizzle-kit migrate
```

#### Push Schema Changes (Development Only)

```bash
npx drizzle-kit push
```

### Running the Application

Start the development server:
```bash
npm run dev
# or
bun dev
```

The application will be available at http://localhost:3000.

### Building for Production

```bash
npm run build
npm run start
```

## Testing Information

### Testing Setup

The project uses Jest and React Testing Library for testing. To set up testing:

1. Install testing dependencies:
   ```bash
   npm install --save-dev jest jest-environment-jsdom babel-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
   ```

2. Ensure the following configuration files are present:
   - `jest.config.js`: Jest configuration
   - `jest.setup.js`: Jest setup file

3. Add test scripts to package.json:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch"
   }
   ```

### Code Style and Conventions

- **TypeScript**: The project uses TypeScript for type safety. Ensure all new code has proper type definitions.
- **ESLint**: The project uses ESLint with Next.js's recommended configurations. Run `npm run lint` to check for linting issues.
- **Component Structure**: UI components are built using a combination of Radix UI primitives and custom styling with Tailwind CSS.
- **Styling**: The project uses Tailwind CSS for styling. Use the `cn` utility function from `lib/utils.ts` to merge Tailwind classes.
- **Path Aliases**: Use the `@/` path alias to import from the project root (e.g., `import { Button } from '@/components/ui/button'`).
- **No explicit any**: Do not use the `any` type explicitly. 

### Authentication

The project uses Better Auth for authentication. Authentication-related components are in the `components/auth` directory, and authentication routes are in the `app/(auth)` directory.

### Database Access

Database access is handled through Drizzle ORM. The schema is defined in the `db/schema` directory, and data access functions are in the `db/data` directory.

### Server Actions

The project uses Next.js Server Actions for server-side operations. These are defined in the `app/actions` directory.

* SECURITY GUIDELINES FOR SERVER ACTIONS:
* - Always require authentication before any action is taken.
* - Always ensure resources are only readable/modifiable by their owners.
* - Validate all inputs using Zod or another schema validator.
* - Check the affected row count on updates/deletes; error if 0 rows are updated/deleted.
* - Do NOT leak resource existence or private information in errors.
* - Only expose and modify minimal necessary information.
*
* When reviewing (or via AI), reject any action that does not follow these!

### Debugging Tips

1. Use the Next.js development server's built-in error overlay for debugging client-side errors.
2. For server-side errors, check the terminal where the Next.js server is running.
3. Use the browser's developer tools to inspect network requests, component state, and console logs.
4. For database issues, check the Docker logs for the PostgreSQL container.