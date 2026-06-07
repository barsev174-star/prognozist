import { AppHeader } from "@/components/AppHeader";
import { RankingsList } from "@/components/rankings/RankingsList";

export default function RankingsPage() {
  return (
    <>
      <AppHeader title={"\u0420\u0435\u0439\u0442\u0438\u043d\u0433"} />
      <main className="mx-auto max-w-md px-4 py-5">
        <RankingsList />
      </main>
    </>
  );
}
