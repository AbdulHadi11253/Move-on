const { withAuth, withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return withAuth(async (req, res) => {
      const quotes = await prisma.quote.findMany({ orderBy: { createdAt: "desc" } });
      const favorites = await prisma.favoriteQuote.findMany({ where: { userId: req.user.id } });
      const saved = await prisma.savedQuote.findMany({ where: { userId: req.user.id } });
      const favoriteIds = new Set(favorites.map((f) => f.quoteId));
      const savedIds = new Set(saved.map((s) => s.quoteId));
      res.status(200).json(
        quotes.map((q) => ({ ...q, isFavorite: favoriteIds.has(q.id), isSaved: savedIds.has(q.id) }))
      );
    })(req, res);
  }

  if (req.method === "POST") {
    return withAdmin(async (req, res) => {
      const { text, author, category } = req.body || {};
      if (!text) {
        res.status(400).json({ error: "text is required" });
        return;
      }
      const quote = await prisma.quote.create({ data: { text, author, category } });
      res.status(201).json(quote);
    })(req, res);
  }

  res.status(405).json({ error: "Method not allowed" });
};
