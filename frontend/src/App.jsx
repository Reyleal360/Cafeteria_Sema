import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingCart, List, CheckCircle, Clock, RefreshCw, X, Filter, LogIn, LogOut, Trash2 } from 'lucide-react';

const API_URL = 'https://cafeteria-sema.onrender.com';
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdSI3GHCCfBWQGE7MYCMetuovFD3E5Ie5Gaa5WS_dnVfgFCRA/viewform';

function App() {
  const [view, setView] = useState('menu'); // 'menu' o 'admin'
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filter, setFilter] = useState('Todos');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    if (view === 'admin' && isAdminLoggedIn) {
      fetchPedidos();
      const interval = setInterval(fetchPedidos, 5000);
      return () => clearInterval(interval);
    }
  }, [view, isAdminLoggedIn]);

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`);
      const data = await res.json();
      setProductos(data);
    } catch (err) { console.error(err); }
  };

  const fetchPedidos = async () => {
    try {
      const res = await fetch(`${API_URL}/pedidos`);
      const data = await res.json();
      setPedidos(data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    } catch (err) { console.error(err); }
  };

  const addToCart = (product) => {
    const exists = cart.find(item => item.id === product.id);
    if (exists) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.user === 'admin' && loginData.pass === 'sema123') {
      setIsAdminLoggedIn(true);
    } else {
      alert('Credenciales incorrectas');
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
    } catch (err) { console.error(err); }
  };

  const filteredProducts = filter === 'Todos' 
    ? productos 
    : productos.filter(p => p.categoria === filter);

  const cartTotal = cart.reduce((acc, item) => acc + (item.precio * item.qty), 0);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header>
        <div className="logo" onClick={() => setView('menu')}>
          <Coffee size={28} />
          <span>CAFETERÍA SEMA</span>
        </div>
        <nav>
          <button className={view === 'menu' ? 'active' : ''} onClick={() => setView('menu')}>Catálogo</button>
          <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>Panel Encargada</button>
          <div className="cart-trigger" onClick={() => setIsCartOpen(true)}>
            <button><ShoppingCart size={20} /></button>
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </div>
        </nav>
      </header>

      {/* CART DRAWER */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Tu Pedido</h2>
          <X size={24} onClick={() => setIsCartOpen(false)} style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div>
                <h4>{item.nombre}</h4>
                <p>{item.qty} x ${item.precio.toLocaleString()}</p>
              </div>
              <Trash2 size={18} color="#e63946" onClick={() => removeFromCart(item.id)} style={{ cursor: 'pointer' }} />
            </div>
          ))}
          {cart.length === 0 && <p>El carrito está vacío</p>}
        </div>
        <div style={{ borderTop: '2px solid #eee', paddingTop: '1rem' }}>
          <h3>Total: ${cartTotal.toLocaleString()}</h3>
          <a href={GOOGLE_FORM_URL} target="_blank" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Confirmar en Google Forms
          </a>
        </div>
      </div>

      {/* VIEWS */}
      {view === 'menu' ? (
        <main className="fade-in">
          <div className="filters">
            {['Todos', 'Bebidas', 'Snacks', 'Comidas'].map(cat => (
              <button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
                {cat}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {filteredProducts.map(prod => (
              <div key={prod.id} className="card">
                <div className="card-img-container">
                  <img src={prod.imagen} alt={prod.nombre} className="card-img" />
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
        </main>
      ) : (
        <main className="fade-in">
          {!isAdminLoggedIn ? (
            <div className="login-container">
              <LogIn size={48} color="#6f4e37" style={{ marginBottom: '1rem' }} />
              <h2>Acceso Administrativo</h2>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Ingresa tus credenciales para ver los pedidos.</p>
              <form onSubmit={handleLogin}>
                <input type="text" placeholder="Usuario" onChange={e => setLoginData({...loginData, user: e.target.value})} />
                <input type="password" placeholder="Contraseña" onChange={e => setLoginData({...loginData, pass: e.target.value})} />
                <button type="submit" className="btn-primary">Entrar al Panel</button>
              </form>
            </div>
          ) : (
            <div className="admin-view">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Pedidos Recibidos</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={fetchPedidos} className="filter-btn"><RefreshCw size={18} /></button>
                  <button onClick={() => setIsAdminLoggedIn(false)} className="filter-btn"><LogOut size={18} /></button>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Grado</th>
                    <th>Producto</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map(p => (
                    <tr key={p.id}>
                      <td>{p.estudiante}</td>
                      <td>{p.grado}</td>
                      <td>{p.producto}</td>
                      <td><span className={`status-badge status-${p.estado}`}>{p.estado}</span></td>
                      <td>
                        {p.estado === 'pendiente' && <button onClick={() => updateEstado(p.id, 'preparacion')} title="Preparar"><Clock size={16} /></button>}
                        {p.estado !== 'listo' && <button onClick={() => updateEstado(p.id, 'listo')} title="Listo"><CheckCircle size={16} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
