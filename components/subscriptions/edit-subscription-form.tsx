"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeftIcon, CalendarIcon } from "lucide-react"
import {CreateSubscriptionSchema, createSubscriptionSchema} from "@/lib/validation/subscription"
import { useRouter } from "next/navigation"
import { updateSubscription, EditSubscription } from "@/app/actions/subscriptions"
import { toast } from "sonner"
import Link from "next/link"
import { cn, formatDate } from "@/lib/utils"
import Image from "next/image"

interface EditSubscriptionFormProps {
  subscription: EditSubscription;
  from?: string; // "view" if coming from subscription view, "list" if coming from subscriptions list
}

export default function EditSubscriptionForm({ subscription, from = "list" }: EditSubscriptionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [dateOpen, setDateOpen] = React.useState(false)
  const [priceInput, setPriceInput] = React.useState(subscription.price)
  const [remindDaysInput, setRemindDaysInput] = React.useState(subscription.remindDaysBefore)

  // Create a form with subscription data as default values
  const form = useForm({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      serviceId: subscription.serviceId ? subscription.serviceId : undefined,
      alias: subscription.alias || "",
      startDate: new Date(subscription.startDate),
      billingCycle: subscription.billingCycle,
      price: parseFloat(subscription.price),
      currency: subscription.currency,
      isActive: subscription.isActive,
      remindDaysBefore: parseInt(subscription.remindDaysBefore),
      notes: subscription.notes || "",
    },
  })

  // Handle form submission
  const onSubmit = async (values: CreateSubscriptionSchema) => {
    setIsSubmitting(true)
    try {
      const result = await updateSubscription(subscription.id, values)

      if (result === undefined) {
        toast.error("An error occurred during subscription update.")
        return
      } else if ("error" in result) {
        toast.error(result.error)
        return
      }

      toast.success("Subscription updated successfully")
      // Redirect based on where the user came from
      if (from === "view") {
        router.push(`/subscriptions/${subscription.id}`)
      } else {
        router.push("/subscriptions")
      }
    } catch (error) {
      console.error("Failed to update subscription:", error)
      toast.error("Failed to update subscription")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href={from === "view" ? `/subscriptions/${subscription.id}` : "/subscriptions"}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          {from === "view" ? "Back to Subscription" : "Back to Subscriptions"}
        </Link>
      </Button>

      {/* Service Information */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-4">Service Information</h3>
        <div className="flex items-center gap-3">
          {subscription.serviceLogoUrl ? (
            <div className="h-12 w-12 rounded overflow-hidden">
              <Image 
                src={subscription.serviceLogoUrl} 
                alt={subscription.serviceName} 
                width={48} 
                height={48} 
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
              <span className="text-xl font-bold">{subscription.serviceName.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-medium">{subscription.serviceName}</p>
            <p className="text-sm text-muted-foreground">{subscription.serviceCategory}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Hidden service ID field */}
          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input 
                    type="hidden" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Optional alias override */}
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias&nbsp;<span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 'Family Netflix'" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start date picker */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? formatDate(field.value.toISOString()) : "Pick a date"}
                        <CalendarIcon className="ml-auto size-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Billing cycle */}
          <FormField
            control={form.control}
            name="billingCycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Cycle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="one_time">One-time</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency + price */}
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="NOK">NOK</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="9.99"
                      value={priceInput}
                      onChange={(e) => {
                        setPriceInput(e.target.value);
                        field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber);
                      }}
                      onBlur={() => {
                        if (priceInput === '') {
                          setPriceInput('0');
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Active toggle */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 max-w-xs">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Reminder offset */}
          <FormField
            control={form.control}
            name="remindDaysBefore"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Remind me (days before)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={365}
                    value={remindDaysInput}
                    onChange={(e) => {
                      setRemindDaysInput(e.target.value);
                      field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber);
                    }}
                    onBlur={() => {
                      if (remindDaysInput === '') {
                        setRemindDaysInput('0');
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional notes here…"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Subscription"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
