const { withAuth, withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");
const { applyDayUnlock, unlockInfo } = require("../../lib/journeyUnlock");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return withAuth(async (req, res) => {
      const journeys = await prisma.journey.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { days: true } },
          enrollments: { where: { userId: req.user.id } },
        },
        orderBy: { createdAt: "asc" },
      });

      const shaped = await Promise.all(
        journeys.map(async (j) => {
          let enrollment = j.enrollments[0] || null;
          const { enrollments, _count, ...rest } = j;
          // Only the active enrollment needs the lazy 24h unlock applied.
          if (enrollment && enrollment.isActive) {
            enrollment = { ...enrollment, ...(await applyDayUnlock(enrollment, j.totalDays)) };
          }
          const unlock = enrollment ? unlockInfo(enrollment) : { dayCompleted: false, nextUnlockAt: null };
          return {
            ...rest,
            daysConfigured: _count.days,
            enrollment: enrollment
              ? {
                  currentDay: enrollment.currentDay,
                  streak: enrollment.streak,
                  isActive: enrollment.isActive,
                  dayCompleted: unlock.dayCompleted,
                  nextUnlockAt: unlock.nextUnlockAt,
                }
              : null,
          };
        })
      );

      res.status(200).json(shaped);
    })(req, res);
  }

  if (req.method === "POST") {
    return withAdmin(async (req, res) => {
      const { title, description, audience, totalDays, dayLabel } = req.body || {};
      const days = parseInt(totalDays, 10);
      if (!title || !days || days < 1) {
        res.status(400).json({ error: "title and a positive totalDays are required" });
        return;
      }
      const journey = await prisma.journey.create({
        data: { title, description, audience, totalDays: days, dayLabel: dayLabel?.trim() || "Day" },
      });
      res.status(201).json(journey);
    })(req, res);
  }

  res.status(405).json({ error: "Method not allowed" });
};
