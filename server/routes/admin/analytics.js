const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const [totalUsers, onboardedUsers, activeTrials, activeSubs, totalTaskCompletions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { onboardingComplete: true } }),
    prisma.subscription.count({ where: { status: "TRIAL" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.taskCompletion.count(),
  ]);

  res.status(200).json({
    totalUsers,
    onboardedUsers,
    activeTrials,
    activeSubscriptions: activeSubs,
    totalTaskCompletions,
  });
});
