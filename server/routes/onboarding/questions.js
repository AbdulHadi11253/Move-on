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
  // Public and identical for everyone — every single new install hits this
  // before sign-in, so letting Vercel's edge serve it from cache keeps that
  // load off the database as installs scale.
  res.setHeader("Cache-Control", "public, max-age=120, s-maxage=120, stale-while-revalidate=300");
  res.status(200).json(questions);
};
