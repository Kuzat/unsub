"use client"

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {authClient} from "@/lib/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {LogOut} from "lucide-react";
import {cn} from "@/lib/utils";
import {sendEmailVerificationOtp} from "@/app/actions/auth";

export function VerifyEmailForm({
                                  className,
                                  email,
                                  ...props
                                }: React.ComponentProps<"div"> & { email: string }) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setIsVerifying(true);
    try {
      // Verify the OTP
      authClient.emailOtp.verifyEmail({
        email: email,
        otp: otp,
      });

      toast.success("Email verified successfully!");
      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify email. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (countdown && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((current) => (current ? current - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      // Request a new OTP
      const result = await sendEmailVerificationOtp()

      if ("error" in result) {
        console.error("Error sending verification email:", result.error);
        toast.error("Failed to send verification email. Please try again.");
      } else if ("retryIn" in result) {
        setCountdown(result.retryIn);
        toast.success("Verification code sent to your email!");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
          <CardDescription>
            Please enter the verification code sent to {email}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-2 mb-4">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="Enter your verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isVerifying || !otp}
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={isResending || countdown !== null}
            >
              {isResending
                ? "Sending..."
                : countdown
                  ? `Resend in ${countdown}s`
                  : "Resend Verification Code"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4"/>
              Sign out
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}