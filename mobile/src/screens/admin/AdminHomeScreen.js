import { View, Text, Pressable, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import StatTile from "../../components/ui/StatTile";

const SECTIONS = [
  { key: "AdminQuotes", label: "Journey Quotes", desc: "Text quotes used inside journey days", icon: "sparkles-outline" },
  {
    key: "AdminQuotePosts",
    label: "Quote Images",
    desc: "Carousel & single-post image quotes",
    icon: "images-outline",
  },
  {
    key: "AdminQuoteCategories",
    label: "Quote Categories",
    desc: "Organize quote images by category",
    icon: "pricetags-outline",
  },
  { key: "AdminTasks", label: "Tasks", desc: "Daily habit tasks", icon: "checkbox-outline" },
  { key: "AdminLessons", label: "Lessons", desc: "Short lesson content", icon: "book-outline" },
  { key: "AdminJourneys", label: "Journeys", desc: "Flexible-length recovery programs", icon: "map-outline" },
  { key: "AdminUsers", label: "Users", desc: "Accounts & roles", icon: "people-outline" },
  { key: "AdminPromoCards", label: "Promo Cards", desc: "In-app promotions", icon: "megaphone-outline" },
  { key: "AdminNotifications", label: "Notifications", desc: "Send a push to everyone", icon: "notifications-outline" },
  { key: "AdminContent", label: "App Content", desc: "Edit prompt text & visibility", icon: "document-text-outline" },
  {
    key: "AdminOnboardingQuestions",
    label: "Onboarding Questions",
    desc: "Add, edit, disable, or delete questions",
    icon: "list-outline",
  },
];

export default function AdminHomeScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api("/api/admin/analytics"),
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700" }}>Admin</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 2 }}>Manage the Move On experience</Text>
          </View>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", paddingHorizontal: 20, marginBottom: 8 }}>
          <StatTile value={analytics?.totalUsers ?? "-"} label="Users" style={{ marginRight: 8 }} />
          <StatTile value={analytics?.onboardedUsers ?? "-"} label="Onboarded" style={{ marginHorizontal: 8 }} />
        </View>
        <View style={{ flexDirection: "row", paddingHorizontal: 20, marginBottom: 20 }}>
          <StatTile value={analytics?.activeTrials ?? "-"} label="Trials" style={{ marginRight: 8 }} />
          <StatTile value={analytics?.activeSubscriptions ?? "-"} label="Active subs" style={{ marginHorizontal: 8 }} />
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 0.6,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Manage
          </Text>
          {SECTIONS.map((section) => (
            <Pressable
              key={section.key}
              onPress={() => navigation.navigate(section.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                paddingVertical: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: colors.accentSoft,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name={section.icon} size={17} color={colors.accent} />
                </View>
                <View>
                  <Text style={{ color: colors.textPrimary, fontSize: 15 }}>{section.label}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>{section.desc}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
