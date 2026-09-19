const { withAuth } = require("../../../../lib/auth");
const { prisma } = require("../../../../lib/prisma");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Marks a single task complete for today. Once every task scheduled for the
// current day is complete, we stamp dayCompletedAt and update the streak — but
// the day itself does NOT advance until 24h later (see lib/journeyUnlock.js).
module.exports = withAuth(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { taskId } = req.query;

  const enrollment = await prisma.userJourney.findFirst({
    where: { userId: req.user.id, isActive: true },
  });
  if (!enrollment) {
    res.status(404).json({ error: "No active journey" });
    return;
  }

  const day = await prisma.journeyDay.findUnique({
    where: { journeyId_dayNumber: { journeyId: enrollment.journeyId, dayNumber: enrollment.currentDay } },
    include: { tasks: true },
  });

  const scheduledTaskIds = (day?.tasks || []).map((t) => t.taskId);
  if (!scheduledTaskIds.includes(taskId)) {
    res.status(400).json({ error: "This task is not scheduled for today" });
    return;
  }

  await prisma.taskCompletion.upsert({
    where: {
      userId_journeyId_taskId_dayNumber: {
        userId: req.user.id,
        journeyId: enrollment.journeyId,
        taskId,
        dayNumber: enrollment.currentDay,
      },
    },
    update: {},
    create: { userId: req.user.id, journeyId: enrollment.journeyId, taskId, dayNumber: enrollment.currentDay },
  });

  const completions = await prisma.taskCompletion.findMany({
    where: { userId: req.user.id, journeyId: enrollment.journeyId, dayNumber: enrollment.currentDay },
  });
  const allDone = scheduledTaskIds.every((id) => completions.some((c) => c.taskId === id));

  if (!allDone) {
    res.status(200).json(enrollment);
    return;
  }

  // Already marked complete for today — don't re-stamp or double-count the streak.
  if (enrollment.dayCompletedAt) {
    res.status(200).json(enrollment);
    return;
  }

  const daysSinceActive = (Date.now() - enrollment.lastActiveAt.getTime()) / ONE_DAY_MS;
  const nextStreak = daysSinceActive <= 2 ? enrollment.streak + 1 : 1;

  // Stamp completion; the day advances 24h later via applyDayUnlock().
  const updated = await prisma.userJourney.update({
    where: { id: enrollment.id },
    data: {
      dayCompletedAt: new Date(),
      streak: nextStreak,
      lastActiveAt: new Date(),
    },
  });

  res.status(200).json(updated);
});
