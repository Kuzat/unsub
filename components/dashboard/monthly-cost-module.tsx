import {InferSelectModel} from "drizzle-orm";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatCurrency} from "@/lib/utils";
import {subscription} from "@/db/schema/app";
import {convert} from "@/lib/fx-cache";
import {HelpCircle} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

interface MonthlySubscriptionCostProps {
  activeSubscriptions: InferSelectModel<typeof subscription>[]
  preferredCurrency: string;
}

export async function MonthlySubscriptionCost({activeSubscriptions, preferredCurrency}: MonthlySubscriptionCostProps) {
  // Calculate total monthly cost in preferred currency
  let monthlyCostInPreferredCurrency = 0
  for (const sub of activeSubscriptions) {
    const price = parseFloat(sub.price.toString());
    const normPrice = await convert(price, sub.currency, preferredCurrency);

    switch (sub.billingCycle) {
      case "daily":
        monthlyCostInPreferredCurrency += (normPrice * 365) / 12;
        break;
      case "weekly":
        monthlyCostInPreferredCurrency += (normPrice * 52) / 12;
        break;
      case "monthly":
        monthlyCostInPreferredCurrency += normPrice;
        break;
      case "quarterly":
        monthlyCostInPreferredCurrency += normPrice / 3;
        break;
      case "yearly":
        monthlyCostInPreferredCurrency += normPrice / 12;
        break;
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Subscription Cost</CardTitle>
        <CardDescription className="flex items-center">
          Total cost of all your active subscriptions per month
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground"/>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Converted to your preferred currency. Note that amounts may vary slightly as currency conversion rates are
              periodically updated.
            </TooltipContent>
          </Tooltip>
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        <div className="flex flex-col justify-center items-center h-full">
            <span
              className="text-4xl font-bold">{formatCurrency(monthlyCostInPreferredCurrency, preferredCurrency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
