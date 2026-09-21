"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  useMemo,
} from "react";
import type { Currency, Format, Book } from "@/lib/catalog";
import { readCartItems, cartQuantity } from "@/lib/cart-state";
import { defaultShipping } from "@/lib/commerce";
export type CartItem = { book: Book; format: Format; quantity: number };
type Store = {
  ready: boolean;
  currency: Currency;
  setCurrency: (v: Currency) => void;
  items: CartItem[];
  add: (b: Book, f: Format, q?: number) => void;
  update: (id: string, f: Format, q: number) => void;
  clear: () => void;
  saved: string[];
  toggle: (id: string) => void;
  notice: string;
  shippingId: string;
  setShippingId: (id: string) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};
type Snapshot = {
  currency: Currency;
  items: CartItem[];
  saved: string[];
  shippingId: string;
};
const empty: Snapshot = {
  currency: "NGN",
  items: [],
  saved: [],
  shippingId: defaultShipping[0].id,
};
const serialized = JSON.stringify(empty);
const key = "mindfield-store";
let memorySnapshot: string | null = null;
const Context = createContext<Store | null>(null);
const subscribeReady = () => () => {};
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("mindfield-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("mindfield-change", callback);
  };
}
function snapshot() {
  if (memorySnapshot !== null) return memorySnapshot;
  try {
    return localStorage.getItem(key) || serialized;
  } catch {
    return serialized;
  }
}
function parse(raw: string): Snapshot {
  try {
    const v = JSON.parse(raw);
    return {
      currency: v.currency === "USD" ? "USD" : "NGN",
      shippingId:
        typeof v.shippingId === "string" ? v.shippingId : empty.shippingId,
      items: readCartItems(v.items),
      saved: Array.isArray(v.saved)
        ? v.saved.filter((s: unknown) => typeof s === "string")
        : [],
    };
  } catch {
    return empty;
  }
}
function mutate(fn: (prev: Snapshot) => Snapshot) {
  const next = fn(parse(snapshot()));
  try {
    localStorage.setItem(key, JSON.stringify(next));
    memorySnapshot = null;
  } catch {
    memorySnapshot = JSON.stringify(next);
  }
  window.dispatchEvent(new Event("mindfield-change"));
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const ready = useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );
  const raw = useSyncExternalStore(subscribe, snapshot, () => serialized);
  const { currency, items, saved, shippingId } = useMemo(
    () => parse(raw),
    [raw],
  );
  const [notice, setNotice] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  function add(book: Book, format: Format, quantity = 1) {
    if (book.availability?.[format] === false) {
      setNotice("This edition is currently unavailable.");
      return;
    }
    quantity = cartQuantity(quantity);
    mutate((prev) => {
      const old = prev.items.find(
        (i) => i.book.id === book.id && i.format === format,
      );
      return {
        ...prev,
        items: old
          ? prev.items.map((i) =>
              i === old
                ? {
                    ...i,
                    book,
                    quantity:
                      format === "ebook"
                        ? 1
                        : Math.min(50, i.quantity + quantity),
                  }
                : i,
            )
          : [
              ...prev.items,
              { book, format, quantity: format === "ebook" ? 1 : quantity },
            ],
      };
    });
    setNotice(`${book.title} added to your cart`);
  }
  return (
    <Context.Provider
      value={{
        ready,
        currency,
        items,
        saved,
        notice,
        shippingId,
        setShippingId: (shippingId) =>
          mutate((prev) => ({ ...prev, shippingId })),
        cartOpen,
        setCartOpen,
        setCurrency: (currency) => mutate((prev) => ({ ...prev, currency })),
        add,
        update: (id, f, q) =>
          mutate((prev) => ({
            ...prev,
            items:
              q <= 0
                ? prev.items.filter(
                    (i) => !(i.book.id === id && i.format === f),
                  )
                : prev.items.map((i) =>
                    i.book.id === id && i.format === f
                      ? { ...i, quantity: f === "ebook" ? 1 : cartQuantity(q) }
                      : i,
                  ),
          })),
        clear: () => mutate((prev) => ({ ...prev, items: [] })),
        toggle: (id) =>
          mutate((prev) => ({
            ...prev,
            saved: prev.saved.includes(id)
              ? prev.saved.filter((v) => v !== id)
              : [...prev.saved, id],
          })),
      }}
    >
      {children}
      <div role="status" className={`toast ${notice ? "show" : ""}`}>
        {notice}
      </div>
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw Error("StoreProvider missing");
  return value;
}
