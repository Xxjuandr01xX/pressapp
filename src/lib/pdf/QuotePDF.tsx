"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { QuoteItem } from "@/types";

// ─── Tipos ─────────────────────────────────────────────────
interface QuotePDFProps {
  quoteNumber: string;
  businessName: string;
  businessPhone: string;
  tradeName: string;
  clientName: string;
  clientPhone?: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalBs?: number;
  taxRate: number;
  notes?: string;
  date: string;
  showWatermark?: boolean;
  logoUrl?: string;
  razonSocial?: string;
  rifOrCedula?: string;
  themeColor?: string;
  quotePrefix?: string;
  currency?: "USD" | "EUR";
  exchangeRate?: number;
}

// ─── Colores ───────────────────────────────────────────────
const NAVY = "#1E3A8A";
const ACCENT = "#FBBF24";
const GRAY = "#64748B";
const LIGHT_BG = "#F8FAFC";
const WHITE = "#FFFFFF";
const DARK = "#0F172A";

// ─── Estilos ───────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    color: DARK,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottomWidth: 3,
    borderBottomColor: NAVY,
    paddingBottom: 16,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  brandTrade: {
    fontSize: 10,
    color: GRAY,
    marginTop: 2,
  },
  brandPhone: {
    fontSize: 10,
    color: GRAY,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  quoteLabel: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  quoteNumber: {
    fontSize: 10,
    color: GRAY,
    marginTop: 2,
  },
  quoteDate: {
    fontSize: 10,
    color: GRAY,
    marginTop: 2,
  },

  // Info del cliente
  clientBox: {
    backgroundColor: LIGHT_BG,
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  clientLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  clientPhone: {
    fontSize: 10,
    color: GRAY,
    marginTop: 2,
  },

  // Tabla
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: NAVY,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  tableHeaderText: {
    color: WHITE,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableRowAlt: {
    backgroundColor: LIGHT_BG,
  },
  cellDesc: { flex: 3 },
  cellQty: { flex: 1, textAlign: "center" },
  cellUnit: { flex: 1, textAlign: "center" },
  cellPrice: { flex: 1.2, textAlign: "right" },
  cellTotal: { flex: 1.2, textAlign: "right", fontFamily: "Helvetica-Bold" },

  // Totales
  totalsBox: {
    alignSelf: "flex-end",
    width: 220,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: GRAY,
  },
  totalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: NAVY,
  },
  totalFinalLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  totalFinalValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  totalBs: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalBsText: {
    fontSize: 9,
    color: GRAY,
  },

  // Notas
  notesBox: {
    backgroundColor: LIGHT_BG,
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.5,
  },

  // Watermark / Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  watermark: {
    fontSize: 8,
    color: GRAY,
    textAlign: "center",
  },
  watermarkOverlay: {
    position: "absolute",
    top: 350,
    left: 10,
    opacity: 0.1,
    transform: "rotate(-45deg)",
  },
  watermarkOverlayText: {
    fontSize: 90,
    color: "#000000",
    fontFamily: "Helvetica-Bold",
  },
});

// ─── Helpers ───────────────────────────────────────────────
function fmtCurrency(n: number, currency: "USD" | "EUR" = "USD"): string {
  const symbol = currency === "EUR" ? "€" : "$";
  return `${symbol}${n.toFixed(2)}`;
}

