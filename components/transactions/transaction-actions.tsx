"use client"

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
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
import {deleteTransaction, TransactionData, updateTransaction} from "@/app/actions/subscriptions";
import {Check, ChevronsUpDown, MoreVertical, Edit, Trash2} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {toast} from "sonner";
import {TransactionWithService} from "@/app/actions/subscriptions";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {currencyFormMap} from "@/db/data/currencies";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {Command} from "cmdk";
import {CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import * as React from "react";
import * as z from "zod";
import {currencyEnum, transactionTypeEnum} from "@/db/schema/_common";

export const updateTransactionSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  currency: z.enum(currencyEnum.enumValues as [string, ...string[]]),
  occurredAt: z.string().min(1, "Date is required"),
  type: z.enum(transactionTypeEnum.enumValues as [string, ...string[]]),
});

export type UpdateTransactionFormValues = z.infer<typeof updateTransactionSchema>;

interface TransactionActionsProps {
  transaction: TransactionWithService;
}

export function TransactionActions({transaction}: TransactionActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currencyComboboxOpen, setCurrencyComboboxOpen] = useState(false);

  // Function to handle delete dialog open state changes
  const handleDeleteDialogOpenChange = (open: boolean) => {
    setShowDeleteDialog(open);
  };

  // Initialize form with react-hook-form
  const form = useForm<UpdateTransactionFormValues>({
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {
      amount: transaction.amount,
      currency: transaction.currency,
      occurredAt: transaction.occurredAt.toISOString().split('T')[0],
      type: transaction.type,
    },
  });

  // Function to handle edit dialog open state changes
  const handleEditDialogOpenChange = (open: boolean) => {
    setShowEditDialog(open);
    // Reset form data when dialog is closed
    if (!open) {
      form.reset({
        amount: transaction.amount,
        currency: transaction.currency,
        occurredAt: transaction.occurredAt.toISOString().split('T')[0],
        type: transaction.type,
      });
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteTransaction(transaction.id);
      if (result === undefined) {
        toast.error("Failed to delete transaction");
        return;
      } else if ("success" in result) {
        toast.success(result.success);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete transaction");
      console.error(error);
    } finally {
      setIsLoading(false);
      handleDeleteDialogOpenChange(false);
    }
  };

  const onSubmit = async (values: UpdateTransactionFormValues) => {
    setIsLoading(true);
    try {
      const result = await updateTransaction(transaction.id, values as TransactionData);
      if (result === undefined) {
        toast.error("Failed to update transaction");
        return;
      }
      if ("success" in result) {
        toast.success(result.success);
        router.refresh();
        setShowEditDialog(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to update transaction");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4"/>
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4"/>
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={handleDeleteDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDeleteDialogOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update the details of this transaction.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="amount"
                render={({field}) => (
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
                      <FormMessage/>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({field}) => (
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
                            <ChevronsUpDown className="opacity-50"/>
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
                    <FormMessage/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occurredAt"
                render={({field}) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Date</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage/>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({field}) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Type</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type"/>
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
                      <FormMessage/>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={isLoading}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
