import { useState } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { adsAvailable, BANNER_UNIT_ID } from "../../lib/ads";

// Shown only to non-subscribed users (see RootNavigator's `entitled` check).
// Dismissible for the current app session via the X — reappears next launch,
// same as the interstitial's per-session cap.
export default function AdBanner() {
  const { colors } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!adsAvailable || dismissed) return null;

  const { BannerAd, BannerAdSize } = require("react-native-google-mobile-ads");

  return (
    <View style={{ alignItems: "center", backgroundColor: colors.surface, paddingTop: loaded ? 4 : 0 }}>
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
