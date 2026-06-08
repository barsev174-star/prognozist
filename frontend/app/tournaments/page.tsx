import { AppHeader } from "@/components/AppHeader";
import { TournamentPredictionsHub } from "@/components/tournaments/TournamentPredictionsHub";

export default function TournamentsPage() {
  return (
    <>
      <AppHeader title="Турниры" />
      <main className="mx-auto max-w-md px-4 py-5">
        <TournamentPredictionsHub />
      </main>
    </>
  );
}
