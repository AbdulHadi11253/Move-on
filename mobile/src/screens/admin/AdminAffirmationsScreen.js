import { useState } from "react";
import { View, Text, Pressable, Image, FlatList, Modal, Switch, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { pickAndUploadImage } from "../../lib/adminImageUpload";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminListRow from "../../components/admin/AdminListRow";
import FormField from "../../components/admin/FormField";
import PillToggle from "../../components/ui/PillToggle";

const emptyMessage = { title: "", body: "", imageUrl: "" };

function MessagesTab() {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyMessage);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-affirmation-messages"],
    queryFn: () => api("/api/admin/affirmations/messages"),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-affirmation-messages"] });

  const openCreate = () => {
    setEditing("new");
    setForm(emptyMessage);
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, body: item.body, imageUrl: item.imageUrl || "" });
  };

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      if (editing === "new") await api("/api/admin/affirmations/messages", { method: "POST", body: form });
      else await api(`/api/admin/affirmations/messages/${editing.id}`, { method: "PATCH", body: form });
      setEditing(null);
      refresh();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (item) => {
    try {
      await api(`/api/admin/affirmations/messages/${item.id}`, { method: "PATCH", body: { isEnabled: !item.isEnabled } });
      refresh();
    } catch (e) {
      Alert.alert("Couldn't update", e.message);
    }
  };

  const remove = (item) => {
    Alert.alert("Delete message", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/admin/affirmations/messages/${item.id}`, { method: "DELETE" });
            refresh();
          } catch (e) {
            Alert.alert("Couldn't delete", e.message);
          }
        },
      },
    ]);
  };

  return (
    <>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1, marginRight: 12 }}>
          Sent at each scheduled time, one at a time in rotation. Toggle one off to pause it.
        </Text>
        <Pressable onPress={openCreate} hitSlop={10}>
          <Ionicons name="add-circle" size={28} color={colors.accent} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.title}
              subtitle={item.body}
              onPress={() => openEdit(item)}
              onDelete={() => remove(item)}
              right={
                <Pressable onPress={() => toggleEnabled(item)} hitSlop={10} style={{ padding: 6, marginRight: 2 }}>
                  <Ionicons name={item.isEnabled ? "toggle" : "toggle-outline"} size={26} color={item.isEnabled ? colors.accent : colors.textMuted} />
                </Pressable>
              }
            />
          )}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>No affirmations yet. Tap + to add one.</Text>}
        />
      )}

      <Modal visible={!!editing} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing === "new" ? "New Affirmation" : "Edit Affirmation"} onBack={() => setEditing(null)} />
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <FormField label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
            <FormField label="Message" value={form.body} onChangeText={(v) => setForm({ ...form, body: v })} multiline />

            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8 }}>
              Image (optional)
            </Text>
            {form.imageUrl ? (
              <View style={{ marginBottom: 16 }}>
                <Image source={{ uri: form.imageUrl }} style={{ width: 96, height: 96, borderRadius: 12, marginBottom: 8 }} />
                <Pressable onPress={() => setForm({ ...form, imageUrl: "" })}>
                  <Text style={{ color: colors.danger, fontWeight: "600", fontSize: 13 }}>Remove image</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                disabled={uploading}
                onPress={async () => {
                  setUploading(true);
                  try {
                    const url = await pickAndUploadImage(api);
                    if (url) setForm((f) => ({ ...f, imageUrl: url }));
                  } catch (e) {
                    Alert.alert("Couldn't upload image", e.message);
                  } finally {
                    setUploading(false);
                  }
                }}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 16 }}
              >
                <Text style={{ color: colors.accent, fontWeight: "600" }}>{uploading ? "Uploading..." : "Add image"}</Text>
              </Pressable>
            )}

            <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 16, lineHeight: 17 }}>
              Note: images show automatically on Android. On iOS this needs an extra native setup that hasn't been added
              yet, so iPhone users will see the text only for now.
            </Text>

            <Pressable
              onPress={save}
              disabled={saving || !form.title.trim() || !form.body.trim()}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: 8,
                backgroundColor: saving || !form.title.trim() || !form.body.trim() ? colors.surfaceAlt : colors.accent,
              }}
            >
              <Text style={{ color: saving ? colors.textMuted : colors.accentText, fontWeight: "600" }}>{saving ? "Saving..." : "Save"}</Text>
            </Pressable>
          </View>
        </Screen>
      </Modal>
    </>
  );
}

function ScheduleTab() {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [time, setTime] = useState("09:00");
  const [saving, setSaving] = useState(false);

  const { data: slots, isLoading } = useQuery({
    queryKey: ["admin-affirmation-schedule"],
    queryFn: () => api("/api/admin/affirmations/schedule"),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-affirmation-schedule"] });

  const add = async () => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      Alert.alert("Invalid time", "Use 24-hour HH:MM, e.g. 09:00 or 20:30.");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/affirmations/schedule", { method: "POST", body: { time } });
      setAdding(false);
      setTime("09:00");
      refresh();
    } catch (e) {
      Alert.alert("Couldn't add", e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (item) => {
    try {
      await api(`/api/admin/affirmations/schedule/${item.id}`, { method: "PATCH", body: { isEnabled: !item.isEnabled } });
      refresh();
    } catch (e) {
      Alert.alert("Couldn't update", e.message);
    }
  };

  const remove = (item) => {
    Alert.alert("Remove time", "Users subscribed to this time will stop receiving it.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/admin/affirmations/schedule/${item.id}`, { method: "DELETE" });
            refresh();
          } catch (e) {
            Alert.alert("Couldn't remove", e.message);
          }
        },
      },
    ]);
  };

  return (
    <>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 12 }}>
          Users pick which of these daily times they want on their own device — how many they pick is how many they
          get per day. Times are server time (UTC).
        </Text>
        {adding ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <FormField label="Time (HH:MM, 24h)" value={time} onChangeText={setTime} placeholder="09:00" />
            </View>
            <Pressable onPress={add} disabled={saving} style={{ padding: 10 }}>
              <Ionicons name="checkmark-circle" size={28} color={colors.accent} />
            </Pressable>
            <Pressable onPress={() => setAdding(false)} style={{ padding: 10 }}>
              <Ionicons name="close-circle" size={28} color={colors.textMuted} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setAdding(true)} style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
            <Text style={{ color: colors.accent, fontWeight: "600", marginLeft: 6 }}>Add a time</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.time}
              onDelete={() => remove(item)}
              right={
                <Pressable onPress={() => toggleEnabled(item)} hitSlop={10} style={{ padding: 6, marginRight: 2 }}>
                  <Ionicons name={item.isEnabled ? "toggle" : "toggle-outline"} size={26} color={item.isEnabled ? colors.accent : colors.textMuted} />
                </Pressable>
              }
            />
          )}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>No times yet.</Text>}
        />
      )}
    </>
  );
}

export default function AdminAffirmationsScreen({ navigation }) {
  const [tab, setTab] = useState("messages");
  return (
    <Screen>
      <AdminHeader title="Daily Affirmations" onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 24, marginBottom: 8 }}>
        <PillToggle
          options={[
            { value: "messages", label: "Messages" },
            { value: "schedule", label: "Schedule" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>
      {tab === "messages" ? <MessagesTab /> : <ScheduleTab />}
    </Screen>
  );
}
