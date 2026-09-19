import { View, Text, Pressable, Switch, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { clearStartedToday } from "../../lib/recoveryFlag";
import { usePullRefresh } from "../../lib/usePullRefresh";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";
import ThemedRefreshControl from "../../components/ui/ThemedRefreshControl";

export default function ProfileScreen({ navigation }) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const api = useApi();
  const queryClient = useQueryClient();
  const { colors, themeKey, setTheme, themes } = useTheme();
  const [reminderOn, setReminderOn] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api("/api/users/me") });
  const { refreshing, onRefresh } = usePullRefresh([["me"]]);

  const confirmResetProgress = () => {
    Alert.alert(
      "Reset your progress?",
      "This can't be reversed. Your day will go back to Day 1, your streak resets to 0, and all completed tasks will be cleared — you'll start the journey fresh from 0%.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset progress",
          style: "destructive",
          onPress: async () => {
            setResetting(true);
            try {
              await api("/api/journeys/reset-progress", { method: "POST" });
              await clearStartedToday();
              queryClient.invalidateQueries({ queryKey: ["journey-today"] });
              queryClient.invalidateQueries({ queryKey: ["progress"] });
            } catch (e) {
              Alert.alert("Couldn't reset progress", e.message);
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete your account?",
      "This permanently deletes your account and all of your data — journeys, progress, saved posts, and settings. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await api("/api/users/me", { method: "DELETE" });
              // Data is gone server-side; sign out to clear the local session.
              await signOut();
            } catch (e) {
              setDeleting(false);
              Alert.alert("Couldn't delete account", e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}
        refreshControl={<ThemedRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 22, fontWeight: "700" }}>
              {(user?.firstName || user?.primaryEmailAddress?.emailAddress || "?")[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}>
              {user?.fullName || "Your account"}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        <Card style={{ marginBottom: 16 }} padded={false}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 10 }}>Daily reminder</Text>
            </View>
            <Switch
              value={reminderOn}
              onValueChange={setReminderOn}
              trackColor={{ false: colors.surfaceAlt, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 10 }}>Subscription</Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{me?.subscription?.status || "None"}</Text>
          </View>
        </Card>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.6,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Appearance
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20, marginHorizontal: -4 }}>
          {themes.map((t) => {
            const active = t.key === themeKey;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTheme(t.key)}
                style={{
                  width: "50%",
                  padding: 4,
                }}
              >
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? colors.accent : colors.border,
                    overflow: "hidden",
                    backgroundColor: t.colors.background,
                  }}
                >
                  <View style={{ flexDirection: "row", padding: 12, alignItems: "center" }}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: t.colors.accent,
                        marginRight: 8,
                      }}
                    />
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: t.colors.surface,
                        borderWidth: 1,
                        borderColor: t.colors.border,
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ color: t.colors.textPrimary, fontSize: 13, fontWeight: "600" }}>{t.name}</Text>
                  </View>
                  {active && (
                    <View style={{ position: "absolute", top: 8, right: 8 }}>
                      <Ionicons name="checkmark-circle" size={16} color={t.colors.accent} />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {me?.role === "ADMIN" && (
          <Pressable onPress={() => navigation.navigate("Admin")}>
            <Card style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
                <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 10, fontWeight: "500" }}>
                  Admin Mode
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Card>
          </Pressable>
        )}

        <Pressable onPress={confirmResetProgress} disabled={resetting}>
          <Card
            style={{
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: resetting ? 0.6 : 1,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="refresh-outline" size={18} color={colors.danger} />
              <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 10, fontWeight: "500" }}>
                Reset Progress
              </Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{resetting ? "Resetting..." : "Can't undo"}</Text>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => signOut()}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Text style={{ color: colors.danger, fontWeight: "600" }}>Log out</Text>
        </Pressable>

        <Pressable
          onPress={confirmDeleteAccount}
          disabled={deleting}
          style={{ paddingVertical: 16, alignItems: "center", marginTop: 4, opacity: deleting ? 0.6 : 1 }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600" }}>
            {deleting ? "Deleting account..." : "Delete account"}
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
