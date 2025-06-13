"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { initiateDeleteAccount, checkCurrentUserSocialLogin } from "@/app/actions/user-settings";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

// Schema for validating delete account input
const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE", {
    invalid_type_error: "Please type DELETE to confirm account deletion",
    required_error: "Confirmation is required",
  }),
  password: z.string().optional(),
});

// Type for the delete account input
type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export function DeleteAccountForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLogin, setIsSocialLogin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is using social login when the component mounts
  useEffect(() => {
    async function checkLoginType() {
      try {
        const result = await checkCurrentUserSocialLogin();
        if (result.success) {
          setIsSocialLogin(result.isSocialLogin);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error checking login type:", error);
        toast.error("Failed to determine your login type");
      } finally {
        setIsLoading(false);
      }
    }

    checkLoginType();
  }, []);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmation: undefined,
      password: "",
    },
  });

  // Handle form submission
  async function onSubmit(data: DeleteAccountFormValues) {
    setIsSubmitting(true);
    try {
      const result = await initiateDeleteAccount(data);

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while trying to delete your account");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading indicator while checking login type
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Delete Account</h3>
          <p className="text-sm text-muted-foreground">
            Loading account information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Delete Account</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all of your data.
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all of your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type DELETE to confirm"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      Please type DELETE in all caps to confirm.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Only show password field for non-social login users */}
              {isSocialLogin === false && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
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
                        Please enter your password to confirm account deletion.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete Account"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
