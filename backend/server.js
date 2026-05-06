const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json());

// Helper function to read/write DB
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Endpoints

// 1. GET /productos - Obtener lista de productos
app.get('/productos', (req, res) => {
    const db = readDB();
    res.json(db.productos);
});

// 2. GET /pedidos - Obtener lista de pedidos
app.get('/pedidos', (req, res) => {
    const db = readDB();
    res.json(db.pedidos);
});

// 3. POST /pedidos - Crear un nuevo pedido
// Este endpoint será llamado por Zapier/Make cuando se llene el Google Form
app.post('/pedidos', (req, res) => {
    const { estudiante, grado, producto, cantidad } = req.body;
    
    if (!estudiante || !producto) {
        return res.status(400).json({ error: 'Faltan datos del pedido' });
    }

    const db = readDB();
    const nuevoPedido = {
        id: Date.now(),
        estudiante,
        grado,
        producto,
        cantidad: cantidad || 1,
        estado: 'pendiente',
        fecha: new Date().toISOString()
    };

    db.pedidos.push(nuevoPedido);
    writeDB(db);

    res.status(201).json(nuevoPedido);
});

// 4. PUT /pedidos/:id - Actualizar estado del pedido
app.put('/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const db = readDB();
    const pedidoIndex = db.pedidos.findIndex(p => p.id == id);

    if (pedidoIndex === -1) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    db.pedidos[pedidoIndex].estado = estado;
    writeDB(db);

    res.json(db.pedidos[pedidoIndex]);
});

app.listen(PORT, () => {
    console.log(`Servidor de Cafetería corriendo en http://localhost:${PORT}`);
});
