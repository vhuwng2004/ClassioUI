import type { LucideIcon } from "lucide-react";

interface AuthHeadingProps {
  icon?: LucideIcon;
  title: string;
}

export function AuthHeading({ icon: Icon, title }: AuthHeadingProps) {
  return (
    <header className="mb-5">
      {Icon && (
        <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-info text-primary">
          <Icon className="size-6" />
        </span>
      )}
      <h1 className="text-2xl font-bold tracking-[-0.3px]">{title}</h1>
    </header>
  );
}
