import { ExpertAdmin } from "@/components/admin/ExpertAdmin";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminExpertPage() {
  return (
    <AdminShell title="Эксперт">
      <ExpertAdmin />
    </AdminShell>
  );
}

