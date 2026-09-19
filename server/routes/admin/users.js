const { withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method === "GET") {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        onboardingComplete: true,
        createdAt: true,
        subscription: { select: { status: true, plan: true } },
        journeyEnrollments: {
          where: { isActive: true },
          take: 1,
          select: { currentDay: true, streak: true, journey: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(users);
    return;
  }

  if (req.method === "PATCH") {
    const { userId, role } = req.body || {};
    if (!userId || !["USER", "ADMIN"].includes(role)) {
      res.status(400).json({ error: "userId and role (USER | ADMIN) are required" });
      return;
    }
    const user = await prisma.user.update({ where: { id: userId }, data: { role } });
    res.status(200).json(user);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
