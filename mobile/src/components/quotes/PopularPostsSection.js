import { useState } from "react";
import { View, Text, Pressable, Image, Dimensions, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { useQuotePostActions } from "../../lib/useQuotePostActions";
import Screen from "../ui/Screen";
import AdminHeader from "../admin/AdminHeader";
import QuotePostCard from "./QuotePostCard";
import CommentsModal from "./CommentsModal";

const { width } = Dimensions.get("window");
const GAP = 12;
const TILE_SIZE = (width - 40 - GAP) / 2;
const PREVIEW_COUNT = 4;

export default function PopularPostsSection({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const [viewingPost, setViewingPost] = useState(null);

  const queryKey = ["quote-posts", "popular"];
  const { data: posts, isLoading } = useQuery({
    queryKey,
    queryFn: () => api("/api/quote-posts?popular=true"),
  });

  const { toggleSave, openComments, closeComments, commentsPost, refreshKeys } = useQuotePostActions([queryKey]);

  if (isLoading || !posts || posts.length === 0) return null;

  const preview = posts.slice(0, PREVIEW_COUNT);
  const remaining = posts.length - preview.length;

  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="flame" size={18} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700" }}>Most Popular</Text>
        </View>
        <Pressable onPress={() => navigation.navigate("MostPopular")} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "600", marginRight: 2 }}>See All</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.accent} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {preview.map((post, i) => {
          const isLastVisible = i === preview.length - 1 && remaining > 0;
          return (
            <Pressable
              key={post.id}
              onPress={() => setViewingPost(post)}
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                marginBottom: GAP,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <Image source={{ uri: post.images[0]?.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              {post.images.length > 1 && (
                <View style={{ position: "absolute", top: 8, right: 8 }}>
                  <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                </View>
              )}
              {isLastVisible && (
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}>+{remaining}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Modal visible={!!viewingPost} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title="Quote" onBack={() => setViewingPost(null)} />
          {viewingPost && (
            <View style={{ paddingHorizontal: 20 }}>
              <QuotePostCard
                post={posts?.find((p) => p.id === viewingPost.id) || viewingPost}
                onToggleSave={toggleSave}
                onOpenComments={openComments}
                imageHeight={420}
              />
            </View>
          )}
        </Screen>
      </Modal>

      <CommentsModal post={commentsPost} onClose={closeComments} refreshKeys={refreshKeys} />
    </View>
  );
}
