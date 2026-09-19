const { withAdmin } = require("../../../lib/auth");
const { prisma } = require("../../../lib/prisma");

module.exports = withAdmin(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { title, body } = req.body || {};
  if (!title || !body) {
    res.status(400).json({ error: "title and body are required" });
    return;
  }

  const tokens = await prisma.pushToken.findMany({ select: { token: true } });
  if (tokens.length === 0) {
    res.status(200).json({ sent: 0, message: "No registered push tokens" });
    return;
  }

  const messages = tokens.map((t) => ({ to: t.token, title, body, sound: "default" }));

  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));

  for (const chunk of chunks) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(chunk),
    });
  }

  res.status(200).json({ sent: messages.length });
});
