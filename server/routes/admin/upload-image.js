const { randomUUID } = require("crypto");
const { withAdmin } = require("../../lib/auth");
const { supabase, QUOTE_IMAGES_BUCKET } = require("../../lib/supabase");

// Generic single-image upload for admin-authored content (notification
// images, app content blocks) — not quote posts. Same base64-JSON approach as
// routes/admin/quote-posts/upload.js (see that file for why: RN's fetch()
// can't reliably read local file:// URIs on this SDK).
module.exports = withAdmin(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { base64, mimeType } = req.body || {};
  if (!mimeType?.startsWith("image/") || typeof base64 !== "string" || base64.length === 0) {
    res.status(400).json({ error: "A valid image (mimeType + base64) is required" });
    return;
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) {
    res.status(400).json({ error: "Image is empty" });
    return;
  }

  const ext = mimeType.split("/")[1] || "jpg";
  const path = `notifications/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(QUOTE_IMAGES_BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (uploadError) {
    res.status(500).json({ error: uploadError.message });
    return;
  }

  const { data } = supabase.storage.from(QUOTE_IMAGES_BUCKET).getPublicUrl(path);
  res.status(201).json({ url: data.publicUrl, path });
});
