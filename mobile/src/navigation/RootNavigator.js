import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, Pressable } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@clerk/clerk-expo";
import SignInScreen from "../screens/SignInScreen";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import PaywallScreen from "../screens/PaywallScreen";
import MainTabs from "./MainTabs";
import AdminNavigator from "./AdminNavigator";
import QuotesExploreScreen from "../screens/main/QuotesExploreScreen";
import CategoryQuotesScreen from "../screens/main/CategoryQuotesScreen";
import MostPopularScreen from "../screens/main/MostPopularScreen";
import PrivacyPolicyScreen from "../screens/main/PrivacyPolicyScreen";
import TermsScreen from "../screens/main/TermsScreen";
import AffirmationSettingsScreen from "../screens/main/AffirmationSettingsScreen";
import { useApi } from "../lib/useApi";
import { useTheme } from "../theme/ThemeContext";
import { useOnboardingStore } from "../state/onboardingStore";
import { useAdsStore } from "../state/adsStore";
import { initPurchases, resetPurchases, purchasesConfigured } from "../lib/purchases";
import { initAds, showSessionInterstitial, useShowAds } from "../lib/ads";
import { registerForPush, scheduleDailyReminder, cancelDailyReminder } from "../lib/notifications";

const Stack = createNativeStackNavigator();

function Spinner({ colors }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

// Signed in, questions answered locally: send them to the server, then move on.
function SubmitAnswers({ onDone }) {
  const api = useApi();
  const { colors } = useTheme();
  const { answers, clearAnswers } = useOnboardingStore();
  const [failed, setFailed] = useState(false);

  const submit = () => {
    setFailed(false);
    const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    api("/api/onboarding/answers", { method: "POST", body: { answers: payload } })
      .then(() => {
        clearAnswers();
        onDone();
      })
      .catch(() => setFailed(true));
  };

  useEffect(submit, []);

  if (!failed) return <Spinner colors={colors} />;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 32 }}>
      <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "600", marginBottom: 8 }}>Couldn't save your answers</Text>
      <Text style={{ color: colors.textMuted, textAlign: "center", marginBottom: 20 }}>Check your connection and try again.</Text>
      <Pressable onPress={submit} style={{ backgroundColor: colors.accent, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 }}>
        <Text style={{ color: colors.accentText, fontWeight: "600" }}>Retry</Text>
      </Pressable>
    </View>
  );
}

