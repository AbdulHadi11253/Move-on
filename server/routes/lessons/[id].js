const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { title, content, category, readMinutes } = req.body || {};
    const lesson = await prisma.lesson.update({ where: { id }, data: { title, content, category, readMinutes } });
    res.status(200).json(lesson);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.lesson.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
