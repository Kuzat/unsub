"use client"

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/client";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormSchema = z.infer<typeof formSchema>;

export function RequestResetForm({email, className, onRequestSent, ...props }: React.ComponentProps<"div"> & { onRequestSent?: (email: string) => void } & {email?: string}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email ?? ""
    }
  });

  const onSubmit = async (data: FormSchema) => {
    setIsSubmitting(true);
    try {
      // Request password reset OTP
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: "forget-password",
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success("Password reset code sent to your email!");
        if (onRequestSent) {
          onRequestSent(data.email);
        }
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error("Failed to request password reset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a code to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Code"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}