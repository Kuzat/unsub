"use client"

import {TwoFactorForm} from "@/components/auth/two-factor-form";
import {useRouter} from "next/navigation";

export default function Enable2FA() {
  const router = useRouter()
  const handleOnCompletedTwoFactor = () => {
    router.push("/dashboard")
  }

  return (
    <>
      <TwoFactorForm onCompleted={handleOnCompletedTwoFactor}/>
    </>
  )
}