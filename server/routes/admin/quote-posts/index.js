const { withAdmin } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method === "GET") {
    const posts = await prisma.quotePost.findMany({
      orderBy: { order: "asc" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        _count: { select: { comments: true, saves: true } },
      },
    });
    res.status(200).json(posts);
    return;
  }

  if (req.method === "POST") {
    const { images, categoryId, commentsEnabled, isPopular, showOnHome } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      res.status(400).json({ error: "images must be a non-empty array of { url, path }" });
      return;
    }

    const last = await prisma.quotePost.findFirst({ orderBy: { order: "desc" } });
    const lastHome = await prisma.quotePost.findFirst({ orderBy: { homeOrder: "desc" } });

    const created = await prisma.quotePost.create({
      data: {
        categoryId: categoryId || null,
        commentsEnabled: commentsEnabled !== undefined ? commentsEnabled : true,
        isPopular: !!isPopular,
        showOnHome: !!showOnHome,
        order: (last?.order || 0) + 1,
        homeOrder: (lastHome?.homeOrder || 0) + 1,
        images: {
          create: images.map((img, i) => ({ imageUrl: img.url, imagePath: img.path, order: i })),
        },
      },
      include: { category: true, images: { orderBy: { order: "asc" } } },
    });
    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
