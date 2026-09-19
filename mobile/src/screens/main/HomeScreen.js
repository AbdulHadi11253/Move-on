import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { useContentBlock } from "../../lib/useAppContent";
import { usePullRefresh } from "../../lib/usePullRefresh";
import { useScrollToTop } from "../../lib/useScrollToTop";
import { useQuotePostActions } from "../../lib/useQuotePostActions";
import { hasStartedToday, markStartedToday } from "../../lib/recoveryFlag";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import StartRecoveryButton from "../../components/ui/StartRecoveryButton";
import ChooseJourneyButton from "../../components/ui/ChooseJourneyButton";
import ThemedRefreshControl from "../../components/ui/ThemedRefreshControl";
import MeditationIcon from "../../components/ui/MeditationIcon";
import PromoCards from "../../components/home/PromoCards";
import CarouselQuotesSection from "../../components/home/CarouselQuotesSection";
import SinglePostsSection from "../../components/home/SinglePostsSection";
import CategoryNameSlider from "../../components/home/CategoryNameSlider";
import CommentsModal from "../../components/quotes/CommentsModal";
import HeaderMenu from "../../components/ui/HeaderMenu";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";

export default function HomeScreen({ navigation }) {
  const api = useApi();
  const { user } = useUser();
  const { colors } = useTheme();
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [startedToday, setStartedToday] = useState(false);

  useFocusEffect(
    useCallback(() => {
      hasStartedToday().then((started) => {
        setStartedToday(started);
        setCheckedStorage(true);
      });
    }, [])
  );

  const { data, isLoading } = useQuery({
    queryKey: ["journey-today"],
    queryFn: () => api("/api/journeys/today"),
  });

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api("/api/users/me") });

  const noJourneyContent = useContentBlock("home_no_journey");
  const startRecoveryContent = useContentBlock("start_recovery_button");
  const todayQuoteContent = useContentBlock("home_today_quote");
  const carouselLimitContent = useContentBlock("home_carousel_limit");
  const singlePostLimitContent = useContentBlock("home_single_post_limit");
  const carouselLimit = parseInt(carouselLimitContent?.title, 10) || 3;
  const singlePostLimit = parseInt(singlePostLimitContent?.title, 10) || 5;

  const { data: carouselPosts } = useQuery({
    queryKey: ["quote-posts", "home-carousel"],
    queryFn: () => api("/api/quote-posts?home=true&type=CAROUSEL"),
  });
  const { data: singlePosts } = useQuery({
    queryKey: ["quote-posts", "home-single"],
    queryFn: () => api("/api/quote-posts?home=true&type=SINGLE"),
  });
  const { data: categories } = useQuery({
    queryKey: ["quote-categories"],
    queryFn: () => api("/api/quote-categories"),
  });
  const { data: promoCards } = useQuery({
    queryKey: ["promo-cards"],
    queryFn: () => api("/api/promo-cards"),
  });

  const quotePostKeys = [["quote-posts", "home-carousel"], ["quote-posts", "home-single"]];
  const { toggleSave, openComments, closeComments, commentsPost, refreshKeys } = useQuotePostActions(quotePostKeys);

  const { refreshing, onRefresh } = usePullRefresh([
    ["journey-today"],
    ["me"],
    ["app-content"],
    ...quotePostKeys,
    ["quote-categories"],
    ["promo-cards"],
  ]);

  const { ref: scrollRef, onScroll, visible: showScrollTop, scrollToTop } = useScrollToTop();

  const displayName = me?.name || user?.firstName || "Friend";

  const onRecoveryStarted = async () => {
    await markStartedToday();
    setStartedToday(true);
  };

  if (isLoading || !checkedStorage) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!data?.hasActiveJourney) {
    const showNoJourneyText = !noJourneyContent || noJourneyContent.isEnabled;
    return (
      <Screen>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}
          refreshControl={<ThemedRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {showNoJourneyText && !!noJourneyContent?.title && (
            <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 4 }}>
              {noJourneyContent.title}
            </Text>
          )}
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 16, textAlign: "center" }}>
            {displayName}
          </Text>
          {showNoJourneyText && !!noJourneyContent?.subtitle && (
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: "center", marginBottom: 20, lineHeight: 22 }}>
              {noJourneyContent.subtitle}
            </Text>
          )}
          <ChooseJourneyButton
            label={noJourneyContent?.buttonLabel || "Choose Your Journey"}
            onPress={() => navigation.navigate("Journey")}
          />
        </ScrollView>
      </Screen>
    );
  }

  if (!startedToday) {
    return (
      <Screen>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}
          refreshControl={<ThemedRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 4 }}>Welcome back</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 24 }}>
            {displayName}
          </Text>
          <MeditationIcon size={100} color={colors.accent} />
          <View style={{ height: 24 }} />
          <StartRecoveryButton
            onComplete={onRecoveryStarted}
            stage1Message={startRecoveryContent?.title || "Hold to Heal"}
            stage2Message={startRecoveryContent?.subtitle || "You are choosing yourself"}
            doneMessage={startRecoveryContent?.buttonLabel || "Done"}
          />
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 32, textAlign: "center" }}>
            Press and hold to begin today's recovery session
          </Text>
        </ScrollView>
      </Screen>
    );
  }

  const quote = data.quotes?.[0];
  const showTodayQuote = quote && (!todayQuoteContent || todayQuoteContent.isEnabled);
  const dayLabel = data?.dayLabel || "Day";

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}
        refreshControl={<ThemedRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Welcome back</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 26, fontWeight: "700", marginTop: 2 }}>
              {displayName}
            </Text>
          </View>
          <HeaderMenu navigation={navigation} />
        </View>

        <Pressable onPress={() => navigation.navigate("Journey")}>
          <Card style={{ marginBottom: showTodayQuote ? 20 : 28 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
                {dayLabel} {data?.currentDay} of {data?.totalDays}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: colors.accent, fontSize: 14, fontWeight: "700", marginRight: 4 }}>
                  {Math.round(((data?.currentDay || 0) / (data?.totalDays || 1)) * 100)}%
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </View>
            </View>
            <ProgressBar progress={(data?.currentDay || 0) / (data?.totalDays || 1)} />
          </Card>
        </Pressable>

        <PromoCards cards={promoCards} />

        {showTodayQuote && (
          <Card
            style={{
              backgroundColor: colors.accentSoft,
              borderColor: colors.accentSoft,
              marginBottom: 28,
              alignItems: "center",
              paddingVertical: 28,
            }}
          >
            <Ionicons name="sparkles" size={20} color={colors.accent} style={{ marginBottom: 12 }} />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 20,
                lineHeight: 29,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {quote.text}
            </Text>
          </Card>
        )}

        <CategoryNameSlider
          categories={categories}
          onSelect={(category) => navigation.navigate("CategoryQuotes", { category })}
        />

        <CarouselQuotesSection
          posts={carouselPosts}
          limit={carouselLimit}
          onToggleSave={toggleSave}
          onOpenComments={openComments}
          onReadMore={() => navigation.navigate("QuotesExplore")}
        />

        <SinglePostsSection
          posts={singlePosts}
          limit={singlePostLimit}
          onToggleSave={toggleSave}
          onOpenComments={openComments}
        />
      </ScrollView>

      <CommentsModal post={commentsPost} onClose={closeComments} refreshKeys={refreshKeys} />
      <ScrollToTopButton visible={showScrollTop} onPress={scrollToTop} />
    </Screen>
  );
}
