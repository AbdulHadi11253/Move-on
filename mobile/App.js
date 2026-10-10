import { ClerkProvider } from "@clerk/clerk-expo";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { tokenCache } from "./src/lib/tokenCache";
import { queryClient } from "./src/lib/queryClient";
import { ThemeProvider } from "./src/theme/ThemeContext";
import RootNavigator from "./src/navigation/RootNavigator";
import NetworkBanner from "./src/components/ui/NetworkBanner";
import ErrorBoundary from "./src/components/ui/ErrorBoundary";

export default function App() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {/*
            No `initialMetrics` here on purpose: passing the static
            initialWindowMetrics snapshot is a common fast-first-paint
            optimization, but on several Android devices/OS versions it
            bakes in a stale bottom inset captured before the system
            finished negotiating edge-to-edge layout — typically reporting
            0 for the on-screen 3-button nav bar's height. That stale value
            is what fed MainTabs' bottom padding and produced the
            tab-bar-crowds-the-OS-nav-bar look. Leaving this prop out makes
            SafeAreaProvider measure insets itself after mounting, which is
            correct (if very slightly slower on first paint).
          */}
          <SafeAreaProvider>
            <ErrorBoundary>
              <RootNavigator />
            </ErrorBoundary>
            <NetworkBanner />
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
