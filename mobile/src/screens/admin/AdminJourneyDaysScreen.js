import { useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";

function MultiPicker({ label, options, selectedIds, onToggle, getLabel }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.6,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label} {selectedIds.length > 0 ? `(${selectedIds.length} selected)` : ""}
      </Text>
      {options.map((opt) => {
        const selected = selectedIds.includes(opt.id);
        return (
          <Pressable
            key={opt.id}
            onPress={() => onToggle(opt.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: selected ? 0 : 1,
              borderColor: colors.border,
              backgroundColor: selected ? colors.accent : colors.surface,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: selected ? colors.accentText : colors.textPrimary, flex: 1, marginRight: 8 }} numberOfLines={1}>
              {getLabel(opt)}
            </Text>
            {selected && <Ionicons name="checkmark" size={16} color={colors.accentText} />}
          </Pressable>
        );
      })}
    </View>
  );
}

function toggleId(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function AdminJourneyDaysScreen({ route, navigation }) {
  const { journey: journeyParam } = route.params;
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const [dayModal, setDayModal] = useState(null);
  const [quoteIds, setQuoteIds] = useState([]);
  const [taskIds, setTaskIds] = useState([]);
  const [lessonIds, setLessonIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: journey } = useQuery({
    queryKey: ["admin-journey", journeyParam.id],
    queryFn: () => api(`/api/journeys/${journeyParam.id}`),
  });
  const { data: quotes } = useQuery({ queryKey: ["admin-quotes"], queryFn: () => api("/api/quotes") });
  const { data: tasks } = useQuery({ queryKey: ["admin-tasks"], queryFn: () => api("/api/tasks") });
  const { data: lessons } = useQuery({ queryKey: ["admin-lessons"], queryFn: () => api("/api/lessons") });

  const totalDays = journey?.totalDays || journeyParam.totalDays;

  const daysByNumber = useMemo(() => {
    const map = {};
    (journey?.days || []).forEach((d) => (map[d.dayNumber] = d));
    return map;
  }, [journey]);

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const openDay = (dayNumber) => {
    const existing = daysByNumber[dayNumber];
    setQuoteIds(existing?.quotes.map((q) => q.quoteId) || []);
    setTaskIds(existing?.tasks.map((t) => t.taskId) || []);
    setLessonIds(existing?.lessons.map((l) => l.lessonId) || []);
    setDayModal(dayNumber);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api(`/api/journeys/${journeyParam.id}/days`, {
        method: "POST",
        body: { dayNumber: dayModal, quoteIds, taskIds, lessonIds },
      });
      queryClient.invalidateQueries({ queryKey: ["admin-journey", journeyParam.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-journeys"] });
      setDayModal(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <AdminHeader title={journeyParam.title} onBack={() => navigation.goBack()} />
      <Text style={{ color: colors.textMuted, fontSize: 13, paddingHorizontal: 24, marginTop: -8, marginBottom: 8 }}>
        Tap a day to assign quotes, tasks, and lessons — you can pick more than one of each.
      </Text>

      <FlatList
        data={days}
        keyExtractor={(d) => String(d)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        renderItem={({ item: dayNumber }) => {
          const day = daysByNumber[dayNumber];
          const count = (day?.quotes.length || 0) + (day?.tasks.length || 0) + (day?.lessons.length || 0);
          return (
            <Pressable
              onPress={() => openDay(dayNumber)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                paddingVertical: 12,
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 15 }}>Day {dayNumber}</Text>
              <Text style={{ color: count > 0 ? colors.accent : colors.textMuted, fontSize: 13, fontWeight: "500" }}>
                {count > 0 ? `${count} item${count > 1 ? "s" : ""}` : "Not set"}
              </Text>
            </Pressable>
          );
        }}
      />

      <Modal visible={dayModal !== null} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={`Day ${dayModal}`} onBack={() => setDayModal(null)} />
          {!quotes || !tasks || !lessons ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <FlatList
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
              ListHeaderComponent={
                <>
                  <MultiPicker
                    label="Quotes"
                    options={quotes}
                    selectedIds={quoteIds}
                    onToggle={(id) => setQuoteIds((prev) => toggleId(prev, id))}
                    getLabel={(q) => q.text}
                  />
                  <MultiPicker
                    label="Tasks"
                    options={tasks}
                    selectedIds={taskIds}
                    onToggle={(id) => setTaskIds((prev) => toggleId(prev, id))}
                    getLabel={(t) => t.title}
                  />
                  <MultiPicker
                    label="Lessons"
                    options={lessons}
                    selectedIds={lessonIds}
                    onToggle={(id) => setLessonIds((prev) => toggleId(prev, id))}
                    getLabel={(l) => l.title}
                  />
                </>
              }
              ListFooterComponent={
                <Pressable
                  onPress={save}
                  disabled={saving}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: "center",
                    marginTop: 8,
                    backgroundColor: saving ? colors.surfaceAlt : colors.accent,
                  }}
                >
                  <Text style={{ color: saving ? colors.textMuted : colors.accentText, fontWeight: "600" }}>
                    {saving ? "Saving..." : "Save day"}
                  </Text>
                </Pressable>
              }
              data={[]}
              renderItem={null}
            />
          )}
        </Screen>
      </Modal>
    </Screen>
  );
}
