"use client"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import Link from "next/link";
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {authClient} from "@/lib/client";
import {toast} from "sonner";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormSchema = z.infer<typeof formSchema>

export function LoginForm({className, ...props}: React.ComponentProps<"div">) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      }, {
        async onSuccess(context) {
          if (context.data.twoFactorRedirect) {
            // The twoFactorClient plugin will handle the redirect to /verify-2fa
            // This is configured in lib/client.ts
            return;
          }
        }
      })

      if (result.error) {
        toast.error(result.error.message)
      }
    } catch {
      toast.error("An error occurred during login.")
    }
  }

  const onGoogleLogin = async () => {
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      }, {
        async onSuccess(context) {
          if (context.data.twoFactorRedirect) {
            // The twoFactorClient plugin will handle the redirect to /verify-2fa
            // This is configured in lib/client.ts
            return;
          }
        }
      })

      if (result.error) {
        toast.error(result.error.message)
      }
    } catch {
      toast.error("An error occurred during login.")
    }
  }

  // TODO: Add Apple login

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            {/*<Button variant="outline" className="w-full">*/}
            {/*  <svg xmlns="http://www.w3.org/2000/svg" width="209" height="256"*/}
            {/*       viewBox="0 0 814 1000"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>*/}
            {/*  </svg>*/}

            {/*  Login with Apple*/}
            {/*</Button>*/}
            <Button variant="outline" className="w-full" onClick={onGoogleLogin}>
              <svg width="256" height="262" viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg"
                   preserveAspectRatio="xMidYMid">
                <path
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  fill="#4285F4"/>
                <path
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  fill="#34A853"/>
                <path
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                  fill="#FBBC05"/>
                <path
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  fill="#EB4335"/>
              </svg>

              Login with Google
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">

                <div
                  className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" prefetch={true} className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div
        className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <Link href="/terms-of-service">Terms of Service</Link>{" "}
        and <Link href="/privacy-policy">Privacy Policy</Link>.
      </div>
    </div>
  )
}
