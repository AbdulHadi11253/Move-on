const { prisma } = require("../../lib/prisma");
const { syncFromRevenueCat } = require("../../lib/subscription");

// RevenueCat -> server. Configure the webhook URL in RevenueCat and set the
// same value as REVENUECAT_WEBHOOK_AUTH (sent as the Authorization header).
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected || req.headers.authorization !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const appUserId = req.body?.event?.app_user_id;
  if (appUserId) {
    const user = await prisma.user.findUnique({ where: { id: appUserId }, select: { id: true } });
    if (user) {
      try {
        await syncFromRevenueCat(user.id);
      } catch (e) {
        console.error("RevenueCat webhook sync failed:", e.message);
        res.status(500).json({ error: "sync failed" });
        return;
      }
    }
  }
  res.status(200).json({ ok: true });
};
