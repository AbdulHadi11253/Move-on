const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");
const { applyDayUnlock, unlockInfo } = require("../../lib/journeyUnlock");

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

  // Advance the day if the 24h lock has elapsed.
  enrollment = { ...enrollment, ...(await applyDayUnlock(enrollment, enrollment.journey.totalDays)) };
  const unlock = unlockInfo(enrollment);

  const day = await prisma.journeyDay.findUnique({
    where: { journeyId_dayNumber: { journeyId: enrollment.journeyId, dayNumber: enrollment.currentDay } },
    include: { quotes: { include: { quote: true } }, tasks: { include: { task: true } }, lessons: { include: { lesson: true } } },
  });

  const tasks = day?.tasks.map((t) => t.task) || [];
  const completions = await prisma.taskCompletion.findMany({
    where: {
      userId: req.user.id,
      journeyId: enrollment.journeyId,
      dayNumber: enrollment.currentDay,
      taskId: { in: tasks.map((t) => t.id) },
    },
  });
  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  res.status(200).json({
    hasActiveJourney: true,
    journeyId: enrollment.journeyId,
    journeyTitle: enrollment.journey.title,
    dayLabel: enrollment.journey.dayLabel,
    currentDay: enrollment.currentDay,
    totalDays: enrollment.journey.totalDays,
    streak: enrollment.streak,
    quotes: day?.quotes.map((q) => q.quote) || [],
    lessons: day?.lessons.map((l) => l.lesson) || [],
    tasks: tasks.map((t) => ({ ...t, done: completedTaskIds.has(t.id) })),
    allTasksDone: tasks.length > 0 && tasks.every((t) => completedTaskIds.has(t.id)),
    dayCompleted: unlock.dayCompleted,
    nextUnlockAt: unlock.nextUnlockAt,
  });
});
