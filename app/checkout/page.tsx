import { Cart } from "@/components/cart";
export const metadata = {
  title: "Order books on WhatsApp",
  robots: { index: false, follow: false },
};
export default function Checkout() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">ORDER DIRECTLY FROM THE AUTHOR</p>
        <h1>Complete your request on WhatsApp.</h1>
      </div>
      <Cart checkout />
    </>
  );
}
