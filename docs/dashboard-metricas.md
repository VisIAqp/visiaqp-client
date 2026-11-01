# VisIAqp — dashboard, gráficos y métricas en la interfaz

## Implementación

El dashboard consume los seis endpoints agregados de la fase anterior. Se reutilizan Angular, Chart.js, los estados de carga y error existentes, la paginación y los tokens visuales del proyecto. No se añadieron dependencias, servicios externos ni datos de demostración a producción.

La consulta inicial abarca todas las zonas y los últimos siete días. Los filtros permiten seleccionar fechas, zona, cámara, fuente, agrupación por hora o día y una ejecución opcional. Las fechas seleccionadas incluyen ambos días y se convierten al límite final exclusivo que espera la API. El rango máximo es 31 días. Cambiar los controles no modifica los resultados hasta pulsar **Aplicar filtros**.

Cada panel mantiene su propia carga y error. Si falla una serie, el resumen y los demás paneles siguen disponibles. Al aplicar otros filtros se cancelan las consultas anteriores y se retiran los resultados previos, evitando que una respuesta tardía aparezca bajo una selección diferente. La paginación utiliza los filtros ya aplicados, aunque haya cambios todavía sin consultar en el formulario. Reintentar conserva la página que falló.

## Contenido del dashboard

- Resumen de ventanas analizadas, ventanas con ocupación, suma de identificadores, transmisiones reportando, cámaras habilitadas, ejecuciones en curso y videos pendientes. Los contadores vienen del resumen completo del backend.
- Fecha de consulta, última captura incluida y última recepción. Los contadores operativos se identifican como estado actual, independiente del rango de captura.
- Gráfico temporal por cámara y ejecución. Los huecos se conservan como valores ausentes y no se conectan. Los ceros medidos se conservan como cero.
- Comparación de ocupación entre zonas, acompañada de su estado de medición. Los valores sin consolidar no se dibujan como barras de cero.
- Distribución por nivel y estado. Cuenta periodos de cada serie, no personas ni horas únicas de una zona. Los conteos históricos sin ocupación se presentan por separado del nivel bajo.
- Mapa de calor por zona, día de semana y hora, con número y nivel. Se distinguen cero medido, dato no consolidado y grupo ausente de la página visible.
- Estado operativo de cámaras, última actividad, FPS efectivos y edad de imagen. La edad sigue midiéndose desde la recepción local, sin incluir retrasos previos del sensor o la red.

Las comparativas respetan la política conservadora del backend: varias vistas o ejecuciones no se fusionan automáticamente. Las series sí mantienen cada ejecución identificada por separado. El detalle de las series indica segundos observados y si el periodo ya terminó; se aclara que un periodo cerrado no implica cobertura completa.

## Paginación y accesibilidad

Los gráficos y tablas corresponden a la página visible. Las series y patrones solicitan hasta 200 grupos por página; comparativas, distribución y cámaras, hasta 100. Se muestran página, total y controles de navegación. No se descargan todas las ventanas ni se presentan valores parciales como totales globales.

En el gráfico temporal pueden compararse hasta ocho series de la página. Si hay más ejecuciones, se selecciona una explícitamente y las demás permanecen disponibles en el selector. El detalle accesible incluye todas las filas de la selección visible dentro de una tabla desplazable.

El mapa de calor permite seleccionar una zona entre los grupos de la página. Una celda vacía significa que no hay grupo en esa página; puede haber información en otra. Se recomienda filtrar una zona para consultar su patrón completo. El color no es la única señal: cada celda contiene un valor o una marca textual y una descripción accesible.

Se añadieron etiquetas de formulario, títulos, estados de carga y error, tablas con encabezados y alternativas textuales de los gráficos. Los paneles se adaptan a una o dos columnas; las tablas extensas se desplazan horizontalmente.

## Monitoreo

La actividad de la cámara seleccionada se consulta directamente en `/api/metricas/estado-camaras`, sin deducirla del historial limitado de ejecuciones.

