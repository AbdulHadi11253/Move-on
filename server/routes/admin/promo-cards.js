const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method === "GET") {
    const cards = await prisma.promoCard.findMany({ orderBy: { order: "asc" } });
    res.status(200).json(cards);
    return;
  }

  if (req.method === "POST") {
    const { title, subtitle, imageUrl, linkUrl, order } = req.body || {};
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    const card = await prisma.promoCard.create({ data: { title, subtitle, imageUrl, linkUrl, order } });
    res.status(201).json(card);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
