"use client";

import { create } from "zustand";
import { ToastProvider, ToastViewport, Toast } from "@/components/ui/toast";

interface ToastItem {
  id: string;
  variant: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => ({ toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "success", title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "error", title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "info", title, description }),
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          description={t.description}
          onOpenChange={(open) => !open && dismiss(t.id)}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}