const { randomUUID } = require("crypto");
const { withAdmin } = require("../../../lib/auth");
const { supabase, QUOTE_IMAGES_BUCKET } = require("../../../lib/supabase");

// Accepts one or more base64-encoded images in the JSON body and uploads each
// to Supabase Storage. Selecting multiple images here is what makes a post a
// carousel — the caller then creates a single QuotePost referencing all of them.
//
// Images are sent as base64 JSON rather than multipart/form-data because React
// Native's fetch()/Blob/FormData stack on this SDK cannot reliably read local
// file:// URIs (silently returns a few-byte stub instead of the real file) and
// also rejects data: URIs outright ("unknown protocol: data"). Base64-in-JSON
// reuses the same request path every other endpoint in this app already uses
// reliably (expo-file-system's readAsStringAsync + apiFetch's JSON body).
module.exports = withAdmin(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const images = Array.isArray(req.body?.images) ? req.body.images : [];
  if (images.length === 0) {
    res.status(400).json({ error: "No images provided (expected body.images array)" });
    return;
  }

  const results = [];
  for (const img of images) {
    const mimeType = img?.mimeType;
    const base64 = img?.base64;
    if (!mimeType?.startsWith("image/") || typeof base64 !== "string" || base64.length === 0) {
      res.status(400).json({ error: `${img?.filename || "image"} is not a valid image file` });
      return;
    }

    const buffer = Buffer.from(base64, "base64");
    if (buffer.length === 0) {
      res.status(400).json({ error: `${img?.filename || "image"} is empty` });
      return;
    }

    const ext = mimeType.split("/")[1] || "jpg";
    const path = `quotes/${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(QUOTE_IMAGES_BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      res.status(500).json({ error: uploadError.message });
      return;
    }

    const { data } = supabase.storage.from(QUOTE_IMAGES_BUCKET).getPublicUrl(path);
    results.push({ url: data.publicUrl, path });
  }

  res.status(201).json({ images: results });
});
