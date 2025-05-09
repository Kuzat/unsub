import NewSubscriptionForm from "@/components/subscriptions/new-subscription-form"

export default function NewSubscriptionPage() {
  return (
    <div className="mx-auto max-w-3xl w-full p-6">
      <h1 className="mb-6 text-2xl font-bold">New Subscription</h1>
      <NewSubscriptionForm />
    </div>
  );
}
