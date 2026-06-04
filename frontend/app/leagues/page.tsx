import { AppHeader } from "@/components/AppHeader";
import { LeaguesManager } from "@/components/leagues/LeaguesManager";

export default function LeaguesPage() {
  return (
    <>
      <AppHeader title="Лиги" />
      <main className="mx-auto max-w-md px-4 py-5">
        <LeaguesManager />
      </main>
    </>
  );
}
