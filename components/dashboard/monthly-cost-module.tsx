import {InferSelectModel} from "drizzle-orm";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatCurrency} from "@/lib/utils";
import {subscription} from "@/db/schema/app";

interface MonthlySubscriptionCostProps {
  activeSubscriptions: InferSelectModel<typeof subscription>[]
}

export async function MonthlySubscriptionCost({activeSubscriptions}: MonthlySubscriptionCostProps) {
  // Group subscriptions by currency
  const currencyGroups = activeSubscriptions.reduce((groups, sub) => {
    const currency = sub.currency;
    if (!groups[currency]) {
      groups[currency] = [];
    }
    groups[currency].push(sub);
    return groups;
  }, {} as Record<string, typeof activeSubscriptions>);

  // Calculate total monthly cost per currency
  const monthlyCostsByCurrency = Object.entries(currencyGroups).map(([currency, subs]) => {
    const total = subs.reduce((sum, sub) => {
      const price = parseFloat(sub.price.toString());

      switch (sub.billingCycle) {
        case "daily":
          return sum + price * 30;
        case "weekly":
          return sum + price * 4.33;
        case "monthly":
          return sum + price;
        case "quarterly":
          return sum + price / 3;
        case "yearly":
          return sum + price / 12;
        case "one_time":
          return sum;
        default:
          return sum;
      }
    }, 0);

    return {currency, total};
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Subscription Cost</CardTitle>
        <CardDescription>
          Total cost of all your active subscriptions per month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {monthlyCostsByCurrency.map(({currency, total}) => (
            <div key={currency} className="flex justify-between items-center">
              <span className="text-muted-foreground">Total in {currency}</span>
              <span className="text-xl font-bold">{formatCurrency(total, currency)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}