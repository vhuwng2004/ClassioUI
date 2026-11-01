import { SearchIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { IconInput } from "@/components/form/icon-input";

interface SearchInputProps extends Omit<
  ComponentProps<typeof IconInput>,
  "icon" | "type"
> {
  label: string;
}

export function SearchInput({ label, ...props }: SearchInputProps) {
  return (
    <div className="w-full sm:w-85">
      <IconInput
        icon={SearchIcon}
        type="search"
        aria-label={label}
        placeholder={`${label}…`}
        {...props}
      />
    </div>
  );
}
