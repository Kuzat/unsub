# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run maildev` - Start local email server for development

## Database Commands

- `npx drizzle-kit generate` - Generate migration files from schema changes
- `npx drizzle-kit migrate` - Apply migrations to database
- `npx drizzle-kit push` - Push schema changes directly (development only)
- `npm run db:seed` - Seed services data

## Job Commands

- `npm run job:subscriptions:processRenewals` - Process subscription renewals manually
- `npm run job:reminders:process` - Process subscription reminder emails

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email OTP, 2FA, and Google OAuth
- **Styling**: Tailwind CSS v4 with OKLCH colors
- **UI Components**: Radix UI with shadcn/ui patterns
- **Email**: React Email components with Scaleway TEM (prod) or MailDev (dev)

### Project Structure

#### Database Schema (`db/schema/`)
- `auth.ts` - Better Auth tables (users, sessions, accounts)
- `app.ts` - Core application tables (services, subscriptions, transactions, guides)
- `_common.ts` - Shared enums and types
- `relations.ts` - Drizzle relations

#### Key Data Models
- **Services**: Subscription services with logos, categories, and user/global scopes
- **Subscriptions**: User subscription tracking with billing cycles and reminders
- **Transactions**: Financial transactions linked to subscriptions
- **Guides**: Cancellation guides with versioning and admin approval workflow
- **User Settings**: Preferences for currency, email notifications

#### Authentication (`lib/auth.ts`)
- Uses Better Auth with Drizzle adapter
- Email verification required for new users
- 2FA support with TOTP
- Admin role system with `requireAdmin()` helper
- Session management with `requireSession()`

#### App Router Structure
- `(auth)/` - Authentication pages (login, register, 2FA, etc.)
- `(dashboard)/` - Protected dashboard pages
- `admin/` - Admin-only pages for service catalog and guide management
- `api/auth/[...all]/` - Better Auth API routes

#### Components Organization
- `ui/` - Reusable UI components (shadcn/ui pattern)
- `auth/` - Authentication-specific components
- `services/`, `subscriptions/`, `guides/` - Feature-specific components
- `admin/` - Admin interface components

### Development Workflow

#### Local Email Testing
Start MailDev with `npm run maildev` and view emails at http://localhost:1080

#### Database Development
Use `npx drizzle-kit push` for quick schema iteration in development, but generate proper migrations with `npx drizzle-kit generate` for production.

#### Service Logo Pipeline
Services support logo upload with CDN storage via Bunny.net. Original URLs are processed and stored as `logoCdnUrl` with hash-based deduplication.

#### Guide Review System
Cancellation guides use a versioned approval system where:
- New guides start with `pending` status
- Admins can approve/reject via admin panel
- Only approved guides are visible to users
- Version history is maintained

### Important Patterns

#### Server vs Client Components
- **ALWAYS keep pages as Server Components** - Pages (`page.tsx`) should be server components by default
- **Use "use client" only for components that need client-side state or interactivity** - Create separate client components for forms, interactive elements, etc.
- **Pattern**: Server page fetches data and passes it to client components as props
- **Example**: Instead of making `page.tsx` a client component, create a separate `MyForm.tsx` client component and import it into the server page

#### Form Validation
Uses React Hook Form with Zod schemas defined in `lib/validation/`

#### Database Queries
Drizzle queries are centralized in server actions (`app/actions/`)

#### Error Handling
Uses `better-auth` error handling patterns with redirect-based flow control

#### Currency Handling
Multi-currency support with exchange rate caching (`lib/fx-cache.ts`, `lib/fx-rates-api.ts`)