/**
 * API Principal - Cafetería SENA
 * Este servidor maneja el catálogo de productos y los pedidos de los estudiantes.
 * Desarrollado para presentación académica.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================
// Habilita el acceso desde cualquier origen (CORS) - Necesario para que Vercel se comunique con Render
app.use(cors());
// Parsea el cuerpo de las peticiones HTTP a formato JSON
app.use(bodyParser.json());

// Middleware de registro (Logging) para auditar qué peticiones llegan al servidor
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ==========================================
// FUNCIONES AUXILIARES (PERSISTENCIA DE DATOS)
// ==========================================
/**
 * Lee la base de datos JSON de forma segura.
 * Utiliza try/catch para evitar caídas del servidor si el archivo está corrupto.
 * @returns {Object} El estado actual de la base de datos.
 */
const readDB = () => {
    try {
        if (!fs.existsSync(DB_PATH)) {
            // Si el archivo no existe por alguna razón, retorna una estructura vacía por defecto
            return { productos: [], pedidos: [] };
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error al leer la base de datos:', error);
        return { productos: [], pedidos: [] }; // Fallback seguro
    }
};

/**
 * Escribe los datos en el archivo JSON.
 * @param {Object} data - La estructura completa de la base de datos a guardar.
 */
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('❌ Error al escribir en la base de datos:', error);
    }
};

// ==========================================
// RUTAS (ENDPOINTS)
// ==========================================

/**
 * @route GET /productos
 * @description Retorna el catálogo completo de productos disponibles en la cafetería.
 */
app.get('/productos', (req, res) => {
    try {
        const db = readDB();
        res.status(200).json(db.productos);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor al obtener productos.' });
    }
});

/**
 * @route GET /pedidos
 * @description Retorna la lista de pedidos realizados por los estudiantes (Uso administrativo).
 */
app.get('/pedidos', (req, res) => {
    try {
        const db = readDB();
        res.status(200).json(db.pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor al obtener pedidos.' });
    }
});

/**
 * @route POST /pedidos
 * @description Recibe y almacena un nuevo pedido. (Generalmente llamado vía webhook desde Make/Zapier)
 */
app.post('/pedidos', (req, res) => {
    try {
        const { estudiante, grado, producto, cantidad, hora } = req.body;
        
        // Validación de datos de entrada (Data Validation)
        if (!estudiante || typeof estudiante !== 'string' || estudiante.trim() === '') {
            return res.status(400).json({ error: 'El nombre del estudiante es obligatorio y debe ser texto válido.' });
        }
        
        if (!producto || typeof producto !== 'string' || producto.trim() === '') {
            return res.status(400).json({ error: 'El producto es obligatorio.' });
        }

        const db = readDB();
        
        // Creación del objeto pedido con metadatos
        const nuevoPedido = {
            id: Date.now(), // Generación de ID único basado en timestamp
            estudiante: estudiante.trim(),
            grado: grado || 'N/A', // Valor por defecto si no se especifica
            producto: producto.trim(),
            cantidad: Number(cantidad) || 1, // Asegura que sea número
            hora: hora || new Date().toLocaleString(), // Hora enviada por Google Forms
            estado: 'pendiente', // Estados posibles: pendiente, preparacion, listo
            fecha: new Date().toISOString()
        };

        db.pedidos.push(nuevoPedido);
        writeDB(db);

        console.log(`✅ Nuevo pedido registrado para: ${estudiante} (${producto}) a las ${nuevoPedido.hora}`);
        res.status(201).json(nuevoPedido);
    } catch (error) {
        console.error('Error al procesar el POST /pedidos:', error);
        res.status(500).json({ error: 'Error interno al procesar el pedido.' });
    }
});

/**
 * @route PUT /pedidos/:id
 * @description Actualiza el estado de un pedido específico (ej: de "pendiente" a "listo").
 */
app.put('/pedidos/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Validar que se haya enviado un estado
        if (!estado) {
            return res.status(400).json({ error: 'Se requiere especificar el nuevo estado.' });
        }

        const db = readDB();
        const pedidoIndex = db.pedidos.findIndex(p => String(p.id) === String(id));

        if (pedidoIndex === -1) {
            return res.status(404).json({ error: `Pedido con ID ${id} no encontrado.` });
        }

        // Actualización del estado
        db.pedidos[pedidoIndex].estado = estado;
        writeDB(db);

        console.log(`🔄 Pedido ${id} actualizado a estado: ${estado}`);
        res.status(200).json(db.pedidos[pedidoIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error interno al actualizar el pedido.' });
    }
});

// ==========================================
// INICIALIZACIÓN DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log('\n=======================================');
    console.log(`🚀 SERVIDOR ACTIVO Y ESCUCHANDO`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🛠️  Entorno: ${process.env.NODE_ENV || 'Desarrollo'}`);
    console.log('=======================================\n');
});
