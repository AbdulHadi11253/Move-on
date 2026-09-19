import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Returns { refreshing, onRefresh } to plug straight into a ScrollView/FlatList's
// refreshControl. Pass the react-query keys that screen depends on.
export function usePullRefresh(queryKeys = []) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all(queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, queryKeys]);

  return { refreshing, onRefresh };
}
