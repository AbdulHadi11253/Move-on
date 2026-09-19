const { withAuth, clerkClient } = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");

module.exports = withAuth(async (req, res) => {
  if (req.method === "GET") {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        subscription: true,
        notificationSettings: true,
        journeyEnrollments: { where: { isActive: true }, take: 1, include: { journey: true } },
      },
    });
    res.status(200).json(user);
    return;
  }

  if (req.method === "PATCH") {
    const { name, age, gender } = req.body || {};
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, age, gender },
    });
    res.status(200).json(user);
    return;
  }

  if (req.method === "DELETE") {
    // Full account deletion (App Store / Play Store requirement). All related
    // rows cascade-delete via the schema's onDelete: Cascade relations. Then we
    // remove the Clerk identity so the account is fully gone.
    await prisma.user.delete({ where: { id: req.user.id } });
    try {
      await clerkClient.users.deleteUser(req.user.clerkId);
    } catch (e) {
      // DB row is already gone; if the Clerk deletion fails, log and continue so
      // the client can still sign the user out. The orphaned Clerk user (if any)
      // will re-create a fresh local row only if they sign in again.
      console.error("Clerk user deletion failed:", e.message);
    }
    res.status(200).json({ deleted: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
