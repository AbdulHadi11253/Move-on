const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method === "GET") {
    const categories = await prisma.quoteCategory.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    res.status(200).json(categories);
    return;
  }

  if (req.method === "POST") {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const last = await prisma.quoteCategory.findFirst({ orderBy: { order: "desc" } });
    const created = await prisma.quoteCategory.create({
      data: { name: name.trim(), order: (last?.order || 0) + 1 },
    });
    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
