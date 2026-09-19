import { useAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";
import { apiFetch } from "./api";

export function useApi() {
  const { getToken } = useAuth();

  return useCallback(
    (path, options = {}) => apiFetch(path, { ...options, getToken }),
    [getToken]
  );
}
