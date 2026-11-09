import nodemailer from 'nodemailer';
import { config } from '../config.js';

export async function sendOrderEmail(order, pdfBuffer) {
  const missing = [
    ['GMAIL_USER', config.gmailUser],
    ['GMAIL_APP_PASSWORD', config.gmailAppPassword],
    ['RESTAURANT_EMAIL', config.restaurantEmail],
  ].filter(([, value]) => !value);

  if (missing.length) {
    return { sent: false, reason: `Completa en .env: ${missing.map(([name]) => name).join(', ')}.` };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.gmailUser, pass: config.gmailAppPassword },
  });

  await transporter.sendMail({
    from: config.gmailUser,
    to: config.restaurantEmail,
    subject: `Nueva comanda ${order.id}`,
    text: `Pedido de ${order.customer.name}. Total: $${order.total.toFixed(2)}.`,
    attachments: [{ filename: `comanda-${order.id}.pdf`, content: pdfBuffer }],
  });

  return { sent: true };
}
