"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  combineDateAndTime,
  formatDateTimeForDatabase,
  formatDisplay,
  toDate,
  toTimeInputValue,
} from "@/lib/helper";
import { ChevronDown } from "lucide-react";

interface TaskDateButtonProps {
  icon: React.ReactNode;
  value?: string | null;
  onSelect: (isoTimestamp: string) => void;
  className?: string;
  valueClassName?: string;
  renderChevronAtEnd?: boolean;
  placeholder?: React.ReactNode;
}

export function TaskDateButton({
  icon,
  value,
  onSelect,
  className,
  valueClassName,
  renderChevronAtEnd = false,
  placeholder = false,
}: TaskDateButtonProps) {
  const initialDate = toDate(value);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    initialDate,
  );
  const [time, setTime] = React.useState<string>(toTimeInputValue(initialDate));
  const [open, setOpen] = React.useState(false);

  // Stay in sync if the item's value changes from elsewhere (e.g. websocket update)
  React.useEffect(() => {
    const d = toDate(value);
    setSelectedDate(d);
    setTime(toTimeInputValue(d));
  }, [value]);

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;

    const combined = combineDateAndTime(day, time);

    setSelectedDate(combined);
    onSelect(formatDateTimeForDatabase(combined));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;

    setTime(newTime);

    if (selectedDate) {
      const combined = combineDateAndTime(selectedDate, newTime);

      setSelectedDate(combined);
      onSelect(formatDateTimeForDatabase(combined));
    }
  };

  const stopCardNav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <span onClick={stopCardNav} className="inline-block w-full h-full">
        <PopoverTrigger className={`w-full`}>
          <Button
            variant="outline"
            type="button"
            className={`${className ?? "clickable block h-5 max-w-40 cursor-pointer truncate rounded bg-transparent outline-none hover:border-foreground hover:bg-muted"}`}
          >
            <div className="w-full h-full flex items-center justify-between">
              <div
                className={`flex h-full items-center gap-1.5 rounded text-xs ${valueClassName}`}
              >
                {icon}
                {selectedDate ? (
                  <span className="truncate">
                    {formatDisplay(selectedDate)}
                  </span>
                ) : (
                  placeholder
                )}
              </div>
              {!!renderChevronAtEnd && (
                <ChevronDown
                  className={`size-4 text-muted-foreground ${open ? "rotate-180" : ""}`}
                />
              )}
            </div>
          </Button>
        </PopoverTrigger>
      </span>

      <PopoverContent
        align="start"
        className="w-auto p-3"
        onClick={stopCardNav}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          className="p-0!"
        />
        <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2">
          <span className="text-xs text-muted-foreground">Time</span>
          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="h-8 w-28"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
