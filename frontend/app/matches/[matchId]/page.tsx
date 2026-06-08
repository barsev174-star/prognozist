import { AppHeader } from "@/components/AppHeader";
import { MatchPredictionForm } from "@/components/matches/MatchPredictionForm";

export default async function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;

  return (
    <>
      <AppHeader title={"\u041f\u0440\u043e\u0433\u043d\u043e\u0437"} />
      <main className="mx-auto max-w-md px-4 py-5">
        <MatchPredictionForm matchId={Number(matchId)} />
      </main>
    </>
  );
}
