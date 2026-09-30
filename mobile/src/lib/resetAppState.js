import { queryClient } from "./queryClient";
import { useOnboardingStore } from "../state/onboardingStore";
import { useAdsStore } from "../state/adsStore";
import { clearJourneyDeferred } from "./journeyFlag";

// Wipes every bit of this-account state on sign-out: cached server data,
// the free-tier ad opt-in, and the local "skip journey for now" choice.
// Deliberately keeps `questionsDone` (onboarding/state/onboardingStore.js) —
// that flag means "this device has already asked its onboarding questions",
// which must survive logout so a returning user on the same device isn't
// asked again, per the app's established sign-in flow.
export async function resetAppState() {
  queryClient.clear();
  useOnboardingStore.setState({ answers: {} });
  useAdsStore.setState({ continuedFree: false });
  await clearJourneyDeferred();
}
