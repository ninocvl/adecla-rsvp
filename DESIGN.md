---
name: ADECLA RSVP
description: Sistema de inscripciones a torneos de ADECLA — institucional, cálido, legible.
colors:
  teal-oficial: "#00a99d"
  teal-boton: "#00776d"
  teal-secundario: "#42a8bb"
  gris-claro: "#e9e9e9"
  blanco-hueso: "#fcfcf7"
  tinta: "#233738"
  destructivo: "#c4432a"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw + 1rem, 3.5rem)"
    fontWeight: 560
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.5rem, 1.5vw + 1rem, 2rem)"
    fontWeight: 520
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Public Sans, ui-sans-serif, system-ui"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Public Sans, ui-sans-serif, system-ui"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.01em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.teal-boton}"
    textColor: "{colors.blanco-hueso}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "#005f57"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  card:
    backgroundColor: "#ffffff"
    textColor: "{colors.tinta}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: ADECLA RSVP

## 1. Overview

**Creative North Star: "El acta notarial del club de golf"**

ADECLA vive en dos registros a la vez: es un gremio serio (membresías, RNC, proformas, cuotas por categoría de afiliado) y también el organizador de un torneo en los campos más codiciados de Cap Cana y Punta Cana. El sistema visual no elige entre ambos: la tipografía con carácter y el teal institucional cargan la calidez del evento, mientras la jerarquía de datos (montos, estados, fechas) se mantiene tan legible como un documento oficial. Nada de esto se apoya en la estética por defecto de una interfaz generada por IA — nada de Poppins con una serif genérica de relleno, nada de degradados decorativos, nada de negro plano y gris apagado para "dar elegancia".

