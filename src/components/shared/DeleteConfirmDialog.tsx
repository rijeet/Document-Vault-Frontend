"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CONFIRM_WORD = "DELETE";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  isLoading,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isConfirmed = value === CONFIRM_WORD;

  // Reset the typed text each time the dialog opens, so a previous
  // confirmation doesn't linger and let a second delete slip through
  // without the user actually typing it again.
  useEffect(() => {
    if (open) {
      setValue("");
      // Radix moves focus into the dialog on open already, but on the very
      // next tick — grabbing the input directly avoids a race where Enter
      // from opening the dialog (e.g. via keyboard) lands somewhere else.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  function handleConfirm() {
    if (!isConfirmed || isLoading) return;
    onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <label className="mb-1.5 block text-sm text-text-secondary">
            Type <span className="font-mono font-semibold text-text-primary">{CONFIRM_WORD}</span> to
            confirm.
          </label>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
              }
            }}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
            spellCheck={false}
            disabled={isLoading}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={!isConfirmed} isLoading={isLoading}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}