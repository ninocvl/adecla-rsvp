import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { ADECLA, NOTA_PAGO } from "@/lib/constants";
import type { ProformaSnapshot } from "./proforma-types";

const money = new Intl.NumberFormat("es-DO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmt(amount: string | number) {
  return money.format(Number(amount));
}

function fmtEventDate(iso: string) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(iso))
    .toUpperCase();
}

function fmtShortDate(iso: string) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Santo_Domingo",
  }).format(new Date(iso));
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 46,
    paddingHorizontal: 48,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  addressLine: { marginBottom: 3 },
  logoBlock: { width: 200, alignItems: "center" },
  logo: { width: 180, height: 120, objectFit: "contain", marginTop: -36 },
  tagline: { fontSize: 5.2, letterSpacing: 0.4, marginTop: -30 },
  title: {
    textAlign: "center",
    fontSize: 19,
    fontFamily: "Helvetica-Bold",
    marginTop: 34,
    marginBottom: 26,
  },
  clientBox: {
    borderWidth: 1.2,
    borderColor: "#000",
    backgroundColor: "#ececec",
    padding: 8,
    flexDirection: "row",
  },
  clientRows: { flexGrow: 1 },
  clientRow: { flexDirection: "row", marginBottom: 3 },
  clientLabel: {
    width: 58,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
  },
  clientNo: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  table: { marginTop: 14, borderWidth: 1.2, borderColor: "#000" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#d9d9d9",
    borderBottomWidth: 1,
    borderColor: "#000",
    fontFamily: "Helvetica-Bold",
  },
  tableBody: { flexDirection: "row", minHeight: 190 },
  colCant: {
    width: 46,
    borderRightWidth: 1,
    borderColor: "#000",
    padding: 4,
    textAlign: "center",
  },
  colDesc: { flexGrow: 1, flexShrink: 1, padding: 4 },
  colPU: {
    width: 78,
    borderLeftWidth: 1,
    borderColor: "#000",
    padding: 4,
    textAlign: "right",
  },
  colSub: {
    width: 82,
    borderLeftWidth: 1,
    borderColor: "#000",
    padding: 4,
    textAlign: "right",
  },
  descEvent: { fontFamily: "Helvetica-Bold" },
  descDate: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  descMuted: { marginTop: 4, color: "#333" },
  totals: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#000",
    backgroundColor: "#ececec",
  },
  totalsLabels: {
    flexGrow: 1,
    paddingVertical: 6,
    paddingRight: 8,
    alignItems: "flex-end",
  },
  totalsValues: {
    width: 82,
    borderLeftWidth: 1,
    borderColor: "#000",
    paddingVertical: 6,
    paddingRight: 4,
    alignItems: "flex-end",
  },
  totalsLine: { marginBottom: 3 },
  totalsBold: { fontFamily: "Helvetica-Bold" },
  note: { marginTop: 10, fontSize: 8.5, color: "#333" },
  footer: { marginTop: 24 },
  footerBold: { fontFamily: "Helvetica-Bold", marginBottom: 3 },
});

interface ProformaDocumentProps {
  data: ProformaSnapshot;
  logoSrc: string;
}

export function ProformaDocument({ data, logoSrc }: ProformaDocumentProps) {
  const description = [
    `INSCRIPCIÓN ${data.event.name.toUpperCase()}`,
    `${data.affiliationLabel.toUpperCase()} — ${data.quantity} PARTICIPANTE${
      data.quantity === 1 ? "" : "S"
    }`,
  ];

  return (
    <Document
      title={`Proforma ${data.code}`}
      author={ADECLA.nombre}
      language="es"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {ADECLA.direccion.map((line) => (
              <Text key={line} style={styles.addressLine}>
                {line}
              </Text>
            ))}
            <Text style={styles.addressLine}>RNC: {ADECLA.rnc}</Text>
          </View>
          <View style={styles.logoBlock}>
            <Image src={logoSrc} style={styles.logo} />
            <Text style={styles.tagline}>
              ASOCIACIÓN DE DESARROLLADORES Y CONSTRUCTORES PROVINCIA LA
              ALTAGRACIA
            </Text>
          </View>
        </View>

        <Text style={styles.title}>FACTURA PROFORMA</Text>

        <View style={styles.clientBox}>
          <View style={styles.clientRows}>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Señores:</Text>
              <Text>{data.company.legalName}</Text>
            </View>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>RNC:</Text>
              <Text>{data.company.rnc}</Text>
            </View>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Atención:</Text>
              <Text>{data.company.contactName}</Text>
            </View>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Fecha:</Text>
              <Text>{fmtShortDate(data.issuedAt)}</Text>
            </View>
          </View>
          <Text style={styles.clientNo}>No.{data.code}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colCant}>Cant.</Text>
            <Text style={[styles.colDesc, { textAlign: "center" }]}>
              Descripción
            </Text>
            <Text style={[styles.colPU, { textAlign: "center" }]}>
              P.U. US$
            </Text>
            <Text style={[styles.colSub, { textAlign: "center" }]}>
              Sub-Total US$
            </Text>
          </View>
          <View style={styles.tableBody}>
            <Text style={styles.colCant}>{data.quantity}</Text>
            <View style={styles.colDesc}>
              {description.map((line) => (
                <Text key={line} style={styles.descEvent}>
                  {line}
                </Text>
              ))}
              <Text style={styles.descDate}>
                FECHA DEL EVENTO: {fmtEventDate(data.event.dateISO)}
              </Text>
              <Text style={styles.descMuted}>
                {data.event.dateLabel} · {data.event.venue}
              </Text>
              <Text style={styles.descMuted}>
                Participantes:{" "}
                {data.participants
                  .map((p) => `${p.position}. ${p.fullName}`)
                  .join("   ")}
              </Text>
            </View>
            <Text style={styles.colPU}>{fmt(data.unitPriceUsd)}</Text>
            <Text style={styles.colSub}>{fmt(data.totalUsd)}</Text>
          </View>
          <View style={styles.totals}>
            <View style={styles.totalsLabels}>
              <Text style={[styles.totalsLine, styles.totalsBold]}>
                Sub-total General US$
              </Text>
              <Text style={styles.totalsLine}>Itbis</Text>
              <Text style={styles.totalsBold}>TOTAL ORDEN RD$</Text>
            </View>
            <View style={styles.totalsValues}>
              <Text style={[styles.totalsLine, styles.totalsBold]}>
                {fmt(data.totalUsd)}
              </Text>
              <Text style={styles.totalsLine}>-</Text>
              <Text style={styles.totalsBold}>{fmt(data.totalDopRef)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.note}>
          {NOTA_PAGO} Referencia aplicada: 1 USD = RD$
          {fmt(data.exchangeRate)}.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerBold}>{ADECLA.banco.nombre}</Text>
          <Text style={styles.footerBold}>{ADECLA.banco.tipoCuenta}</Text>
          <Text style={styles.footerBold}>No. {ADECLA.banco.numero}</Text>
          <Text style={styles.footerBold}>{ADECLA.banco.titular}</Text>
          <Text style={styles.footerBold}>RNC-{ADECLA.banco.rnc}</Text>
        </View>
      </Page>
    </Document>
  );
}
