import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Alert, Linking, Platform } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../lib/useApi";
import { loadPackages, purchase, restore } from "../lib/purchases";
import { useTheme } from "../theme/ThemeContext";
import { resetAppState } from "../lib/resetAppState";
import { useContentBlock } from "../lib/useAppContent";
import Screen from "../components/ui/Screen";
import ContinueFreeButton from "../components/paywall/ContinueFreeButton";
import AnimatedPressable from "../components/ui/AnimatedPressable";

const BENEFITS = [
  "Daily guided recovery journeys",
  "Unlimited quotes and image posts",
  "Daily reminders and progress tracking",
];

// Both plans include a 3-day free trial (configured on the store products);
// the card is charged automatically when the trial ends unless cancelled.
// Prices are deliberately NOT hardcoded here: only the store's own localized
// priceString is ever shown, so what's displayed is always what would actually
// be charged (App Review requires real pricing, and a made-up fallback figure
// next to a purchase that then fails is worse than showing nothing).
const PLANS = {
  weekly: { title: "Weekly", period: "week" },
  monthly: { title: "Monthly", period: "month", badge: "BEST VALUE" },
};

const STORE_NAME = Platform.OS === "ios" ? "App Store" : "Google Play";

export default function PaywallScreen({ navigation, onSubscribed, blocking = false }) {
  const { colors } = useTheme();
  const api = useApi();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const freeTierContent = useContentBlock("free_tier_enabled");
  // Doesn't retroactively affect anyone who already opted into the free
  // tier before the admin switched this off — only hides the option going
  // forward for users who haven't chosen it yet.
  const freeTierEnabled = !freeTierContent || freeTierContent.isEnabled;
  const [packages, setPackages] = useState({ weekly: null, monthly: null });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("monthly");
  const [busy, setBusy] = useState(false);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  // Resolves to the freshly loaded packages (or null on failure) so callers
  // that need the result right now — "Start free trial" retrying a missing
  // plan — don't have to wait for a state update to re-render first.
  const load = useCallback(async () => {
    if (mountedRef.current) setLoading(true);
    try {
      const loaded = await loadPackages();
      if (mountedRef.current) setPackages(loaded);
      return loaded;
    } catch {
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const plansUnavailable = !loading && !packages.weekly && !packages.monthly;

  const finish = async () => {
    const sub = await api("/api/subscription/sync", { method: "POST" });
    if (sub.status === "TRIAL" || sub.status === "ACTIVE") {
      onSubscribed(sub);
      // useShowAds() reads its own ["me"] query cache — invalidate it now so
      // ads switch off immediately instead of waiting for its next refetch.
      queryClient.invalidateQueries({ queryKey: ["me"] });
      // In the blocking (first-time) phase, RootNavigator's Stack.Navigator
      // is keyed by phase and about to fully remount once `me.subscription`
      // above flips `needsPaywall` false — calling goBack() here too, on a
      // navigator instance that's simultaneously being torn down by that key
      // change, raced with it and produced exactly the "flashes back to the
      // paywall, then stops responding entirely" bug reported. Only the
      // "Upgrade Now" push case (reached from inside the app, where the
      // phase never changes) needs an explicit goBack() to return.
      if (!blocking && navigation.canGoBack()) navigation.goBack();
    } else {
      Alert.alert("Not active yet", "We couldn't confirm your subscription yet. Please try Restore in a moment.");
    }
  };

  const start = async () => {
    let pkg = packages[selected];
    if (!pkg) {
      // Plans didn't load earlier (slow store response, transient error) —
      // try once more right now instead of dead-ending on the first tap.
      setBusy(true);
      const fresh = await load();
      setBusy(false);
      pkg = fresh?.[selected] || null;
    }
    if (!pkg) {
      Alert.alert(
        "Couldn't load subscription options",
        `We couldn't load this plan from the ${STORE_NAME} right now. Please check your connection and try again in a moment.`
      );
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

  const planSubtitle = (key) => {
    const priceString = packages[key]?.product?.priceString;
    return priceString ? `3 days free, then ${priceString} / ${PLANS[key].period}` : "Price unavailable right now";
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", marginTop: 8, marginBottom: 14 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <Ionicons name="sparkles" size={22} color={colors.accent} />
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: "700", textAlign: "center" }}>
            Start your 3-day free trial
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: "center", marginTop: 4 }}>
            Full access to everything in Move On. Cancel anytime.
          </Text>
        </View>

        <View style={{ marginBottom: 14 }}>
          {BENEFITS.map((b) => (
            <View key={b} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              <Text style={{ color: colors.textPrimary, fontSize: 13, marginLeft: 8 }}>{b}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />
        ) : (
          ["monthly", "weekly"].map((key) => {
            const active = selected === key;
            return (
              <AnimatedPressable
                key={key}
                scaleTo={0.98}
                onPress={() => setSelected(key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 2,
                  borderColor: active ? colors.accent : colors.border,
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 8,
                }}
              >
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700" }}>{PLANS[key].title}</Text>
                    {PLANS[key].badge && (
                      <View style={{ backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
                        <Text style={{ color: colors.accentText, fontSize: 10, fontWeight: "700" }}>{PLANS[key].badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{planSubtitle(key)}</Text>
                </View>
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={active ? colors.accent : colors.textMuted}
                />
              </AnimatedPressable>
            );
          })
        )}

        {plansUnavailable && (
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: "center", lineHeight: 17 }}>
              We couldn't load subscription options from the {STORE_NAME}. Check your connection and try again.
            </Text>
            <Pressable onPress={load} hitSlop={10} style={{ marginTop: 8 }}>
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: "700" }}>Retry</Text>
            </Pressable>
          </View>
        )}

        <AnimatedPressable
          onPress={start}
          disabled={busy || loading}
          style={{
            backgroundColor: busy || loading ? colors.surfaceAlt : colors.accent,
            borderRadius: 16,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <Text style={{ color: busy || loading ? colors.textMuted : colors.accentText, fontSize: 15, fontWeight: "700" }}>
            {busy ? "Please wait..." : "Start free trial"}
          </Text>
        </AnimatedPressable>

        <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: "center", marginTop: 8, lineHeight: 15 }}>
          Your card is charged automatically after the 3-day trial ends unless you cancel at least 24 hours before it does.
          Manage or cancel anytime in your App Store / Google Play subscription settings.
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
          <Pressable onPress={doRestore} hitSlop={8}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Restore purchases</Text>
          </Pressable>
          <Text style={{ color: colors.textMuted, marginHorizontal: 10 }}>|</Text>
          <Pressable onPress={() => navigation.navigate("Terms")} hitSlop={8}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Terms</Text>
          </Pressable>
          <Text style={{ color: colors.textMuted, marginHorizontal: 10 }}>|</Text>
          <Pressable onPress={() => Linking.openURL("https://facelessquotes.online/privacy-policy/").catch(() => {})} hitSlop={8}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Privacy</Text>
          </Pressable>
        </View>

        {freeTierEnabled && <ContinueFreeButton navigation={navigation} />}

        <Pressable
          onPress={async () => {
            await signOut();
            await resetAppState();
          }}
          hitSlop={8}
          style={{ marginTop: 10, alignItems: "center" }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
