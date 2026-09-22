const { withAdmin } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method === "GET") {
    const slots = await prisma.affirmationSchedule.findMany({ orderBy: { time: "asc" } });
    res.status(200).json(slots);
    return;
  }

  if (req.method === "POST") {
    const { time } = req.body || {};
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "")) {
      res.status(400).json({ error: "time must be HH:MM (24h)" });
      return;
    }
    const created = await prisma.affirmationSchedule.create({ data: { time } });
    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
