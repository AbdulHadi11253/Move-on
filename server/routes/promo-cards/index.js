const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

// User-facing: only active promo cards, in admin-defined order. The Home screen
// hides the whole section when this returns an empty list.
module.exports = withAuth(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const cards = await prisma.promoCard.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  res.status(200).json(cards);
});
