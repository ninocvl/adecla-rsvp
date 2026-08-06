import { Award, Lightbulb, TrendingUp, Users } from "lucide-react";

// Las cuatro razones van sobre fondo claro y centradas, con el icono como
// primer elemento de cada columna: es el patrón del flyer de Eventos ADECLA
// 2026. El oro aquí nombra la marca (igual que el filete de sección), no
// marca nada accionable — ver la regla del oro en DESIGN.md.
const RAZONES = [
  {
    icono: Users,
    titulo: "Conecta",
    texto:
      "Amplía tu red con líderes, empresas y profesionales del sector construcción.",
  },
  {
    icono: Lightbulb,
    titulo: "Aprende",
    texto:
      "Accede a contenido actualizado, charlas técnicas y mejores prácticas.",
  },
  {
    icono: TrendingUp,
    titulo: "Genera oportunidades",
    texto: "Encuentra aliados, clientes y nuevas colaboraciones de negocio.",
  },
  {
    icono: Award,
    titulo: "Posiciona tu marca",
    texto:
      "Aumenta tu visibilidad y fortalece el reconocimiento de tu empresa.",
  },
];

export function BenefitsBand() {
  return (
    <section className="border-t bg-secondary/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* max-w-4xl y no 2xl: con 2xl el titular partía en dos líneas. Aquí
            entra completo en una sola desde tablet. */}
        <div className="mx-auto max-w-4xl text-center">
          <span className="section-rule section-rule--oro mx-auto" aria-hidden />
          <h2 className="font-heading text-3xl font-medium text-balance text-foreground sm:text-4xl">
            ¿Por qué participar en los eventos{" "}
            <span className="text-[var(--oro)]">ADECLA</span>?
          </h2>
        </div>

        {/* Divisores verticales solo en escritorio: apilados en móvil la
            línea sobra y separa peor que el propio espacio. */}
        <dl className="mt-14 grid gap-y-12 sm:grid-cols-2 sm:gap-x-10 md:grid-cols-4 md:gap-x-0">
          {RAZONES.map(({ icono: Icono, titulo, texto }, i) => (
            <div
              key={titulo}
              className={`px-2 text-center md:px-6 ${
                i > 0 ? "md:border-l md:border-border" : ""
              }`}
            >
              <Icono
                className="mx-auto size-9 text-[var(--oro)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <dt className="mt-5 font-heading text-lg font-medium text-foreground">
                {titulo}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {texto}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
