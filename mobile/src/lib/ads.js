import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { useAdsStore } from "../state/adsStore";
import { purchasesConfigured } from "./purchases";

// Google's official test ad unit IDs — always safe to serve, never earn or
// risk anything. AdMob policy prohibits interacting with your own live ads,
// which is easy to do by accident while testing, so __DEV__ builds always use
// these regardless of the real IDs below.
const TEST_UNITS = {
  banner: { android: "ca-app-pub-3940256099942544/6300978111", ios: "ca-app-pub-3940256099942544/2934735716" },
  interstitial: { android: "ca-app-pub-3940256099942544/1033173712", ios: "ca-app-pub-3940256099942544/4411468910" },
};

// Move On's real AdMob ad units (see app.json for the matching App IDs).
const PROD_UNITS = {
  banner: { android: "ca-app-pub-7457922785936662/8460166211", ios: "ca-app-pub-7457922785936662/7226975593" },
  interstitial: { android: "ca-app-pub-7457922785936662/3207839533", ios: "ca-app-pub-7457922785936662/4329349512" },
};

function unitId(kind) {
  const units = __DEV__ ? TEST_UNITS : PROD_UNITS;
  return units[kind][Platform.OS];
}

export const BANNER_UNIT_ID = unitId("banner");
export const INTERSTITIAL_UNIT_ID = unitId("interstitial");

// Ads need a real build (native module) — never available in Expo Go.
export const adsAvailable = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

// Single source of truth for "should this user see ads right now" — used by
// RootNavigator (to init the SDK / show the session interstitial) and
// AdBanner (to render or not). Never compute this a second, different way;
// import and use this hook instead, so the two can't drift out of sync.
//
// True only when: purchases are even configured (RevenueCat keys present) AND
// the user isn't entitled (not an admin, not subscribed) AND they explicitly
// chose "Continue for free" AND the admin hasn't globally switched ads off.
export function useShowAds() {
  const api = useApi();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api("/api/users/me") });
  const { data: content } = useQuery({ queryKey: ["app-content"], queryFn: () => api("/api/content"), staleTime: 30 * 1000 });
  const continuedFree = useAdsStore((s) => s.continuedFree);

  const entitled = me?.role === "ADMIN" || ["TRIAL", "ACTIVE"].includes(me?.subscription?.status);
  // Default to OFF until we've actually confirmed the admin's setting, so
  // there's never a window where an ad could show before we know it's allowed.
  const adsEnabledGlobally = content ? content.find((b) => b.key === "ads_enabled")?.isEnabled !== false : false;
  const optedIntoFreeTier = continuedFree || !purchasesConfigured;

  return !entitled && optedIntoFreeTier && adsEnabledGlobally;
}

let mobileAds = null;
let started = false;

function sdk() {
  if (!mobileAds) mobileAds = require("react-native-google-mobile-ads").default;
  return mobileAds;
}

// Requests iOS App Tracking Transparency (no-op on Android) and starts the
// Google Mobile Ads SDK. Guarded by `started` so it's safe to call from
// multiple places/renders — the SDK is only ever initialized once per app run.
// Best-effort: ad failures should never block the app.
export async function initAds() {
  if (!adsAvailable || started) return;
  started = true;
  try {
    if (Platform.OS === "ios") {
      const { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } = require("expo-tracking-transparency");
      const current = await getTrackingPermissionsAsync();
      if (current.status === "undetermined") await requestTrackingPermissionsAsync();
    }
    await sdk().initialize();
  } catch (e) {
    console.warn("Ads init failed:", e?.message);
  }
}

export function getInterstitial() {
  const { InterstitialAd, AdEventType } = require("react-native-google-mobile-ads");
  return { ad: InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID), AdEventType };
}

let shownThisSession = false;

// Loads and shows at most one interstitial per app session (has its own
// native close button — Google requires it, can't be configured away).
// Best-effort/silent on any failure; never blocks navigation.
export function showSessionInterstitial() {
  if (!adsAvailable || shownThisSession) return;
  shownThisSession = true;
  try {
    const { ad, AdEventType } = getInterstitial();
    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      ad.show().catch(() => {});
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      unsubLoaded();
      unsubError();
    });
    ad.load();
  } catch (e) {
    console.warn("Interstitial failed:", e?.message);
  }
}
