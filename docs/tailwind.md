# Tailwind en VisIAqp

Los colores, tamaños de texto y medidas compartidas se definen con `@theme` en `src/styles.css`.
Usar nombres como `text-muted`, `border-divider`, `bg-success-soft` y `max-w-page`.
Los umbrales responsive existentes se conservan con `desktop:`, `wide:` y `expanded:`.

Aplicar las clases al elemento que se estiliza. Evitar cadenas de selectores de descendientes para encabezados, campos y tablas.
Usar la escala numérica de Tailwind para espaciado; Tailwind 4 admite valores fraccionarios como `p-4.5` (18 px).
Reservar valores arbitrarios para excepciones estructurales puntuales, como la distribución 2fr/1fr del dashboard.

Los tamaños de fuente y colores usan nombres diferentes para evitar colisiones (por ejemplo, `text-title` y `text-heading`).

Las utilidades `ui-card`, `ui-field`, `ui-table-cell` y `ui-focus` centralizan patrones visuales repetidos.
El componente Angular `Pagination` comparte navegación, estados deshabilitados y texto entre Análisis y Reportes.
Extraer componentes cuando compartan comportamiento; no crear componentes solo para acortar cada lista de clases.

Preflight permanece deshabilitado para conservar los estilos base existentes y la convivencia con Angular Material.
Validar cada cambio con compilación, pruebas y revisión de escritorio/móvil, incluido el menú hamburguesa.
