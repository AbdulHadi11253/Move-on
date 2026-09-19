const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { title, subtitle, buttonLabel, isEnabled } = req.body || {};
  const block = await prisma.appContent.update({
    where: { id },
    data: { title, subtitle, buttonLabel, isEnabled },
  });
  res.status(200).json(block);
});
