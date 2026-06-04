import { AdminShell } from "@/components/admin/AdminShell";
import { QuestionsAdmin } from "@/components/admin/QuestionsAdmin";

export default function AdminQuestionsPage() {
  return (
    <AdminShell title="Вопросы">
      <QuestionsAdmin />
    </AdminShell>
  );
}
