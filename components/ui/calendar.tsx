"use client";

import * as React from "react";
import {DayPicker, Dropdown as DropDownDayPicker} from "react-day-picker";

import {buttonVariants} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {ChevronLeft, ChevronRight} from "lucide-react";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  captionLabelClassName?: string;
  dayClassName?: string;
  dayButtonClassName?: string;
  dropdownsClassName?: string;
  footerClassName?: string;
  monthClassName?: string;
  monthCaptionClassName?: string;
  monthGridClassName?: string;
  monthsClassName?: string;
  weekClassName?: string;
  weekdayClassName?: string;
  weekdaysClassName?: string;
  rangeEndClassName?: string;
  rangeMiddleClassName?: string;
  rangeStartClassName?: string;
  selectedClassName?: string;
  disabledClassName?: string;
  hiddenClassName?: string;
  buttonNextClassName?: string;
  buttonPreviousClassName?: string;
  navClassName?: string;
  captionClassName?: string;
  outsideClassName?: string;
  todayClassName?: string;
  selectTriggerClassName?: string;
  renewalClassName?: string;
};

function Calendar({
                    className,
                    classNames,
                    hideNavigation,
                    showOutsideDays = true,
                    components: customComponents,
                    ...props
                  }: CalendarProps) {
  const _dropdownsClassName = cn(
    "flex items-center justify-center gap-2 w-full",
    hideNavigation ? "w-full" : "",
    props.dropdownsClassName
  );
  const _footerClassName = cn("pt-3 text-sm", props.footerClassName);
  const _monthsClassName = cn("relative flex", props.monthsClassName)
  const _monthCaptionClassName = cn(
    "relative mx-10 flex h-7 items-center justify-center",
    props.monthCaptionClassName
  )
  const _weekdaysClassName = cn("flex flex-row", props.weekdaysClassName)
  const _weekdayClassName = cn(
    "w-8 text-sm font-normal text-muted-foreground",
    props.weekdayClassName
  )
  const _monthClassName = cn("w-full", props.monthClassName)
  const _captionClassName = cn(
    "relative flex items-center justify-center pt-1",
    props.captionClassName
  )
  const _captionLabelClassName = cn(
    "truncate text-sm font-medium",
    props.captionLabelClassName
  )
  const buttonNavClassName = buttonVariants({
    variant: "outline",
    className:
      "absolute h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  })
  const _buttonNextClassName = cn(
    buttonNavClassName,
    "right-0",
    props.buttonNextClassName
  )
  const _buttonPreviousClassName = cn(
    buttonNavClassName,
    "left-0",
    props.buttonPreviousClassName
  )
  const _navClassName = cn("flex items-start", props.navClassName)
  const _monthGridClassName = cn("mx-auto mt-4", props.monthGridClassName)
  const _weekClassName = cn("mt-2 flex w-max items-start", props.weekClassName)
  const _dayClassName = cn(
    "flex size-8 flex-1 items-center justify-center p-0 text-sm",
    props.dayClassName
  )
  const _dayButtonClassName = cn(
    buttonVariants({ variant: "ghost" }),
    "size-8 rounded-md p-0 font-normal transition-none aria-selected:opacity-100",
    props.dayButtonClassName
  )
  const buttonRangeClassName =
    "bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground"
  const _rangeStartClassName = cn(
    buttonRangeClassName,
    "day-range-start rounded-s-md",
    props.rangeStartClassName
  )
  const _rangeEndClassName = cn(
    buttonRangeClassName,
    "day-range-end rounded-e-md",
    props.rangeEndClassName
  )
  const _rangeMiddleClassName = cn(
    "bg-accent !text-foreground [&>button]:bg-transparent [&>button]:!text-foreground [&>button]:hover:bg-transparent [&>button]:hover:!text-foreground",
    props.rangeMiddleClassName
  )
  const _selectedClassName = cn(
    "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
    props.selectedClassName
  )
  const _todayClassName = cn(
    "[&>button]:bg-accent [&>button]:text-accent-foreground",
    props.todayClassName
  )
  const _outsideClassName = cn(
    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    props.outsideClassName
  )
  const _disabledClassName = cn(
    "text-muted-foreground opacity-50",
    props.disabledClassName
  )
  const _hiddenClassName = cn("invisible flex-1", props.hiddenClassName)

  const Dropdown = React.useCallback(
    ({
       value,
       onChange,
       options,
     }: React.ComponentProps<typeof DropDownDayPicker>) => {
      const selected = options?.find((option) => option.value === value);
      const handleChange = (value: string) => {
        const changeEvent = {
          target: {value},
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange?.(changeEvent);
      };
      return (
        <Select
          value={value?.toString()}
          onValueChange={(value) => {
            handleChange(value);
          }}
        >
          <SelectTrigger className="outline-none focus:ring-0 focus:ring-offset-0">
            <SelectValue>{selected?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="center">
            <ScrollArea className="h-80">
              {options?.map(({value, label, disabled}, id) => (
                <SelectItem
                  key={`${value}-${id}`}
                  value={value?.toString()}
                  disabled={disabled}
                >
                  {label}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      );
    },
    []
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      hideNavigation={hideNavigation} // Use the hideNavigation prop from parent
      className={cn("p-3 w-full", className)}
      classNames={{
        caption_label: _captionLabelClassName,
        caption: _captionClassName,
        day: _dayClassName,
        day_button: _dayButtonClassName,
        dropdowns: _dropdownsClassName,
        footer: _footerClassName,
        month: _monthClassName,
        month_caption: _monthCaptionClassName,
        month_grid: _monthGridClassName,
        months: _monthsClassName,
        week: _weekClassName,
        weekday: _weekdayClassName,
        weekdays: _weekdaysClassName,
        range_end: _rangeEndClassName,
        range_middle: _rangeMiddleClassName,
        range_start: _rangeStartClassName,
        selected: _selectedClassName,
        button_next: _buttonNextClassName,
        button_previous: _buttonPreviousClassName,
        nav: _navClassName,
        disabled: _disabledClassName,
        hidden: _hiddenClassName,
        outside: _outsideClassName,
        today: _todayClassName,
        ...classNames,
      }}
      components={{
        Dropdown,
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
        },
        ...customComponents,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export {Calendar};
