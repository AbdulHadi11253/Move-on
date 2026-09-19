const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

// Readable by any authenticated user (mobile screens use it), editable only via admin PATCH on [id].js.
module.exports = withAuth(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const blocks = await prisma.appContent.findMany({ orderBy: { key: "asc" } });
  res.status(200).json(blocks);
});
