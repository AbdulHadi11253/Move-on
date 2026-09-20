const { prisma } = require("../../lib/prisma");

// Public on purpose: onboarding questions are shown before the user has an
// account, and answers are submitted after they sign up.
module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const questions = await prisma.onboardingQuestion.findMany({
    where: { isEnabled: true },
    orderBy: [{ batch: "asc" }, { order: "asc" }],
  });
  res.status(200).json(questions);
};
