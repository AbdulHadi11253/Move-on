const { withAuth } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

// Makes this journey the user's active one. If the user already has progress
// in it, that progress (currentDay/streak) is resumed as-is. Any other journey
// the user was on is paused (isActive: false) but keeps its own progress.
module.exports = withAuth(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { id: journeyId } = req.query;

  const journey = await prisma.journey.findUnique({ where: { id: journeyId } });
  if (!journey) {
    res.status(404).json({ error: "Journey not found" });
    return;
  }

  await prisma.userJourney.updateMany({
    where: { userId: req.user.id, isActive: true },
    data: { isActive: false },
  });

  const enrollment = await prisma.userJourney.upsert({
    where: { userId_journeyId: { userId: req.user.id, journeyId } },
    update: { isActive: true, lastActiveAt: new Date() },
    create: { userId: req.user.id, journeyId, isActive: true },
    include: { journey: true },
  });

  res.status(200).json(enrollment);
});
