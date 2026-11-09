import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(backendDir, '../..');

dotenv.config({ path: path.join(projectRoot, '.env') });

export const config = {
  port: Number(process.env.PORT) || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  restaurantName: process.env.RESTAURANT_NAME || 'Restaurante',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '',
  menuSpreadsheetId: process.env.GOOGLE_SHEET_MENU_ID,
  ordersSpreadsheetId: process.env.GOOGLE_SHEET_PEDIDOS_ID,
  serviceAccountPath: process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? path.resolve(projectRoot, process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    : '',
  gmailUser: process.env.GMAIL_USER,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''),
  restaurantEmail: process.env.RESTAURANT_EMAIL,
};
