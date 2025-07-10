"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { CreateGuideFormValues } from "@/lib/validation/guide"
import { Input } from "@/components/ui/input"

export type GuideFormProps = {
  serviceId: string
}

export default function GuideForm({ serviceId }: GuideFormProps) {
  const form = useFormContext<CreateGuideFormValues>()

  // Set the serviceId in the form
  React.useEffect(() => {
    form.setValue("serviceId", serviceId)
  }, [form, serviceId])

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="bodyMd"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Guide Content (Markdown)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Write your guide content in Markdown format..." 
                className="min-h-[300px] font-mono"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="changeNote"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Change Note (optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Brief description of this guide or update" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}