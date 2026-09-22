const { withAdmin } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method === "GET") {
    const messages = await prisma.affirmationMessage.findMany({ orderBy: { order: "asc" } });
    res.status(200).json(messages);
    return;
  }

  if (req.method === "POST") {
    const { title, body, imageUrl } = req.body || {};
    if (!title?.trim() || !body?.trim()) {
      res.status(400).json({ error: "title and body are required" });
      return;
    }
    const last = await prisma.affirmationMessage.findFirst({ orderBy: { order: "desc" } });
    const created = await prisma.affirmationMessage.create({
      data: { title: title.trim(), body: body.trim(), imageUrl: imageUrl || null, order: (last?.order || 0) + 1 },
    });
    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
