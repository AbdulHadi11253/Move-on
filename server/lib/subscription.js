const { prisma } = require("./prisma");

// Must match the entitlement's lookup_key in RevenueCat exactly (Project
// Settings > Entitlements) — "Move on Pro" as of this project's current
// setup, not the more common "premium" default some RevenueCat guides use.
const ENTITLEMENT_ID = process.env.REVENUECAT_ENTITLEMENT_ID || "Move on Pro";

// RevenueCat is the source of truth for purchases. We never trust the client
// about entitlement state — after a purchase (or a webhook ping) we re-read the
// subscriber from RevenueCat's REST API and mirror it into our Subscription row.
async function syncFromRevenueCat(userId) {
  const secret = process.env.REVENUECAT_SECRET_API_KEY;
  if (!secret) {
    const err = new Error("Subscriptions are not configured on the server");
    err.status = 503;
    throw err;
  }

  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = new Error(`RevenueCat lookup failed (${res.status})`);
    err.status = 502;
    throw err;
  }
  const { subscriber } = await res.json();

  const ent = subscriber?.entitlements?.[ENTITLEMENT_ID];
  const now = Date.now();
  const expires = ent?.expires_date ? new Date(ent.expires_date) : null;
  const active = !!ent && (!expires || expires.getTime() > now);

  const productId = ent?.product_identifier || "";
  const sub = subscriber?.subscriptions?.[productId];
  const plan = /week/i.test(productId) ? "WEEKLY" : /month/i.test(productId) ? "MONTHLY" : null;

  let status = "NONE";
  if (active) status = sub?.period_type === "trial" ? "TRIAL" : "ACTIVE";
  else if (ent) status = sub?.unsubscribe_detected_at ? "CANCELLED" : "EXPIRED";

  const data = {
    status,
    plan,
    revenueCatId: subscriber?.original_app_user_id || userId,
    trialEndsAt: status === "TRIAL" ? expires : null,
    currentPeriodEndsAt: expires,
  };
  return prisma.subscription.upsert({ where: { userId }, update: data, create: { userId, ...data } });
}

module.exports = { syncFromRevenueCat };
