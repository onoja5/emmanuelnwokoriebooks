"use client";
import { useState, useEffect } from "react";
import { tableTemplates, readOnlyTables } from "@/lib/admin-schema";
import { money, type Currency } from "@/lib/catalog";
import { RecordEditor } from "./record-editor";
import Link from "next/link";
type Row = Record<string, unknown> & { id: string };
const names: Record<string, string> = {
  product_variants: "Formats & prices",
  digital_assets: "Digital files",
  shipping_methods: "Shipping",
  site_settings: "Site settings",
  bank_accounts: "Bank accounts",
  download_entitlements: "Download access",
  book_contributors: "Contributors",
  book_categories: "Book categories",
  newsletter_subscribers: "Newsletter",
  contact_messages: "Enquiries",
  email_outbox: "Email queue",
  profiles: "Customers",
};
export function Admin() {
  const [table, setTable] = useState("orders");
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    fetch("/api/admin-summary")
      .then(async (r) => {
        if (r.ok) setStats(await r.json());
      })
      .catch(() => {});
  }, []);
  const [confirm, setConfirm] = useState<{ action: string; id: string } | null>(
    null,
  );
  async function load() {
    const r = await fetch(`/api/admin/${table}?offset=${offset}`);
    const value = await r.json();
    if (r.ok) {
      setRows(value.rows);
      setCount(value.count);
    } else setMessage(value.error);
  }
  useEffect(() => {
    void load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, offset]);
  function edit(row?: Row) {
    setEditing(row || { id: "" });
    const value = { ...(row || tableTemplates[table]) };
    ["id", "created_at", "updated_at", "reserved", "uses", "language"].forEach(
      (k) => delete value[k],
    );
    setDraft(JSON.stringify(value, null, 2));
    setMessage("");
  }
  async function action(action: string, id: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, tracking: tracking[id] }),
      });
      const data = await r.json();
      setMessage(r.ok ? "Updated." : data.error);
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
      if (r.ok) await load();
    } catch {
      setMessage("Request failed. Please retry.");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }
  return (
    <div className="content">
      <div className="admin-grid">
        <nav className="admin-nav" aria-label="Admin sections">
          {[
            "orders",
            ...Object.keys(tableTemplates),
            ...readOnlyTables.filter((t) => t !== "orders"),
          ].map((t) => (
            <button
              key={t}
              aria-pressed={t === table}
              onClick={() => {
                setTable(t);
                setOffset(0);
                setEditing(null);
                setConfirm(null);
                setMessage("");
              }}
            >
              {names[t] || t.replaceAll("_", " ")}
            </button>
          ))}
        </nav>
        <div>
          <div className="section-heading">
            <div>
              <p className="eyebrow">PUBLISHER WORKSPACE</p>
              <h2>{names[table] || table.replaceAll("_", " ")}</h2>
              <p>{count} records</p>
            </div>
            {tableTemplates[table] && (
              <button className="button" onClick={() => edit()}>
                Add record +
              </button>
            )}
          </div>
          {table === "orders" && stats && (
            <div className="metric-grid">
              <div className="metric">
                Paid revenue
                <strong>{money(stats.revenue_ngn, "NGN")}</strong>
                <span>{money(stats.revenue_usd, "USD")}</span>
              </div>
              <div className="metric">
                Pending transfers
                <strong>{stats.pending_transfers}</strong>
              </div>
              <div className="metric">
                Awaiting shipment
                <strong>{stats.awaiting_shipment}</strong>
              </div>
              <div className="metric">
                Ebook sales<strong>{stats.ebook_sales}</strong>
              </div>
              <div className="metric">
                Paperback sales<strong>{stats.paperback_sales}</strong>
              </div>
              <div className="metric">
                All orders<strong>{stats.orders}</strong>
              </div>
            </div>
          )}
          {["digital_assets", "books"].includes(table) && (
            <form
              className="summary-panel"
              style={{ marginBottom: 25 }}
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const f = new FormData(e.currentTarget);
                  const file = f.get("file") as File;
                  const extension = file.name.split(".").pop()?.toLowerCase();
                  const r = await fetch("/api/admin-upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      kind: table === "books" ? "cover" : "ebook",
                      extension,
                      size: file.size,
                    }),
                  });
                  const value = await r.json();
                  if (!r.ok) {
                    setMessage(value.error);
                    return;
                  }
                  const upload = await fetch(value.url, {
                    method: "PUT",
                    headers: {
                      "Content-Type": file.type || "application/octet-stream",
                    },
                    body: file,
                  });
                  if (!upload.ok) throw Error("Upload failed");
                  setMessage(
                    `Uploaded. Use this ${table === "books" ? "cover URL" : "storage path"} in the record: ${value.public_url || value.path}`,
                  );
                } catch {
                  setMessage("Upload failed. Please check the file and retry.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                {table === "books"
                  ? "Upload a book cover (up to 10 MB)"
                  : "Upload a private PDF or EPUB (up to 200 MB)"}
                <input
                  type="file"
                  name="file"
                  required
                  accept={
                    table === "books" ? ".jpg,.jpeg,.png,.webp" : ".pdf,.epub"
                  }
                />
              </label>
              <button disabled={busy} className="button">
                Upload file
              </button>
            </form>
          )}
          {editing && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const value = JSON.parse(draft);
                  const r = await fetch(`/api/admin/${table}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...(editing.id ? { id: editing.id } : {}),
                      value,
                    }),
                  });
                  const data = await r.json();
                  setMessage(r.ok ? "Record saved." : data.error);
                  if (r.ok) {
                    setEditing(null);
                    await load();
                  }
                } catch {
                  setMessage("Please enter valid JSON.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <RecordEditor draft={draft} onChange={setDraft} />
              <p className="field-help">
                Amounts use minor units: ₦3,000 = 300000; $4.50 = 450. Link
                records using their IDs. Optional empty values use null.
              </p>
              <button
                disabled={busy}
                className="button"
                style={{ margin: "15px 12px 25px 0" }}
              >
                Save record
              </button>
              <button
                type="button"
                className="button outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            </form>
          )}
          {confirm && (
            <div className="alert" role="alert">
              <p>
                {confirm.action === "confirm_transfer"
                  ? "Confirm that you have independently verified receipt of this transfer. This will activate ebook access and fulfilment."
                  : confirm.action === "delete"
                    ? "Delete this record? Linked records may prevent deletion."
                    : "Confirm this order action?"}
              </p>
              <button
                className="button"
                disabled={busy}
                onClick={async () => {
                  if (confirm.action === "delete") {
                    const r = await fetch(`/api/admin/${table}`, {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: confirm.id }),
                    });
                    setMessage(
                      r.ok ? "Record deleted." : (await r.json()).error,
                    );
                    setConfirm(null);
                    await load();
                  } else await action(confirm.action, confirm.id);
                }}
              >
                Confirm
              </button>
              <button
                className="button outline"
                onClick={() => setConfirm(null)}
                style={{ marginLeft: 12 }}
              >
                Cancel
              </button>
            </div>
          )}
          <p
            role="status"
            className={message ? "alert" : ""}
            style={{ overflowWrap: "anywhere" }}
          >
            {message}
          </p>
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {String(
                        row.title ||
                          row.name ||
                          row.order_number ||
                          row.email ||
                          row.code ||
                          row.key ||
                          row.id,
                      )}
                      <br />
                      <small>{row.id}</small>
                    </td>
                    <td>
                      {table === "orders" ? (
                        <>
                          {String(row.status)}
                          <br />
                          {String(row.payment_status)} ·{" "}
                          {money(Number(row.total), row.currency as Currency)}
                          <br />
                          {String(row.email)}
                        </>
                      ) : (
                        <details>
                          <summary>View fields</summary>
                          <pre
                            style={{
                              fontSize: 11,
                              maxWidth: 400,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {JSON.stringify(row, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                    <td>
                      {tableTemplates[table] && (
                        <>
                          <button onClick={() => edit(row)}>Edit</button>
                          <button
                            onClick={() =>
                              setConfirm({ action: "delete", id: row.id })
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {table === "orders" && (
                        <>
                          <Link
                            className="text-link"
                            href={`/orders/${row.id}`}
                          >
                            View order ↗
                          </Link>
                          {row.method === "bank_transfer" &&
                            ["pending", "failed"].includes(
                              String(row.payment_status),
                            ) && (
                              <>
                                <button
                                  onClick={() =>
                                    setConfirm({
                                      action: "confirm_transfer",
                                      id: row.id,
                                    })
                                  }
                                >
                                  Confirm transfer
                                </button>
                                {!!row.proof_path && (
                                  <button
                                    onClick={() => action("proof", row.id)}
                                  >
                                    View proof
                                  </button>
                                )}
                              </>
                            )}
                          {row.status === "processing" && (
                            <>
                              <label style={{ display: "block" }}>
                                Tracking number
                                <input
                                  aria-label={`Tracking number for ${row.order_number}`}
                                  value={tracking[row.id] || ""}
                                  onChange={(e) =>
                                    setTracking({
                                      ...tracking,
                                      [row.id]: e.target.value,
                                    })
                                  }
                                />
                              </label>
                              <button onClick={() => action("shipped", row.id)}>
                                Mark shipped
                              </button>
                            </>
                          )}
                          {row.status === "shipped" && (
                            <button onClick={() => action("delivered", row.id)}>
                              Mark delivered
                            </button>
                          )}
                          {["pending", "failed"].includes(
                            String(row.payment_status),
                          ) && (
                            <button
                              onClick={() =>
                                setConfirm({
                                  action: "cancel_order",
                                  id: row.id,
                                })
                              }
                            >
                              Cancel unpaid order
                            </button>
                          )}
                        </>
                      )}
                      {table === "download_entitlements" && (
                        <button
                          onClick={() => action("reset_downloads", row.id)}
                        >
                          Reset download count
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && (
            <div className="empty-state">
              <p>No records here yet.</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
            <button
              className="button outline"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - 50))}
            >
              Previous
            </button>
            <button
              className="button outline"
              disabled={offset + 50 >= count}
              onClick={() => setOffset(offset + 50)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
