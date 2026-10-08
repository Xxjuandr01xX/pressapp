import type { ItemCategory, QuoteItem, Trade } from "@/types";

export interface SystemTemplate {
  id: string;
  trade: Trade;
  name: string;
  emoji: string;
  items: QuoteItem[];
}

const m = (description: string, quantity: number, unit: string, unitPriceUSD: number, category: ItemCategory = "material"): QuoteItem => ({
  description,
  quantity,
  unit,
  unitPriceUSD,
  category,
});
const mo = (description: string, quantity: number, unit: string, price: number) => m(description, quantity, unit, price, "mano_de_obra");

export const TRADES: { id: Trade; label: string; emoji: string }[] = [
  { id: "plomeria", label: "Plomería", emoji: "🔧" },
  { id: "electricidad", label: "Electricidad", emoji: "⚡" },
  { id: "albanileria", label: "Albañilería", emoji: "🧱" },
  { id: "herreria", label: "Herrería", emoji: "🔩" },
  { id: "refrigeracion", label: "Refrigeración", emoji: "❄️" },
  { id: "general", label: "Otro oficio", emoji: "🛠️" },
];

// Precios referenciales en USD: el técnico los ajusta a su realidad.
export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  { id: "fuga", trade: "plomeria", name: "Reparar fuga", emoji: "💧", items: [m('Tubo PVC 1/2"', 2, "m", 3), m("Pegamento PVC", 1, "und", 2.5), m("Teflón", 2, "und", 0.5), mo("Mano de obra", 3, "h", 8)] },
  { id: "tanque", trade: "plomeria", name: "Instalar tanque de agua", emoji: "🚿", items: [m("Tanque 1000 L", 1, "und", 120), m('Tubo PVC 3/4"', 6, "m", 4), m("Llave de paso", 2, "und", 6), m("Flotante", 1, "und", 8), mo("Instalación", 1, "trabajo", 60)] },
  { id: "destape", trade: "plomeria", name: "Destapar tubería", emoji: "🪠", items: [m("Químico destapador", 1, "und", 5), mo("Destape con guaya", 1, "trabajo", 25)] },
  { id: "calentador", trade: "plomeria", name: "Instalar calentador", emoji: "🔥", items: [m("Mangueras flexibles", 2, "und", 5), m("Llave de paso", 1, "und", 6), mo("Instalación", 1, "trabajo", 40)] },
  { id: "punto-luz", trade: "electricidad", name: "Punto de luz nuevo", emoji: "💡", items: [m("Cable #12", 10, "m", 0.8), m("Interruptor", 1, "und", 3), m("Roseta", 1, "und", 2), m("Canaleta", 3, "m", 1.5), mo("Mano de obra", 1, "punto", 15)] },
  { id: "breaker", trade: "electricidad", name: "Instalar breaker", emoji: "🔌", items: [m("Breaker 20A", 1, "und", 8), m("Cable #10", 3, "m", 1.2), mo("Instalación", 1, "trabajo", 15)] },
  { id: "cableado", trade: "electricidad", name: "Cambio de cableado", emoji: "🧵", items: [m("Cable #12", 50, "m", 0.8), m("Cajetín", 6, "und", 1), m("Toma corriente", 6, "und", 3), mo("Mano de obra", 6, "punto", 12)] },
  { id: "ac-electrico", trade: "electricidad", name: "Toma para aire acondicionado", emoji: "🌬️", items: [m("Cable #10", 15, "m", 1.2), m("Breaker 30A", 1, "und", 10), m("Toma 220V", 1, "und", 6), mo("Instalación", 1, "trabajo", 35)] },
  { id: "friso", trade: "albanileria", name: "Friso de pared", emoji: "🧱", items: [m("Cemento", 2, "saco", 9), m("Arena", 1, "m³", 30), mo("Friso", 10, "m²", 6)] },
  { id: "ceramica", trade: "albanileria", name: "Colocar cerámica", emoji: "🟫", items: [m("Cerámica", 10, "m²", 12), m("Pego", 3, "saco", 8), m("Crucetas", 1, "bolsa", 2), mo("Colocación", 10, "m²", 7)] },
  { id: "pared", trade: "albanileria", name: "Levantar pared", emoji: "🏗️", items: [m("Bloque 15cm", 100, "und", 0.9), m("Cemento", 4, "saco", 9), m("Cabilla 3/8", 4, "und", 6), mo("Mano de obra", 8, "m²", 10)] },
  { id: "puerta", trade: "herreria", name: "Puerta de seguridad", emoji: "🚪", items: [m("Tubo cuadrado 1x1", 4, "und", 12), m("Platina", 2, "und", 8), m("Bisagras", 3, "und", 3), m("Pintura anticorrosiva", 1, "galón", 25), mo("Fabricación e instalación", 1, "trabajo", 80)] },
  { id: "reja", trade: "herreria", name: "Reja para ventana", emoji: "🪟", items: [m("Cabilla 1/2", 4, "und", 7), m("Platina", 1, "und", 8), m("Pintura", 1, "litro", 8), mo("Fabricación e instalación", 1, "trabajo", 40)] },
  { id: "porton", trade: "herreria", name: "Portón corredizo", emoji: "🏠", items: [m("Tubo estructural", 8, "und", 15), m("Riel", 6, "m", 10), m("Ruedas", 2, "und", 15), mo("Fabricación e instalación", 1, "trabajo", 150)] },
  { id: "mant-split", trade: "refrigeracion", name: "Mantenimiento de split", emoji: "❄️", items: [m("Gas refrigerante (recarga)", 1, "und", 25), mo("Limpieza y mantenimiento", 1, "equipo", 25)] },
  { id: "inst-split", trade: "refrigeracion", name: "Instalar split", emoji: "🌡️", items: [m("Tubo de cobre", 4, "m", 9), m("Cable", 5, "m", 1.2), m("Base", 1, "und", 15), mo("Instalación", 1, "equipo", 60)] },
  { id: "nevera", trade: "refrigeracion", name: "Reparar nevera", emoji: "🧊", items: [mo("Diagnóstico", 1, "und", 10), m("Repuesto", 1, "und", 20), mo("Reparación", 1, "trabajo", 30)] },
  { id: "visita", trade: "general", name: "Visita técnica", emoji: "🛠️", items: [mo("Visita y diagnóstico", 1, "visita", 10)] },
];

export function templatesFor(trade: Trade): SystemTemplate[] {
  return SYSTEM_TEMPLATES.filter((t) => t.trade === trade || t.trade === "general");
}
