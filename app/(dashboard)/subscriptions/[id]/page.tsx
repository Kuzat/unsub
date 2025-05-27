import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSubscriptionById, getTransactionsBySubscriptionId } from "@/app/actions/subscriptions";
import { formatDate, formatCurrency, calculateNextRenewal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { transactionColumns } from "./columns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const subscriptionData = await getSubscriptionById(params.id);

  if ("error" in subscriptionData) {
    notFound();
  }

  const transactionsData = await getTransactionsBySubscriptionId(params.id);
  
  if ("error" in transactionsData) {
    console.error("Error fetching transactions:", transactionsData.error);
  }

  const transactions = "error" in transactionsData ? [] : transactionsData;
  const nextRenewalDate = calculateNextRenewal(
    subscriptionData.startDate,
    subscriptionData.billingCycle
  );

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/subscriptions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subscriptions
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Subscription Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              {subscriptionData.serviceLogoUrl ? (
                <div className="h-12 w-12 rounded overflow-hidden">
                  <Image
                    src={subscriptionData.serviceLogoUrl}
                    alt={subscriptionData.serviceName}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {subscriptionData.serviceName?.charAt(0) || "?"}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">
                  {subscriptionData.serviceName || subscriptionData.alias || "Unknown Service"}
                </h3>
                {subscriptionData.serviceCategory && (
                  <p className="text-sm text-muted-foreground capitalize">
                    {subscriptionData.serviceCategory}
                  </p>
                )}
              </div>
            </div>
            {subscriptionData.alias && subscriptionData.alias !== subscriptionData.serviceName && (
              <div className="mb-2">
                <span className="font-medium">Alias: </span>
                <span>{subscriptionData.alias}</span>
              </div>
            )}
            {subscriptionData.notes && (
              <div>
                <span className="font-medium">Notes: </span>
                <span>{subscriptionData.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Price:</span>
                <span>{formatCurrency(subscriptionData.price, subscriptionData.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Billing Cycle:</span>
                <span className="capitalize">{subscriptionData.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Start Date:</span>
                <span>{formatDate(subscriptionData.startDate.toISOString())}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Next Renewal:</span>
                <span>{formatDate(nextRenewalDate.toISOString())}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  subscriptionData.isActive
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {subscriptionData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Remind Days Before:</span>
                <span>{subscriptionData.remindDaysBefore} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All transactions related to this subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No transactions found for this subscription.
            </p>
          ) : (
            <DataTable columns={transactionColumns} data={transactions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}