import { config } from '../config.js';
import { readFirstSheet } from './googleSheets.js';

function normalizeHeader(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function findColumn(headers, names) {
  const accepted = names.map(normalizeHeader);
  return headers.findIndex((header) => accepted.includes(normalizeHeader(header)));
}

function parsePrice(value) {
  const cleaned = String(value ?? '').replace(/[^\d.,-]/g, '');
  if (!cleaned) return NaN;
  const normalized = cleaned.includes(',') && !cleaned.includes('.')
    ? cleaned.replace(',', '.')
    : cleaned;
  return Number(normalized);
}

function isAvailable(value) {
  const normalized = normalizeHeader(value);
  return !['no', 'false', '0', 'agotado', 'inactivo', 'inactiva'].includes(normalized);
}

export async function getMenu() {
  if (!config.menuSpreadsheetId) throw new Error('Falta GOOGLE_SHEET_MENU_ID en .env.');

  const { rows } = await readFirstSheet(config.menuSpreadsheetId);
  if (rows.length < 2) return [];

  const headers = rows[0];
  const nameColumn = findColumn(headers, ['nombre', 'plato', 'producto', 'name', 'item']);
  const priceColumn = findColumn(headers, ['precio', 'valor', 'price', 'costo']);
  if (nameColumn < 0 || priceColumn < 0) {
    throw new Error('La primera pestaña del menú necesita encabezados Nombre y Precio.');
  }

  const descriptionColumn = findColumn(headers, ['descripcion', 'detalle', 'description']);
  const categoryColumn = findColumn(headers, ['categoria', 'tipo', 'category']);
  const availableColumn = findColumn(headers, ['disponible', 'activo', 'available', 'estado']);

  return rows.slice(1)
    .map((row, index) => ({
      id: String(index + 2),
      name: String(row[nameColumn] ?? '').trim(),
      description: descriptionColumn < 0 ? '' : String(row[descriptionColumn] ?? '').trim(),
      category: categoryColumn < 0 ? 'Platos' : String(row[categoryColumn] ?? 'Platos').trim(),
      price: parsePrice(row[priceColumn]),
      available: availableColumn < 0 || isAvailable(row[availableColumn]),
    }))
    .filter((item) => item.name && Number.isFinite(item.price) && item.price >= 0 && item.available);
}
