import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

// TEST ad unit IDs (Google's official ones, always safe to ship in dev) —
// swap these for the real IDs from AdMob before submitting to the stores.
// See EXPO_PUBLIC_ADMOB_* below for how to override without editing code.
const TEST_UNITS = {
  banner: { android: "ca-app-pub-3940256099942544/6300978111", ios: "ca-app-pub-3940256099942544/2934735716" },
  interstitial: { android: "ca-app-pub-3940256099942544/1033173712", ios: "ca-app-pub-3940256099942544/4411468910" },
};

function unitId(kind) {
  const envKey = `EXPO_PUBLIC_ADMOB_${kind.toUpperCase()}_${Platform.OS.toUpperCase()}`;
  return process.env[envKey] || TEST_UNITS[kind][Platform.OS];
}

export const BANNER_UNIT_ID = unitId("banner");
export const INTERSTITIAL_UNIT_ID = unitId("interstitial");

// Ads need a real build (native module) — never available in Expo Go.
export const adsAvailable = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

let mobileAds = null;
let started = false;

function sdk() {
  if (!mobileAds) mobileAds = require("react-native-google-mobile-ads").default;
  return mobileAds;
}

// Requests iOS App Tracking Transparency (no-op on Android) and starts the
// Google Mobile Ads SDK. Safe to call more than once. Best-effort: ad
// failures should never block the app.
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

// Loads and shows one interstitial per app session (has its own native close
// button — Google requires it, can't be configured away). Best-effort/silent
// on any failure; never blocks navigation.
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
