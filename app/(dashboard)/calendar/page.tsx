import {desc, eq} from "drizzle-orm";
import {db} from "@/db";
import {subscription} from "@/db/schema/app";
import {requireSession} from "@/lib/auth";
import {calculateNextRenewal, formatCurrency, formatDate, toIsoDate} from "@/lib/utils";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {RenewalCalendar} from "@/components/ui/renewal-calendar";
import Link from "next/link";
import ServiceLogo from "@/components/ui/service-logo";

/**
 * Renders the subscription renewal calendar and a list of upcoming renewals for the authenticated user.
 *
 * Redirects to the login page if the user is not authenticated. Fetches the user's active subscriptions, calculates upcoming renewals within the next three months, groups them by renewal date, and displays them in both a calendar view and a detailed list.
 *
 * @returns The subscription calendar page as a React server component.
 */
export default async function CalendarPage() {
  const session = await requireSession()

  // Fetch all active subscriptions for the current user
  const activeSubscriptions = await db.query.subscription.findMany({
    where: eq(subscription.userId, session.user.id),
    orderBy: [desc(subscription.startDate)],
    with: {
      service: true,
    }
  });

  // Create an array of upcoming renewals with subscription details
  const upcomingRenewals = activeSubscriptions
    .filter(sub => sub.isActive)
    .map(sub => {
      const nextRenewal = calculateNextRenewal(
        new Date(sub.startDate),
        sub.billingCycle
      );

      return {
        id: sub.id,
        serviceName: sub.service?.name || sub.alias || "Unknown Service",
        serviceLogoUrl: sub.service?.logoCdnUrl,
        price: parseFloat(sub.price),
        currency: sub.currency,
        renewalDate: nextRenewal,
        billingCycle: sub.billingCycle,
      };
    })
    .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

  // Group renewals by date for the calendar
  const renewalsByDate = upcomingRenewals.reduce((acc, renewal) => {
    const dateKey = toIsoDate(renewal.renewalDate)
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(renewal);
    return acc;
  }, {} as Record<string, typeof upcomingRenewals>);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscription Calendar</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="min-h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              Upcoming subscription renewals for the next 3 months
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <RenewalCalendar
              renewalsByDate={renewalsByDate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
            <CardDescription>
              Your subscription renewals for the next 3 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingRenewals.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                No upcoming renewals in the next 3 months.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(renewalsByDate).map(([dateStr, renewals]) => (
                  <div key={dateStr} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{formatDate(dateStr)}</h3>
                      <Badge variant="outline">
                        {renewals.length} {renewals.length === 1 ? "renewal" : "renewals"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {renewals.map((renewal) => (
                        <Link
                          key={renewal.id}
                          href={`/subscriptions/${renewal.id}`}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ServiceLogo
                              image={renewal.serviceLogoUrl}
                              placeholder={renewal.serviceName.charAt(0)}
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-lg"
                            />
                            <div>
                              <p className="font-medium hover:underline">{renewal.serviceName}</p>
                              <p className="text-xs text-muted-foreground">{renewal.billingCycle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(renewal.price, renewal.currency)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
