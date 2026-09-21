"use client";
const labels: Record<string, string> = {
  price_ngn: "NGN price (kobo)",
  price_usd: "USD price (cents)",
  cover_url: "Cover image URL",
  sample_url: "Sample URL",
  amazon_url: "Amazon edition URL",
  author_display: "Author / editor credit",
  book_id: "Book ID",
  variant_id: "Format ID",
  storage_path: "Private storage path",
  free_above_ngn: "Free shipping above (kobo)",
  free_above_usd: "Free shipping above (cents)",
  max_uses: "Maximum coupon uses",
  book_ids: "Included book IDs",
  table_of_contents: "Table of contents",
  portrait_url: "Author portrait URL",
};
const choices: Record<string, string[]> = {
  format: ["ebook", "paperback"],
  color: ["paper", "clay", "blue"],
  currency: ["NGN", "USD"],
  kind: ["delivery", "pickup", "quote"],
  role: ["author", "editor"],
  file_type: ["pdf", "epub"],
};
export function RecordEditor({
  draft,
  onChange,
}: {
  draft: string;
  onChange: (v: string) => void;
}) {
  let record: Record<string, unknown>;
  try {
    record = JSON.parse(draft);
  } catch {
    return (
      <label>
        Record JSON
        <textarea
          className="admin-editor"
          value={draft}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }
  const set = (key: string, value: unknown) =>
    onChange(JSON.stringify({ ...record, [key]: value }, null, 2));
  return (
    <div className="form-panel form-grid">
      {Object.entries(record).map(([key, value]) => {
        const label = labels[key] || key.replaceAll("_", " ");
        if (typeof value === "boolean")
          return (
            <label className="radio-label" key={key}>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => set(key, e.target.checked)}
              />
              {label}
            </label>
          );
        if (choices[key])
          return (
            <label key={key}>
              {label}
              <select
                value={String(value || "")}
                onChange={(e) => set(key, e.target.value)}
              >
                {choices[key].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          );
        if (Array.isArray(value))
          return (
            <label key={key} style={{ gridColumn: "1/-1" }}>
              {label} — one per line
              <textarea
                rows={3}
                value={value.join("\n")}
                onChange={(e) => set(key, e.target.value.split("\n"))}
              />
            </label>
          );
        if (value && typeof value === "object")
          return (
            <label key={key} style={{ gridColumn: "1/-1" }}>
              {label}
              <textarea
                rows={6}
                defaultValue={JSON.stringify(value, null, 2)}
                onBlur={(e) => {
                  try {
                    set(key, JSON.parse(e.target.value));
                  } catch {
                    e.target.setCustomValidity(
                      "Use valid JSON for these settings",
                    );
                  }
                }}
              />
            </label>
          );
        if (["description", "biography", "quote"].includes(key))
          return (
            <label key={key} style={{ gridColumn: "1/-1" }}>
              {label}
              <textarea
                rows={5}
                value={String(value || "")}
                onChange={(e) => set(key, e.target.value)}
              />
            </label>
          );
        const numeric =
          typeof value === "number" ||
          [
            "pages",
            "publication_year",
            "max_uses",
            "rating",
            "free_above_ngn",
            "free_above_usd",
            "price_ngn",
            "price_usd",
          ].includes(key);
        return (
          <label key={key}>
            {label}
            <input
              type={numeric ? "number" : "text"}
              value={value == null ? "" : String(value)}
              onChange={(e) =>
                set(
                  key,
                  e.target.value === ""
                    ? null
                    : numeric
                      ? Number(e.target.value)
                      : e.target.value,
                )
              }
            />
          </label>
        );
      })}
    </div>
  );
}
