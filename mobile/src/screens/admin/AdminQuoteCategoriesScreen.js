import { useState } from "react";
import { View, Text, Pressable, Modal, Alert, ActivityIndicator, FlatList } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import FormField from "../../components/admin/FormField";
import AdminListRow from "../../components/admin/AdminListRow";
import DeleteButton from "../../components/admin/DeleteButton";

const DISPLAY_MODES = [
  { key: "BOTH", label: "Both" },
  { key: "TEXT", label: "Text only" },
  { key: "IMAGE", label: "Image only" },
];
const DISPLAY_MODE_LABELS = Object.fromEntries(DISPLAY_MODES.map((m) => [m.key, m.label]));

export default function AdminQuoteCategoriesScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [displayMode, setDisplayMode] = useState("BOTH");
  const [saving, setSaving] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-quote-categories"],
    queryFn: () => api("/api/admin/quote-categories"),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-quote-categories"] });
    queryClient.invalidateQueries({ queryKey: ["quote-categories"] });
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDisplayMode("BOTH");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name);
    setDisplayMode(item.displayMode || "BOTH");
    setModalVisible(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api(`/api/admin/quote-categories/${editing.id}`, { method: "PATCH", body: { name, displayMode } });
      } else {
        await api("/api/admin/quote-categories", { method: "POST", body: { name, displayMode } });
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
    Alert.alert("Delete category", "Quotes in this category will become uncategorized. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/admin/quote-categories/${item.id}`, { method: "DELETE" });
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
      <AdminHeader title="Quote Categories" onBack={() => navigation.goBack()} rightLabel="+" onRightPress={openCreate} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.name}
              subtitle={`${item._count?.posts || 0} quote${item._count?.posts === 1 ? "" : "s"} · ${DISPLAY_MODE_LABELS[item.displayMode] || "Both"}`}
              onPress={() => openEdit(item)}
              onDelete={() => remove(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              No categories yet. Tap + to add one.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing ? "Edit Category" : "New Category"} onBack={() => setModalVisible(false)} />
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <FormField label="Name" value={name} onChangeText={setName} placeholder="e.g. Self Love" />

            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 8, marginTop: 4 }}>
              What shows in this category
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              {DISPLAY_MODES.map((m) => {
                const active = displayMode === m.key;
                return (
                  <Pressable
                    key={m.key}
                    onPress={() => setDisplayMode(m.key)}
                    style={{
                      flex: 1,
                      marginRight: m.key !== "IMAGE" ? 8 : 0,
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                      backgroundColor: active ? colors.accent : colors.surfaceAlt,
                    }}
                  >
                    <Text style={{ color: active ? colors.accentText : colors.textSecondary, fontSize: 13, fontWeight: "600" }}>
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={save}
              disabled={saving || !name.trim()}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: 8,
                backgroundColor: saving || !name.trim() ? colors.surfaceAlt : colors.accent,
              }}
            >
              <Text style={{ color: saving || !name.trim() ? colors.textMuted : colors.accentText, fontWeight: "600" }}>
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
