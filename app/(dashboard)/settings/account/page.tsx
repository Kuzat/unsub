import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect('/login')
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground">
          This is where you configure account settings
        </p>
      </div>
    </div>
  )
}
