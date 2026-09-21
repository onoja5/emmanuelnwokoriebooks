import { Cart } from "@/components/cart";
export const metadata = {
  title: "Your shopping cart",
  robots: { index: false, follow: false },
};
export default function CartPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">SOMETHING GOOD TO READ</p>
        <h1>Your shopping cart.</h1>
      </div>
      <Cart />
    </>
  );
}
