"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/cn";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;

type DropdownMenuSeparatorProps = ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>;

export const DropdownMenuSeparator = forwardRef<ElementRef<typeof DropdownPrimitive.Separator>, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <DropdownPrimitive.Separator ref={ref} className={cn("my-1 h-px bg-border-subtle", className)} {...props} />
  ),
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

type DropdownMenuContentProps = ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>;

export const DropdownMenuContent = forwardRef<ElementRef<typeof DropdownPrimitive.Content>, DropdownMenuContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-surface-2 p-1 shadow-lg",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  ),
);
DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps extends ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> {
  danger?: boolean;
}

export const DropdownMenuItem = forwardRef<ElementRef<typeof DropdownPrimitive.Item>, DropdownMenuItemProps>(
  ({ className, danger, ...props }, ref) => (
    <DropdownPrimitive.Item
      ref={ref}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        danger ? "text-danger focus:bg-danger-muted" : "text-text-primary",
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export { Check as DropdownCheckIcon, ChevronRight as DropdownChevronIcon, Circle as DropdownCircleIcon };