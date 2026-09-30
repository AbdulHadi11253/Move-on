import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";

export function useAppContent() {
  const api = useApi();
  const { data } = useQuery({
    queryKey: ["app-content"],
    queryFn: () => api("/api/content"),
    // Drives every admin on/off toggle (ads, tracker, quote display mode,
    // prompt copy) — a short stale time so a change the admin makes shows up
    // for users already in the app within moments, not after several minutes.
    staleTime: 30 * 1000,
    refetchOnMount: true,
  });
  return data || [];
}

export function useContentBlock(key) {
  const blocks = useAppContent();
  return blocks.find((b) => b.key === key) || null;
}
