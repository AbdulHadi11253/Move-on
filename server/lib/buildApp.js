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

function walk(dir, app, { log }) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, app, { log });
    } else if (entry.name.endsWith(".js")) {
      const routePath = toRoutePath(full);
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
  }
}

// Builds the single Express app that serves every route — used identically by
// the local dev server and the production Vercel function, so behavior can't
// drift between the two.
function buildApp({ log = false } = {}) {
  const app = express();
  app.use(cors());
  // Raised from Express's 100kb default to fit base64-encoded quote-post
  // images (see routes/admin/quote-posts/upload.js for why they're sent as
  // base64 JSON instead of multipart/form-data).
  app.use(express.json({ limit: "20mb" }));
  walk(ROUTES_DIR, app, { log });
  return app;
}

module.exports = { buildApp };
