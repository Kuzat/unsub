# Unsub Project Guidelines

This document provides guidelines and information for developers working on the Unsub project.

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

### Running Tests

Run tests once:
```bash
npm test
```

Run tests in watch mode (for development):
```bash
npm run test:watch
```

### Writing Tests

#### Unit Tests

Unit tests should be placed in the `__tests__` directory, mirroring the structure of the source code. For example:

- Source file: `lib/utils.ts`
- Test file: `__tests__/lib/utils.test.ts`

Example unit test for utility functions:

```typescript
import { calculateNextRenewal } from '@/lib/utils';

describe('calculateNextRenewal', () => {
  const mockCurrentDate = new Date('2023-06-15');
  
  test('should return start date if it is in the future', () => {
    const startDate = '2023-07-01';
    const result = calculateNextRenewal(startDate, 'monthly', mockCurrentDate);
    expect(result.toISOString().split('T')[0]).toBe('2023-07-01');
  });
});
```

#### Component Tests

Component tests should also be placed in the `__tests__` directory, mirroring the structure of the components directory:

- Component file: `components/ui/button.tsx`
- Test file: `__tests__/components/ui/button.test.tsx`

Example component test:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders button with default variant and size', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });
  
  test('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests.
2. **Use Testing Library Queries**: Prefer queries that resemble how users interact with your app (e.g., `getByRole`, `getByText`) over implementation details.
3. **Mock External Dependencies**: Use Jest's mocking capabilities to mock API calls, database interactions, etc.
4. **Test Edge Cases**: Include tests for error states, loading states, and edge cases.
5. **Keep Tests Simple**: Each test should verify one specific behavior.

## Additional Development Information

### Project Structure

- `app/`: Next.js App Router routes and page components
  - `(auth)/`: Authentication-related routes
  - `(dashboard)/`: Dashboard routes
  - `actions/`: Server actions
  - `api/`: API routes
- `components/`: React components
  - `ui/`: Reusable UI components
  - `auth/`: Authentication-related components
  - `subscriptions/`: Subscription-related components
- `db/`: Database-related code
  - `schema/`: Drizzle ORM schema definitions
  - `data/`: Seed data and data access functions
- `lib/`: Utility functions and business logic
- `public/`: Static assets

### Code Style and Conventions

- **TypeScript**: The project uses TypeScript for type safety. Ensure all new code has proper type definitions.
- **ESLint**: The project uses ESLint with Next.js's recommended configurations. Run `npm run lint` to check for linting issues.
- **Component Structure**: UI components are built using a combination of Radix UI primitives and custom styling with Tailwind CSS.
- **Styling**: The project uses Tailwind CSS for styling. Use the `cn` utility function from `lib/utils.ts` to merge Tailwind classes.
- **Path Aliases**: Use the `@/` path alias to import from the project root (e.g., `import { Button } from '@/components/ui/button'`).

### Authentication

The project uses Better Auth for authentication. Authentication-related components are in the `components/auth` directory, and authentication routes are in the `app/(auth)` directory.

### Database Access

Database access is handled through Drizzle ORM. The schema is defined in the `db/schema` directory, and data access functions are in the `db/data` directory.

### Server Actions

The project uses Next.js Server Actions for server-side operations. These are defined in the `app/actions` directory.

### Debugging Tips

1. Use the Next.js development server's built-in error overlay for debugging client-side errors.
2. For server-side errors, check the terminal where the Next.js server is running.
3. Use the browser's developer tools to inspect network requests, component state, and console logs.
4. For database issues, check the Docker logs for the PostgreSQL container.