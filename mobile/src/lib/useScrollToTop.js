import { useRef, useState, useCallback } from "react";

// Tracks scroll position on a ScrollView or FlatList and exposes a scroll-to-top
// action. `visible` becomes true only after the user scrolls past `threshold`,
// so the button stays hidden at the top of the page.
export function useScrollToTop(threshold = 320) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(
    (e) => {
      const y = e?.nativeEvent?.contentOffset?.y || 0;
      setVisible(y > threshold);
    },
    [threshold]
  );

  const scrollToTop = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    // ScrollView exposes scrollTo; FlatList exposes scrollToOffset.
    if (typeof node.scrollTo === "function") node.scrollTo({ y: 0, animated: true });
    else if (typeof node.scrollToOffset === "function") node.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return { ref, onScroll, visible, scrollToTop };
}
