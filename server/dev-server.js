require("dotenv").config();
const { buildApp } = require("./lib/buildApp");

const app = buildApp({ log: true });

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Move On API dev server listening on http://0.0.0.0:${PORT}`);
});
