const { withAuth } = require("../../../../lib/auth");
const { prisma } = require("../../../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  const { id: postId } = req.query;

  if (req.method === "GET") {
    const comments = await prisma.quotePostComment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(200).json(comments);
    return;
  }

  if (req.method === "POST") {
    const post = await prisma.quotePost.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ error: "Quote post not found" });
      return;
    }
    if (!post.commentsEnabled) {
      res.status(403).json({ error: "Comments are disabled for this quote" });
      return;
    }

    const { text } = req.body || {};
    if (!text || !text.trim()) {
      res.status(400).json({ error: "text is required" });
      return;
    }

    const comment = await prisma.quotePostComment.create({
      data: { postId, userId: req.user.id, text: text.trim() },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json(comment);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
