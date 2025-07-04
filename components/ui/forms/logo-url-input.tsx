"use client"
import {useFormContext} from "react-hook-form";
import {CreateServiceFormValues} from "@/lib/validation/service";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import * as React from "react";
import {startTransition, useState} from "react";
import {fetchLogo} from "@/app/actions/logo";
import {toast} from "sonner";
import ServiceLogo from "@/components/ui/service-logo";


export default function LogoUrlInput({}) {
  const {control, setValue, getValues, watch} = useFormContext<CreateServiceFormValues>()
  const preview = watch("logoCdnUrl")
  const [fetching, setFetching] = useState<boolean>(false)

  async function handleBlur() {
    setFetching(true)

    const url = getValues("logoOriginalUrl")
    if (!url) {
      setValue("logoCdnUrl", undefined)
      setValue("logoHash", undefined)
      setFetching(false)
      return
    }

    startTransition(async () => {
      const res = await fetchLogo(url)
      if ("error" in res) {
        toast.error(`Could not fetch logo: ${res.error}`)
        setValue("logoCdnUrl", undefined)
        setValue("logoHash", undefined)
        setFetching(false)
        return
      }

      setValue("logoCdnUrl", res.logoCdnUrl)
      setValue("logoHash", res.logoHash)

      setFetching(false)
    });
  }

  return (
    <div className="flex flex-row gap-2  items-center">
      <ServiceLogo image={preview} fetching={fetching}/>
      <FormField
        control={control}
        name="logoOriginalUrl"
        render={({field}) => (
          <FormItem>
            <FormLabel>Logo URL (optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com/logo.png" {...field} onBlur={handleBlur} autoComplete="off"/>
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />
    </div>
  )
}