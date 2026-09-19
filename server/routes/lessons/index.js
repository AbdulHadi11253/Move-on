const { withAuth, withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return withAuth(async (req, res) => {
      const lessons = await prisma.lesson.findMany({ orderBy: { createdAt: "desc" } });
      res.status(200).json(lessons);
    })(req, res);
  }

  if (req.method === "POST") {
    return withAdmin(async (req, res) => {
      const { title, content, category, readMinutes } = req.body || {};
      if (!title || !content) {
        res.status(400).json({ error: "title and content are required" });
        return;
      }
      const lesson = await prisma.lesson.create({ data: { title, content, category, readMinutes } });
      res.status(201).json(lesson);
    })(req, res);
  }

  res.status(405).json({ error: "Method not allowed" });
};
