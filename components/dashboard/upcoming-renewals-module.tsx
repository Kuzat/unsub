import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {calculateNextRenewal, formatCurrency} from "@/lib/utils";
import {service, subscription} from "@/db/schema/app";
import {CalendarIcon} from "lucide-react";

type SubscriptionWithService = typeof subscription.$inferSelect & { service: typeof service.$inferSelect | null }

interface UpcomingRenewalsModuleProps {
  activeSubscriptions: SubscriptionWithService[];
}

export async function UpcomingRenewalsModule({activeSubscriptions}: UpcomingRenewalsModuleProps) {
  // Filter out one-time subscriptions and calculate next renewal for each subscription
  const subscriptionsWithRenewal = activeSubscriptions
    .map(sub => ({
      ...sub,
      nextRenewal: calculateNextRenewal(
        sub.startDate,
        sub.billingCycle,
      )
    }))
    .filter(sub => sub.nextRenewal !== null);

  // Sort by upcoming renewal date (closest first)
  const upcomingRenewals = subscriptionsWithRenewal.sort((a, b) => {
    return a.nextRenewal!.getTime() - b.nextRenewal!.getTime();
  });

  // Take only the next 3 renewals
  const nextRenewals = upcomingRenewals.slice(0, 3);

  // Format date as "MMM DD, YYYY" (e.g., "Jan 01, 2023")
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Renewals</CardTitle>
        <CardDescription>
          Your subscriptions that will renew soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        {nextRenewals.length > 0 ? (
          <div className="space-y-4">
            {nextRenewals.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground"/>
                  <div>
                    <p className="font-medium max-w-[200px] truncate">
                      {sub.alias || (sub.service?.name ?? "Unnamed Service")}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(sub.nextRenewal!)}</p>
                  </div>
                </div>
                <span className="font-medium">{formatCurrency(parseFloat(sub.price.toString()), sub.currency)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground">No upcoming renewals</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}