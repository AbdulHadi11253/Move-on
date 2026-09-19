import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import ScreenHeader from "../../components/ui/ScreenHeader";
import Card from "../../components/ui/Card";
import SectionLabel from "../../components/ui/SectionLabel";

export default function JourneyDayDetailScreen({ route, navigation }) {
  const { dayNumber } = route.params;
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["journey-day", dayNumber],
    queryFn: () => api(`/api/journeys/day/${dayNumber}`),
  });

  const completeTask = async (taskId) => {
    await api(`/api/journeys/tasks/${taskId}/complete`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["journey-day", dayNumber] });
    queryClient.invalidateQueries({ queryKey: ["journey-today"] });
    queryClient.invalidateQueries({ queryKey: ["journeys"] });
    queryClient.invalidateQueries({ queryKey: ["progress"] });
  };

  return (
    <Screen>
      <ScreenHeader title={`Day ${dayNumber}`} onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          {data?.isToday && (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: colors.accentSoft,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}>Today</Text>
            </View>
          )}

          {(data?.quotes || []).map((quote) => (
            <Card key={quote.id} style={{ marginBottom: 16, backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }}>
              <SectionLabel>Quote</SectionLabel>
              <Text style={{ color: colors.textPrimary, fontSize: 19, lineHeight: 27, fontWeight: "500" }}>
                "{quote.text}"
              </Text>
              {quote.author && <Text style={{ color: colors.textSecondary, marginTop: 8 }}>— {quote.author}</Text>}
            </Card>
          ))}

          {(data?.lessons || []).map((lesson) => (
            <Card key={lesson.id} style={{ marginBottom: 16 }}>
              <SectionLabel>Lesson{lesson.readMinutes ? ` · ${lesson.readMinutes} min` : ""}</SectionLabel>
              <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "600", marginBottom: 8 }}>
                {lesson.title}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 21 }}>{lesson.content}</Text>
            </Card>
          ))}

          {data?.tasks?.length > 0 && (
            <Card>
              <SectionLabel>{data.tasks.length > 1 ? "Tasks" : "Task"}</SectionLabel>
              {data.tasks.map((task, idx) => (
                <Pressable
                  key={task.id}
                  onPress={() => completeTask(task.id)}
                  disabled={task.done || !data.isToday}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: idx === 0 ? 0 : 14,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      marginRight: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: task.done ? colors.accent : "transparent",
                      borderWidth: task.done ? 0 : 2,
                      borderColor: colors.textMuted,
                    }}
                  >
                    {task.done && <Ionicons name="checkmark" size={14} color={colors.accentText} />}
                  </View>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 16,
                      fontWeight: "500",
                      textDecorationLine: task.done ? "line-through" : "none",
                      opacity: task.done ? 0.6 : 1,
                      flex: 1,
                    }}
                  >
                    {task.title}
                  </Text>
                </Pressable>
              ))}
              {!data.isToday && data.tasks.some((t) => !t.done) && (
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 12 }}>
                  This day has passed and wasn't fully completed.
                </Text>
              )}
            </Card>
          )}

          {!data?.quotes?.length && !data?.lessons?.length && !data?.tasks?.length && (
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              Nothing has been scheduled for this day yet.
            </Text>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
