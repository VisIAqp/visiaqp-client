# VisIAqp frontend

Angular 21, pnpm 11.25.0 y Tailwind CSS 4.3.3. Interfaz HTTP para visiaqp-api, sin datos ficticios.

## Desarrollo

Usar Node.js compatible con Angular 21, por ejemplo 22.12+ dentro de la serie 22.

Instalar: pnpm install --frozen-lockfile

Iniciar: pnpm start

Abrir http://localhost:4200. La URL del backend se configura en src/app/core/api/api-config.ts; por defecto http://localhost:8000/api. Debe permitir el origen del frontend y tener un usuario activo. No hay credenciales predeterminadas ni acceso anónimo a pantallas protegidas.

## Verificación

Compilar: pnpm build

Pruebas: pnpm test --watch=false --browsers=ChromeHeadless

Las pruebas usan respuestas HTTP simuladas y no necesitan MySQL ni el motor. La integración real sí necesita FastAPI y su base de datos.

## Funciones

Login JWT; lectura y gestión por rol de zonas, cámaras y umbrales; indicadores horarios/diarios; catálogo de videos; solicitud y cancelación de pendientes; consulta periódica de estados; CSV e impresión de reportes.

## Limitaciones

La API actual no expone resultados por ventana ni transmisión de video. Las vistas muestran indicadores de zona y ejecuciones, sin inventar resultados por cámara. Los históricos están sujetos a los límites de las consultas. Las fechas sin zona se interpretan con el offset configurable de Lima: confirmar ese contrato antes de desplegar.

Ver [Integración de API](docs/integracion-api.md) y [Criterios de Tailwind](docs/tailwind.md).
