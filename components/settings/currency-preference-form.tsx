"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { updatePreferredCurrency } from "@/app/actions/user-settings"
import { Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { currencyFormMap } from "@/db/data/currencies"

// Schema for validating preferred currency input
const formSchema = z.object({
  preferredCurrency: z.string().min(1, "Preferred currency is required"),
})

type FormSchema = z.infer<typeof formSchema>

interface CurrencyPreferenceFormProps {
  initialCurrency: string
}

export function CurrencyPreferenceForm({ initialCurrency }: CurrencyPreferenceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currencyComboboxOpen, setCurrencyComboboxOpen] = useState(false)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredCurrency: initialCurrency,
    },
  })

  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true)
    try {
      const result = await updatePreferredCurrency(data)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("An error occurred while updating your preferred currency")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Preferred Currency</h3>
        <p className="text-sm text-muted-foreground">
          Set your preferred currency for displaying amounts across the application.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="preferredCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Popover open={currencyComboboxOpen} onOpenChange={setCurrencyComboboxOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? currencyFormMap.find(
                              (currency) => currency.value === field.value
                            )?.value
                          : "Select Currency"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search currency..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                          {currencyFormMap.map((currency) => (
                            <CommandItem
                              value={currency.value}
                              key={currency.value}
                              onSelect={() => {
                                form.setValue("preferredCurrency", currency.value)
                                setCurrencyComboboxOpen(false)
                              }}
                            >
                              {currency.value} - {currency.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  currency.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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