"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useAppContext } from "../layout";
import { BigButton } from "@/components/ui/BigButton";
import { auth } from "@/lib/firebase/client";
import { updateBusiness, getUserPayments } from "@/lib/firebase/store";
import { TRADES } from "@/lib/templates";
import { LogOut, Save } from "lucide-react";

export default function MiNegocioPage() {
  const { user } = useAuth();
  const { business, status } = useAppContext();
  const router = useRouter();

  const [name, setName] = useState(business.businessName);
  const [phone, setPhone] = useState(business.phone);
  
  // Premium Fields
  const [razonSocial, setRazonSocial] = useState(business.razonSocial || "");
  const [rif, setRif] = useState(business.rifOrCedula || "");
  const [quotePrefix, setQuotePrefix] = useState(business.quotePrefix || "");
  const [themeColor, setThemeColor] = useState(business.themeColor || "#1E3A8A");
  const [logoUrl, setLogoUrl] = useState(business.logoUrl || "");

  const [saving, setSaving] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getUserPayments(user.uid).then(setPayments);
    }
  }, [user]);

  const tradeMeta = TRADES.find((t) => t.id === business.trade);
  const isPremium = status === "active";

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await updateBusiness(user.uid, business.id, {
        businessName: name.trim() || business.businessName,
        phone: phone.trim() || business.phone,
        razonSocial: razonSocial.trim(),
        rifOrCedula: rif.trim(),
        quotePrefix: quotePrefix.trim(),
        themeColor,
        logoUrl,
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  }

  async function handleLogout() {
    await auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      <header>
        <h1 className="text-2xl font-extrabold">Mi Negocio 🧰</h1>
        <p className="text-muted text-sm mt-1">Configura los datos que ven tus clientes</p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <label className="text-xs font-bold uppercase text-muted">Oficio (No se puede cambiar)</label>
          <div className="mt-1 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-xl">{tradeMeta?.emoji}</span>
            <span className="font-bold text-slate-500">{tradeMeta?.label}</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-muted">Nombre del Negocio</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-navy"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-muted">WhatsApp de contacto</label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-navy"
          />
        </div>

        <BigButton onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </BigButton>
      </section>

      {/* Funciones Premium */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border-2 border-accent/20 relative overflow-hidden">
        {!isPremium && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-4xl mb-2">⭐</span>
            <h3 className="font-extrabold text-navy text-lg">Función Premium</h3>
            <p className="text-sm text-muted mt-1 mb-3">Activa tu suscripción para personalizar tu negocio con logos, RIF, colores y correlativos.</p>
            <Link href="/app/suscripcion" className="rounded-xl bg-accent px-4 py-2 font-bold text-navy shadow-sm">
              Mejorar plan
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-extrabold text-navy">Identidad Premium</h2>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent-dark uppercase">Pro</span>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-muted">Razón Social</label>
          <input
            type="text"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            placeholder="Ej: Inversiones Pérez C.A."
            disabled={!isPremium}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-navy disabled:opacity-50"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-muted">RIF o Cédula</label>
          <input
            type="text"
            value={rif}
            onChange={(e) => setRif(e.target.value)}
            placeholder="Ej: J-12345678-9"
            disabled={!isPremium}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-navy disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase text-muted">Prefijo</label>
            <input
              type="text"
              value={quotePrefix}
              onChange={(e) => setQuotePrefix(e.target.value)}
              placeholder="Ej: PRE-"
              disabled={!isPremium}
              className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-navy disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-muted">Color PDF</label>
            <div className="mt-1 flex h-[48px] w-full items-center justify-between rounded-xl border-2 border-slate-200 px-2 disabled:opacity-50">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                disabled={!isPremium}
                className="h-8 w-full cursor-pointer bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-muted">Logo del Negocio</label>
          <div className="mt-1 flex items-center gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-xl object-contain border-2 border-slate-100" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                Logo
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={!isPremium}
              onChange={handleLogoUpload}
              className="text-sm disabled:opacity-50"
            />
          </div>
        </div>
        
        {isPremium && (
          <BigButton onClick={handleSave} disabled={saving} variant="ghost">
            {saving ? "Guardando..." : "Guardar identidad"}
          </BigButton>
        )}
      </section>

      {/* Suscripción e Historial */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-navy/10 bg-navy/5 p-5">
          <h2 className="text-sm font-bold uppercase text-navy">Mi Suscripción</h2>
          <div className="flex justify-between items-center">
            <span className="font-bold">
              {status === "active" ? "Plan Premium" : "Plan Trial (15 días)"}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {status === "active" ? "ACTIVO" : "DE PRUEBA"}
            </span>
          </div>
          
          <Link href="/app/suscripcion" className="mt-2 block w-full rounded-xl bg-navy py-3 text-center font-bold text-white shadow-sm active:scale-95 transition-transform">
            {status === "active" ? "Extender Suscripción" : "Pagar Suscripción"}
          </Link>
        </div>

        {/* Historial de pagos */}
        {payments.length > 0 && (
          <div className="rounded-2xl border-2 border-slate-100 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold uppercase text-muted">Historial de pagos</h3>
            <div className="flex flex-col gap-3">
              {payments.map(p => (
                <div key={p.id} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-navy">{p.amount} {p.currency}</span>
                    <span className="text-xs text-muted">
                      {p.createdAt ? new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "short", year: "numeric" }).format(p.createdAt) : "Reciente"}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${p.status === "success" ? "text-green-600" : p.status === "rejected" ? "text-red-500" : "text-yellow-600"}`}>
                    {p.status === "success" ? "Aprobado" : p.status === "rejected" ? "Rechazado" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center justify-center gap-2 py-4 font-bold text-red-500 active:opacity-70"
      >
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </main>
  );
}
