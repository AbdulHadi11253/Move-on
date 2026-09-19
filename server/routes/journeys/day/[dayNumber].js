const { withAuth } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const dayNumber = parseInt(req.query.dayNumber, 10);
  if (!dayNumber || dayNumber < 1) {
    res.status(400).json({ error: "Invalid day number" });
    return;
  }

  const enrollment = await prisma.userJourney.findFirst({
    where: { userId: req.user.id, isActive: true },
    include: { journey: true },
  });

  if (!enrollment) {
    res.status(404).json({ error: "No active journey" });
    return;
  }

  if (dayNumber > enrollment.currentDay) {
    res.status(423).json({ error: "This day is locked" });
    return;
  }

  const day = await prisma.journeyDay.findUnique({
    where: { journeyId_dayNumber: { journeyId: enrollment.journeyId, dayNumber } },
    include: { quotes: { include: { quote: true } }, tasks: { include: { task: true } }, lessons: { include: { lesson: true } } },
  });

  const tasks = day?.tasks.map((t) => t.task) || [];
  const completions = await prisma.taskCompletion.findMany({
    where: {
      userId: req.user.id,
      journeyId: enrollment.journeyId,
      dayNumber,
      taskId: { in: tasks.map((t) => t.id) },
    },
  });
  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  res.status(200).json({
    dayNumber,
    isToday: dayNumber === enrollment.currentDay,
    quotes: day?.quotes.map((q) => q.quote) || [],
    lessons: day?.lessons.map((l) => l.lesson) || [],
    tasks: tasks.map((t) => ({ ...t, done: completedTaskIds.has(t.id) })),
  });
});
