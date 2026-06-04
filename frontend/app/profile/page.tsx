import { AppHeader } from "@/components/AppHeader";

export default function ProfilePage() {
  return (
    <>
      <AppHeader title="Профиль" />
      <main className="mx-auto max-w-md px-4 py-5">
        <div className="rounded-lg bg-white p-4 shadow-sm">Профиль пользователя появится здесь.</div>
      </main>
    </>
  );
}

