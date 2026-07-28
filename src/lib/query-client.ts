import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30s — avoid refetch spam on nav between screens
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}