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
import { useApi } from "../lib/useApi";
import { useTheme } from "../theme/ThemeContext";
import { useOnboardingStore } from "../state/onboardingStore";
import { initPurchases, resetPurchases, purchasesConfigured } from "../lib/purchases";
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
      .then(async (user) => {
        // Refresh subscription state from the store on launch so expired or
        // cancelled trials are caught. Best-effort.
        if (purchasesConfigured && user.role !== "ADMIN" && user.onboardingComplete) {
          try {
            await initPurchases(user.id);
            user = { ...user, subscription: await api("/api/subscription/sync", { method: "POST" }) };
          } catch {}
        }
        setMe(user);
      })
      .finally(() => setLoadingMe(false));
  }, [isSignedIn]);

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

  if (!isLoaded || !hydrated || (isSignedIn && loadingMe)) return <Spinner colors={colors} />;

  const hasAnswers = Object.keys(answers).length > 0;
  const entitled = me?.role === "ADMIN" || ["TRIAL", "ACTIVE"].includes(me?.subscription?.status);
  const needsPaywall = purchasesConfigured && !entitled;

  const legal = (
    <>
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </>
  );

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
        <Stack.Screen name="Admin" component={AdminNavigator} />
        <Stack.Screen name="QuotesExplore" component={QuotesExploreScreen} />
        <Stack.Screen name="CategoryQuotes" component={CategoryQuotesScreen} />
        <Stack.Screen name="MostPopular" component={MostPopularScreen} />
        {legal}
      </>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>{screens}</Stack.Navigator>
    </NavigationContainer>
  );
}
