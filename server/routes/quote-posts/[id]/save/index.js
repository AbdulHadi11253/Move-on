const { withAuth } = require("../../../../lib/auth");
const { prisma } = require("../../../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  const { id: postId } = req.query;

  if (req.method === "POST") {
    const saved = await prisma.quotePostSave.upsert({
      where: { userId_postId: { userId: req.user.id, postId } },
      update: {},
      create: { userId: req.user.id, postId },
    });
    res.status(200).json(saved);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.quotePostSave
      .delete({ where: { userId_postId: { userId: req.user.id, postId } } })
      .catch(() => {});
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
