# ☕ Cafetería Sema - Sistema de Gestión de Pedidos

Este proyecto es una aplicación completa diseñada para la gestión de pedidos en una cafetería estudiantil. Combina un desarrollo moderno de **Full Stack** (React + Express) con herramientas **Low-Code** (Google Forms + Google Sheets) para una integración ágil y funcional.

## 🚀 Características
- **Frontend Estudiantes**: Interfaz moderna para visualizar el menú y realizar pedidos.
- **Panel Administrativo**: Vista en tiempo real para la encargada de la cafetería con cambio de estados.
- **Integración Low-Code**: Los pedidos se capturan vía Google Forms y se procesan automáticamente.
- **Diseño Premium**: Estética tipo cafetería con diseño responsivo y micro-animaciones.

## 🛠️ Estructura del Proyecto
- `/frontend`: Aplicación en React con Vite.
- `/backend`: API REST en Node.js con Express y base de datos JSON.
- `/low-code-config`: Guía detallada para configurar Google Forms y Make.com.

## 📦 Instalación

1. **Clonar el repositorio** (o descargar los archivos).
2. **Instalar dependencias generales**:
   ```bash
   npm install
   ```
3. **Instalar dependencias del Backend**:
   ```bash
   cd backend
   npm install
   ```
4. **Instalar dependencias del Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

## 🏃 Cómo ejecutar

Desde la carpeta raíz del proyecto, ejecuta el siguiente comando para iniciar tanto el frontend como el backend simultáneamente:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

## 🔗 Integración Low-Code (El flujo del dato)
1. El **estudiante** llena un **Google Form**.
2. El pedido cae en un **Google Sheet**.
3. **Make.com** detecta la nueva fila y envía un **POST** a `http://localhost:3001/pedidos`.
4. El **Panel de Cafetería** se actualiza automáticamente mostrando el nuevo pedido.

> **Nota**: Para que Make.com pueda enviar datos a tu localhost, necesitarás usar una herramienta como `ngrok` para exponer tu puerto 3001 a internet.

---
Proyecto desarrollado para presentación académica en el **SENA**.
