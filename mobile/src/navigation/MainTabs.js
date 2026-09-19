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
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const landing = (content || []).find((b) => b.key === "landing_tab");
  const initialRouteName = (landing?.title || "").trim().toLowerCase() === "quotes" ? "Quotes" : "Home";

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
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
            size={22}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Quotes" component={QuotesScreen} />
      <Tab.Screen name="Journey" component={JourneyNavigator} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
