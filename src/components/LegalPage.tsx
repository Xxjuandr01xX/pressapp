import Link from "next/link";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <Link href="/" className="text-lg font-semibold text-navy underline">
        ← Volver
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold">{title}</h1>
      <p className="mt-1 text-muted">Última actualización: octubre 2026</p>
      <div className="mt-6 flex flex-col gap-4 text-lg leading-relaxed [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold">
        {children}
      </div>
    </main>
  );
}
