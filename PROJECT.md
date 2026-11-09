# Proyecto: Agente de pedidos para restaurante

## Estado actual

MVP implementado para mostrar el menú, registrar pedidos en Google Sheets, generar una comanda PDF y enviarla por Gmail. El navegador muestra el menú del día, permite elegir cantidades y notas por plato, solicita datos de entrega y confirma el pedido.

## Estructura

```text
agente-trippat/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── googleSheets.js
│   │   │   ├── menuService.js
│   │   │   ├── orderService.js
│   │   │   └── pdfService.js
│   │   ├── app.js
│   │   └── config.js
│   └── package.json
├── credentials/
│   └── google-service-account.json   # Credencial privada, ignorada por Git
├── frontend/
│   ├── src/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env                              # Valores locales, ignorados por Git
├── .env.example                      # Plantilla sin secretos
├── .gitignore
├── package.json
├── README.md
└── PROJECT.md
```

## Configuración

Las variables requeridas están en `.env.example`; copia sus nombres a `.env` y completa los valores. No subas `.env` ni `credentials/` al repositorio.

- `GOOGLE_SHEET_MENU_ID`: documento cuyo primer tab contiene el menú.
- `GOOGLE_SHEET_PEDIDOS_ID`: documento donde se registrarán pedidos en su primer tab.
- `GOOGLE_SERVICE_ACCOUNT_JSON`: ruta local al JSON de la cuenta de servicio.
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`: cuenta Gmail remitente y contraseña de aplicación.
- `RESTAURANT_EMAIL`: destinatario de las comandas.
- `RESTAURANT_NAME` y `WHATSAPP_NUMBER`: opcionales; personalizan nombre y enlace de WhatsApp.

Comparte ambos documentos de Sheets con el correo de la cuenta de servicio. La clave de Gmail debe ser una contraseña de aplicación nueva; no uses la contraseña normal de la cuenta.

## Formato de Google Sheets

La primera fila de la primera pestaña del documento de menú debe tener encabezados. El código reconoce `Nombre` (o `Plato`, `Producto`, `Name`, `Item`) y `Precio` (o `Valor`, `Price`, `Costo`). Son opcionales `Descripción`, `Categoría` y `Disponible` (también `Activo`, `Available` o `Estado`). Si no existe la columna de disponibilidad, las filas válidas se consideran disponibles.

El primer tab del documento de pedidos recibe cada pedido. Si está vacío, la aplicación crea encabezados automáticamente; si ya tiene datos, la primera fila debe tener `ID`, `Fecha`, `Nombre`, `Dirección`, `Teléfono`, `Detalle`, `Total` y `Estado`, en ese orden. Si los encabezados no coinciden, el guardado se detiene para evitar escribir en columnas incorrectas.

## API

- `GET /api/health`: estado del backend, sin acceder a Google.
- `GET /api/config`: nombre y WhatsApp públicos del restaurante.
- `GET /api/menu`: lee el menú de Google Sheets.
- `POST /api/orders`: valida el pedido, vuelve a consultar precios, lo registra, genera el PDF y envía el correo si Gmail está configurado.

El teléfono admite `09XXXXXXXX` o `+5939XXXXXXXX`. Si el pedido se guarda pero falla el correo, la respuesta confirma que quedó registrado e indica que la notificación está pendiente.

## Ejecución local

Desde la raíz, ejecuta `npm install` y luego `npm run dev`. El frontend estará en `http://localhost:5173` y el backend en `http://localhost:3001`. La carga inicial de la página consulta Google Sheets; confirmar un pedido escribe en la hoja y, con Gmail configurado, envía el PDF.

## Historial

- 2026-11-08: estructura inicial y configuración de entorno.
- 2026-11-08: primera implementación del frontend, API, integración de Sheets, PDF y Gmail.
