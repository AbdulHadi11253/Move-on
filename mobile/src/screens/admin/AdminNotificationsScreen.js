import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import FormField from "../../components/admin/FormField";

export default function AdminNotificationsScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      const result = await api("/api/admin/notifications/send", { method: "POST", body: { title, body } });
      Alert.alert("Sent", `Notification sent to ${result.sent} device(s).`);
      setTitle("");
      setBody("");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen>
      <AdminHeader title="Notifications" onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <Text style={{ color: colors.textMuted, marginBottom: 24, lineHeight: 20 }}>
          Sends a one-time push notification to every user with a registered device.
        </Text>

        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Keep going" />
        <FormField label="Message" value={body} onChangeText={setBody} placeholder="Your daily reminder is ready" multiline />

        <Pressable
          onPress={send}
          disabled={sending || !title.trim() || !body.trim()}
          style={{
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 8,
            backgroundColor: sending || !title.trim() || !body.trim() ? colors.surfaceAlt : colors.accent,
          }}
        >
          <Text
            style={{
              color: sending || !title.trim() || !body.trim() ? colors.textMuted : colors.accentText,
              fontWeight: "600",
            }}
          >
            {sending ? "Sending..." : "Send to all users"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
