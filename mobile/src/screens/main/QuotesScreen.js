import { useState } from "react";
import { View, Text, FlatList, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { usePullRefresh } from "../../lib/usePullRefresh";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";
import ThemedRefreshControl from "../../components/ui/ThemedRefreshControl";
import CategoryGrid from "../../components/quotes/CategoryGrid";
import PopularPostsSection from "../../components/quotes/PopularPostsSection";
import HeaderMenu from "../../components/ui/HeaderMenu";

const { width: CARD_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = 210;

export default function QuotesScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => api("/api/quotes"),
  });

  const { data: categories } = useQuery({
    queryKey: ["quote-categories"],
    queryFn: () => api("/api/quote-categories"),
  });

  const { refreshing, onRefresh } = usePullRefresh([["quotes"], ["quote-categories"], ["quote-posts", "popular"]]);

  if (isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<ThemedRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 14,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700" }}>Daily Quotes</Text>
          <HeaderMenu navigation={navigation} />
        </View>

        <FlatList
          data={quotes}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          disableIntervalMomentum
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
            setIndex(i);
          }}
          getItemLayout={(_, i) => ({ length: CARD_WIDTH, offset: CARD_WIDTH * i, index: i })}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH, paddingHorizontal: 20 }}>
              <Card
                style={{
                  height: CARD_HEIGHT,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 26,
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 19,
                    lineHeight: 27,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                  numberOfLines={5}
                >
                  "{item.text}"
                </Text>
                {item.author && (
                  <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 13 }}>
                    — {item.author}
                  </Text>
                )}
              </Card>
            </View>
          )}
        />

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 14, marginBottom: 24 }}>
          {(quotes || []).map((q, i) => (
            <View
              key={q.id}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                marginHorizontal: 3,
                backgroundColor: i === index ? colors.accent : colors.border,
              }}
            />
          ))}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <CategoryGrid
            categories={categories}
            onSelect={(category) => navigation.navigate("CategoryQuotes", { category })}
          />
        </View>

        <PopularPostsSection navigation={navigation} />
      </ScrollView>
    </Screen>
  );
}
