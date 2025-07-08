"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {createTransaction, TransactionData} from "@/app/actions/subscriptions";
import {Check, ChevronsUpDown, Plus} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {transaction} from "@/db/schema/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { currencyFormMap } from "@/db/data/currencies";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn, toIsoDate} from "@/lib/utils";
import {Command} from "cmdk";
import {CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import * as React from "react";
import * as z from "zod";
import {currencyEnum, transactionTypeEnum} from "@/db/schema/_common";

interface AddTransactionProps {
  subscriptionId: string;
  subscriptionCurrency: typeof transaction.currency.enumValues[number];
}

export const createTransactionSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  currency: z.enum(currencyEnum.enumValues as [string, ...string[]]),
  occurredAt: z.string().min(1, "Date is required"),
  type: z.enum(transactionTypeEnum.enumValues as [string, ...string[]]),
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;

export function AddTransaction({ subscriptionId, subscriptionCurrency }: AddTransactionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currencyComboboxOpen, setCurrencyComboboxOpen] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: "",
      currency: subscriptionCurrency,
      occurredAt: toIsoDate(new Date()),
      type: "initial",
    },
  });

  // Reset form when dialog closes
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset({
        amount: "",
        currency: subscriptionCurrency,
        occurredAt: toIsoDate(new Date()),
        type: "initial",
      });
    }
  };

  const onSubmit = async (values: CreateTransactionFormValues) => {
    setIsLoading(true);
    try {
      const result = await createTransaction(subscriptionId, values as TransactionData);
      if (result === undefined) {
        toast.error("Failed to create transaction");
        return;
      } else if ("success" in result) {
        toast.success(result.success);
        router.refresh();
        setIsOpen(false);
        form.reset({
          amount: "",
          currency: subscriptionCurrency,
          occurredAt: toIsoDate(new Date()),
          type: "initial",
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to create transaction");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog modal={false} open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction for this subscription.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Amount</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel>Currency</FormLabel>
                  <Popover open={currencyComboboxOpen}>
                    <PopoverTrigger asChild>
                      <FormControl onClick={() => setCurrencyComboboxOpen(!currencyComboboxOpen)}>
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
                                  form.setValue("currency", currency.value)
                                  setCurrencyComboboxOpen(false)
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
              name="occurredAt"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Date</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Type</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="initial">Initial</SelectItem>
                          <SelectItem value="renewal">Renewal</SelectItem>
                          <SelectItem value="refund">Refund</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                          <SelectItem value="hypothetical_initial">Hypothetical Initial</SelectItem>
                          <SelectItem value="hypothetical_renewal">Hypothetical Renewal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
