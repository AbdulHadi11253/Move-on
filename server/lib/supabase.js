const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const QUOTE_IMAGES_BUCKET = process.env.SUPABASE_QUOTE_IMAGES_BUCKET || "quote-images";

module.exports = { supabase, QUOTE_IMAGES_BUCKET };
