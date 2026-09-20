const { withAuth } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  if (req.method === "GET") {
    const settings = await prisma.notificationSetting.findUnique({ where: { userId: req.user.id } });
    res.status(200).json(settings || { dailyReminder: true, reminderTime: "09:00" });
    return;
  }
  if (req.method === "PATCH") {
    const { dailyReminder, reminderTime } = req.body || {};
    if (reminderTime !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) {
      res.status(400).json({ error: "reminderTime must be HH:MM" });
      return;
    }
    const data = {};
    if (typeof dailyReminder === "boolean") data.dailyReminder = dailyReminder;
    if (reminderTime !== undefined) data.reminderTime = reminderTime;
    const settings = await prisma.notificationSetting.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data },
    });
    res.status(200).json(settings);
    return;
  }
  res.status(405).json({ error: "Method not allowed" });
});
