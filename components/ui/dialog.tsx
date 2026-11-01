"use client";

import * as React from "react";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";

const TOASTER_SELECTOR = "[data-sonner-toaster]";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

interface DialogContentProps extends Omit<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  "title"
> {
  title: string;
  description?: string;
}

function DialogContent({
  title,
  description,
  className,
  children,
  onInteractOutside,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-50 bg-foreground/40 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-120 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-background shadow-[0_24px_48px_rgba(15,23,41,0.25)] duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          className,
        )}
        {...(description ? {} : { "aria-describedby": undefined })}
        onInteractOutside={(event) => {
          // Toast báo lỗi của form nằm ngoài hộp thoại, bấm vào không được làm mất dữ liệu đang nhập.
          const target = event.detail.originalEvent.target;
          if (target instanceof Element && target.closest(TOASTER_SELECTOR))
            event.preventDefault();
          onInteractOutside?.(event);
        }}
        {...props}
      >
        <header className="flex items-start gap-3 px-6 pt-5">
          <div className="min-w-0 flex-1 space-y-2">
            <DialogPrimitive.Title className="text-lg leading-7 font-semibold">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Đóng"
              className="text-muted-foreground"
            >
              <XIcon className="size-4.5" />
            </Button>
          </DialogPrimitive.Close>
        </header>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("flex flex-col gap-4 px-6 pt-3 pb-5 empty:pt-0", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex justify-end gap-2 border-t border-muted px-6 pt-4 pb-5",
        className,
      )}
      {...props}
    />
  );
}

export { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter };
