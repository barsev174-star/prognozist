import { AppHeader } from "@/components/AppHeader";
import { MatchesList } from "@/components/matches/MatchesList";

export default function MatchesPage() {
  return (
    <>
      <AppHeader title="Матчи" />
      <main className="mx-auto max-w-md px-4 py-5">
        <MatchesList />
      </main>
    </>
  );
}
