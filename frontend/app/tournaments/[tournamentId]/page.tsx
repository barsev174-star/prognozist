import { AppHeader } from "@/components/AppHeader";
import { TournamentPredictionBoard } from "@/components/tournaments/TournamentPredictionBoard";

type TournamentPredictionPageProps = {
  params: Promise<{
    tournamentId: string;
  }>;
};

const title = "\u0422\u0443\u0440\u043d\u0438\u0440";

export default async function TournamentPredictionPage({ params }: TournamentPredictionPageProps) {
  const { tournamentId } = await params;
  const id = Number(tournamentId);

  return (
    <>
      <AppHeader title={title} />
      <main className="mx-auto max-w-md px-4 py-5">
        <TournamentPredictionBoard tournamentId={id} />
      </main>
    </>
  );
}
