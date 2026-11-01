import { cn } from "@/lib/utils";

function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  const picked = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return picked
    .map((word) => [...word][0] ?? "")
    .join("")
    .toUpperCase();
}

interface UserAvatarProps {
  fullName: string;
  className?: string;
}

export function UserAvatar({ fullName, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-panel-muted text-[13px] leading-4 font-semibold text-brand-panel",
        className,
      )}
    >
      {initialsOf(fullName)}
    </span>
  );
}
