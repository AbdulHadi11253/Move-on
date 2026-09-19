import { View, Text, FlatList, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { useContentBlock } from "../../lib/useAppContent";
import { usePullRefresh } from "../../lib/usePullRefresh";
import { getMotivation, getAchievements } from "../../lib/progressMotivation";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";
import StatTile from "../../components/ui/StatTile";
import Chip from "../../components/ui/Chip";
import ChooseJourneyButton from "../../components/ui/ChooseJourneyButton";
import ThemedRefreshControl from "../../components/ui/ThemedRefreshControl";

export default function ProgressScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () => api("/api/journeys/progress"),
  });

  const noJourneyContent = useContentBlock("progress_no_journey");
  const { refreshing, onRefresh } = usePullRefresh([["progress"], ["app-content"]]);

  if (isLoading) {
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
            <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
              {noJourneyContent.title}
            </Text>
          )}
          {showNoJourneyText && (
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: "center", marginBottom: 20 }}>
              {noJourneyContent?.subtitle || "You don't have an active journey yet."}
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

  const milestones = [7, 14, 30, data.totalDays].filter((m, i, arr) => arr.indexOf(m) === i && m <= data.totalDays);
  const motivation = getMotivation(data);
  const achievements = getAchievements(data);

  return (
    <Screen>
      <FlatList
        data={data?.completedTasks || []}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        refreshControl={<ThemedRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginTop: 8, marginBottom: 16 }}>
              Your Progress
            </Text>

            {/* Motivational hero — encouragement, not just numbers */}
            <Card
              style={{
                backgroundColor: colors.accentSoft,
                borderColor: colors.accentSoft,
                marginBottom: 20,
                paddingVertical: 22,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 30, marginBottom: 8 }}>{motivation.emoji}</Text>
              <Text
                style={{ color: colors.textPrimary, fontSize: 19, fontWeight: "700", textAlign: "center", marginBottom: 6 }}
              >
                {motivation.title}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: "center" }}>
                {motivation.subtitle}
              </Text>
            </Card>

            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <StatTile value={data?.currentDay} label="Current Day" style={{ marginRight: 8 }} />
              <StatTile value={`${data?.percentComplete || 0}%`} label="Complete" style={{ marginHorizontal: 8 }} />
              <StatTile value={data?.streak} label="Day Streak" style={{ marginLeft: 8 }} />
            </View>

            {/* Rewards — unlockable badges to reach for */}
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.6,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Rewards
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5, marginBottom: 14 }}>
              {achievements.map((a) => (
                <View key={a.key} style={{ width: "33.333%", paddingHorizontal: 5, marginBottom: 10, alignItems: "center" }}>
                  <View
                    style={{
                      width: "100%",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: a.unlocked ? colors.accent : colors.border,
                      backgroundColor: a.unlocked ? colors.accentSoft : colors.surface,
                      paddingVertical: 16,
                      alignItems: "center",
                      opacity: a.unlocked ? 1 : 0.55,
                    }}
                  >
                    <Ionicons
                      name={a.unlocked ? a.icon : "lock-closed"}
                      size={22}
                      color={a.unlocked ? colors.accent : colors.textMuted}
                    />
                    <Text
                      style={{
                        color: a.unlocked ? colors.textPrimary : colors.textMuted,
                        fontSize: 12,
                        fontWeight: "600",
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      {a.label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.6,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Milestones
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 24, marginHorizontal: -4 }}>
              {milestones.map((m) => (
                <Chip key={m} label={m} sublabel="days" active={(data?.currentDay || 0) > m} />
              ))}
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.6,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Completed Tasks
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomColor: colors.border,
              borderBottomWidth: 1,
              paddingVertical: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 10 }}>
              <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
              <Text style={{ color: colors.textPrimary, fontSize: 14, marginLeft: 8, flex: 1 }} numberOfLines={1}>
                {item.task.title}
              </Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Day {item.dayNumber}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 20 }}>
            No completed tasks yet.
          </Text>
        }
      />
    </Screen>
  );
}
