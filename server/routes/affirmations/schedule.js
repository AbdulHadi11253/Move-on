const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

// Lets a signed-in user see the admin-defined send times and pick which ones
// they want. GET returns every enabled time plus which ones this user is
// subscribed to; PUT replaces the user's full selection in one call.
module.exports = withAuth(async (req, res) => {
  if (req.method === "GET") {
    const [slots, mine] = await Promise.all([
      prisma.affirmationSchedule.findMany({ where: { isEnabled: true }, orderBy: { time: "asc" } }),
      prisma.userAffirmationSubscription.findMany({ where: { userId: req.user.id }, select: { scheduleId: true } }),
    ]);
    const subscribedIds = new Set(mine.map((m) => m.scheduleId));
    res.status(200).json(slots.map((s) => ({ id: s.id, time: s.time, subscribed: subscribedIds.has(s.id) })));
    return;
  }

  if (req.method === "PUT") {
    const { scheduleIds } = req.body || {};
    if (!Array.isArray(scheduleIds)) {
      res.status(400).json({ error: "scheduleIds must be an array" });
      return;
    }
    await prisma.$transaction([
      prisma.userAffirmationSubscription.deleteMany({ where: { userId: req.user.id } }),
      prisma.userAffirmationSubscription.createMany({
        data: scheduleIds.map((scheduleId) => ({ userId: req.user.id, scheduleId })),
        skipDuplicates: true,
      }),
    ]);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
