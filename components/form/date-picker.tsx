"use client";

import { format, parseISO, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { vi } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FIRST_MONTH = new Date(1900, 0);

interface DatePickerProps {
  id: string;
  /** Giá trị `yyyy-MM-dd` như API, chuỗi rỗng khi chưa chọn. */
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  invalid?: boolean;
}

/** Chọn ngày trong quá khứ, dùng cho ngày sinh. */
export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  invalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [today] = useState(() => new Date());
  const selected = value ? parseISO(value) : undefined;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) onBlur();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          data-empty={!selected}
          aria-invalid={invalid}
          className="w-full justify-start bg-transparent px-3 text-sm font-normal text-foreground hover:bg-transparent aria-expanded:bg-transparent aria-invalid:not-focus-visible:ring-0 data-[empty=true]:text-placeholder"
        >
          <CalendarIcon className="size-4.5 text-placeholder" />
          {selected ? format(selected, "dd/MM/yyyy") : "dd/mm/yyyy"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          required
          className="[--cell-size:--spacing(9)]"
          captionLayout="dropdown"
          reverseYears
          locale={vi}
          selected={selected}
          defaultMonth={selected}
          startMonth={FIRST_MONTH}
          endMonth={today}
          disabled={{ after: subDays(today, 1) }}
          onSelect={(date) => {
            onChange(format(date, "yyyy-MM-dd"));
            handleOpenChange(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
