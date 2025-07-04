# TODOs
A list of potential ideas and tasks that needs to be done. Not in prioritized order.

- [ ] Have some free trial feature for a subscription
  - Sometimes we have free trials that will expire after a certain amount of time and then start charging us. We should be notified before that, and also understand what the price should be once it rolls over to a normal sub.
  - This also should work with limited time offers where you get lower price for a few months before going back to normal prices.
- [ ] Implement basic Cancellation guides with versioned markdown, and voting.
- [ ] For the Service Cancellation guides it is probably good to support multiple languages, and regions for the guides. As how you cancel might differ from different regions.
- [ ] Calculate a popularity score for services, so they can be ordered by popularity when creating new subscriptions. 
- [ ] The merge services page to help find duplicate services and merge them into new global services
- [ ] add search field UI to Services, and Subscriptions page
- [ ] Add dashboard with some modules
  - [ ] A graph of spending over time on subscriptions (could use the transactions for this? how to handle yearly or subscription over larger time span?)
- [ ] Have a notification system with a notification bell in top right corner showing notifications, should be configurable, and able to add more destinations in the future
  - [ ] example destinations, sms, mobile-push (app?), discord, general webhook, etc.
- [ ] Have an onboarding section after registering where they can set preferred currency and other preferences
- [ ] Monthly subscription cost should link statistic or something page where we can see the breakdown of the cost. So which ones cost how much per month. So we can see the monhtly cost of yearly subscriptions.
- [ ] Add propper skeleton loading using suspense and loading.tsx files.
- [ ] Make sure we use the same form components in all forms. Such as the calendar/date input is different in many places now. 
- [ ] Make it easier to create a service by just adding a Url then we fetch information from the website to try autofill the service forms items.

# Premium / Pro 
Items related to the Pro plan 
- [ ] import transactions from bank using GoCardless
- [ ] Check for recurring transactions or transaction related to known services
  - [ ] Automatically, suggest subscription based on bank transactions. These should be approved by the user as there could be some overlap or error in the way these are found