function fmtBs(n: number): string {
  return `Bs. ${n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Componente PDF ────────────────────────────────────────
export function QuotePDF({
  quoteNumber,
  businessName,
  businessPhone,
  tradeName,
  clientName,
  clientPhone,
  items,
  subtotal,
  tax,
  total,
  totalBs,
  taxRate,
  notes,
  date,
  showWatermark = true,
  logoUrl,
  razonSocial,
  rifOrCedula,
  themeColor,
  quotePrefix,
  currency = "USD",
  exchangeRate,
}: QuotePDFProps) {
  const dynamicColor = (!showWatermark && themeColor) ? themeColor : NAVY;
  
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        
        {/* Marca de agua GIGANTE en diagonal (solo si showWatermark = true) */}
        {showWatermark && (
          <View style={s.watermarkOverlay}>
            <Text style={s.watermarkOverlayText}>Generado en Trial</Text>
          </View>
        )}

        {/* ─── Header ─── */}
        <View style={[s.header, { borderBottomColor: dynamicColor }]}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {!showWatermark && logoUrl && (
              <Image src={logoUrl} style={{ width: 60, height: 60, objectFit: "contain", marginRight: 12 }} />
            )}
            <View style={{ paddingTop: 4, flex: 1 }}>
              <Text style={[s.brandName, { color: dynamicColor, marginBottom: 4 }]}>
                {(!showWatermark && razonSocial) ? razonSocial : businessName}
              </Text>
              {!showWatermark && rifOrCedula && <Text style={{ fontSize: 9, color: GRAY, marginBottom: 4, fontFamily: "Helvetica-Bold" }}>RIF/C.I: {rifOrCedula}</Text>}
              <Text style={{ fontSize: 10, color: GRAY, marginBottom: 2 }}>{tradeName}</Text>
              <Text style={{ fontSize: 10, color: GRAY }}>📱 {businessPhone}</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={[s.quoteLabel, { color: dynamicColor }]}>PRESUPUESTO</Text>
            <Text style={s.quoteNumber}>#{!showWatermark && quotePrefix ? quotePrefix : ""}{quoteNumber}</Text>
            <Text style={s.quoteDate}>{date}</Text>
          </View>
        </View>

        {/* ─── Cliente ─── */}
        <View style={s.clientBox}>
          <Text style={s.clientLabel}>Cliente</Text>
          <Text style={s.clientName}>{clientName}</Text>
          {clientPhone && <Text style={s.clientPhone}>📱 {clientPhone}</Text>}
        </View>

        {/* ─── Tabla ─── */}
        <View style={s.table}>
          <View style={[s.tableHeader, { backgroundColor: dynamicColor }]}>
            <Text style={[s.tableHeaderText, s.cellDesc]}>Descripción</Text>
            <Text style={[s.tableHeaderText, s.cellQty]}>Cant.</Text>
            <Text style={[s.tableHeaderText, s.cellUnit]}>Unidad</Text>
            <Text style={[s.tableHeaderText, s.cellPrice]}>P. Unit.</Text>
            <Text style={[s.tableHeaderText, s.cellTotal]}>Total</Text>
          </View>

          {items.map((item, i) => (
            <View
              key={i}
              style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
            >
              <Text style={s.cellDesc}>{item.description || "—"}</Text>
              <Text style={s.cellQty}>{item.quantity}</Text>
              <Text style={s.cellUnit}>{item.unit}</Text>
              <Text style={s.cellPrice}>{fmtCurrency(item.unitPriceUSD, currency)}</Text>
              <View style={s.cellTotal}>
                <Text>
                  {fmtCurrency(item.quantity * item.unitPriceUSD, currency)}
                </Text>
                {exchangeRate ? (
                  <Text style={{ fontSize: 7, color: GRAY, marginTop: 2 }}>
                    {fmtBs(item.quantity * item.unitPriceUSD * exchangeRate)}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* ─── Totales ─── */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmtCurrency(subtotal, currency)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>
              IVA ({Math.round(taxRate * 100)}%)
            </Text>
            <Text style={s.totalValue}>{fmtCurrency(tax, currency)}</Text>
          </View>
          <View style={[s.totalFinal, { borderTopColor: dynamicColor }]}>
            <Text style={[s.totalFinalLabel, { color: dynamicColor }]}>TOTAL</Text>
            <Text style={[s.totalFinalValue, { color: dynamicColor }]}>{fmtCurrency(total, currency)}</Text>
          </View>
          {totalBs !== undefined && (
            <View style={s.totalBs}>
              <Text style={s.totalBsText}>Ref. en Bolívares</Text>
              <Text style={s.totalBsText}>{fmtBs(totalBs)}</Text>
            </View>
          )}
        </View>

        {/* ─── Notas ─── */}
        {notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notas</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* ─── Watermark / Footer ─── */}
        {showWatermark && (
          <View style={s.footer}>
            <Text style={s.watermark}>
              Generado rápida y profesionalmente con Press — press.app
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
