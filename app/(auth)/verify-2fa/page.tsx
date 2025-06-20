import { VerifyTwoFactorForm } from "@/components/auth/verify-2fa-form"
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function VerifyTwoFactorPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session) {
    return redirect("/dashboard")
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <Image
            src="/unsub.svg"
            alt="Unsub logo"
            width={16}
            height={16}
            className="flex size-6 items-center justify-center rounded-md"
          />
          Unsub
        </Link>
        <VerifyTwoFactorForm />
      </div>
    </div>
  )
}