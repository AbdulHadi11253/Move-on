const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const enrollment = await prisma.userJourney.findFirst({
    where: { userId: req.user.id, isActive: true },
  });
  if (!enrollment) {
    res.status(404).json({ error: "No active journey" });
    return;
  }

  const [updated] = await prisma.$transaction([
    prisma.userJourney.update({
      where: { id: enrollment.id },
      data: { currentDay: 1, streak: 0, lastActiveAt: new Date() },
    }),
    prisma.taskCompletion.deleteMany({ where: { userId: req.user.id, journeyId: enrollment.journeyId } }),
  ]);

  res.status(200).json(updated);
});
