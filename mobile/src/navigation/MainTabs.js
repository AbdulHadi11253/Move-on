import { View, ActivityIndicator, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import AnimatedTabIcon from "../components/ui/AnimatedTabIcon";
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
  // Letting @react-navigation/bottom-tabs derive its own padding purely
  // from useSafeAreaInsets() is the textbook-correct approach, and it's
  // still what drives this on the vast majority of devices, iOS included.
  // But it was re-tested against real Android hardware (two separate
  // phones, both reporting as Vivo/FunTouch in their status bar) and the
  // tab bar still crowded the on-screen 3-button nav row — some OEM
  // Android skins are documented to not reliably dispatch the navigation
  // bar's height through the standard insets API at all, independent of
  // this app's own edge-to-edge configuration (confirmed correct:
  // transparent nav bar already in styles.xml). MIN_BOTTOM_PAD is a floor
  // under whatever Android reports, not a replacement for it — an Android
  // device that correctly reports a larger inset (gesture nav, tablets)
  // still gets that real, larger value; only one reporting zero or
  // smaller than this floor gets bumped up to it.
  //
  // iOS is deliberately NOT given this floor. Apple's safe-area API has no
  // equivalent OEM-skin inconsistency — an iPhone with a physical home
  // button genuinely has insets.bottom === 0, and that's correct, not a
  // misreporting bug. Flooring it there would force an unwanted gap on
  // exactly the devices that should have none.
  const MIN_BOTTOM_PAD = 12;
  const bottomPad = Platform.OS === "android" ? Math.max(insets.bottom, MIN_BOTTOM_PAD) : insets.bottom;

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
          // The library computes its own default height as a fixed content
          // height (49, its internal TABBAR_HEIGHT_UIKIT constant) plus the
          // RAW insets.bottom — so overriding only paddingBottom with our
          // floor-adjusted value, without also growing height to match,
          // would squeeze/clip the icon+label content rather than add
          // breathing room below it. Mirroring the library's own formula
          // here, just substituting bottomPad for the raw inset, keeps the
          // two consistent.
          height: 49 + bottomPad,
          paddingBottom: bottomPad,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarIcon: ({ color, focused }) => (
          <AnimatedTabIcon
            name={ICONS[route.name]}
            outlineName={`${ICONS[route.name]}-outline`}
            focused={focused}
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
