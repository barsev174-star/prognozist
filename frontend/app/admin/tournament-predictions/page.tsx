import { AdminShell } from "@/components/admin/AdminShell";
import { TournamentPredictionsAdmin } from "@/components/admin/TournamentPredictionsAdmin";

export default function AdminTournamentPredictionsPage() {
  return (
    <AdminShell title="Турнирные прогнозы">
      <TournamentPredictionsAdmin />
    </AdminShell>
  );
}
