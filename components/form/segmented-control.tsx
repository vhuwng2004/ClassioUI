import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SegmentedControlProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup
      type="single"
      spacing={0}
      aria-label={label}
      value={value ?? ""}
      onValueChange={(next) => onChange((next as T) || undefined)}
      className="h-10 w-fit! rounded-lg bg-segment p-0.75"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="h-8.5 rounded-md! px-3.5! text-secondary-text hover:bg-transparent hover:text-secondary-text data-[state=on]:bg-background data-[state=on]:text-foreground"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
