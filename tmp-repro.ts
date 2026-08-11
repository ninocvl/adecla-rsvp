import "dotenv/config";
import { prisma } from "./src/lib/prisma";
import { createRegistrationAction } from "./src/server/actions/registration.actions";

async function main(){
  const ev = (await prisma.event.findFirst({ where:{slug:"padel"}, include:{dates:{orderBy:{date:"asc"}}} }))!;
  const af = (await prisma.affiliate.findFirst({ where:{status:"ACTIVO"} }))!;
  const input:any = {
    eventSlug:"padel", eventId: ev.id, eventDateIds:[ev.dates[0].id],
    legalName: af.name, rnc:"131234567", contactName:"Prueba Cupon",
    email:"qa@example.com", phone:"8095551234",
    isAffiliated:true, affiliateId: af.id,
    padelParticipantType:"AFILIADO", padelCategory:"MASCULINO_A", isSponsorGuest:false,
    couponCode:"ADECLA-PAREJA",
    participants:[{fullName:"Jugador Uno QA"},{fullName:"Jugador Dos QA"}],
  };
  const r:any = await createRegistrationAction(input).catch((e:any)=>({ok:false,error:"EXCEPCION: "+e.message}));
  console.log("resultado:", r.ok ? "OK" : "RECHAZADO -> " + r.error);

  const regs = await prisma.registration.findMany({
    where:{ company:{ contactName:"Prueba Cupon" } },
    include:{ proforma:true, couponUsed:true, participants:true },
  });
  for (const x of regs) {
    console.log("\ninscripcion:", x.code,
      "\n  jugadores:", x.participants.length, "| total USD", Number(x.totalUsd).toFixed(2),
      "\n  PROFORMA:", x.proforma ? "SI (numero " + x.proforma.number + ")" : "NO",
      "\n  cupon canjeado:", x.couponUsed ? x.couponUsed.code : "no");
    if (x.proforma) {
      const s:any = x.proforma.snapshot;
      console.log("  snapshot -> subtotal", s.subtotalUsd, "| descuento", s.discountUsd ?? "(sin)", "|", s.discountLabel ?? "", "| total", s.totalUsd);
    }
  }
  if (regs.length === 0) console.log("\nNO SE CREO NINGUNA INSCRIPCION");
}
main().catch(e=>console.error("FALLO:", e)).finally(()=>prisma.$disconnect());
