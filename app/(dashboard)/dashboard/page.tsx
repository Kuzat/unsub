import {requireSession} from "@/lib/auth";
import {MonthlySubscriptionCost} from "@/components/dashboard/monthly-cost-module";
import {ActiveSubscriptionsModule} from "@/components/dashboard/active-subscriptions-module";
import {db} from "@/db";
import {eq} from "drizzle-orm";

export default async function DashboardPage() {
  const session = await requireSession();

  const activeSubscriptions = await db.query.subscription.findMany({
    where: (s) => eq(s.userId, session.user.id) && eq(s.isActive, true),
  });

  return (
    <>
      {activeSubscriptions.length > 0 ? (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <ActiveSubscriptionsModule activeSubscriptions={activeSubscriptions}/>
            <MonthlySubscriptionCost activeSubscriptions={activeSubscriptions}/>
            <div className="bg-none aspect-video rounded-xl"/>
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"/>
        </>
      ) : (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <ActiveSubscriptionsModule activeSubscriptions={activeSubscriptions}/>
            <div className="bg-none aspect-video rounded-xl"/>
            <div className="bg-none aspect-video rounded-xl"/>
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"/>
        </>
      )}
    </>
  )
}
