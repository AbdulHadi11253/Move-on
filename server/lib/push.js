const { prisma } = require("./prisma");

// Sends an Expo push notification to every device registered to a user.
// Best-effort: failures are logged, never thrown (callers shouldn't break on
// a push failure).
async function sendPushToUser(userId, title, body, data = {}) {
  const tokens = await prisma.pushToken.findMany({ where: { userId }, select: { token: true } });
  if (tokens.length === 0) return 0;

  const messages = tokens.map((t) => ({ to: t.token, title, body, sound: "default", data }));
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
    });
  } catch (e) {
    console.error("push send failed:", e.message);
  }
  return messages.length;
}

module.exports = { sendPushToUser };
