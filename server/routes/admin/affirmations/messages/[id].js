const { withAdmin } = require("../../../../lib/auth");
const { prisma } = require("../../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { title, body, imageUrl, isEnabled, order } = req.body || {};
    const data = {};
    if (title !== undefined) data.title = title;
    if (body !== undefined) data.body = body;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (isEnabled !== undefined) data.isEnabled = isEnabled;
    if (order !== undefined) data.order = order;
    const updated = await prisma.affirmationMessage.update({ where: { id }, data });
    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.affirmationMessage.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
