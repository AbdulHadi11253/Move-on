import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";

export function useQuotePostActions(queryKeys = []) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [commentsPost, setCommentsPost] = useState(null);

  const invalidateAll = () => queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

  const toggleSave = async (post) => {
    await api(`/api/quote-posts/${post.id}/save`, { method: post.isSaved ? "DELETE" : "POST" });
    invalidateAll();
  };

  return {
    toggleSave,
    openComments: setCommentsPost,
    closeComments: () => setCommentsPost(null),
    commentsPost,
    refreshKeys: queryKeys,
  };
}
