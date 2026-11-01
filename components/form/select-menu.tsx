import { ChevronDownIcon, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SelectMenuProps<T extends string> {
  label: string;
  icon?: LucideIcon;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** `sm` cao 32px, dùng cạnh các nút nhỏ như nút phân trang. */
  size?: "default" | "sm";
  /** Mép căn của menu so với nút, dùng `start` khi nút nằm sát lề trái. */
  align?: "start" | "end";
}

export function SelectMenu<T extends string>({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  size = "default",
  align = "end",
}: SelectMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          aria-label={label}
          className="px-3"
        >
          {Icon && <Icon className="size-4" />}
          {options.find((option) => option.value === value)?.label}
          <ChevronDownIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={size === "sm" ? "w-max min-w-20" : "w-max min-w-40"}
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as T)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
