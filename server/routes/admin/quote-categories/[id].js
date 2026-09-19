const { withAdmin } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { name, isActive } = req.body || {};
    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (isActive !== undefined) data.isActive = isActive;
    const updated = await prisma.quoteCategory.update({ where: { id }, data });
    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.quoteCategory.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
