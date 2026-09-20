const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method === "GET") {
    const questions = await prisma.onboardingQuestion.findMany({ orderBy: [{ batch: "asc" }, { order: "asc" }] });
    res.status(200).json(questions);
    return;
  }

  if (req.method === "POST") {
    const { question, type, options, order, batch } = req.body || {};
    if (!question || !type) {
      res.status(400).json({ error: "question and type are required" });
      return;
    }
    if (!["single_choice", "multi_choice", "text", "number"].includes(type)) {
      res.status(400).json({ error: "type must be single_choice, multi_choice, text, or number" });
      return;
    }

    let nextOrder = order;
    if (!nextOrder) {
      const last = await prisma.onboardingQuestion.findFirst({ orderBy: { order: "desc" } });
      nextOrder = (last?.order || 0) + 1;
    }

    const created = await prisma.onboardingQuestion.create({
      data: { question, type, options: options || null, order: nextOrder, batch: Number(batch) > 0 ? Number(batch) : 1 },
    });
    res.status(201).json(created);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
