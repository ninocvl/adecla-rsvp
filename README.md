# ADECLA — Sistema de inscripciones

Aplicación web para gestionar las inscripciones de empresas a los eventos deportivos de ADECLA (Asociación de Desarrolladores y Constructores Provincia La Altagracia): registro de empresas, inscripción por parejas al torneo de golf, generación de proformas en PDF y panel administrativo.

## Stack

- Next.js 16 (App Router) + React + TypeScript
- TailwindCSS 4 + shadcn/ui
- PostgreSQL (Neon en producción, `prisma dev` en local) + Prisma 7
- Auth.js v5 (credenciales, JWT, roles ADMIN/COMPANY)
- Zod + React Hook Form
- @react-pdf/renderer para la proforma oficial
- Nodemailer (preparado; apagado por defecto con `EMAIL_ENABLED=false`)

## Puesta en marcha (desarrollo)

```bash
npm install
npx prisma dev          # levanta un Postgres local (deja esta terminal abierta)
# copia las connection strings que imprime a .env (DATABASE_URL, DIRECT_URL y SHADOW_DATABASE_URL)
npx prisma db push      # crea el esquema en el Postgres local
npm run db:seed         # admin, tasa de cambio, torneo de golf y pádel
npm run dev
```

Credenciales sembradas (configurables en `.env` con `ADMIN_EMAIL` / `ADMIN_PASSWORD`):
admin: `admin@adecla.com` / `adecla-admin-2026`.

## Producción con Neon

1. Crea un proyecto en [neon.tech](https://neon.tech) y copia las dos connection strings:
   - la **pooled** (host con `-pooler`) → `DATABASE_URL`
   - la **directa** → `DIRECT_URL`
2. Completa `.env` a partir de `.env.example` (`AUTH_SECRET` con `npx auth secret`).
3. Aplica el esquema y el seed:

```bash
npx prisma migrate deploy   # usa prisma/migrations/0001_init
npm run db:seed
```

## Estructura

```
src/
├─ app/                  # rutas: landing, (auth), (app) empresa, admin, api
├─ components/           # ui (shadcn), shared, events, registration, auth, admin
├─ server/
│  ├─ actions/           # server actions (boundary: auth + Zod)
│  ├─ services/          # lógica de negocio; email/ con interfaz + stub + nodemailer
│  └─ queries/           # lecturas para componentes de servidor
├─ lib/                  # prisma singleton, validaciones Zod, constantes, formato, pdf/
├─ auth.ts / auth.config.ts / proxy.ts
prisma/                  # schema, seed, migrations
```

## Decisiones de diseño

- **Cupos**: cada fecha (`EventDate`) tiene `capacity` y `reservedCount` en la base de datos. La toma de cupos es un UPDATE condicional atómico dentro de la transacción de inscripción, así dos inscripciones simultáneas no pueden sobrevender. Cancelar una inscripción devuelve los cupos.
- **Precios**: `EventPrice` por evento y tipo de afiliación; `amountUsd` nulo + `isEnabled=false` significa "Próximamente" (caso Desarrollador). Cada inscripción guarda un snapshot de precio y tasa para que las proformas viejas no cambien.
- **Tasa USD→DOP**: vive en la tabla `Setting` (`usd_to_dop_rate`, seed 60.00); editable sin redeploy.
- **Códigos**: `GOLF-2026-0001` con contador atómico por evento (`Event.codeSeq`).
- **Proforma**: la fila `Proforma` guarda un snapshot JSON autocontenido; el PDF (`/api/proformas/[id]/pdf`) replica la plantilla oficial de ADECLA y valida sesión y propiedad.
- **Correos**: `EmailService` con dos implementaciones; con `EMAIL_ENABLED=false` solo se loguea (`[EMAIL STUB]`). Para activar el envío real: `EMAIL_ENABLED=true` + variables `SMTP_*`.
- **Eventos nuevos**: agregar un evento es insertar filas (evento, fechas, precios); no requiere cambios de código. Pádel ya existe como borrador y aparece en la landing como "Próximamente".
