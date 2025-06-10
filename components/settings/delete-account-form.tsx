"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { initiateDeleteAccount } from "@/app/actions/user-settings";
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
});

// Type for the delete account input
type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export function DeleteAccountForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmation: undefined,
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