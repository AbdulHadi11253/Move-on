import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

const KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

// In-app purchases need a real build (not Expo Go) and a RevenueCat key.
export const purchasesConfigured = !!KEY && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

let Purchases = null;
let configuredFor = null;

function sdk() {
  if (!Purchases) Purchases = require("react-native-purchases").default;
  return Purchases;
}

export async function initPurchases(userId) {
  if (!purchasesConfigured || configuredFor === userId) return;
  const P = sdk();
  try {
    if (configuredFor === null) P.configure({ apiKey: KEY, appUserID: userId });
    else await P.logIn(userId);
    configuredFor = userId;
  } catch (e) {
    // Swallowed by the caller (best-effort on app launch) — logged here so a
    // real RevenueCat configuration problem (bad key, store products not yet
    // approved/submitted, etc.) is visible instead of silently surfacing
    // later as "this plan isn't available" with no clue why.
    console.warn("RevenueCat initPurchases failed:", e?.message || e);
    throw e;
  }
}

export async function resetPurchases() {
  if (!purchasesConfigured || configuredFor === null) return;
  try {
    await sdk().logOut();
  } catch {}
  configuredFor = null;
}

// Returns { weekly, monthly } packages from the current RevenueCat offering.
export async function loadPackages() {
  const offerings = await sdk().getOfferings();
  const pkgs = offerings.current?.availablePackages || [];
  if (pkgs.length === 0) {
    // Configured correctly in RevenueCat but nothing resolves client-side —
    // almost always means the store-side products (App Store Connect /
    // Google Play Console) aren't yet in a queryable state (not submitted
    // with a build at least once, missing agreements, or not Active), not a
    // RevenueCat or app configuration bug.
    console.warn("RevenueCat: offerings.current has no packages — check the products' status in App Store Connect / Play Console.");
  }
  return {
    weekly: pkgs.find((p) => p.packageType === "WEEKLY") || null,
    monthly: pkgs.find((p) => p.packageType === "MONTHLY") || null,
  };
}

// Resolves true on success, false if the user cancelled.
export async function purchase(pkg) {
  try {
    await sdk().purchasePackage(pkg);
    return true;
  } catch (e) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restore() {
  await sdk().restorePurchases();
}
