import { auth } from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import SettingsTabs from "@/components/settings-tabs";

export default async function SettingsLayout({children}: {children: React.ReactNode}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect('/login')
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-8 py-10 bg-background/95">
      <SettingsTabs/>
      <div className="mt-8">
        {children}
      </div>
    </div>
  )
}
