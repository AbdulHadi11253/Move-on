import { View } from "react-native";
import QuotePostCard from "../quotes/QuotePostCard";
import { GRID_COLUMNS, GRID_CARD_WIDTH } from "../../lib/responsiveGrid";

export default function SinglePostsSection({ posts, limit, onToggleSave, onOpenComments }) {
  const visible = limit ? (posts || []).slice(0, limit) : posts || [];

  if (visible.length === 0) return null;

  return (
    <View
      style={{
        marginBottom: 12,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: GRID_COLUMNS > 1 ? "space-between" : "center",
      }}
    >
      {visible.map((post) => (
        <QuotePostCard
          key={post.id}
          post={post}
          cardWidth={GRID_CARD_WIDTH}
          onToggleSave={onToggleSave}
          onOpenComments={onOpenComments}
          style={{ marginBottom: 16 }}
        />
      ))}
    </View>
  );
}
