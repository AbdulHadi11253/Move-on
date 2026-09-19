const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { token, platform } = req.body || {};
  if (!token) {
    res.status(400).json({ error: "token is required" });
    return;
  }

  await prisma.pushToken.upsert({
    where: { token },
    update: { userId: req.user.id, platform },
    create: { userId: req.user.id, token, platform: platform || "unknown" },
  });

  res.status(200).json({ ok: true });
});
