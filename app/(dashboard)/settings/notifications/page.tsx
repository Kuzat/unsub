import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {db} from "@/db";
import {userSettings} from "@/db/schema/app";
import {eq} from "drizzle-orm";
import {EmailNotificationsForm} from "@/components/settings/email-notifications-form";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect('/login')
  }

  // Fetch user settings
  const userSettingsRecord = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  // Default to true if no settings record exists
  const receiveEmails = userSettingsRecord?.receiveEmails ?? true;
  const sendRenewalReminderEmails = userSettingsRecord?.sendRenewalReminderEmails ?? true;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Notifications Settings</h1>
      <div className="rounded-lg border p-4 space-y-6">
        <EmailNotificationsForm 
          receiveEmails={receiveEmails} 
          sendRenewalReminderEmails={sendRenewalReminderEmails} 
        />
      </div>
    </div>
  )
}
