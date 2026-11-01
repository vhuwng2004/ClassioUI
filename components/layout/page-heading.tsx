import type { ReactNode } from "react";

interface PageHeadingProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeading({ title, description, action }: PageHeadingProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-[-0.3px]">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
