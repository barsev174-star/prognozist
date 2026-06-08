import { AppHeader } from "@/components/AppHeader";
import { MatchesList } from "@/components/matches/MatchesList";

export default function MatchesPage() {
  return (
    <>
      <AppHeader title={"\u041c\u0430\u0442\u0447\u0438"} />
      <main className="mx-auto max-w-md px-4 py-5">
        <MatchesList />
      </main>
    </>
  );
}
