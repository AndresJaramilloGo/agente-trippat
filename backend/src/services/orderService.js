import { randomUUID } from 'node:crypto';
import { config } from '../config.js';
import { appendOrderRow } from './googleSheets.js';
import { getMenu } from './menuService.js';
import { createOrderPdf } from './pdfService.js';
import { sendOrderEmail } from './emailService.js';

function normalizePhone(phone) {
  const value = String(phone ?? '').trim().replace(/[\s()-]/g, '');
  return /^(09\d{8}|\+5939\d{8})$/.test(value) ? value : '';
}

export async function createOrder(input) {
  const name = String(input?.customer?.name ?? '').trim();
  const address = String(input?.customer?.address ?? '').trim();
  const phone = normalizePhone(input?.customer?.phone);
  const requestedItems = Array.isArray(input?.items) ? input.items : [];

  if (name.length < 2) throw new Error('Escribe el nombre de quien recibe el pedido.');
  if (address.length < 5) throw new Error('Escribe una dirección completa.');
  if (!phone) throw new Error('Ingresa un teléfono ecuatoriano válido (09XXXXXXXX o +5939XXXXXXXX).');
  if (requestedItems.length === 0) throw new Error('Agrega al menos un plato al pedido.');

  const menu = await getMenu();
  const menuById = new Map(menu.map((item) => [item.id, item]));
  const items = requestedItems.map((requested) => {
    const menuItem = menuById.get(String(requested.id));
    const quantity = Number(requested.quantity);
    const comment = String(requested.comment ?? '').trim();
    if (!menuItem) throw new Error('Uno de los productos ya no está disponible. Actualiza el menú.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 30) {
      throw new Error('La cantidad debe ser un número entre 1 y 30.');
    }
    if (comment.length > 200) throw new Error('Las notas por plato no pueden superar 200 caracteres.');
    return {
      id: menuItem.id,
      name: menuItem.name,
      quantity,
      unitPrice: menuItem.price,
      lineTotal: menuItem.price * quantity,
      comment,
    };
  });

  const order = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    customer: { name, address, phone },
    items,
    total: items.reduce((total, item) => total + item.lineTotal, 0),
  };
  const detail = items.map((item) =>
    `${item.quantity}x ${item.name}${item.comment ? ` (${item.comment})` : ''}`,
  ).join(' | ');

  await appendOrderRow([
    order.id,
    order.createdAt,
    name,
    address,
    phone,
    detail,
    order.total,
    'Recibido',
  ]);

  const pdf = await createOrderPdf(order);
  let notification;
  try {
    notification = await sendOrderEmail(order, pdf);
  } catch {
    notification = { sent: false, reason: 'El pedido se guardó, pero no se pudo enviar el correo.' };
  }

  const waNumber = config.whatsappNumber.replace(/\D/g, '');
  return {
    id: order.id,
    total: order.total,
    notification,
    whatsappUrl: waNumber ? `https://wa.me/${waNumber}` : '',
  };
}
