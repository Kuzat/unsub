import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {calculateNextRenewal, formatCurrency, formatDate, toIsoDate} from "@/lib/utils";
import {service, subscription} from "@/db/schema/app";
import {CalendarIcon, ExternalLinkIcon} from "lucide-react";
import Link from "next/link";

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
        new Date(sub.startDate),
        sub.billingCycle,
      )
    }))
    .filter(sub => sub.nextRenewal !== null);

  // Sort by upcoming renewal date (closest first)
  const upcomingRenewals = subscriptionsWithRenewal.sort((a, b) => {
    if (!a.nextRenewal || !b.nextRenewal) return 0;
    return a.nextRenewal!.getTime() - b.nextRenewal!.getTime();
  });

  // Take only the next 3 renewals
  const nextRenewals = upcomingRenewals.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Renewals</CardTitle>
          <CardDescription>
            Your subscriptions that will renew soon
          </CardDescription>
        </div>
        <Link 
          href="/calendar" 
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          title="View full calendar"
        >
          <span className="truncate">View all</span>
          <ExternalLinkIcon className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {nextRenewals.length > 0 ? (
          <div className="space-y-4">
            {nextRenewals.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground"/>
                  <div>
                    <p className="font-medium max-w-[120px] sm:max-w-[200px] truncate">
                      {sub.alias || (sub.service?.name ?? "Unnamed Service")}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(toIsoDate(sub.nextRenewal))}</p>
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
