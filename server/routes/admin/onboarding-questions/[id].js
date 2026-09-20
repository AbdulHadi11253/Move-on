const { withAdmin } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { question, type, options, order, isEnabled, batch } = req.body || {};
    const data = { question, type, order, isEnabled };
    if (batch !== undefined) data.batch = Number(batch) > 0 ? Number(batch) : 1;
    if (options !== undefined) data.options = options;
    const updated = await prisma.onboardingQuestion.update({ where: { id }, data });
    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    await prisma.onboardingQuestion.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
