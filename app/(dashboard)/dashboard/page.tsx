import {requireSession} from "@/lib/auth";
import {MonthlySubscriptionCost} from "@/components/dashboard/monthly-cost-module";
import {ActiveSubscriptionsModule} from "@/components/dashboard/active-subscriptions-module";
import {UpcomingRenewalsModule} from "@/components/dashboard/upcoming-renewals-module";
import {db} from "@/db";
import {and, eq} from "drizzle-orm";
import {userSettings} from "@/db/schema/app";

export default async function DashboardPage() {
  const session = await requireSession();

  const activeSubscriptions = await db.query.subscription.findMany({
    where: (s) => and(eq(s.userId, session.user.id), eq(s.isActive, true)),
    with: {
      service: true,
    }
  });

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });


  return (
    <>
      {activeSubscriptions.length > 0 ? (
        <>
          <div className="grid auto-rows-min gap-4 xl:grid-cols-3">
            <ActiveSubscriptionsModule activeSubscriptions={activeSubscriptions}/>
            {settings &&
                <MonthlySubscriptionCost
                    activeSubscriptions={activeSubscriptions}
                    preferredCurrency={settings?.preferredCurrency}
                />
            }
            <UpcomingRenewalsModule activeSubscriptions={activeSubscriptions}/>
          </div>
          <div className="mt-4 bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"/>
        </>
      ) : (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <ActiveSubscriptionsModule activeSubscriptions={activeSubscriptions}/>
            <div className="bg-none aspect-video rounded-xl"/>
          </div>
          <div className="mt-4 bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"/>
        </>
      )}
    </>
  )
}
