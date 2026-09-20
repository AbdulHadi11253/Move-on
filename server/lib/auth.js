const { createClerkClient, verifyToken } = require("@clerk/backend");
const { prisma } = require("./prisma");

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Accounts that are always admins. Extra addresses can be added without a code
// change via the ADMIN_EMAILS env var (comma-separated).
const ADMIN_EMAILS = new Set(
  [
    "abdulhadi91478@gmail.com",
    "info@ptechagency.com",
    "ptechagency@gmail.com",
    ...(process.env.ADMIN_EMAILS || "").split(","),
  ]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);
const isAdminEmail = (email) => ADMIN_EMAILS.has(String(email || "").toLowerCase());

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

// Verifies the Clerk session token and returns (creating if needed) the local User row.
async function authenticate(req) {
  const token = getBearerToken(req);
  if (!token) {
    const err = new Error("Missing bearer token");
    err.status = 401;
    throw err;
  }

  let payload;
  try {
    payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
  } catch (e) {
    const err = new Error("Invalid or expired token");
    err.status = 401;
    throw err;
  }

  const clerkId = payload.sub;

  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || `${clerkId}@unknown.local`;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

    user = await prisma.user.create({
      data: { clerkId, email, name, role: isAdminEmail(email) && clerkUser.emailAddresses?.[0]?.verification?.status === "verified" ? "ADMIN" : "USER" },
    });
  } else if (user.role !== "ADMIN" && isAdminEmail(user.email)) {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  }

  return user;
}

// Wraps a Vercel serverless handler, attaching req.user. Responds 401 on auth failure.
function withAuth(handler) {
  return async (req, res) => {
    try {
      req.user = await authenticate(req);
    } catch (e) {
      res.status(e.status || 401).json({ error: e.message });
      return;
    }
    return handler(req, res);
  };
}

// Wraps a handler requiring the authenticated user to have ADMIN role.
function withAdmin(handler) {
  return withAuth(async (req, res) => {
    if (req.user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    return handler(req, res);
  });
}

module.exports = { authenticate, withAuth, withAdmin, clerkClient };