La ocupación corresponde al último periodo disponible de su última transmisión, durante hoy o ayer en hora de Lima. La selección se restringe a cámara, ejecución y fuente `stream`; no reutiliza una medición global de zona como si fuera propia de la cámara. Como las series del servidor están ordenadas desde el inicio, el servicio consulta la última página cuando hace falta, en lugar de interpretar la primera fila como reciente.

El historial se solicita para la cámara seleccionada y muestra hasta diez ejecuciones recientes; la API conserva su límite de 500 por consulta. Ese historial ya no determina el estado operativo. Monitoreo se actualiza mientras la página está visible y la sesión es válida, sin iniciar otra actualización automática mientras una consulta anterior sigue pendiente.

Una ausencia de medición no se convierte en cero personas. Se muestran fechas de captura y recepción, nivel, máximo y duración observada cuando existen. La imagen en vivo sigue fuera del alcance de esta pantalla.

## Rendimiento y archivos

Dashboard y Análisis se cargan al entrar en sus rutas. Así, la biblioteca de gráficos no forma parte de toda la carga inicial de la aplicación. Se mantienen los controles de autenticación de las rutas y los límites originales de compilación.

La carga inicial de producción quedó en aproximadamente 453 kB, frente a unos 697 kB de la primera compilación de esta fase. Los gráficos continúan requiriendo sus archivos adicionales al abrir las páginas que los utilizan.

Archivos principales, dentro de `C:\Users\Wilson\Desktop\VisIAqp`:

- `src\app\core\models\metricas.model.ts`: contratos de métricas.
- `src\app\core\services\metricas.ts`: consultas y selección de la última serie.
- `src\app\core\api\metricas-presentacion.ts`: fechas, estados y preparación de series con huecos.
- `src\app\core\api\panel-metricas.ts`: estado y paginación por panel.
- `src\app\core\api\request-state.ts`: cancelación explícita de consultas.
- `src\app\pages\dashboard\dashboard.ts`, `dashboard.html` y `dashboard.css`.
- `src\app\pages\monitoreo\monitoreo.ts` y `monitoreo.html`.
- `src\app\core\services\monitoreo.ts`: catálogo de zonas y cámaras.
- `src\app\app.routes.ts`: carga diferida de las páginas con gráficos.
- `src\app\core\api\metricas.spec.ts`: pruebas nuevas.
- `src\app\core\api\ui-contract.spec.ts`: contrato actualizado del dashboard.

## Verificación

Las 55 pruebas del frontend aprobaron en ChromeHeadless. Los casos nuevos comprueban huecos y ceros, separación de ejecuciones, rangos inclusivos de hasta 31 días, errores independientes por panel, cancelación de respuestas obsoletas, filtros aplicados durante la paginación, reintento de la página fallida, datos históricos, mapa de calor y estado operativo independiente del historial.

La compilación final de producción aprobó sin errores ni avisos de tamaño, con una carga inicial de 452,78 kB. Se verificaron tipos y plantillas y `git diff --check` no reportó problemas. No se modificaron backend, base de datos ni motor en esta fase; no requiere migraciones. No se repitieron sus suites.

Se intentó la revisión visual de la aplicación local. El navegador disponible mostró la pantalla de acceso, sin una sesión autenticada. La validación visual del dashboard con datos reales, incluido su aspecto en dispositivos pequeños, sigue pendiente. Las pruebas de interfaz utilizan respuestas HTTP controladas y no sustituyen esa revisión.

Desde `C:\Users\Wilson\Desktop\VisIAqp`:

```powershell
.\node_modules\.bin\ng.cmd test --watch=false --browsers=ChromeHeadless --progress=false
.\node_modules\.bin\ng.cmd build
```

Para revisar la aplicación, usar el backend actualizado de la fase anterior y recargar el frontend. Si no hay un servidor de desarrollo abierto:

```powershell
.\node_modules\.bin\ng.cmd serve
```

No se iniciaron servidores permanentes ni se cerraron los que el usuario pudiera tener abiertos. La siguiente fase es calendario y clima, considerando Open-Meteo y Nager.Date con verificación de cobertura, términos y límites vigentes.
