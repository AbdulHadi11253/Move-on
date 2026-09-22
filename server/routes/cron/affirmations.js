const { prisma } = require("../../lib/prisma");
const { sendPushToUsers } = require("../../lib/push");

// Fires due AffirmationSchedule slots. Meant to be pinged every 5-15 minutes
// (see README/deploy notes — Vercel's Hobby-plan cron only runs once a day,
// so an external pinger or a Pro-plan cron is required for real same-day
// multiple-times-a-day sends). Idempotent: each slot only sends once per UTC
// calendar day via lastSentDate, and a slot is "due" for a 15-minute window
// after its scheduled time so a ping cadence slower than 1/minute still
// catches it exactly once.
const FIRING_WINDOW_MINUTES = 15;

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function pickMessage(messages) {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return messages[dayIndex % messages.length];
}

module.exports = async (req, res) => {
  const expected = process.env.CRON_SECRET;
  const auth = req.headers.authorization;
  if (!expected || auth !== `Bearer ${expected}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const [slots, messages] = await Promise.all([
    prisma.affirmationSchedule.findMany({ where: { isEnabled: true } }),
    prisma.affirmationMessage.findMany({ where: { isEnabled: true }, orderBy: { order: "asc" } }),
  ]);

  if (messages.length === 0) {
    res.status(200).json({ fired: 0, reason: "no enabled affirmation messages" });
    return;
  }

  const due = slots.filter((s) => {
    if (s.lastSentDate === today) return false;
    const slotMinutes = toMinutes(s.time);
    return nowMinutes >= slotMinutes && nowMinutes < slotMinutes + FIRING_WINDOW_MINUTES;
  });

  const results = [];
  for (const slot of due) {
    const message = pickMessage(messages);
    const subs = await prisma.userAffirmationSubscription.findMany({
      where: { scheduleId: slot.id },
      select: { userId: true },
    });
    const sent = await sendPushToUsers(
      subs.map((s) => s.userId),
      message.title,
      message.body,
      { type: "affirmation" },
      message.imageUrl
    );
    await prisma.affirmationSchedule.update({ where: { id: slot.id }, data: { lastSentDate: today } });
    results.push({ time: slot.time, subscribers: subs.length, devicesSent: sent, message: message.title });
  }

  res.status(200).json({ fired: results.length, results });
};
