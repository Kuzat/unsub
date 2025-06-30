import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { ProfileForm } from "@/components/settings/profile-form";
import { CurrencyPreferenceForm } from "@/components/settings/currency-preference-form";
import { db } from "@/db";
import { userSettings } from "@/db/schema/app";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect('/login')
  }

  // Fetch user settings to get preferred currency
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  // Default to USD if no settings found
  const preferredCurrency = settings?.preferredCurrency || "USD";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">General Settings</h1>
      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <ProfileForm initialName={session.user.name} />
        </div>
        <div className="rounded-lg border p-4">
          <CurrencyPreferenceForm initialCurrency={preferredCurrency} />
        </div>
        <div className="rounded-lg border p-4">
          <ThemeSelector />
        </div>
      </div>
    </div>
  )
}
