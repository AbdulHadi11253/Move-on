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
let readyWaiters = [];

function sdk() {
  if (!Purchases) Purchases = require("react-native-purchases").default;
  return Purchases;
}

function releaseWaiters() {
  const waiters = readyWaiters;
  readyWaiters = [];
  waiters.forEach((resolve) => resolve());
}

// Resolves once initPurchases() has finished (successfully or not), or after
// `timeoutMs` as a backstop. Every store call below awaits this first.
//
// Why this exists: PaywallScreen loads offerings in its own mount effect, and
// React runs a child's effects before its parent's within one commit. The
// effect in RootNavigator that calls Purchases.configure() is a parent of the
// paywall, so on the very render that first shows the paywall, getOfferings()
// ran BEFORE configure() — the SDK threw "no singleton instance", the paywall
// swallowed it, and the plan cards sat on fallback prices with every purchase
// attempt answering "This plan isn't available right now". Because the paywall
// only loaded once, it never recovered either. Waiting for configuration here
// closes that ordering race for every caller instead of relying on effect order.
function whenReady(timeoutMs = 10000) {
  if (configuredFor !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    readyWaiters.push(() => {
      clearTimeout(timer);
      resolve();
    });
  });
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
  } finally {
    releaseWaiters();
  }
}

export async function resetPurchases() {
  if (!purchasesConfigured || configuredFor === null) return;
  try {
    await sdk().logOut();
  } catch {}
  configuredFor = null;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Returns { weekly, monthly } packages from the current RevenueCat offering.
// Retries a couple of times: right after launch StoreKit / Play Billing can
// answer with an empty product list or a transient error before they've
// warmed up, and a single failed attempt used to leave the paywall stuck.
// Throws the last error only if every attempt failed outright; an empty
// result (configured but nothing purchasable) is returned as nulls so the
// caller can tell "couldn't reach the store" from "store has no products".
export async function loadPackages() {
  const delays = [0, 1500, 3500];
  let lastError = null;
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt]) await sleep(delays[attempt]);
    try {
      await whenReady();
      const offerings = await sdk().getOfferings();
      const pkgs = offerings.current?.availablePackages || [];
      if (pkgs.length > 0) {
        return {
          weekly: pkgs.find((p) => p.packageType === "WEEKLY") || null,
          monthly: pkgs.find((p) => p.packageType === "MONTHLY") || null,
        };
      }
      lastError = null;
      // Configured correctly in RevenueCat but nothing resolves client-side —
      // almost always means the store-side products (App Store Connect /
      // Google Play Console) aren't in a queryable state (not attached to the
      // submitted app version, Paid Apps Agreement not active, or not Active).
      console.warn("RevenueCat: offerings.current has no packages — check the products' status in App Store Connect / Play Console.");
    } catch (e) {
      lastError = e;
      console.warn("RevenueCat getOfferings failed:", e?.message || e);
    }
  }
  if (lastError) throw lastError;
  return { weekly: null, monthly: null };
}

// Resolves true on success, false if the user cancelled.
export async function purchase(pkg) {
  await whenReady();
  try {
    await sdk().purchasePackage(pkg);
    return true;
  } catch (e) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restore() {
  await whenReady();
  await sdk().restorePurchases();
}
