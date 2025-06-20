"use client";

import {useState, useEffect} from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Loader2, Shield, QrCode} from "lucide-react";
import QRCode from "qrcode";
import Link from "next/link";
import Image from "next/image";

// Schema for validating 2FA setup
const enableTwoFactorSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const verifyTotpSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters").max(6, "Code must be at most 6 characters"),
});

// Schema for disabling 2FA
const disableTwoFactorSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// Type for the form values
type EnableTwoFactorFormValues = z.infer<typeof enableTwoFactorSchema>;
type VerifyTotpFormValues = z.infer<typeof verifyTotpSchema>;
type DisableTwoFactorFormValues = z.infer<typeof disableTwoFactorSchema>;

export function TwoFactorForm({onCompleted}: { onCompleted: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{ totpURI: string; backupCodes: string[] } | null>(null);
  const [step, setStep] = useState<"enable" | "verify">("enable");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const {data: session, isPending, refetch} = authClient.useSession();

  // Generate QR code when twoFactorData changes
  useEffect(() => {
    if (twoFactorData?.totpURI) {
      QRCode.toDataURL(twoFactorData.totpURI, {width: 200})
        .then(url => {
          setQrCodeDataUrl(url);
        })
        .catch(err => {
          console.error("Error generating QR code:", err);
          toast.error("Failed to generate QR code");
        });
    }
  }, [twoFactorData]);

  // Initialize form with react-hook-form and zod validation
  const enableForm = useForm<EnableTwoFactorFormValues>({
    resolver: zodResolver(enableTwoFactorSchema),
    defaultValues: {
      password: "",
    },
  });

  const verifyForm = useForm<VerifyTotpFormValues>({
    resolver: zodResolver(verifyTotpSchema),
    defaultValues: {
      code: "",
    },
  });

  const disableForm = useForm<DisableTwoFactorFormValues>({
    resolver: zodResolver(disableTwoFactorSchema),
    defaultValues: {
      password: "",
    },
  });

  // Handles enable form submission
  async function onEnableSubmit(data: EnableTwoFactorFormValues) {
    setIsEnabling(true);
    try {
      const result = await authClient.twoFactor.enable({
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      setTwoFactorData(result.data);
      setStep("verify");
      toast.success("Two-factor authentication setup initiated. Please scan the QR code with your authenticator app.");
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast.error("Failed to enable two-factor authentication");
    } finally {
      setIsEnabling(false);
    }
  }

  // Handles verify form submission
  async function onVerifySubmit(data: VerifyTotpFormValues) {
    setIsVerifying(true);
    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: data.code,
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Two-factor authentication enabled successfully!");
      setIsOpen(false);
      setStep("enable");
      setTwoFactorData(null);
      enableForm.reset();
      verifyForm.reset();

      onCompleted();
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      toast.error("Failed to verify two-factor authentication code");
    } finally {
      setIsVerifying(false);
    }
  }

  // Handles disable form submission
  async function onDisableSubmit(data: DisableTwoFactorFormValues) {
    setIsDisabling(true);
    try {
      const result = await authClient.twoFactor.disable({
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Two-factor authentication disabled successfully!");
      setIsDisableDialogOpen(false);
      disableForm.reset();

      // Refresh the session to update the twoFactorEnabled status
      refetch();
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast.error("Failed to disable two-factor authentication");
    } finally {
      setIsDisabling(false);
    }
  }

  // Reset the form and state when the dialog is closed
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setStep("enable");
      setTwoFactorData(null);
      enableForm.reset();
      verifyForm.reset();
    }
  };

  // Reset the disable form when the disable dialog is closed
  const handleDisableDialogChange = (open: boolean) => {
    setIsDisableDialogOpen(open);
    if (!open) {
      disableForm.reset();
    }
  };

  const isTwoFactorEnabled = session?.user.twoFactorEnabled;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          {isPending ? (
            "Loading..."
          ) : (
            isTwoFactorEnabled
              ? "Your account is protected with two-factor authentication."
              : "Add an extra layer of security to your account by enabling two-factor authentication."
          )}
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          {isPending ? (
            <Button variant="default" className="flex items-center gap-2" disabled>
              <Loader2 className="h-4 w-4 animate-spin"/>
              Loading...
            </Button>
          ) : !isTwoFactorEnabled ? (
            <Button
              variant="default"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4"/>
              Enable Two-Factor Authentication
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setIsDisableDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4"/>
              Disable Two-Factor Authentication
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5"/>
              {step === "enable" ? "Enable Two-Factor Authentication" : "Verify Two-Factor Authentication"}
            </DialogTitle>
            <DialogDescription>
              {step === "enable"
                ? "Add an extra layer of security to your account by enabling two-factor authentication."
                : "Scan the QR code with your authenticator app and enter the verification code."}
            </DialogDescription>
          </DialogHeader>

          {step === "enable" ? (
            <Form {...enableForm}>
              <form onSubmit={enableForm.handleSubmit(onEnableSubmit)} className="space-y-4">
                <FormField
                  control={enableForm.control}
                  name="password"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormDescription>
                        Please enter your password to enable two-factor authentication.
                        If you do not have a password or have forgot it then you can
                        <Link href="/reset-password" className="underline text-primary ml-1">
                          reset password
                        </Link>.
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isEnabling}
                  >
                    {isEnabling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Enabling...
                      </>
                    ) : (
                      "Enable"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              {twoFactorData && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-2 rounded-md relative">
                    {qrCodeDataUrl ? (
                      <Image
                        src={qrCodeDataUrl}
                        alt="QR Code for 2FA"
                        className="h-48 w-48"
                        width={200}
                        height={200}
                      />
                    ) : (
                      <Loader2 className="h-8 w-8 animate-spin"/>
                    )}
                  </div>

                  <div className="w-full">
                    <h4 className="font-medium mb-2">Backup Codes</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Save these backup codes in a secure place. You can use them to access your account if you lose
                      your authenticator device.
                    </p>
                    <div className="bg-muted p-2 rounded-md text-sm font-mono">
                      {twoFactorData.backupCodes.map((code, index) => (
                        <div key={index} className="mb-1">{code}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Form {...verifyForm}>
                <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
                  <FormField
                    control={verifyForm.control}
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
                          Enter the 6-digit code from your authenticator app.
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
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
                  </DialogFooter>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for disabling 2FA */}
      <Dialog open={isDisableDialogOpen} onOpenChange={handleDisableDialogChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5"/>
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              This will remove the extra layer of security from your account. You&apos;ll need to enter your password to
              confirm.
            </DialogDescription>
          </DialogHeader>

          <Form {...disableForm}>
            <form onSubmit={disableForm.handleSubmit(onDisableSubmit)} className="space-y-4">
              <FormField
                control={disableForm.control}
                name="password"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormDescription>
                      Please enter your password to disable two-factor authentication.
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDisableDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDisabling}
                >
                  {isDisabling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      Disabling...
                    </>
                  ) : (
                    "Disable"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
