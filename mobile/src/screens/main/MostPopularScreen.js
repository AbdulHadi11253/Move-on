import { useState } from "react";
import { View, Text, Image, Pressable, FlatList, Modal, ActivityIndicator, Dimensions } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { useQuotePostActions } from "../../lib/useQuotePostActions";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import QuotePostCard from "../../components/quotes/QuotePostCard";
import CommentsModal from "../../components/quotes/CommentsModal";

const { width } = Dimensions.get("window");
const GAP = 12;
const NUM_COLUMNS = 2;
const TILE_SIZE = (width - 40 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function MostPopularScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const [viewingPost, setViewingPost] = useState(null);

  const queryKey = ["quote-posts", "popular"];
  const { data: posts, isLoading } = useQuery({
    queryKey,
    queryFn: () => api("/api/quote-posts?popular=true"),
  });

  const { toggleSave, openComments, closeComments, commentsPost, refreshKeys } = useQuotePostActions([queryKey]);

  return (
    <Screen>
      <AdminHeader title="Most Popular" onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          columnWrapperStyle={{ gap: GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setViewingPost(item)}
              style={{ width: TILE_SIZE, height: TILE_SIZE, borderRadius: 16, overflow: "hidden" }}
            >
              <Image source={{ uri: item.images[0]?.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              {item.images.length > 1 && (
                <View style={{ position: "absolute", top: 8, right: 8 }}>
                  <Ionicons name="copy" size={15} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              No popular quotes yet.
            </Text>
          }
        />
      )}

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
    </Screen>
  );
}
