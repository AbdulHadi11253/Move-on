const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

// All actual route handlers live in server/routes/** (not server/api/**) so that
// Vercel's file-based function detection — which only auto-creates a serverless
// function per file under api/ — sees just the single api/index.js entry point,
// keeping this project under the Hobby plan's 12-function limit. The public URL
// shape (/api/...) is unchanged; only the on-disk source location moved.
const ROUTES_DIR = path.join(__dirname, "..", "routes");

function toRoutePath(filePath) {
  const rel = path.relative(ROUTES_DIR, filePath).replace(/\\/g, "/");
  const withoutExt = rel.replace(/\.js$/, "");
  const segments = withoutExt.split("/").map((seg) => (seg.startsWith("[") && seg.endsWith("]") ? `:${seg.slice(1, -1)}` : seg));
  let routePath = "/api/" + segments.join("/");
  routePath = routePath.replace(/\/index$/, "");
  return routePath === "" ? "/api" : routePath;
}

// Collects every route file without registering anything yet — registration
// order is decided afterward (see sortRoutes), not by filesystem walk order.
function collect(dir, out) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collect(full, out);
    } else if (entry.name.endsWith(".js")) {
      out.push({ routePath: toRoutePath(full), full });
    }
  }
}

// Express (via app.all) matches routes in registration order, with no regard
// for a literal segment being more specific than a `:param` one. A directory
// listing's order is not guaranteed across filesystems/OSes — Node's
// readdirSync order, git's own tree-sort order, and Vercel's deployed
// filesystem order can all disagree — so relying on it previously meant a
// literal route like `/admin/quote-posts/upload` could silently lose to a
// sibling dynamic route like `/admin/quote-posts/:id` depending on which
// filesystem happened to list `upload.js` before or after `[id].js`. Sorting
// explicitly — static segments always before a `:param` at the same
// position — makes registration order deterministic and correct everywhere.
function sortRoutes(routes) {
  const segmentsOf = (r) => r.routePath.split("/").filter(Boolean);
  return [...routes].sort((a, b) => {
    const as = segmentsOf(a);
    const bs = segmentsOf(b);
    const len = Math.max(as.length, bs.length);
    for (let i = 0; i < len; i++) {
      const av = as[i];
      const bv = bs[i];
      if (av === bv) continue;
      if (av === undefined) return -1; // shorter (parent) path first
      if (bv === undefined) return 1;
      const aDynamic = av.startsWith(":");
      const bDynamic = bv.startsWith(":");
      if (aDynamic !== bDynamic) return aDynamic ? 1 : -1; // static before dynamic
      return av < bv ? -1 : av > bv ? 1 : 0;
    }
    return 0;
  });
}

function mount(app, { routePath, full }, { log }) {
  const handler = require(full);
  app.all(routePath, (req, res) => {
    // Vercel merges dynamic route segments into req.query; Express puts them in req.params.
    // In Express 5, req.query is a getter-only property, so it must be redefined rather than mutated.
    Object.defineProperty(req, "query", {
      value: { ...req.query, ...req.params },
      writable: true,
      enumerable: true,
      configurable: true,
    });
    Promise.resolve(handler(req, res)).catch((err) => {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: err.message || "Internal server error" });
    });
  });
  if (log) console.log(`Mounted ${routePath} -> ${path.relative(path.join(__dirname, ".."), full)}`);
}

// Builds the single Express app that serves every route — used identically by
// the local dev server and the production Vercel function, so behavior can't
// drift between the two.
function buildApp({ log = false } = {}) {
  const app = express();
  app.use(cors());
  // Raised from Express's 100kb default to fit base64-encoded images. Note
  // this only governs what our own code will parse — Vercel's Serverless
  // Functions additionally hard-cap the actual request body at 4.5MB
  // regardless of this setting, which is why images are uploaded one at a
  // time (see routes/admin/upload-image.js) rather than batched.
  app.use(express.json({ limit: "20mb" }));
  const routes = [];
  collect(ROUTES_DIR, routes);
  for (const route of sortRoutes(routes)) mount(app, route, { log });
  return app;
}

module.exports = { buildApp };
