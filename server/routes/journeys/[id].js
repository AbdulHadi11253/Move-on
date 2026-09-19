const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "GET") {
    const journey = await prisma.journey.findUnique({
      where: { id },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            quotes: { include: { quote: true } },
            tasks: { include: { task: true } },
            lessons: { include: { lesson: true } },
          },
        },
      },
    });
    if (!journey) {
      res.status(404).json({ error: "Journey not found" });
      return;
    }
    res.status(200).json(journey);
    return;
  }

  if (req.method === "PATCH") {
    const { title, description, audience, totalDays, isActive, dayLabel } = req.body || {};
    const data = { title, description, audience, isActive };
    if (totalDays !== undefined) data.totalDays = parseInt(totalDays, 10);
    if (dayLabel !== undefined) data.dayLabel = dayLabel.trim() || "Day";
    const journey = await prisma.journey.update({ where: { id }, data });
    res.status(200).json(journey);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.journey.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
