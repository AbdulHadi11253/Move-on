import { useState } from "react";
import { View, Text, Pressable, FlatList, Modal, Switch, Alert, ActivityIndicator } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import FormField from "../../components/admin/FormField";

export default function AdminContentScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", subtitle: "", buttonLabel: "" });
  const [saving, setSaving] = useState(false);

  const { data: blocks, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: () => api("/api/content"),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    queryClient.invalidateQueries({ queryKey: ["app-content"] });
  };

  const toggleEnabled = async (block) => {
    try {
      await api(`/api/content/${block.id}`, { method: "PATCH", body: { isEnabled: !block.isEnabled } });
      refresh();
    } catch (e) {
      Alert.alert("Couldn't update", e.message);
    }
  };

  const openEdit = (block) => {
    setEditing(block);
    setForm({
      title: block.title || "",
      subtitle: block.subtitle || "",
      buttonLabel: block.buttonLabel || "",
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api(`/api/content/${editing.id}`, { method: "PATCH", body: form });
      setEditing(null);
      refresh();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <AdminHeader title="App Content" onBack={() => navigation.goBack()} />
      <Text style={{ color: colors.textMuted, fontSize: 13, paddingHorizontal: 24, marginTop: -8, marginBottom: 8 }}>
        Edit the text on these prompt screens, or hide them entirely.
      </Text>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={blocks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Pressable onPress={() => openEdit(item)} style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "500" }}>{item.label}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {item.title || item.subtitle || "Tap to edit text"}
                  </Text>
                </Pressable>
                <Switch
                  value={item.isEnabled}
                  onValueChange={() => toggleEnabled(item)}
                  trackColor={{ false: colors.surfaceAlt, true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={!!editing} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing?.label} onBack={() => setEditing(null)} />
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <FormField label="Title (optional)" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
            <FormField
              label="Subtitle / message"
              value={form.subtitle}
              onChangeText={(v) => setForm({ ...form, subtitle: v })}
              multiline
            />
            <FormField
              label="Button label (optional)"
              value={form.buttonLabel}
              onChangeText={(v) => setForm({ ...form, buttonLabel: v })}
            />

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
                {saving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </Screen>
      </Modal>
    </Screen>
  );
}
