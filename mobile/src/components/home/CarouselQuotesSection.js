import { View } from "react-native";
import QuotePostCard from "../quotes/QuotePostCard";

export default function CarouselQuotesSection({ posts, limit, onToggleSave, onOpenComments, onReadMore }) {
  const visible = limit ? (posts || []).slice(0, limit) : posts || [];

  if (visible.length === 0) return null;

  return (
    <View style={{ marginBottom: 8 }}>
      {visible.map((post) => (
        <QuotePostCard
          key={post.id}
          post={post}
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
