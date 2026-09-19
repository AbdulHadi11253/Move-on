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

const empty = { title: "", description: "", category: "" };

export default function AdminTasksScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: () => api("/api/tasks"),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description || "", category: item.category || "" });
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api(`/api/tasks/${editing.id}`, { method: "PATCH", body: form });
      } else {
        await api("/api/tasks", { method: "POST", body: form });
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
    Alert.alert("Delete task", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/tasks/${item.id}`, { method: "DELETE" });
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
      <AdminHeader title="Tasks" onBack={() => navigation.goBack()} rightLabel="+" onRightPress={openCreate} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.title}
              subtitle={item.category || null}
              onPress={() => openEdit(item)}
              onDelete={() => remove(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              No tasks yet. Tap + to add one.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing ? "Edit Task" : "New Task"} onBack={() => setModalVisible(false)} />
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <FormField label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
            <FormField
              label="Description (optional)"
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              multiline
            />
            <FormField label="Category (optional)" value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} />

            <Pressable
              onPress={save}
              disabled={saving || !form.title.trim()}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: 8,
                backgroundColor: saving || !form.title.trim() ? colors.surfaceAlt : colors.accent,
              }}
            >
              <Text style={{ color: saving || !form.title.trim() ? colors.textMuted : colors.accentText, fontWeight: "600" }}>
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