export default function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApi();
  const { colors, theme } = useTheme();
  const { answers, questionsDone, hydrated, markDone, clearAnswers } = useOnboardingStore();
  const { continuedFree, hydrated: adsHydrated } = useAdsStore();
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setMe(null);
      setLoadingMe(false);
      resetPurchases();
      cancelDailyReminder();
      return;
    }
    setLoadingMe(true);
    api("/api/users/me")
      .then((user) => setMe(user))
      .finally(() => setLoadingMe(false));
  }, [isSignedIn]);

  // Configuring RevenueCat and syncing the subscription is its own effect,
  // keyed on onboardingComplete rather than folded into the /me fetch above.
  // A brand-new signup completes onboarding *after* that first /me fetch
  // already resolved (with onboardingComplete still false at that moment) —
  // folding this into the fetch meant it only ever ran for returning users
  // who were already onboarded, never for a first-time signup in the same
  // session. That left Purchases never configured, so the paywall's "Start
  // free trial" / "Restore purchases" failed with "no singleton instance" /
  // "this plan isn't available" for every first-time user.
  useEffect(() => {
    if (!purchasesConfigured || !me?.onboardingComplete || me.role === "ADMIN") return;
    let cancelled = false;
    initPurchases(me.id)
      .then(() => api("/api/subscription/sync", { method: "POST" }))
      .then((subscription) => {
        if (!cancelled) setMe((prev) => (prev ? { ...prev, subscription } : prev));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [me?.id, me?.onboardingComplete]);

  // Push registration + daily reminder once the user is fully onboarded.
  useEffect(() => {
    if (!me?.onboardingComplete) return;
    registerForPush(api);
    api("/api/users/notification-settings")
      .then((s) => (s.dailyReminder ? scheduleDailyReminder(s.reminderTime) : cancelDailyReminder()))
      .catch(() => {});
  }, [me?.id, me?.onboardingComplete]);

  const navTheme = {
    ...(theme.statusBar === "light" ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.statusBar === "light" ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      text: colors.textPrimary,
      primary: colors.accent,
    },
  };

  const entitled = me?.role === "ADMIN" || ["TRIAL", "ACTIVE"].includes(me?.subscription?.status);
  const needsPaywall = purchasesConfigured && !entitled && !continuedFree;
  // Same eligibility check AdBanner uses (see useShowAds's doc comment) —
  // never computed a second, different way here.
  const showingAds = useShowAds();
  const inMainAppWithAds = showingAds && !needsPaywall && me?.onboardingComplete;

  // Ads only make sense once we know the user isn't paying — init lazily,
  // then show one interstitial for the session once they're actually in the
  // main app (not still on the paywall/onboarding).
  useEffect(() => {
    if (!showingAds) return;
    initAds().then(() => {
      if (inMainAppWithAds) showSessionInterstitial();
    });
  }, [showingAds, inMainAppWithAds]);

  if (!isLoaded || !hydrated || !adsHydrated || (isSignedIn && loadingMe)) return <Spinner colors={colors} />;

  const hasAnswers = Object.keys(answers).length > 0;

  const legal = (
    <>
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </>
  );

  // React Navigation keeps its internal nav state (including which route is
  // focused) across re-renders of the same <Stack.Navigator> instance, even
  // when the set of <Stack.Screen>s it's given changes — so swapping from
  // e.g. "Paywall" to "MainTabs" here doesn't actually navigate anywhere on
  // its own; the navigator just keeps pointing at a route that no longer
  // exists. Keying the navigator by phase forces a full remount on every
  // transition, which resets to the new phase's first screen.
  let phaseKey;
  if (!isSignedIn) phaseKey = questionsDone ? "signin" : "onboarding";
  else if (!me?.onboardingComplete) phaseKey = hasAnswers ? "submit-answers" : "onboarding-post-signin";
  else if (needsPaywall) phaseKey = "paywall";
  else phaseKey = "app";

  let screens;
  if (!isSignedIn) {
    screens = questionsDone ? (
      <Stack.Screen name="SignIn" component={SignInScreen} />
    ) : (
      <Stack.Screen name="Onboarding">
        {() => <OnboardingScreen onComplete={markDone} onNoQuestions={markDone} onHaveAccount={markDone} />}
      </Stack.Screen>
    );
  } else if (!me?.onboardingComplete) {
    // Sign-in happened after the questions. If this account still has none
    // saved (e.g. new account on a device that already onboarded someone
    // else), ask them now.
    screens = hasAnswers ? (
      <Stack.Screen name="SubmitAnswers">
        {() => <SubmitAnswers onDone={() => setMe({ ...me, onboardingComplete: true })} />}
      </Stack.Screen>
    ) : (
      <Stack.Screen name="Onboarding">
        {() => (
          <OnboardingScreen
            onComplete={() => setMe({ ...me })}
            onNoQuestions={() => {
              clearAnswers();
              api("/api/onboarding/answers", { method: "POST", body: { answers: [] } }).then(() =>
                setMe({ ...me, onboardingComplete: true })
              );
            }}
          />
        )}
      </Stack.Screen>
    );
  } else if (needsPaywall) {
    screens = (
      <>
        <Stack.Screen name="Paywall">
          {(props) => <PaywallScreen {...props} onSubscribed={(subscription) => setMe({ ...me, subscription })} />}
        </Stack.Screen>
        {legal}
      </>
    );
  } else {
    screens = (
      <>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Paywall">
          {(props) => <PaywallScreen {...props} onSubscribed={(subscription) => setMe({ ...me, subscription })} />}
        </Stack.Screen>
        <Stack.Screen name="Admin" component={AdminNavigator} />
        <Stack.Screen name="QuotesExplore" component={QuotesExploreScreen} />
        <Stack.Screen name="CategoryQuotes" component={CategoryQuotesScreen} />
        <Stack.Screen name="MostPopular" component={MostPopularScreen} />
        <Stack.Screen name="AffirmationSettings" component={AffirmationSettingsScreen} />
        {legal}
      </>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator key={phaseKey} screenOptions={{ headerShown: false }}>
        {screens}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
