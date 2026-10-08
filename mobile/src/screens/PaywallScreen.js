import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Alert, Linking } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../lib/useApi";
import { loadPackages, purchase, restore } from "../lib/purchases";
import { useTheme } from "../theme/ThemeContext";
import { useAdsStore } from "../state/adsStore";
import { resetAppState } from "../lib/resetAppState";
import { useContentBlock } from "../lib/useAppContent";
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

export default function PaywallScreen({ navigation, onSubscribed, onContinueFree, blocking = false }) {
  const { colors } = useTheme();
  const api = useApi();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const setContinuedFree = useAdsStore((s) => s.setContinuedFree);
  const freeTierContent = useContentBlock("free_tier_enabled");
  // Doesn't retroactively affect anyone who already opted into the free
  // tier before the admin switched this off — only hides the option going
  // forward for users who haven't chosen it yet.
  const freeTierEnabled = !freeTierContent || freeTierContent.isEnabled;
  const [packages, setPackages] = useState({ weekly: null, monthly: null });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("monthly");
  const [busy, setBusy] = useState(false);
  // Separate from `busy` (purchase flow) on purpose — these two actions are
  // mutually exclusive and must not share a disabled/label state with each
  // other.
  const [continuingFree, setContinuingFree] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    loadPackages()
      .then(setPackages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

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

  // The blocking (first-login) paywall is a phase screen owned by
  // RootNavigator — when `onContinueFree` is passed, RootNavigator is the
  // single owner of the transition out of this screen: it flips the Zustand
  // flag, invalidates ["me"], and lets its own phaseKey remount swap the
  // Stack to the app phase. This screen must not also call
  // setContinuedFree()/goBack() in that case, or the state update here and
  // the remount triggered by the same tap race each other — which is what
  // produced the "first tap glitches, second tap is dead" symptom. The
  // non-blocking "Upgrade Now" case has no phase to remount, so it keeps
  // owning its own simple goBack() transition.
  const continueFree = async () => {
    if (continuingFree || busy) return;
    setContinuingFree(true);
    try {
      if (onContinueFree) {
        await onContinueFree();
      } else {
        setContinuedFree();
        if (navigation.canGoBack()) navigation.goBack();
      }
    } finally {
      if (mountedRef.current) setContinuingFree(false);
    }
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
          disabled={busy || loading || continuingFree}
          style={{
            backgroundColor: busy || loading || continuingFree ? colors.surfaceAlt : colors.accent,
            borderRadius: 16,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <Text style={{ color: busy || loading || continuingFree ? colors.textMuted : colors.accentText, fontSize: 15, fontWeight: "700" }}>
            {busy ? "Please wait..." : "Start free trial"}
          </Text>
        </Pressable>

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

        {freeTierEnabled && (
          <Pressable
            onPress={continueFree}
            disabled={continuingFree || busy}
            style={{
              marginTop: 12,
              borderRadius: 16,
              paddingVertical: 13,
              alignItems: "center",
              backgroundColor: continuingFree || busy ? colors.surfaceAlt : colors.accent,
            }}
          >
            <Text
              style={{
                color: continuingFree || busy ? colors.textMuted : colors.accentText,
                fontSize: 17,
                fontWeight: "700",
              }}
            >
              {continuingFree ? "Loading..." : "Continue for Free"}
            </Text>
            {!continuingFree && (
              <Text style={{ color: colors.accentText, fontSize: 11, marginTop: 2, opacity: 0.85 }}>
                Limited features, with ads. Upgrade anytime.
              </Text>
            )}
          </Pressable>
        )}

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
