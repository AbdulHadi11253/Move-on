const { withAuth } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  const { id: quoteId } = req.query;

  if (req.method === "POST") {
    const saved = await prisma.savedQuote.upsert({
      where: { userId_quoteId: { userId: req.user.id, quoteId } },
      update: {},
      create: { userId: req.user.id, quoteId },
    });
    res.status(200).json(saved);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.savedQuote
      .delete({ where: { userId_quoteId: { userId: req.user.id, quoteId } } })
      .catch(() => {});
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
