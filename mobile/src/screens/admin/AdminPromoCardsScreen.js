import { useState } from "react";
import { View, Text, Pressable, FlatList, Modal, Alert, ActivityIndicator, Switch } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import FormField from "../../components/admin/FormField";
import AdminListRow from "../../components/admin/AdminListRow";
import DeleteButton from "../../components/admin/DeleteButton";

const empty = { title: "", subtitle: "", imageUrl: "", linkUrl: "", isActive: true };

export default function AdminPromoCardsScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data: cards, isLoading } = useQuery({
    queryKey: ["admin-promo-cards"],
    queryFn: () => api("/api/admin/promo-cards"),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-promo-cards"] });

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle || "",
      imageUrl: item.imageUrl || "",
      linkUrl: item.linkUrl || "",
      isActive: item.isActive !== false,
    });
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api(`/api/admin/promo-cards/${editing.id}`, { method: "PATCH", body: form });
      } else {
        await api("/api/admin/promo-cards", { method: "POST", body: form });
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
    Alert.alert("Delete promo card", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/admin/promo-cards/${item.id}`, { method: "DELETE" });
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
      <AdminHeader title="Promo Cards" onBack={() => navigation.goBack()} rightLabel="+" onRightPress={openCreate} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.title}
              subtitle={item.isActive === false ? "Hidden" : item.subtitle || "Shown on Home"}
              onPress={() => openEdit(item)}
              onDelete={() => remove(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              No promo cards yet. Tap + to add one.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing ? "Edit Card" : "New Card"} onBack={() => setModalVisible(false)} />
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <FormField label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
            <FormField label="Subtitle (optional)" value={form.subtitle} onChangeText={(v) => setForm({ ...form, subtitle: v })} />
            <FormField label="Image URL (optional)" value={form.imageUrl} onChangeText={(v) => setForm({ ...form, imageUrl: v })} />
            <FormField label="Link URL (optional)" value={form.linkUrl} onChangeText={(v) => setForm({ ...form, linkUrl: v })} />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "600" }}>Show on Home</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  When off, this card is hidden from users.
                </Text>
              </View>
              <Switch
                value={form.isActive}
                onValueChange={(v) => setForm({ ...form, isActive: v })}
                trackColor={{ false: colors.surfaceAlt, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

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
