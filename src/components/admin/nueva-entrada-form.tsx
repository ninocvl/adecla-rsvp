"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { emitirEntradaAction } from "@/server/actions/entradas.actions";
import { coincideEmpresa } from "@/lib/buscar-empresa";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Afiliado {
  id: string;
  name: string;
  email: string | null;
}

type Resultado = { id: string; enviado: boolean; aviso?: string };

export function NuevaEntradaForm({ afiliados }: { afiliados: Afiliado[] }) {
  const [tipo, setTipo] = useState<"AFILIADO" | "EXTERNO">("AFILIADO");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cupos, setCupos] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [pendiente, startTransition] = useTransition();

  const sugeridas = useMemo(
    () => afiliados.filter((a) => coincideEmpresa(a.name, busqueda)).slice(0, 20),
    [afiliados, busqueda]
  );

  function elegir(a: Afiliado) {
    setAfiliado(a);
    setBusqueda(a.name);
    setAbierto(false);
    // Autocompleta el correo, pero queda editable: el del listado puede estar
    // desactualizado o ser el de otra persona de la empresa.
    setCorreo(a.email ?? "");
  }

  function cambiarTipo(t: "AFILIADO" | "EXTERNO") {
    setTipo(t);
    setError(null);
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await emitirEntradaAction({
        tipo,
        afiliadoId: tipo === "AFILIADO" ? afiliado?.id : undefined,
        nombre: tipo === "AFILIADO" ? (afiliado?.name ?? "") : nombre,
        correo,
        telefono,
        cupos,
      });
      if (r.ok) {
        setResultado({ id: r.id, enviado: r.enviado, aviso: r.aviso });
      } else {
        setError(r.error);
      }
    });
  }

  function otra() {
    setResultado(null);
    setAfiliado(null);
    setBusqueda("");
    setNombre("");
    setCorreo("");
    setTelefono("");
    setCupos(1);
  }

  if (resultado) {
    return (
      <div className="space-y-4 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">Entrada creada</h2>
        {resultado.enviado ? (
          <Alert>El correo con el PDF salió a {correo}.</Alert>
        ) : (
          <Alert variant="destructive">
            {resultado.aviso} Puedes reenviarlo desde el listado.
          </Alert>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={<a href={`/admin/entradas/${resultado.id}/pdf`} target="_blank" rel="noopener" />}
          >
            Ver PDF
          </Button>
          <Button variant="outline" onClick={otra}>
            Emitir otra
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/entradas" />}
          >
            Ir al listado
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-6 rounded-lg border bg-white p-6">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="space-y-2">
        <Label>Titular</Label>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["AFILIADO", "Empresa afiliada ADECLA"],
              ["EXTERNO", "Invitado externo"],
            ] as const
          ).map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              onClick={() => cambiarTipo(valor)}
              className={cn(
                "rounded-lg border p-3 text-left text-sm transition-colors",
                tipo === valor ? "border-primary bg-accent" : "hover:border-primary/40"
              )}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      {tipo === "AFILIADO" ? (
        <div className="space-y-2">
          <Label htmlFor="afiliado">Busca la empresa</Label>
          <div className="relative">
            <Input
              id="afiliado"
              value={busqueda}
              autoComplete="off"
              placeholder="Escribe parte del nombre…"
              onChange={(e) => {
                setBusqueda(e.target.value);
                setAbierto(true);
                if (afiliado) setAfiliado(null);
              }}
              onFocus={() => setAbierto(true)}
            />
            {abierto && !afiliado && (
              <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-popover shadow-md">
                {sugeridas.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-muted-foreground">
                    No hay afiliadas con ese nombre. Si es una empresa nueva,
                    usa Invitado externo.
                  </p>
                ) : (
                  sugeridas.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => elegir(a)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      {a.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {afiliado && (
            <p className="text-xs text-muted-foreground">
              Se emite a nombre de {afiliado.name}.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre o empresa</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Persona o empresa invitada"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="correo">Correo</Label>
          <Input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="donde llegará la entrada"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">
            Teléfono <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cupos</Label>
        <div className="flex gap-3">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCupos(n)}
              aria-pressed={cupos === n}
              className={cn(
                "size-12 rounded-lg border text-lg font-semibold transition-colors",
                cupos === n ? "border-primary bg-accent" : "hover:border-primary/40"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Creando y enviando…" : "Crear y enviar entrada"}
      </Button>
    </form>
  );
}
