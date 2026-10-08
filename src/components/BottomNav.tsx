"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, User, Users } from "lucide-react";

const tabs = [
  { href: "/app", label: "Inicio", icon: Home },
  { href: "/app/presupuestos", label: "Presupuestos", icon: FileText },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/mi-negocio", label: "Mi negocio", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => {
          const active =
            tab.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition ${
                active ? "text-navy" : "text-slate-400"
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
