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
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {createTransaction, TransactionData} from "@/app/actions/subscriptions";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {transaction} from "@/db/schema/app";

interface AddTransactionProps {
  subscriptionId: string;
  subscriptionCurrency: typeof transaction.currency.enumValues[number];
}

export function AddTransaction({ subscriptionId, subscriptionCurrency }: AddTransactionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    currency: subscriptionCurrency,
    occurredAt: new Date().toISOString().split('T')[0],
    type: "initial",
  } as TransactionData)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await createTransaction(subscriptionId, formData);
      if (result === undefined) {
        toast.error("Failed to create transaction");
        return;
      }else if ("success" in result) {
        toast.success(result.success);
        router.refresh();
        setIsOpen(false);
        // Reset form
        setFormData({
          amount: "",
          currency: subscriptionCurrency,
          occurredAt: new Date().toISOString().split('T')[0],
          type: "hypothetical_initial",
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currency" className="text-right">
              Currency
            </Label>
            <Select 
              value={formData.currency} 
              onValueChange={(value) => handleSelectChange("currency", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="occurredAt" className="text-right">
              Date
            </Label>
            <Input
              id="occurredAt"
              name="occurredAt"
              type="date"
              value={formData.occurredAt}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger className="col-span-3">
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
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}