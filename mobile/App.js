import { ClerkProvider } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { tokenCache } from "./src/lib/tokenCache";
import { ThemeProvider } from "./src/theme/ThemeContext";
import RootNavigator from "./src/navigation/RootNavigator";
import NetworkBanner from "./src/components/ui/NetworkBanner";
import ErrorBoundary from "./src/components/ui/ErrorBoundary";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
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
