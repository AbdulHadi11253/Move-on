const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");
const { applyDayUnlock } = require("../../lib/journeyUnlock");

module.exports = withAuth(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let enrollment = await prisma.userJourney.findFirst({
    where: { userId: req.user.id, isActive: true },
    include: { journey: true },
  });

  if (!enrollment) {
    res.status(200).json({ hasActiveJourney: false });
    return;
  }

  const totalDays = enrollment.journey.totalDays;
  enrollment = { ...enrollment, ...(await applyDayUnlock(enrollment, totalDays)) };
  const completedTasks = await prisma.taskCompletion.findMany({
    where: { userId: req.user.id, journeyId: enrollment.journeyId },
    include: { task: true },
    orderBy: { dayNumber: "asc" },
  });

  res.status(200).json({
    hasActiveJourney: true,
    journeyTitle: enrollment.journey.title,
    currentDay: enrollment.currentDay,
    totalDays,
    percentComplete: Math.min(100, Math.round(((enrollment.currentDay - 1) / totalDays) * 100)),
    streak: enrollment.streak,
    completedTasks,
  });
});
