async function request(path, options) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'No se pudo completar la solicitud.');
  return body;
}

export const getMenu = () => request('/api/menu');
export const getConfig = () => request('/api/config');
export const submitOrder = (order) => request('/api/orders', {
  method: 'POST',
  body: JSON.stringify(order),
});
