import { auth } from "@/lib/auth";
import {headers} from "next/headers";
import {Button} from "@/components/ui/button";
import {authClient} from "@/lib/client";
import {redirect} from "next/navigation";


export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  const handleSignOut = async () => {
    "use server"
    try {
      await auth.api.signOut({
        headers: await headers()
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }

    return redirect("/login")
  }

  return (
  <div className="mx-auto flex min-h-screen max-w-4xl flex-col p-8">
    <header className="flex items-center justify-between pb-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <form
        action={handleSignOut}
      >
        <Button type="submit">Sign out</Button>
      </form>
    </header>
    <main className="flex-1">
      <div className="rounded-lg border p-8 text-center">
        <h2 className="text-2xl font-semibold">Welcome to your dashboard! {session.user.name}!</h2>
        <p className="mt-2 text-muted-foreground">You have successfully logged in to the application.</p>
      </div>
    </main>
  </div>
  );
}