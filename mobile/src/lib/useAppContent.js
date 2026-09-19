import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";

export function useAppContent() {
  const api = useApi();
  const { data } = useQuery({
    queryKey: ["app-content"],
    queryFn: () => api("/api/content"),
    staleTime: 5 * 60 * 1000,
  });
  return data || [];
}

export function useContentBlock(key) {
  const blocks = useAppContent();
  return blocks.find((b) => b.key === key) || null;
}
