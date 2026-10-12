# Integración del frontend con visiaqp-api

No hay datos ficticios ni modo de demostración. Sin API o sesión válida se muestra login o un error de conexión, sin fabricar registros.

## Configuración

Editar API_CONFIG en src/app/core/api/api-config.ts: URL base (http://localhost:8000/api), offset para fechas naive (-05:00) y consulta automática cada 15 segundos. Las peticiones expiran a los 20 segundos.
El offset interpreta las fechas de la API como hora de Lima. Debe confirmarse con el equipo antes de desplegar fuera de ese entorno. Las respuestas con offset se respetan. Las solicitudes de videos envían fecha local sin zona, como exige SolicitudCreate; no usar toISOString() para esos cuerpos.
FastAPI debe permitir el origen del navegador mediante CORS. No hay secretos ni clave del motor en Angular.

## Autenticación y permisos

POST /auth/login recibe JSON username/password. GET /auth/me carga la identidad. El JWT se conserva en sessionStorage, se elimina al salir/expirar y se adjunta exclusivamente a la URL base de esta API. No hay refresh token. Un 401 cierra la sesión; un 403 conserva la sesión y muestra falta de permiso.
El rol se toma del claim rol porque /auth/me no lo devuelve. Las restricciones de interfaz son ayudas de UI: FastAPI valida los permisos con la base de datos. Administrador escribe zonas, cámaras y umbrales. Cualquier usuario autenticado puede solicitar videos y consultar. Solo dueño/Administrador cancela pendientes.

## Contrato implementado

- Zonas: GET/POST /zonas, PATCH /zonas/{id}; umbrales GET/PUT /zonas/{id}/umbral. Sin umbral configurado el backend usa 10/30.
- Cámaras: GET/POST /admin/camaras, PATCH /admin/camaras/{id}. No se usa /camaras, reservado al motor. Solo se muestra tiene_url_stream. En edición se omiten id_zona y la fuente vacía; una fuente escrita reemplaza la anterior. Se valida el polígono como puntos normalizados.
- Indicadores: GET /indicadores/actual y GET /indicadores con id_zona, periodo_tipo, desde, hasta y limite=2000. Hasta es exclusivo: para incluir la fecha final se envía la medianoche siguiente. No se calcula concentración en Angular.
- Videos: GET /videos?solo_disponibles=true. Catálogo del motor; no existe subida desde el navegador.
- Procesamientos: GET /procesamientos con estado/id_camara y limite=500; POST /procesamientos/solicitar; PATCH /procesamientos/{id}/cancelar. Cancelación sigue siendo estado error con el mensaje del servidor.

## Límites conocidos

No existen endpoints de lectura de resultados por ventana, última detección por cámara ni video en vivo. Análisis y Reportes muestran indicadores de zona; Monitoreo distingue esos agregados del estado de cada cámara. Nunca se presenta un indicador horario como detección en vivo.
La API no devuelve total/offset de paginación: se pagina solo el conjunto recibido y sus límites se indican en pantalla. No hay porcentaje de progreso ni expiración automática de ejecuciones. Las consultas periódicas se cancelan al abandonar la pantalla y se pausan si la pestaña está oculta.
CSV descarga todos los indicadores recibidos y neutraliza fórmulas en texto. PDF utiliza el diálogo de impresión del navegador e incluye todos los periodos consultados. No hay exportación XLSX ni endpoint de exportación.
La configuración de polígonos utiliza coordenadas; un editor sobre imagen necesita acordar con el backend una imagen de referencia o endpoint de captura.

## Validación pendiente y realizada

HttpTestingController verifica cuerpos, cabeceras, DTO, fechas, permisos/expiración, fallos, catálogo, solicitudes y cancelación. Las respuestas simuladas viven únicamente en tests.
Cuando se levante FastAPI: comprobar MySQL, usuario real, CORS y el recorrido API → motor → resultados → indicadores. No se ha modificado el backend ni ejecutado sus pruebas que vacían una base MySQL.
