import { View, KeyboardAvoidingView, Platform } from "react-native";
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
    <KeyboardAvoidingView
      style={[{ flex: 1, backgroundColor: colors.background, paddingTop, paddingBottom }, style]}
      // android:windowSoftInputMode="adjustResize" is set, but it doesn't
      // reliably propagate through react-native-screens' native-stack on
      // every Android version/device — driving this from JS too (same as
      // iOS) is the robust fix for inputs/buttons getting covered by the
      // keyboard instead of the layout reflowing around it.
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={theme.statusBar} />
      {children}
    </KeyboardAvoidingView>
  );
}
