"use client"
import {useFormContext} from "react-hook-form";
import {CreateServiceFormValues} from "@/lib/validation/service";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import * as React from "react";
import {startTransition, useState} from "react";
import {fetchLogo} from "@/app/actions/logo";
import {toast} from "sonner";
import Image from "next/image";
import {Skeleton} from "@/components/ui/skeleton";


export default function LogoUrlInput({}) {
  const {control, setValue, getValues} = useFormContext<CreateServiceFormValues>()
  const [preview, setPreview] = useState<string | null>(null)
  const [fetching, setFetching] = useState<boolean>(false)

  async function handleBlur() {
    setFetching(true)

    const url = getValues("logoOriginalUrl")
    if (!url) {
      setPreview(null)
      setFetching(false)
      return
    }

    startTransition(async () => {
      const res = await fetchLogo(url)
      if (res.error) {
        toast.error(`Could not fetch logo: ${res.error}`)
      }

      setValue("logoCdnUrl", res.logo_cdn_url)
      setValue("logoHash", res.logo_hash)

      setPreview(res.logo_cdn_url ?? null)
      setFetching(false)
    });
  }

  return (
    <div className="flex flex-row gap-2  items-center">
      {preview && !fetching ? (
        <div className="h-16 w-16 rounded overflow-hidden">
          <Image src={preview} alt="Logo preview" width={256} height={256}/>
        </div>
      ) : fetching ? (
        <Skeleton className="h-16 w-16 bg-muted rounded flex items-center justify-center">
        </Skeleton>
      ) : (
        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
          <span className="text-sm font-bold">?</span>
        </div>
      )}
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