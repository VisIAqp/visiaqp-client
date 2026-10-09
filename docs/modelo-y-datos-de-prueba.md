# Frontend y esquema actual

Los servicios son datos de prueba en memoria. No existe conexión HTTP ni persistencia; recargar restaura los ejemplos. No se guarda la URL de cámara en la vista pública.

Los modelos usan camelCase: id corresponde a la PK de cada tabla, zonaId a id_zona, camaraId a id_camara, procesamientoId a id_procesamiento. El adaptador de la futura API deberá convertir identificadores, fechas y decimales; no se han supuesto rutas HTTP.

Camara refleja tipo, estado, intervalo_muestreo_seg, zone_polygon y ultima_conexion. ConfiguracionCamara admite urlStream únicamente como entrada para registro/reemplazo. La API debe excluir url_stream en lecturas del cliente. La maqueta valida el campo pero no conecta ni conserva fuentes.

Procesamiento refleja zona, cámara y usuario opcionales según SQL, tipo_fuente, ruta_archivo, fechas, estado y mensaje_error. ResultadoDeteccion representa una ventana, incluida una cantidad cero. RegistroAnalisis combina ambas tablas para mostrar resultados de archivos sin cámara. Su nivel se deriva del umbral de zona en modo de prueba; no es una columna de resultado_deteccion.

Indicador se consulta por zona y periodo hora/día. Sus fixtures son ejemplos de agregados del backend: la maqueta no consolida cámaras. UmbralConcentracion usa 10/30 para Plaza de Armas y 20/40 para UTP. Bajo: cantidad menor que umbral_medio; medio: desde umbral_medio hasta antes de umbral_alto; alto: desde umbral_alto. Una zona sin configuración muestra Sin umbral.

Los conteos sumados pueden repetir personas. No representan personas únicas ni flujo. Los promedios de la pantalla de ventanas son medias simples de los ejemplos; la semántica final de cantidad_peatones y agregados se acordará con el backend. Ausencia de resultados muestra Sin datos, no cero. Fechas de prueba incluyen -05:00 y se presentan en hora de Lima; las respuestas reales deberán declarar su zona horaria.

Casos incluidos: cámara activa/procesando, cámara en mantenimiento con error, zona inactiva sin muestras, video completado sin cámara, imagen pendiente, ventana con cero y confianza nula. No hay detecciones reales ni exportaciones de archivos.
