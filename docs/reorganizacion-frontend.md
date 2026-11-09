# Reorganización de las pantallas existentes

## Comportamiento

- Monitoreo: cuadrícula de tarjetas para seleccionar una cámara y detalle separado con actividad, ocupación e historial. La tarjeta distingue configuración del polígono de actividad del motor; no simula una imagen en vivo. Los datos operativos se consultan al seleccionar una vista.
- Análisis: accesos dentro de la misma pantalla para solicitud, seguimiento y resultados históricos. El historial cargado se presenta en páginas de diez registros. Los filtros reinician la página, la actualización periódica conserva la página actual y una reducción de registros ajusta la página al último valor válido.
- Dashboard: las explicaciones extensas de los gráficos se despliegan a petición. Las advertencias sobre falta de ocupación y calidad de datos permanecen visibles.
- Cámaras: formulario separado en identificación, fuente/muestreo y área de análisis. Zonas conserva su formulario con identificación de la sección.
- Reportes: exportación junto a la cabecera y ayuda desplegable sobre el alcance de la exportación. Los filtros existentes y la impresión de todos los resultados consultados se conservan.

La paginación de análisis actúa sobre el catálogo ya obtenido, con el límite existente de 500 ejecuciones; no pretende ofrecer acceso a registros fuera de esa consulta. Las métricas no se fusionan ni se reinterpretan y se mantienen los permisos existentes.

## Validación

67 pruebas de interfaz aprobadas, incluidas dos nuevas pruebas que verifican navegación de páginas, límites, actualización del historial y reinicio al cambiar filtros. Compilación de producción e integridad del diff comprobadas.

Revisión visual autenticada completada: tarjetas de monitoreo, selección de cámara, historial de análisis con diez filas y cambio de página (500 ejecuciones cargadas, 50 páginas), navegación interna, formulario de cámaras agrupado y cabecera de reportes. Comprobaciones en escritorio de 1440 px y móvil de 390 px. Las vistas móviles comprobadas no ensanchan la página; las tablas conservan desplazamiento interno. Sin errores de consola durante el recorrido. No se guardaron registros ni se solicitaron procesamientos. La impresión y descarga de archivos no se ejecutaron en esta revisión.

Los cambios de esta etapa son exclusivamente del frontend. No se añadieron pantallas ni se modificaron backend, base de datos o motor de IA.
