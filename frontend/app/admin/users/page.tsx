import { AdminShell } from "@/components/admin/AdminShell";
import { UsersAdmin } from "@/components/admin/UsersAdmin";

export default function AdminUsersPage() {
  return (
    <AdminShell title="Пользователи">
      <UsersAdmin />
    </AdminShell>
  );
}
