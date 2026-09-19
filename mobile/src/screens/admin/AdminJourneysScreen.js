import { useState } from "react";
import { View, Text, Pressable, FlatList, Modal, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import FormField from "../../components/admin/FormField";
import AdminListRow from "../../components/admin/AdminListRow";
import DeleteButton from "../../components/admin/DeleteButton";

const empty = { title: "", description: "", audience: "", dayLabel: "Day" };

const PRESETS = [
  { label: "21 days", value: 21 },
  { label: "30 days", value: 30 },
  { label: "45 days", value: 45 },
  { label: "60 days", value: 60 },
  { label: "3 months", value: 90 },
  { label: "6 months", value: 180 },
];

export default function AdminJourneysScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [totalDays, setTotalDays] = useState("30");
  const [customSelected, setCustomSelected] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: journeys, isLoading } = useQuery({
    queryKey: ["admin-journeys"],
    queryFn: () => api("/api/journeys"),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-journeys"] });
    queryClient.invalidateQueries({ queryKey: ["journeys"] });
    queryClient.invalidateQueries({ queryKey: ["journey-today"] });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setTotalDays("30");
    setCustomSelected(false);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      audience: item.audience || "",
      dayLabel: item.dayLabel || "Day",
    });
    setTotalDays(String(item.totalDays));
    setCustomSelected(!PRESETS.some((p) => p.value === item.totalDays));
    setModalVisible(true);
  };

  const save = async () => {
    const days = parseInt(totalDays, 10);
    if (!form.title.trim() || !days || days < 1) return;
    setSaving(true);
    try {
      const body = { ...form, dayLabel: form.dayLabel.trim() || "Day", totalDays: days };
      if (editing) {
        await api(`/api/journeys/${editing.id}`, { method: "PATCH", body });
      } else {
        await api("/api/journeys", { method: "POST", body });
      }
      setModalVisible(false);
      refresh();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = (item) => {
    Alert.alert("Delete journey", "This removes the journey and its day assignments. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/journeys/${item.id}`, { method: "DELETE" });
            setModalVisible(false);
            refresh();
          } catch (e) {
            Alert.alert("Couldn't delete", e.message);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <AdminHeader title="Journeys" onBack={() => navigation.goBack()} rightLabel="+" onRightPress={openCreate} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={journeys}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.title}
              subtitle={`"${item.dayLabel || "Day"} 1 of ${item.totalDays}" · ${item.daysConfigured || 0} days configured`}
              onPress={() => openEdit(item)}
              onDelete={() => remove(item)}
              right={
                <Pressable
                  onPress={() => navigation.navigate("AdminJourneyDays", { journey: item })}
                  hitSlop={8}
                  style={{ padding: 6, marginRight: 2 }}
                >
                  <Ionicons name="map-outline" size={18} color={colors.textSecondary} />
                </Pressable>
              }
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              No journeys yet. Tap + to add one.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing ? "Edit Journey" : "New Journey"} onBack={() => setModalVisible(false)} />
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <FormField label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
            <FormField
              label="Description"
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              multiline
            />
            <FormField
              label="Who is this journey for? (optional)"
              value={form.audience}
              onChangeText={(v) => setForm({ ...form, audience: v })}
              placeholder="e.g. People recovering from a recent breakup"
            />
            <FormField
              label="Day label"
              value={form.dayLabel}
              onChangeText={(v) => setForm({ ...form, dayLabel: v })}
              placeholder="e.g. Day or No Contact Day"
            />
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: -12, marginBottom: 16 }}>
              Shown on Home as "{form.dayLabel || "Day"} 1 of {totalDays || "…"}"
            </Text>

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
              Length
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12, marginHorizontal: -4 }}>
              {PRESETS.map((preset) => {
                const active = !customSelected && totalDays === String(preset.value);
                return (
                  <View key={preset.value} style={{ width: "33.33%", padding: 4 }}>
                    <Pressable
                      onPress={() => {
                        setTotalDays(String(preset.value));
                        setCustomSelected(false);
                      }}
                      style={{
                        borderWidth: active ? 0 : 1,
                        borderColor: colors.border,
                        backgroundColor: active ? colors.accent : "transparent",
                        borderRadius: 12,
                        paddingVertical: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: active ? colors.accentText : colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                        {preset.label}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
              <View style={{ width: "33.33%", padding: 4 }}>
                <Pressable
                  onPress={() => setCustomSelected(true)}
                  style={{
                    borderWidth: customSelected ? 0 : 1,
                    borderColor: colors.border,
                    backgroundColor: customSelected ? colors.accent : "transparent",
                    borderRadius: 12,
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: customSelected ? colors.accentText : colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                    Custom
                  </Text>
                </Pressable>
              </View>
            </View>

            {customSelected && (
              <FormField
                label="Custom number of days"
                value={totalDays}
                onChangeText={setTotalDays}
                placeholder="e.g. 40"
                keyboardType="numeric"
              />
            )}

            <Pressable
              onPress={save}
              disabled={saving || !form.title.trim() || !totalDays}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: 8,
                backgroundColor: saving || !form.title.trim() || !totalDays ? colors.surfaceAlt : colors.accent,
              }}
            >
              <Text
                style={{
                  color: saving || !form.title.trim() || !totalDays ? colors.textMuted : colors.accentText,
                  fontWeight: "600",
                }}
              >
                {saving ? "Saving..." : editing ? "Save" : "Create"}
              </Text>
            </Pressable>

            {editing && <DeleteButton onPress={() => remove(editing)} />}
          </View>
        </Screen>
      </Modal>
    </Screen>
  );
}
