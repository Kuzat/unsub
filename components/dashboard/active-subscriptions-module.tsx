import {InferSelectModel} from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {subscription} from "@/db/schema/app";

interface ActiveSubscriptionsModuleProps {
  activeSubscriptions: InferSelectModel<typeof subscription>[];
}

export async function ActiveSubscriptionsModule({ activeSubscriptions }: ActiveSubscriptionsModuleProps) {
  // Count of active subscriptions
  const activeCount = activeSubscriptions.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Subscriptions</CardTitle>
        <CardDescription>
          Overview of your current active subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-2">
          <div className="mb-4 text-center">
            <p className="text-4xl font-bold">{activeCount}</p>
            <p className="text-muted-foreground">
              {activeCount === 1 ? "Active Subscription" : "Active Subscriptions"}
            </p>
          </div>
          <Button asChild>
            <Link href="/subscriptions/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New Subscription
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}