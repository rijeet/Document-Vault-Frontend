import type { User } from "@/types/entities";

export interface GoogleAuthResult {
  accessToken: string;
  user: User;
}