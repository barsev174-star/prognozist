import { AppHeader } from "@/components/AppHeader";
import { RankingsList } from "@/components/rankings/RankingsList";

export default function RankingsPage() {
  return (
    <>
      <AppHeader title="Рейтинг" />
      <main className="mx-auto max-w-md px-4 py-5">
        <RankingsList />
      </main>
    </>
  );
}

