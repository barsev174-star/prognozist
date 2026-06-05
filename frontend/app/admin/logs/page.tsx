import { AdminShell } from "@/components/admin/AdminShell";
import { LogsAdmin } from "@/components/admin/LogsAdmin";

export default function AdminLogsPage() {
  return (
    <AdminShell title="Логи">
      <LogsAdmin />
    </AdminShell>
  );
}
