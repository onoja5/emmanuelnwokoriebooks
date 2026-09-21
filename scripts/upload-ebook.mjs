import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
const [variantId, filePath] = process.argv.slice(2);
if (!variantId || !filePath || !/[0-9a-f-]{36}/i.test(variantId))
  throw Error(
    "Usage: node --env-file=.env.local scripts/upload-ebook.mjs <ebook-variant-uuid> <file-path>",
  );
const ext = path.extname(filePath).slice(1).toLowerCase();
if (!["pdf", "epub"].includes(ext))
  throw Error("Only PDF and EPUB files are accepted.");
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
)
  throw Error("Configure Supabase first.");
const info = await stat(filePath);
if (info.size > 209715200) throw Error("File exceeds 200 MB.");
const file = await readFile(filePath);
if (
  (ext === "pdf" && file.subarray(0, 5).toString() !== "%PDF-") ||
  (ext === "epub" && file.subarray(0, 2).toString() !== "PK")
)
  throw Error("File content does not match the extension.");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const { data: variant } = await db
  .from("product_variants")
  .select("format")
  .eq("id", variantId)
  .single();
if (variant?.format !== "ebook")
  throw Error("Choose an existing ebook variant.");
const storagePath = `${variantId}/${crypto.randomUUID()}.${ext}`;
const { error: uploadError } = await db.storage
  .from("ebooks")
  .upload(storagePath, file, {
    contentType: ext === "pdf" ? "application/pdf" : "application/epub+zip",
    upsert: false,
  });
if (uploadError)
  throw Error(
    "Private upload failed. Check the project file-size limit and storage configuration.",
  );
const { error } = await db.from("digital_assets").insert({
  variant_id: variantId,
  storage_path: storagePath,
  file_type: ext,
  active: false,
});
if (error)
  throw Error(
    "File uploaded but its database record could not be created. Register it in admin.",
  );
console.log(
  "Private ebook uploaded. Review and activate it in Admin → Digital files.",
);
