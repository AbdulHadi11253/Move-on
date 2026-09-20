import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../lib/useApi";
import { loadPackages, purchase, restore } from "../lib/purchases";
import { useTheme } from "../theme/ThemeContext";
import Screen from "../components/ui/Screen";

const BENEFITS = [
  "Daily guided recovery journeys",
  "Unlimited quotes and image posts",
  "Daily reminders and progress tracking",
];

// Both plans include a 3-day free trial (configured on the store products);
// the card is charged automatically when the trial ends unless cancelled.
const PLANS = {
  weekly: { title: "Weekly", fallbackPrice: "$2.99", period: "week" },
  monthly: { title: "Monthly", fallbackPrice: "$9.99", period: "month", badge: "BEST VALUE" },
};

export default function PaywallScreen({ navigation, onSubscribed }) {
  const { colors } = useTheme();
  const api = useApi();
  const { signOut } = useAuth();
  const [packages, setPackages] = useState({ weekly: null, monthly: null });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("monthly");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadPackages()
      .then(setPackages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const finish = async () => {
    const sub = await api("/api/subscription/sync", { method: "POST" });
    if (sub.status === "TRIAL" || sub.status === "ACTIVE") onSubscribed(sub);
    else Alert.alert("Not active yet", "We couldn't confirm your subscription yet. Please try Restore in a moment.");
  };

  const start = async () => {
    const pkg = packages[selected];
    if (!pkg) {
      Alert.alert("Unavailable", "This plan isn't available right now. Please try again later.");
      return;
    }
    setBusy(true);
    try {
      if (await purchase(pkg)) await finish();
    } catch (e) {
      Alert.alert("Purchase failed", e.message || "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async () => {
    setBusy(true);
    try {
      await restore();
      await finish();
    } catch (e) {
      Alert.alert("Restore failed", e.message || "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const price = (key) => packages[key]?.product?.priceString || PLANS[key].fallbackPrice;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", marginTop: 16, marginBottom: 24 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="sparkles" size={28} color={colors.accent} />
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700", textAlign: "center" }}>
            Start your 3-day free trial
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: "center", marginTop: 8 }}>
            Full access to everything in Move On. Cancel anytime.
          </Text>
        </View>

        <View style={{ marginBottom: 24 }}>
          {BENEFITS.map((b) => (
            <View key={b} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <Text style={{ color: colors.textPrimary, fontSize: 15, marginLeft: 10 }}>{b}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />
        ) : (
          ["monthly", "weekly"].map((key) => {
            const active = selected === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSelected(key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 2,
                  borderColor: active ? colors.accent : colors.border,
                  backgroundColor: colors.surface,
                  borderRadius: 18,
                  padding: 18,
                  marginBottom: 12,
                }}
              >
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "700" }}>{PLANS[key].title}</Text>
                    {PLANS[key].badge && (
                      <View style={{ backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
                        <Text style={{ color: colors.accentText, fontSize: 10, fontWeight: "700" }}>{PLANS[key].badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                    3 days free, then {price(key)} / {PLANS[key].period}
                  </Text>
                </View>
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={active ? colors.accent : colors.textMuted}
                />
              </Pressable>
            );
          })
        )}

        <Pressable
          onPress={start}
          disabled={busy || loading}
          style={{
            backgroundColor: busy || loading ? colors.surfaceAlt : colors.accent,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Text style={{ color: busy || loading ? colors.textMuted : colors.accentText, fontSize: 16, fontWeight: "700" }}>
            {busy ? "Please wait..." : "Start free trial"}
          </Text>
        </Pressable>

        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 14, lineHeight: 18 }}>
          Your card is charged automatically after the 3-day trial ends unless you cancel at least 24 hours before it does.
          Manage or cancel anytime in your App Store / Google Play subscription settings.
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 18 }}>
          <Pressable onPress={doRestore} hitSlop={8}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Restore purchases</Text>
          </Pressable>
          <Text style={{ color: colors.textMuted, marginHorizontal: 10 }}>|</Text>
          <Pressable onPress={() => navigation.navigate("Terms")} hitSlop={8}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Terms</Text>
          </Pressable>
          <Text style={{ color: colors.textMuted, marginHorizontal: 10 }}>|</Text>
          <Pressable onPress={() => navigation.navigate("PrivacyPolicy")} hitSlop={8}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Privacy</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => signOut()} hitSlop={8} style={{ marginTop: 22, alignItems: "center" }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
