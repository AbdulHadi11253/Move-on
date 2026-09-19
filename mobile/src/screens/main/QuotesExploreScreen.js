import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { useQuotePostActions } from "../../lib/useQuotePostActions";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import CategoriesRow from "../../components/home/CategoriesRow";
import QuotePostCard from "../../components/quotes/QuotePostCard";
import CommentsModal from "../../components/quotes/CommentsModal";

export default function QuotesExploreScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();

  const postsKey = ["quote-posts", "all"];
  const { data: posts, isLoading } = useQuery({
    queryKey: postsKey,
    queryFn: () => api("/api/quote-posts"),
  });
  const { data: categories } = useQuery({
    queryKey: ["quote-categories"],
    queryFn: () => api("/api/quote-categories"),
  });

  const { toggleSave, openComments, closeComments, commentsPost, refreshKeys } = useQuotePostActions([postsKey]);

  return (
    <Screen>
      <AdminHeader title="All Quotes" onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          ListHeaderComponent={
            <CategoriesRow
              categories={categories}
              onSelect={(category) => navigation.navigate("CategoryQuotes", { category })}
            />
          }
          renderItem={({ item }) => (
            <QuotePostCard
              post={item}
              onToggleSave={toggleSave}
              onOpenComments={openComments}
              style={{ marginBottom: 16 }}
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 20 }}>No quotes yet.</Text>
          }
        />
      )}

      <CommentsModal post={commentsPost} onClose={closeComments} refreshKeys={refreshKeys} />
    </Screen>
  );
}
