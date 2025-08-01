"use client"

import * as React from "react"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import * as z from "zod"
import {Button} from "@/components/ui/button"
import {Form, FormControl,FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Switch} from "@/components/ui/switch"
import {Textarea} from "@/components/ui/textarea"
import { PlusIcon, ArrowLeftIcon, ChevronsUpDown, Check} from "lucide-react"
import {cn, toIsoDate} from "@/lib/utils"
import {createSubscriptionSchema} from "@/lib/validation/subscription";
import {useRouter} from "next/navigation";
import {createSubscription} from "@/app/actions/subscriptions";
import {searchServices, Service} from "@/app/actions/services";
import {toast} from "sonner";
import {useState} from "react";
import {Command} from "cmdk";
import {CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {currencyFormMap} from "@/db/data/currencies";
import NewServiceForm from "@/components/services/new-service-form";
import ServiceLogo from "@/components/ui/service-logo";
import StartDatePicker from "@/components/ui/forms/start-date-picker";

type FormValues = z.infer<typeof createSubscriptionSchema>;
type Step = "selectService" | "subscriptionDetails";
type ServiceSelectionMode = "existing" | "custom";


export default function NewSubscriptionForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<Step>("selectService");
  const [serviceMode, setServiceMode] = React.useState<ServiceSelectionMode>("existing");
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = React.useState(false);
  const [priceInput, setPriceInput] = React.useState<string>('0');
  const [remindDaysInput, setRemindDaysInput] = React.useState<string>('3');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currencyComboboxOpen, setCurrencyComboboxOpen] = useState(false);

  // Load initial services
  React.useEffect(() => {
    const loadServices = async () => {
      setIsLoadingServices(true)
      try {
        const services = await searchServices("")
        setServices(services)
      } catch (error) {
        console.error("Failed to load services:", error)
      } finally {
        setIsLoadingServices(false)
      }
    }

    loadServices()
  }, [])

  // Handle service search
  const handleServiceSearch = async (query: string) => {
    setSearchQuery(query)
    setIsLoadingServices(true)
    try {
      const services = await searchServices(query)
      setServices(services)
    } catch (error) {
      console.error("Failed to search services:", error)
    } finally {
      setIsLoadingServices(false)
    }
  }

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      setServiceMode("existing");
      setCurrentStep("subscriptionDetails");
    }
  }

  function handleNewService(service: Service): void {
    setSelectedService(service);
    setServiceMode("existing");
    setCurrentStep("subscriptionDetails");
  }

  // Go back to service selection
  const handleBackToServiceSelection = () => {
    // Keep the search query when going back to service selection
    setCurrentStep("selectService");
    // We don't need to reset searchQuery as we want to remember it
  }


  const form = useForm({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      serviceId: "",
      alias: "",
      startDate: toIsoDate(new Date()),
      billingCycle: "monthly",
      price: 0,
      currency: "EUR",
      isActive: true,
      remindDaysBefore: 3,
      notes: "",
    },
  });

  // Update serviceId when selectedService changes
  React.useEffect(() => {
    if (selectedService) {
      form.setValue("serviceId", selectedService.id);
    }
  }, [selectedService, form]);

  const {
    handleSubmit,
    formState: {isSubmitting},
  } = form;

  async function onSubmit(values: FormValues) {
    const res = await createSubscription(values);

    if (res === undefined) {
      toast.error("An error occurred during subscription creation.");
    } else if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(res.success);
      router.push("/subscriptions");
    }
  }


  // Service selection step
  const renderServiceSelectionStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select a Service</h2>
          <div className="relative">
            <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
              <Input
                type="text"
                placeholder="Search for a service..."
                value={searchQuery}
                onChange={(e) => handleServiceSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                      <ServiceLogo
                        image={service.logoCdnUrl}
                        placeholder={service.name.charAt(0)}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{service.name}</p>
                          {service.scope === "global" ? (
                            <span
                              className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                              Global
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
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
        </div>

        <div className="mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={() => setServiceMode("custom")}
            className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg hover:bg-muted transition-colors"
          >
            <PlusIcon className="mr-2 h-5 w-5"/>
            <span>Add custom service</span>
          </button>
        </div>

        {serviceMode === "custom" && (
          <div className="mt-6 p-4 border rounded-lg">
            <NewServiceForm isAdmin={false} onNewService={handleNewService}/>
          </div>
        )}
      </div>
    );
  };

  // Render the form based on the current step
  if (currentStep === "selectService") {
    return renderServiceSelectionStep();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Service Information */}
        <div className="p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Service Information</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToServiceSelection}
              className="flex items-center text-sm"
            >
              <ArrowLeftIcon className="mr-1 h-4 w-4"/>
              Change
            </Button>
          </div>

          {selectedService && (
            <div className="flex items-center gap-3">
              <ServiceLogo
                image={selectedService.logoCdnUrl}
                placeholder={selectedService.name.charAt(0)}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{selectedService.name}</p>
                  {selectedService.scope === "global" ? (
                    <span
                      className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      Global
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{selectedService.category}</p>
              </div>
            </div>
          )}

          {/* Hidden service ID field */}
          <FormField
            control={form.control}
            name="serviceId"
            render={({field}) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input
                    type="hidden"
                    {...field}
                    value={selectedService?.id || ""}
                  />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>

        {/* Optional alias override */}
        <FormField
          control={form.control}
          name="alias"
          render={({field}) => (
            <FormItem>
              <FormLabel>Alias&nbsp;<span className="text-muted-foreground">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. 'Family Netflix'" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        {/* Start date picker */}
        <StartDatePicker label="Start Date"/>

        {/* Billing cycle */}
        <FormField
          control={form.control}
          name="billingCycle"
          render={({field}) => (
            <FormItem>
              <FormLabel>Billing Cycle</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose cycle"/>
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
              <FormMessage/>
            </FormItem>
          )}
        />

        {/* Currency + price */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="currency"
            render={({field}) => (
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
            name="price"
            render={({field}) => (
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
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>

        {/* Active toggle */}
        <FormField
          control={form.control}
          name="isActive"
          render={({field}) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 max-w-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange}/>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Reminder offset */}
        <FormField
          control={form.control}
          name="remindDaysBefore"
          render={({field}) => (
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
              <FormMessage/>
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({field}) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes here…"
                  {...field}
                />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Create Subscription"}
        </Button>
      </form>
    </Form>
  );
}
