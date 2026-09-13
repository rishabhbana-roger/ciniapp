import { MOCK_MOVIES } from "@/lib/client-mock-store";
import { MovieDetailsView } from "@/components/views/movie-details-view";

export function generateStaticParams() {
  return MOCK_MOVIES.flatMap((m) => [{ id: m.id }, { id: m.slug }]);
}

export default function MovieDetailsPage() {
  return <MovieDetailsView />;
}
