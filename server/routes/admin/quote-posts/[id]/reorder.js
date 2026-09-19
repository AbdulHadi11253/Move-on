const { withAdmin } = require("../../../../lib/auth");
const { prisma } = require("../../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { id } = req.query;
  const { direction, field } = req.body || {};
  if (!["up", "down"].includes(direction)) {
    res.status(400).json({ error: "direction must be 'up' or 'down'" });
    return;
  }
  const orderField = field === "homeOrder" ? "homeOrder" : "order";

  const current = await prisma.quotePost.findUnique({ where: { id } });
  if (!current) {
    res.status(404).json({ error: "Quote post not found" });
    return;
  }

  const where = {
    [orderField]: direction === "up" ? { lt: current[orderField] } : { gt: current[orderField] },
  };
  // Home ordering only makes sense among posts actually shown on Home.
  if (orderField === "homeOrder") where.showOnHome = true;

  const neighbor = await prisma.quotePost.findFirst({
    where,
    orderBy: { [orderField]: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) {
    res.status(200).json({ moved: false });
    return;
  }

  await prisma.$transaction([
    prisma.quotePost.update({ where: { id: current.id }, data: { [orderField]: neighbor[orderField] } }),
    prisma.quotePost.update({ where: { id: neighbor.id }, data: { [orderField]: current[orderField] } }),
  ]);

  res.status(200).json({ moved: true });
});
