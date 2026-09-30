const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

// Marks the one-time "Hold to Heal" long-press as completed for this
// account. Permanent — never reset by resetting journey progress, logging
// out, or reinstalling.
module.exports = withAuth(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { hasStartedRecovery: true },
  });
  res.status(200).json({ hasStartedRecovery: user.hasStartedRecovery });
});
