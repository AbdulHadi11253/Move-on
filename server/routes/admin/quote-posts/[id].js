const { withAdmin } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");
const { supabase, QUOTE_IMAGES_BUCKET } = require("../../../lib/supabase");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { images, categoryId, commentsEnabled, isActive, isPopular, showOnHome } = req.body || {};

    const existing = await prisma.quotePost.findUnique({ where: { id }, include: { images: true } });
    if (!existing) {
      res.status(404).json({ error: "Quote post not found" });
      return;
    }

    const data = {};
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (commentsEnabled !== undefined) data.commentsEnabled = commentsEnabled;
    if (isActive !== undefined) data.isActive = isActive;
    if (isPopular !== undefined) data.isPopular = isPopular;
    if (showOnHome !== undefined) {
      data.showOnHome = showOnHome;
      if (showOnHome && !existing.showOnHome) {
        const lastHome = await prisma.quotePost.findFirst({ orderBy: { homeOrder: "desc" } });
        data.homeOrder = (lastHome?.homeOrder || 0) + 1;
      }
    }

    const replacingImages = Array.isArray(images) && images.length > 0;
    if (replacingImages) {
      data.images = {
        deleteMany: {},
        create: images.map((img, i) => ({ imageUrl: img.url, imagePath: img.path, order: i })),
      };
    }

    const updated = await prisma.quotePost.update({
      where: { id },
      data,
      include: { category: true, images: { orderBy: { order: "asc" } } },
    });

    if (replacingImages) {
      // Only delete storage files that are actually being dropped, not ones
      // the admin kept (they're re-sent with the same url/path when unchanged).
      const keptPaths = new Set(images.map((img) => img.path));
      const removedPaths = existing.images.map((i) => i.imagePath).filter((p) => !keptPaths.has(p));
      if (removedPaths.length > 0) {
        await supabase.storage.from(QUOTE_IMAGES_BUCKET).remove(removedPaths);
      }
    }

    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    const existing = await prisma.quotePost.findUnique({ where: { id }, include: { images: true } });
    if (!existing) {
      res.status(404).json({ error: "Quote post not found" });
      return;
    }

    await prisma.quotePost.delete({ where: { id } });

    if (existing.images.length > 0) {
      await supabase.storage.from(QUOTE_IMAGES_BUCKET).remove(existing.images.map((i) => i.imagePath));
    }

    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
