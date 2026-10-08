import { FileText, MessageCircle, Smartphone, Zap } from "lucide-react";
import Link from "next/link";
import { BigLink } from "@/components/ui/BigButton";
import { PRICE_USD, TRIAL_DAYS } from "@/lib/subscription";

export default function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-5 py-8">
      <header className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white">
          <Zap aria-hidden />
        </span>
        <span className="text-2xl font-extrabold text-navy">Press</span>
      </header>

      <section className="flex flex-col gap-5">
        <h1 className="text-3xl font-extrabold leading-tight">
          Presupuestos profesionales desde tu celular, en 1 minuto
        </h1>
        <p className="text-lg text-muted">
          Deja de mandar presupuestos desordenados por WhatsApp. Con Press haces un PDF bonito, con tu nombre y tus
          precios, y se lo mandas a tu cliente al instante.
        </p>
        <BigLink href="/registro" variant="accent">
          Probar {TRIAL_DAYS} días gratis
        </BigLink>
        <Link href="/login" className="text-center text-lg font-semibold text-navy underline">
          Ya tengo cuenta
        </Link>
      </section>

      <section className="grid gap-4">
        {[
          { icon: <FileText />, t: "Plantillas listas", d: "Plomería, electricidad, albañilería, herrería y refrigeración." },
          { icon: <MessageCircle />, t: "Directo a WhatsApp", d: "Un toque y tu cliente recibe el presupuesto." },
          { icon: <Smartphone />, t: "Fácil de usar", d: "Botones grandes. Si sabes usar WhatsApp, sabes usar Press." },
        ].map((f) => (
          <div key={f.t} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
            <span className="text-navy">{f.icon}</span>
            <div>
              <h2 className="text-lg font-bold">{f.t}</h2>
              <p className="text-muted">{f.d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-navy p-6 text-center text-white">
        <p className="text-lg">Después de la prueba</p>
        <p className="text-4xl font-extrabold">{PRICE_USD} USDT</p>
        <p className="text-lg">al mes · pagas con Binance · sin límites</p>
      </section>

      <footer className="flex justify-center gap-6 pb-4 text-muted">
        <Link href="/terminos" className="underline">Términos</Link>
        <Link href="/privacidad" className="underline">Privacidad</Link>
      </footer>
    </main>
  );
}
