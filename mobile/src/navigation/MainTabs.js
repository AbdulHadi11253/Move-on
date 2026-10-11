import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import HomeNavigator from "./HomeNavigator";
import QuotesScreen from "../screens/main/QuotesScreen";
import JourneyNavigator from "./JourneyNavigator";
import ProgressScreen from "../screens/main/ProgressScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import { useTheme } from "../theme/ThemeContext";
import { useApi } from "../lib/useApi";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
  Quotes: "sparkles",
  Journey: "map",
  Progress: "stats-chart",
  Profile: "person",
};

export default function MainTabs() {
  const { colors } = useTheme();
  const api = useApi();

  // The landing tab comes from App Content. We must wait for it to load before
  // mounting the navigator, because `initialRouteName` only applies on first
  // mount — reading it before the query resolves would always fall back to Home.
  const { data: content, isLoading } = useQuery({
    queryKey: ["app-content"],
    queryFn: () => api("/api/content"),
    staleTime: 30 * 1000,
  });
  // Only spares users who already have an active journey — checked inside
  // JourneyScreen/ProgressScreen, not here, since this hook has no journey
  // data. Here we just decide whether the tabs exist at all; a user who
  // already has an active journey when the admin flips this off keeps seeing
  // their tabs (the routes still work, only the fresh "choose one" nag hides).
  const { data: journeyToday } = useQuery({ queryKey: ["journey-today"], queryFn: () => api("/api/journeys/today") });

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const landing = (content || []).find((b) => b.key === "landing_tab");
  const initialRouteName = (landing?.title || "").trim().toLowerCase() === "quotes" ? "Quotes" : "Home";
  const trackerContent = (content || []).find((b) => b.key === "tracker_enabled");
  const trackerEnabled = !trackerContent || trackerContent.isEnabled;
  const showTrackerTabs = trackerEnabled || !!journeyToday?.hasActiveJourney;

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        // No manual height/paddingBottom here on purpose. @react-navigation/
        // bottom-tabs' own BottomTabBar already measures the real device
        // safe-area bottom inset (via react-native-safe-area-context) and
        // sizes itself to clear it — 3-button nav, gesture nav, tablets,
        // foldables, iPhones and iPads alike — as long as we don't override
        // `height`/`paddingBottom` ourselves. Re-deriving that math by hand
        // is exactly what kept producing device-specific overlap/gap bugs;
        // letting the library own it is the dynamic, no-hardcoding fix.
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
            size={24}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Quotes" component={QuotesScreen} />
      {showTrackerTabs && <Tab.Screen name="Journey" component={JourneyNavigator} />}
      {showTrackerTabs && <Tab.Screen name="Progress" component={ProgressScreen} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
