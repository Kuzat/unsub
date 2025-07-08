"use client"
import {useFormContext} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {cn, toIsoDate} from "@/lib/utils";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import * as React from "react";
import {CreateSubscriptionSchema} from "@/lib/validation/subscription";

type DatePickerProps = {
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function StartDatePicker({label, description}: DatePickerProps) {
  const {control} = useFormContext<CreateSubscriptionSchema>()
  const [dateOpen, setDateOpen] = React.useState(false)

  return (
    <FormField
      control={control}
      name="startDate"
      render={({field}) => {
        const fieldDate = new Date(field.value);
        return (
          <FormItem className="flex flex-col w-full">
            <FormLabel>{label || "Date"}</FormLabel>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      `${format(field.value, "PPP")}`
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={fieldDate}
                  onSelect={(selectedDate) => {
                    field.onChange(toIsoDate(selectedDate || fieldDate));
                  }}
                  hideNavigation={true}
                  onDayClick={() => setDateOpen(false)}
                  defaultMonth={fieldDate}
                />
              </PopoverContent>
            </Popover>
            <FormDescription>{description || "Set your start date."}</FormDescription>
            <FormMessage/>
          </FormItem>
        )
      }}
    />
  )
}