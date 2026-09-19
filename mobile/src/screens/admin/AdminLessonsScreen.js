import { useState } from "react";
import { View, Text, Pressable, FlatList, Modal, Alert, ActivityIndicator } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import FormField from "../../components/admin/FormField";
import AdminListRow from "../../components/admin/AdminListRow";
import DeleteButton from "../../components/admin/DeleteButton";

const empty = { title: "", content: "", category: "", readMinutes: "" };

export default function AdminLessonsScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: () => api("/api/lessons"),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      category: item.category || "",
      readMinutes: item.readMinutes ? String(item.readMinutes) : "",
    });
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const body = {
        title: form.title,
        content: form.content,
        category: form.category,
        readMinutes: form.readMinutes ? parseInt(form.readMinutes, 10) : null,
      };
      if (editing) {
        await api(`/api/lessons/${editing.id}`, { method: "PATCH", body });
      } else {
        await api("/api/lessons", { method: "POST", body });
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
    Alert.alert("Delete lesson", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/lessons/${item.id}`, { method: "DELETE" });
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
      <AdminHeader title="Lessons" onBack={() => navigation.goBack()} rightLabel="+" onRightPress={openCreate} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.title}
              subtitle={`${item.category || "General"}${item.readMinutes ? ` · ${item.readMinutes} min read` : ""}`}
              onPress={() => openEdit(item)}
              onDelete={() => remove(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              No lessons yet. Tap + to add one.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing ? "Edit Lesson" : "New Lesson"} onBack={() => setModalVisible(false)} />
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <FormField label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
            <FormField
              label="Content"
              value={form.content}
              onChangeText={(v) => setForm({ ...form, content: v })}
              multiline
            />
            <FormField label="Category (optional)" value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} />
            <FormField
              label="Read minutes (optional)"
              value={form.readMinutes}
              onChangeText={(v) => setForm({ ...form, readMinutes: v })}
              keyboardType="numeric"
            />

            <Pressable
              onPress={save}
              disabled={saving || !form.title.trim() || !form.content.trim()}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: 8,
                backgroundColor:
                  saving || !form.title.trim() || !form.content.trim() ? colors.surfaceAlt : colors.accent,
              }}
            >
              <Text
                style={{
                  color: saving || !form.title.trim() || !form.content.trim() ? colors.textMuted : colors.accentText,
                  fontWeight: "600",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </Text>
            </Pressable>

            {editing && <DeleteButton onPress={() => remove(editing)} />}
          </View>
        </Screen>
      </Modal>
    </Screen>
  );
}
