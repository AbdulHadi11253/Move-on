import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";

// User's own picks from the admin-defined daily affirmation times. However
// many they select is however many they get per day.
export default function AffirmationSettingsScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const [slots, setSlots] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api("/api/affirmations/schedule")
      .then(setSlots)
      .catch(() => setSlots([]));
  };
  useEffect(load, []);

  const toggle = async (slot) => {
    const next = slots.map((s) => (s.id === slot.id ? { ...s, subscribed: !s.subscribed } : s));
    setSlots(next);
    setSaving(true);
    try {
      await api("/api/affirmations/schedule", {
        method: "PUT",
        body: { scheduleIds: next.filter((s) => s.subscribed).map((s) => s.id) },
      });
    } catch (e) {
      setSlots(slots); // revert on failure
      Alert.alert("Couldn't save", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <AdminHeader title="Daily Affirmations" onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
          Pick the times you'd like to receive an encouraging message. Choose as many or as few as you want.
        </Text>

        {slots === null ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : slots.length === 0 ? (
          <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 20 }}>
            No affirmation times are set up yet — check back later.
          </Text>
        ) : (
          slots.map((slot) => (
            <Pressable
              key={slot.id}
              onPress={() => toggle(slot)}
              disabled={saving}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: slot.subscribed ? colors.accent : colors.border,
                backgroundColor: slot.subscribed ? colors.accentSoft : colors.surface,
                borderRadius: 14,
                paddingHorizontal: 18,
                paddingVertical: 14,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>{slot.time}</Text>
              <Ionicons
                name={slot.subscribed ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={slot.subscribed ? colors.accent : colors.textMuted}
              />
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}
