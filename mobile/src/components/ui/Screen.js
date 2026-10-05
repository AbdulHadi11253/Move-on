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

  // Android's KeyboardAvoidingView behavior="height" has a known issue: it
  // can leave the view's measured height wrong after the keyboard hides
  // again, silently shifting touch targets out from under content that
  // renders in the right place — exactly the kind of thing that would make
  // an unrelated screen's button (no keyboard in sight) stop responding to
  // taps. android:windowSoftInputMode="adjustResize" (set in app.json)
  // already handles the actual keyboard-overlap case at the native level;
  // screens that still need JS-driven avoidance (e.g. onboarding's text
  // inputs) opt in locally instead of this applying to every screen.
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1, backgroundColor: colors.background, paddingTop, paddingBottom }, style]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style={theme.statusBar} />
      {children}
    </KeyboardAvoidingView>
  );
}
