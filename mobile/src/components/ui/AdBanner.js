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

  if (!adsAvailable || !showAds || dismissed) return null;

  const { BannerAd, BannerAdSize } = require("react-native-google-mobile-ads");

  return (
    <View style={{ alignItems: "center", paddingTop: loaded ? 4 : 0 }}>
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
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}
