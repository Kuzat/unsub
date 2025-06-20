"use server"
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import ResetPasswordClientPage from "@/components/auth/reset-password-client-page";

export default async function ResetPasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <ResetPasswordClientPage userEmail={session?.user?.email}/>
    </>
  )
}
