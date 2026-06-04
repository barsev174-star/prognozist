import { AdminShell } from "@/components/admin/AdminShell";
import { TournamentsAdmin } from "@/components/admin/TournamentsAdmin";

export default function AdminTournamentsPage() {
  return (
    <AdminShell title="Турниры">
      <TournamentsAdmin />
    </AdminShell>
  );
}
