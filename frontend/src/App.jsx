import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingCart, List, CheckCircle, Clock, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:3001';
// Reemplaza esto con el link real de tu Google Form
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdSI3GHCCfBWQGE7MYCMetuovFD3E5Ie5Gaa5WS_dnVfgFCRA/viewform';

function App() {
  const [view, setView] = useState('menu'); // 'menu' o 'admin'
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProductos();
    if (view === 'admin') {
      fetchPedidos();
      const interval = setInterval(fetchPedidos, 5000); // Auto-refresh cada 5s
      return () => clearInterval(interval);
    }
  }, [view]);

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error fetching productos:", err);
    }
  };

  const fetchPedidos = async () => {
    try {
      const res = await fetch(`${API_URL}/pedidos`);
      const data = await res.json();
      setPedidos(data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    } catch (err) {
      console.error("Error fetching pedidos:", err);
    }
  };

  const updateEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`${API_URL}/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      fetchPedidos();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <Coffee style={{ marginRight: '10px' }} inline />
          CAFETERÍA SEMA
        </div>
        <nav>
          <button 
            className={view === 'menu' ? 'active' : ''} 
            onClick={() => setView('menu')}
          >
            Menú Estudiantes
          </button>
          <button 
            className={view === 'admin' ? 'active' : ''} 
            onClick={() => setView('admin')}
          >
            Panel Encargada
          </button>
        </nav>
      </header>

      {view === 'menu' ? (
        <main className="fade-in">
          <section className="hero">
            <h1>Bienvenido a la Cafetería</h1>
            <p>Pide tus snacks favoritos de forma rápida y sencilla.</p>
          </section>

          <div className="container">
            <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: '#6f4e37' }}>Nuestro Menú</h2>
            <div className="product-grid">
              {productos.map(prod => (
                <div key={prod.id} className="card">
                  <img src={prod.imagen} alt={prod.nombre} className="card-img" />
                  <div className="card-content">
                    <h3 className="card-title">{prod.nombre}</h3>
                    <p className="card-price">${prod.precio.toLocaleString()}</p>
                    <a 
                      href={GOOGLE_FORM_URL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="order-btn"
                    >
                      <ShoppingCart size={18} />
                      Hacer pedido
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      ) : (
        <main className="container fade-in" style={{ marginTop: '3rem' }}>
          <div className="admin-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Gestión de Pedidos</h2>
              <button onClick={fetchPedidos} className="action-btn">
                <RefreshCw size={18} />
              </button>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Grado</th>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                      No hay pedidos registrados aún.
                    </td>
                  </tr>
                ) : (
                  pedidos.map(pedido => (
                    <tr key={pedido.id}>
                      <td><strong>{pedido.estudiante}</strong></td>
                      <td>{pedido.grado}</td>
                      <td>{pedido.producto}</td>
                      <td>{pedido.cantidad}</td>
                      <td>
                        <span className={`status-badge status-${pedido.estado}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {pedido.estado === 'pendiente' && (
                            <button 
                              onClick={() => updateEstado(pedido.id, 'preparacion')}
                              className="action-btn"
                              title="Poner en preparación"
                            >
                              <Clock size={16} color="#1971c2" />
                            </button>
                          )}
                          {pedido.estado !== 'listo' && (
                            <button 
                              onClick={() => updateEstado(pedido.id, 'listo')}
                              className="action-btn"
                              title="Marcar como listo"
                            >
                              <CheckCircle size={16} color="#2b8a3e" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}

      <footer style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
        <p>&copy; 2024 Cafetería Sema - Proyecto Educativo</p>
      </footer>
    </div>
  );
}

export default App;
