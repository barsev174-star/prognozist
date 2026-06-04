import { AdminShell } from "@/components/admin/AdminShell";
import { SeasonsAdmin } from "@/components/admin/SeasonsAdmin";

export default function AdminSeasonsPage() {
  return (
    <AdminShell title="Сезоны">
      <SeasonsAdmin />
    </AdminShell>
  );
}
