"use client"
import Link from "next/link";
import Image from "next/image";
import {useState} from "react";
import {RequestResetForm} from "@/components/auth/request-reset-form";
import {ResetPasswordForm} from "@/components/auth/reset-password-form";

export default function ResetPasswordClientPage({userEmail}: { userEmail?: string }) {
  const [email, setEmail] = useState<string | null>(null);


  const handleRequestSent = (email: string) => {
    setEmail(email);
  };

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

        {email ? (
          <ResetPasswordForm email={email}/>
        ) : (
          <RequestResetForm onRequestSent={handleRequestSent} email={userEmail}/>
        )}

        <div className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
