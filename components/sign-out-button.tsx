"use client"

import {Button} from "@/components/ui/button";
import {authClient} from "@/lib/client";
import {useRouter} from "next/navigation";

export default function SignOutButton() {
  const router = useRouter()
  const {
    data: session,
    isPending,
  } = authClient.useSession()

  if (isPending) {
    return <p></p>
  }

  if (!session) {
    return <></>
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <form
      action={handleLogout}
    >
      <Button type="submit">
        Sign out
      </Button>
    </form>
  )
}