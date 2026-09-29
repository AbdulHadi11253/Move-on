const { randomUUID } = require("crypto");
const { withAdmin } = require("../../lib/auth");
const { supabase, QUOTE_IMAGES_BUCKET } = require("../../lib/supabase");

const ALLOWED_FOLDERS = new Set(["notifications", "quotes"]);

// Generic single-image upload for all admin-authored images (quote posts,
// notification images, app content blocks). Always one image per request —
// Vercel Serverless Functions hard-cap the request body at 4.5MB regardless
// of any express.json() limit, so batching several photos into one request
// (the old routes/admin/quote-posts/upload.js behavior) would eventually 413
// on any real carousel. The client uploads each image with its own request
// and assembles the resulting URLs itself.
//
// Base64-in-JSON rather than multipart/form-data because React Native's
// fetch()/Blob/FormData stack on this SDK can't reliably read local file://
// URIs (silently returns a few-byte stub instead of the real file) and also
// rejects data: URIs outright ("unknown protocol: data").
module.exports = withAdmin(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { base64, mimeType, folder } = req.body || {};
  if (!mimeType?.startsWith("image/") || typeof base64 !== "string" || base64.length === 0) {
    res.status(400).json({ error: "A valid image (mimeType + base64) is required" });
    return;
  }
  const dir = ALLOWED_FOLDERS.has(folder) ? folder : "notifications";

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) {
    res.status(400).json({ error: "Image is empty" });
    return;
  }

  const ext = mimeType.split("/")[1] || "jpg";
  const path = `${dir}/${randomUUID()}.${ext}`;

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
