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

const TYPES = [
  { value: "single_choice", label: "Single choice" },
  { value: "multi_choice", label: "Multi choice" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
];

const empty = { question: "", type: "single_choice", options: [""], batch: "1" };

export default function AdminOnboardingQuestionsScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data: questions, isLoading } = useQuery({
    queryKey: ["admin-onboarding-questions"],
    queryFn: () => api("/api/admin/onboarding-questions"),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-onboarding-questions"] });
    queryClient.invalidateQueries({ queryKey: ["onboarding-questions"] });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      question: item.question,
      type: item.type,
      options: item.options && item.options.length ? item.options : [""],
      batch: String(item.batch || 1),
    });
    setModalVisible(true);
  };

  const isChoiceType = form.type === "single_choice" || form.type === "multi_choice";

  const setOption = (index, value) => {
    const next = [...form.options];
    next[index] = value;
    setForm({ ...form, options: next });
  };

  const addOption = () => setForm({ ...form, options: [...form.options, ""] });

  const removeOption = (index) => {
    const next = form.options.filter((_, i) => i !== index);
    setForm({ ...form, options: next.length ? next : [""] });
  };

  const save = async () => {
    if (!form.question.trim()) return;
    setSaving(true);
    try {
      const body = {
        question: form.question.trim(),
        type: form.type,
        batch: Math.max(1, parseInt(form.batch, 10) || 1),
        options: isChoiceType ? form.options.map((o) => o.trim()).filter(Boolean) : null,
      };
      if (editing) {
        await api(`/api/admin/onboarding-questions/${editing.id}`, { method: "PATCH", body });
      } else {
        await api("/api/admin/onboarding-questions", { method: "POST", body });
      }
      setModalVisible(false);
      refresh();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (item) => {
    try {
      await api(`/api/admin/onboarding-questions/${item.id}`, { method: "PATCH", body: { isEnabled: !item.isEnabled } });
      refresh();
    } catch (e) {
      Alert.alert("Couldn't update", e.message);
    }
  };

  const remove = (item) => {
    Alert.alert(
      "Delete question",
      "This removes the question and any answers users already gave for it. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/api/admin/onboarding-questions/${item.id}`, { method: "DELETE" });
              setModalVisible(false);
              refresh();
            } catch (e) {
              Alert.alert("Couldn't delete", e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <AdminHeader title="Onboarding Questions" onBack={() => navigation.goBack()} rightLabel="+" onRightPress={openCreate} />
      <Text style={{ color: colors.textMuted, fontSize: 13, paddingHorizontal: 24, marginTop: -8, marginBottom: 8 }}>
        Questions appear before sign-up, grouped by batch (Batch 1 first). Toggle one off to skip it without deleting it.
      </Text>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={`${item.order}. ${item.question}`}
              subtitle={`Batch ${item.batch || 1} · ${TYPES.find((t) => t.value === item.type)?.label}`}
              onPress={() => openEdit(item)}
              onDelete={() => remove(item)}
              right={
                <Pressable onPress={() => toggleEnabled(item)} hitSlop={10} style={{ padding: 6, marginRight: 2 }}>
                  <Ionicons
                    name={item.isEnabled ? "toggle" : "toggle-outline"}
                    size={26}
                    color={item.isEnabled ? colors.accent : colors.textMuted}
                  />
                </Pressable>
              }
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              No onboarding questions yet. Tap + to add one.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing ? "Edit Question" : "New Question"} onBack={() => setModalVisible(false)} />
          <FlatList
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
            data={[]}
            renderItem={null}
            ListHeaderComponent={
              <>
                <FormField
                  label="Question"
                  value={form.question}
                  onChangeText={(v) => setForm({ ...form, question: v })}
                  multiline
                />

                <FormField
                  label="Batch (1 = shown first, 2 = next part, ...)"
                  value={form.batch}
                  onChangeText={(v) => setForm({ ...form, batch: v.replace(/[^0-9]/g, "") })}
                  keyboardType="number-pad"
                  placeholder="1"
                />

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
                  Answer type
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16, marginHorizontal: -4 }}>
                  {TYPES.map((t) => {
                    const active = form.type === t.value;
                    return (
                      <View key={t.value} style={{ width: "50%", padding: 4 }}>
                        <Pressable
                          onPress={() => setForm({ ...form, type: t.value })}
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
                            {t.label}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>

                {isChoiceType && (
                  <View style={{ marginBottom: 8 }}>
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
                      Options
                    </Text>
                    {form.options.map((opt, i) => (
                      <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <FormField label="" value={opt} onChangeText={(v) => setOption(i, v)} placeholder={`Option ${i + 1}`} />
                        </View>
                        <Pressable onPress={() => removeOption(i)} hitSlop={10} style={{ padding: 6 }}>
                          <Ionicons name="close-circle" size={22} color={colors.danger} />
                        </Pressable>
                      </View>
                    ))}
                    <Pressable onPress={addOption} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                      <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                      <Text style={{ color: colors.accent, fontWeight: "600", marginLeft: 6 }}>Add option</Text>
                    </Pressable>
                  </View>
                )}

                <Pressable
                  onPress={save}
                  disabled={saving || !form.question.trim()}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: "center",
                    marginTop: 8,
                    backgroundColor: saving || !form.question.trim() ? colors.surfaceAlt : colors.accent,
                  }}
                >
                  <Text style={{ color: saving || !form.question.trim() ? colors.textMuted : colors.accentText, fontWeight: "600" }}>
                    {saving ? "Saving..." : "Save"}
                  </Text>
                </Pressable>

                {editing && <DeleteButton onPress={() => remove(editing)} />}
              </>
            }
          />
        </Screen>
      </Modal>
    </Screen>
  );
}
