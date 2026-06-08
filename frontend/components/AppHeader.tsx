import Link from "next/link";

type AppHeaderProps = {
  title: string;
};

const backLabel = "\u041d\u0430\u0437\u0430\u0434";
const backArrow = "\u2190";

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-[rgba(249,251,244,0.92)] px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted shadow-sm"
          href="/"
        >
          <span className="text-[10px]">{backArrow}</span>
          {backLabel}
        </Link>
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">Prognozist</div>
          <h1 className="text-base font-semibold">{title}</h1>
        </div>
        <span className="w-16" />
      </div>
    </header>
  );
}
