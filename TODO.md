# Unsub Project TODOs

A list of potential ideas and tasks that need to be implemented. These items are not in prioritized order.

## User Interface & Experience

- [ ] Add a search field to the Services and Subscriptions pages
- [ ] Implement proper skeleton loading using Suspense and loading.tsx files
- [ ] Standardize form components across the application
  - [ ] Ensure calendar/date input components are consistent throughout the app
- [ ] Create an onboarding section for new users
  - [ ] Allow users to set preferred currency and other preferences after registration

## Subscription Management

- [ ] Implement free trial tracking features
  - [ ] Add notifications for trial expiration dates
  - [ ] Display pricing information for post-trial subscription costs
  - [ ] Support limited-time offers with temporary discounted pricing
- [ ] Link monthly subscription costs to a statistics page
  - [ ] Show detailed cost breakdowns
  - [ ] Display monthly equivalents for yearly subscriptions

## Service Management

- [ ] Calculate popularity scores for services
  - [ ] Order services by popularity when creating new subscriptions
- [ ] Create a merge services page
  - [ ] Help users find duplicate services
  - [ ] Allow merging duplicates into global services
- [ ] Simplify service creation
  - [ ] Allow users to add services by URL
  - [ ] Auto-fill service form fields by extracting information from websites
- [ ] Implement a daily cleanup job
  - [ ] Remove unused logos from storage that aren't linked to any services

## Cancellation Guides

- [ ] Implement basic cancellation guides with versioned Markdown and voting
- [ ] Add multi-language support for cancellation guides
- [ ] Include region-specific instructions for different cancellation processes

## Dashboard & Analytics

- [ ] Add a dashboard with various modules
  - [ ] Create graphs showing subscription spending over time
  - [ ] Develop solutions for visualizing yearly subscriptions in monthly views

## Notifications

- [ ] Implement a notification system
  - [ ] Add a notification bell in the top right corner
  - [ ] Make notifications configurable
  - [ ] Support multiple notification destinations (SMS, mobile push, Discord, webhooks, etc.)

## Premium / Pro Features

- [ ] Import transactions from banks using GoCardless
- [ ] Analyze financial data for subscription management
  - [ ] Check for recurring transactions related to known services
  - [ ] Automatically suggest subscriptions based on bank transactions
  - [ ] Implement user approval for suggested subscriptions to prevent errors