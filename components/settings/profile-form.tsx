"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateDisplayName } from "@/app/actions/user-settings"

// Schema for validating display name input
const formSchema = z.object({
  name: z.string().min(1, "Display name is required").max(100, "Display name must be less than 100 characters"),
})

type FormSchema = z.infer<typeof formSchema>

interface ProfileFormProps {
  initialName: string
}

export function ProfileForm({ initialName }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialName,
    },
  })

  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true)
    try {
      const result = await updateDisplayName(data)

      if (result.success) {
        toast.success(result.message)

        // Refresh the page to ensure all components using the session are updated
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("An error occurred while updating your display name")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Display Name</h3>
        <p className="text-sm text-muted-foreground">
          Update your display name that will be shown across the application.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your display name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
