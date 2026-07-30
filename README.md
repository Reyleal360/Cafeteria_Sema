# ☕ Cafetería Sema - Sistema de Gestión de Pedidos

Este proyecto es una aplicación completa diseñada para la gestión de pedidos en una cafetería estudiantil. Combina un desarrollo moderno de **Frontend** (React) con un backend **Serverless/Low-Code** (Google Apps Script + Google Sheets) para una integración ágil y funcional.

## 🚀 Características
- **Frontend Estudiantes**: Interfaz moderna para visualizar el menú y realizar pedidos.
- **Panel Administrativo**: Vista en tiempo real para la encargada de la cafetería con cambio de estados.
- **Integración Low-Code**: Los pedidos se capturan vía Google Forms y se procesan automáticamente.
- **Diseño Premium**: Estética tipo cafetería con diseño responsivo y micro-animaciones.

## 🛠️ Estructura del Proyecto
- `/frontend`: Aplicación en React con Vite.
- `apps-script.gs`: Backend serverless usando Google Apps Script.
- `/low-code-config`: Guía detallada para configurar la integración con Google Apps Script.

## 📦 Instalación

1. **Clonar el repositorio** (o descargar los archivos).
2. **Instalar dependencias del Frontend**:
   ```bash
   cd frontend
   npm install
   ```
3. **Configurar el Backend (Google Apps Script)**:
   - Sigue las instrucciones dentro del archivo `apps-script.gs` para implementar el backend en tu Google Sheet y obtener la URL de despliegue.

## 🏃 Cómo ejecutar

Desde la carpeta `frontend`, ejecuta el siguiente comando para iniciar la aplicación:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)

## 🔗 Integración Low-Code (El flujo del dato)

> **✨ 100% Gratuito y sin intermediarios**: Este proyecto fue diseñado para funcionar exclusivamente con el ecosistema de Google. No necesitas servicios de automatización (como Make o Zapier), ni servidores externos, ni herramientas como ngrok. Todo se procesa directamente a través de Google Apps Script.

1. El **estudiante** llena un **Google Form**.
2. El pedido cae en un **Google Sheet**.
3. El **Google Apps Script** (conectado al Sheet) provee una API para consumir estos datos.
4. El **Frontend en React** hace peticiones a la URL de Apps Script.
5. El **Panel de Cafetería** se actualiza automáticamente y permite cambiar los estados, enviando notificaciones por correo vía Apps Script.

---
Proyecto desarrollado para presentación académica en el **SENA**.
