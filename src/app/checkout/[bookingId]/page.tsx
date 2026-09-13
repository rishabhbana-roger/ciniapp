import { CheckoutView } from "@/components/views/checkout-view";

export function generateStaticParams() {
  return [
    { bookingId: "mock-booking" },
    { bookingId: "demo-booking" },
    { bookingId: "default" },
  ];
}

export default function CheckoutPage() {
  return <CheckoutView />;
}
