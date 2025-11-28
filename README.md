# 📋 Formulario de Control de Calidad - GAS Paint & Detail

Este es un formulario interactivo diseñado para la inspección y el control de calidad final de vehículos antes de su entrega al cliente. Se enfoca en la usabilidad en entornos de taller, con funciones de auto-guardado y optimización completa para la impresión de reportes finales.

## ✨ Características Principales

El formulario incluye varias funcionalidades para agilizar el proceso de inspección:

| Característica | Detalle |
| :--- | :--- |
| **Auto-Guardado Local** | Utiliza `localStorage` para guardar automáticamente el progreso del formulario. Si se cierra la pestaña, el avance se recupera al volver a abrir. |
| **Reporte de Impresión Optimizado** | Reglas `@media print` detalladas que fuerzan el alto contraste (blanco y negro), ocultan elementos de la interfaz (botones, indicadores), y **solo muestran los ítems del checklist que fueron seleccionados**. |
| **Validación de Fechas** | Controles JavaScript para asegurar que la fecha/hora de la corrección de defectos sea posterior a la fecha/hora de devolución del vehículo, inhabilitando la impresión si hay errores lógicos. |
| **Inputs Estandarizados** | Uso de la librería **Flatpickr** para una selección de fecha y hora uniforme, y normalización automática a mayúsculas en campos clave (ej. Placa). |
| **Rutas Dinámicas de Logo** | El CSS de impresión está configurado para cambiar la fuente del logo a `logo.jpeg` para asegurar el alto contraste en la copia impresa (fondo blanco). |

## 🚀 Tecnologías Utilizadas

* **HTML5:** Estructura del formulario.
* **CSS3:** Estilos de modo oscuro, animaciones personalizadas y reglas de impresión avanzadas.
* **JavaScript:** Lógica de auto-guardado, validación de secciones, y control de eventos.
* **Flatpickr:** Librería externa para *pickers* de fecha y hora.

Simplemente se abre a través del siguiente link: https://gasdetail.github.io/GAS-Control-de-Calidad/

