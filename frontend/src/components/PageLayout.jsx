import { useMemo } from 'react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PageLayout({
  title,
  subtitle,
  children,
  backLabel = 'Back',
  onBack,
  actions,
  showBack = false,
}) {
  const showHeader = title || subtitle || showBack || actions;

  const backButton = useMemo(() => {
    if (!showBack || !onBack) return null;
    return (
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:bg-white/20"
      >
        ← {backLabel}
      </button>
    );
  }, [backLabel, onBack, showBack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-cyan-200 to-sky-100 text-brand-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute -top-28 -left-28 h-48 w-48 rounded-full bg-white/60 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-200/70 blur-3xl" />
          <div className="absolute top-1/2 left-[55%] h-36 w-36 rounded-full bg-amber-200/60 blur-3xl" />
          <div className="absolute top-14 right-14 text-5xl">⭐</div>
          <div className="absolute top-24 left-10 text-4xl">💬</div>
          <div className="absolute bottom-24 left-24 text-4xl">🏆</div>
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col px-4 py-10">
          {showHeader && (
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {title && <h1 className="text-3xl font-bold tracking-tight text-brand-800 sm:text-4xl">{title}</h1>}
                {subtitle && <p className="mt-2 text-sm text-brand-700 sm:text-base">{subtitle}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {backButton}
                {actions}
              </div>
            </header>
          )}

          <main className="mx-auto w-full max-w-4xl">{children}</main>
        </div>
      </div>
    </div>
  );
}
