import type { ReactNode } from "react";

interface PageHeadingProps {
  title: string;
  action?: ReactNode;
}

export function PageHeading({ title, action }: PageHeadingProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-[-0.3px]">{title}</h1>
      {action}
    </header>
  );
}
