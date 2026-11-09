import { useEffect, useMemo, useState } from 'react';
import { getConfig, getMenu, submitOrder } from './services/api.js';

const money = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });

export default function App() {
  const [restaurant, setRestaurant] = useState({ restaurantName: 'Restaurante', whatsappNumber: '' });
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [customer, setCustomer] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    Promise.all([getMenu(), getConfig()])
      .then(([menuData, configData]) => {
        setMenu(menuData.items || []);
        setRestaurant(configData);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedItems = useMemo(() => menu
    .filter((item) => cart[item.id]?.quantity > 0)
    .map((item) => ({
      ...item,
      quantity: cart[item.id].quantity,
      comment: cart[item.id].comment || '',
    })), [menu, cart]);

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function setQuantity(itemId, quantity) {
    setCart((current) => ({
      ...current,
      [itemId]: { ...current[itemId], quantity: Math.max(0, Math.min(30, quantity)) },
    }));
  }

  function setComment(itemId, comment) {
    setCart((current) => ({
      ...current,
      [itemId]: { ...current[itemId], quantity: current[itemId]?.quantity || 0, comment },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice(null);
    setSubmitting(true);
    try {
      const result = await submitOrder({
        customer,
        items: selectedItems.map(({ id, quantity, comment }) => ({ id, quantity, comment })),
      });
      setNotice(result);
      setCart({});
      setCustomer({ name: '', address: '', phone: '' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappNumber = restaurant.whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, acabo de realizar un pedido.')}`
    : notice?.whatsappUrl;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Inicio">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>{restaurant.restaurantName}</span>
        </a>
        <span className="open-badge"><span /> Pedidos del día</span>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">HECHO CON SABOR, PARA TI</p>
          <h1>Un buen día<br />empieza con un <em>buen almuerzo.</em></h1>
          <p className="hero-text">Elige tus favoritos y nosotros nos encargamos del resto.</p>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <span className="sun" />
          <span className="plate"><span className="food food-one" /><span className="food food-two" /><span className="food food-three" /></span>
          <span className="leaf leaf-one" /><span className="leaf leaf-two" />
        </div>
      </section>

      <div className="content-grid">
        <section className="menu-section" aria-labelledby="menu-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SELECCIÓN DEL DÍA</p>
              <h2 id="menu-title">Nuestro menú</h2>
            </div>
            <span className="menu-count">{menu.length} opciones</span>
          </div>

          {loading && <p className="status-card">Cargando el menú…</p>}
          {!loading && !error && menu.length === 0 && (
            <p className="status-card">No hay platos disponibles por el momento.</p>
          )}
          <div className="menu-list">
            {menu.map((item) => (
              <article className="menu-card" key={item.id}>
                <div className="dish-avatar" aria-hidden="true">{item.name.slice(0, 1).toUpperCase()}</div>
                <div className="dish-info">
                  <span className="dish-category">{item.category || 'Plato del día'}</span>
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                  <strong className="dish-price">{money.format(item.price)}</strong>
                  {cart[item.id]?.quantity > 0 && (
                    <label className="comment-field">
                      Nota para este plato
                      <input
                        maxLength="200"
                        value={cart[item.id]?.comment || ''}
                        onChange={(event) => setComment(item.id, event.target.value)}
                        placeholder="Ej. sin cebolla"
                      />
                    </label>
                  )}
                </div>
                <div className="quantity-control" aria-label={`Cantidad de ${item.name}`}>
                  <button type="button" onClick={() => setQuantity(item.id, (cart[item.id]?.quantity || 0) - 1)} aria-label={`Quitar ${item.name}`}>−</button>
                  <span>{cart[item.id]?.quantity || 0}</span>
                  <button type="button" onClick={() => setQuantity(item.id, (cart[item.id]?.quantity || 0) + 1)} aria-label={`Agregar ${item.name}`}>+</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="order-panel" aria-labelledby="order-title">
          <div className="order-heading">
            <div className="bag-icon" aria-hidden="true">⌑</div>
            <div><p className="eyebrow">CASI LISTO</p><h2 id="order-title">Tu pedido</h2></div>
          </div>

          {selectedItems.length === 0 ? (
            <p className="empty-cart">Tu pedido está vacío.<br />Agrega algo rico del menú.</p>
          ) : (
            <ul className="order-items">
              {selectedItems.map((item) => (
                <li key={item.id}>
                  <span>{item.quantity} × {item.name}</span>
                  <strong>{money.format(item.price * item.quantity)}</strong>
                </li>
              ))}
            </ul>
          )}

          <div className="total-row"><span>Total</span><strong>{money.format(total)}</strong></div>

          <form className="customer-form" onSubmit={handleSubmit}>
            <h3>¿A quién entregamos?</h3>
            <label>Nombre completo
              <input required minLength="2" maxLength="100" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Tu nombre" />
            </label>
            <label>Dirección de entrega
              <input required minLength="5" maxLength="200" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Calle, número y referencia" />
            </label>
            <label>Teléfono o WhatsApp
              <input required inputMode="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="09XXXXXXXX" />
              <small>Formato: 09XXXXXXXX o +5939XXXXXXXX</small>
            </label>
            {error && <p className="alert" role="alert">{error}</p>}
            {notice && (
              <div className="success-card" role="status">
                <strong>¡Pedido recibido!</strong>
                <span>Comanda {notice.id.slice(0, 8)} · {money.format(notice.total)}</span>
                <span>{notice.notification.sent ? 'Enviamos la comanda al restaurante.' : 'Pedido guardado; correo pendiente de configuración.'}</span>
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer">Continuar por WhatsApp ↗</a>}
              </div>
            )}
            <button className="submit-button" type="submit" disabled={submitting || selectedItems.length === 0 || loading}>
              {submitting ? 'Enviando pedido…' : 'Confirmar pedido'} <span aria-hidden="true">→</span>
            </button>
            <p className="secure-note">Al confirmar, tus datos se usarán para gestionar esta entrega.</p>
          </form>
        </aside>
      </div>
      <footer className="footer">Preparado con cariño · {restaurant.restaurantName}</footer>
    </main>
  );
}
