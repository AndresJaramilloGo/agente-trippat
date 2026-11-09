import { google } from 'googleapis';
import { config } from '../config.js';

let sheetsClient;

function getSheetsClient() {
  if (!config.serviceAccountPath) {
    throw new Error('Falta GOOGLE_SERVICE_ACCOUNT_JSON en .env.');
  }

  if (!sheetsClient) {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheetsClient = google.sheets({ version: 'v4', auth });
  }

  return sheetsClient;
}

export async function readFirstSheet(spreadsheetId) {
  if (!spreadsheetId) throw new Error('Falta el ID de una hoja de cálculo en .env.');

  const sheets = getSheetsClient();
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });
  const title = metadata.data.sheets?.[0]?.properties?.title;
  if (!title) throw new Error('El documento de Google Sheets no tiene pestañas.');

  const escapedTitle = title.replace(/'/g, "''");
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${escapedTitle}'!A:Z`,
  });

  return { sheets, title, rows: result.data.values || [] };
}

export async function appendOrderRow(values) {
  if (!config.ordersSpreadsheetId) throw new Error('Falta GOOGLE_SHEET_PEDIDOS_ID en .env.');

  const { sheets, title, rows } = await readFirstSheet(config.ordersSpreadsheetId);
  const range = `'${title.replace(/'/g, "''")}'!A:Z`;

  const expectedHeaders = [
    'ID', 'Fecha', 'Nombre', 'Dirección', 'Teléfono', 'Detalle', 'Total', 'Estado',
  ];

  if (rows.length === 0 || rows[0].every((cell) => !String(cell).trim())) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.ordersSpreadsheetId,
      range: `'${title.replace(/'/g, "''")}'!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [expectedHeaders],
      },
    });
  } else {
    const currentHeaders = rows[0].slice(0, expectedHeaders.length).map((cell) =>
      String(cell ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase(),
    );
    const normalizedExpected = expectedHeaders.map((cell) =>
      cell.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase(),
    );
    if (normalizedExpected.some((header, index) => currentHeaders[index] !== header)) {
      throw new Error(`La primera fila de pedidos debe tener estos encabezados: ${expectedHeaders.join(', ')}.`);
    }
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.ordersSpreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
}
