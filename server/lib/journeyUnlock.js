const { prisma } = require("./prisma");
const { sendPushToUser } = require("./push");

// The next journey day unlocks exactly 24h after the current day's tasks are
// finished. This timing is fixed by the system (admin can edit the message, not
// the timing).
const UNLOCK_MS = 24 * 60 * 60 * 1000;

// Push the user a notification when their new day's activities open. The message
// is admin-editable via the `notif_new_day` AppContent block; if the admin
// disables that block, no notification is sent.
async function notifyNewDay(userId, dayNumber, dayLabel) {
  try {
    const content = await prisma.appContent.findUnique({ where: { key: "notif_new_day" } });
    if (content && content.isEnabled === false) return;
    const title = content?.title || "A new day has opened";
    const body = content?.subtitle || `${dayLabel || "Day"} ${dayNumber} is ready. Open the app to continue your journey.`;
    await sendPushToUser(userId, title, body, { type: "new_day", dayNumber }, content?.imageUrl || null);
  } catch (e) {
    console.error("notifyNewDay failed:", e.message);
  }
}

// Lazily advances the enrollment to the next day if the 24h lock has elapsed.
// Call whenever reading journey state so unlocking happens without a cron job.
// Returns the (possibly updated) enrollment record.
async function applyDayUnlock(enrollment, totalDays) {
  if (!enrollment.dayCompletedAt) return enrollment;

  const unlockAt = enrollment.dayCompletedAt.getTime() + UNLOCK_MS;
  if (Date.now() < unlockAt) return enrollment; // still within the 24h lock

  if (enrollment.currentDay >= totalDays) {
    // Journey is finished — just clear the pending flag.
    return prisma.userJourney.update({
      where: { id: enrollment.id },
      data: { dayCompletedAt: null },
    });
  }

  const updated = await prisma.userJourney.update({
    where: { id: enrollment.id },
    data: { currentDay: enrollment.currentDay + 1, dayCompletedAt: null, lastActiveAt: new Date() },
  });

  // Fire-and-forget push telling the user their new day's activities are open.
  const dayLabel = enrollment.journey?.dayLabel;
  notifyNewDay(enrollment.userId, updated.currentDay, dayLabel);

  return updated;
}

// Countdown info for the client: whether the current day is done-and-waiting,
// and the ISO timestamp when the next day unlocks.
function unlockInfo(enrollment) {
  if (!enrollment.dayCompletedAt) return { dayCompleted: false, nextUnlockAt: null };
  return {
    dayCompleted: true,
    nextUnlockAt: new Date(enrollment.dayCompletedAt.getTime() + UNLOCK_MS).toISOString(),
  };
}

module.exports = { applyDayUnlock, unlockInfo, UNLOCK_MS };
