import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import { ThemeSelector } from "@/components/settings/theme-selector";


export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect('/login')
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">General Settings</h1>
      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <ThemeSelector />
        </div>
      </div>
    </div>
  )
}
