import { Clock, Handshake, Megaphone, Presentation } from "lucide-react";

// Cuatro razones concretas, no cuatro adjetivos. Van sobre el teal y
// separadas por filetes, no metidas cada una en su propia tarjeta: repetir
// la misma caja cuatro veces es lo que vuelve genérica esta sección.
const RAZONES = [
  {
    icono: Clock,
    titulo: "Cinco horas por ronda",
    texto:
      "Una vuelta de golf da un tiempo con clientes y aliados que ninguna reunión de oficina consigue.",
  },
  {
    icono: Handshake,
    titulo: "Todo el sector, una cancha",
    texto:
      "Constructores, desarrolladores y proveedores afiliados juegan las mismas paradas del circuito.",
  },
  {
    icono: Presentation,
    titulo: "Agenda técnica en Medellín",
    texto:
      "Expocamacol suma conferencias, charlas técnicas y lanzamientos de más de 500 expositores.",
  },
  {
    icono: Megaphone,
    titulo: "Tu marca en el circuito",
    texto:
      "Las empresas patrocinadoras acompañan las paradas del año y reciben cupos de cortesía.",
  },
];

export function BenefitsBand() {
  return (
    <section className="hero-teal relative overflow-hidden py-20 sm:py-24">
      <div className="grain-overlay" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="max-w-lg">
          <span className="section-rule section-rule--oro" aria-hidden />
          <h2 className="font-heading text-3xl font-medium text-white sm:text-4xl">
            Por qué se juega
          </h2>
          <p className="mt-3 text-white/90">
            El circuito existe para que el sector construcción de La Altagracia
            se encuentre fuera de una sala de reuniones.
          </p>
        </div>

        <dl className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {RAZONES.map(({ icono: Icono, titulo, texto }) => (
            <div key={titulo} className="border-t border-white/20 pt-5">
              <Icono
                className="size-5 text-[var(--oro-claro)]"
                strokeWidth={1.75}
                aria-hidden
              />
              <dt className="mt-4 font-heading text-lg font-medium text-white">
                {titulo}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-white/90">
                {texto}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
