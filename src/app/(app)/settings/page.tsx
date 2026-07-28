"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe, useUpdateMe } from "@/features/users/hooks";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().max(20).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { data: user, isLoading } = useMe();
  const { mutate: updateMe, isPending } = useUpdateMe();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Populate the form once the user profile loads — reset() also clears
  // isDirty, so the Save button stays disabled until the person actually
  // changes something.
  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone ?? "" });
    }
  }, [user, reset]);

  function onSubmit(values: FormValues) {
    updateMe(
      { name: values.name, phone: values.phone || undefined },
      { onSuccess: (updated) => reset({ name: updated.name, phone: updated.phone ?? "" }) },
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg p-4 md:p-6">
        <PageHeader title="Settings" description="Manage your profile." />
        <div className="mt-6 space-y-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-4 md:p-6">
      <PageHeader title="Settings" description="Manage your profile." />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Email</label>
          <Input value={user?.email ?? ""} disabled />
          <p className="mt-1.5 text-xs text-text-muted">
            Your email is tied to your Google account and can&apos;t be changed here.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Name</label>
          <Input placeholder="Your name" {...register("name")} error={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Phone</label>
          <Input placeholder="Optional" {...register("phone")} error={!!errors.phone} />
          <FieldError message={errors.phone?.message} />
        </div>

        <div className="flex justify-end border-t border-border-subtle pt-4">
          <Button type="submit" isLoading={isPending} disabled={!isDirty}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}