import { AppHeader } from "@/components/AppHeader";
import { TournamentPredictionBoard } from "@/components/tournaments/TournamentPredictionBoard";

type TournamentPredictionPageProps = {
  params: Promise<{
    tournamentId: string;
  }>;
};

export default async function TournamentPredictionPage({ params }: TournamentPredictionPageProps) {
  const { tournamentId } = await params;
  const id = Number(tournamentId);

  return (
    <>
      <AppHeader title="Турнир" />
      <main className="mx-auto max-w-md px-4 py-5">
        <TournamentPredictionBoard tournamentId={id} />
      </main>
    </>
  );
}
