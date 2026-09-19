const { withAuth } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  const { id: quoteId } = req.query;

  if (req.method === "POST") {
    const favorite = await prisma.favoriteQuote.upsert({
      where: { userId_quoteId: { userId: req.user.id, quoteId } },
      update: {},
      create: { userId: req.user.id, quoteId },
    });
    res.status(200).json(favorite);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.favoriteQuote
      .delete({ where: { userId_quoteId: { userId: req.user.id, quoteId } } })
      .catch(() => {});
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
