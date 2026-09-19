import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { useQuotePostActions } from "../../lib/useQuotePostActions";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import QuotePostCard from "../../components/quotes/QuotePostCard";
import CommentsModal from "../../components/quotes/CommentsModal";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest", icon: "time-outline" },
  { value: "oldest", label: "Oldest", icon: "hourglass-outline" },
];

export default function CategoryQuotesScreen({ route, navigation }) {
  const { category } = route.params;
  const api = useApi();
  const { colors } = useTheme();
  const [sort, setSort] = useState("latest");

  const queryKey = ["quote-posts", category.isCollection ? "collection" : "category", category.id, sort];
  const { data: posts, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      api(
        category.isCollection
          ? `/api/quote-posts?saved=true&sort=${sort}`
          : `/api/quote-posts?categoryId=${category.id}&sort=${sort}`
      ),
  });

  const { toggleSave, openComments, closeComments, commentsPost, refreshKeys } = useQuotePostActions([queryKey]);

  return (
    <Screen>
      <AdminHeader title={category.name} onBack={() => navigation.goBack()} />

      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surfaceAlt,
          borderRadius: 12,
          padding: 3,
          marginHorizontal: 20,
          marginBottom: 16,
        }}
      >
        {SORT_OPTIONS.map((opt) => {
          const active = sort === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setSort(opt.value)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: active ? colors.surface : "transparent",
                shadowColor: active ? "#000" : "transparent",
                shadowOpacity: active ? 0.08 : 0,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
                elevation: active ? 1 : 0,
              }}
            >
              <Ionicons name={opt.icon} size={14} color={active ? colors.accent : colors.textMuted} />
              <Text
                style={{
                  color: active ? colors.textPrimary : colors.textMuted,
                  fontSize: 13,
                  fontWeight: "600",
                  marginLeft: 6,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <QuotePostCard post={item} onToggleSave={toggleSave} onOpenComments={openComments} style={{ marginBottom: 16 }} />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              {category.isCollection
                ? "Tap the bookmark icon on any quote to save it here."
                : "No quotes in this category yet."}
            </Text>
          }
        />
      )}

      <CommentsModal post={commentsPost} onClose={closeComments} refreshKeys={refreshKeys} />
    </Screen>
  );
}
