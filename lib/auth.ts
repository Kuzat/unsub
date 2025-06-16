import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@/db";
import {nextCookies} from "better-auth/next-js";
import * as schema from "@/db/schema/auth"
import {admin, emailOTP} from "better-auth/plugins";
import {emailOTPClient} from "better-auth/client/plugins";
import {sendVerificationEmail, sendDeleteAccountEmail} from "@/lib/email";
import { headers } from "next/headers";
import {redirect} from "next/navigation";


export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },
  user: {
    additionalFields: {
      lastOtpSentAt: {
        type: "date",
        required: false,
        default: null,
        input: false,
      }
    },
    deleteUser: {
      enabled: true,
      async sendDeleteAccountVerification({ user, url }) {
        await sendDeleteAccountEmail(user.email, url);
      }
    }
  },
  plugins: [
    admin(),
    emailOTP({
      sendVerificationOnSignUp: true,
      disableSignUp: true,
      async sendVerificationOTP({email, otp, type}) {
        if (type === "email-verification") {
          await sendVerificationEmail(email, otp)
        }
      }
    }),
    emailOTPClient(),
    nextCookies() // Needs to be the last plugin in the array
  ]
});


export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) {
    redirect("/login")
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!session) {
    redirect("/login")
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return session;
}