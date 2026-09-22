const { withAdmin } = require("../../../../lib/auth");
const { prisma } = require("../../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { time, isEnabled } = req.body || {};
    if (time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      res.status(400).json({ error: "time must be HH:MM (24h)" });
      return;
    }
    const data = {};
    if (time !== undefined) data.time = time;
    if (isEnabled !== undefined) data.isEnabled = isEnabled;
    const updated = await prisma.affirmationSchedule.update({ where: { id }, data });
    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.affirmationSchedule.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
