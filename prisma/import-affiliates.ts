// Importa el listado de socios de ADECLA desde prisma/affiliates-seed-data.json
// (generado a partir del Excel que maneja Katherin, nunca commiteado — ver
// .gitignore). Idempotente: usa el nombre de la empresa como clave para no
// duplicar en reimportaciones.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

interface AffiliateRow {
  sourceId: string | null;
  name: string;
  affiliationType: "CONSTRUCTOR" | "PROVEEDOR" | "DESARROLLADOR" | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
}

async function main() {
  const dataPath = path.join(__dirname, "affiliates-seed-data.json");
  if (!fs.existsSync(dataPath)) {
    throw new Error(
      `No se encontró ${dataPath}. Genera el archivo a partir del Excel de socios antes de importar.`
    );
  }
  const rows: AffiliateRow[] = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  let created = 0;
  let updated = 0;
  for (const row of rows) {
    const existing = await prisma.affiliate.findFirst({
      where: { name: row.name },
    });
    if (existing) {
      await prisma.affiliate.update({
        where: { id: existing.id },
        data: {
          sourceId: row.sourceId,
          affiliationType: row.affiliationType,
          contactName: row.contactName,
          phone: row.phone,
          email: row.email,
          status: row.status,
        },
      });
      updated++;
    } else {
      await prisma.affiliate.create({
        data: {
          sourceId: row.sourceId,
          name: row.name,
          affiliationType: row.affiliationType,
          contactName: row.contactName,
          phone: row.phone,
          email: row.email,
          status: row.status,
        },
      });
      created++;
    }
  }

  console.log(`✔ Afiliados: ${created} nuevos, ${updated} actualizados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
