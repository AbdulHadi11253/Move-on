const { withAdmin } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

// Admin sets/overwrites the quotes/tasks/lessons assigned to a specific day of a journey.
// Accepts arrays so multiple items of each type can be assigned to the same day.
module.exports = withAdmin(async (req, res) => {
  const { id: journeyId } = req.query;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { dayNumber, quoteIds = [], taskIds = [], lessonIds = [] } = req.body || {};
  if (!dayNumber) {
    res.status(400).json({ error: "dayNumber is required" });
    return;
  }

  const day = await prisma.journeyDay.upsert({
    where: { journeyId_dayNumber: { journeyId, dayNumber } },
    update: {},
    create: { journeyId, dayNumber },
  });

  await prisma.$transaction([
    prisma.journeyDayQuote.deleteMany({ where: { journeyDayId: day.id } }),
    prisma.journeyDayTask.deleteMany({ where: { journeyDayId: day.id } }),
    prisma.journeyDayLesson.deleteMany({ where: { journeyDayId: day.id } }),
    ...(quoteIds.length
      ? [prisma.journeyDayQuote.createMany({ data: quoteIds.map((quoteId) => ({ journeyDayId: day.id, quoteId })) })]
      : []),
    ...(taskIds.length
      ? [prisma.journeyDayTask.createMany({ data: taskIds.map((taskId) => ({ journeyDayId: day.id, taskId })) })]
      : []),
    ...(lessonIds.length
      ? [prisma.journeyDayLesson.createMany({ data: lessonIds.map((lessonId) => ({ journeyDayId: day.id, lessonId })) })]
      : []),
  ]);

  const result = await prisma.journeyDay.findUnique({
    where: { id: day.id },
    include: { quotes: { include: { quote: true } }, tasks: { include: { task: true } }, lessons: { include: { lesson: true } } },
  });

  res.status(200).json(result);
});
