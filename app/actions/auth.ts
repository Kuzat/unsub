"use server"

import {auth} from "@/lib/auth";
import {headers} from "next/headers";

type SendVerificationOtpResult = {error?: string} | {retryIn: number};

const OTP_COOLDOWN_SECONDS = parseInt(process.env.OTP_COOLDOWN_SECONDS ?? "60", 10);

export async function sendEmailVerificationOtp(): Promise<SendVerificationOtpResult> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user?.email) {
    return {error: "You are not logged in or do not have an email address."}
  }

  if (session.user.lastOtpSentAt) {
    const now = new Date()
    const secondSinceLastSent = (now.getTime() - session.user.lastOtpSentAt.getTime()) / 1000

    if (secondSinceLastSent < OTP_COOLDOWN_SECONDS) {
      return {retryIn: Math.ceil(OTP_COOLDOWN_SECONDS - secondSinceLastSent)}
    }
  }

  await auth.api.sendVerificationOTP({
    headers: await headers(),
    body: {
      email: session.user.email,
      type: "email-verification",
    }
  });

  return {retryIn: OTP_COOLDOWN_SECONDS}
}