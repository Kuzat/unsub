import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return redirect("/login")
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Unsub
        </Link>
        <VerifyEmailForm email={session.user.email} />
      </div>
    </div>
  );
}
