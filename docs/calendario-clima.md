# Clima y calendario integrados en el dashboard

El contexto se consulta en el dashboard, debajo del gráfico temporal, sin una pantalla exclusiva ni una entrada adicional en el menú. La antigua dirección /contexto redirige al dashboard.

1. Seleccionar una zona y aplicar el rango y los demás filtros del dashboard.
2. Pulsar «Ver contexto del rango».
3. Consultar la ocupación por hora junto al clima y las fechas especiales. El detalle conserva los filtros de cámara, fuente y ejecución; incluso si el gráfico se agrupa por día, el contexto se presenta explícitamente por hora.
4. Desplegar «Fuentes, fechas especiales y administración» para consultar el calendario anual, el clima guardado y las herramientas del administrador.

Aplicar nuevos filtros cierra el detalle anterior. Consultar no sincroniza proveedores automáticamente. Los administradores conservan los controles de sincronización y registro de eventos con referencia pública. Los umbrales permanecen configurados por zona.

La precipitación corresponde a la hora anterior a la marca temporal; temperatura y humedad, al instante indicado. Son datos modelados, con atribución a Open-Meteo. Las coincidencias con ocupación no demuestran causalidad. La ausencia de fechas registradas no confirma que un día sea laborable.

El calendario anual corresponde al año inicial del rango aplicado. Si el rango cruza de año, aplicar un rango del segundo año para consultar o sincronizar su calendario nacional.

Validación: 65 pruebas de interfaz aprobadas, incluida la conservación de los filtros del dashboard; compilación de producción sin advertencias y revisión de integridad aprobadas. La revisión visual con sesión autenticada sigue pendiente. Esta integración no requiere cambios en MySQL ni en el servicio de inteligencia artificial.
