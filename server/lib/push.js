const { prisma } = require("./prisma");

function buildMessage(token, title, body, data, imageUrl) {
  const msg = { to: token, title, body, sound: "default", data };
  // Android shows this out of the box. iOS needs a Notification Service
  // Extension to render it (not currently built into this app) — without one
  // iOS silently falls back to a plain text notification, it doesn't error.
  if (imageUrl) msg.richContent = { image: imageUrl };
  return msg;
}

async function sendExpoPush(messages) {
  if (messages.length === 0) return;
  // Expo accepts at most 100 messages per request.
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chunk),
      });
    } catch (e) {
      console.error("push send failed:", e.message);
    }
  }
}

// Sends an Expo push notification to every device registered to a user.
// Best-effort: failures are logged, never thrown (callers shouldn't break on
// a push failure).
async function sendPushToUser(userId, title, body, data = {}, imageUrl = null) {
  const tokens = await prisma.pushToken.findMany({ where: { userId }, select: { token: true } });
  if (tokens.length === 0) return 0;
  const messages = tokens.map((t) => buildMessage(t.token, title, body, data, imageUrl));
  await sendExpoPush(messages);
  return messages.length;
}

// Same as sendPushToUser but for every device of many users in one batch —
// used by broadcasts (admin "send to all") and the affirmations cron.
async function sendPushToUsers(userIds, title, body, data = {}, imageUrl = null) {
  if (userIds.length === 0) return 0;
  const tokens = await prisma.pushToken.findMany({ where: { userId: { in: userIds } }, select: { token: true } });
  if (tokens.length === 0) return 0;
  const messages = tokens.map((t) => buildMessage(t.token, title, body, data, imageUrl));
  await sendExpoPush(messages);
  return messages.length;
}

module.exports = { sendPushToUser, sendPushToUsers };
