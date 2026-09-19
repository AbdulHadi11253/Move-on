import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@clerk/clerk-expo";
import SignInScreen from "../screens/SignInScreen";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import MainTabs from "./MainTabs";
import AdminNavigator from "./AdminNavigator";
import QuotesExploreScreen from "../screens/main/QuotesExploreScreen";
import CategoryQuotesScreen from "../screens/main/CategoryQuotesScreen";
import MostPopularScreen from "../screens/main/MostPopularScreen";
import PrivacyPolicyScreen from "../screens/main/PrivacyPolicyScreen";
import TermsScreen from "../screens/main/TermsScreen";
import { useApi } from "../lib/useApi";
import { useTheme } from "../theme/ThemeContext";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApi();
  const { colors, theme } = useTheme();
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoadingMe(false);
      return;
    }
    setLoadingMe(true);
    api("/api/users/me")
      .then(setMe)
      .finally(() => setLoadingMe(false));
  }, [isSignedIn]);

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

  if (!isLoaded || (isSignedIn && loadingMe)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isSignedIn ? (
          <Stack.Screen name="SignIn" component={SignInScreen} />
        ) : !me?.onboardingComplete ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={() => setMe({ ...me, onboardingComplete: true })} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Admin" component={AdminNavigator} />
            <Stack.Screen name="QuotesExplore" component={QuotesExploreScreen} />
            <Stack.Screen name="CategoryQuotes" component={CategoryQuotesScreen} />
            <Stack.Screen name="MostPopular" component={MostPopularScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
