import { MOCK_MOVIES } from "@/lib/client-mock-store";
import { BookingSeatSelectionView } from "@/components/views/booking-view";

export function generateStaticParams() {
  const showtimeIds = MOCK_MOVIES.flatMap((m) => (m.showtimes || []).map((s) => ({ showtimeId: s.id })));
  return showtimeIds.length > 0 ? showtimeIds : [{ showtimeId: "st-dune-part-two" }];
}

export default function BookingSeatSelectionPage() {
  return <BookingSeatSelectionView />;
}
