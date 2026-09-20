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
  if (configuredFor === null) P.configure({ apiKey: KEY, appUserID: userId });
  else await P.logIn(userId);
  configuredFor = userId;
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
