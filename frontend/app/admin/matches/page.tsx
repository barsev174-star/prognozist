import { AdminShell } from "@/components/admin/AdminShell";
import { MatchesAdmin } from "@/components/admin/MatchesAdmin";

export default function AdminMatchesPage() {
  return (
    <AdminShell title="Матчи">
      <MatchesAdmin />
    </AdminShell>
  );
}
