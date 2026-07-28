"use client";

import { forwardRef } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/cn";

export const ToastProvider = ToastPrimitive.Provider;

export function ToastViewport() {
  return (
    <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none sm:bottom-4 sm:right-4" />
  );
}

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <XCircle className="h-5 w-5 text-danger" />,
  info: <Info className="h-5 w-5 text-accent" />,
};

interface ToastRootProps extends ToastPrimitive.ToastProps {
  variant?: keyof typeof ICONS;
  title: string;
  description?: string;
}

export const Toast = forwardRef<HTMLLIElement, ToastRootProps>(
  ({ className, variant = "info", title, description, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-4 shadow-lg",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    >
      {ICONS[variant]}
      <div className="flex-1">
        <ToastPrimitive.Title className="text-sm font-medium text-text-primary">
          {title}
        </ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="mt-1 text-sm text-text-secondary">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close className="text-text-muted hover:text-text-primary">
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  ),
);
Toast.displayName = "Toast";