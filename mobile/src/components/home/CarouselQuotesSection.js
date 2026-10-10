import { View } from "react-native";
import QuotePostCard from "../quotes/QuotePostCard";
import { GRID_COLUMNS, GRID_CARD_WIDTH } from "../../lib/responsiveGrid";

export default function CarouselQuotesSection({ posts, limit, onToggleSave, onOpenComments, onReadMore }) {
  const visible = limit ? (posts || []).slice(0, limit) : posts || [];

  if (visible.length === 0) return null;

  return (
    <View
      style={{
        marginBottom: 8,
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
          onReadMore={onReadMore}
          showReadMore
          style={{ marginBottom: 20 }}
        />
      ))}
    </View>
  );
}
