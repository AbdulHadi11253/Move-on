import { View } from "react-native";
import QuotePostCard from "../quotes/QuotePostCard";
import { GRID_COLUMNS, GRID_CARD_WIDTH, GRID_FULL_ROW_WIDTH } from "../../lib/responsiveGrid";

export default function SinglePostsSection({ posts, limit, onToggleSave, onOpenComments }) {
  const visible = limit ? (posts || []).slice(0, limit) : posts || [];

  if (visible.length === 0) return null;

  // On a 2-column grid, an odd item count leaves the last row's second cell
  // empty. Give that lone last card the full row width instead, so it fills
  // the space rather than sitting next to a blank gap.
  const isOddLast = (i) => GRID_COLUMNS > 1 && i === visible.length - 1 && visible.length % 2 !== 0;

  return (
    <View
      style={{
        marginBottom: 12,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: GRID_COLUMNS > 1 ? "space-between" : "center",
      }}
    >
      {visible.map((post, i) => (
        <QuotePostCard
          key={post.id}
          post={post}
          cardWidth={isOddLast(i) ? GRID_FULL_ROW_WIDTH : GRID_CARD_WIDTH}
          onToggleSave={onToggleSave}
          onOpenComments={onOpenComments}
          style={{ marginBottom: 16 }}
        />
      ))}
    </View>
  );
}
