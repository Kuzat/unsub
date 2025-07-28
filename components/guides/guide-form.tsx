"use client"

import * as React from "react"
import {useFormContext} from "react-hook-form"
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Textarea} from "@/components/ui/textarea"
import {CreateGuideFormValues} from "@/lib/validation/guide"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {guideVersionStatusEnum} from "@/db/schema/_common"
import ImageUpload from "@/components/guides/image-upload"

export type GuideFormProps = {
  serviceId: string
  isAdmin?: boolean
}

export default function GuideForm({serviceId, isAdmin = false}: GuideFormProps) {
  const form = useFormContext<CreateGuideFormValues>()
  
  const handleImageInsert = (markdown: string) => {
    const currentContent = form.getValues("bodyMd")
    const newContent = currentContent + "\n\n" + markdown
    form.setValue("bodyMd", newContent)
  }

  // Set the serviceId in the form
  React.useEffect(() => {
    form.setValue("serviceId", serviceId)
  }, [form, serviceId])

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="bodyMd"
        render={({field}) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Guide Content (Markdown)</FormLabel>
              <ImageUpload 
                onImageInsert={handleImageInsert}
                serviceId={serviceId}
              />
            </div>
            <FormControl>
              <Textarea
                placeholder="Write your guide content in Markdown format..."
                className="min-h-[300px] font-mono"
                {...field}
              />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="changeNote"
        render={({field}) => (
          <FormItem>
            <FormLabel>Change Note (optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Brief description of this guide or update"
                {...field}
              />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />

      {isAdmin && (
        <div className="space-y-6 border-2 p-4 rounded-xl border-primary">
          <h3 className="text-lg font-medium text-primary">Admin Options</h3>
          <FormField
            control={form.control}
            name="status"
            render={({field}) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {guideVersionStatusEnum.enumValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
