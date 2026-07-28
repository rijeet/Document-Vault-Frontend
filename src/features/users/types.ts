import type { User } from "@/types/entities";

export type { User };

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
}