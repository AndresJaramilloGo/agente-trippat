# Proyecto: Agente de pedidos para restaurante

## Estado actual

Aplicación web de pedidos con una interfaz conversacional y priorizada para celular. El cliente consulta el menú de Google Sheets, elige cantidades y notas, registra datos de entrega y confirma el pedido. El backend registra el pedido en otra hoja, genera una comanda PDF y envía un correo si Gmail está configurado.

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
│   │   ├── App.jsx                   # Conversación, menú, carrito y entrega
│   │   ├── main.jsx
│   │   └── styles.css                # Diseño adaptable y controles móviles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env                              # Valores locales, ignorados por Git
├── .env.example                      # Plantilla sin secretos
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── PROJECT.md
```

## Estructura del prompt conversacional

El prompt se implementa como mensajes y pasos visibles en `frontend/src/App.jsx`; no se conecta a un modelo de IA. La secuencia es:

1. **Rol y bienvenida:** el asistente representa al restaurante, saluda y explica que ayudará a preparar un pedido.
2. **Selección:** invita a revisar los productos disponibles y permite elegir cantidades y agregar notas por plato.
3. **Resumen:** muestra productos seleccionados y total antes de solicitar los datos de entrega.
4. **Datos de entrega:** pregunta nombre, dirección y teléfono/WhatsApp, con validaciones y ejemplo del formato telefónico.
5. **Confirmación:** comunica que el pedido fue recibido, muestra su identificador y estado de notificación, y ofrece WhatsApp cuando está configurado.
6. **Recuperación:** si el menú no carga, explica el problema en el chat y ofrece reintentar; si el envío falla, presenta el error sin borrar los datos capturados.

### Cambios del prompt/flujo

- Se reemplazó el encabezado promocional y el panel lateral del pedido por una conversación guiada en una sola columna.
- El mensaje de bienvenida conduce al menú; la selección se muestra como respuesta del cliente y un resumen conversacional.
- La solicitud de entrega aparece solo después de pulsar “Continuar con la entrega”. Se puede volver al menú sin perder cantidades ni notas.
- El éxito del pedido tiene su propio estado y permite iniciar otro pedido.
- El menú vacío, el estado de carga y el fallo de carga se comunican dentro de la conversación, con opción de reintento.
- Los cambios conservan la API y el proceso existente de Google Sheets, PDF y correo.

## Diseño móvil

La interfaz se adapta a pantallas pequeñas con flujo de una sola columna, botones táctiles de al menos 38 px, campos de entrada de 16 px para evitar zoom automático en navegadores móviles y resumen de pedido visible junto a la acción para continuar. En pantallas amplias, la conversación se centra en una tarjeta con ancho limitado.

## Configuración

Las variables requeridas están en `.env.example`; copia sus nombres a `.env` y completa los valores. No subas `.env` ni `credentials/` al repositorio.

- `GOOGLE_SHEET_MENU_ID`: documento cuyo primer tab contiene el menú.
- `GOOGLE_SHEET_PEDIDOS_ID`: documento donde se registrarán pedidos en su primer tab.
- `GOOGLE_SERVICE_ACCOUNT_JSON`: ruta local al JSON de la cuenta de servicio.
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`: cuenta Gmail remitente y contraseña de aplicación.
- `RESTAURANT_EMAIL`: destinatario de las comandas.
- `RESTAURANT_NAME` y `WHATSAPP_NUMBER`: opcionales; personalizan el nombre y enlace de WhatsApp.

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

Desde la raíz, ejecuta `npm install` y luego `npm run dev`. El frontend estará en `http://localhost:5173` y el backend en `http://localhost:3001`. La carga inicial consulta Google Sheets; confirmar un pedido escribe en la hoja y, con Gmail configurado, envía el PDF.

## Historial

- 2026-11-08: estructura inicial y configuración de entorno.
- 2026-11-08: primera implementación del frontend, API, integración de Sheets, PDF y Gmail.
- 2026-11-10: interfaz de chatbot adaptable a móvil, estados visibles de carga/error y documentación de la estructura del prompt conversacional.
