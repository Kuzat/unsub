"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { convertCurrency, ConvertCurrencyData } from "@/app/actions/currency";
import { currencyFormMap } from "@/db/data/currencies";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {currencyEnum} from "@/db/schema/_common";
import {z} from "zod";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command} from "cmdk";
import {CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import * as React from "react";


// Define the schema for currency conversion
export const convertCurrencySchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  fromCurrency: z.enum(currencyEnum.enumValues as [string, ...string[]]),
  toCurrency: z.enum(currencyEnum.enumValues as [string, ...string[]]),
});

export function CurrencyConverterModule() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversionResult, setConversionResult] = useState<number | null>(null);
  const [fromCurrencyComboboxOpen, setFromCurrencyComboboxOpen] = useState(false);
  const [toCurrencyComboboxOpen, setToCurrencyComboboxOpen] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<ConvertCurrencyData>({
    resolver: zodResolver(convertCurrencySchema),
    defaultValues: {
      amount: 100,
      fromCurrency: "USD",
      toCurrency: "EUR",
    },
  });

  const onSubmit = async (data: ConvertCurrencyData) => {
    setIsLoading(true);
    setConversionResult(null);
    
    try {
      const result = await convertCurrency(data);
      
      if (result === undefined) {
        toast.error("Failed to convert currency");
      } else if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        if (result.result !== undefined) {
          setConversionResult(result.result);
        }
      }
    } catch (error) {
      toast.error("An error occurred during conversion");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
        <CardDescription>Convert between different currencies</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="fromCurrency"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center gap-4">
                    <FormLabel>To Currency</FormLabel>
                    <Popover open={fromCurrencyComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl onClick={() => setFromCurrencyComboboxOpen(!fromCurrencyComboboxOpen)}>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[200px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? currencyFormMap.find(
                                (currency) => currency.value === field.value
                              )?.value
                              : "Select Currency"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
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
                                    form.setValue("fromCurrency", currency.value)
                                    setFromCurrencyComboboxOpen(false)
                                  }}
                                >
                                  {currency.value}
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

              <FormField
                control={form.control}
                name="toCurrency"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center gap-4">
                    <FormLabel>To Currency</FormLabel>
                    <Popover open={toCurrencyComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl onClick={() => setToCurrencyComboboxOpen(!toCurrencyComboboxOpen)}>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[200px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? currencyFormMap.find(
                                (currency) => currency.value === field.value
                              )?.value
                              : "Select Currency"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
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
                                    form.setValue("toCurrency", currency.value)
                                    setToCurrencyComboboxOpen(false)
                                  }}
                                >
                                  {currency.value}
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
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Converting..." : "Convert"}
            </Button>
          </form>
        </Form>
        
        {conversionResult !== null && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="font-medium">Conversion Result:</p>
            <p className="text-2xl font-bold">
              {form.getValues().amount} {form.getValues().fromCurrency} = {conversionResult.toFixed(2)} {form.getValues().toCurrency}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}