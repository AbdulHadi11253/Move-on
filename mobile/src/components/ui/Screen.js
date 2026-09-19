import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../theme/ThemeContext";

// Uses a plain flex:1 View + manual inset padding instead of SafeAreaView.
// SafeAreaView from react-native-safe-area-context can collapse to content height
// on Android when insets aren't resolved yet; a plain flex:1 View always fills.
export default function Screen({ children, edges = ["top", "bottom"], style }) {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const paddingTop = edges.includes("top") ? insets.top : 0;
  const paddingBottom = edges.includes("bottom") ? insets.bottom : 0;

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background, paddingTop, paddingBottom }, style]}>
      <StatusBar style={theme.statusBar} />
      {children}
    </View>
  );
}
