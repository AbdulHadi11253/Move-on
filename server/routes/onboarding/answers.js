const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { answers } = req.body || {};
  if (!Array.isArray(answers)) {
    res.status(400).json({ error: "answers must be an array of { questionId, answer }" });
    return;
  }

  // Empty array is allowed — e.g. when there are no onboarding questions
  // configured, the user still needs to be marked as onboarded.
  if (answers.length > 0) {
    await prisma.$transaction(
      answers.map(({ questionId, answer }) =>
        prisma.onboardingAnswer.upsert({
          where: { userId_questionId: { userId: req.user.id, questionId } },
          update: { answer: String(answer) },
          create: { userId: req.user.id, questionId, answer: String(answer) },
        })
      )
    );
  }

  // The first onboarding question asks for the user's name — sync it onto
  // the User record so it can be used as the display name across the app.
  const nameQuestion = await prisma.onboardingQuestion.findUnique({ where: { order: 1 } });
  const nameAnswer = nameQuestion && answers.find((a) => a.questionId === nameQuestion.id);

  // No journey is auto-assigned here — the user picks one on the Journey tab.
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      onboardingComplete: true,
      ...(nameAnswer?.answer ? { name: String(nameAnswer.answer).trim() } : {}),
    },
  });

  res.status(200).json({ user });
});
