import { notFound, redirect } from "next/navigation";
import {auth, requireSession} from "@/lib/auth";
import { headers } from "next/headers";
import { getSubscriptionById, getTransactionsBySubscriptionId } from "@/app/actions/subscriptions";
import {formatDate, formatCurrency, calculateNextRenewal, toIsoDate} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { transactionColumns } from "./columns";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { AddTransaction } from "@/components/transactions/add-transaction";
import ServiceLogo from "@/components/ui/service-logo";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();

  const {id} = await params;

  const subscriptionData = await getSubscriptionById(id);

  if ("error" in subscriptionData) {
    notFound();
  }

  const transactionsData = await getTransactionsBySubscriptionId(id);

  if ("error" in transactionsData) {
    console.error("Error fetching transactions:", transactionsData.error);
  }

  const transactions = "error" in transactionsData ? [] : transactionsData;
  const nextRenewalDate = calculateNextRenewal(
    new Date(subscriptionData.startDate),
    subscriptionData.billingCycle
  );
  console.log(subscriptionData)

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" asChild>
            <Link href="/subscriptions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Subscriptions
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/subscriptions/edit/${id}?from=view`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Subscription
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Subscription Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <ServiceLogo
                image={subscriptionData.serviceLogoUrl}
                placeholder={subscriptionData.serviceName.charAt(0)}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg"
                />
              <div>
                <h3 className="text-lg font-semibold">
                  {subscriptionData.serviceName || subscriptionData.alias || "Unknown Service"}
                </h3>
                <div className="flex items-center gap-2">
                  {subscriptionData.serviceCategory && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {subscriptionData.serviceCategory}
                    </p>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    subscriptionData.serviceScope === "global"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                  }`}>
                    {subscriptionData.serviceScope === "global" ? "Global Service" : "Custom Service"}
                  </span>
                  {subscriptionData.serviceScope === "user" && subscriptionData.serviceOwnerId === session.user.id && (
                    <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                      <Link href={`/services/edit/${subscriptionData.serviceId}`}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
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
                <span>{formatCurrency(parseFloat(subscriptionData.price), subscriptionData.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Billing Cycle:</span>
                <span className="capitalize">{subscriptionData.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Start Date:</span>
                <span>{formatDate(subscriptionData.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Next Renewal:</span>
                <span>{formatDate(toIsoDate(nextRenewalDate))}</span>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              All transactions related to this subscription
            </CardDescription>
          </div>
          <AddTransaction 
            subscriptionId={id}
            subscriptionCurrency={subscriptionData.currency} 
          />
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
