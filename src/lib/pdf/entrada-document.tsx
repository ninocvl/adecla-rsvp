import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { formatearCodigo } from "@/lib/entradas";

// La entrada es la pieza de diseño de ADECLA tal cual (plantilla, ya
// recortada y con el QR de muestra borrado) y encima solo se escribe lo que
// cambia por persona: nombre, código, cupos y el QR. Todas las medidas están
// en píxeles de la plantilla (1353 × 763) y se escalan al tamaño de página.
const PLANTILLA_W = 1353;
const PLANTILLA_H = 763;
const PAGE_W = 720; // pt, ~25 cm
const PAGE_H = (PAGE_W * PLANTILLA_H) / PLANTILLA_W;
const k = PAGE_W / PLANTILLA_W;
const px = (n: number) => n * k;

const INK = "#17313A";
const TEAL = "#0E8A80";
const TEAL_DARK = "#0A4E4A";

export interface EntradaPdfData {
  codigo: string;
  nombre: string;
  tipo: "AFILIADO" | "EXTERNO";
  cupos: number;
}

function tamanoNombre(nombre: string): { size: number; dosLineas: boolean } {
  const largo = nombre.length;
  if (largo > 40) return { size: 17, dosLineas: true };
  return { size: Math.max(18, Math.min(30, 380 / (largo * 0.58))), dosLineas: false };
}

export function EntradaDocument({
  data,
  plantillaSrc,
  qrSrc,
}: {
  data: EntradaPdfData;
  plantillaSrc: string;
  qrSrc: string;
}) {
  const nombre = data.nombre.length > 70 ? `${data.nombre.slice(0, 69)}…` : data.nombre;
  const { size, dosLineas } = tamanoNombre(nombre);

  return (
    <Document
      title={`Entrada ${formatearCodigo(data.codigo)}`}
      author="ADECLA"
      language="es"
    >
      <Page size={[PAGE_W, PAGE_H]} style={{ position: "relative" }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          src={plantillaSrc}
          style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
        />

        {/* Cupos y tipo: lo que el staff mira primero. Arriba a la derecha,
            sobre la ilustración, porque abajo no queda hueco en el diseño. */}
        <View
          style={{
            position: "absolute",
            left: px(965),
            top: px(26),
            width: px(335),
            height: px(96),
            borderRadius: px(18),
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: TEAL,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: px(16),
          }}
        >
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              fontSize: px(68),
              color: TEAL_DARK,
              width: px(52),
              textAlign: "center",
            }}
          >
            {data.cupos}
          </Text>
          <View style={{ marginLeft: px(10), flexGrow: 1 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: px(22), color: INK }}>
              {data.cupos === 1 ? "CUPO" : "CUPOS"}
            </Text>
            <Text style={{ fontFamily: "Helvetica", fontSize: px(17), color: "#51646B", marginTop: px(2) }}>
              {data.tipo === "AFILIADO" ? "AFILIADO" : "EXTERNO"}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            {[1, 2, 3].map((n) => (
              <View
                key={n}
                style={{
                  width: px(26),
                  height: px(26),
                  borderRadius: px(13),
                  marginLeft: px(6),
                  flexShrink: 0,
                  borderWidth: 1.2,
                  borderColor: TEAL,
                  backgroundColor: n <= data.cupos ? TEAL : "#FFFFFF",
                }}
              />
            ))}
          </View>
        </View>

        {/* QR sobre el hueco blanco que dejó la plantilla. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          src={qrSrc}
          style={{ position: "absolute", left: px(1133), top: px(447), width: px(180), height: px(180) }}
        />

        {/* NOMBRE */}
        <View
          style={{
            position: "absolute",
            left: px(172),
            top: px(663),
            width: px(392),
            height: px(56),
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              fontSize: px(size),
              color: INK,
              lineHeight: dosLineas ? 1.05 : 1,
            }}
          >
            {nombre}
          </Text>
        </View>

        {/* TICKET # */}
        <View
          style={{
            position: "absolute",
            left: px(757),
            top: px(663),
            width: px(263),
            height: px(56),
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: "Courier-Bold", fontSize: px(32), color: INK, letterSpacing: px(2) }}>
            {formatearCodigo(data.codigo)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
