import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { useContentBlock } from "../../lib/useAppContent";
import { usePullRefresh } from "../../lib/usePullRefresh";
import { useCountdown } from "../../components/ui/Countdown";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";
import StepBadge from "../../components/ui/StepBadge";
import ThemedRefreshControl from "../../components/ui/ThemedRefreshControl";

function JourneyCard({ journey, onSelect, activating }) {
  const { colors } = useTheme();
  const enrollment = journey.enrollment;
  const isActive = enrollment?.isActive;

  let buttonLabel = "Start Journey";
  if (isActive) buttonLabel = "Active";
  else if (enrollment) buttonLabel = `Continue · Day ${enrollment.currentDay}`;

  return (
    <Card style={{ marginBottom: 14, borderColor: isActive ? colors.accent : colors.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "700", flex: 1, marginRight: 10 }}>
          {journey.title}
        </Text>
        <View
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>{journey.totalDays} days</Text>
        </View>
      </View>

      {!!journey.description && (
        <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
          {journey.description}
        </Text>
      )}

      {!!journey.audience && (
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 14 }}>Best for: {journey.audience}</Text>
      )}

      <Pressable
        onPress={() => !isActive && onSelect(journey)}
        disabled={activating || isActive}
        style={{
          borderRadius: 14,
          paddingVertical: 13,
          alignItems: "center",
          backgroundColor: isActive ? colors.accentSoft : colors.accent,
          opacity: activating ? 0.6 : 1,
        }}
      >
        <Text style={{ color: isActive ? colors.accent : colors.accentText, fontWeight: "700", fontSize: 14 }}>
          {buttonLabel}
        </Text>
      </Pressable>
    </Card>
  );
}

function JourneyPicker({ journeys, onSelect, activating, refreshing, onRefresh }) {
  const { colors } = useTheme();
  const headerContent = useContentBlock("journey_picker_header");
  const showHeader = !headerContent || headerContent.isEnabled;

  return (
    <FlatList
      data={journeys}
      keyExtractor={(j) => j.id}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 }}
      refreshControl={<ThemedRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        showHeader ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
              {headerContent?.title || "Choose your journey"}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {headerContent?.subtitle || "Pick the path that fits where you are right now. You can switch later."}
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => <JourneyCard journey={item} onSelect={onSelect} activating={activating} />}
    />
  );
}

export default function JourneyScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [activating, setActivating] = useState(false);

  const { data: journeys, isLoading } = useQuery({
    queryKey: ["journeys"],
    queryFn: () => api("/api/journeys"),
  });

  const activeJourney = journeys?.find((j) => j.enrollment?.isActive);
  const { refreshing, onRefresh } = usePullRefresh([["journeys"], ["app-content"]]);

  useEffect(() => {
    if (journeys && !activeJourney) setShowPicker(true);
  }, [journeys, activeJourney]);

  const selectJourney = async (journey) => {
    setActivating(true);
    try {
      await api(`/api/journeys/${journey.id}/activate`, { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: ["journeys"] });
      await queryClient.invalidateQueries({ queryKey: ["journey-today"] });
      await queryClient.invalidateQueries({ queryKey: ["progress"] });
      setShowPicker(false);
    } finally {
      setActivating(false);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  if (showPicker || !activeJourney) {
    return (
      <Screen>
        <JourneyPicker
          journeys={journeys || []}
          onSelect={selectJourney}
          activating={activating}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </Screen>
    );
  }

  const totalDays = activeJourney.totalDays;
  const currentDay = activeJourney.enrollment.currentDay;
  const dayCompleted = activeJourney.enrollment.dayCompleted;
  const nextUnlockAt = activeJourney.enrollment.nextUnlockAt;
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // When today's tasks are done, the current day counts as complete and the NEXT
  // day shows a 24h countdown instead of "Locked".
  const completedThrough = dayCompleted ? currentDay : currentDay - 1;
  const countdownDay = dayCompleted && currentDay < totalDays ? currentDay + 1 : null;
  const onUnlockReached = () => {
    queryClient.invalidateQueries({ queryKey: ["journeys"] });
    queryClient.invalidateQueries({ queryKey: ["journey-today"] });
    queryClient.invalidateQueries({ queryKey: ["progress"] });
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
            Your Journey
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{activeJourney.title}</Text>
        </View>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>Switch</Text>
        </Pressable>
      </View>

      <FlatList
        data={days}
        keyExtractor={(d) => String(d)}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        refreshControl={<ThemedRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item, index }) => {
          const done = item <= completedThrough;
          const isCountdown = item === countdownDay;
          const active = !dayCompleted && item === currentDay;
          const status = done ? "done" : active ? "active" : "locked";
          const isLastRow = index === days.length - 1;
          const locked = status === "locked" && !isCountdown;

          return (
            <JourneyDayRow
              navigation={navigation}
              dayNumber={item}
              dayLabel={activeJourney.dayLabel || "Day"}
              status={status}
              isLastRow={isLastRow}
              locked={locked}
              isCountdown={isCountdown}
              nextUnlockAt={nextUnlockAt}
              onUnlockReached={onUnlockReached}
            />
          );
        }}
      />
    </Screen>
  );
}

function JourneyDayRow({
  navigation,
  dayNumber,
  dayLabel,
  status,
  isLastRow,
  locked,
  isCountdown,
  nextUnlockAt,
  onUnlockReached,
}) {
  const { colors } = useTheme();
  const lockedContent = useContentBlock("journey_day_locked");
  const { label: countdownLabel } = useCountdown(isCountdown ? nextUnlockAt : null, onUnlockReached);
  const done = status === "done";
  const active = status === "active";

  // The next day, still within its 24h lock — show an admin-editable message
  // and a live countdown instead of a plain "Locked".
  if (isCountdown) {
    return (
      <Pressable disabled style={{ flexDirection: "row" }}>
        <View style={{ alignItems: "center", marginRight: 14 }}>
          <StepBadge number={dayNumber} status="locked" />
          {!isLastRow && (
            <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2 }} />
          )}
        </View>
        <View style={{ flex: 1, paddingBottom: 22 }}>
          <View
            style={{
              backgroundColor: colors.accentSoft,
              borderColor: colors.accent,
              borderWidth: 1,
              borderRadius: 14,
              padding: 14,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 4 }}>
              {lockedContent?.title || "Next day is on its way"}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
              {lockedContent?.subtitle ||
                "Take today to rest and reflect. Your next day unlocks automatically."}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={16} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.accent, fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                {countdownLabel}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 8 }}>until unlock</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      disabled={locked}
      onPress={() => navigation.navigate("JourneyDayDetail", { dayNumber })}
      style={{ flexDirection: "row" }}
    >
      <View style={{ alignItems: "center", marginRight: 14 }}>
        <StepBadge number={dayNumber} status={status} />
        {!isLastRow && (
          <View
            style={{
              width: 2,
              flex: 1,
              backgroundColor: done ? colors.accent : colors.border,
              marginVertical: 2,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, paddingBottom: 22 }}>
        <Text style={{ color: locked ? colors.textMuted : colors.textPrimary, fontSize: 15, fontWeight: "600" }}>
          {dayLabel} {dayNumber}
        </Text>
        <Text style={{ color: locked ? colors.textMuted : colors.textSecondary, fontSize: 12, marginTop: 2 }}>
          {done ? "Completed" : active ? "Today" : "Locked"}
        </Text>
      </View>
    </Pressable>
  );
}
