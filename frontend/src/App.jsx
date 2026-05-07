import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingCart, List, CheckCircle, Clock, RefreshCw, X, Filter, LogIn, LogOut, Trash2, Bell } from 'lucide-react';

// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================
const API_URL = 'https://cafeteria-sema.onrender.com';
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdSI3GHCCfBWQGE7MYCMetuovFD3E5Ie5Gaa5WS_dnVfgFCRA/viewform';

function App() {
  // ==========================================
  // ESTADOS DE LA APLICACIÓN
  // ==========================================
  const [view, setView] = useState('menu'); // 'menu' (estudiantes) o 'admin' (encargada)
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filter, setFilter] = useState('Todos');
  
  // Estados de carga (Loading States)
  const [isLoading, setIsLoading] = useState(false);
  
  // Sistema de Notificaciones Visuales (Toast)
  const [notification, setNotification] = useState(null);

  // Autenticación Administrativa (Hardcodeada para fines del MVP)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });

  // ==========================================
  // EFECTOS DE CICLO DE VIDA
  // ==========================================
  
  // Cargar productos al montar el componente principal
  useEffect(() => {
    fetchProductos();
  }, []);

  // Polling: Actualizar pedidos automáticamente cada 5 segundos si está en la vista admin
  useEffect(() => {
    if (view === 'admin' && isAdminLoggedIn) {
      fetchPedidos();
      const interval = setInterval(fetchPedidos, 5000);
      return () => clearInterval(interval); // Limpiar el intervalo al desmontar
    }
  }, [view, isAdminLoggedIn]);

  // Limpiar notificaciones automáticamente después de 3 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // ==========================================
  // FUNCIONES DE COMUNICACIÓN CON LA API
  // ==========================================

  /**
   * Obtiene el catálogo de productos desde el backend.
   */
  const fetchProductos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/productos`);
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      const data = await res.json();
      setProductos(data);
    } catch (err) { 
      console.error('Error obteniendo productos:', err);
      showNotification('Error al cargar el catálogo. Intenta recargar.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene la lista de pedidos en tiempo real.
   */
  const fetchPedidos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/pedidos`);
      if (!res.ok) throw new Error('Error al conectar con la API');
      const data = await res.json();
      // Ordenar pedidos por fecha (los más recientes primero)
      setPedidos(data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    } catch (err) { 
      console.error('Error obteniendo pedidos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualiza el estado de un pedido (Pendiente -> Preparación -> Listo)
   */
  const updateEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      if (!res.ok) throw new Error('No se pudo actualizar el estado');
      
      showNotification(`Pedido marcado como "${nuevoEstado}"`, 'success');
      fetchPedidos(); // Refrescar la lista para mostrar el cambio
    } catch (err) { 
      console.error(err);
      showNotification('Error al actualizar el pedido', 'error');
    }
  };

  // ==========================================
  // LÓGICA DE NEGOCIO (CARRITO Y LOGIN)
  // ==========================================

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const addToCart = (product) => {
    const exists = cart.find(item => item.id === product.id);
    if (exists) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    showNotification(`${product.nombre} añadido al carrito`, 'success');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // NOTA: Para un entorno de producción real, esto debería ser manejado mediante tokens JWT en el backend.
    if (loginData.user === 'admin' && loginData.pass === 'sema123') {
      setIsAdminLoggedIn(true);
      showNotification('Sesión iniciada correctamente', 'success');
    } else {
      showNotification('Credenciales incorrectas. Intenta de nuevo.', 'error');
    }
  };

  // Derivación de datos para la interfaz
  const filteredProducts = filter === 'Todos' 
    ? productos 
    : productos.filter(p => p.categoria === filter);

  const cartTotal = cart.reduce((acc, item) => acc + (item.precio * item.qty), 0);

  // ==========================================
  // COMPONENTES DE INTERFAZ (RENDER)
  // ==========================================
  return (
    <div className="app-container">
      {/* Sistema de Notificaciones Flotante */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <Bell size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ENCABEZADO (HEADER) */}
      <header>
        <div className="logo" onClick={() => setView('menu')} title="Ir al catálogo">
          <Coffee size={28} />
          <span>CAFETERÍA SEMA</span>
        </div>
        <nav>
          <button className={view === 'menu' ? 'active' : ''} onClick={() => setView('menu')}>Catálogo</button>
          <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>Panel Encargada</button>
          
          {/* Botón flotante del carrito con indicador numérico */}
          <div className="cart-trigger" onClick={() => setIsCartOpen(true)}>
            <button aria-label="Abrir Carrito"><ShoppingCart size={20} /></button>
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </div>
        </nav>
      </header>

      {/* PANEL LATERAL DEL CARRITO (DRAWER) */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Tu Pedido</h2>
          <X size={24} onClick={() => setIsCartOpen(false)} style={{ cursor: 'pointer' }} />
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div>
                <h4 style={{ color: 'var(--primary)' }}>{item.nombre}</h4>
                <p>{item.qty} x ${item.precio.toLocaleString()}</p>
              </div>
              <Trash2 size={18} color="#e63946" onClick={() => removeFromCart(item.id)} style={{ cursor: 'pointer' }} />
            </div>
          ))}
          {cart.length === 0 && <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>El carrito está vacío</p>}
        </div>
        
        <div style={{ borderTop: '2px solid #eee', paddingTop: '1rem', marginTop: 'auto' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Total: ${cartTotal.toLocaleString()}</h3>
          <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Confirmar en Google Forms
          </a>
          <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem', color: '#666' }}>
            *La orden oficial se procesa en el formulario
          </p>
        </div>
      </div>

      {/* VISTAS PRINCIPALES */}
      {view === 'menu' ? (
        // VISTA 1: CATÁLOGO DE ESTUDIANTES
        <main className="fade-in">
          {/* Barra de Filtros */}
          <div className="filters">
            {['Todos', 'Bebidas', 'Snacks', 'Comidas'].map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${filter === cat ? 'active' : ''}`} 
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading && productos.length === 0 ? (
            <div className="loading-spinner">Cargando catálogo...</div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="card">
                  <div className="card-img-container">
                    <img src={prod.imagen} alt={prod.nombre} className="card-img" loading="lazy" />
                    <span className="category-tag">{prod.categoria}</span>
                  </div>
                  <div className="card-content" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{prod.nombre}</h3>
                    <p style={{ color: '#d4a373', fontWeight: '700', fontSize: '1.2rem', marginBottom: '1rem' }}>
                      ${prod.precio.toLocaleString()}
                    </p>
                    <button className="btn-primary" onClick={() => addToCart(prod)}>
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        // VISTA 2: PANEL DE ADMINISTRACIÓN
        <main className="fade-in">
          {!isAdminLoggedIn ? (
            // Formulario de Inicio de Sesión
            <div className="login-container">
              <LogIn size={48} color="#6f4e37" style={{ marginBottom: '1rem', display: 'inline-block' }} />
              <h2 style={{ color: 'var(--primary)' }}>Acceso Administrativo</h2>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Área exclusiva para personal autorizado.</p>
              <form onSubmit={handleLogin}>
                <input 
                  type="text" 
                  placeholder="Usuario" 
                  required
                  onChange={e => setLoginData({...loginData, user: e.target.value})} 
                />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  required
                  onChange={e => setLoginData({...loginData, pass: e.target.value})} 
                />
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Ingresar al Sistema</button>
              </form>
            </div>
          ) : (
            // Dashboard de Pedidos
            <div className="admin-view">
              <div className="admin-header">
                <div>
                  <h2 style={{ color: 'var(--primary)' }}>Tablero de Pedidos</h2>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>Monitoreo en tiempo real. Actualización automática cada 5s.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={fetchPedidos} className="filter-btn" title="Refrescar lista" disabled={isLoading}>
                    <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
                  </button>
                  <button onClick={() => setIsAdminLoggedIn(false)} className="filter-btn" title="Cerrar sesión">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>

              {isLoading && pedidos.length === 0 ? (
                <div className="loading-spinner">Obteniendo pedidos recientes...</div>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Correo</th>
                        <th>Grado</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acciones Operativas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                            No hay pedidos pendientes en este momento.
                          </td>
                        </tr>
                      ) : (
                        pedidos.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: '500' }}>{p.estudiante}</td>
                            <td style={{ fontSize: '0.85rem', color: '#666' }}>{p.correo || 'N/A'}</td>
                            <td>{p.grado}</td>
                            <td>{p.producto}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{p.cantidad}</td>
                            <td>{p.hora}</td>
                            <td><span className={`status-badge status-${p.estado}`}>{p.estado.toUpperCase()}</span></td>
                            <td>
                              <div className="action-buttons">
                                {p.estado === 'pendiente' && (
                                  <button className="action-btn prep-btn" onClick={() => updateEstado(p.id, 'preparacion')} title="Pasar a Preparación">
                                    <Clock size={16} /> Preparar
                                  </button>
                                )}
                                {p.estado !== 'listo' && (
                                  <button className="action-btn ready-btn" onClick={() => updateEstado(p.id, 'listo')} title="Marcar como Listo">
                                    <CheckCircle size={16} /> Listo
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
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
