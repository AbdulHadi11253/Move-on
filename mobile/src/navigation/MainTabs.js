import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  // A fixed height here ignores the device's own bottom inset entirely — that
  // works fine on a phone (a few px of home-indicator at most) but breaks on
  // a tablet, where the OS's own on-screen nav bar is much taller, leaving
  // our tab bar overlapping it instead of sitting above it.
  //
  // `insets.bottom` itself isn't fully trustworthy either — on some Android
  // devices (classic 3-button nav in particular) it has reported 0 even
  // though the OS nav bar is very much still there, right under our tab
  // bar, leaving the two crowded against each other. MIN_BOTTOM_PAD is a
  // floor under whatever the inset reports, so there's always a clearly
  // visible gap above the OS's own nav row regardless of whether the
  // platform's inset reporting is accurate on a given device.
  const MIN_BOTTOM_PAD = 16;
  const bottomPad = Math.max(insets.bottom, MIN_BOTTOM_PAD);
  const tabBarHeight = 60 + bottomPad;

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
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: bottomPad,
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
