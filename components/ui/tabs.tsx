"use client";

import * as React from "react";
import { cn } from "cn";
import { Tabs as TabsPrimitive } from "radix-ui";

function Tabs(props: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex gap-7 overflow-x-auto border-b", className)}
      {...props}
    />
  );
}

interface TabsTriggerProps extends React.ComponentProps<
  typeof TabsPrimitive.Trigger
> {
  count?: number;
}

function TabsTrigger({
  count,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group flex items-center gap-2 border-b-2 border-transparent py-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none focus-visible:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold text-secondary-text group-data-[state=active]:bg-brand-panel-muted group-data-[state=active]:text-brand-panel">
          {count}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("space-y-5 pt-5 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
