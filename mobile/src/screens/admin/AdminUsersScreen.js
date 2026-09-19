import { View, Text, Pressable, FlatList, ActivityIndicator, Alert } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";

export default function AdminUsersScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api("/api/admin/users"),
  });

  const toggleRole = (user) => {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    Alert.alert(
      nextRole === "ADMIN" ? "Make admin?" : "Remove admin?",
      `${user.email} will become ${nextRole === "ADMIN" ? "an admin" : "a regular user"}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            await api("/api/admin/users", { method: "PATCH", body: { userId: user.id, role: nextRole } });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <AdminHeader title="Users" onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 15 }}>{item.name || item.email}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{item.email}</Text>
                </View>
                <Pressable
                  onPress={() => toggleRole(item)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: item.role === "ADMIN" ? colors.accent : colors.surfaceAlt,
                  }}
                >
                  <Text
                    style={{
                      color: item.role === "ADMIN" ? colors.accentText : colors.textSecondary,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {item.role}
                  </Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginRight: 16 }}>
                  {item.onboardingComplete ? "Onboarded" : "In onboarding"}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginRight: 16 }}>
                  Sub: {item.subscription?.status || "None"}
                </Text>
                {item.journeyEnrollments?.[0] && (
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    {item.journeyEnrollments[0].journey.title} · Day {item.journeyEnrollments[0].currentDay} ·{" "}
                    {item.journeyEnrollments[0].streak}🔥
                  </Text>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>No users yet.</Text>
          }
        />
      )}
    </Screen>
  );
}
