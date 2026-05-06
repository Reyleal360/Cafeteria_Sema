# Integración Low-Code: Google Forms + Google Sheets + Make/Zapier

Este proyecto utiliza herramientas Low-Code para facilitar la captura de datos sin necesidad de desarrollar formularios complejos desde cero.

## Paso 1: Crear el Google Form
1. Ve a [Google Forms](https://forms.google.com).
2. Crea un nuevo formulario llamado "Pedidos Cafetería Sema".
3. Agrega las siguientes preguntas:
   - **Nombre del estudiante** (Respuesta corta)
   - **Grado** (Desplegable: 6°, 7°, 8°, 9°, 10°, 11°)
   - **Producto** (Desplegable o Varias opciones - debe coincidir con los nombres en el sistema)
   - **Cantidad** (Número)

## Paso 2: Vincular con Google Sheets
1. En la pestaña de **Respuestas** del formulario, haz clic en el icono verde de Google Sheets ("Crear hoja de cálculo").
2. Esto creará un archivo de Excel en la nube donde cada pedido será una nueva fila.

## Paso 3: Automatización con Make (Recomendado) o Zapier
Para que los pedidos lleguen al sistema en tiempo real:
1. Crea una cuenta en [Make.com](https://www.make.com).
2. Crea un nuevo "Scenario".
3. **Trigger**: Selecciona el módulo de **Google Sheets** -> "Watch Responses" (o "Watch Rows").
   - Conecta tu cuenta de Google y selecciona la hoja creada en el Paso 2.
4. **Action**: Selecciona el módulo **HTTP** -> "Make a request".
   - **URL**: `http://TU_IP_PUBLICA:3001/pedidos` (Para pruebas locales usa herramientas como `ngrok`).
   - **Method**: POST
   - **Body Type**: JSON
   - **Fields**:
     - `estudiante`: Mapea la columna del nombre.
     - `grado`: Mapea la columna del grado.
     - `producto`: Mapea la columna del producto.
     - `cantidad`: Mapea la columna de cantidad.

## Paso 4: Notificaciones (Plus)
En el mismo escenario de Make, puedes agregar un módulo de **Email** o **Telegram** después del módulo HTTP para enviar un recibo o notificación a la encargada de la cafetería.

---
**Nota para la presentación:**
Explica que esta arquitectura permite que la captura de datos sea extremadamente sencilla para el usuario final (el estudiante), mientras que el sistema centralizado (el panel de la cafetería) gestiona la lógica de preparación y estados.
