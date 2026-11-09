import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { getMenu } from './services/menuService.js';
import { createOrder } from './services/orderService.js';

const app = express();
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/config', (_request, response) => {
  response.json({
    restaurantName: config.restaurantName,
    whatsappNumber: config.whatsappNumber,
  });
});

app.get('/api/menu', async (_request, response) => {
  try {
    response.json({ items: await getMenu() });
  } catch (error) {
    console.error('[menu]', error.message);
    response.status(503).json({ error: 'No se pudo cargar el menú. Revisa la configuración de Google Sheets.' });
  }
});

app.post('/api/orders', async (request, response) => {
  try {
    const result = await createOrder(request.body);
    response.status(201).json(result);
  } catch (error) {
    const message = error.message || 'No se pudo registrar el pedido.';
    const clientError = /Escribe|Ingresa|Agrega|cantidad|notas|disponible/i.test(message);
    console.error('[order]', message);
    response.status(clientError ? 400 : 503).json({ error: clientError ? message : 'No se pudo guardar el pedido. Revisa Sheets y la configuración.' });
  }
});

app.listen(config.port, () => {
  console.log(`Backend disponible en http://localhost:${config.port}`);
});
