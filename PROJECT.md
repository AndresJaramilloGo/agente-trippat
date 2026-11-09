# Proyecto: Agente de pedidos para restaurante

## Descripción
MVP web mobile-first para consultar el menú diario de un restaurante, registrar pedidos y enviar una comanda PDF por correo. El proyecto usa React y Vite en el frontend, y Node.js con Express en el backend. Google Sheets almacena el menú, la configuración y los pedidos.

## Árbol de carpetas
```text
backend/
  src/
    config/
    middleware/
    routes/
    services/
    utils/
    app.js
  package.json
frontend/
  src/
    components/
    config/
    hooks/
    services/
    styles/
    App.jsx
    main.jsx
  index.html
.env.example
.gitignore
README.md
PROJECT.md
```

## Variables de entorno
Se definirán en `.env`; las credenciales no se guardan en el código ni en Google Sheets. Variables iniciales previstas:
- `PORT`: puerto del backend.
- `FRONTEND_URL`: origen permitido para CORS.
- `GOOGLE_SHEETS_SPREADSHEET_ID`: identificador del documento de Sheets.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` y `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: acceso de Service Account.
- `RESTAURANT_EMAIL`: correo que recibe las comandas.
- `GMAIL_USER` y `GMAIL_APP_PASSWORD`: cuenta y App Password para Nodemailer.

## Cómo correr el proyecto
Instala las dependencias desde la raíz con `npm install`. Usa `npm run dev` para iniciar ambos proyectos o `npm run dev:backend` y `npm run dev:frontend` por separado. Consulta `README.md`. Los puntos de entrada se crearán en las siguientes etapas.

## Endpoints
Pendiente de implementar:
- `GET /api/menu`
- `GET /api/config`
- `POST /api/orders`

## Flujo del cliente
1. Saludo y menú del día.
2. Selección de platos y cantidades.
3. Información del jugo del día.
4. Comentarios opcionales por plato.
5. Nombre, dirección y teléfono/WhatsApp.
6. Resumen y confirmación del pedido.
7. Confirmación final y acceso al WhatsApp del restaurante.

## Registro de teléfono
El navegador no puede leer el número de teléfono del cliente por privacidad. El chat lo solicitará explícitamente. Se aceptarán números ecuatorianos `09XXXXXXXX` y `+5939XXXXXXXX`; se guardará el formato visible para la comanda y el normalizado para el enlace de WhatsApp.

## Configuración híbrida
La configuración local en `frontend/src/config/restaurant.config.js` se mostrará primero. Luego se combinará con los valores válidos y no vacíos de `/api/config`, respaldado por la hoja `Config`. Si el backend no está disponible, se conservarán los valores locales.

Alternativas no implementadas:
- **B — Solo archivo local:** sencilla y rápida, pero cada cambio requiere publicar una nueva versión.
- **C — Solo hoja Config:** editable sin cambiar código, pero depende de internet y de la API.
- **D — Variables `VITE_*`:** útiles para valores por ambiente, pero menos adecuadas para textos que el restaurante quiera editar.

## Decisiones técnicas
- Monorepo con carpetas independientes para backend y frontend.
- React con estado ligero (`useReducer` o Context) y CSS moderno.
- Google Sheets como almacenamiento del MVP.
- PDF generado en el backend y enviado por Gmail.

## Historial de cambios
- 2026-11-08: creación de la estructura inicial, manifiestos de dependencias, configuración de entorno y documentación base.

## Pendientes
- Implementar los puntos de entrada y endpoints del backend.
- Implementar el frontend y el flujo conversacional.
- Conectar Google Sheets, PDF y envío de correo.

