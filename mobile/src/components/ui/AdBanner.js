import { useState } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { adsAvailable, BANNER_UNIT_ID, useShowAds } from "../../lib/ads";

// Self-contained: decides on its own whether ads should show right now (see
// useShowAds's doc comment for the exact rule — same one RootNavigator uses
// for the interstitial, so the two can never disagree). Callers just render
// <AdBanner /> unconditionally.
// Dismissible for the current app session via the X — reappears next launch,
// same as the interstitial's per-session cap.
export default function AdBanner() {
  const { colors } = useTheme();
  const showAds = useShowAds();
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // A failure callback alone isn't a reliable collapse signal — it only
  // fires once the SDK has definitively given up, and in the meantime
  // (loading, or any other pending/stuck state that never resolves to
  // either onAdLoaded or onAdFailedToLoad) the native BannerAd view still
  // reserves its full adaptive-banner height and paints it solid black,
  // with nothing visible in it. That's the dead block of space reported
  // above the tab bar. Still tracked for the unlikely case this component
  // re-renders after settling into a hard failure, but it's no longer the
  // thing collapsing the space.
  const [failed, setFailed] = useState(false);

  if (!adsAvailable || !showAds || dismissed || failed) return null;

  const { BannerAd, BannerAdSize } = require("react-native-google-mobile-ads");

  return (
    // The real fix: the wrapper is forced to zero height with its content
    // clipped (`overflow: hidden`) whenever the ad isn't confirmed loaded —
    // covering "closed", "still loading", "failed silently without firing
    // the callback", and "never attempted" alike — and only grows to fit
    // once `onAdLoaded` actually fires. RN's layout clips BannerAd to this
    // 0-height bound regardless of what height the native ad view itself
    // wants to claim, so there is no window where empty reserved space can
    // show through.
    <View style={{ alignItems: "center", height: loaded ? undefined : 0, overflow: "hidden" }}>
      {loaded && (
        <Pressable
          onPress={() => setDismissed(true)}
          hitSlop={10}
          style={{ alignSelf: "flex-end", marginRight: 12, marginBottom: 2 }}
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      )}
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => {
          setLoaded(false);
          setFailed(true);
        }}
      />
    </View>
  );
}
