import { useRef, useState } from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { useAdsStore } from "../../state/adsStore";

// Built as its own self-contained unit, deliberately separate from the rest
// of PaywallScreen's purchase flow. Every previous fix for this button kept
// getting undone by some other part of the paywall/navigation system
// changing underneath it (phase-key remounts, goBack races, re-render
// timing). This component owns its full lifecycle end to end:
//
//   1. Persist the free-tier choice (synchronous Zustand write).
//   2. Force the visible screen change itself, immediately, via an
//      imperative `navigation.reset` — it does NOT wait for or trust any
//      parent component to notice the state change and react to it.
//
// `targetRouteName` must be registered on the SAME navigator instance this
// button is rendered under (RootNavigator registers "MainTabs" in both the
// blocking-paywall phase and the normal app phase for exactly this reason),
// so the reset works whether or not a phase-key remount happens afterward.
export default function ContinueFreeButton({ navigation, targetRouteName = "MainTabs" }) {
  const [busy, setBusy] = useState(false);
  // A ref, not state — guards against a second tap landing in the gap
  // before the first tap's setState-triggered re-render lands. State alone
  // (checked via closure) can still momentarily allow a double-fire; a ref
  // read/write is synchronous and immediate.
  const firedRef = useRef(false);

  const onPress = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setBusy(true);

    useAdsStore.getState().setContinuedFree();

    try {
      navigation.reset({ index: 0, routes: [{ name: targetRouteName }] });
    } catch (e) {
      try {
        navigation.navigate(targetRouteName);
      } catch (e2) {
        // Both forms of navigating away failed — surface this as a stuck
        // button rather than a silent no-op, and allow retrying.
        firedRef.current = false;
        setBusy(false);
      }
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={{
        marginTop: 12,
        borderRadius: 16,
        paddingVertical: 13,
        alignItems: "center",
        // Intentionally a distinct green (not the purple accent used
        // everywhere else) so this rebuilt button is visually obvious in
        // testing, separate from any functional change.
        backgroundColor: busy ? "#15803D" : "#22C55E",
      }}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "700" }}>Continue for Free</Text>
          <Text style={{ color: "#FFFFFF", fontSize: 11, marginTop: 2, opacity: 0.85 }}>
            Limited features, with ads. Upgrade anytime.
          </Text>
        </>
      )}
    </Pressable>
  );
}
