const { withAuth, withAdmin } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return withAuth(async (req, res) => {
      const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
      res.status(200).json(tasks);
    })(req, res);
  }

  if (req.method === "POST") {
    return withAdmin(async (req, res) => {
      const { title, description, category } = req.body || {};
      if (!title) {
        res.status(400).json({ error: "title is required" });
        return;
      }
      const task = await prisma.task.create({ data: { title, description, category } });
      res.status(201).json(task);
    })(req, res);
  }

  res.status(405).json({ error: "Method not allowed" });
};
