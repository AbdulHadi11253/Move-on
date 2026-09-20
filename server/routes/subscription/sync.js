const { withAuth } = require("../../lib/auth");
const { syncFromRevenueCat } = require("../../lib/subscription");

// Called by the app right after a purchase / restore so the server-side
// subscription state is up to date before the user moves on.
module.exports = withAuth(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const subscription = await syncFromRevenueCat(req.user.id);
    res.status(200).json(subscription);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});
