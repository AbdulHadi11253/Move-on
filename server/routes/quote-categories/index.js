const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const categories = await prisma.quoteCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  res.status(200).json(categories);
});
