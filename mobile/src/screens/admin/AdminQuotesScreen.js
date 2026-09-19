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

const empty = { text: "", author: "", category: "" };

export default function AdminQuotesScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: () => api("/api/quotes"),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ text: item.text, author: item.author || "", category: item.category || "" });
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.text.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api(`/api/quotes/${editing.id}`, { method: "PATCH", body: form });
      } else {
        await api("/api/quotes", { method: "POST", body: form });
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
    Alert.alert("Delete quote", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/quotes/${item.id}`, { method: "DELETE" });
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
      <AdminHeader title="Quotes" onBack={() => navigation.goBack()} rightLabel="+" onRightPress={openCreate} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={`"${item.text}"`}
              subtitle={item.author || "Unknown"}
              numberOfLinesTitle={2}
              onPress={() => openEdit(item)}
              onDelete={() => remove(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              No quotes yet. Tap + to add one.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing ? "Edit Quote" : "New Quote"} onBack={() => setModalVisible(false)} />
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <FormField label="Quote text" value={form.text} onChangeText={(v) => setForm({ ...form, text: v })} multiline />
            <FormField label="Author (optional)" value={form.author} onChangeText={(v) => setForm({ ...form, author: v })} />
            <FormField label="Category (optional)" value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} />

            <Pressable
              onPress={save}
              disabled={saving || !form.text.trim()}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: 8,
                backgroundColor: saving || !form.text.trim() ? colors.surfaceAlt : colors.accent,
              }}
            >
              <Text style={{ color: saving || !form.text.trim() ? colors.textMuted : colors.accentText, fontWeight: "600" }}>
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
