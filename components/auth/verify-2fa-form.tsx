"use client";

import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {toast} from "sonner";
import {authClient} from "@/lib/client";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Loader2, Shield} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {useRouter} from "next/navigation";

// Schema for validating 2FA verification
const verifyTwoFactorSchema = z.object({
  code: z.string(),
});

// Type for the form values
type VerifyTwoFactorFormValues = z.infer<typeof verifyTwoFactorSchema>;

export function VerifyTwoFactorForm({className, ...props}: React.ComponentProps<"div">) {
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<VerifyTwoFactorFormValues>({
    resolver: zodResolver(verifyTwoFactorSchema),
    defaultValues: {
      code: "",
    },
  });

  // Handles verify form submission
  async function onSubmit(data: VerifyTwoFactorFormValues) {
    setIsVerifying(true);
    try {
      // First try to verify as TOTP code
      const totpResult = await authClient.twoFactor.verifyTotp({
        code: data.code,
      });

      if (!totpResult.error) {
        toast.success("Two-factor authentication verified successfully!");
        router.push("/dashboard");
        return;
      }

      // If TOTP verification fails, try as backup code
      const backupResult = await authClient.twoFactor.verifyBackupCode({
        code: data.code,
      });

      if (backupResult.error) {
        toast.error("Invalid verification code. Please try again.");
        return;
      }

      toast.success("Backup code verified successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      toast.error("Failed to verify authentication code");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Shield className="h-5 w-5"/>
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Enter the verification code from your authenticator app or a backup code to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the 6-digit code"
                        {...field}
                        autoComplete="one-time-code"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the 6-digit code from your authenticator app or use one of your backup codes.
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
