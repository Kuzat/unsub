"use client"

import * as React from "react"
import {useFormContext} from "react-hook-form"
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"
import {CreateServiceFormValues} from "@/lib/validation/service"
import {categoryEnum, serviceScopeEnum} from "@/db/schema/_common"
import LogoUrlInput from "@/components/ui/forms/logo-url-input";

export type NewServiceFormProps = {
  isAdmin?: boolean;
}

export default function ServiceForm({isAdmin = false }: NewServiceFormProps) {
  const form = useFormContext<CreateServiceFormValues>()

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({field}) => (
          <FormItem>
            <FormLabel>Service Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter service name" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({field}) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category"/>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoryEnum.enumValues.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage/>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="url"
        render={({field}) => (
          <FormItem>
            <FormLabel>Website URL (optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({field}) => (
          <FormItem>
            <FormLabel>Description (optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter a description of the service" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />

      <LogoUrlInput/>

      {isAdmin && <AdminServiceOptions/>}


    </div>
  )
}

function AdminServiceOptions() {
  const {control} = useFormContext<CreateServiceFormValues>()

  return (
    <div className="space-y-6 border-2 p-4 rounded-xl border-primary">
      <h3 className="text-lg font-medium text-primary">Admin Options</h3>

      <FormField
        control={control}
        name="scope"
        render={({field}) => (
          <FormItem>
            <FormLabel>Scope</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Scope"/>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {serviceScopeEnum.enumValues.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {scope.charAt(0).toUpperCase() + scope.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage/>
          </FormItem>
        )}
      />
    </div>
  );
}