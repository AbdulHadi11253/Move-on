const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { text, author, category } = req.body || {};
    const quote = await prisma.quote.update({ where: { id }, data: { text, author, category } });
    res.status(200).json(quote);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.quote.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
