// The ONLY file under api/ — this is what makes the whole backend deploy as a
// single Vercel serverless function (see lib/buildApp.js for why). Every
// request, regardless of path, is routed here (via vercel.json rewrites) and
// then dispatched internally by the same Express app used locally.
const { buildApp } = require("../lib/buildApp");

const app = buildApp();

module.exports = app;
