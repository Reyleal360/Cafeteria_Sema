# Integración con Google Apps Script y Google Sheets

Este proyecto utiliza el ecosistema de Google para mantener la aplicación completamente gratis y sin depender de servidores externos o servicios de automatización de pago como Make.com o Zapier.

## Arquitectura
- **Base de Datos:** Google Sheets
- **Backend/API:** Google Apps Script
- **Recepción de Datos:** Google Forms
- **Frontend:** React (Vite)

---

## Paso 1: Configurar Google Sheets

1. Crea un nuevo documento en [Google Sheets](https://sheets.google.com).
2. Nombra la primera hoja como **`Pedidos`** y la segunda hoja como **`Productos`**.

> **IMPORTANTE**: La hoja `Pedidos` se llenará automáticamente si la vinculas con Google Forms. Asegúrate de que las columnas tengan los nombres correctos.

**Encabezados necesarios en la hoja `Productos` (Fila 1):**
`id` | `nombre` | `precio` | `categoria` | `imagen`

**Encabezados necesarios en la hoja `Pedidos` (Fila 1):**
`id` | `fecha` | `estudiante` | `correo` | `grado` | `producto` | `cantidad` | `estado`

---

## Paso 2: Integrar el Código de Google Apps Script

El archivo `apps-script.gs` que se encuentra en la raíz de este proyecto debe ser subido a Google:

1. Abre tu Google Sheet y ve al menú **Extensiones > Apps Script**.
2. Borra el código que aparece por defecto.
3. Copia todo el contenido del archivo `apps-script.gs` de este repositorio y pégalo allí.
4. Guarda el proyecto (icono del disquete 💾).

---

## Paso 3: Publicar la API y Obtener la URL

Para que el frontend de React pueda comunicarse con Google Sheets, necesitamos implementar el script como una Aplicación Web:

1. Haz clic en el botón azul **"Implementar"** (arriba a la derecha).
2. Selecciona **"Nueva implementación"**.
3. En tipo, elige **"Aplicación web"**.
4. Configura así:
   - **Ejecutar como**: `Yo` (tu cuenta)
   - **Quién tiene acceso**: `Cualquier persona`
5. Haz clic en **Implementar**.
6. Concede los permisos que Google solicite (Autorizar accesos > Tu cuenta > Avanzado > Ir a proyecto).
7. Copia la **"URL de la aplicación web"**.

---

## Paso 4: Conectar el Frontend

1. Ve a tu código en React, abre `frontend/src/App.jsx`.
2. Busca la línea `const API_URL = '...'`.
3. Pega ahí la URL que obtuviste en el paso anterior.
4. Ejecuta tu app con `npm run dev`.

---

## Paso 5: Envío de Correos
La aplicación está programada para que, en cuanto el administrador de la cafetería marque un pedido como "Listo" en la interfaz de React, el Google Apps Script envíe automáticamente un correo al estudiante usando tu cuenta de Gmail. No tienes que configurar nada extra, la lógica ya viene incluida en `apps-script.gs`.
