import { useEffect, useMemo, useState } from 'react';
import { getConfig, getMenu, submitOrder } from './services/api.js';

const money = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });

export default function App() {
  const [restaurant, setRestaurant] = useState({ restaurantName: 'Restaurante', whatsappNumber: '' });
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [customer, setCustomer] = useState({ name: '', address: '', phone: '' });
  const [step, setStep] = useState('menu');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [menuData, configData] = await Promise.all([getMenu(), getConfig()]);
      setMenu(menuData.items || []);
      setRestaurant(configData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const selectedItems = useMemo(() => menu
    .filter((item) => cart[item.id]?.quantity > 0)
    .map((item) => ({ ...item, quantity: cart[item.id].quantity, comment: cart[item.id].comment || '' })), [menu, cart]);
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
      setStep('done');
      setCart({});
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

      <section className="chat-shell" id="inicio" aria-label="Chat para realizar un pedido">
        <div className="chat-heading">
          <div className="bot-avatar" aria-hidden="true">M</div>
          <div><strong>Asistente de pedidos</strong><span>{restaurant.restaurantName} · Te ayudamos a pedir</span></div>
          <span className="online-dot" aria-label="Disponible" />
        </div>

        <div className="conversation" aria-live="polite">
          <div className="message-row">
            <div className="bot-avatar small" aria-hidden="true">M</div>
            <div className="message bot-message">¡Hola! 👋 ¿Qué te gustaría pedir hoy? Revisa el menú y agrega tus favoritos.</div>
          </div>

          {step === 'menu' && (
            <>
              {loading && <div className="message bot-message status-card">Cargando el menú…</div>}
              {!loading && error && (
                <div className="message bot-message error-message" role="alert">
                  <strong>No pudimos cargar el menú.</strong>
                  <span>{error}</span>
                  <span>Revisa la conexión y la configuración de Google Sheets.</span>
                  <button type="button" className="text-button" onClick={loadData}>Intentar de nuevo</button>
                </div>
              )}
              {!loading && !error && menu.length === 0 && (
                <div className="message bot-message status-card">Todavía no hay platos disponibles. Vuelve a consultar más tarde.</div>
              )}

              {!loading && !error && menu.length > 0 && (
                <div className="menu-list" aria-label="Menú disponible">
                  {menu.map((item) => (
                    <article className="menu-card" key={item.id}>
                      <div className="dish-info">
                        <span className="dish-category">{item.category || 'Plato del día'}</span>
                        <h3>{item.name}</h3>
                        {item.description && <p>{item.description}</p>}
                        <strong className="dish-price">{money.format(item.price)}</strong>
                        {cart[item.id]?.quantity > 0 && (
                          <label className="comment-field">Nota para este plato
                            <input maxLength="200" value={cart[item.id]?.comment || ''} onChange={(event) => setComment(item.id, event.target.value)} placeholder="Ej. sin cebolla" />
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
              )}

              <div className="message-row user-row">
                <div className="message user-message">
                  {selectedItems.length === 0 ? 'Estoy revisando el menú.' : `Quiero ${selectedItems.map((item) => `${item.quantity} ${item.name}`).join(', ')}.`}
                </div>
              </div>
              {selectedItems.length > 0 && (
                <div className="chat-summary">
                  <div className="summary-title"><strong>Tu pedido</strong><strong>{money.format(total)}</strong></div>
                  {selectedItems.map((item) => <div className="summary-line" key={item.id}>{item.quantity} × {item.name}</div>)}
                  <button className="submit-button" type="button" onClick={() => { setError(''); setStep('details'); }}>
                    Continuar con la entrega <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </>
          )}

          {step === 'details' && (
            <>
              <div className="message-row"><div className="bot-avatar small" aria-hidden="true">M</div><div className="message bot-message">¡Perfecto! Tu pedido suma <strong>{money.format(total)}</strong>. ¿A quién y dónde lo entregamos?</div></div>
              <div className="message-row user-row"><div className="message user-message">Quiero recibirlo en mi dirección.</div></div>
              <form className="chat-form" onSubmit={handleSubmit}>
                <label>Nombre completo
                  <input required minLength="2" maxLength="100" autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Tu nombre" />
                </label>
                <label>Dirección de entrega
                  <input required minLength="5" maxLength="200" autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Calle, número y referencia" />
                </label>
                <label>Teléfono o WhatsApp
                  <input required inputMode="tel" autoComplete="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="09XXXXXXXX" />
                  <small>Formato: 09XXXXXXXX o +5939XXXXXXXX</small>
                </label>
                {error && <p className="alert" role="alert">{error}</p>}
                <div className="form-actions">
                  <button className="back-button" type="button" onClick={() => { setError(''); setStep('menu'); }}>Volver al menú</button>
                  <button className="submit-button" type="submit" disabled={submitting || selectedItems.length === 0}>
                    {submitting ? 'Enviando…' : `Confirmar · ${money.format(total)}`} <span aria-hidden="true">→</span>
                  </button>
                </div>
                <p className="secure-note">Tus datos se usarán para gestionar esta entrega.</p>
              </form>
            </>
          )}

          {step === 'done' && notice && (
            <div className="success-card" role="status">
              <strong>¡Pedido recibido!</strong>
              <span>Comanda {notice.id.slice(0, 8)} · {money.format(notice.total)}</span>
              <span>{notice.notification.sent ? 'Enviamos la comanda al restaurante.' : 'Pedido guardado; correo pendiente de configuración.'}</span>
              {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer">Continuar por WhatsApp ↗</a>}
              <button type="button" className="text-button" onClick={() => { setCustomer({ name: '', address: '', phone: '' }); setNotice(null); setStep('menu'); }}>Hacer otro pedido</button>
            </div>
          )}
        </div>

        <footer className="chat-footer">Preparado con cariño · {restaurant.restaurantName}</footer>
      </section>
    </main>
  );
}
