import { TicketConfirmationView } from "@/components/views/ticket-view";

export function generateStaticParams() {
  return [
    { bookingId: "demo-ticket" },
    { bookingId: "default" },
  ];
}

export default function TicketConfirmationPage() {
  return <TicketConfirmationView />;
}
