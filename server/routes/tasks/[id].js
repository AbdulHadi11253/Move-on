const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { title, description, category } = req.body || {};
    const task = await prisma.task.update({ where: { id }, data: { title, description, category } });
    res.status(200).json(task);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.task.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
