import Link from "next/link";

type AppHeaderProps = {
  title: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-surface/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link className="text-sm text-muted" href="/">
          Назад
        </Link>
        <h1 className="text-base font-semibold">{title}</h1>
        <span className="w-10" />
      </div>
    </header>
  );
}

