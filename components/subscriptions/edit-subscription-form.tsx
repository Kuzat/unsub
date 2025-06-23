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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {ArrowLeftIcon, CalendarIcon, Check, ChevronsUpDown} from "lucide-react"
import {CreateSubscriptionSchema, createSubscriptionSchema} from "@/lib/validation/subscription"
import { useRouter } from "next/navigation"
import { updateSubscription, EditSubscription } from "@/app/actions/subscriptions"
import { searchServices, Service } from "@/app/actions/services"
import { toast } from "sonner"
import Link from "next/link"
import { cn, formatDate } from "@/lib/utils"
import Image from "next/image"
import {currencyFormMap} from "@/db/data/currencies";
import {Command} from "cmdk";
import {CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";

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
  const [serviceDialogOpen, setServiceDialogOpen] = React.useState(false)
  const [services, setServices] = React.useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [selectedService, setSelectedService] = React.useState<Service | null>(null)
  const [currencyComboboxOpen, setCurrencyComboboxOpen] = React.useState(false)

  // Load services when dialog opens
  const loadServices = React.useCallback(async (query: string = '') => {
    setIsLoadingServices(true)
    try {
      const services = await searchServices(query)
      setServices(services)
    } catch (error) {
      console.error("Failed to load services:", error)
      toast.error("Failed to load services")
    } finally {
      setIsLoadingServices(false)
    }
  }, [])

  // Handle service search
  const handleServiceSearch = async (query: string) => {
    setSearchQuery(query)
    await loadServices(query)
  }

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setSelectedService(service)
      form.setValue("serviceId", service.id)
      setServiceDialogOpen(false)
      toast.success(`Service changed to ${service.name}`)
    }
  }

  // Open service dialog
  const handleOpenServiceDialog = () => {
    setServiceDialogOpen(true)
    loadServices()
  }

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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Service Information</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenServiceDialog}
            className="flex items-center text-sm"
          >
            Change Service
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {(selectedService?.logoUrl || subscription.serviceLogoUrl) ? (
            <div className="h-12 w-12 rounded overflow-hidden">
              <Image 
                src={selectedService?.logoUrl || subscription.serviceLogoUrl || ''} 
                alt={selectedService?.name || subscription.serviceName} 
                width={48} 
                height={48} 
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
              <span className="text-xl font-bold">{(selectedService?.name || subscription.serviceName).charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-medium">{selectedService?.name || subscription.serviceName}</p>
            <p className="text-sm text-muted-foreground">{selectedService?.category || subscription.serviceCategory}</p>
          </div>
        </div>
      </div>

      {/* Service Selection Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for a service..."
                value={searchQuery}
                onChange={(e) => handleServiceSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Service list */}
            <div className="mt-2 max-h-[300px] overflow-y-auto rounded-md border">
              {isLoadingServices ? (
                <div className="py-6 text-center text-sm">Loading...</div>
              ) : services.length === 0 ? (
                <div className="py-6 text-center text-sm">No services found</div>
              ) : (
                <div className="space-y-1 p-1">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
                      onClick={() => handleServiceSelect(service.id)}
                    >
                      {service.logoUrl ? (
                        <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={service.logoUrl}
                            alt={service.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold">{service.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{service.name}</p>
                          {service.scope === "global" ? (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                              Global
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{service.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                        field.onChange(date || field.value);
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
                <FormItem className="flex flex-col">
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
