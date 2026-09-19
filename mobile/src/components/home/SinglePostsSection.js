import { View } from "react-native";
import QuotePostCard from "../quotes/QuotePostCard";

export default function SinglePostsSection({ posts, limit, onToggleSave, onOpenComments }) {
  const visible = limit ? (posts || []).slice(0, limit) : posts || [];

  if (visible.length === 0) return null;

  return (
    <View style={{ marginBottom: 12 }}>
      {visible.map((post) => (
        <QuotePostCard
          key={post.id}
          post={post}
          onToggleSave={onToggleSave}
          onOpenComments={onOpenComments}
          style={{ marginBottom: 16 }}
        />
      ))}
    </View>
  );
}
