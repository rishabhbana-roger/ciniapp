import { MOCK_CINEMAS } from "@/lib/client-mock-store";
import { CinemaDetailsView } from "@/components/views/cinema-details-view";

export function generateStaticParams() {
  return MOCK_CINEMAS.map((c) => ({ id: c.id }));
}

export default function CinemaDetailPage() {
  return <CinemaDetailsView />;
}
