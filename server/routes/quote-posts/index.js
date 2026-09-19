const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { categoryId, type, sort, popular, saved, home, limit } = req.query;
  const where = { isActive: true };
  if (categoryId) where.categoryId = categoryId;
  if (popular === "true") where.isPopular = true;
  if (home === "true") where.showOnHome = true;
  if (saved === "true") where.saves = { some: { userId: req.user.id } };

  const orderBy =
    sort === "latest"
      ? { createdAt: "desc" }
      : sort === "oldest"
      ? { createdAt: "asc" }
      : home === "true"
      ? { homeOrder: "asc" }
      : { order: "asc" };

  const posts = await prisma.quotePost.findMany({
    where,
    orderBy,
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true } },
      saves: { where: { userId: req.user.id } },
    },
  });

  let shaped = posts.map((p) => {
    const { saves, _count, images, ...rest } = p;
    return {
      ...rest,
      images,
      type: images.length > 1 ? "CAROUSEL" : "SINGLE",
      isSaved: saves.length > 0,
      commentCount: _count.comments,
    };
  });

  // type filter is applied post-query since it's derived from image count, not stored
  if (type) shaped = shaped.filter((p) => p.type === type);
  if (limit) shaped = shaped.slice(0, parseInt(limit, 10));

  res.status(200).json(shaped);
});
