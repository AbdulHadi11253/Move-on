const { withAdmin } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { title, subtitle, imageUrl, linkUrl, order, isActive } = req.body || {};
    const card = await prisma.promoCard.update({
      where: { id },
      data: { title, subtitle, imageUrl, linkUrl, order, isActive },
    });
    res.status(200).json(card);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.promoCard.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
