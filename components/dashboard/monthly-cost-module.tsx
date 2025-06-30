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
  try {
    // Convert all prices in parallel for better performance
    const conversionPromises = activeSubscriptions.map(async (sub) => {
      const price = parseFloat(sub.price.toString());
      const convertedPrice = await convert(price, sub.currency, preferredCurrency);
      return { sub, convertedPrice };
    });

    const conversions = await Promise.all(conversionPromises);

    for (const {sub, convertedPrice} of conversions) {
      switch (sub.billingCycle) {
        case "daily":
          monthlyCostInPreferredCurrency += (convertedPrice * 365) / 12;
          break;
        case "weekly":
          monthlyCostInPreferredCurrency += (convertedPrice * 52) / 12;
          break;
        case "monthly":
          monthlyCostInPreferredCurrency += convertedPrice;
          break;
        case "quarterly":
          monthlyCostInPreferredCurrency += convertedPrice / 3;
          break;
        case "yearly":
          monthlyCostInPreferredCurrency += convertedPrice / 12;
          break;
      }
    }
  } catch (error) {
    console.error("Error calculating monthly subscription cost:", error);
    // Fallback to showing an unconverted total or error state
    return (
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground">
              Error calculating monthly subscription cost.
            </p>
          </div>
        </CardContent>
      </Card>
    );
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