Esta identidad parte del brand book oficial de ADECLA: paleta de teal (#00a99d) y su complemento (#42a8bb), gris y blanco hueso institucionales. El logotipo usa Roboto — se respeta intacto como parte del imagotipo — pero Roboto no se extiende al resto de la interfaz: es una tipografía de sistema (la fuente por defecto de Android/Material) demasiado genérica para sostener el tono premium que el brand book describe ("orden, solidez y profesionalismo"). En su lugar, Fraunces aporta el carácter editorial en titulares y Public Sans sostiene con precisión los formularios, tablas y montos.

**Key Characteristics:**
- Teal oficial reservado para acento y estados activos, nunca como fondo extenso.
- Titulares en Fraunces con peso variable (560 display / 520 headline), nunca en mayúscula sostenida.
- Datos y dinero siempre en Public Sans con `tabular-nums`, para que las columnas de montos alineen.
- Superficies planas por defecto; la elevación aparece solo como respuesta a interacción (hover, foco), nunca como decoración de reposo.
- Ningún dorado, gradiente ni glassmorphism: la calidez viene de la fotografía real de los campos y del teal, no de efectos.

## 2. Colors

La paleta viene directamente del brand book de ADECLA; la única adaptación es un tono de texto más rico que el negro plano oficial, y un teal más profundo reservado para fondos de botón (el teal oficial es demasiado claro para sostener texto blanco con contraste AA).

### Primary
- **Teal Oficial** (#00a99d / oklch(0.661 0.116 185.9)): el acento de marca. Badges de estado activo, iconografía, bordes de foco, subrayados, hover de enlaces. Nunca cubre más del 10% de una pantalla — su escasez es lo que lo hace notar.
- **Teal Botón** (#00776d / oklch(0.50 0.116 185.9)): versión profundizada del teal oficial, exclusiva para fondos de botón primario y CTA sólidos. Con texto blanco encima da 5.27:1 de contraste (el teal oficial puro solo da 2.85:1 — falla AA).

### Secondary
- **Teal Secundario** (#42a8bb / oklch(0.680 0.097 212.1)): el complemento oficial. Se usa en estados hover suaves, bordes de tarjetas seleccionadas, series secundarias en gráficos del panel admin. Como el teal oficial, no se usa como fondo de texto blanco de cuerpo.

### Neutral
- **Blanco Hueso** (#fcfcf7 / oklch(0.99 0.007 106.5)): fondo base de toda la aplicación. Es el blanco oficial del brand book, no un blanco genérico.
- **Gris Claro** (#e9e9e9 / oklch(0.934 0 89.9)): bordes, divisores, fondos `muted`, fondo de badges neutrales (por ejemplo "Próximamente").
- **Tinta** (#233738 / oklch(0.32 0.025 200)): reemplaza al negro oficial (#212322) como color de texto por defecto. Mismo propósito, pero con un matiz teal apenas perceptible que lo hace sentir parte de la misma familia cromática en vez de un negro importado de cualquier interfaz. Contraste de 12.2:1 sobre blanco hueso — de sobra para AAA.
- **Superficie** (#ffffff): tarjetas y paneles se despegan del fondo hueso con blanco puro, sin sombra pesada.

### Destructivo
- **Terracota** (#c4432a / oklch(0.55 0.16 33)): estados cancelados, errores de validación. No es un rojo genérico de framework — tiene la misma temperatura cálida que el resto de la paleta.

### Named Rules
**La Regla del Teal Escaso (con una excepción declarada).** Fuera del hero de la landing, el teal oficial y su versión de botón combinados no superan el 10% de la superficie de una pantalla — sigue siendo acento, no fondo, en formularios, tablas y el panel admin, donde el blanco ayuda a leer datos. El hero es la única superficie que rompe la regla a propósito: un bloque de degradado teal oscuro (`.hero-teal`, de `#00958a` a `#00453f`) para que el sitio no se sienta "todo blanco" desde el primer segundo.

**La Regla de la Tinta, no el Negro.** Ningún texto usa negro puro ni el #212322 plano del brand book directamente. Todo texto oscuro pasa por la Tinta (#233738) o una variante de su rampa tonal.

## 3. Typography

**Display Font:** Fraunces (con fallback Georgia, serif)
**Body Font:** Public Sans (con fallback ui-sans-serif, system-ui)
**Label Font:** Public Sans, mismo peso que body, con `font-variant-numeric: tabular-nums` para montos.
**Mono Font:** IBM Plex Mono, exclusivo para códigos de inscripción (GOLF-2026-0001) — le da un carácter de "número de serie oficial" que Public Sans no logra por sí sola.

**Character:** Fraunces es una serif contemporánea con un eje óptico que se abre en tamaños grandes — da calidez editorial a los titulares sin caer en la solemnidad de una serif clásica de bufete. Public Sans es la sans humanista diseñada para comunicación oficial de alta legibilidad: exactamente el registro que necesita un formulario de inscripción o una tabla de proformas. El contraste serif/sans reemplaza directamente al genérico Poppins+serif que el brand book original (con Roboto) y cualquier interfaz por defecto de IA producirían.

### Hierarchy
- **Display** (560, `clamp(2.25rem, 4vw + 1rem, 3.5rem)`, 1.05): Hero de la landing, título de confirmación de inscripción. `text-wrap: balance`, letter-spacing -0.02em (nunca más ajustado que -0.04em).
- **Headline** (520, `clamp(1.5rem, 1.5vw + 1rem, 2rem)`, 1.15): Encabezados de sección, títulos de página (Panel administrativo, Nueva inscripción).
- **Title** (600, 1.125rem, 1.3): Títulos de tarjeta (evento, inscripción), encabezados de tabla.
- **Body** (400, 1rem, 1.6): Formularios, descripciones, texto de tabla. Máximo 70ch de ancho en párrafos largos.
- **Label** (600, 0.8rem, 1.3, uppercase con tracking 0.01em solo en `StatusBadge` y encabezados de tabla — nunca como "eyebrow" decorativo sobre cada sección).

### Named Rules
**La Regla del Número Tabular.** Todo monto (USD, RD$) y todo código de inscripción usa `font-variant-numeric: tabular-nums`, para que las columnas de la tabla admin y el resumen de precio alineen dígito por dígito.

## 4. Elevation

Sistema plano por defecto: las tarjetas se separan del fondo por color de superficie (blanco puro sobre hueso) y un borde de 1px en Gris Claro, no por sombra. La sombra aparece únicamente como respuesta a interacción — hover en `EventCard`, focus-visible en inputs — nunca en reposo. El único lugar con textura en reposo es el hero: una capa de grano casi imperceptible (`.grain-overlay`, opacidad 0.05) sobre el degradado teal, para que el bloque de color no se sienta como un vector plano.

### Shadow Vocabulary
- **shadow-teal-hover** (`box-shadow: 0 16px 32px -14px oklch(0.32 0.025 200 / 0.28)` + `translateY(-3px)`): al pasar el mouse sobre una tarjeta de evento o los flyers del hero. Sombra con el tinte de la Tinta, no gris genérico. Se retira con `prefers-reduced-motion`.
- **focus-ring** (`box-shadow: 0 0 0 3px oklch(0.661 0.116 185.9 / 0.35)`): foco de teclado en botones e inputs, en vez del azul por defecto del navegador.

### Named Rules
**La Regla de la Sombra Ganada.** Ninguna tarjeta tiene sombra en reposo. La sombra se gana con interacción (hover, foco), nunca se aplica como decoración base.

## 5. Components

### Buttons
- **Shape:** radio medio (8px), nunca completamente redondeado (evita el look "app de startup juguetona" descartado en PRODUCT.md).
- **Primary:** fondo Teal Botón (#00776d), texto Blanco Hueso, padding 10px 18px, peso 600.
- **Hover / Focus:** el fondo baja un paso más en la rampa (#005f57); foco visible con `focus-ring` en teal oficial, nunca solo un cambio de opacidad.
- **Outline / Ghost:** borde o texto en Tinta, fondo transparente; hover pasa a fondo Gris Claro.

### Chips / Badges
- **StatusBadge:** fondo en un tono pastel derivado del color de estado (ámbar para pendiente, esmeralda para confirmada, terracota suave para cancelada), texto en la versión oscura del mismo tono — nunca gris genérico para todos los estados.
- **"Próximamente":** fondo Gris Claro, texto Tinta. Sin dorado (el brand book no define ninguno).

### Cards / Containers
- **Corner Style:** 14px (`rounded.xl`) en tarjetas de evento e inscripción; 8-10px en componentes internos.
- **Background:** blanco puro sobre fondo hueso.
- **Shadow Strategy:** ver Elevation — plano en reposo, `hover-lift` solo si la tarjeta es interactiva (evento con inscripción abierta).
- **Border:** 1px Gris Claro.
- **Internal Padding:** 20-24px.

### Inputs / Fields
- **Style:** borde 1px Gris Claro, fondo blanco, radio 8px.
- **Focus:** `focus-ring` en teal oficial (no el azul de sistema).
- **Error:** borde y texto de ayuda en Destructivo (#c4432a), nunca solo un asterisco rojo sin contexto.

### Navigation
- **Navbar:** blanco puro sobre borde Gris Claro inferior, logo a la izquierda, acciones a la derecha en Public Sans 600. Estado activo con subrayado en teal oficial, no con fondo sólido.

### Signature Component: PriceSummary
Tarjeta fija durante el wizard de inscripción: monto en Public Sans con `tabular-nums`, tamaño grande (1.25rem, peso 600), la referencia en pesos dominicanos debajo en tono Tinta suavizado (`color-mix` hacia blanco). Es el único lugar donde el dinero es protagonista tipográfico — en el resto de la interfaz el dinero es dato, no titular.

## 6. Do's and Don'ts

### Do:
- **Do** usar Fraunces solo en titulares (display, headline, title) — nunca en párrafos largos ni en tablas.
- **Do** usar `tabular-nums` en todo monto y código de inscripción.
- **Do** mantener el teal oficial y su variante de botón por debajo del 10% de cobertura de pantalla.
- **Do** usar Tinta (#233738) como color de texto por defecto, nunca negro puro.
- **Do** dejar las tarjetas planas en reposo; la sombra se gana con hover o foco.

### Don't:
- **Don't** usar Poppins, Inter por defecto, o cualquier combinación Poppins+serif genérica — es la primera reflex de una interfaz generada por IA, explícitamente rechazada en PRODUCT.md.
- **Don't** usar Roboto fuera del logotipo — es la fuente de sistema de Android/Material, demasiado genérica para sostener el tono premium del brand book.
- **Don't** usar el negro oficial #212322 plano como color de texto; siempre pasar por la Tinta o su rampa.
- **Don't** inventar un acento dorado — el brand book no define ninguno; la calidez viene del teal y de la fotografía real de los campos.
- **Don't** usar gradientes decorativos, texto con `background-clip` en gradiente, ni glassmorphism sin propósito funcional.
- **Don't** repetir tarjetas idénticas de icono+título+texto; cada tarjeta de evento resuelve un problema distinto (fecha, cupos, precio).
- **Don't** usar texto gris claro de baja legibilidad "por elegancia" — todo texto de cuerpo cumple ≥4.5:1 de contraste.
