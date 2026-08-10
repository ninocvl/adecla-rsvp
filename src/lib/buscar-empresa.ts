/**
 * Búsqueda del listado de socios en el formulario de inscripción.
 *
 * Comparar el texto tal cual dejaba fuera casos normales: la razón social
 * del Excel casi nunca es como la gente escribe el nombre de su empresa.
 * "Down Town" no encontraba "DOWNTOWN SOLUTIONS SERVICES YAR, SRL", y quien
 * no diera con su empresa no podía inscribirse como afiliado.
 */

/** Sin tildes y en minúsculas, para que "diseño" encuentre "Diseño". */
function sinTildes(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Solo letras y números: iguala espacios, comas, puntos y guiones. */
function compactar(texto: string): string {
  return sinTildes(texto).replace(/[^a-z0-9]/g, "");
}

/**
 * Coincide si lo escrito aparece de corrido ignorando la puntuación
 * ("down town" encuentra "DOWNTOWN…", "srl" encuentra "S.R.L."), o si cada
 * palabra escrita aparece en el nombre, aunque vayan en otro orden
 * ("solutions yar" encuentra "DOWNTOWN SOLUTIONS SERVICES YAR, SRL").
 */
export function coincideEmpresa(nombre: string, consulta: string): boolean {
  const buscado = consulta.trim();
  if (!buscado) return true;

  const nombreCompacto = compactar(nombre);
  if (nombreCompacto.includes(compactar(buscado))) return true;

  const palabras = sinTildes(buscado).split(/\s+/).filter(Boolean);
  const nombrePlano = sinTildes(nombre);
  return palabras.every((palabra) => nombrePlano.includes(palabra));
}

/**
 * Filtra el listado. Si la búsqueda estricta no encuentra nada, se relaja a
 * "alguna palabra coincide" en vez de dejar la lista vacía: varias empresas
 * cambiaron de razón social y la gente las busca como las conocía. Quien
 * escribe "Down Town Punta Cana" ve igual la DOWNTOWN SOLUTIONS de ahora,
 * en vez de creer que su empresa no está y abandonar la inscripción.
 */
export function buscarEmpresas<T extends { name: string }>(
  empresas: T[],
  consulta: string,
  maximo = 20
): T[] {
  if (!consulta.trim()) return empresas.slice(0, maximo);

  const estricta = empresas.filter((e) => coincideEmpresa(e.name, consulta));
  if (estricta.length > 0) return estricta.slice(0, maximo);

  // Palabras de menos de tres letras ("de", "y", "la") harían coincidir
  // media lista sin ayudar a nadie.
  const palabras = sinTildes(consulta)
    .split(/\s+/)
    .filter((p) => p.length >= 3);
  if (palabras.length === 0) return [];

  // Se ordena por cuántas palabras coinciden para que la más parecida
  // quede arriba: buscando "Down Town Punta Cana" importa que la primera
  // sea DOWNTOWN y no otra que solo comparta "punta".
  return empresas
    .map((empresa) => {
      const plano = sinTildes(empresa.name);
      return {
        empresa,
        aciertos: palabras.filter((p) => plano.includes(p)).length,
      };
    })
    .filter((r) => r.aciertos > 0)
    .sort((a, b) => b.aciertos - a.aciertos)
    .slice(0, maximo)
    .map((r) => r.empresa);
}
